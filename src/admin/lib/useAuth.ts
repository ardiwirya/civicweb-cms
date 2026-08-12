import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase/database.types";

interface AuthState {
  isLoading: boolean;
  userId: string | null;
  role: UserRole | null;
}

/**
 * Menyediakan status login admin saat ini. Dipakai di App.tsx untuk
 * memutuskan apakah user diarahkan ke login atau ke dashboard, dan di
 * halaman-halaman tertentu untuk membedakan tampilan admin vs super_admin.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    userId: null,
    role: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id ?? null;

      if (!userId) {
        if (isMounted) setState({ isLoading: false, userId: null, role: null });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (isMounted) {
        setState({ isLoading: false, userId, role: profile?.role ?? null });
      }
    }

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}
