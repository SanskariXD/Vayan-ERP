'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  CalendarDays,
  BarChart3,
  ChevronLeft,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { useCoopStore } from '@/lib/store';

const NAV_ITEMS = [
  { href: '/cooperative/dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
  { href: '/cooperative/management', label: 'Centralized Management', icon: Wrench },
  { href: '/cooperative/demand-radar', label: 'Demand Intelligence', icon: TrendingUp },
  { href: '/cooperative/scheduling', label: 'Production Scheduling', icon: CalendarDays },
  { href: '/cooperative/finance', label: 'Finance & Forecasts', icon: BarChart3 },
  { href: '/cooperative/custom-orders', label: 'Orders', icon: AlertTriangle },
];

export default function CooperativeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const getCriticalLooms = useCoopStore((s: any) => s.getCriticalLooms);
  const criticalCount = getCriticalLooms().length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9F6F0' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div
          style={{
            padding: '1.25rem 1rem',
            borderBottom: '1px solid #E7E5E4',
            marginBottom: '0.5rem',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              marginBottom: '0.75rem',
              color: '#78716C',
              fontSize: '0.75rem',
            }}
          >
            <ChevronLeft size={14} />
            Switch Portal
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#1E2A38',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>VY</span>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E2A38' }}>
                Vayan
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#78716C' }}>Cooperative ERP</div>
            </div>
          </div>
        </div>

        {/* Critical Alert Badge */}
        {criticalCount > 0 && (
          <div
            style={{
              margin: '0.5rem 0.75rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: '#D977061A',
              border: '1px solid #D9770640',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={14} color="#D97706" />
            <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>
              {criticalCount} loom{criticalCount > 1 ? 's' : ''} need attention
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ padding: '0.5rem 0' }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {href === '/cooperative/dashboard' && criticalCount > 0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: '#D97706',
                      color: 'white',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      borderRadius: '99px',
                      padding: '1px 6px',
                    }}
                  >
                    {criticalCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Manager Notifications */}
        <div style={{ padding: '0 1rem', marginTop: '1rem', marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Notifications
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600, marginBottom: '0.125rem' }}>Today</div>
              <div style={{ fontSize: '0.75rem', color: '#3F3F46', lineHeight: 1.4 }}>LOOM-04 warp will finish in 5 days.</div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: '#F59E0B', fontWeight: 600, marginBottom: '0.125rem' }}>Today</div>
              <div style={{ fontSize: '0.75rem', color: '#3F3F46', lineHeight: 1.4 }}>Surat supplier shipment delayed.</div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FAFAFA', border: '1px solid #F4F4F5', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: '#A1A1AA', fontWeight: 600, marginBottom: '0.125rem' }}>Yesterday</div>
              <div style={{ fontSize: '0.75rem', color: '#71717A', lineHeight: 1.4 }}>Bridal order completed.</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem',
            borderTop: '1px solid #E7E5E4',
            backgroundColor: '#F9F6F0'
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: '#A8A29E' }}>
            Enterprise Resource Planning
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#78716C', fontWeight: 600 }}>
            Vayan ERP v1.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: '240px',
          flex: 1,
          padding: '2rem',
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}
