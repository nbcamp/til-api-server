export type PrimitiveTypeKind = "number" | "string" | "boolean" | "any";
export type NullableType<T extends string> = `${T} nullable`;
export type OptionalType<T extends string> = `${T} optional`;

export interface ObjectTypeDescriptor {
  [key: string]: TypeDescriptor;
}

export type TypeDescriptor =
  | PrimitiveTypeKind
  | NullableType<PrimitiveTypeKind>
  | OptionalType<PrimitiveTypeKind | NullableType<PrimitiveTypeKind>>
  | ObjectTypeDescriptor;

export type InferType<T> = T extends PrimitiveTypeKind
  ? InferPrimitive<T>
  : T extends NullableType<infer P>
  ? P extends PrimitiveTypeKind
    ? InferPrimitive<P> | null
    : never
  : T extends OptionalType<infer O>
  ? O extends PrimitiveTypeKind
    ? InferPrimitive<O> | undefined
    : O extends NullableType<infer P>
    ?
        | (P extends PrimitiveTypeKind ? InferPrimitive<P> | null : never)
        | undefined
    : never
  : T extends ObjectTypeDescriptor
  ? { [K in keyof T]: InferType<T[K]> }
  : never;

type InferPrimitive<T> = T extends "number"
  ? number
  : T extends "string"
  ? string
  : T extends "boolean"
  ? boolean
  : T extends "any"
  ? any
  : never;

export function typeGuard<Descriptor extends TypeDescriptor>(
  value: unknown,
  descriptor: Descriptor,
): value is InferType<Descriptor> {
  if (typeof descriptor === "string") {
    return typeGuardPrimitive(value, descriptor);
  }

  if (typeof descriptor === "object") {
    return typeGuardObject(value, descriptor);
  }

  return false;
}

function typeGuardPrimitive<T>(
  value: unknown,
  kind:
    | PrimitiveTypeKind
    | NullableType<PrimitiveTypeKind>
    | OptionalType<PrimitiveTypeKind | NullableType<PrimitiveTypeKind>>,
): value is T {
  const [typeKind, attribute] = kind.split(" ");
  const isValidType = typeof value === typeKind;
  if (attribute === "nullable") return isValidType || value === null;
  if (attribute === "optional") return isValidType || value === undefined;
  return isValidType;
}

function typeGuardObject<T>(
  value: unknown,
  descriptor: ObjectTypeDescriptor,
): value is T {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  for (const key of Object.keys(descriptor)) {
    const kind = descriptor[key];

    if (
      typeof kind === "object" &&
      !typeGuardObject(value[key as never], kind)
    ) {
      return false;
    }

    if (
      typeof kind === "string" &&
      !typeGuardPrimitive(value[key as never], kind)
    ) {
      return false;
    }
  }

  return true;
}
