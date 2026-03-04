export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      missions: {
        Row: {
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
        Insert: {
          id?: string;
          name: string;
          description?: string;
          status?: string;
          priority?: string;
          progress?: number;
          tags?: string[];
          assigned_to?: string[] | null;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          status?: string;
          priority?: string;
          progress?: number;
          tags?: string[];
          assigned_to?: string[] | null;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          role: string;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name: string;
          role?: string;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          role?: string;
          avatar?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      mission_status: 'pending' | 'active' | 'completed' | 'cancelled' | 'on_hold';
      priority: 'low' | 'medium' | 'high' | 'critical';
      user_role: 'admin' | 'manager' | 'member' | 'viewer';
    };
  };
}

// Extended types for API usage
export interface CreateMissionInput extends Omit<Database['public']['Tables']['missions']['Insert'], 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateMissionInput extends Partial<CreateMissionInput> {}
