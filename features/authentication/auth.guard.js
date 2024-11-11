import { router, useRootNavigationState, useSegments } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAuthloggedIn } from "./auth.slice";

export function useProtectedRoute() {
  const segments = useSegments();
  const loggedIn = useSelector(getAuthloggedIn);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";
    
    if (!loggedIn && !inAuthGroup ) {
      // If the user is not signed in and trying to access a protected route, redirect to sign-in
      router.push("(auth)/login");
    } else if (loggedIn && inAuthGroup)  {
      // If the user is signed in and trying to access an auth-only page, redirect to main content
      router.push("/home");
    }
  }, [loggedIn, segments, navigationState]);
}
