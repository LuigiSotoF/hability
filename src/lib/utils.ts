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

export const getExtensionByMimetipe = (type: string) => {
  if (type.includes('mp4')) {
    return '.mp4';
  } else if (type.includes('mov')) {
    return '.mov';
  }

  return '.mp4';
}

// utils/mime.util.ts
export const getMimetypeByExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    // Imágenes
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';

    // Videos
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'avi':
      return 'video/x-msvideo';
    case 'mkv':
      return 'video/x-matroska';
    case 'webm':
      return 'video/webm';

    // Audios
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
      return 'audio/ogg';
    case 'aac':
      return 'audio/aac';

    // Documentos
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'txt':
      return 'text/plain';
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';

    default:
      return 'application/octet-stream'; // fallback genérico
  }
};
