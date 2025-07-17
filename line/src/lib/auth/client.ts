import { createClient } from "@/lib/supabase/client";

// OTP認証用のヘルパー関数
export async function signInWithOtp(email: string) {
  const supabase = createClient();
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
}

// // マジックリンク認証用のヘルパー関数
// export async function signInWithMagicLink(email: string) {
//   const supabase = createClient();
//   return await supabase.auth.signInWithOtp({
//     email,
//     options: {
//       shouldCreateUser: true,
//       emailRedirectTo: `${window.location.origin}/auth/callback`,
//     },
//   });
// }

// OTP検証用のヘルパー関数
export async function verifyOtp(email: string, token: string) {
  const supabase = createClient();
  return await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
}

export async function signOut() {
  const supabase = createClient();
  return await supabase.auth.signOut();
}