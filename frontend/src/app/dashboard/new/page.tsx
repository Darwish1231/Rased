/**
 * New Incident Report Page.
 * Handles report creation, image/video uploads to ImgBB (free alternative),
 * and geolocation via Google Maps.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin, Camera, UploadCloud, AlertTriangle, Send, Loader2, Image as ImageIcon, X } from "lucide-react";
import { auth, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '16px'
};

const center = {
  lat: 30.0444, // Default to Cairo
  lng: 31.2357
};

export default function NewReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Map and location state
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [addressText, setAddressText] = useState("");
  const [locating, setLocating] = useState(false);
  
  const [stations, setStations] = useState<{id: string, name: string}[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  useEffect(() => {
    // Suppress Next.js dev overlay for Google Maps missing key
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === "string" && (args[0].includes("Geocoding Service:") || args[0].includes("Google Maps JavaScript API error") || args[0].includes("google.maps"))) return;
      originalConsoleError(...args);
    };

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        fetch("/api-proxy/stations", {
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.data) setStations(data.data);
          })
          .catch(console.error);
      }
    });
    
    return () => {
      unsub();
      console.error = originalConsoleError;
    };
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        setAddressText(response.results[0].formatted_address);
      }
    } catch (e) {
      console.log("Geocoding failed", e);
    }
  };

  const handleGetLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLoc);
          if (isLoaded) reverseGeocode(newLoc.lat, newLoc.lng);
          setLocating(false);
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Cannot access current location. Please ensure GPS permissions are enabled in your browser.");
          setLocating(false);
        }
      );
    } else {
      alert("Your browser does not support geolocation.");
      setLocating(false);
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLoc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setLocation(newLoc);
      reverseGeocode(newLoc.lat, newLoc.lng);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const stationId = formData.get("stationId") as string;
    const category = formData.get("category");
    const severity = formData.get("severity");
    const description = formData.get("description");

    if (!stationId) { alert("Please select a station from the list."); return; }
    if (!category) { alert("Please select a problem category."); return; }
    if (!severity) { alert("Please select a severity level."); return; }
    if (!description) { alert("Please provide a description of the issue."); return; }
    if (!location) {
      alert("Please select the incident location on the map.");
      return;
    }

    const selectedStation = stations.find(s => s.id === stationId);

    const reportData: any = {
      stationId: stationId,
      stationNumber: selectedStation?.name,
      category: category,
      severity: severity,
      description: description,
      location: { ...location, addressText }, 
      media: [] as string[],
    };

    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Authentication token not found");

      // Option C: الرفع لـ ImgBB (الحل المجاني البديل)
      if (files.length > 0) {
        setUploadStatus("Uploading images (ImgBB)...");
        const IMGBB_API_KEY = "55abf413df6c6df7c09737f8e4364309";
        
        const uploadPromises = files.map(async (file) => {
          const body = new FormData();
          body.append("key", IMGBB_API_KEY);
          body.append("image", file);

          const response = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: body
          });

          if (!response.ok) throw new Error("Failed to upload image to ImgBB");
          const result = await response.json();
          return result.data.url; // الرابط المباشر للصورة
        });

        try {
          const uploadedUrls = await Promise.all(uploadPromises);
          reportData.media.push(...uploadedUrls);
        } catch (uploadErr) {
          console.error("ImgBB upload error:", uploadErr);
          alert("Failed to upload some images. The report will be submitted without them.");
        }
      }

      setUploadStatus("Submitting report...");

      const res = await fetch("/api-proxy/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reportData),
      });

      if (!res.ok) {
        throw new Error("Failed to save report or authentication denied");
      }

      const finalData = await res.json();
      alert(`Report submitted successfully! ID: ${finalData.data.id}`);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Upload Error:", err);
      alert(`An error occurred: ${err?.message || "Internal submission error"}`);
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      
      <div className="flex flex-col items-start mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Create New Report</h1>
        <p className="text-zinc-400">Please provide all necessary details to ensure a prompt response.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* تفاصيل البلاغ */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800 p-6 rounded-[1.5rem] shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <AlertTriangle className="text-amber-500 w-5 h-5" /> Incident Details
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Affected Station</Label>
                  <select name="stationId" className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl h-12 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none" defaultValue="">
                    <option value="" disabled>Select station...</option>
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Category</Label>
                  <select name="category" className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl h-12 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none" defaultValue="">
                    <option value="" disabled>Select problem type...</option>
                    <option value="electricity">Electrical Fault</option>
                    <option value="safety">Safety or Emergency Office</option>
                    <option value="equipment">Equipment Failure</option>
                    <option value="cleaning">Maintenance/Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Severity Level</Label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="severity" value="low" className="peer sr-only" />
                      <div className="p-3 text-center rounded-xl border border-zinc-800 text-zinc-400 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-500 peer-checked:border-emerald-500 hover:bg-zinc-800 focus:bg-zinc-800 transition-all font-semibold">Low</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="severity" value="medium" className="peer sr-only" />
                      <div className="p-3 text-center rounded-xl border border-zinc-800 text-zinc-400 peer-checked:bg-amber-500/10 peer-checked:text-amber-500 peer-checked:border-amber-500 hover:bg-zinc-800 transition-all font-semibold">Medium</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="severity" value="high" className="peer sr-only" />
                      <div className="p-3 text-center rounded-xl border border-zinc-800 text-zinc-400 peer-checked:bg-red-500/10 peer-checked:text-red-500 peer-checked:border-red-500 hover:bg-zinc-800 transition-all font-semibold">High</div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Issue Description</Label>
                  <textarea name="description" rows={4} placeholder="Describe the fault in detail..." className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none placeholder:text-zinc-600"></textarea>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            
            {/* خريطة وتحديد موقع */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800 p-6 rounded-[1.5rem] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <MapPin className="text-blue-500 w-5 h-5" /> Location Selection (GPS)
                </h2>
                <Button type="button" onClick={handleGetLocation} disabled={locating} variant="outline" className="h-8 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg">
                  {locating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : "Use Current Location"}
                </Button>
              </div>
              
              <div className="bg-zinc-950/30 border border-solid border-zinc-700/50 rounded-2xl overflow-hidden mb-2">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={location || center}
                    zoom={location ? 15 : 6}
                    onClick={onMapClick}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                  >
                    {location && <Marker position={location} animation={window.google.maps.Animation.DROP} />}
                  </GoogleMap>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center bg-zinc-950/50 border border-zinc-800 rounded-2xl text-zinc-500 text-sm p-4 text-center">
                    <p className="mb-2">The map is currently disabled (API Key not provided).</p>
                    <p className="text-emerald-400 font-bold">You can still proceed! Click "Use Current Location" above to automatically detect coordinates and submit the report.</p>
                  </div>
                )}
              </div>
              
              {addressText && (
                <p className="text-sm text-emerald-400 mt-2 bg-emerald-500/10 p-2 rounded-lg text-center">
                  Address: {addressText}
                </p>
              )}
            </Card>

            {/* المرفقات الدليلية */}
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800 p-6 rounded-[1.5rem] shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Camera className="text-emerald-500 w-5 h-5" /> Supporting Evidence
              </h2>
              
              <label className="block border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 bg-zinc-950/30 hover:bg-emerald-500/5 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group">
                <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleFileChange} />
                <div className="w-12 h-12 bg-zinc-800 group-hover:bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="text-md font-bold text-white mb-1">Upload Photo/Video</h3>
                <p className="text-zinc-500 text-xs">Clear visuals help expedite inspection</p>
              </label>

              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative bg-zinc-800 rounded-lg p-2 pr-8 flex items-center shadow-md border border-zinc-700 w-full sm:w-auto">
                      <ImageIcon className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                      <span className="text-xs text-white truncate max-w-[150px]">{file.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeSelectedFile(index)} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-14 px-10 font-bold text-lg transition-all shadow-lg shadow-blue-600/30 active:scale-95 w-full md:w-auto"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{uploadStatus || "جاري الإرسال..."}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Submit Report & Evidence 
                <Send className="w-5 h-5 mr-3" />
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
