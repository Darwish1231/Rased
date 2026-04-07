/**
 * الصفحة الرئيسية الافتتاحية للموقع (Landing Page).
 * شاشة الترحيب اللي بتظهر أول ما تفتح الموقع، وبترشدك لصفحة تسجيل الدخول.
 */
import { redirect } from 'next/navigation';

export default function Home() {
  // توجيه المستخدم تلقائياً إلى صفحة تسجيل الدخول
  redirect('/login');
}
