"use client";

import { useEffect, useState, use } from "react";
import { Card } from "@/components/ui/card";
import { 
  Loader2, ArrowRight, Calendar, MapPin, 
  AlertTriangle, CheckCircle2, User, MessageSquare, 
  History, Send, UserPlus, Image as ImageIcon
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '16px'
};

export default function ReportDetailsPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const reportId = params.id;
  
  const [report, setReport] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]); // For assignment functionality
  
  // Action states (commenting, assigning)
  const [note, setNote] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const fetchData = async (user: any) => {
    try {
      const token = await user.getIdToken();
      
      // 1. Fetch user profile
      const profileRes = await fetch("/api-proxy/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (profileRes.ok) {
        setUserProfile(await profileRes.json());
      }

      // 2. Get Report Details
      const res = await fetch(`/api-proxy/reports/${reportId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.data);
      } else {
        alert("Incident report not found");
        router.push("/dashboard");
      }

      // 3. Get All Users (for assignment)
      if (userProfile?.role === 'admin' || userProfile?.role === 'supervisor') {
        const usersRes = await fetch("/api-proxy/users", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (usersRes.ok) {
          setUsers(await usersRes.json());
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) fetchData(user);
      else router.push("/login");
    });
    return () => unsub();
  }, [reportId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || !auth.currentUser) return;
    
    setIsCommenting(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api-proxy/reports/${reportId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ note })
      });
      if (res.ok) {
        setNote("");
        // Refresh to see the new event
        fetchData(auth.currentUser);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTechnician || !auth.currentUser) return;
    
    setIsAssigning(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api-proxy/reports/${reportId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ assignedToUserId: selectedTechnician })
      });
      if (res.ok) {
        fetchData(auth.currentUser);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-blue-500" /></div>;
  if (!report) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Top Navigation */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
        Back to Dashboard
      </button>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-extrabold text-white">{report.stationNumber}</h1>
             <span className={`px-3 py-1 text-sm rounded-lg font-bold
                ${report.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 
                  report.status === 'new' ? 'bg-red-500/20 text-red-400' : 
                  'bg-blue-500/20 text-blue-400'}
             `}>
               {report.status.toUpperCase()}
             </span>
          </div>
          <p className="text-zinc-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Created on: {new Date(report.createdAt).toLocaleString('en-GB')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Media & Map */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-3xl">
             <h2 className="text-xl font-bold text-white mb-4">Media & Location</h2>
             
             {/* Media Gallery */}
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
               {report.media && report.media.length > 0 ? (
                 report.media.map((url: string, i: number) => (
                   <a key={i} href={url} target="_blank" className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 hover:scale-105 transition-transform">
                      <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                   </a>
                 ))
               ) : (
                 <div className="col-span-full h-32 flex flex-col items-center justify-center bg-zinc-950/50 rounded-2xl border border-dashed border-zinc-800 text-zinc-600">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span>No visual evidence provided</span>
                 </div>
               )}
             </div>

             {/* Location Map */}
             <div className="rounded-2xl overflow-hidden border border-zinc-800">
                {isLoaded && report.location ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={report.location}
                    zoom={15}
                    options={{ disableDefaultUI: true }}
                  >
                    <Marker position={report.location} />
                  </GoogleMap>
                ) : (
                  <div className="h-[250px] bg-zinc-950 flex items-center justify-center text-zinc-500">
                    Location unavailable (or API key missing)
                  </div>
                )}
                <div className="p-4 bg-zinc-900/80 text-sm text-emerald-400">
                   📍 {report.location?.addressText || "Registered location on map"}
                </div>
             </div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4">Problem Description</h2>
            <p className="text-zinc-300 leading-relaxed bg-zinc-950/30 p-4 rounded-xl border border-zinc-800">
              {report.description}
            </p>
            <div className="mt-4 flex gap-4">
               <div className="bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-700">
                  <span className="text-xs text-zinc-500 block">Category</span>
                  <span className="text-white font-bold">{report.category}</span>
               </div>
               <div className="bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-700">
                  <span className="text-xs text-zinc-500 block">Severity</span>
                  <span className={`font-bold ${report.severity === 'high' ? 'text-red-400' : 'text-blue-400'}`}>{report.severity}</span>
               </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Timeline & Actions */}
        <div className="space-y-6">
          
          {/* Actions (Admin Only) */}
          {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
            <Card className="bg-blue-600/10 border-blue-500/20 p-6 rounded-3xl">
               <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                 <UserPlus className="w-5 h-5" /> Assign Task to Technician
               </h3>
               <div className="space-y-3">
                 <select 
                   value={selectedTechnician}
                   onChange={(e) => setSelectedTechnician(e.target.value)}
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm"
                 >
                    <option value="">Select technician...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                    ))}
                 </select>
                 <button 
                   onClick={handleAssign}
                   disabled={isAssigning || !selectedTechnician}
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                 >
                   {isAssigning ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Assign & Notify"}
                 </button>
               </div>
            </Card>
          )}

          {/* Timeline (PDF Requirement 3.4) */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-3xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-400" /> Incident Timeline
            </h2>
            <div className="relative border-l-2 border-zinc-800 pl-6 ml-3 space-y-8">
               {report.events?.map((ev: any, i: number) => (
                 <div key={ev.id} className="relative">
                    <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-zinc-800 border-2 border-zinc-900 group-hover:bg-blue-500 transition-colors"></span>
                    <div className="space-y-1">
                       <p className="text-xs text-zinc-500" dir="ltr">{new Date(ev.createdAt).toLocaleString('en-GB')}</p>
                       <p className="text-sm font-bold text-zinc-200">
                         {ev.action === 'create' ? '🔴 Report Created' : 
                          ev.action === 'status_change' ? `🔄 Status changed to ${ev.toStatus}` : 
                          ev.action === 'comment' ? '💬 Comment added' : '👷 Technician assigned'}
                       </p>
                       {ev.note && <p className="text-xs text-zinc-400 italic bg-zinc-800/50 p-2 rounded-lg mt-1">"{ev.note}"</p>}
                    </div>
                 </div>
               ))}
               
               {/* New Comment Form */}
               <form onSubmit={handleAddComment} className="mt-6 pt-6 border-t border-zinc-800">
                  <div className="relative">
                    <textarea 
                      placeholder="Add a comment or note..." 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white resize-none"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                    <button 
                      type="submit"
                      disabled={isCommenting || !note.trim()}
                      className="absolute left-2 bottom-2 p-2 bg-blue-600 rounded-lg text-white disabled:opacity-50"
                    >
                      {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
               </form>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
