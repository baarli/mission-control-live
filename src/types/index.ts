/* ============================================
   MISSION CONTROL - TYPES
   ============================================ */

export * from './agent';

// Theme
export type Theme = 'dark' | 'light' | 'system';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

// Toast
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

// Category
export type Category = 
  | 'TALK' 
  | 'REALITY_TV' 
  | 'KJENDIS_DRAMA' 
  | 'FILM_TV' 
  | 'MUSIKK' 
  | 'INTERNASJONALT';

// Sak (Agenda Item)
export interface Sak {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  category: Category;
  link_url?: string;
  show_date: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  status?: string;
  priority?: string;
  entertainmentScore?: number;
  tags?: string[];
  assignee?: string;
}

// Search Result
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at?: string;
  score?: number;
  category?: Category;
  thumbnail?: string;
  entertainmentScore?: number;
}

// Nielsen Stats
export interface NielsenMetric {
  id: string;
  channel: string;
  metric_type: string;
  value: number;
  week_start: string;
  created_at: string;
}

// Podcast Stats
export interface PodcastMetric {
  id: string;
  podcast_title: string;
  rank: number;
  total_listens?: number;
  week_start: string;
  created_at: string;
}

// Chart Data
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

// Metric Status
export type MetricStatus = 'success' | 'warning' | 'error' | 'neutral';

// Metric
export interface Metric {
  id: string;
  label: string;
  value: number;
  status: MetricStatus;
  change?: number;
}

// Mission
export type Mission = {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  tags: string[];
  assigned_to: string[] | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

// Dashboard Data
export interface DashboardData {
  metrics: Metric[];
  missions: Mission[];
}

// Stat Card Data
export interface StatData {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon: string;
  variant?: 'default' | 'success' | 'info';
}

// Navigation Item
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// Search History
export interface SearchHistoryItem {
  query: string;
  category?: string;
  timestamp: number;
}

// Button Variants
export type ButtonVariant = 'primary' | 'success' | 'danger' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Input Types
export type InputType = 'text' | 'password' | 'email' | 'number' | 'date' | 'textarea';

// Badge Variants
export type BadgeVariant = 'default' | 'reality' | 'kjendis' | 'film' | 'musikk' | 'internasjonalt' | 'talk';

// API Configuration
export interface ApiConfig {
  supabaseUrl: string;
  supabaseKey: string;
  tenantId: string;
}
