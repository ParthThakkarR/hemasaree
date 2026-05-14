import AdminSidebar from '@/app/admin/components/admin-sidebar';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';

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
      <main className="flex-1 p-4 pt-20 md:p-8 md:ml-64 overflow-auto w-full max-w-[100vw]">
        {children}
      </main>
    </div>
  );
}


