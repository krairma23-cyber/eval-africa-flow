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
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_current: boolean | null
          name: string
          school_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_current?: boolean | null
          name: string
          school_id: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_current?: boolean | null
          name?: string
          school_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_searches: {
        Row: {
          created_at: string | null
          execution_time_ms: number | null
          id: string
          results_count: number | null
          search_filters: Json | null
          search_query: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          school_id: string | null
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          school_id?: string | null
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          school_id?: string | null
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
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
      assessment_results: {
        Row: {
          assessment_id: string
          comment: string | null
          created_at: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          is_absent: boolean | null
          score: number | null
          student_id: string
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          assessment_id: string
          comment?: string | null
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_absent?: boolean | null
          score?: number | null
          student_id: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          assessment_id?: string
          comment?: string | null
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_absent?: boolean | null
          score?: number | null
          student_id?: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_types: {
        Row: {
          created_at: string | null
          default_coefficient: number | null
          description: string | null
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_coefficient?: number | null
          description?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_coefficient?: number | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_types_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_date: string
          assessment_type_id: string
          classroom_subject_id: string
          coefficient: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          max_score: number
          status: string | null
          term_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assessment_date: string
          assessment_type_id: string
          classroom_subject_id: string
          coefficient?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          max_score?: number
          status?: string | null
          term_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assessment_date?: string
          assessment_type_id?: string
          classroom_subject_id?: string
          coefficient?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          max_score?: number
          status?: string | null
          term_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_assessment_type_id_fkey"
            columns: ["assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_classroom_subject_id_fkey"
            columns: ["classroom_subject_id"]
            isOneToOne: false
            referencedRelation: "classroom_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
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
      beta_feedback: {
        Row: {
          content: string
          created_at: string
          feedback_type: string
          id: string
          metadata: Json | null
          rating: number | null
          status: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feedback_type: string
          id?: string
          metadata?: Json | null
          rating?: number | null
          status?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feedback_type?: string
          id?: string
          metadata?: Json | null
          rating?: number | null
          status?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campuses: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campuses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_subjects: {
        Row: {
          classroom_id: string
          coefficient: number | null
          created_at: string | null
          id: string
          subject_id: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          classroom_id: string
          coefficient?: number | null
          created_at?: string | null
          id?: string
          subject_id: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          classroom_id?: string
          coefficient?: number | null
          created_at?: string | null
          id?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_subjects_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          academic_year_id: string
          campus_id: string
          capacity: number | null
          created_at: string | null
          grade_level_id: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          campus_id: string
          capacity?: number | null
          created_at?: string | null
          grade_level_id: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          campus_id?: string
          capacity?: number | null
          created_at?: string | null
          grade_level_id?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
        ]
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
      conversations: {
        Row: {
          client_id: string
          created_at: string
          id: string
          pme_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          pme_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          pme_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cron_jobs: {
        Row: {
          created_at: string | null
          error_message: string | null
          executed_at: string | null
          execution_time_ms: number | null
          id: string
          job_name: string
          result: Json | null
          status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          job_name: string
          result?: Json | null
          status: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          job_name?: string
          result?: Json | null
          status?: string
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
      disputes: {
        Row: {
          created_at: string
          description: string
          dispute_type: string
          escrow_payment_id: string
          evidence_urls: string[] | null
          id: string
          initiated_by: string
          resolution_amount: number | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          dispute_type: string
          escrow_payment_id: string
          evidence_urls?: string[] | null
          id?: string
          initiated_by: string
          resolution_amount?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          dispute_type?: string
          escrow_payment_id?: string
          evidence_urls?: string[] | null
          id?: string
          initiated_by?: string
          resolution_amount?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_escrow_payment_id_fkey"
            columns: ["escrow_payment_id"]
            isOneToOne: false
            referencedRelation: "escrow_payments"
            referencedColumns: ["id"]
          },
        ]
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
      enrollments: {
        Row: {
          academic_year_id: string
          classroom_id: string
          created_at: string | null
          enrollment_date: string | null
          id: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          classroom_id: string
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          classroom_id?: string
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise: {
        Row: {
          alerts_limit: number | null
          api_calls_limit: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          export_limit: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_monthly: number
          price_yearly: number | null
          searches_limit: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          alerts_limit?: number | null
          api_calls_limit?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          export_limit?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          searches_limit?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          alerts_limit?: number | null
          api_calls_limit?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          export_limit?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          searches_limit?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      escrow_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          held_at: string | null
          id: string
          payment_method: string
          payment_reference: string | null
          refunded_at: string | null
          released_at: string | null
          reservation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          held_at?: string | null
          id?: string
          payment_method: string
          payment_reference?: string | null
          refunded_at?: string | null
          released_at?: string | null
          reservation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          held_at?: string | null
          id?: string
          payment_method?: string
          payment_reference?: string | null
          refunded_at?: string | null
          released_at?: string | null
          reservation_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
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
      event_registrations: {
        Row: {
          created_at: string
          email: string
          event_name: string | null
          eventbrite_order_id: string | null
          eventbrite_ticket_id: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_name?: string | null
          eventbrite_order_id?: string | null
          eventbrite_ticket_id?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_name?: string | null
          eventbrite_order_id?: string | null
          eventbrite_ticket_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          pme_id: string | null
          product_id: string | null
          target_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          pme_id?: string | null
          product_id?: string | null
          target_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          pme_id?: string | null
          product_id?: string | null
          target_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      grade_levels: {
        Row: {
          created_at: string | null
          id: string
          level_order: number
          name: string
          program_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level_order: number
          name: string
          program_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level_order?: number
          name?: string
          program_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_levels_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
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
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
      market_analyses: {
        Row: {
          analysis_data: Json
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string
        }
        Insert: {
          analysis_data: Json
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_analyses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
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
      payment_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          notification_type: string
          payment_id: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          notification_type: string
          payment_id?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          payment_id?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_notifications_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
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
      payments: {
        Row: {
          amount: number
          client_id: string
          completed_at: string | null
          created_at: string
          currency: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          mobile_money_number: string | null
          mobile_money_provider: string | null
          payment_date: string | null
          payment_method: string
          pme_id: string
          reservation_id: string | null
          status: string
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          payment_date?: string | null
          payment_method: string
          pme_id: string
          reservation_id?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          payment_date?: string | null
          payment_method?: string
          pme_id?: string
          reservation_id?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      pme_availability: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_available: boolean | null
          pme_id: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_available?: boolean | null
          pme_id: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          pme_id?: string
          start_time?: string
        }
        Relationships: []
      }
      pme_portfolio: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          pme_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          pme_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          pme_id?: string
        }
        Relationships: []
      }
      pme_reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          id: string
          is_published: boolean | null
          is_verified: boolean | null
          pme_id: string
          rating: number
          reservation_id: string | null
          response: string | null
          response_date: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          pme_id: string
          rating: number
          reservation_id?: string | null
          response?: string | null
          response_date?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          pme_id?: string
          rating?: number
          reservation_id?: string | null
          response?: string | null
          response_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pme_reviews_pme_id_fkey"
            columns: ["pme_id"]
            isOneToOne: false
            referencedRelation: "pmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pme_reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      pme_services: {
        Row: {
          base_price: number | null
          category_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          pme_id: string
          price_type: string | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          category_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          pme_id: string
          price_type?: string | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          category_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          pme_id?: string
          price_type?: string | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pme_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      pmes: {
        Row: {
          address: string | null
          availability_status: string | null
          average_rating: number | null
          business_license: string | null
          business_license_verified: boolean | null
          business_name: string
          city: string | null
          commune: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          id_card_number: string | null
          id_card_verified: boolean | null
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string
          phone_verified: boolean | null
          profile_image_url: string | null
          response_time_minutes: number | null
          review_count: number | null
          total_jobs_completed: number | null
          updated_at: string | null
          user_id: string
          verification_date: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          address?: string | null
          availability_status?: string | null
          average_rating?: number | null
          business_license?: string | null
          business_license_verified?: boolean | null
          business_name: string
          city?: string | null
          commune?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          id_card_number?: string | null
          id_card_verified?: boolean | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone: string
          phone_verified?: boolean | null
          profile_image_url?: string | null
          response_time_minutes?: number | null
          review_count?: number | null
          total_jobs_completed?: number | null
          updated_at?: string | null
          user_id: string
          verification_date?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          address?: string | null
          availability_status?: string | null
          average_rating?: number | null
          business_license?: string | null
          business_license_verified?: boolean | null
          business_name?: string
          city?: string | null
          commune?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          id_card_number?: string | null
          id_card_verified?: boolean | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string
          phone_verified?: boolean | null
          profile_image_url?: string | null
          response_time_minutes?: number | null
          review_count?: number | null
          total_jobs_completed?: number | null
          updated_at?: string | null
          user_id?: string
          verification_date?: string | null
          whatsapp_phone?: string | null
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
      processed_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          processed_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          processed_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          processed_at?: string
        }
        Relationships: []
      }
      product_searches: {
        Row: {
          created_at: string | null
          execution_time_ms: number | null
          filters: Json | null
          id: string
          results_count: number | null
          search_query: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          execution_time_ms?: number | null
          filters?: Json | null
          id?: string
          results_count?: number | null
          search_query: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          execution_time_ms?: number | null
          filters?: Json | null
          id?: string
          results_count?: number | null
          search_query?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          external_id: string
          id: string
          images: string[] | null
          is_favorite: boolean | null
          keywords: string[] | null
          last_updated: string | null
          min_order_quantity: number | null
          platform: string
          potential_margin: number | null
          price: number | null
          sales_count: number | null
          shipping_cost: number | null
          shipping_time_days: number | null
          specifications: Json | null
          stock_quantity: number | null
          subcategory: string | null
          supplier_id: string | null
          title: string
          trend_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id: string
          id?: string
          images?: string[] | null
          is_favorite?: boolean | null
          keywords?: string[] | null
          last_updated?: string | null
          min_order_quantity?: number | null
          platform: string
          potential_margin?: number | null
          price?: number | null
          sales_count?: number | null
          shipping_cost?: number | null
          shipping_time_days?: number | null
          specifications?: Json | null
          stock_quantity?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          title: string
          trend_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string
          id?: string
          images?: string[] | null
          is_favorite?: boolean | null
          keywords?: string[] | null
          last_updated?: string | null
          min_order_quantity?: number | null
          platform?: string
          potential_margin?: number | null
          price?: number | null
          sales_count?: number | null
          shipping_cost?: number | null
          shipping_time_days?: number | null
          specifications?: Json | null
          stock_quantity?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          title?: string
          trend_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          monthly_searches_limit: number | null
          phone: string | null
          school_id: string | null
          searches_count: number | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status: string | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          monthly_searches_limit?: number | null
          phone?: string | null
          school_id?: string | null
          searches_count?: number | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          monthly_searches_limit?: number | null
          phone?: string | null
          school_id?: string | null
          searches_count?: number | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
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
      refund_requests: {
        Row: {
          admin_notes: string | null
          client_id: string
          created_at: string
          evidence_urls: string[] | null
          id: string
          payment_id: string | null
          pme_id: string
          reason: string
          refund_amount: number | null
          reservation_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          client_id: string
          created_at?: string
          evidence_urls?: string[] | null
          id?: string
          payment_id?: string | null
          pme_id: string
          reason: string
          refund_amount?: number | null
          reservation_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          client_id?: string
          created_at?: string
          evidence_urls?: string[] | null
          id?: string
          payment_id?: string | null
          pme_id?: string
          reason?: string
          refund_amount?: number | null
          reservation_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_pme_id_fkey"
            columns: ["pme_id"]
            isOneToOne: false
            referencedRelation: "pmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
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
      report_cards: {
        Row: {
          classroom_id: string
          created_at: string | null
          general_comment: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          overall_average: number | null
          pdf_url: string | null
          rank_in_class: number | null
          student_id: string
          term_id: string
          total_students: number | null
          updated_at: string | null
        }
        Insert: {
          classroom_id: string
          created_at?: string | null
          general_comment?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          overall_average?: number | null
          pdf_url?: string | null
          rank_in_class?: number | null
          student_id: string
          term_id: string
          total_students?: number | null
          updated_at?: string | null
        }
        Update: {
          classroom_id?: string
          created_at?: string | null
          general_comment?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          overall_average?: number | null
          pdf_url?: string | null
          rank_in_class?: number | null
          student_id?: string
          term_id?: string
          total_students?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          description: string
          id: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          reason?: string
          reported_id?: string
          reported_type?: string
          reporter_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          can_release_payment: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_id: string
          client_notes: string | null
          completed_at: string | null
          created_at: string | null
          estimated_duration_minutes: number | null
          id: string
          payment_method: string | null
          payment_status: string | null
          pme_id: string
          pme_notes: string | null
          scheduled_date: string
          scheduled_time: string
          service_confirmed_at: string | null
          service_confirmed_by_client: boolean | null
          service_id: string
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          can_release_payment?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id: string
          client_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          pme_id: string
          pme_notes?: string | null
          scheduled_date: string
          scheduled_time: string
          service_confirmed_at?: string | null
          service_confirmed_by_client?: boolean | null
          service_id: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          can_release_payment?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string
          client_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          pme_id?: string
          pme_notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          service_confirmed_at?: string | null
          service_confirmed_by_client?: boolean | null
          service_id?: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_pme_id_fkey"
            columns: ["pme_id"]
            isOneToOne: false
            referencedRelation: "pmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "pme_services"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          academic_year: string | null
          address: string | null
          admi_yann: number[] | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          address?: string | null
          admi_yann?: number[] | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          address?: string | null
          admi_yann?: number[] | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      security_cleanup_jobs: {
        Row: {
          created_at: string | null
          executed_at: string | null
          execution_time_ms: number | null
          id: string
          job_type: string
          records_cleaned: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          job_type: string
          records_cleaned?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          job_type?: string
          records_cleaned?: number | null
          status?: string | null
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
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
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
      students: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          school_id: string
          student_number: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_id: string
          student_number: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_id?: string
          student_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          alerts_limit: number | null
          api_calls_limit: number | null
          created_at: string | null
          currency: string
          description: string | null
          export_limit: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_monthly: number
          price_yearly: number | null
          searches_limit: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          alerts_limit?: number | null
          api_calls_limit?: number | null
          created_at?: string | null
          currency?: string
          description?: string | null
          export_limit?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_monthly?: number
          price_yearly?: number | null
          searches_limit?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          alerts_limit?: number | null
          api_calls_limit?: number | null
          created_at?: string | null
          currency?: string
          description?: string | null
          export_limit?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          searches_limit?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          api_endpoint: string | null
          contact_info: Json | null
          country: string | null
          created_at: string | null
          id: string
          name: string
          platform: string
          rating: number | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          api_endpoint?: string | null
          contact_info?: Json | null
          country?: string | null
          created_at?: string | null
          id?: string
          name: string
          platform: string
          rating?: number | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          api_endpoint?: string | null
          contact_info?: Json | null
          country?: string | null
          created_at?: string | null
          id?: string
          name?: string
          platform?: string
          rating?: number | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      support_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          published: boolean
          question: string
          updated_at: string
          views: number
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          published?: boolean
          question: string
          updated_at?: string
          views?: number
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          resolved_by: string | null
          school_id: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          school_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          school_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string
          hire_date: string | null
          id: string
          last_name: string
          phone: string | null
          school_id: string
          specialization: string | null
          teacher_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          last_name: string
          phone?: string | null
          school_id: string
          specialization?: string | null
          teacher_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          school_id?: string
          specialization?: string | null
          teacher_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          academic_year_id: string
          created_at: string | null
          end_date: string
          id: string
          is_current: boolean | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          end_date: string
          id?: string
          is_current?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          is_current?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
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
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          payment_method: string
          payment_provider_reference: string | null
          reservation_id: string
          status: string | null
          transaction_reference: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method: string
          payment_provider_reference?: string | null
          reservation_id: string
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string
          payment_provider_reference?: string | null
          reservation_id?: string
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          price_threshold: number | null
          product_keywords: string[] | null
          trend_threshold: number | null
          user_id: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          price_threshold?: number | null
          product_keywords?: string[] | null
          trend_threshold?: number | null
          user_id: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          price_threshold?: number | null
          product_keywords?: string[] | null
          trend_threshold?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          assessment_reminders: boolean
          created_at: string | null
          dark_mode: boolean | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean
          push_notifications: boolean
          report_notifications: boolean
          report_reminders: boolean | null
          system_updates: boolean
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_reminders?: boolean
          created_at?: string | null
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean
          push_notifications?: boolean
          report_notifications?: boolean
          report_reminders?: boolean | null
          system_updates?: boolean
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_reminders?: boolean
          created_at?: string | null
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean
          push_notifications?: boolean
          report_notifications?: boolean
          report_reminders?: boolean | null
          system_updates?: boolean
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_products: {
        Row: {
          created_at: string | null
          id: string
          is_favorite: boolean | null
          minimum_order_quantity: number | null
          platform_name: string
          price_usd: number | null
          product_title: string
          product_url: string | null
          profit_margin: number | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["product_status"] | null
          supplier_name: string | null
          tags: string[] | null
          trend_score: number | null
          updated_at: string | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          minimum_order_quantity?: number | null
          platform_name: string
          price_usd?: number | null
          product_title: string
          product_url?: string | null
          profit_margin?: number | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          supplier_name?: string | null
          tags?: string[] | null
          trend_score?: number | null
          updated_at?: string | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          minimum_order_quantity?: number | null
          platform_name?: string
          price_usd?: number | null
          product_title?: string
          product_url?: string | null
          profit_margin?: number | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          supplier_name?: string | null
          tags?: string[] | null
          trend_score?: number | null
          updated_at?: string | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
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
      user_subscriptions: {
        Row: {
          billing_period: string
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_period?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_period?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "enterprise"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          pme_id: string
          rejection_reason: string | null
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          pme_id: string
          rejection_reason?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          pme_id?: string
          rejection_reason?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_pme_id_fkey"
            columns: ["pme_id"]
            isOneToOne: false
            referencedRelation: "pmes"
            referencedColumns: ["id"]
          },
        ]
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
      check_admin_access_rate_limit: {
        Args: {
          p_admin_id: string
          p_max_accesses?: number
          p_table_name: string
          p_window_minutes?: number
        }
        Returns: boolean
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
              p_ip_address: unknown
              p_max_requests?: number
              p_user_id?: string
              p_window_minutes?: number
            }
        Returns: boolean
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
      check_payment_security: {
        Args: { p_amount: number; p_ip_address?: unknown; p_user_id: string }
        Returns: Json
      }
      check_product_search_limit: {
        Args: { p_user_id: string }
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
      check_search_limit: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      cleanup_expired_customer_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_contact_messages: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_cron_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_event_registrations: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
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
      get_current_user_school_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_enhanced_security_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_updated: string
          metric_name: string
          metric_value: number
          recommendation: string
          severity: string
        }[]
      }
      get_feedback_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_rating: number
          feedback_by_type: Json
          open_feedback: number
          resolved_feedback: number
          total_feedback: number
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
      get_secure_student_data: {
        Args: { p_student_id: string }
        Returns: {
          address: string
          created_at: string
          date_of_birth: string
          first_name: string
          gender: string
          id: string
          last_name: string
          parent_email: string
          parent_name: string
          parent_phone: string
          school_id: string
          student_number: string
          updated_at: string
        }[]
      }
      get_secure_teacher_data: {
        Args: { p_teacher_id: string }
        Returns: {
          created_at: string
          email: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string
          school_id: string
          specialization: string
          teacher_number: string
          updated_at: string
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
          recommendation: string
          severity: string
          trend: string
        }[]
      }
      get_security_dashboard_summary: {
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
      get_student_data_secure: {
        Args: { p_access_reason: string; p_student_id: string }
        Returns: {
          access_level: string
          address: string
          data_masked: boolean
          date_of_birth: string
          first_name: string
          gender: string
          id: string
          last_name: string
          parent_email: string
          parent_name: string
          parent_phone: string
          school_id: string
          student_number: string
        }[]
      }
      get_student_limited_access: {
        Args: { p_student_id: string }
        Returns: {
          access_level: string
          address: string
          date_of_birth: string
          first_name: string
          gender: string
          id: string
          last_name: string
          parent_email: string
          parent_name: string
          parent_phone: string
          school_id: string
          student_number: string
        }[]
      }
      get_students_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          created_at: string
          date_of_birth: string
          first_name: string
          gender: string
          id: string
          last_name: string
          parent_email: string
          parent_name: string
          parent_phone: string
          school_id: string
          student_number: string
          updated_at: string
        }[]
      }
      get_teacher_basic_info: {
        Args: { p_school_id: string }
        Returns: {
          first_name: string
          id: string
          last_name: string
          specialization: string
          teacher_number: string
        }[]
      }
      get_teacher_data_secure: {
        Args: { p_access_reason: string; p_teacher_id: string }
        Returns: {
          access_level: string
          data_masked: boolean
          email: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string
          school_id: string
          specialization: string
          teacher_number: string
        }[]
      }
      get_teacher_limited_access: {
        Args: { p_teacher_id: string }
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          school_id: string
          specialization: string
          teacher_number: string
        }[]
      }
      get_teachers_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string
          school_id: string
          specialization: string
          teacher_number: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_id?: string }
        Returns: string
      }
      get_user_school_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_usage_stats: {
        Args: { p_user_id: string }
        Returns: {
          api_calls_limit: number
          api_calls_used: number
          current_plan: string
          searches_limit: number
          searches_used: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { p_org_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { p_org_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_school_admin: {
        Args: { p_school_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_teacher: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      log_comprehensive_audit: {
        Args: {
          p_action: string
          p_error_message: string
          p_execution_time_ms: number
          p_ip_address: unknown
          p_request_data: Json
          p_resource_id: string
          p_resource_type: string
          p_response_data: Json
          p_success: boolean
          p_user_agent: string
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
      log_security_cleanup: {
        Args: {
          p_execution_time_ms?: number
          p_job_type: string
          p_records_cleaned: number
        }
        Returns: string
      }
      log_security_incident: {
        Args: {
          p_details: Json
          p_incident_type: string
          p_ip_address: unknown
          p_resource_accessed: string
          p_severity: string
          p_user_id: string
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_action_details?: Json
          p_action_type: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      migrate_to_encrypted_storage: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_webhook_event: {
        Args: { p_event_id: string; p_event_type: string }
        Returns: boolean
      }
      remind_enable_password_protection: {
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
      secure_contact_data_access: {
        Args: {
          p_access_reason: string
          p_contact_id: string
          p_fields_requested?: string[]
        }
        Returns: {
          access_logged: boolean
          created_at: string
          id: string
          masked_email: string
          masked_nom: string
          sujet: string
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
      secure_customer_data_access_v2: {
        Args: { p_access_reason: string; p_customer_id: string }
        Returns: {
          access_logged: boolean
          created_at: string
          id: string
          masked_email: string
          masked_name: string
          masked_phone: string
        }[]
      }
      secure_event_registration_access: {
        Args: { p_access_reason: string; p_registration_id: string }
        Returns: {
          access_logged: boolean
          created_at: string
          event_name: string
          id: string
          masked_email: string
          masked_first_name: string
          masked_last_name: string
          masked_phone: string
        }[]
      }
      secure_migrate_customer_data: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      track_sensitive_data_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          access_count: number
          access_date: string
          table_name: string
          unique_users: number
        }[]
      }
      user_belongs_to_school: {
        Args: { school_uuid: string }
        Returns: boolean
      }
      user_teaches_student: {
        Args: { p_student_id: string; p_teacher_user_id?: string }
        Returns: boolean
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
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
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
      alert_type: "price_drop" | "trend_spike" | "new_winner" | "competition"
      app_role: "admin" | "moderator" | "user"
      org_role: "owner" | "admin" | "member"
      pme_category:
        | "agriculture"
        | "artisanat"
        | "batiment_construction"
        | "commerce"
        | "education_formation"
        | "hotellerie_restauration"
        | "industrie_manufacturiere"
        | "sante_social"
        | "services_professionnels"
        | "technologie_informatique"
        | "transport_logistique"
        | "autre"
      product_status: "active" | "trending" | "declining" | "watchlist"
      subscription_plan: "starter" | "pro" | "enterprise"
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
      alert_type: ["price_drop", "trend_spike", "new_winner", "competition"],
      app_role: ["admin", "moderator", "user"],
      org_role: ["owner", "admin", "member"],
      pme_category: [
        "agriculture",
        "artisanat",
        "batiment_construction",
        "commerce",
        "education_formation",
        "hotellerie_restauration",
        "industrie_manufacturiere",
        "sante_social",
        "services_professionnels",
        "technologie_informatique",
        "transport_logistique",
        "autre",
      ],
      product_status: ["active", "trending", "declining", "watchlist"],
      subscription_plan: ["starter", "pro", "enterprise"],
    },
  },
} as const
