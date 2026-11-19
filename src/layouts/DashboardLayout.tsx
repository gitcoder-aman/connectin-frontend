import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { MobileNav } from '@/components/layout/MobileNav';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showLeftSidebar = true,
  showRightSidebar = true,
}) => {
  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col pb-16 md:pb-6">
      {/* Top Navbar */}
      <Navbar />

      {/* Main 3-Column Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Sidebar */}
          {showLeftSidebar && (
            <div className="hidden md:block md:col-span-4 lg:col-span-3">
              <SidebarLeft />
            </div>
          )}

          {/* Center Main Content */}
          <div
            className={`col-span-12 ${
              showLeftSidebar && showRightSidebar
                ? 'md:col-span-8 lg:col-span-6'
                : showLeftSidebar
                ? 'md:col-span-8 lg:col-span-9'
                : 'md:col-span-12'
            }`}
          >
            {children}
          </div>

          {/* Right Sidebar */}
          {showRightSidebar && (
            <div className="hidden lg:block lg:col-span-3">
              <SidebarRight />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Navigation */}
      <MobileNav />
    </div>
  );
};
