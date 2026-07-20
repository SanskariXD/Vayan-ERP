'use client';

import { useState, useEffect } from 'react';
import { Zap, Printer, CheckCircle2, XCircle, Loader2, X, Activity, Flame, ChevronRight, Droplet, Clock, Layers } from 'lucide-react';
import { MOCK_TRENDS, MOCK_DESIGNS } from '@/lib/mock-data';
import type { TrendingDesign, ProductionTicket } from '@/types';
import { COMPLEXITY_LABELS } from '@/lib/constants';

// Simulated Gemini API response
function generateMockTicket(trend: TrendingDesign): ProductionTicket {
  const matchedDesign = MOCK_DESIGNS.find((d) => d.id === trend.designId);
  return {
    id: `ticket-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    trendingDesignId: trend.id,
    motifName: trend.motifName,
    bodyColor: matchedDesign?.bodyColor ?? 'Deep Crimson with Golden Zari Border',
    zariRules: matchedDesign?.zariDensity === 'High'
      ? 'Full zari fill on pallu; 60% zari on body buti; real gold thread only'
      : matchedDesign?.zariDensity === 'Medium'
      ? 'Zari on border and pallu only; silver thread acceptable'
      : 'Minimal zari accent on border only',
    motifGeometry: `Primary: ${matchedDesign?.primaryMotif ?? 'Peacock with open fan tail'}; Secondary: mango cluster at 45° repeat; Border: 5cm temple arch row`,
    complexityLevel: matchedDesign?.complexityLevel ?? 4,
    estimatedDaysPerSaree: matchedDesign?.daysPerSaree ?? 5,
    setupTimeEstimate: matchedDesign?.requiresNewCards ? 15 : 1,
    colorPalette: ['#8B1538', '#C49A28', '#1A3A5C', '#F4E8C1', '#2E6F40'],
    warpThreadCount: matchedDesign?.complexityLevel ? matchedDesign.complexityLevel * 480 : 1920,
    geminiConfidence: 87 + Math.floor(Math.random() * 12),
  };
}

export default function DemandRadarPage() {
  const [trends, setTrends] = useState<TrendingDesign[]>([]);
  const [isTrendsLoading, setIsTrendsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<TrendingDesign | null>(null);
  const [activeTrend, setActiveTrend] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedTrend) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedTrend]);

  // Fetch trends from the backend Demand Radar API route
  useEffect(() => {
    async function fetchTrends() {
      try {
        setIsTrendsLoading(true);
        const res = await fetch('/api/demand-radar');
        if (!res.ok) throw new Error("Failed to fetch demand radar trends.");
        const data = await res.json();
        
        // Normalize the database-style API schema to fit the UI's TrendingDesign interface
        const normalized = (data.trends || []).map((apiTrend: any) => ({
          id: apiTrend.pin_id || apiTrend.id || '',
          designId: apiTrend.associatedCardId || apiTrend.designId || '',
          motifName: apiTrend.title || apiTrend.motifName || 'Unnamed Motif',
          imageUrl: apiTrend.image_url || apiTrend.imageUrl || '',
          engagementScore: apiTrend.engagement_score || apiTrend.engagementScore || 0,
          saves: apiTrend.saves || 0,
          pins: apiTrend.repins || apiTrend.pins || 0,
          comments: apiTrend.comments || 0,
          hasExistingAsset: apiTrend.matchesExistingJacquardCard !== undefined 
            ? apiTrend.matchesExistingJacquardCard 
            : (apiTrend.hasExistingAsset || false),
          trendCategory: apiTrend.description || apiTrend.trendCategory || 'General',
        }));
        
        setTrends(normalized.length > 0 ? normalized : MOCK_TRENDS);
      } catch (err) {
        console.error("API error, falling back to local mocks:", err);
        setTrends(MOCK_TRENDS);
      } finally {
        setIsTrendsLoading(false);
      }
    }
    fetchTrends();
  }, []);

  const handleSyncTrends = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    // Simulate minor loading animation for premium feel
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setPage((prevPage) => {
      const totalPages = Math.ceil(trends.length / 12);
      if (totalPages <= 1) return 0;
      return (prevPage + 1) % totalPages;
    });
    
    setIsSyncing(false);
  };

  const handleSelectTrend = async (trend: TrendingDesign) => {
    setSelectedTrend(trend);
    setActiveTrend(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze-urgent', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ items: [trend] })
      });
      if (!res.ok) throw new Error("Backend connection failed.");
      const liveData = await res.json();
      
      // Directly assign the raw Gemini enriched object (returns as an array)
      const analysis = liveData[0];
      
      if (!analysis || analysis.error) throw new Error(analysis?.error || 'Gemini Analysis Failed');

      setActiveTrend(analysis);

    } catch (err) {
      console.error("Gemini Live parsing failed, falling back:", err);
      // Fallback object safely simulating exact structure to prevent crashes
      setActiveTrend({
         ...trend,
         design_analysis: {
            confidence_match: 85,
            setup_days: 15,
            complexity: "Level 4 - 2,400 Warp",
            extracted_palette: ['#8B1538', '#C49A28', '#1A3A5C', '#F4E8C1', '#2E6F40'],
            zari_rules: "Standard Zari Placement",
            motif_geometry: "Mocked Geometrics"
         },
         scheduler_inputs: {
            title: trend.motifName
         }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} className="animate-slide-up">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1E2A38', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Demand Radar
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#78716C', maxWidth: '600px' }}>
            Discover real-time Pinterest aesthetic trends and convert them into weaving blueprints using Gemini Vision API.
          </p>
        </div>
        <button
          onClick={handleSyncTrends}
          disabled={isSyncing}
          style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: '#1E2A38',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            opacity: isSyncing ? 0.7 : 1
          }}
        >
          {isSyncing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Refreshing...
            </>
          ) : (
            <span style={{ fontSize: '1rem', padding: '0.25rem 0.5rem' }}>
              New designs
            </span>
          )}
        </button>
      </div>

      {/* Grid View */}
      <div 
        className="animate-slide-up-delay-2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          paddingBottom: '4rem'
        }}
      >
        {isTrendsLoading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} className="animate-spin" color="#1E2A38" />
          </div>
        ) : (
          trends.slice(page * 12, (page + 1) * 12).map((trend, i) => (
            <div
              key={`${trend.id}-${i}`}
              onClick={() => handleSelectTrend(trend)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F0ECE5',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '120%', backgroundColor: '#F0ECE5' }}>
                <img
                  src={trend.imageUrl}
                  alt={trend.motifName}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div 
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Flame size={12} fill="#D97706" color="#D97706" />
                  <span className="font-mono-nums" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E2A38' }}>
                    {(trend.engagementScore / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  {trend.trendCategory}
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E2A38', lineHeight: 1.2, marginBottom: '1rem' }}>
                  {trend.motifName}
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: trend.hasExistingAsset ? '#2E6F40' : '#A8A29E', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                    {trend.hasExistingAsset ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {trend.hasExistingAsset ? 'Asset Match' : 'New Design'}
                  </span>
                  <ChevronRight size={16} color="#A8A29E" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Overlay */}
      {selectedTrend && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(12, 17, 24, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTrend(null);
          }}
        >
          <div 
            className="animate-slide-up"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '960px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 400px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            }}
          >
            {/* Modal Left: Image & Source */}
            <div style={{ backgroundColor: '#F9F6F0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', flex: 1, minHeight: '300px' }}>
                <img 
                  src={selectedTrend.imageUrl} 
                  alt={selectedTrend.motifName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E2A38', marginBottom: '0.25rem' }}>
                  {activeTrend?.scheduler_inputs?.title || selectedTrend.motifName}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#78716C', fontSize: '0.875rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Activity size={14} /> {selectedTrend.trendCategory}
                  </span>
                  <span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Flame size={14} color="#D97706" /> {(selectedTrend.engagementScore / 1000).toFixed(1)}K Engagements
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Right: AI Engine */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0ECE5' }}>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1E2A38' }}>Weaving Blueprint</div>
                </div>
                <button 
                  onClick={() => setSelectedTrend(null)}
                  style={{ backgroundColor: '#F9F6F0', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#57534E' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: '#1E2A38' }}>
                    <Loader2 size={32} className="animate-spin" color="#1E2A38" />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Analyzing Image Patterns...</p>
                      <p style={{ fontSize: '0.8125rem', color: '#78716C' }}>Evaluating structural geometry and color distributions</p>
                    </div>
                  </div>
                ) : activeTrend ? (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Fast info tiles */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ border: '1px solid #E7E5E4', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Clock size={16} color="#A8A29E" />
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Setup & Run</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E2A38' }}>{activeTrend.design_analysis.setup_days}d setup</div>
                        </div>
                      </div>
                      <div style={{ border: '1px solid #E7E5E4', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Layers size={16} color="#A8A29E" />
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complexity</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E2A38' }}>{activeTrend.design_analysis.complexity}</div>
                        </div>
                      </div>
                    </div>

                    {/* AI Color Recommendation */}
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E2A38', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Droplet size={14} color="#78716C" /> Extracted Color Palette
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {activeTrend.design_analysis.extracted_palette.map((color: string) => (
                          <div key={color} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', flex: 1 }}>
                            <div style={{ width: '100%', aspectRatio: '1', backgroundColor: color, borderRadius: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} />
                            <div className="font-mono-nums" style={{ fontSize: '0.625rem', color: '#78716C', textTransform: 'uppercase' }}>{color}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#F0ECE5' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <div>
                          <div style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 600, marginBottom: '0.375rem' }}>ZARI RULES</div>
                          <div style={{ fontSize: '0.875rem', color: '#1E2A38', lineHeight: 1.5, padding: '0.75rem', backgroundColor: '#F9F8F6', borderRadius: '8px' }}>
                            {activeTrend.design_analysis.zari_rules}
                          </div>
                       </div>
                       
                       <div>
                          <div style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 600, marginBottom: '0.375rem' }}>MOTIF GEOMETRY</div>
                          <div style={{ fontSize: '0.875rem', color: '#1E2A38', lineHeight: 1.5, padding: '0.75rem', backgroundColor: '#F9F8F6', borderRadius: '8px' }}>
                            {activeTrend.design_analysis.motif_geometry}
                          </div>
                       </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Action Button */}
              {activeTrend && !isLoading && (
                <div style={{ padding: '1.25rem', borderTop: '1px solid #F0ECE5', backgroundColor: '#FDFCF9' }}>
                   <button
                    onClick={() => {
                        window.print();
                    }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      backgroundColor: '#1E2A38',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2C3E50'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1E2A38'}
                  >
                    <Printer size={16} /> Send to Production Queue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adjust mobile layout styling globally */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          /* Make grid 1 column on mobile */
          .animate-slide-up-delay-2 {
            grid-template-columns: 1fr !important;
          }
          /* Stack the modal on mobile */
          div[style*="grid-template-columns: minmax(0, 1fr) 400px"] {
             grid-template-columns: 1fr !important;
             grid-template-rows: minmax(150px, 30vh) 1fr;
             max-height: 95vh !important;
          }
          /* Adjust modal image wrapper on mobile */
          div[style*="min-height: 300px"] {
             min-height: 0 !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          /* Make grid 2 columns on tablet */
          .animate-slide-up-delay-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}} />
    </>
  );
}
