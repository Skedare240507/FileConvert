'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant font-semibold">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 48 }}>check_circle</span>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-3 text-center">
        Successfully Logged In!
      </h1>
      
      <p className="text-lg text-on-surface-variant mb-8 text-center max-w-md">
        Welcome back, <strong className="text-on-surface">{session?.user?.name || session?.user?.email}</strong>. You are now securely authenticated.
      </p>

      <div className="flex gap-4">
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-primary-container transition-all"
        >
          Go to Home
        </button>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="px-6 py-3 bg-surface-container-low text-on-surface-variant rounded-lg font-semibold border border-outline-variant hover:bg-surface-container transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
