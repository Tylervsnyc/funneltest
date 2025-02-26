export type Database = {
  public: {
    Tables: {
      quiz_results: {
        Row: {
          id: number
          created_at: string
          initials: string
          email: string
          score: number
          age_group: '4-5' | '6-7' | '8-9' | 'adult'
        }
        Insert: {
          id?: number
          created_at?: string
          initials: string
          email: string
          score: number
          age_group: '4-5' | '6-7' | '8-9' | 'adult'
        }
        Update: {
          id?: number
          created_at?: string
          initials?: string
          email?: string
          score?: number
          age_group?: '4-5' | '6-7' | '8-9' | 'adult'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 