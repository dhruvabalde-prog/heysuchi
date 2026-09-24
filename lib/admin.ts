import { getSupabaseAdmin } from "./supabase/admin";
import { requireIdentity } from "./auth";

export async function getAdminContext() {
  const identity = await requireIdentity();
  if (!identity) return null;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("platform_admin_members")
    .select("role_id,platform_roles(key,name,platform_role_permissions(platform_permissions(key)))")
    .eq("identity_id", identity.id)
    .maybeSingle();
  if (!data) return null;
  const role = Array.isArray(data.platform_roles) ? data.platform_roles[0] : data.platform_roles;
  const permissions = (role?.platform_role_permissions ?? []).map((x: any) => {
    const p = Array.isArray(x.platform_permissions) ? x.platform_permissions[0] : x.platform_permissions;
    return p?.key;
  }).filter(Boolean);
  return { identity, role: role?.key ?? "", permissions };
}
export async function isAdmin() { return Boolean(await getAdminContext()); }
export async function requirePermission(permission: string) {
  const context = await getAdminContext();
  if (!context || !context.permissions.includes(permission)) return null;
  return context;
}
