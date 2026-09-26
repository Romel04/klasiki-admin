"use client";

import { useState } from "react";
import { getCurrentUser } from "@/lib/auth/token-store";

// Not reactive across the whole app on purpose — currentUser only ever
// changes at login or on a token refresh, and this hook is read at mount by
// pages (like Settings) that just need "who am I right now". If it's ever
// needed live in the topbar too, revisit with a proper subscribe/emit
// pattern instead of polling.
export function useCurrentUser() {
  const [user] = useState(() => getCurrentUser());
  return user;
}