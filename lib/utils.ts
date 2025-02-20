import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Prisma } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SerializableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Prisma.Decimal
  | SerializableObject
  | SerializableArray;

interface SerializableObject {
  [key: string]: SerializableValue;
}

type SerializableArray = SerializableValue[];

export function serializeDecimal(obj: SerializableValue): SerializableValue {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Prisma.Decimal) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal);
  }

  const result: SerializableObject = {};
  for (const key in obj as SerializableObject) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = serializeDecimal((obj as SerializableObject)[key]);
    }
  }
  return result;
}
