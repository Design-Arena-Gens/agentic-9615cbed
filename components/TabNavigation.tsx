'use client';

import { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  description?: ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export function TabNavigation({ tabs, activeId, onChange }: TabNavigationProps) {
  return (
    <div>
      <div className="flex-space">
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Operations Control Center</h2>
          <p style={{ margin: 0, color: '#6b7a90' }}>
            Monitor procurement, keep farmer records organized and stay payout ready.
          </p>
        </div>

        <div className="tab-bar" role="tablist" aria-label="Primary Views">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-button${tab.id === activeId ? ' active' : ''}`}
              onClick={() => onChange(tab.id)}
              role="tab"
              aria-selected={tab.id === activeId}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {tabs
        .filter((tab) => tab.id === activeId && tab.description)
        .map((tab) => (
          <div key={tab.id} style={{ marginTop: '1rem', color: '#6b7a90' }}>
            {tab.description}
          </div>
        ))}
    </div>
  );
}
