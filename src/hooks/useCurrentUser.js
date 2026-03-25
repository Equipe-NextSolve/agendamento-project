"use client";

import { useEffect, useState } from "react";
import { subscribeAdminSession } from "@/lib/adminAuth";
import { onUserChange } from "@/lib/firebase/auth";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let firebaseUser = null;
    let firebaseResolved = false;
    let adminUser = null;

    const syncUser = () => {
      setUser(adminUser || firebaseUser);
      setLoading(!adminUser && !firebaseResolved);
    };

    const unsubscribeFirebase = onUserChange((userData) => {
      firebaseUser = userData;
      firebaseResolved = true;
      syncUser();
    });

    const unsubscribeAdmin = subscribeAdminSession((session) => {
      adminUser = session;
      syncUser();
    });

    return () => {
      unsubscribeFirebase();
      unsubscribeAdmin();
    };
  }, []);

  return { user, loading };
}
