import React from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Nav() {
  return (
    <nav className="w-full h-[50px] p-2 flex items-center justify-between border-b">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/">Home</Link>
        <Link href="/sign-in">SignIn</Link>
        <Link href="/sign-out">SignOut</Link>
      </div>
      <div>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
