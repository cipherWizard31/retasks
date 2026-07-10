'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '⊞' },
  { href: '/today', label: 'Today', icon: '☀️' },
  { href: '/upcoming', label: 'Upcoming', icon: '📅' },
  { href: '/calendar', label: 'Calendar', icon: '🗓️' },
  { href: '/history', label: 'History', icon: '📋' },
  { href: '/categories', label: 'Categories', icon: '🏷️' },
  { href: '/statistics', label: 'Statistics', icon: '📊' },
  { href: '/templates', label: 'Templates', icon: '✨' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

const MOBILE_NAV = [
  { href: '/today', label: 'Today', icon: '☀️' },
  { href: '/upcoming', label: 'Upcoming', icon: '📅' },
  { href: '/history', label: 'History', icon: '📋' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

interface AppShellProps {
  children: React.ReactNode;
  onAddTask?: () => void;
}

export default function AppShell({ children, onAddTask }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarWidth = collapsed ? '64px' : '240px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        className="desktop-sidebar"
        style={{
          width: sidebarWidth,
          minHeight: '100vh',
          background: 'white',
          borderRight: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 20,
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 0' : '20px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            margin: collapsed ? '0 auto' : '0',
          }}>
            <span style={{ fontSize: 18, color: 'white' }}>✓</span>
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', letterSpacing: '-0.01em' }}>ReTasks</div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Recurring Tasks</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {!collapsed && <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 8px 4px' }} className="sidebar-section-label">Menu</div>}
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              style={{ justifyContent: collapsed ? 'center' : undefined }}
            >
              <span className="nav-icon" style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}

          {!collapsed && <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 8px 4px' }} className="sidebar-section-label">Manage</div>}
          {NAV_ITEMS.slice(5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              style={{ justifyContent: collapsed ? 'center' : undefined }}
            >
              <span className="nav-icon" style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: collapsed ? '12px 0' : '12px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px', borderRadius: '12px', cursor: 'pointer',
            transition: 'background 0.15s',
            justifyContent: collapsed ? 'center' : undefined,
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 14,
            }}>N</div>
            {!collapsed && (
              <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Nate</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Free Plan</div>
              </div>
            )}
          </div>

          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%', padding: '8px', marginTop: 4,
              border: 'none', background: 'transparent', cursor: 'pointer',
              borderRadius: '8px', color: '#9ca3af', fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {collapsed ? '→' : '← Collapse'}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-content" style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* Top Navbar */}
        <header
          className="top-navbar"
          style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: 'rgba(248,250,252,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #f1f5f9',
            padding: '0 24px',
            height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16 }}>🔍</span>
            <input
              id="global-search"
              type="text"
              className="input"
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 38, background: 'white', borderColor: '#e5e7eb' }}
            />
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              id="quick-add-btn"
              className="btn btn-primary btn-sm"
              onClick={onAddTask}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
              Quick Add
            </button>

            {/* Notifications */}
            <div className="tooltip-wrapper">
              <button
                id="notif-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  position: 'relative', width: 40, height: 40,
                  border: 'none', background: notifOpen ? '#f0fdf4' : 'white',
                  borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'all 0.15s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                🔔
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10b981', border: '2px solid white',
                }} />
              </button>
              <span className="tooltip">Notifications</span>
            </div>

            {/* Avatar */}
            <Link href="/settings">
              <div style={{
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 14,
                boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
              }}>N</div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav" id="mobile-nav">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '8px 0', textDecoration: 'none',
              color: pathname === item.href ? '#10b981' : '#9ca3af',
              fontSize: 11, fontWeight: 600,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {/* Add button center */}
        <button
          id="mobile-add-btn"
          onClick={onAddTask}
          className="fab"
          style={{ position: 'relative', bottom: 'auto', right: 'auto', width: 48, height: 48 }}
        >
          <span style={{ fontSize: 24 }}>+</span>
        </button>
      </nav>
    </div>
  );
}
