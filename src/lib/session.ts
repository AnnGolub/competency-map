import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth-utils";
import type { UserRole } from "@/types/database";

export type SessionContext = {
  userId: string;
  email: string;
  userRole: UserRole | undefined;
  isAdmin: boolean;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const userRole = profile?.role as UserRole | undefined;

  return {
    userId: user.id,
    email: user.email,
    userRole,
    isAdmin: isAdminUser(userRole),
  };
}

export function canAccessDesignerProfile(session: SessionContext): boolean {
  return session.isAdmin;
}
