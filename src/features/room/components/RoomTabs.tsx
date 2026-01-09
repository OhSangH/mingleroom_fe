import type { ReactNode } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

type RoomTab = {
  value: string;
  label: string;
  icon?: ReactNode;
};

type RoomTabsProps = {
  value: string;
  onChange: (value: string) => void;
  tabs: RoomTab[];
};

export default function RoomTabs({ value, onChange, tabs }: RoomTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next)}
      variant="scrollable"
      textColor="inherit"
      indicatorColor="secondary"
      className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={
            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
              {tab.icon}
              {tab.label}
            </span>
          }
        />
      ))}
    </Tabs>
  );
}
