"use client";

import { SignInButtonSkeleton } from "@/components/skeletons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function GoogleSignInButton({ className }: { className?: string }) {
  const { user, loading, error, signInWithGoogle, signOut, clearError } =
    useAuth();

  if (loading) {
    return (
      <div className={className}>
        <SignInButtonSkeleton />
      </div>
    );
  }

  if (user) {
    const initial = (user.displayName ?? user.email ?? "?").slice(0, 1).toUpperCase();
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Avatar size="lg">
          {user.photoURL ? (
            <AvatarImage src={user.photoURL} alt="" />
          ) : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.displayName ?? "Signed in"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void signOut()}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        type="button"
        className="h-11 w-full rounded-xl text-sm font-semibold"
        onClick={() => {
          clearError();
          void signInWithGoogle();
        }}
      >
        Continue with Google
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
