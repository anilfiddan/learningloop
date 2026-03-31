// Admin Store - LocalStorage based admin data management

export type UserRole = "user" | "admin" | "superadmin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  stats: {
    totalPractice: number;
    totalWords: number;
    streak: number;
    quizHighScore: number;
  };
}

export interface WordPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  words: string[];
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultLanguage: "tr" | "en";
  maxWordsPerUser: number;
  maxListsPerUser: number;
  features: {
    quiz: boolean;
    packs: boolean;
    visualCue: boolean;
    practiceCoach: boolean;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalWords: number;
  totalPractices: number;
  totalPacks: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  avgPracticePerUser: number;
}

const USERS_KEY = "ll_users";
const PACKS_KEY = "ll_packs";
const SETTINGS_KEY = "ll_settings";
const CURRENT_USER_KEY = "ll_current_user";

// Default settings
const defaultSettings: SiteSettings = {
  siteName: "LearningLoop",
  siteDescription: "Çocuklar için eğlenceli kelime öğrenme platformu",
  maintenanceMode: false,
  allowRegistration: true,
  defaultLanguage: "tr",
  maxWordsPerUser: 500,
  maxListsPerUser: 20,
  features: {
    quiz: true,
    packs: true,
    visualCue: true,
    practiceCoach: true,
  },
};

// Default admin user
const defaultAdmin: User = {
  id: "admin-001",
  email: "admin@learningloop.com",
  name: "Admin",
  role: "superadmin",
  isActive: true,
  createdAt: new Date().toISOString(),
  stats: {
    totalPractice: 0,
    totalWords: 0,
    streak: 0,
    quizHighScore: 0,
  },
};

// Default packs
const defaultPacks: WordPack[] = [
  {
    id: "pack-001",
    name: "Temel Kelimeler",
    description: "Günlük hayatta en çok kullanılan kelimeler",
    icon: "📚",
    category: "general",
    difficulty: "beginner",
    words: ["elma", "araba", "ev", "okul", "kitap", "kalem", "masa", "sandalye"],
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: "admin-001",
  },
  {
    id: "pack-002",
    name: "Hayvanlar",
    description: "Sevimli hayvan isimleri",
    icon: "🐶",
    category: "animals",
    difficulty: "beginner",
    words: ["kedi", "köpek", "kuş", "balık", "tavşan", "at", "inek", "koyun"],
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: "admin-001",
  },
  {
    id: "pack-003",
    name: "Yiyecekler",
    description: "Lezzetli yiyecek isimleri",
    icon: "🍕",
    category: "food",
    difficulty: "beginner",
    words: ["ekmek", "süt", "peynir", "yumurta", "meyve", "sebze", "et", "balık"],
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: "admin-001",
  },
];

// Initialize default data
function initializeData() {
  if (typeof window === "undefined") return;
  
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
  
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
  }
  
  if (!localStorage.getItem(PACKS_KEY)) {
    localStorage.setItem(PACKS_KEY, JSON.stringify(defaultPacks));
  }
}

// Users
export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  initializeData();
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

