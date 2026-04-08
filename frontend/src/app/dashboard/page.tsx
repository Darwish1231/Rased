/**
 * هذا الملف يمثل "الصفحة الرئيسية للوحة التحكم (Overview)".
 * تم تحويله للعمل من متصفح المستخدم (Client Component) عشان نقدر نبعت التذكرة الأمنية (Token)
 * واسترجاع البلاغات الحقيقية من الخادم بشكل محمي بعد تفعيل نظام (AuthGuard).
 * 
 * الميزة الجديدة هنا: "جدول تفصيلي" لعرض وإدارة جميع البلاغات، البحث، فلترة الحالات وتغيير حالة البلاغ بناءً على الصلاحيات!
 */
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, Loader2, Search, Filter, ArrowUpDown } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardHome() {
  const [reports, setReports] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // States للبحث والفلترة
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async (user: any) => {
    try {
      const token = await user.getIdToken();
      
      // جلب البروفايل لمعرفة الصلاحية (Role)
      const profileRes = await fetch("/api-proxy/users/me", {
        headers: { "Authorization": `Bearer ${token}` },
        cache: 'no-store'
      });
      let profile;
      if (profileRes.ok) {
        profile = await profileRes.json();
        setUserProfile(profile);
      } else {
        const errorText = await profileRes.text();
        setErrorMessage(`خطأ ${profileRes.status}: ${errorText}`);
      }

      // جلب البلاغات
      const reportsRes = await fetch("/api-proxy/reports", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        fetchData(user);
      }
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    try {
      const res = await fetch(`/api-proxy/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // تحديث الجدول محلياً عشان السرعة 
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      } else {
        alert("فشل في تحديث الحالة، تأكد من صلاحياتك.");
      }
    } catch (e) {
      alert("حدث خطأ أثناء تغيير الحالة.");
    }
  };

  // الإحصائيات
  const totalReports = reports.length;
  const newReportsCount = reports.filter((r) => r.status === 'new').length;
  const inReviewReportsCount = reports.filter((r) => r.status === 'in_review' || r.status === 'assigned').length;
  const resolvedReportsCount = reports.filter((r) => r.status === 'resolved').length;

  // البحث والتصفية للجدول
  const filteredReports = reports.filter((report) => {
    const matchesSearch = (report.stationNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (report.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getRoleBadge = () => {
    if (userProfile?.role === 'admin') return <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md text-xs font-bold mr-2">مسؤول النظام (Admin)</span>;
    if (userProfile?.role === 'supervisor') return <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md text-xs font-bold mr-2">مشرف (Supervisor)</span>;
    return <span className="bg-zinc-500/20 text-zinc-400 px-2 py-0.5 rounded-md text-xs font-bold mr-2">مستخدم (User)</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight flex items-center">
            لوحة العمليات 🎛️
            {getRoleBadge()}
          </h1>
          <p className="text-zinc-400 text-sm">
            {userProfile ? `أهلاً بك: ${userProfile.email}` : "جاري جلب البيانات..."}
          </p>
        </div>
        <a 
          href="/dashboard/new" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
        >
          إضافة بلاغ طارئ
          <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm ml-1">+</span>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 p-5 rounded-[1.5rem] flex items-center gap-4 shadow-xl hover:border-blue-500/50 transition-colors">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-semibold">الإجمالي</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalReports}</p>
          </div>
        </Card>
        
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 p-5 rounded-[1.5rem] flex items-center gap-4 shadow-xl hover:border-red-500/50 transition-colors">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-semibold">بلاغات جديدة</p>
            <p className="text-2xl font-bold text-white mt-0.5">{newReportsCount}</p>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 p-5 rounded-[1.5rem] flex items-center gap-4 shadow-xl hover:border-amber-500/50 transition-colors">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-semibold">قيد المراجعة</p>
            <p className="text-2xl font-bold text-white mt-0.5">{inReviewReportsCount}</p>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 p-5 rounded-[1.5rem] flex items-center gap-4 shadow-xl hover:border-emerald-500/50 transition-colors">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-semibold">تم الحل (مغلق)</p>
            <p className="text-2xl font-bold text-white mt-0.5">{resolvedReportsCount}</p>
          </div>
        </Card>
      </div>

      {/* Main Data Table Section */}
      <Card className="bg-zinc-900/40 border-zinc-800/50 rounded-[1.5rem] overflow-hidden shadow-2xl">
        {/* Table Filters Toolbar */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-zinc-400" /> تصفية البلاغات
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-3.5" />
              <input 
                type="text" 
                placeholder="ابحث باسم المحطة أو الوصف..." 
                className="bg-zinc-950/80 border border-zinc-800 text-white text-sm rounded-xl h-11 pr-10 pl-4 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-[250px] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              className="bg-zinc-950/80 border border-zinc-800 text-zinc-300 text-sm rounded-xl h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none font-semibold cursor-pointer min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">الكل</option>
              <option value="new">الجديدة فقط</option>
              <option value="in_review">قيد المراجعة</option>
              <option value="assigned">تم التعيين لفني</option>
              <option value="resolved">تم الحل</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-950/40 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="p-5 font-semibold text-right rounded-tr-2xl">المحطة</th>
                <th className="p-5 font-semibold text-right">التصنيف</th>
                <th className="p-5 font-semibold text-right">الخطورة</th>
                <th className="p-5 font-semibold text-right">المكان والأدلة</th>
                <th className="p-5 font-semibold text-right rounded-tl-2xl">الحالة (الإجراء)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {filteredReports.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="p-10 text-center text-zinc-500 font-semibold text-sm">
                      لا توجد بلاغات تطابق بحثك حالياً!
                    </td>
                 </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="p-5 whitespace-normal min-w-[200px]">
                      <p className="text-white font-bold">{report.stationNumber || "غير محدد"}</p>
                      <p className="text-zinc-500 text-xs mt-1 line-clamp-2" title={report.description}>{report.description}</p>
                      <p className="text-zinc-600 text-[10px] mt-1 font-mono" dir="ltr">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "الآن"}
                      </p>
                    </td>
                    <td className="p-5">
                      <span className="text-zinc-300 font-medium">{
                        report.category === 'electricity' ? 'عطل كهربائي' :
                        report.category === 'safety' ? 'سلامة وطوارئ' :
                        report.category === 'equipment' ? 'معدات' :
                        report.category === 'cleaning' ? 'نظافة' : 'أخرى'
                      }</span>
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-1 text-xs rounded-md font-bold
                        ${report.severity === 'high' ? 'bg-red-500/10 text-red-500' : 
                          report.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-blue-500/10 text-blue-500'}
                      `}>
                        {report.severity === 'high' ? 'طوارئ عاجلة' : report.severity === 'medium' ? 'عطل متوسط' : 'عطل بسيط'}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-2">
                        {report.location?.addressText && (
                          <div className="text-xs text-zinc-400 truncate max-w-[150px]" title={report.location.addressText}>
                            📍 {report.location.addressText}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {report.media && report.media.length > 0 ? (
                            report.media.map((url: string, i: number) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block relative w-8 h-8 rounded border border-zinc-700 overflow-hidden hover:border-emerald-500 hover:scale-110 transition-all cursor-zoom-in shrink-0">
                                <img src={url} alt="مرفق" className="w-full h-full object-cover" />
                              </a>
                            ))
                          ) : (
                            <span className="text-zinc-600 text-xs">لا يوجد مرفقات</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      {/* Select Status Interaction (Admin & Supervisor) */}
                      {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') ? (
                        <div className="relative inline-block w-full min-w-[140px]">
                          <select 
                            className={`w-full appearance-none border rounded-xl text-xs font-bold px-3 py-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 pr-8
                              ${report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-emerald-500/50' : 
                                report.status === 'in_review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                                report.status === 'assigned' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                                report.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                                'bg-zinc-800 text-white border-zinc-700 hover:border-zinc-500'}
                            `}
                            value={report.status || 'new'}
                            onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                          >
                            <option value="new" className="bg-zinc-900 text-white">جديد 🔴</option>
                            <option value="in_review" className="bg-zinc-900 text-white">جاري الفحص ⏳</option>
                            <option value="assigned" className="bg-zinc-900 text-white">تم التكليف 👷</option>
                            <option value="resolved" className="bg-zinc-900 text-white">تم الحل ✅</option>
                            <option value="rejected" className="bg-zinc-900 text-white">مرفوض ❌</option>
                          </select>
                          <ArrowUpDown className="w-3 h-3 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                      ) : (
                        <span className={`px-3 py-1.5 text-xs rounded-xl font-bold border inline-block text-center min-w-[100px]
                          ${report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                            report.status === 'in_review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                            report.status === 'assigned' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                            report.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                            'bg-zinc-800 text-zinc-300 border-zinc-700'}
                        `}>
                          {report.status === 'resolved' ? 'تم الحل ✅' : 
                           report.status === 'in_review' ? 'قيد الفحص ⏳' : 
                           report.status === 'assigned' ? 'تم التكليف 👷' : 
                           report.status === 'rejected' ? 'مرفوض ❌' : 
                           'جديد 🔴'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
