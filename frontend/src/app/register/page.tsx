/**
 * Registration Screen.
 * Collects user details (Name, Phone, Email, Password) and creates a Firebase Auth account.
 * Additional user metadata is stored in Firestore under the 'users' collection.
 */
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Zap, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. bna3mel el account fel auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. n-save el bayanat el zyada fel Firestore
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        fullName: fullName,
        email: email,
        phone: phone,
        role: "user", // أي حساب جديد بيكون مستخدم عادي
        stationScopes: [], // المحطات (للمشرفين لاحقاً)
        createdAt: serverTimestamp(),
      });

      // 3. n-wadeh el user ll dashbaord
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء التسجيل. قد يكون البريد مستخدم مسجل مسبقاً، أو كلمة المرور ضعيفة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px]" />
        <div className="absolute bottom-[0%] left-[10%] w-[30%] h-[30%] rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md z-10 transition-all duration-500 animate-in fade-in zoom-in-95 mt-8 mb-8">
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-[2rem] shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
              <Zap className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">حساب جديد</h1>
            <p className="text-zinc-400 text-sm">التسجيل في منصة راصد</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-2">
              <Label className="text-zinc-300 mr-1 text-sm font-semibold">الاسم بالكامل</Label>
              <Input
                type="text"
                placeholder="Ex: Ahmed Mohamed"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-blue-500 rounded-xl h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 mr-1 text-sm font-semibold">رقم الموبايل</Label>
              <Input
                type="tel"
                placeholder="Ex: 01000000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-blue-500 rounded-xl h-11 text-right"
                dir="ltr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 mr-1 text-sm font-semibold">البريد الإلكتروني</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-blue-500 rounded-xl h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 mr-1 text-sm font-semibold">كلمة المرور (6 حروف على الأقل)</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-blue-500 rounded-xl h-11"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-12 font-bold text-md mt-6 transition-all shadow-lg shadow-emerald-600/30"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="w-5 h-5 ml-2" />
                  إنشاء حساب
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            لديك حساب بالفعل؟ <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">تسجيل الدخول</a>
          </div>
        </div>
      </div>
    </div>
  );
}
