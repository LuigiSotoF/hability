import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MessageProviderWebhookPayload } from "./types/webhook.types"
import { randomUUID } from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getUniqueUUID = (): string => {
  return randomUUID();
}

export const stripB64Prefix = (b64?: string) => {
  return (b64 ?? "").replace(/^data:[^;]+;base64,/, "");
}