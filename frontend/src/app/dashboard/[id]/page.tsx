"use client";

import { useEffect, useState, use } from "react";
import { Card } from "@/components/ui/card";
import { 
  Loader2, ArrowRight, Calendar, MapPin, 
  AlertTriangle, CheckCircle2, User, MessageSquare, 
  History, Send, UserPlus, Image as ImageIcon,
  Edit, Plus, Clock, ClipboardCheck
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
        alert("بيايانات البلاغ غير موجودة");
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

  // Check if current user is the reporter and status is 'new' to show Edit button
  const canEdit = report.reporterId === auth.currentUser?.uid && report.status === 'new';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Top Navigation */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
        الرجوع للوحة التحكم
      </button>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-800/50 shadow-2xl">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
             <h1 className="text-4xl font-extrabold text-white tracking-tight">{report.stationNumber}</h1>
             <span className={`px-4 py-1.5 text-sm rounded-xl font-bold border
                ${report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  report.status === 'new' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'}
             `}>
               {report.status === 'resolved' ? 'تم الحل ✅' : 
                report.status === 'new' ? 'جديد 🔴' : 
                report.status === 'in_review' ? 'جاري الفحص ⏳' : 'تم التكليف 👷'}
             </span>
          </div>
          <p className="text-zinc-400 flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-zinc-500" /> تمت الكتابة في: {new Date(report.createdAt).toLocaleString('ar-EG')}
          </p>
        </div>

        {canEdit && (
          <Link 
            href={`/dashboard/${reportId}/edit`}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-2xl font-bold transition-all border border-zinc-700 shadow-lg active:scale-95 group"
          >
            <Edit className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
            تعديل بيانات البلاغ
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Media & Map */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 p-8 rounded-[2rem] shadow-xl">
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                   <ImageIcon className="w-4 h-4 text-blue-400" />
                </div>
                المرفقات والموقع
             </h2>
             
             {/* Media Gallery */}
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
               {report.media && report.media.length > 0 ? (
                 report.media.map((url: string, i: number) => (
                   <a key={i} href={url} target="_blank" className="relative aspect-square rounded-2xl overflow-hidden border-2 border-zinc-800/50 hover:border-blue-500/50 hover:scale-[1.02] transition-all shadow-lg group">
                      <img src={url} alt="Attachment" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" />
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors" />
                   </a>
                 ))
               ) : (
                 <div className="col-span-full h-40 flex flex-col items-center justify-center bg-zinc-950/40 rounded-3xl border border-dashed border-zinc-800 text-zinc-600">
                    <ImageIcon className="w-10 h-10 mb-3 opacity-20" />
                     <span className="text-sm font-medium">لا توجد مرفقات دليلية مرفوعة</span>
                 </div>
               )}
             </div>

             {/* Location Map */}
             <div className="rounded-[1.5rem] overflow-hidden border border-zinc-800/80 shadow-inner">
                {isLoaded && report.location ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={report.location}
                    zoom={15}
                    options={{ 
                      disableDefaultUI: true,
                      styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      ]
                    }}
                  >
                    <Marker position={report.location} />
                  </GoogleMap>
                ) : (
                  <div className="h-[250px] bg-zinc-950/80 flex items-center justify-center text-zinc-600 italic">
                    الموقع الجغرافي غير متوفر حالياً
                  </div>
                )}
                <div className="p-4 bg-zinc-900/80 text-sm text-emerald-400 border-t border-zinc-800 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   {report.location?.addressText || "الموقع المسجل على الخريطة التفاعلية"}
                </div>
             </div>
          </Card>

          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 p-8 rounded-[2rem] shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                   <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                وصف المشكلة بالتفصيل
            </h2>
            <div className="bg-zinc-950/40 p-6 rounded-2xl border border-zinc-800/50 shadow-inner">
              <p className="text-zinc-300 leading-relaxed text-lg whitespace-pre-wrap">
                {report.description || "لا يوجد وصف مطول متاح."}
              </p>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4">
               <div className="flex-1 bg-zinc-900/60 px-6 py-4 rounded-2xl border border-zinc-800 min-w-[150px]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">تصنيف العطل</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-white font-extrabold text-md">{
                      report.category === 'electricity' ? 'عطل كهربائي' :
                      report.category === 'safety' ? 'أمن وسلامة' :
                      report.category === 'equipment' ? 'عطل معدات' :
                      report.category === 'cleaning' ? 'نظافة / صيانة' : 'أخرى'
                    }</span>
                  </div>
               </div>
               <div className="flex-1 bg-zinc-900/60 px-6 py-4 rounded-2xl border border-zinc-800 min-w-[150px]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">مستوى الخطورة</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${report.severity === 'high' ? 'bg-red-500' : report.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className={`font-extrabold text-md ${report.severity === 'high' ? 'text-red-400' : report.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{
                      report.severity === 'high' ? 'أولوية قصوى' : report.severity === 'medium' ? 'متوسطة' : 'عادية'
                    }</span>
                  </div>
               </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Timeline & Actions */}
        <div className="space-y-6">
          
          {/* Actions (Admin Only) */}
          {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
            <Card className="bg-blue-600/5 border-blue-500/20 p-8 rounded-[2rem] shadow-xl">
               <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                 </div>
                 تكليف المهمة لفني
               </h3>
               <div className="space-y-4">
                 <div className="relative">
                    <select 
                      value={selectedTechnician}
                      onChange={(e) => setSelectedTechnician(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                    >
                        <option value="">اختر الفني من القائمة...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.fullName} ({u.role === 'supervisor' ? 'مشرف' : 'فني'})</option>
                        ))}
                    </select>
                    <div className="absolute left-4 top-4 pointer-events-none text-zinc-500 text-xs">▼</div>
                 </div>
                 <button 
                   onClick={handleAssign}
                   disabled={isAssigning || !selectedTechnician}
                   className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                 >
                   {isAssigning ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "إرسال وتكليف المهمة"}
                 </button>
               </div>
            </Card>
          )}

          {/* Improved Timeline View */}
          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 p-8 rounded-[2rem] h-fit shadow-xl">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                   <History className="w-4 h-4 text-zinc-400" />
                </div>
                سجل المتابعة (Timeline)
            </h2>
            <div className="relative space-y-0">
               {/* Vertical line connector */}
               <div className="absolute top-2 bottom-2 right-[19px] w-[2px] bg-gradient-to-b from-blue-500/50 via-zinc-800 to-zinc-800/20 hidden sm:block" />

               {report.events?.map((ev: any, i: number) => (
                 <div key={ev.id || i} className="relative pr-12 pb-8 last:pb-0 group">
                    {/* Timeline Dot/Icon */}
                    <div className={`absolute right-0 top-1 w-10 h-10 rounded-xl border-4 border-zinc-900 z-10 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg
                      ${ev.action === 'create' ? 'bg-emerald-500/20 text-emerald-400' : 
                        ev.action === 'status_change' ? 'bg-blue-500/20 text-blue-400' : 
                        ev.action === 'assignment' ? 'bg-purple-500/20 text-purple-400' : 
                        'bg-zinc-800 text-zinc-400'}
                    `}>
                       {ev.action === 'create' ? <Plus className="w-4 h-4" /> : 
                        ev.action === 'status_change' ? <Clock className="w-4 h-4" /> : 
                        ev.action === 'assignment' ? <User className="w-4 h-4" /> : 
                        <MessageSquare className="w-4 h-4" />}
                    </div>

                    <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all shadow-sm">
                       <p className="text-[10px] text-zinc-500 font-mono mb-1" dir="ltr">
                          {new Date(ev.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                       </p>
                       <p className="text-sm font-bold text-white">
                         {ev.action === 'create' ? 'تم إنشاء البلاغ من قبل المستخدم' : 
                          ev.action === 'status_change' ? (
                            <span className="flex items-center gap-1">
                               تم التحديث لـ: 
                               <span className="text-blue-400">{
                                 ev.toStatus === 'new' ? 'جديد' : 
                                 ev.toStatus === 'in_review' ? 'جاري الفحص' : 
                                 ev.toStatus === 'assigned' ? 'تم التكليف' : 'تم الحل'
                               }</span>
                            </span>
                          ) : 
                          ev.action === 'assignment' ? 'إحالة البلاغ لجهة فنية' : 'إضافة ملاحظة رسمية'}
                       </p>
                       {ev.note && (
                         <div className="mt-3 p-3 bg-zinc-900/80 rounded-xl border-r-2 border-blue-500/30">
                            <p className="text-xs text-zinc-400 italic leading-relaxed">"{ev.note}"</p>
                         </div>
                       )}
                    </div>
                 </div>
               ))}
               
               {/* New Comment/Action Form */}
               {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
                 <form onSubmit={handleAddComment} className="mt-8 pt-6 border-t border-zinc-800/50 relative">
                    <div className="relative group">
                      <textarea 
                        placeholder="اكتب ملاحظة فنية أو توجيه..." 
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-[1.25rem] p-4 pr-5 text-sm text-white focus:ring-2 focus:ring-blue-500/30 outline-none resize-none transition-all"
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      ></textarea>
                      <button 
                        type="submit"
                        disabled={isCommenting || !note.trim()}
                        className="absolute left-3 bottom-3 p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 active:scale-90"
                        title="إرسال"
                      >
                        {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                 </form>
               )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
