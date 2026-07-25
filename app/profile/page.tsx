'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from './page.module.css';
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // or you could return a "Not logged in" UI
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.successBadge}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className={styles.title}>Login Successfully!</h1>
        <p className={styles.subtitle}>Welcome back to FileConvert</p>

        <div className={styles.profileInfo}>
          {session.user?.image ? (
            <Image 
              src={session.user.image} 
              alt="Profile avatar" 
              width={80} 
              height={80} 
              className={styles.avatar} 
            />
          ) : (
            <div className={styles.avatar} style={{ background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: '2rem', color: '#fff' }}>
                 {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
               </span>
            </div>
          )}
          <h2 className={styles.name}>{session.user?.name || "User"}</h2>
          <p className={styles.email}>{session.user?.email}</p>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: '/login' })} 
          className={styles.logoutBtn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Log Out
        </button>
      </div>
    </div>
  );
}
