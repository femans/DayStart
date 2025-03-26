export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cost_registration: {
        Row: {
          created_at: string
          currency: string | null
          id: number
          money: number
          plan: number
          user: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: number
          money?: number
          plan: number
          user?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: number
          money?: number
          plan?: number
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'cost_registration_plan_fkey'
            columns: ['plan']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
        ]
      }
      plan_dependencies: {
        Row: {
          created_by: string
          depends_on: number
          id: number
          plan: number
        }
        Insert: {
          created_by?: string
          depends_on: number
          id?: number
          plan: number
        }
        Update: {
          created_by?: string
          depends_on?: number
          id?: number
          plan?: number
        }
        Relationships: [
          {
            foreignKeyName: 'plan_dependencies_depends_on_fkey'
            columns: ['depends_on']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'plan_dependencies_plan_fkey'
            columns: ['plan']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
        ]
      }
      plans: {
        Row: {
          archived: boolean
          archived_date: string | null
          assigned_by: string | null
          assignee_id: string
          budget: number | null
          created_at: string
          created_by: string
          definition_of_done: string | null
          done: boolean
          done_date: string | null
          id: number
          manhours_required: number | null
          parent_id: number | null
          priority: number
          title: string | null
        }
        Insert: {
          archived?: boolean
          archived_date?: string | null
          assigned_by?: string | null
          assignee_id: string
          budget?: number | null
          created_at?: string
          created_by?: string
          definition_of_done?: string | null
          done?: boolean
          done_date?: string | null
          id?: number
          manhours_required?: number | null
          parent_id?: number | null
          priority: number
          title?: string | null
        }
        Update: {
          archived?: boolean
          archived_date?: string | null
          assigned_by?: string | null
          assignee_id?: string
          budget?: number | null
          created_at?: string
          created_by?: string
          definition_of_done?: string | null
          done?: boolean
          done_date?: string | null
          id?: number
          manhours_required?: number | null
          parent_id?: number | null
          priority?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'Plans_parent_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
        ]
      }
      time_registration: {
        Row: {
          created_at: string
          hours: number
          id: number
          plan: number
          user: string | null
        }
        Insert: {
          created_at?: string
          hours?: number
          id?: number
          plan: number
          user?: string | null
        }
        Update: {
          created_at?: string
          hours?: number
          id?: number
          plan?: number
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'time_registration_plan_fkey'
            columns: ['plan']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
    PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
      PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema['CompositeTypes']
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
