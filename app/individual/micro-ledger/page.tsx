'use client';

import { useState } from 'react';
import { useArtisanStore, getDesignById } from '@/lib/store';
import { MonoAmount } from '@/components/ui/mono-amount';
import { calcWageBreakdown } from '@/lib/formulas';
import { COMPLEXITY_LABELS, LEDGER_TYPE_LABELS } from '@/lib/constants';
import type { DesignComplexity } from '@/types';

export default function MicroLedgerPage() {
  const { currentLoom, artisanLedger, yarnDebt, logSale, getTotalEarned } = useArtisanStore();
  const design = currentLoom.currentDesignId ? getDesignById(currentLoom.currentDesignId) : null;

  // Wage Calculator State
  const [complexityLevel, setComplexityLevel] = useState<DesignComplexity>(
    (design?.complexityLevel ?? 3) as DesignComplexity
  );
  const wageBreakdown = calcWageBreakdown(complexityLevel);

  // Quick Log Form State
  const [sareesCount, setSareesCount] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const totalEarned = getTotalEarned();

  const handleLogSale = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(sareesCount);
    const value = parseInt(saleValue);
    if (!count || !value || count <= 0 || value <= 0) return;
    logSale(count, value);
    setSareesCount('');
    setSaleValue('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  const recentEntries = artisanLedger.slice(0, 10);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E2A38', marginBottom: '0.25rem' }}>
          Micro-Ledger
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#78716C' }}>Your earnings and expenses</p>
      </div>

      {/* Cash Meter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="card-surface" style={{ padding: '1.25rem', borderLeft: '4px solid #2E6F40' }}>
          <div style={{ fontSize: '0.6875rem', color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>
            Total Earned
          </div>
          <MonoAmount amount={totalEarned} size="lg" />
          <div style={{ fontSize: '0.6875rem', color: '#78716C', marginTop: '0.25rem' }}>
            Current warp cycle
          </div>
        </div>
        <div className="card-surface" style={{ padding: '1.25rem', borderLeft: '4px solid #7A2021' }}>
          <div style={{ fontSize: '0.6875rem', color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>
            Yarn Debt
          </div>
          <MonoAmount amount={yarnDebt} size="lg" />
          <div style={{ fontSize: '0.6875rem', color: '#7A2021', marginTop: '0.25rem' }}>
            Outstanding advance
          </div>
        </div>
      </div>

      {/* Wage Calculator Widget */}
      <div className="card-surface" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E2A38', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
          Wage Calculator
        </div>

        {/* Complexity Slider */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#78716C' }}>Complexity Level</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E2A38' }}>
              L{complexityLevel} — {COMPLEXITY_LABELS[complexityLevel]}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={complexityLevel}
            onChange={(e) => setComplexityLevel(parseInt(e.target.value) as DesignComplexity)}
            style={{
              width: '100%',
              accentColor: '#7A2021',
              cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            {[1, 2, 3, 4, 5].map((l) => (
              <span key={l} style={{ fontSize: '0.5625rem', color: '#A8A29E' }}>L{l}</span>
            ))}
          </div>
        </div>

        {/* Formula Breakdown */}
        <div
          style={{
            backgroundColor: '#F9F6F0',
            border: '1px solid #E7E5E4',
            borderRadius: '6px',
            padding: '0.875rem',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {[
              { label: 'Base Wage', value: `₹${wageBreakdown.baseWage.toLocaleString('en-IN')}` },
              { label: 'Complexity Multiplier', value: `× ${wageBreakdown.multiplier.toFixed(2)}` },
              { label: 'Complexity Bonus', value: `+₹${wageBreakdown.bonus.toLocaleString('en-IN')}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#78716C' }}>{label}</span>
                <span className="font-mono-nums" style={{ fontSize: '0.8125rem', color: '#1E2A38', fontWeight: 600 }}>
                  {value}
                </span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #E7E5E4', paddingTop: '0.375rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E2A38' }}>Per Saree Wage</span>
              <MonoAmount amount={wageBreakdown.finalWage} size="lg" />
            </div>
          </div>
        </div>

        <div
          className="font-mono-nums"
          style={{
            fontSize: '0.6875rem',
            color: '#A8A29E',
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          {wageBreakdown.formulaString}
        </div>
      </div>

      {/* Quick Log Form */}
      <div className="card-surface" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E2A38', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
          Log a Sale
        </div>

        {formSuccess && (
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: '#2E6F4015',
              border: '1px solid #2E6F4040',
              borderRadius: '6px',
              padding: '0.625rem 0.875rem',
              fontSize: '0.8125rem',
              color: '#2E6F40',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            ✓ Sale logged and cash meter updated
          </div>
        )}

        <form onSubmit={handleLogSale} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Number of Sarees Sold
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={sareesCount}
              onChange={(e) => setSareesCount(e.target.value)}
              placeholder="e.g. 3"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #E7E5E4',
                borderRadius: '6px',
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-mono)',
                color: '#1E2A38',
                backgroundColor: '#FFFFFF',
                outline: 'none',
              }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Total Sale Value (₹)
            </label>
            <input
              type="number"
              min={1}
              value={saleValue}
              onChange={(e) => setSaleValue(e.target.value)}
              placeholder="e.g. 24000"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #E7E5E4',
                borderRadius: '6px',
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-mono)',
                color: '#1E2A38',
                backgroundColor: '#FFFFFF',
                outline: 'none',
              }}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ alignSelf: 'stretch' }}
          >
            Record Sale & Update Ledger
          </button>
        </form>
      </div>

      {/* Recent Transactions */}
      <div className="card-surface" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #E7E5E4', fontSize: '0.8125rem', fontWeight: 700, color: '#1E2A38', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Recent Transactions
        </div>
        {recentEntries.map((entry: any, i: number) => {
          const isInflow = entry.amount > 0;
          return (
            <div
              key={entry.id}
              style={{
                padding: '0.75rem 1.25rem',
                borderBottom: i < recentEntries.length - 1 ? '1px solid #F0ECE5' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', color: '#1E2A38', fontWeight: 500, lineHeight: 1.4, marginBottom: '0.125rem' }}>
                  {entry.description}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#A8A29E' }}>
                  {entry.date} · {LEDGER_TYPE_LABELS[entry.type]}
                </div>
              </div>
              <MonoAmount amount={entry.amount} showSign size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
