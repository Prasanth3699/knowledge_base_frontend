export const APP_CONFIG = {
  name: "Knowledge Base",
  description: "Collaborative document platform for teams",
  url: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login/",
    register: "/auth/register/",
    logout: "/auth/logout/",
    refresh: "/auth/refresh/",
    profile: "/auth/profile/",
    passwordReset: "/auth/password-reset/",
    passwordResetConfirm: "/auth/password-reset/confirm/",
    verifyEmail: "/auth/verify-email/",
    resendVerification: "/auth/resend-verification/",
  },
  documents: {
    list: "/documents/",
    detail: (id: string) => `/documents/${id}/`,
    create: "/documents/",
    update: (id: string) => `/documents/${id}/`,
    delete: (id: string) => `/documents/${id}/`,
    autoSave: (id: string) => `/documents/${id}/auto-save/`,
    public: (token: string) => `/documents/public/${token}/`,
  },
  sharing: {
    list: (documentId: string) => `/documents/${documentId}/shares/`,
    create: (documentId: string) => `/documents/${documentId}/shares/`,
    update: (documentId: string, shareId: string) => 
      `/documents/${documentId}/shares/${shareId}/`,
    delete: (documentId: string, shareId: string) => 
      `/documents/${documentId}/shares/${shareId}/`,
  },
  search: {
    global: "/search/",
    suggestions: "/search/suggestions/",
    history: "/search/history/",
    saved: "/search/saved/",
  },
  notifications: {
    list: "/notifications/",
    markRead: (id: string) => `/notifications/${id}/`,
    markAllRead: "/notifications/mark-all-read/",
    unreadCount: "/notifications/unread-count/",
  },
} as const;

export const STORAGE_KEYS = {
  theme: "theme",
  sidebarOpen: "sidebar-open",
  recentSearches: "recent-searches",
  editorSettings: "editor-settings",
} as const;

export const LIMITS = {
  document: {
    titleMaxLength: 255,
    contentMaxLength: 50000,
    tagsMaxCount: 10,
    tagMaxLength: 50,
  },
  user: {
    usernameMaxLength: 30,
    nameMaxLength: 150,
    bioMaxLength: 500,
  },
  file: {
    avatarMaxSize: 5 * 1024 * 1024, // 5MB
    imageMaxSize: 10 * 1024 * 1024, // 10MB
  },
} as const;

export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  documents: "/documents",
  newDocument: "/documents/new",
  document: (id: string) => `/documents/${id}`,
  editDocument: (id: string) => `/documents/${id}/edit`,
  publicDocument: (token: string) => `/documents/public/${token}`,
  shared: "/shared",
  starred: "/starred",
  search: "/search",
  notifications: "/notifications",
  profile: "/profile",
  settings: "/settings",
} as const;