export function getUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function createUser(data: Omit<User, "id" | "createdAt" | "stats">): User {
  const users = getUsers();
  const newUser: User = {
    ...data,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? `user-${crypto.randomUUID()}` : `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    stats: {
      totalPractice: 0,
      totalWords: 0,
      streak: 0,
      quizHighScore: 0,
    },
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
}

export function updateUser(id: string, data: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...data };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users[index];
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  return true;
}

// Current User (Auth)
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  initializeData();
  try {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (!id) return null;
    return getUserById(id);
  } catch {
    return null;
  }
}

export function setCurrentUser(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_USER_KEY, userId);
  
  // Update last login
  updateUser(userId, { lastLogin: new Date().toISOString() });
}

export function clearCurrentUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function login(email: string, _password: string): User | null {
  const user = getUserByEmail(email);
  if (!user) return null;
  if (!user.isActive) return null;

  // Note: This is a localStorage-based demo store.
  // Real authentication is handled by Supabase Auth via /api/auth/login.
  // This function validates user existence for the local admin panel demo.
  setCurrentUser(user.id);
  return user;
}

export function register(email: string, name: string, password: string): User | null {
  const settings = getSettings();
  if (!settings.allowRegistration) return null;
  
  const existing = getUserByEmail(email);
  if (existing) return null;
  
  const user = createUser({
    email,
    name,
    role: "user",
    isActive: true,
  });
  
  setCurrentUser(user.id);
  return user;
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin" || user?.role === "superadmin";
}

// Packs
export function getPacks(): WordPack[] {
  if (typeof window === "undefined") return [];
  initializeData();
  try {
    return JSON.parse(localStorage.getItem(PACKS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getPackById(id: string): WordPack | null {
  const packs = getPacks();
  return packs.find(p => p.id === id) || null;
}

export function createPack(data: Omit<WordPack, "id" | "createdAt">): WordPack {
  const packs = getPacks();
  const newPack: WordPack = {
    ...data,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? `pack-${crypto.randomUUID()}` : `pack-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
  };
  packs.push(newPack);
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));
  return newPack;
}

export function updatePack(id: string, data: Partial<WordPack>): WordPack | null {
  const packs = getPacks();
  const index = packs.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  packs[index] = { ...packs[index], ...data };
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));
  return packs[index];
}

export function deletePack(id: string): boolean {
  const packs = getPacks();
  const filtered = packs.filter(p => p.id !== id);
  if (filtered.length === packs.length) return false;
  
  localStorage.setItem(PACKS_KEY, JSON.stringify(filtered));
  return true;
}

// Settings
export function getSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSettings;
  initializeData();
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || JSON.stringify(defaultSettings));
  } catch {
    return defaultSettings;
  }
}

export function updateSettings(data: Partial<SiteSettings>): SiteSettings {
  const settings = getSettings();
  const updated = { ...settings, ...data };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

// Stats
export function getAdminStats(): AdminStats {
  const users = getUsers();
  const packs = getPacks();
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const newUsersToday = users.filter(u => new Date(u.createdAt) >= today).length;
  const newUsersThisWeek = users.filter(u => new Date(u.createdAt) >= weekAgo).length;
  const activeUsers = users.filter(u => u.isActive).length;
  
  const totalPractices = users.reduce((sum, u) => sum + u.stats.totalPractice, 0);
  const totalWords = users.reduce((sum, u) => sum + u.stats.totalWords, 0);
  
  return {
    totalUsers: users.length,
    activeUsers,
    totalWords,
    totalPractices,
    totalPacks: packs.length,
    newUsersToday,
    newUsersThisWeek,
    avgPracticePerUser: users.length > 0 ? Math.round(totalPractices / users.length) : 0,
  };
}

// Demo data generator
export function generateDemoData(): void {
  const demoUsers: User[] = [
    {
      id: "user-demo-1",
      email: "ali@example.com",
      name: "Ali Yılmaz",
      role: "user",
      isActive: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      stats: { totalPractice: 45, totalWords: 32, streak: 5, quizHighScore: 80 },
    },
    {
      id: "user-demo-2",
      email: "ayse@example.com",
      name: "Ayşe Demir",
      role: "user",
      isActive: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date().toISOString(),
      stats: { totalPractice: 120, totalWords: 78, streak: 12, quizHighScore: 150 },
    },
    {
      id: "user-demo-3",
      email: "mehmet@example.com",
      name: "Mehmet Kaya",
      role: "user",
      isActive: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      stats: { totalPractice: 10, totalWords: 5, streak: 0, quizHighScore: 20 },
    },
    {
      id: "user-demo-4",
      email: "zeynep@example.com",
      name: "Zeynep Öz",
      role: "admin",
      isActive: true,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      stats: { totalPractice: 200, totalWords: 150, streak: 30, quizHighScore: 300 },
    },
  ];
  
  const users = getUsers();
  const existingIds = users.map(u => u.id);
  const newUsers = demoUsers.filter(u => !existingIds.includes(u.id));
  
  if (newUsers.length > 0) {
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, ...newUsers]));
  }
}
