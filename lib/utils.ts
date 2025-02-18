import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Prisma } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeDecimal(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Prisma.Decimal) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal);
  }

  const result: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = serializeDecimal(obj[key]);
    }
  }
  return result;
}
