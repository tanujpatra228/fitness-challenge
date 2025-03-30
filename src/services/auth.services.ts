import { supabase } from "../utils/supabase";

function getURL() {
  let url = process?.env?.NEXT_PUBLIC_SITE_URL ?? process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 'http://localhost:3000/'
  url = url.startsWith('http') ? url : `https://${url}`
  url = url.endsWith('/') ? `${url}auth/callback` : `${url}/auth/callback`
  return url
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw { message: error.message };
  }

  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getURL(),
    },
  });

  if (error) {
    throw { message: error.message };
  }

  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getURL(),
    },
  });

  if (error) {
    throw { message: error.message };
  }

  return data;
}

export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getURL(),
    },
  });

  if (error) {
    throw { message: error.message };
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw { message: error.message };
  }
} 