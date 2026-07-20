'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Compass, BookOpen, ChevronLeft, Package, Briefcase, Wallet, Bell, LayoutDashboard, TrendingUp } from 'lucide-react';
import { useSimulationStore } from '@/lib/store';

const TABS = [
  { href: '/individual/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/individual/loom', label: 'My Loom', icon: Package },
  { href: '/individual/outlook', label: 'Demand Radar', icon: TrendingUp },
  { href: '/individual/earnings', label: 'Earnings', icon: Wallet },
];

export default function IndividualLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { state, isLoaded } = useSimulationStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
       setIsOnline(navigator.onLine);
       const handleOnline = () => setIsOnline(true);
       const handleOffline = () => setIsOnline(false);

       window.addEventListener('online', handleOnline);
       window.addEventListener('offline', handleOffline);

       return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
       };
    }
  }, []);

  // Weaver-01 is our hardcoded user for the solo portal demo
  const notifications = isLoaded && state ? state.eventLog.filter((e: any) => e.title.includes('loom-01') || e.description.includes('weaver-01')).slice(0, 5) : [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F6F0', display: 'flex', flexDirection: 'column', maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
      {/* Offline Banner */}
      {!isOnline && (
         <div className="bg-amber-600 text-white text-[11px] font-bold px-4 py-2.5 text-center sticky top-0 z-50 shadow-md flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping"></span>
            Offline Mode. Progress saved locally. Will sync to Cooperative when connected.
         </div>
      )}

      {/* Top Bar */}
      <div
        style={{
          padding: '1rem 1.25rem 0.75rem',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E7E5E4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#3730a3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>VY</span>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E2A38' }}>Vayan</div>
            <div style={{ fontSize: '0.6875rem', color: '#78716C' }}>Weaver Portal</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-stone-400 hover:text-slate-700">
             <Bell size={18} />
             {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
             )}
           </button>
           <Link
             href="/cooperative/dashboard"
             style={{
               display: 'flex',
               alignItems: 'center',
               gap: '0.25rem',
               textDecoration: 'none',
               color: '#A8A29E',
               fontSize: '0.75rem',
             }}
           >
             <ChevronLeft size={14} />
             Switch
           </Link>
        </div>
      </div>

      {showNotifications && (
         <div className="absolute top-16 right-4 left-4 bg-white rounded-xl shadow-xl border border-slate-200 z-40 overflow-hidden animate-slide-up">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <span className="text-sm font-bold text-slate-800">Notifications</span>
               <button onClick={() => setShowNotifications(false)} className="text-xs text-indigo-600 font-semibold">Close</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
               {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No new notifications.</div>
               ) : (
                  notifications.map((n: any, i: number) => (
                     <div key={i} className="p-3 border-b border-slate-50 hover:bg-slate-50">
                        <div className="flex justify-between items-start mb-1">
                           <div className="text-xs font-semibold text-slate-800">{n.title}</div>
                           <div className="text-[10px] text-stone-400 font-medium">{n.date}</div>
                        </div>
                        <div className="text-xs text-slate-600">{n.description}</div>
                     </div>
                  ))
               )}
            </div>
         </div>
      )}

      {/* Content */}
      <main style={{ flex: 1, padding: '1.25rem', paddingBottom: '80px' }}>
        {children}
      </main>

      {/* Bottom Tab Navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E7E5E4',
          display: 'flex',
          padding: '0.5rem 0',
          zIndex: 20,
        }}
      >
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'none',
                padding: '0.375rem 0',
                color: isActive ? '#3730a3' : '#A8A29E',
                transition: 'color 0.15s ease',
                position: 'relative'
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span style={{ fontSize: '0.625rem', fontWeight: isActive ? 700 : 500, letterSpacing: '0.02em' }}>
                {label}
              </span>
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-0.5rem',
                    width: '32px',
                    height: '2px',
                    backgroundColor: '#3730a3',
                    borderRadius: '0 0 4px 4px',
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
