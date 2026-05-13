import AdminSidebar from './components/AdminSidebar';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // Verify admin status
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="ml-60 flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
