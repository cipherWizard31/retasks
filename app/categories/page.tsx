'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import CreateTaskModal from '../components/CreateTaskModal';
import { TASKS, CATEGORY_META, Category } from '../../lib/data';

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCatKey, setEditingCatKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);

  const [customLabel, setCustomLabel] = useState('');
  const [customIcon, setCustomIcon] = useState('📌');
  const [customColor, setCustomColor] = useState('#8b5cf6');
  const [customCategories, setCustomCategories] = useState<Array<{ key: string; label: string; icon: string; color: string }}>([
    { key: 'custom-projects', label: 'Projects', icon: '🚀', color: '#6366f1' },
    { key: 'custom-hobbies', label: 'Hobbies', icon: '🎨', color: '#ec4899' },
  ]);

  const openNew = () => {
    setEditingCatKey(null);
    setCustomLabel('');
    setCustomIcon('📌');
    setCustomColor('#8b5cf6');
    setCatModalOpen(true);
  };

  const openEdit = (cat: { key: string; label: string; icon: string; color: string }) => {
    setEditingCatKey(cat.key);
    setCustomLabel(cat.label);
    setCustomIcon(cat.icon);
    setCustomColor(cat.color);
    setCatModalOpen(true);
  };

  const handleDeleteCustomCat = (key: string) => {
    setCustomCategories(prev => prev.filter(c => c.key !== key));
    if (selected === key as any) setSelected(null);
  };

  const defaultCats = (Object.keys(CATEGORY_META) as Category[]).map(cat => {
    const catTasks = TASKS.filter(t => t.category === cat);
    const rate = catTasks.length > 0 ? Math.round(catTasks.reduce((a, t) => a + t.completionRate, 0) / catTasks.length) : 0;
    return { key: cat, meta: CATEGORY_META[cat], tasks: catTasks, rate, isCustom: false };
  });

  const customCatsMapped = customCategories.map(c => {
    const catTasks = TASKS.filter(t => t.category === (c.key as any));
    const rate = catTasks.length > 0 ? Math.round(catTasks.reduce((a, t) => a + t.completionRate, 0) / catTasks.length) : 0;
    return {
      key: c.key,
      meta: { label: c.label, icon: c.icon, color: c.color, cssClass: 'cat-custom' },
      tasks: catTasks,
      rate,
      isCustom: true,
    };
  });

  const allCategories = [...defaultCats, ...customCatsMapped];

  const handleSaveCategory = () => {
    if (!customLabel.trim()) return;
    if (editingCatKey) {
      setCustomCategories(prev => prev.map(c => c.key === editingCatKey ? { ...c, label: customLabel.trim(), icon: customIcon, color: customColor } : c));
    } else {
      const newKey = `custom-${Date.now()}`;
      setCustomCategories(prev => [...prev, { key: newKey, label: customLabel.trim(), icon: customIcon, color: customColor }]);
    }
    setCustomLabel('');
    setCatModalOpen(false);
  };

  const selectedCategoryMeta = allCategories.find(c => c.key === selected)?.meta;
  const filteredTasks = selected ? TASKS.filter(t => t.category === selected) : [];

  return (
    <>
      <AppShell onAddTask={() => setModalOpen(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>🏷️ Categories</h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>Organize your tasks by life area with default & custom categories</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button id="add-custom-cat-btn" className="btn btn-secondary" onClick={openNew}>
                + New Category
              </button>
              <button id="categories-add-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>
                + Add Task
              </button>
            </div>
          </div>

          {/* Category grid */}
          <div className="animate-fade-in delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {allCategories.map(({ key, meta, tasks, rate, isCustom }, i) => (
              <div
                key={key}
                id={`cat-card-${key}`}
                className={`card delay-${(i + 1) * 100}`}
                onClick={() => setSelected(selected === key ? null : (key as Category))}
                style={{
                  padding: '20px', cursor: 'pointer',
                  border: selected === key ? `2px solid ${meta.color}` : '1px solid var(--border)',
                  background: selected === key ? `${meta.color}15` : 'var(--surface)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {isCustom && (
                  <div
                    style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      title="Edit category"
                      onClick={() => openEdit(customCategories.find(c => c.key === key)!)}
                      style={{ background: meta.color, border: 'none', color: 'white', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', fontSize: 11 }}
                    >✏️</button>
                    <button
                      title="Delete category"
                      onClick={() => handleDeleteCustomCat(key)}
                      style={{ background: '#ef4444', border: 'none', color: 'white', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', fontSize: 11 }}
                    >✕</button>
                  </div>
                )}
                <div style={{ fontSize: 32, marginBottom: 12 }}>{meta.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>{meta.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${rate}%`, background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Completion</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{rate}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected category detail */}
          {selected && selectedCategoryMeta && (
            <div className="animate-fade-in card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 28 }}>{selectedCategoryMeta.icon}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>{selectedCategoryMeta.label}</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>{filteredTasks.length} tasks in this category</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredTasks.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No tasks in this category yet.</p>
                ) : (
                  filteredTasks.map(task => (
                    <div key={task.id} style={{
                      padding: '14px 16px', background: 'var(--surface-muted)', borderRadius: 12,
                      display: 'flex', alignItems: 'center', gap: 14,
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: task.status === 'completed' ? '#10b981' : task.status === 'overdue' ? '#ef4444' : task.status === 'due' ? '#f59e0b' : '#d1d5db',
                        flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{task.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          🔁 {task.repeatType === 'daily' ? 'Every Day' : task.repeatType === 'weekly' ? 'Every Week' : `Every ${task.repeatInterval} days`} · 🕐 {task.reminderTime}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{task.completionRate}%</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>streak {task.streak}d</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </AppShell>

      {/* Custom Category Modal */}
      {catModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setCatModalOpen(false)}>
          <div className="modal-content animate-scale-in" style={{ maxWidth: 400, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>{editingCatKey ? 'Edit Category' : 'New Custom Category'}</h3>
              <button
                onClick={() => setCatModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
              >×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                  Category Label
                </label>
                <input
                  className="input"
                  placeholder="e.g. Gardening, Fitness, Reading"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                  Category Emoji Icon
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['🌱', '🎨', '🚀', '🎸', '⚽', '🧪', '✈️', '💻', '💡'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setCustomIcon(icon)}
                      style={{
                        fontSize: 20, padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                        border: customIcon === icon ? '2px solid var(--accent-color)' : '1px solid var(--border)',
                        background: customIcon === icon ? 'var(--accent-color-light)' : 'var(--surface)',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                  Category Color
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCustomColor(color)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', background: color, cursor: 'pointer',
                        border: customColor === color ? '3px solid var(--foreground)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button className="btn btn-secondary" onClick={() => setCatModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveCategory} disabled={!customLabel.trim()}>
                  {editingCatKey ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && <CreateTaskModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
