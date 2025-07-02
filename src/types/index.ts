
// User types
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_activity?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Document types
export interface Document {
  id: string;
  title: string;
  content: string;
  description?: string;
  visibility: "public" | "private";
  author: User;
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_edited_by?: User;
  last_edited_at?: string;
  word_count: number;
  character_count: number;
  view_count: number;
  public_url?: string;
  public_link_token?: string;
  allow_comments: boolean;
  allow_copy_edit: boolean;
  is_template: boolean;
}

export interface CreateDocumentData {
  title: string;
  content?: string;
  description?: string;
  visibility?: "public" | "private";
  tags?: string[];
  allow_comments?: boolean;
  allow_copy_edit?: boolean;
  is_template?: boolean;
}

export interface UpdateDocumentData {
  title?: string;
  content?: string;
  description?: string;
  visibility?: "public" | "private";
  tags?: string[];
  allow_comments?: boolean;
  allow_copy_edit?: boolean;
}

// Document version types
export interface DocumentVersion {
  id: string;
  document: string;
  version_number: number;
  content: string;
  version_author?: User;
  created_at: string;
  word_count: number;
  character_count: number;
  changes_summary?: string;
}

export interface VersionComparison {
  from_version: DocumentVersion;
  to_version: DocumentVersion;
  additions: string[];
  deletions: string[];
  changes: Array<{
    type: "addition" | "deletion" | "modification";
    content: string;
    line_number: number;
  }>;
}

// Sharing types
export interface DocumentShare {
  id: string;
  document: Document;
  user: User;
  shared_by: User;
  permission: "view" | "edit";
  created_at: string;
  updated_at: string;
  is_active: boolean;
  share_message?: string;
}

export interface ShareInvitation {
  id: string;
  document: Document;
  invited_by: User;
  email: string;
  permission: "view" | "edit";
  token: string;
  status: "pending" | "accepted" | "declined" | "expired";
  expires_at: string;
  created_at: string;
  accepted_at?: string;
  message?: string;
}

export interface CreateShareData {
  userId: string;
  permission: "view" | "edit";
  message?: string;
}

export interface CreateInvitationData {
  email: string;
  permission: "view" | "edit";
  message?: string;
}

// Search types
export interface SearchResult {
  documents: Document[];
  users: User[];
  total_documents: number;
  total_users: number;
  query: string;
  search_time: number;
}

export interface SavedSearch {
  id: string;
  user: User;
  query: string;
  filters: Record<string, any>;
  created_at: string;
}

export interface SearchQuery {
  id: string;
  user: User;
  query: string;
  results_count: number;
  created_at: string;
  ip_address?: string;
}

// Notification types
export interface Notification {
  id: string;
  recipient: User;
  sender?: User;
  notification_type: "document_shared" | "document_mentioned" | "document_comment" | 
                     "user_invitation" | "document_updated" | "version_restored" | 
                     "share_invitation" | "mention_notification";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  related_object_id?: string;
  related_object_type?: "document" | "user" | "share";
  action_url?: string;
  data?: Record<string, any>;
}

// Mention types
export interface DocumentMention {
  id: string;
  document: Document;
  mentioned_user: User;
  mentioned_by: User;
  content_context: string;
  created_at: string;
  is_notified: boolean;
}

// Activity types
export interface DocumentActivity {
  id: string;
  document: Document;
  user: User;
  action: "created" | "updated" | "deleted" | "shared" | "mentioned" | 
          "commented" | "version_restored" | "visibility_changed";
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// Auto-save types
export interface DocumentAutoSave {
  id: string;
  document: Document;
  user: User;
  content: string;
  created_at: string;
  is_applied: boolean;
}

// API response types
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "select" | "checkbox";
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | undefined;
  };
  options?: Array<{ value: string; label: string }>;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// UI types
export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
  badge?: string | number;
  shortcut?: string;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

// Filter types
export interface DocumentFilter {
  search?: string;
  visibility?: "all" | "public" | "private";
  author?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: "title" | "created" | "updated" | "views";
  sortOrder?: "asc" | "desc";
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: "active" | "inactive";
  sortBy?: "name" | "email" | "created";
  sortOrder?: "asc" | "desc";
}

// Settings types
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    document_updates: boolean;
    mentions: boolean;
    shares: boolean;
    comments: boolean;
  };
  editor: {
    theme: "light" | "dark" | "auto";
    font_size: number;
    font_family: string;
    line_height: number;
    auto_save: boolean;
    auto_save_interval: number;
    spell_check: boolean;
  };
  privacy: {
    profile_visibility: "public" | "private";
    show_email: boolean;
    show_activity: boolean;
  };
}

// Theme types
export type Theme = "light" | "dark" | "system";

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Utility types
export type Modify<T, R> = Omit<T, keyof R> & R;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// Event types
export interface DocumentEvent {
  type: "created" | "updated" | "deleted" | "shared" | "unshared";
  document: Document;
  user: User;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserEvent {
  type: "login" | "logout" | "register" | "profile_updated";
  user: User;
  timestamp: string;
  metadata?: Record<string, any>;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface NotificationMessage extends WebSocketMessage {
  type: "notification";
  data: Notification;
}

export interface DocumentUpdateMessage extends WebSocketMessage {
  type: "document_update";
  data: {
    document_id: string;
    content: string;
    user: User;
  };
}

// Export all types
export type {
  // Re-export common React types for convenience
  FC,
  ReactNode,
  ComponentProps,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";