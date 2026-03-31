"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Target,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { getUsers, getPacks, getAdminStats, User } from "@/lib/stores/admin-store";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<ReturnType<typeof getAdminStats> | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  useEffect(() => {
    setStats(getAdminStats());
    setUsers(getUsers());
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
          <p className="text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Calculate top performers
  const topPerformers = [...users]
    .sort((a, b) => b.stats.totalPractice - a.stats.totalPractice)
    .slice(0, 5);

  // Calculate streak leaders
  const streakLeaders = [...users]
    .sort((a, b) => b.stats.streak - a.stats.streak)
    .slice(0, 5);

  // Mock weekly data
  const weeklyData = [
    { day: "Pzt", practices: 45, users: 12 },
    { day: "Sal", practices: 52, users: 15 },
    { day: "Çar", practices: 38, users: 10 },
    { day: "Per", practices: 65, users: 18 },
    { day: "Cum", practices: 48, users: 14 },
    { day: "Cmt", practices: 72, users: 22 },
    { day: "Paz", practices: 55, users: 16 },
  ];

  const maxPractices = Math.max(...weeklyData.map(d => d.practices));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analitik</h1>
          <p className="text-slate-500">Platform performans metrikleri</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200">
          {[
            { id: "week", label: "Hafta" },
            { id: "month", label: "Ay" },
            { id: "all", label: "Tümü" },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                timeRange === range.id
                  ? "bg-indigo-500 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              +{stats.newUsersThisWeek}
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
          <p className="text-blue-100 text-sm">Toplam Kullanıcı</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 opacity-80" />
            <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              +12%
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalPractices}</p>
          <p className="text-emerald-100 text-sm">Toplam Pratik</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 opacity-80" />
            <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              Ort.
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.avgPracticePerUser}</p>
          <p className="text-violet-100 text-sm">Pratik/Kullanıcı</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 opacity-80" />
            <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              Bugün
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.newUsersToday}</p>
          <p className="text-amber-100 text-sm">Yeni Kayıt</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>📊</span> Haftalık Aktivite
          </h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs text-slate-500 mb-2">{day.practices}</span>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-lg transition-all"
                    style={{ height: `${(day.practices / maxPractices) * 140}px` }}
                  />
                </div>
                <span className="text-xs text-slate-600 mt-2 font-medium">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>👥</span> Kullanıcı Dağılımı
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Aktif Kullanıcılar</span>
                <span className="text-sm font-bold text-emerald-600">{stats.activeUsers}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                  style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Pasif Kullanıcılar</span>
                <span className="text-sm font-bold text-slate-500">{stats.totalUsers - stats.activeUsers}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-slate-300 to-slate-400 rounded-full"
                  style={{ width: `${((stats.totalUsers - stats.activeUsers) / stats.totalUsers) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Bu Hafta Kayıt</span>
                <span className="text-sm font-bold text-indigo-600">{stats.newUsersThisWeek}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                  style={{ width: `${(stats.newUsersThisWeek / stats.totalUsers) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span>🏆</span> En Çok Pratik Yapanlar
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {topPerformers.map((user, i) => (
              <div key={user.id} className="px-6 py-4 flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  i === 0 ? "bg-amber-100 text-amber-700" :
                  i === 1 ? "bg-slate-200 text-slate-600" :
                  i === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-slate-100 text-slate-500"
                )}>
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{user.stats.totalPractice}</p>
                  <p className="text-xs text-slate-400">pratik</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Leaders */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-pink-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span>🔥</span> En Uzun Seriler
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {streakLeaders.map((user, i) => (
              <div key={user.id} className="px-6 py-4 flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  i === 0 ? "bg-rose-100 text-rose-700" :
                  i === 1 ? "bg-slate-200 text-slate-600" :
                  i === 2 ? "bg-pink-100 text-pink-700" :
                  "bg-slate-100 text-slate-500"
                )}>
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{user.stats.streak}</p>
                  <p className="text-xs text-slate-400">gün</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>📈</span> Hızlı İstatistikler
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-2xl">
            <p className="text-3xl font-bold text-blue-600 mb-1">{stats.totalWords}</p>
            <p className="text-sm text-slate-600">Toplam Kelime</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-2xl">
            <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.totalPacks}</p>
            <p className="text-sm text-slate-600">Kelime Paketi</p>
          </div>
          <div className="text-center p-4 bg-violet-50 rounded-2xl">
            <p className="text-3xl font-bold text-violet-600 mb-1">
              {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
            </p>
            <p className="text-sm text-slate-600">Aktiflik Oranı</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-2xl">
            <p className="text-3xl font-bold text-amber-600 mb-1">{stats.newUsersThisWeek}</p>
            <p className="text-sm text-slate-600">Haftalık Kayıt</p>
          </div>
        </div>
      </div>
    </div>
  );
}
