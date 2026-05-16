import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export type AppUser = {
  id: string;
  email: string;
  role: UserRole;
};

export { hasAppAccess } from "@/lib/auth-utils";

export async function getAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAppUser(): Promise<AppUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return profile;
}
