'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/domains/auth/hooks/useAuth';
import {
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  Boxes,
  ShieldCheck,
  Building2,
  Users,
  ChevronRight,
  LogOut,
  X,
  Zap,
  // Sub-menu Icons
  Package,
  FolderTree,
  Award,
  Percent,
  Ruler,
  UserCheck,
  FileText,
  RotateCcw,
  Warehouse,
  ClipboardList,
  History,
  User,
  KeyRound,
  Building,
  GitFork,
  Network,
  BadgeCheck,
  UserPlus,
  Users2,
  ShoppingBag,
  Receipt,
  PlusCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const menuSections = [
    {
      title: 'Catalog Management',
      icon: PackageSearch,
      items: [
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Categories', href: '/categories', icon: FolderTree },
        { name: 'Brands', href: '/brands', icon: Award },
        { name: 'Tax Rates', href: '/tax-rates', icon: Percent },
        { name: 'Units', href: '/units', icon: Ruler },
      ],
    },
    {
      title: 'Sales & CRM',
      icon: ShoppingBag,
      items: [
        { name: 'Sales list', href: '/sales', icon: Receipt },
        { name: 'New Sales', href: '/sales/create', icon: PlusCircle },
        { name: 'Customers', href: '/customers', icon: Users2 },
      ],
    },
    {
      title: 'Purchase & Procurement',
      icon: ShoppingCart,
      items: [
        { name: 'Suppliers', href: '/suppliers', icon: UserCheck },
        { name: 'Purchase Orders', href: '/purchases', icon: FileText },
        { name: 'Purchase Returns', href: '/purchase-returns', icon: RotateCcw },
      ],
    },
    {
      title: 'Inventory Management',
      icon: Boxes,
      items: [
        { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
        { name: 'Current Inventory', href: '/inventory', icon: ClipboardList },
        { name: 'Stock Ledger', href: '/stock-history', icon: History },
      ],
    },
    {
      title: 'Access Control',
      icon: ShieldCheck,
      items: [
        { name: 'Users', href: '/users', icon: User },
        { name: 'Roles & Permissions', href: '/roles', icon: KeyRound },
      ],
    },
    {
      title: 'Organization',
      icon: Building2,
      items: [
        { name: 'Companies', href: '/companies', icon: Building },
        { name: 'Branches', href: '/branches', icon: GitFork },
        { name: 'Departments', href: '/departments', icon: Network },
        { name: 'Designations', href: '/designations', icon: BadgeCheck },
      ],
    },
    {
      title: 'HR Management',
      icon: Users,
      items: [{ name: 'Employees', href: '/employees', icon: UserPlus }],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-md transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Modern Soft-Light Sidebar Wrapper */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 p-3 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full w-full bg-slate-900/90 lg:bg-slate-900/95 text-slate-100 backdrop-blur-2xl rounded-3xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between overflow-hidden relative group">
          
          {/* Ambient Glow Background Accents */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-12 -right-20 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Logo */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between relative z-10 bg-slate-900/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
                  <Zap className="w-5 h-5 fill-blue-400/20" />
                </div>
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-wider flex items-center gap-1">
                  NRG SOLAR
                </h1>
                <p className="text-[10px] font-extrabold text-blue-400 tracking-widest uppercase">
                  Enterprise ERP
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto relative z-10 scrollbar-none">
            
            {/* Dashboard Link */}
            <div>
              <Link
                href="/dashboard"
                onClick={onClose}
                className={`group relative flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all duration-200 ${
                  pathname === '/dashboard'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Dashboard</span>
              </Link>
            </div>

            <div className="pt-3 pb-1 px-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Main Menu
              </span>
            </div>

            {/* Hover-to-Reveal Collapsible Sections */}
            {menuSections.map((section) => {
              const MainIcon = section.icon;
              const hasActiveChild = section.items.some((item) => pathname === item.href);
              const isHovered = hoveredSection === section.title;

              return (
                <div
                  key={section.title}
                  onMouseEnter={() => setHoveredSection(section.title)}
                  onMouseLeave={() => setHoveredSection(null)}
                  className="rounded-2xl transition-all duration-200"
                >
                  {/* Parent Category Header */}
                  <div
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-2xl cursor-pointer transition-all duration-200 ${
                      hasActiveChild
                        ? 'bg-blue-950/50 text-blue-400 border border-blue-800/60 shadow-sm'
                        : isHovered
                        ? 'bg-slate-800/80 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MainIcon
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isHovered || hasActiveChild ? 'text-blue-400 scale-110' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{section.title}</span>
                    </div>

                    <ChevronRight
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${
                        isHovered || hasActiveChild ? 'rotate-90 text-blue-400' : ''
                      }`}
                    />
                  </div>

                  {/* Submenu Drawer with Sub-item Icons */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                      isHovered || hasActiveChild
                        ? 'grid-rows-[1fr] opacity-100 mt-1 mb-2'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="min-h-0 pl-3 pr-1 space-y-1 border-l-2 border-slate-800/80 ml-5">
                      {section.items.map((item) => {
                        const SubIcon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`group flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20 translate-x-1'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <SubIcon
                                className={`w-3.5 h-3.5 transition-colors ${
                                  isActive
                                    ? 'text-white'
                                    : 'text-slate-400 group-hover:text-blue-400'
                                }`}
                              />
                              <span>{item.name}</span>
                            </div>

                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Bottom Logout Area */}
          <div className="p-3 border-t border-slate-800/80 relative z-10 bg-slate-900/40 backdrop-blur-md">
            <button
              onClick={() => logout()}
              type="button"
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-400 bg-rose-950/30 border border-rose-900/40 hover:bg-gradient-to-r hover:from-rose-600 hover:to-red-600 hover:text-white hover:border-transparent transition-all duration-300 shadow-sm cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Logout
              </span>
              <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}