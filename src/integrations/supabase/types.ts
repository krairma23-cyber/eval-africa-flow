export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          created_at: string
          id: string
          request_type: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_type: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_type?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: unknown
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          id: string
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          endpoint: string
          first_attempt: string | null
          id: string
          ip_address: unknown
          last_attempt: string | null
        }
        Insert: {
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          endpoint: string
          first_attempt?: string | null
          id?: string
          ip_address: unknown
          last_attempt?: string | null
        }
        Update: {
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          endpoint?: string
          first_attempt?: string | null
          id?: string
          ip_address?: unknown
          last_attempt?: string | null
        }
        Relationships: []
      }
      comprehensive_audit_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          ip_address: unknown | null
          request_data: Json | null
          resource_id: string | null
          resource_type: string
          response_data: Json | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          ip_address?: unknown | null
          request_data?: Json | null
          resource_id?: string | null
          resource_type: string
          response_data?: Json | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          ip_address?: unknown | null
          request_data?: Json | null
          resource_id?: string | null
          resource_type?: string
          response_data?: Json | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          nom: string
          prenom: string
          sujet: string
          telephone: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          nom: string
          prenom: string
          sujet: string
          telephone: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          nom?: string
          prenom?: string
          sujet?: string
          telephone?: string
        }
        Relationships: []
      }
      contact_rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          email: string | null
          id: string
          ip_address: unknown
          last_submission: string | null
          submission_count: number | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address: unknown
          last_submission?: string | null
          submission_count?: number | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown
          last_submission?: string | null
          submission_count?: number | null
        }
        Relationships: []
      }
      data_access_logs: {
        Row: {
          access_type: string
          accessed_by: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          justification: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_by?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          justification?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_by?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          justification?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      encrypted_contact_data: {
        Row: {
          contact_id: string | null
          created_at: string | null
          encrypted_data: string
          encryption_key_id: string
          id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          encrypted_data: string
          encryption_key_id: string
          id?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          encrypted_data?: string
          encryption_key_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_contact_data_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      encrypted_customer_data: {
        Row: {
          accessed_count: number | null
          created_at: string
          data_retention_until: string | null
          encrypted_additional_data: string | null
          encrypted_nom: string | null
          encrypted_telephone: string | null
          encryption_key_id: string
          id: string
          inscription_id: string | null
          last_accessed_at: string | null
        }
        Insert: {
          accessed_count?: number | null
          created_at?: string
          data_retention_until?: string | null
          encrypted_additional_data?: string | null
          encrypted_nom?: string | null
          encrypted_telephone?: string | null
          encryption_key_id?: string
          id?: string
          inscription_id?: string | null
          last_accessed_at?: string | null
        }
        Update: {
          accessed_count?: number | null
          created_at?: string
          data_retention_until?: string | null
          encrypted_additional_data?: string | null
          encrypted_nom?: string | null
          encrypted_telephone?: string | null
          encryption_key_id?: string
          id?: string
          inscription_id?: string | null
          last_accessed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_customer_data_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "inscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      Evenement: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      "Gestion des évaluations": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      inscriptions: {
        Row: {
          consent_given: boolean | null
          created_at: string
          created_from_ip: unknown | null
          data_encrypted: boolean | null
          email: string
          gdpr_compliant: boolean | null
          id: string
          nom: string
          telephone: string
        }
        Insert: {
          consent_given?: boolean | null
          created_at?: string
          created_from_ip?: unknown | null
          data_encrypted?: boolean | null
          email: string
          gdpr_compliant?: boolean | null
          id?: string
          nom: string
          telephone: string
        }
        Update: {
          consent_given?: boolean | null
          created_at?: string
          created_from_ip?: unknown | null
          data_encrypted?: boolean | null
          email?: string
          gdpr_compliant?: boolean | null
          id?: string
          nom?: string
          telephone?: string
        }
        Relationships: []
      }
      ip_access_control: {
        Row: {
          access_type: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          reason: string | null
        }
        Insert: {
          access_type: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address: unknown
          reason?: string | null
        }
        Update: {
          access_type?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          reason?: string | null
        }
        Relationships: []
      }
      "mini SaaS": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          status: string | null
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          name: string
          sector: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
          sector?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
          sector?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_security_logs: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          fraud_score: number | null
          id: string
          ip_address: unknown | null
          payment_reference: string | null
          security_flags: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          payment_reference?: string | null
          security_flags?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          payment_reference?: string | null
          security_flags?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      Portfolio: {
        Row: {
          created_at: string
          id: number
          metadata_encrypted: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          metadata_encrypted?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          metadata_encrypted?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      "Portfolio KraK": {
        Row: {
          admi: number[] | null
          created_at: string
          id: number
        }
        Insert: {
          admi?: number[] | null
          created_at?: string
          id?: number
        }
        Update: {
          admi?: number[] | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          owner_id: string
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          owner_id: string
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_violations: {
        Row: {
          blocked_until: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown
          metadata: Json | null
          violation_count: number
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address: unknown
          metadata?: Json | null
          violation_count?: number
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          violation_count?: number
        }
        Relationships: []
      }
      registration_rate_limits: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string
          email: string
          first_attempt: string
          id: string
          ip_address: unknown
          last_attempt: string
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string
          email: string
          first_attempt?: string
          id?: string
          ip_address: unknown
          last_attempt?: string
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string
          email?: string
          first_attempt?: string
          id?: string
          ip_address?: unknown
          last_attempt?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          created_by: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          org_id: string
          scheduled_at: string
          service_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          org_id: string
          scheduled_at: string
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          scheduled_at?: string
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_otp_sessions: {
        Row: {
          attempts: number | null
          created_at: string | null
          expires_at: string
          id: string
          max_attempts: number | null
          otp_hash: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          expires_at: string
          id?: string
          max_attempts?: number | null
          otp_hash: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          max_attempts?: number | null
          otp_hash?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          created_at: string
          details: Json | null
          endpoint: string | null
          id: string
          incident_type: string
          ip_address: unknown | null
          resolved: boolean
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          endpoint?: string | null
          id?: string
          incident_type: string
          ip_address?: unknown | null
          resolved?: boolean
          severity: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          endpoint?: string | null
          id?: string
          incident_type?: string
          ip_address?: unknown | null
          resolved?: boolean
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          endpoint: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          endpoint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          endpoint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          description: string | null
          id: string
          name: string
          org_id: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name: string
          org_id: string
          price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      TICKET: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_search_customers: {
        Args: { search_term?: string }
        Returns: {
          customer_id: string
          masked_email: string
          masked_name: string
          masked_phone: string
          registration_date: string
        }[]
      }
      apply_standard_rls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      automated_security_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_api_rate_limit: {
        Args: {
          p_endpoint: string
          p_ip: unknown
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_auth_rate_limit: {
        Args: { p_endpoint: string; p_ip: unknown; p_max_attempts?: number }
        Returns: boolean
      }
      check_enhanced_rate_limit: {
        Args:
          | { p_email?: string; p_ip: unknown }
          | {
              p_endpoint: string
              p_ip: unknown
              p_max_requests?: number
              p_user_id?: string
              p_window_minutes?: number
            }
        Returns: Json
      }
      check_password_breach: {
        Args: { p_password: string }
        Returns: Json
      }
      check_payment_rate_limit: {
        Args: {
          p_ip_address?: unknown
          p_max_payments?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: Json
      }
      check_rbac_access: {
        Args: { p_action: string; p_resource: string; p_user_id: string }
        Returns: boolean
      }
      check_registration_rate_limit: {
        Args: {
          p_email: string
          p_ip: unknown
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_customer_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_security_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_security_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_secure_otp: {
        Args: { p_otp_plain: string; p_user_id: string }
        Returns: string
      }
      create_secure_otp_v2: {
        Args: { p_otp_plain: string; p_user_id: string }
        Returns: string
      }
      create_secure_session: {
        Args: {
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      decrypt_sensitive_data: {
        Args: { p_encrypted_data: string; p_key_name?: string }
        Returns: string
      }
      detect_suspicious_data_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          alert_type: string
          details: Json
          recommendation: string
          severity: string
        }[]
      }
      emergency_full_access: {
        Args: { business_justification: string; customer_id: string }
        Returns: {
          customer_email: string
          customer_name: string
          customer_phone: string
          registration_date: string
        }[]
      }
      emergency_pii_access: {
        Args: { customer_id: string; justification: string }
        Returns: {
          email: string
          name: string
          phone: string
          registration_date: string
        }[]
      }
      encrypt_sensitive_data: {
        Args: { p_data: string; p_key_name?: string }
        Returns: string
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_users: number
          recent_contacts: number
          total_contacts: number
          total_users: number
        }[]
      }
      get_owner_column: {
        Args: { p_table: unknown }
        Returns: string
      }
      get_public_registration_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          date: string
          registrations: number
        }[]
      }
      get_recent_security_events: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          event_time: string
          event_type: string
          severity: string
          source_table: string
        }[]
      }
      get_rls_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          owner_column: string
          policy_count: number
          rls_enabled: boolean
          table_name: string
        }[]
      }
      get_security_config_recommendations: {
        Args: Record<PropertyKey, never>
        Returns: {
          action_required: string
          current_status: string
          dashboard_location: string
          recommended_value: string
          setting_name: string
        }[]
      }
      get_security_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_updated: string
          metric: string
          status: string
          value: number
        }[]
      }
      get_security_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_updated: string
          metric_name: string
          metric_value: number
          severity: string
        }[]
      }
      get_security_monitoring_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_updated: string
          metric_category: string
          metric_name: string
          metric_value: number
          severity: string
          trend: string
        }[]
      }
      get_security_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_updated: string
          metric_name: string
          metric_value: number
          status: string
        }[]
      }
      get_user_role: {
        Args: { user_id?: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id?: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id?: string }
        Returns: boolean
      }
      log_comprehensive_audit: {
        Args: {
          p_action: string
          p_error_message?: string
          p_execution_time_ms?: number
          p_ip_address?: unknown
          p_request_data?: Json
          p_resource_id?: string
          p_resource_type: string
          p_response_data?: Json
          p_success?: boolean
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      log_payment_security_event: {
        Args: {
          p_amount: number
          p_currency: string
          p_fraud_score?: number
          p_ip_address?: unknown
          p_payment_reference: string
          p_security_flags?: Json
          p_status?: string
          p_user_id: string
        }
        Returns: string
      }
      log_security_incident: {
        Args: {
          p_details?: Json
          p_endpoint?: string
          p_incident_type: string
          p_ip_address?: unknown
          p_severity: string
          p_user_id?: string
        }
        Returns: string
      }
      migrate_to_encrypted_storage: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      run_security_audit: {
        Args: Record<PropertyKey, never>
        Returns: {
          audit_category: string
          check_name: string
          details: string
          risk_level: string
          status: string
        }[]
      }
      safe_to_mark_public: {
        Args: { p_table: unknown }
        Returns: boolean
      }
      secure_admin_access_customer_data: {
        Args: {
          p_access_reason: string
          p_customer_id: string
          p_data_fields?: string[]
        }
        Returns: {
          access_logged: boolean
          created_at: string
          id: string
          masked_email: string
          masked_name: string
          masked_phone: string
        }[]
      }
      secure_admin_search: {
        Args: { search_term?: string }
        Returns: {
          created_at: string
          id: string
          masked_email: string
          masked_name: string
          masked_phone: string
        }[]
      }
      secure_customer_access: {
        Args: { p_inscription_id: string; p_justification: string }
        Returns: {
          created_at: string
          email: string
          id: string
          nom: string
          telephone: string
        }[]
      }
      secure_customer_data_access: {
        Args: {
          p_access_reason: string
          p_customer_id: string
          p_fields_requested?: string[]
        }
        Returns: {
          access_justification: string
          access_logged: boolean
          created_at: string
          id: string
          masked_email: string
          masked_name: string
          masked_phone: string
        }[]
      }
      secure_organization_data_access: {
        Args: { p_access_reason: string; p_org_id: string }
        Returns: {
          access_logged: boolean
          created_at: string
          id: string
          masked_contact_email: string
          name: string
          sector: string
        }[]
      }
      secure_reservation_access: {
        Args: {
          p_justification: string
          p_org_id: string
          p_reservation_id: string
        }
        Returns: {
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          notes: string
          scheduled_at: string
          status: string
        }[]
      }
      security_monitoring: {
        Args: Record<PropertyKey, never>
        Returns: {
          alert_type: string
          count: number
          severity: string
        }[]
      }
      security_status_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          recommendation: string
          security_area: string
          status: string
        }[]
      }
      set_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: undefined
      }
      submit_contact_message: {
        Args: {
          p_email: string
          p_ip_address?: unknown
          p_message: string
          p_nom: string
          p_prenom: string
          p_sujet: string
          p_telephone: string
        }
        Returns: Json
      }
      validate_auth_attempt: {
        Args: {
          p_action?: string
          p_email: string
          p_ip: unknown
          p_password?: string
        }
        Returns: boolean
      }
      validate_contact_submission: {
        Args: { p_email: string; p_ip_address?: unknown; p_message: string }
        Returns: boolean
      }
      validate_password_security: {
        Args: { p_email?: string; p_password: string }
        Returns: Json
      }
      validate_payment_security: {
        Args: {
          p_amount: number
          p_currency: string
          p_ip_address?: unknown
          p_user_id: string
        }
        Returns: Json
      }
      validate_secure_contact_submission: {
        Args: { p_email: string; p_ip?: unknown; p_message: string }
        Returns: boolean
      }
      validate_secure_password: {
        Args: { p_password: string }
        Returns: boolean
      }
      validate_strong_password: {
        Args: { p_password: string }
        Returns: boolean
      }
      verify_secure_otp: {
        Args: { p_otp_id: string; p_otp_plain: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      org_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      org_role: ["owner", "admin", "member"],
    },
  },
} as const
