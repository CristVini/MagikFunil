// Tipos gerados do Supabase (base - depois substituir por `supabase gen types`)
// Execute: npm run db:generate

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          primary_color: string | null;
          secondary_color: string | null;
          accent_color: string | null;
          logo_url: string | null;
          headline: string | null;
          subheadline: string | null;
          cta_text: string | null;
          whatsapp: string | null;
          status: 'active' | 'paused' | 'blocked_billing';
          template_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
      };
      templates: {
        Row: {
          id: string;
          slug: string;
          name: string;
          niche: string;
          description: string | null;
          version: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['templates']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['templates']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          template_id: string;
          name: string;
          archetype: string;
          description: string;
          scientific_basis: string;
          expected_effect: string;
          references: string[] | null;
          notes: string[] | null;
          color: string;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      quiz_questions: {
        Row: {
          id: string;
          template_id: string;
          text: string;
          position: number;
          weight: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['quiz_questions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['quiz_questions']['Insert']>;
      };
      quiz_options: {
        Row: {
          id: string;
          question_id: string;
          text: string;
          profile_ids: string[];
          position: number;
        };
        Insert: Omit<Database['public']['Tables']['quiz_options']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['quiz_options']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          template_id: string;
          name: string;
          category: string;
          description: string | null;
          key_actives: Json | null;
          image_url: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      template_profile_products: {
        Row: {
          id: string;
          template_id: string;
          profile_id: string;
          product_id: string;
          position: number;
          is_primary: boolean;
        };
        Insert: Omit<Database['public']['Tables']['template_profile_products']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['template_profile_products']['Insert']>;
      };
      tenant_products: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          redirect_url: string;
          enabled: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tenant_products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tenant_products']['Insert']>;
      };
      plans: {
        Row: {
          id: string;
          slug: string;
          name: string;
          price_monthly_cents: number;
          dashboard_level: 'basic' | 'advanced' | 'decision';
          max_products: number | null;
          max_clicks_month: number | null;
          custom_domain: boolean;
          multi_user: boolean;
          brand_free: boolean;
          support_level: 'standard' | 'priority' | 'dedicated';
          trial_days: number;
          position: number;
        };
        Insert: Omit<Database['public']['Tables']['plans']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['plans']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          tenant_id: string;
          plan_id: string;
          status: 'trial' | 'active' | 'past_due' | 'paused' | 'canceled';
          current_period_start: string | null;
          current_period_end: string | null;
          canceled_at: string | null;
          provider: string;
          provider_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          tenant_id: string;
          lead_id: string | null;
          kind: string;
          product_id: string | null;
          profile_id: string | null;
          source_url: string | null;
          referrer: string | null;
          payload: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      leads: {
        Row: {
          id: string;
          tenant_id: string;
          name: string | null;
          phone: string | null;
          winning_profile: string | null;
          secondary_profile: string | null;
          answers: Json | null;
          source_url: string | null;
          status: 'new' | 'contacted' | 'won' | 'lost';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      billing_events: {
        Row: {
          id: string;
          tenant_id: string;
          subscription_id: string | null;
          kind: string;
          amount_cents: number | null;
          provider: string | null;
          provider_event_id: string | null;
          payload: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['billing_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['billing_events']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      tenant_status: 'active' | 'paused' | 'blocked_billing';
      subscription_status: 'trial' | 'active' | 'past_due' | 'paused' | 'canceled';
      plan_dashboard_level: 'basic' | 'advanced' | 'decision';
      support_level: 'standard' | 'priority' | 'dedicated';
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type Tenant = Tables<'tenants'>;
export type Template = Tables<'templates'>;
export type Profile = Tables<'profiles'>;
export type QuizQuestion = Tables<'quiz_questions'>;
export type QuizOption = Tables<'quiz_options'>;
export type Product = Tables<'products'>;
export type TemplateProfileProduct = Tables<'template_profile_products'>;
export type TenantProduct = Tables<'tenant_products'>;
export type Plan = Tables<'plans'>;
export type Subscription = Tables<'subscriptions'>;
export type Event = Tables<'events'>;
export type Lead = Tables<'leads'>;
export type BillingEvent = Tables<'billing_events'>;