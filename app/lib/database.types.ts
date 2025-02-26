export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      quiz_results: {
        Row: {
          id: number
          created_at: string
          initials: string
          email: string
          score: number
          age_group: string
        }
        Insert: {
          id?: number
          created_at?: string
          initials: string
          email: string
          score: number
          age_group: string
        }
        Update: {
          id?: number
          created_at?: string
          initials?: string
          email?: string
          score?: number
          age_group?: string
        }
      }
    }
  }
} 