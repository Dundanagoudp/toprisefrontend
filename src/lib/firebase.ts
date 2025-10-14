"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

// Initialize app only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export default app;

// Debug logs (optional, remove in prod)
if (process.env.NODE_ENV === "development") {
  console.log("🔥 Firebase initialized with project:", app.options.projectId);
  console.log("🔥 Auth methods available:", Object.keys(auth).slice(0, 10));
}
