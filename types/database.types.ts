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
          description: string | null
          document_url: string | null
          money: number
          plan: string
          user: string | null
          uuid: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          document_url?: string | null
          money?: number
          plan: string
          user?: string | null
          uuid?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          document_url?: string | null
          money?: number
          plan?: string
          user?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cost_registration_plan_fkey'
            columns: ['plan']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['uuid']
          },
        ]
      }
      plan_dependencies: {
        Row: {
          created_by: string
          depends_on: string
          plan: string
          uuid: string
        }
        Insert: {
          created_by?: string
          depends_on: string
          plan: string
          uuid?: string
        }
        Update: {
          created_by?: string
          depends_on?: string
          plan?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plan_dependencies_depends_on_uuid_fkey'
            columns: ['depends_on']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['uuid']
          },
          {
            foreignKeyName: 'plan_dependencies_plan_uuid_fkey'
            columns: ['plan']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['uuid']
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
          documentation_url: string | null
          done: boolean
          done_date: string | null
          id: number
          manhours_required: number | null
          nanoid: string | null
          parent: string | null
          priority: number
          title: string | null
          uuid: string
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
          documentation_url?: string | null
          done?: boolean
          done_date?: string | null
          id?: number
          manhours_required?: number | null
          nanoid?: string | null
          parent?: string | null
          priority: number
          title?: string | null
          uuid?: string
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
          documentation_url?: string | null
          done?: boolean
          done_date?: string | null
          id?: number
          manhours_required?: number | null
          nanoid?: string | null
          parent?: string | null
          priority?: number
          title?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plans_parent_fkey'
            columns: ['parent']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['uuid']
          },
        ]
      }
      time_registration: {
        Row: {
          created_at: string
          description: string | null
          hours: number
          plan: string
          user: string | null
          uuid: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hours?: number
          plan: string
          user?: string | null
          uuid?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hours?: number
          plan?: string
          user?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: 'time_registration_plan_uuid_fkey'
            columns: ['plan']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['uuid']
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

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
    Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
    DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema['Enums']
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema['CompositeTypes']
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
