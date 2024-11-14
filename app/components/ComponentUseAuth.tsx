"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";

export default function ComponentUseAuth() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <div>
      Bonjour, id: {userId}, session: {sessionId}
    </div>
  );
}
