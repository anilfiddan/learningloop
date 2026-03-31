"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Package,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Target,
  Zap,
} from "lucide-react";
import { getAdminStats, getUsers, generateDemoData, User } from "@/lib/stores/admin-store";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState<ReturnType<typeof getAdminStats> | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate demo data on first load
    generateDemoData();
    
    const adminStats = getAdminStats();
    const users = getUsers();
    
    setStats(adminStats);
    setRecentUsers(users.slice(-5).reverse());
    setLoading(false);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Activity className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Toplam Kullanıcı",
      value: stats.totalUsers,
      change: `+${stats.newUsersThisWeek} bu hafta`,
      trend: "up",
      icon: Users,
    },
    {
      title: "Aktif Kullanıcı",
      value: stats.activeUsers,
      change: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% aktif`,
      trend: "up",
      icon: Activity,
    },
    {
      title: "Toplam Pratik",
      value: stats.totalPractices,
      change: `Ort. ${stats.avgPracticePerUser}/kullanıcı`,
      trend: "up",
      icon: Target,
    },
    {
      title: "Kelime Paketleri",
      value: stats.totalPacks,
      change: "Aktif paket",
      trend: "neutral",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yönetim Paneli</h1>
        <p className="text-gray-500">
          LearningLoop yönetim paneline hoş geldin. İşte bugünün özeti.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-gray-500" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                stat.trend === "up" ? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-500"
              )}>
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : null}
                {stat.change}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" /> Son Kullanıcılar
            </h3>
            <a href="/admin/users" className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">
              Tümünü Gör →
            </a>
          </div>
          <div className="divide-y divide-slate-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{user.name}</p>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    user.isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {user.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500" /> Hızlı İşlemler
            </h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <a
              href="/admin/users"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Kullanıcı Ekle</span>
            </a>
            <a
              href="/admin/packs"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Paket Ekle</span>
            </a>
            <a
              href="/admin/settings"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                <Zap className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Özellikler</span>
            </a>
            <a
              href="/admin/analytics"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Raporlar</span>
            </a>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500" /> Platform Özeti
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalWords}</p>
            <p className="text-sm text-gray-500">Toplam Kelime</p>
          </div>
          <div className="text-center p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.newUsersToday}</p>
            <p className="text-sm text-gray-500">Bugün Kayıt</p>
          </div>
          <div className="text-center p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.avgPracticePerUser}</p>
            <p className="text-sm text-gray-500">Ort. Pratik</p>
          </div>
          <div className="text-center p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPacks}</p>
            <p className="text-sm text-gray-500">Kelime Paketi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
