'use client';

import Link from 'next/link';
import { Layers, User } from 'lucide-react';

export default function OnboardingGateway() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#F9F6F0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '2rem',
      }}
    >
      {/* Header */}
      <div
        className="animate-slide-up"
        style={{ textAlign: 'center', marginBottom: '1rem' }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3730a3',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#3730a3',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Enterprise Resource Planning
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: '#1E2A38',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem',
          }}
        >
          Vayan <span style={{ color: '#3730a3' }}>ERP</span>
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: '#57534E',
            maxWidth: '480px',
            lineHeight: 1.6,
          }}
        >
          Enterprise Resource Planning for traditional handloom cooperatives and
          independent artisans. Select your workspace to continue.
        </p>
      </div>

      {/* Role Cards */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '800px',
        }}
      >
        <RoleCard
          href="/cooperative/dashboard"
          icon={<Layers size={32} strokeWidth={1.5} />}
          title="Society Manager"
          subtitle="Cooperative Portal"
          description="Orchestrate 10–20 looms, macro-capacity planning, demand radar, scheduling matrix, and society ledgers."
          delay="animate-slide-up-delay-1"
          stats={[
            { label: 'Looms Active', value: '16' },
            { label: 'Warp Batches', value: '12' },
            { label: 'Under Alert', value: '4' },
          ]}
        />
        <RoleCard
          href="/individual/dashboard"
          icon={<User size={32} strokeWidth={1.5} />}
          title="Independent Weaver"
          subtitle="Solo Artisan Portal"
          description="Manage single loom tracking, design discovery, warp countdown, and micro-finances with wage calculator."
          delay="animate-slide-up-delay-2"
          stats={[
            { label: 'Days Left', value: '18' },
            { label: 'Sarees Done', value: '9/12' },
            { label: 'Earned', value: '₹71K' },
          ]}
        />
      </div>

      {/* Footer */}
      <p
        style={{
          fontSize: '0.75rem',
          color: '#A8A29E',
          letterSpacing: '0.04em',
          marginTop: '2rem',
        }}
      >
        Vayan ERP v1.0
      </p>
    </main>
  );
}

interface RoleCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  delay: string;
  stats: { label: string; value: string }[];
}

function RoleCard({ href, icon, title, subtitle, description, delay, stats }: RoleCardProps) {
  return (
    <Link
      href={href}
      className={delay}
      style={{
        textDecoration: 'none',
        flex: '1 1 320px',
        maxWidth: '380px',
      }}
    >
      <div
        className="role-card"
        style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #E7E5E4',
          borderRadius: '12px',
          padding: '2rem',
          cursor: 'pointer',
          transition: 'border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
          height: '100%',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = '#3730a3';
          el.style.transform = 'translateY(-4px)';
          el.style.boxShadow = '0 12px 40px #3730a31A';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = '#E7E5E4';
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: '#1E2A3808',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1E2A38',
            marginBottom: '1.25rem',
          }}
        >
          {icon}
        </div>

        {/* Labels */}
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#3730a3',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '0.25rem',
          }}
        >
          {subtitle}
        </p>
        <h2
          style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            color: '#1E2A38',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#57534E',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}
        >
          {description}
        </p>

        {/* Stats Row */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #E7E5E4',
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ flex: 1 }}>
              <div
                className="font-mono-nums"
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#1E2A38',
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: '#78716C',
                  marginTop: '0.125rem',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#3730a3',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <span>Enter Portal</span>
          <span style={{ fontSize: '1rem' }}>→</span>
        </div>
      </div>
    </Link>
  );
}
