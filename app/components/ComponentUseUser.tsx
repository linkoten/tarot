"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";

export default function ComponentUseUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  console.log(user);

  return <div>Bonjour, {user?.fullName}, bievenue sur le site !</div>;
}
