"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Users, ShieldAlert, Save, X, MapPin, Trash2, Plus, Search, Bell, Send } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("user");
  const [editScopes, setEditScopes] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  // New station form state
  const [newStation, setNewStation] = useState({ number: "", name: "", region: "" });
  const [isSavingStation, setIsSavingStation] = useState(false);
  
  // User Management extra states
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);

  const fetchData = async (user: any) => {
    try {
      const token = await user.getIdToken();
      
      // Fetch current user profile to verify admin privileges
      const profileRes = await fetch("/api-proxy/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      let profile;
      if (profileRes.ok) {
        profile = await profileRes.json();
        setUserProfile(profile);
      } else {
        const errText = await profileRes.text();
        console.error("Settings profile error:", errText);
        alert(`Error fetching permissions: ${profileRes.status} \n ${errText}`);
      }

      if (profile?.role === 'admin') {
        const [usersRes, stationsRes] = await Promise.all([
          fetch("/api-proxy/users", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("/api-proxy/stations", {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        if (usersRes.ok) {
          const u = await usersRes.json();
          setUsers(u);
        }
        if (stationsRes.ok) {
           const st = await stationsRes.json();
           setStations(st.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        fetchData(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleStartEdit = (u: any) => {
    setEditingUserId(u.id);
    setEditRole(u.role || "user");
    setEditScopes(u.stationScopes || []);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditRole("user");
    setEditScopes([]);
  };

  const handleSaveRole = async (userId: string) => {
    if (!auth.currentUser) return;
    setSavingId(userId);
    try {
      const token = await auth.currentUser.getIdToken();
      const payload = {
        role: editRole,
        stationScopes: editRole === "supervisor" ? editScopes : []
      };

      const res = await fetch(`/api-proxy/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: editRole, stationScopes: payload.stationScopes } : u));
        setEditingUserId(null);
      } else {
        alert("فشل التحديث. تأكد من امتلاكك لصلاحيات مدير النظام.");
      }
    } catch(err) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleScope = (stationId: string) => {
    setEditScopes(prev => 
      prev.includes(stationId) 
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    );
  };

  const handleCreateStation = async (e: any) => {
    e.preventDefault();
    if (!newStation.name || !newStation.number || !newStation.region) {
      alert("يرجى ملء كافة الحقول!");
      return;
    }
    
    setIsSavingStation(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      // Dummy Location for UI, since it's an admin rapid-add
      const payload = {
        ...newStation,
        location: { lat: 30.0, lng: 31.0 },
        status: "active"
      };

      const res = await fetch("/api-proxy/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setStations([data.data, ...stations]);
        setNewStation({ number: "", name: "", region: "" });
      } else {
        alert("فشل في إضافة المحطة");
      }
    } catch(err) {
      console.error(err);
      alert("حدث خطأ في الاتصال");
    } finally {
      setIsSavingStation(false);
    }
  };
  
  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه المحطة نهائياً؟")) return;
    
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api-proxy/stations/${stationId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        setStations(stations.filter(s => s.id !== stationId));
      } else {
        alert("لم يتم حذف المحطة");
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === auth.currentUser?.uid) {
      alert("لا يمكنك حذف حسابك الخاص من هنا!");
      return;
    }
    
    if (!confirm("⚠️ تحذير: سيتم حذف هذا المستخدم نهائياً من النظام ومن سجلات الدخول. هل أنت متأكد؟")) return;
    
    setIsDeletingUser(userId);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api-proxy/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert("فشل في حذف المستخدم");
      }
    } catch(err) {
      console.error(err);
      alert("خطأ في الاتصال");
    } finally {
      setIsDeletingUser(userId === isDeletingUser ? null : isDeletingUser);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.fullName || "").toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4" dir="rtl">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-white">غير مسموح بالدخول</h1>
        <p className="text-zinc-400">هذه الصفحة مخصصة لمديري النظام فقط.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4" dir="rtl">
      {/* Header section */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight flex items-center">
            إعدادات النظام ⚙️
          </h1>
          <p className="text-zinc-400 text-sm">
            إدارة المستخدمين وتعيين/سحب الصلاحيات (Role-Based Access Control)
          </p>
        </div>
      </div>

      {/* Main Data Table Section */}
      <Card className="bg-zinc-900/40 border-zinc-800/50 rounded-[1.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-bold text-white">
              {users.length} مستخدم مسجل على المنصة
            </h2>
          </div>
          
          <div className="relative">
             <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-3.5" />
             <input 
               type="text" 
               placeholder="بحث بالاسم أو البريد..." 
               className="bg-zinc-950/80 border border-zinc-800 text-white text-sm rounded-xl h-11 pr-10 pl-4 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full md:w-[250px] transition-all"
               value={userSearchQuery}
               onChange={(e) => setUserSearchQuery(e.target.value)}
             />
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-950/40 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="p-5 font-semibold text-right">المستخدم / البريد</th>
                <th className="p-5 font-semibold text-right">رقم الموبايل</th>
                <th className="p-5 font-semibold text-right">تاريخ الانضمام</th>
                <th className="p-5 font-semibold text-center">الصلاحية (الدور)</th>
                <th className="p-5 font-semibold text-center rounded-tl-2xl">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {filteredUsers.map((u) => {
                const isEditing = editingUserId === u.id;
                
                return (
                  <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="p-5">
                      <p className="text-white font-bold">{u.fullName || "مجهول"}</p>
                      <p className="text-zinc-500 text-xs mt-1">{u.email || "بدون بريد"}</p>
                    </td>
                    <td className="p-5">
                      <span className="text-zinc-300 font-mono" dir="ltr">{u.phone || "---"}</span>
                    </td>
                    <td className="p-5">
                      <p className="text-zinc-400 text-sm font-mono" dir="ltr">
                        {u.createdAt ? new Date(u.createdAt.seconds ? u.createdAt.seconds * 1000 : u.createdAt).toLocaleDateString('ar-EG') : "غير معروف"}
                      </p>
                    </td>
                    <td className="p-5 text-center">
                      {isEditing ? (
                        <div className="flex flex-col gap-2 items-center">
                          <select 
                            className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-1.5 min-w-[120px] focus:outline-none focus:border-blue-500"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                             <option value="user">مستخدم عادي</option>
                             <option value="supervisor">مشرف محطة</option>
                             <option value="admin">مدير نظام</option>
                          </select>
                          
                          {/* عرض المحطات لو اختار مشرف */}
                          {editRole === "supervisor" && (
                            <div className="mt-2 w-full max-w-[200px] border border-zinc-800 rounded-lg p-2 bg-zinc-950/50 max-h-32 overflow-y-auto">
                               <p className="text-[10px] text-zinc-500 mb-2 font-semibold">اختر المحطات المسؤول عنها:</p>
                              {stations.map(st => (
                                <label key={st.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="accent-blue-500"
                                    checked={editScopes.includes(st.id)}
                                    onChange={() => toggleScope(st.id)}
                                  />
                                  <span className="text-xs text-zinc-300 truncate">{st.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`px-3 py-1.5 text-xs rounded-xl font-bold inline-block
                          ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 
                            u.role === 'supervisor' ? 'bg-blue-500/10 text-blue-400' : 
                            'bg-zinc-800 text-zinc-400'}
                        `}>
                          {u.role === 'admin' ? 'مدير نظام 👑' : u.role === 'supervisor' ? 'مشرف 👷‍♂️' : 'مستخدم 👤'}
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            disabled={savingId === u.id}
                            onClick={() => handleSaveRole(u.id)} 
                            className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            {savingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={handleCancelEdit} 
                            className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-lg transition-colors"
                            title="إلغاء"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleStartEdit(u)}
                            className="text-zinc-500 hover:text-blue-400 bg-zinc-800/50 hover:bg-zinc-800 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                          >
                            تعديل الصلاحية
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={isDeletingUser === u.id}
                            className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                            title="حذف المستخدم"
                          >
                            {isDeletingUser === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stations Management Section */}
      <Card className="bg-zinc-900/40 border-zinc-800/50 rounded-[1.5rem] overflow-hidden shadow-2xl mt-8">
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">إدارة المحطات (النطاقات)</h2>
          </div>
          <span className="text-sm font-semibold text-zinc-400 px-3 py-1 bg-zinc-800 rounded-lg">إجمالي المحطات: {stations.length}</span>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Form */}
          <div className="lg:col-span-1 border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 h-fit">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> إضافة محطة جديدة
            </h3>
            <form onSubmit={handleCreateStation} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1 block">رقم/كود المحطة</label>
                <input 
                  type="text" 
                  value={newStation.number} 
                  onChange={e => setNewStation({...newStation, number: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                  placeholder="مثلاً: ST-007" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1 block">اسم المحطة</label>
                <input 
                  type="text" 
                  value={newStation.name} 
                  onChange={e => setNewStation({...newStation, name: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                  placeholder="مثلاً: محطة كهرباء أسوان" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1 block">المنطقة</label>
                <input 
                  type="text" 
                  value={newStation.region} 
                  onChange={e => setNewStation({...newStation, region: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                  placeholder="صعيد مصر" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isSavingStation}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSavingStation ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ المحطة"}
              </button>
            </form>
          </div>
          
          {/* List of Stations */}
          <div className="lg:col-span-2 border border-zinc-800 rounded-xl bg-zinc-950/20 overflow-hidden">
            <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-zinc-900/80 text-zinc-400 sticky top-0 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-4">الكود</th>
                    <th className="p-4">اسم المحطة</th>
                    <th className="p-4">المنطقة</th>
                    <th className="p-4 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {stations.map(st => (
                    <tr key={st.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="p-4 font-mono text-zinc-300" dir="ltr">{st.number}</td>
                      <td className="p-4 font-bold text-white">{st.name}</td>
                      <td className="p-4 text-zinc-400">{st.region}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDeleteStation(st.id)}
                          className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                          title="Delete Station"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {stations.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-zinc-500">لا توجد محطات مسجلة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
