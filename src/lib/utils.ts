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

export const getDeepResearchPrompt = (
  address: string,
  city: string,
  strate: string,
) => {
  return `
  A partir de los siguientes datos: 

    - Estrato: ${strate}
    - Ciudad: ${city}
    - Direccion: ${address}
  
    Crea una busqueda completa que contenga de forma obligatoria resultados de busqueda sobre:

    1. Precios promedio de viviendas que se ofrecen cerca de esa direccion
    2. El precio promedio del mt2 en ese sector teniendo en cuenta el estrato
    3. Si existen proyectos en curso o por ser iniciados/terminados que pudieras vallorizar la propiedad a largo plazo
    4. Si es un sector con alta peligrosidad y dicha inseguridad ha aumentado con el tiempo
    5. Si se han reportado estados sismicos o eventos sismicos recientemente en ese sector
    6. Evalua en base al plan de ordenamiento territorial de la ciudad posibles criterios de apreciacion de inmuebles en el sector
    7. Evalua la humedad de ese barrio o sector especifico
    

    Al final del flujo debes reesponder cada pregunta con la informacion que tengas, sin embargo, es importante que 
    toda la informacion expuesta sea lo suficientemente nutrida como para que un analista pueda deidir si vale la pena o no comprar la casa

  `;
}