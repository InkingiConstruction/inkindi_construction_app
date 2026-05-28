import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const API_ORIGIN =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_BASE_URL ||
  "https://inkindi-construction-backend.onrender.com";

export const API_BASE_URL = `${API_ORIGIN.replace(/\/$/, "")}/api/v1`;

export const authClient = createAuthClient({
  baseURL: API_ORIGIN,
  basePath: "/api/v1/auth",
  plugins: [
    expoClient({
      scheme: "inkindiapp",
      storagePrefix: "inkindiapp",
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
