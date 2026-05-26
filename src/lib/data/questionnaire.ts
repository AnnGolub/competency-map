import { createAdminClient } from "@/lib/supabase/admin";

export type PublicQuestionnaireData = {
  linkId: string;
  token: string;
  designerId: string;
  designerName: string;
};

export async function fetchPublicQuestionnaireByToken(
  token: string
): Promise<PublicQuestionnaireData | null> {
  const admin = createAdminClient();

  const { data: linkRow, error: linkError } = await admin
    .from("questionnaire_links")
    .select("id, designer_id, token")
    .eq("token", token)
    .maybeSingle();

  if (linkError) throw linkError;
  if (!linkRow) return null;

  const { data: designer, error: designerError } = await admin
    .from("designers")
    .select("id, name")
    .eq("id", linkRow.designer_id)
    .maybeSingle();

  if (designerError) throw designerError;
  if (!designer) return null;

  return {
    linkId: linkRow.id,
    token: linkRow.token,
    designerId: designer.id,
    designerName: designer.name,
  };
}
