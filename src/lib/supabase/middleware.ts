import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
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

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isPublicRoute = path === "/" || path.startsWith("/api/push") || path.startsWith("/api/telegram");
  const isOnboarding = path.startsWith("/onboarding");

  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && !isOnboarding && !isAuthRoute && !isPublicRoute) {
    const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, organizations(onboarding_completed)")
    .eq("user_id", user.id)
    .maybeSingle();

  const org = membership?.organizations as { onboarding_completed?: boolean } | null;
    if (!membership || !org?.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding/store";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
