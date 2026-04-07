/**
 * هذا الملف يمثل "شاشة تسجيل الدخول".
 * بيسمح للمستخدم بكتابة الإيميل والباسورد، وبيبعتهم للـ Firebase عشان يتأكد إنهم صح.
 * لو صح، بيحول المستخدم فوراً للوحة التحكم (Dashboard).
 */
"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Zap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  // لو المستخدم مسجل دخول بالفعل، حوله أوتوماتيك للوحة التحكم
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect to dashboard
    } catch (err: any) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email) {
      setError("الرجاء إدخال البريد الإلكتروني أولاً لإرسال رابط إعادة التعيين");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("لا يوجد حساب مسجل بهذا البريد الإلكتروني");
      } else if (err.code === "auth/invalid-email") {
        setError("صيغة البريد الإلكتروني غير صحيحة");
      } else {
        setError("حدث خطأ أثناء محاولة إرسال رابط إعادة التعيين. تأكد من صحة البريد الإلكتروني.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background decoration pattern for Premium feel */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[60%] left-[80%] w-[30%] h-[40%] rounded-full bg-indigo-600/20 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-[2rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
              <Zap className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">منصة راصد</h1>
            <p className="text-zinc-400 text-sm">تسجيل الدخول لمتابعة محطات الكهرباء</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/50 text-green-400 text-sm text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-300 mr-1 text-sm font-semibold">البريد الإلكتروني</Label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-blue-500 focus:border-blue-500 rounded-xl h-12 pr-4 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mr-1">
                <Label className="text-zinc-300 text-sm font-semibold">كلمة المرور</Label>
                <a href="#" onClick={handleResetPassword} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">نسيت كلمة المرور؟</a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-blue-500 focus:border-blue-500 rounded-xl h-12 pr-4 transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 font-bold text-md mt-4 transition-all shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            ليس لديك حساب؟ <a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">إنشاء حساب جديد</a>
          </div>
        </div>
      </div>
    </div>
  );
}
