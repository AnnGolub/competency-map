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
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: DesignerRole;
          direction: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: DesignerRole;
          direction?: string;
          email?: string | null;
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
          expected_junior: number | null;
          expected_middle: number | null;
          expected_senior: number | null;
          expected_lead: number | null;
        };
        Insert: {
          id?: string;
          competency_id: string;
          text: string;
          only_lead?: boolean;
          expected_junior?: number | null;
          expected_middle?: number | null;
          expected_senior?: number | null;
          expected_lead?: number | null;
        };
        Update: {
          id?: string;
          competency_id?: string;
          text?: string;
          only_lead?: boolean;
          expected_junior?: number | null;
          expected_middle?: number | null;
          expected_senior?: number | null;
          expected_lead?: number | null;
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
      item_scores: {
        Row: {
          id: string;
          designer_id: string;
          competency_item_id: string;
          score: number | null;
          self_score: number | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          designer_id: string;
          competency_item_id: string;
          score?: number | null;
          self_score?: number | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          id?: string;
          designer_id?: string;
          competency_item_id?: string;
          score?: number | null;
          self_score?: number | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "item_scores_designer_id_fkey";
            columns: ["designer_id"];
            referencedRelation: "designers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "item_scores_competency_item_id_fkey";
            columns: ["competency_item_id"];
            referencedRelation: "competency_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "item_scores_reviewed_by_fkey";
            columns: ["reviewed_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      scores: {
        Row: {
          id: string;
          designer_id: string;
          competency_id: string;
          score: number | null;
          self_score: number | null;
          comment: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          designer_id: string;
          competency_id: string;
          score?: number | null;
          self_score?: number | null;
          comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          id?: string;
          designer_id?: string;
          competency_id?: string;
          score?: number | null;
          self_score?: number | null;
          comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
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
      self_review_tokens: {
        Row: {
          id: string;
          designer_id: string;
          token: string;
          expires_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          designer_id: string;
          token: string;
          expires_at: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          designer_id?: string;
          token?: string;
          expires_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "self_review_tokens_designer_id_fkey";
            columns: ["designer_id"];
            referencedRelation: "designers";
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
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_own_designer: {
        Args: { designer_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
