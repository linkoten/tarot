"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
// , getToken
export default function ComponentUseAuth() {
  const { isLoaded, userId, sessionId } = useAuth();

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <div>
      Bonjour, id: {userId}, session: {sessionId}
    </div>
  );
}
