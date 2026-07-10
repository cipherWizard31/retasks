'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import CreateTaskModal from '../components/CreateTaskModal';
import { TEMPLATES } from '../../lib/data';

const GRADIENT_MAP: Record<string, { from: string; to: string }> = {
  'from-amber-400 to-orange-500': { from: '#fbbf24', to: '#f97316' },
  'from-red-400 to-rose-600': { from: '#f87171', to: '#e11d48' },
  'from-violet-400 to-purple-600': { from: '#a78bfa', to: '#9333ea' },
  'from-blue-400 to-indigo-600': { from: '#60a5fa', to: '#4f46e5' },
  'from-emerald-400 to-teal-600': { from: '#34d399', to: '#0d9488' },
  'from-cyan-400 to-sky-600': { from: '#22d3ee', to: '#0284c7' },
};

export default function TemplatesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [applied, setApplied] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<typeof TEMPLATES[0] | null>(null);

  const handleUseTemplate = (tpl: typeof TEMPLATES[0]) => {
    setApplied(tpl.id);
    setTimeout(() => setApplied(null), 2000);
  };

  return (
    <>
      <AppShell onAddTask={() => setModalOpen(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Header */}
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>✨ Templates</h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#9ca3af' }}>Get started quickly with pre-built routines</p>
            </div>
            <button id="template-custom-btn" className="btn btn-secondary" onClick={() => setModalOpen(true)}>+ Custom Template</button>
          </div>

          {/* Templates grid */}
          <div className="animate-fade-in delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {TEMPLATES.map((tpl, i) => {
              const g = GRADIENT_MAP[tpl.gradient] || { from: '#10b981', to: '#059669' };
              const isApplied = applied === tpl.id;

              return (
                <div key={tpl.id} id={`template-${tpl.id}`} className={`template-card delay-${(i + 1) * 100}`}>
                  {/* Card top gradient */}
                  <div style={{
                    height: 100, background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ fontSize: 44 }}>{tpl.icon}</span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '18px 20px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#111827' }}>{tpl.name}</h3>
                    <p style={{ margin: '0 0 14px', fontSize: 13, color: '#9ca3af' }}>{tpl.description}</p>

                    {/* Task preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      {tpl.tasks.slice(0, 3).map((t, ti) => (
                        <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: g.from, flexShrink: 0 }} />
                          {t}
                        </div>
                      ))}
                      {tpl.tasks.length > 3 && (
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>+{tpl.tasks.length - 3} more tasks…</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        id={`use-template-${tpl.id}`}
                        className="btn btn-primary"
                        style={{ flex: 1, background: isApplied ? '#d1fae5' : `linear-gradient(135deg, ${g.from}, ${g.to})`, color: isApplied ? '#059669' : 'white', boxShadow: isApplied ? 'none' : `0 4px 14px ${g.from}55` }}
                        onClick={() => handleUseTemplate(tpl)}
                      >
                        {isApplied ? '✓ Applied!' : 'Use Template'}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPreviewTemplate(previewTemplate?.id === tpl.id ? null : tpl)}
                        style={{ width: 40, padding: 0 }}
                      >👁️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Template preview detail */}
          {previewTemplate && (
            <div className="animate-scale-in card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{ fontSize: 36 }}>{previewTemplate.icon}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{previewTemplate.name}</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9ca3af' }}>{previewTemplate.description}</p>
                </div>
                <button onClick={() => setPreviewTemplate(null)} style={{ marginLeft: 'auto', border: 'none', background: '#f1f5f9', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: '#6b7280' }}>Close ×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {previewTemplate.tasks.map((t, ti) => (
                  <div key={ti} style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center', border: '1px solid #f1f5f9' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#6b7280' }}>{ti + 1}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{t}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Daily · 8:00 AM</div>
                    </div>
                  </div>
                ))}
              </div>
              <button id="use-template-preview-btn" className="btn btn-primary" style={{ marginTop: 20, width: '100%' }} onClick={() => handleUseTemplate(previewTemplate)}>
                Use This Template
              </button>
            </div>
          )}
        </div>
      </AppShell>
      {modalOpen && <CreateTaskModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
