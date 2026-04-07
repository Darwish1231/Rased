/**
 * هذا الملف هو "الهيكل الأساسي" للوحة التحكم.
 * هو اللي بيعرض القائمة الجانبية (Sidebar) وبيخليها ثابتة، وكمان بيعرض الرأسية في الموبايل.
 * الأهم من ده، الملف ده بيعمل "حماية" للصفحات، لو المستخدم مش عامل تسجيل دخول، بيطرده لشاشة Login.
 */
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Home, PlusCircle, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row" dir="rtl">
      
      {/* القائمة الجانبية هتفضل ظاهرة طول الوقت، سواء شاشة صغيرة أو كبيرة */}
      <aside className="w-full md:w-64 bg-zinc-900 border-l border-b md:border-b-0 border-zinc-800 p-4 flex flex-col z-40 shadow-xl">
        <div className="flex items-center gap-3 mb-6 px-2 mt-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-extrabold text-white text-lg">را</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">راصد</h2>
        </div>
        
        <nav className="flex-col md:flex-1 space-y-2 flex mb-4 md:mb-0">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-semibold transition-colors">
            <Home className="w-5 h-5" />الرئيسية
          </a>
          <a href="/dashboard/new" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-semibold transition-colors">
            <PlusCircle className="w-5 h-5" />إضافة بلاغ
          </a>
          <a href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-semibold transition-colors">
            <Settings className="w-5 h-5" />الإعدادات
          </a>
        </nav>

        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          className="w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 justify-start gap-3 px-4 h-12 rounded-xl md:mt-4"
        >
          <LogOut className="w-5 h-5" /> تسجيل خروج
        </Button>
      </aside>

      {/* Main Content - المحتوى الأساسي */}
      <main className="flex-1 overflow-auto p-4 md:p-8 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        {children}
      </main>
    </div>
  );
}
