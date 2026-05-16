"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DesignerRole } from "@/types/database";

export type DesignerFormData = {
  id?: string;
  name: string;
  role: DesignerRole;
  direction: string;
};

export async function saveDesigner(
  data: DesignerFormData
): Promise<{ error?: string }> {
  const supabase = createClient();
  const name = data.name.trim();
  const direction = data.direction.trim();

  if (!name || !direction) {
    return { error: "Заполните имя и направление" };
  }

  if (data.id) {
    const { error } = await supabase
      .from("designers")
      .update({ name, role: data.role, direction })
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
  });

  if (error) return { error: error.message };

  revalidatePath("/designers");
  return {};
}

export async function deleteDesigner(
  id: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("designers").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/designers");
  return {};
}
