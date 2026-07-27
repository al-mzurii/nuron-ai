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
      profiles: {
        Row: {
          id: string; // references auth.users
          role: 'student' | 'educator' | 'scholar' | 'admin';
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          badge_tier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'student' | 'educator' | 'scholar' | 'admin';
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          badge_tier?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: 'student' | 'educator' | 'scholar' | 'admin';
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          badge_tier?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tool_usage_logs: {
        Row: {
          id: number;
          user_id: string;
          tool_name: string;
          used_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          tool_name: string;
          used_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          tool_name?: string;
          used_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tool_usage_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: 'student' | 'educator' | 'scholar' | 'admin';
      subscription_tier: 'free' | 'pro' | 'enterprise';
      badge_tier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
    };
  };
}
