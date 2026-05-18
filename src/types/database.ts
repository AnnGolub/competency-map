export type DesignerRole = "junior" | "middle" | "senior" | "lead";
export type CompetencyBlock = "leadership" | "hard" | "soft";
export type UserRole = "lead" | "admin";

export type Database = {
  public: {
    Tables: {
      designers: {
        Row: {
          id: string;
          name: string;
          role: DesignerRole;
          direction: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: DesignerRole;
          direction: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: DesignerRole;
          direction?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      competencies: {
        Row: {
          id: string;
          block: CompetencyBlock;
          title: string;
          description: string;
          expected_junior: number;
          expected_middle: number;
          expected_senior: number;
          expected_lead: number;
          expected_pre_lead: number;
          indicators_1: string | null;
          indicators_2: string | null;
          indicators_3: string | null;
          indicators_4: string | null;
        };
        Insert: {
          id?: string;
          block: CompetencyBlock;
          title: string;
          description?: string;
          expected_junior: number;
          expected_middle: number;
          expected_senior: number;
          expected_lead: number;
          expected_pre_lead?: number;
          indicators_1?: string | null;
          indicators_2?: string | null;
          indicators_3?: string | null;
          indicators_4?: string | null;
        };
        Update: {
          id?: string;
          block?: CompetencyBlock;
          title?: string;
          description?: string;
          expected_junior?: number;
          expected_middle?: number;
          expected_senior?: number;
          expected_lead?: number;
          expected_pre_lead?: number;
          indicators_1?: string | null;
          indicators_2?: string | null;
          indicators_3?: string | null;
          indicators_4?: string | null;
        };
        Relationships: [];
      };
      competency_items: {
        Row: {
          id: string;
          competency_id: string;
          text: string;
          only_lead: boolean;
        };
        Insert: {
          id?: string;
          competency_id: string;
          text: string;
          only_lead?: boolean;
        };
        Update: {
          id?: string;
          competency_id?: string;
          text?: string;
          only_lead?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "competency_items_competency_id_fkey";
            columns: ["competency_id"];
            referencedRelation: "competencies";
            referencedColumns: ["id"];
          },
        ];
      };
      scores: {
        Row: {
          id: string;
          designer_id: string;
          competency_id: string;
          score: number;
          comment: string;
          reviewed_at: string;
          reviewed_by: string;
        };
        Insert: {
          id?: string;
          designer_id: string;
          competency_id: string;
          score: number;
          comment?: string;
          reviewed_at?: string;
          reviewed_by: string;
        };
        Update: {
          id?: string;
          designer_id?: string;
          competency_id?: string;
          score?: number;
          comment?: string;
          reviewed_at?: string;
          reviewed_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scores_designer_id_fkey";
            columns: ["designer_id"];
            referencedRelation: "designers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scores_competency_id_fkey";
            columns: ["competency_id"];
            referencedRelation: "competencies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scores_reviewed_by_fkey";
            columns: ["reviewed_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
        };
        Insert: {
          id: string;
          email: string;
          role: UserRole;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_lead_or_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
