import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
