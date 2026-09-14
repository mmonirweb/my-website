'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/domains/auth/hooks/useAuth';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Loading Enterprise State...
        </p>
      </div>
    );
  }

  // 1. Stat Cards Data
  const stats = [
    {
      title: 'Total Employees',
      value: '1,248',
      change: '+12%',
      isPositive: true,
      icon: '👥',
      bg: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      title: 'Active Projects',
      value: '42',
      change: '+4',
      isPositive: true,
      icon: '⚡',
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    {
      title: 'Monthly Revenue',
      value: '৳ 4.85M',
      change: '+18.4%',
      isPositive: true,
      icon: '📈',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    {
      title: 'Pending Approvals',
      value: '18',
      change: '-3',
      isPositive: false,
      icon: '⏳',
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
    },
  ];

  // 2. Industrial Mock Data
  const recentActivities = [
    {
      id: 1,
      user: 'Mst. Khadiza Khatun',
      role: 'Branch Manager',
      action: 'Approved leave request for 3 employees',
      time: '10 mins ago',
      avatar: 'K',
      badgeBg: 'bg-blue-100 text-blue-700',
    },
    {
      id: 2,
      user: 'Rafiqul Islam',
      role: 'Project Engineer',
      action: 'Updated Solar Site Alpha-4 Commissioning Report',
      time: '35 mins ago',
      avatar: 'R',
      badgeBg: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 3,
      user: 'Tanvir Hossain',
      role: 'HR Officer',
      action: 'Onboarded 5 new field technicians',
      time: '2 hours ago',
      avatar: 'T',
      badgeBg: 'bg-emerald-100 text-emerald-700',
    },
  ];

  const quickActions = [
    { name: 'Add New Employee', href: '/employees', icon: '👤+', color: 'hover:border-blue-500' },
    { name: 'Role Management', href: '/roles', icon: '🛡️', color: 'hover:border-indigo-500' },
    { name: 'Branch Setup', href: '/branches', icon: '🏢', color: 'hover:border-purple-500' },
    { name: 'System Logs', href: '#', icon: '📜', color: 'hover:border-emerald-500' },
  ];

  return (
    <div className="space-y-8 p-2 sm:p-4 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Enterprise Node
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Administrator'}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Here is your operational overview for NRG Solar ERP today. Everything is running smoothly with strict access control active.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right">
              <div className="text-[10px] uppercase text-slate-400 font-bold">Role Scope</div>
              <div className="text-xs font-bold text-blue-400">{user?.roles?.[0] || 'Super Admin'}</div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right">
              <div className="text-[10px] uppercase text-slate-400 font-bold">Security Token</div>
              <div className="text-xs font-bold text-emerald-400">Strict Cookie Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  stat.isPositive
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.title}
              </h3>
              <p className="text-2xl font-black text-slate-800 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Performance Chart Simulation (Left 2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-800">Operational Energy Efficiency</h2>
                <p className="text-xs text-slate-400">Monthly deployment vs targets across all branches</p>
              </div>
              <select className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 focus:outline-none">
                <option>This Year (2026)</option>
                <option>Previous Year</option>
              </select>
            </div>

            {/* Visual Bar Chart SVG Mock */}
            <div className="h-56 w-full flex items-end justify-between gap-2 pt-8 pb-2 px-2">
              {[
                { month: 'Jan', val: '40%' },
                { month: 'Feb', val: '65%' },
                { month: 'Mar', val: '50%' },
                { month: 'Apr', val: '85%' },
                { month: 'May', val: '70%' },
                { month: 'Jun', val: '95%' },
                { month: 'Jul', val: '60%' },
                { month: 'Aug', val: '80%' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full max-w-[36px] bg-slate-100 rounded-xl h-full flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: bar.val }}
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-lg group-hover:brightness-110 transition-all duration-300"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Efficiency Index: <strong className="text-slate-800">92.4%</strong></span>
            <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Download Detailed CSV Report ➔</span>
          </div>
        </div>

        {/* Quick Actions & System Info (Right 1 Column) */}
        <div className="space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-4">Quick Operations</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <a
                  key={idx}
                  href={action.href}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-700 transition-all duration-200 hover:bg-white hover:shadow-md ${action.color}`}
                >
                  <span className="text-xl mb-1">{action.icon}</span>
                  <span className="text-xs font-semibold text-center">{action.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md border border-white/10">
            <h3 className="text-sm font-bold text-slate-200 mb-3">Enterprise Core Status</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Database Cluster</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Healthy
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Auth Guard Service</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">API Gateway Latency</span>
                <span className="text-blue-400 font-semibold">14ms</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Audit Activity</h2>
            <p className="text-xs text-slate-400">Real-time system events and administrative updates</p>
          </div>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition">
            View All Logs ➔
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl font-bold text-sm flex items-center justify-center ${act.badgeBg}`}>
                  {act.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {act.user} <span className="font-normal text-slate-400">({act.role})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{act.action}</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                {act.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}