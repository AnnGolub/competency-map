import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasAppAccess } from "@/lib/auth-utils";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types/database";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/self-review"];
const NO_ACCESS_PATH = "/no-access";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);
  const noAccessUrl = new URL(NO_ACCESS_PATH, request.url);
  const designersUrl = new URL("/designers", request.url);

  if (!user) {
    if (isPublicPath(pathname)) {
      return supabaseResponse;
    }
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as UserRole | undefined;

  if (hasAppAccess(role)) {
    if (pathname === NO_ACCESS_PATH || pathname === "/login") {
      return NextResponse.redirect(designersUrl);
    }
    if (pathname === "/") {
      return NextResponse.redirect(designersUrl);
    }
    return supabaseResponse;
  }

  if (pathname === NO_ACCESS_PATH) {
    return supabaseResponse;
  }
  return NextResponse.redirect(noAccessUrl);
}
