"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";

// isLoaded, isSignedIn,

export default function ComponentUseUser() {
  const { user } = useUser();

  return <div>Bonjour, {user?.fullName}, bievenue sur le site !</div>;
}
