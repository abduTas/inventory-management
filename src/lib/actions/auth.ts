"use server";

import { createClient } from "@/lib/supabase/server";
import { phoneToInternalEmail, normalizePhone } from "@/lib/auth/phone-auth";
import type { SignupInput, LoginInput, StoreSetupInput } from "@/lib/validations/auth";

export async function signUpAction(data: SignupInput) {
  const supabase = await createClient();
  const phone = normalizePhone(data.phone);
  const email = phoneToInternalEmail(phone);

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      data: { phone, name: data.name, display_email: data.email || null },
    },
  });

  if (error) return { error: error.message };

  if (authData.user) {
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      phone,
      name: data.name,
      email: data.email || null,
    });
  }

  return { success: true };
}

export async function signInAction(data: LoginInput) {
  const supabase = await createClient();
  const phone = normalizePhone(data.phone);
  const email = phoneToInternalEmail(phone);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: data.password,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function completeOnboardingAction(data: StoreSetupInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: data.businessName,
      currency: data.currency,
      onboarding_completed: false,
    })
    .select()
    .single();

  if (orgError || !org) return { error: orgError?.message ?? "Failed to create org" };

  await supabase.from("memberships").insert({
    org_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .insert({
      org_id: org.id,
      name: data.storeName,
      timezone: data.timezone,
      default_reorder_level: data.defaultReorderLevel,
    })
    .select()
    .single();

  if (storeError || !store) return { error: storeError?.message ?? "Failed to create store" };

  await supabase
    .from("organizations")
    .update({ onboarding_completed: true })
    .eq("id", org.id);

  return { success: true, storeId: store.id };
}

export async function getUserContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: membership } = await supabase
    .from("memberships")
    .select("*, organizations(*, stores(*))")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, profile, membership };
}
