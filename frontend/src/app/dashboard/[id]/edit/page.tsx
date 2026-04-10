/**
 * Edit Incident Report Page.
 * Allows the original reporter to modify details if the status is still 'new'.
 * Reuses Google Maps and Media upload logic from the creation flow.
 */
"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin, Camera, UploadCloud, AlertTriangle, Send, Loader2, Image as ImageIcon, X, ArrowRight } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '16px'
};

const defaultCenter = {
  lat: 30.0444, // Default to Cairo
  lng: 31.2357
};

export default function EditReportPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const reportId = params.id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<any>(null);
  
  // Form states initialized with report data
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [addressText, setAddressText] = useState("");
  
  const [stations, setStations] = useState<{id: string, name: string}[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const fetchInitialData = async (user: any) => {
    try {
      const token = await user.getIdToken();
      
      // 1. Fetch Stations
      const stationsRes = await fetch("/api-proxy/stations", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const stationsData = await stationsRes.json();
      if (stationsData.data) setStations(stationsData.data || []);

      // 2. Fetch Current Report
      const reportRes = await fetch(`/api-proxy/reports/${reportId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (reportRes.ok) {
        const data = await reportRes.json();
        const r = data.data;
        
        // Security check: Only allow reporter to edit 'new' reports
        if (r.reporterId !== user.uid || r.status !== 'new') {
          alert("غير مسموح لك بتعديل هذا البلاغ في حالته الحالية.");
          router.push(`/dashboard/${reportId}`);
          return;
        }

        setReport(r);
        setDescription(r.description || "");
        setCategory(r.category || "");
        setSeverity(r.severity || "");
        setSelectedStationId(r.stationId || "");
        setLocation(r.location || null);
        setAddressText(r.location?.addressText || "");
        setExistingMedia(r.media || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) fetchInitialData(user);
      else router.push("/login");
    });
    return () => unsub();
  }, [reportId]);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(newLoc);
        if (isLoaded) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: newLoc }, (res) => {
                if (res?.[0]) setAddressText(res[0].formatted_address);
            });
        }
      });
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLoc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setLocation(newLoc);
      if (isLoaded) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: newLoc }, (res) => {
            if (res?.[0]) setAddressText(res[0].formatted_address);
        });
      }
    }
  }, [isLoaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeExistingMedia = (index: number) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploadStatus("جاري تحديث البيانات...");

    try {
      const token = await auth.currentUser?.getIdToken();
      const updatedMedia = [...existingMedia];

      // Upload new files to ImgBB if any
      if (newFiles.length > 0) {
        setUploadStatus("جاري رفع المرفقات الجديدة...");
        const IMGBB_API_KEY = "55abf413df6c6df7c09737f8e4364309";
        for (const file of newFiles) {
          const body = new FormData();
          body.append("key", IMGBB_API_KEY);
          body.append("image", file);
          const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body });
          const json = await res.json();
          if (json.data?.url) updatedMedia.push(json.data.url);
        }
      }

      const updatePayload = {
        description,
        category,
        severity,
        stationId: selectedStationId,
        location: { ...location, addressText },
        media: updatedMedia
      };

      const res = await fetch(`/api-proxy/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(updatePayload)
      });

      if (res.ok) {
        alert("تم تحديث البلاغ بنجاح");
        router.push(`/dashboard/${reportId}`);
      } else {
        throw new Error("فشل في تحديث البلاغ");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
      setUploadStatus("");
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-blue-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500" dir="rtl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowRight className="w-4 h-4" /> العودة
      </button>

      <div className="flex flex-col items-start">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">تعديل البلاغ #{reportId.slice(-6)}</h1>
        <p className="text-zinc-400 text-sm italic">يمكنك تعديل التفاصيل قبل البدء في معالجة البلاغ.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-[1.5rem] shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <AlertTriangle className="text-amber-500 w-5 h-5" /> تفاصيل البلاغ
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">المحطة</Label>
                  <select 
                    value={selectedStationId} 
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl h-12 px-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {stations.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">التصنيف</Label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl h-12 px-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="electricity">عطل كهربائي</option>
                    <option value="safety">أمن وسلامة</option>
                    <option value="equipment">عطل معدات</option>
                    <option value="cleaning">نظافة / صيانة</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">مستوى الخطورة</Label>
                  <div className="flex gap-3">
                    {['low', 'medium', 'high'].map(s => (
                      <button 
                        key={s} type="button" 
                        onClick={() => setSeverity(s)}
                        className={`flex-1 p-3 rounded-xl border font-bold transition-all ${severity === s ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-transparent border-zinc-800 text-zinc-500'}`}
                      >
                        {s === 'low' ? 'عادية' : s === 'medium' ? 'متوسطة' : 'عالية'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">الوصف</Label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-zinc-600"
                    placeholder="اشرح المشكلة بالتفصيل..."
                  ></textarea>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-[1.5rem] shadow-xl border-zinc-800/50">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2"><MapPin className="text-blue-500" /> الموقع</h2>
                 <Button type="button" onClick={handleGetLocation} variant="outline" className="h-8 text-xs border-blue-500/30 text-blue-400">تحديد موقعي</Button>
               </div>
               <div className="rounded-xl overflow-hidden border border-zinc-800/80">
                  {isLoaded ? (
                    <GoogleMap 
                      mapContainerStyle={mapContainerStyle} 
                      center={location || defaultCenter} 
                      zoom={location ? 16 : 5} 
                      onClick={onMapClick}
                      options={{ disableDefaultUI: true, zoomControl: true }}
                    >
                      {location && <Marker position={location} />}
                    </GoogleMap>
                  ) : <div className="h-[300px] bg-zinc-950 flex items-center justify-center text-zinc-600">جاري تحميل الخريطة...</div>}
               </div>
               {addressText && <p className="text-[10px] text-emerald-500 mt-2 bg-emerald-500/10 p-2 rounded-lg">📍 {addressText}</p>}
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-[1.5rem] shadow-xl border-zinc-800/50">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Camera className="text-emerald-500" /> المرفقات</h2>
               
               <div className="grid grid-cols-4 gap-2 mb-4">
                  {existingMedia.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 group shadow-md">
                       <img src={url} className="w-full h-full object-cover" />
                       <button onClick={() => removeExistingMedia(i)} type="button" className="absolute top-1 left-1 bg-red-500 rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-white" /></button>
                    </div>
                  ))}
               </div>

               <label className="block border-2 border-dashed border-zinc-700 p-4 rounded-xl text-center cursor-pointer hover:border-blue-500/50 bg-zinc-950/20 transition-all group">
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                  <UploadCloud className="w-8 h-8 mx-auto text-zinc-600 mb-2 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs text-zinc-500 block">إضافة مرفقات جديدة ({newFiles.length})</span>
               </label>

               {newFiles.length > 0 && (
                 <div className="mt-4 flex flex-wrap gap-2">
                    {newFiles.map((file, i) => (
                      <div key={i} className="bg-zinc-800 text-[10px] text-zinc-300 px-2 py-1 rounded flex items-center gap-1 border border-zinc-700">
                        <ImageIcon className="w-3 h-3" />
                        {file.name.slice(0, 10)}...
                        <button onClick={() => removeNewFile(i)} className="text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                 </div>
               )}
            </Card>
          </div>

        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={saving} className="text-zinc-500 hover:text-white">إلغاء</Button>
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 px-10 h-12 rounded-xl font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-all">
            {saving ? <div className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> {uploadStatus}</div> : "حفظ التعديلات"}
          </Button>
        </div>
      </form>
    </div>
  );
}
