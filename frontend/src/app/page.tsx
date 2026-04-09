/**
 * Landign Page Redirect.
 * Automatically redirects unauthenticated visitors to the login page.
 */
import { redirect } from 'next/navigation';

export default function Home() {
  // توجيه المستخدم تلقائياً إلى صفحة تسجيل الدخول
  redirect('/login');
}
