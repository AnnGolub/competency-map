"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/session";
import type { DesignerRole } from "@/types/database";

export type DesignerFormData = {
  id?: string;
  name: string;
  role: DesignerRole;
  direction: string;
  email: string;
};

export async function saveDesigner(
  data: DesignerFormData
): Promise<{ error?: string }> {
  const session = await getSessionContext();
  if (!session?.isAdmin) {
    return { error: "Недостаточно прав" };
  }

  const supabase = createClient();
  const name = data.name.trim();
  const direction = data.direction.trim();
  const email = data.email.trim().toLowerCase();

  if (!name || !direction || !email) {
    return { error: "Заполните имя, email и направление" };
  }

  if (data.id) {
    const { error } = await supabase
      .from("designers")
      .update({ name, role: data.role, direction, email })
      .eq("id", data.id);

    if (error) return { error: error.message };

    revalidatePath("/designers");
    revalidatePath(`/designers/${data.id}`);
    revalidatePath(`/designers/${data.id}/review`);
    return {};
  }

  const { error } = await supabase.from("designers").insert({
    name,
    role: data.role,
    direction,
    email,
  });

  if (error) return { error: error.message };

  revalidatePath("/designers");
  return {};
}

export async function deleteDesigner(
  id: string
): Promise<{ error?: string }> {
  const session = await getSessionContext();
  if (!session?.isAdmin) {
    return { error: "Недостаточно прав" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("designers").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/designers");
  return {};
}
