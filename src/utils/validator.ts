type PrimitiveType = "string" | "number" | "boolean" | "any";

export type TypeDescriptor =
  | PrimitiveType
  | ArrayTypeDescriptor
  | ObjectTypeDescriptor
  | NullableTypeDescriptor
  | OptionalTypeDescriptor;

interface OptionalTypeDescriptor<T extends TypeDescriptor = TypeDescriptor> {
  _kind: "optional";
  descriptor: T;
}

interface NullableTypeDescriptor<T extends TypeDescriptor = TypeDescriptor> {
  _kind: "nullable";
  descriptor: T;
}

type ArrayTypeDescriptor = [TypeDescriptor];

interface ObjectTypeDescriptor {
  [key: string]: TypeDescriptor;
}

type InferValueType<T> = T extends PrimitiveType
  ? InferPrimitiveType<T>
  : T extends ArrayTypeDescriptor
  ? InferArrayType<T>
  : T extends ObjectTypeDescriptor
  ? InferObjectType<T>
  : never;

export type InferType<T> = T extends NullableTypeDescriptor<infer U>
  ? InferValueType<U> | null
  : T extends OptionalTypeDescriptor<infer U>
  ? InferValueType<U> | undefined
  : InferValueType<T>;

type InferPrimitiveType<T> = T extends PrimitiveType
  ? T extends "string"
    ? string
    : T extends "number"
    ? number
    : T extends "boolean"
    ? boolean
    : T extends "any"
    ? any
    : never
  : never;

type InferArrayType<T> = T extends ArrayTypeDescriptor
  ? Array<InferType<T[0]>>
  : never;

type InferObjectType<T> = T extends ObjectTypeDescriptor
  ? { [K in keyof T]: InferType<T[K]> }
  : never;

function isOptional(
  descriptor: TypeDescriptor,
): descriptor is OptionalTypeDescriptor {
  return (
    typeof descriptor === "object" &&
    "_kind" in descriptor &&
    descriptor._kind === "optional"
  );
}

function isNullable(
  descriptor: TypeDescriptor,
): descriptor is NullableTypeDescriptor {
  return (
    typeof descriptor === "object" &&
    "_kind" in descriptor &&
    descriptor._kind === "nullable"
  );
}

function isPrimitiveType(
  descriptor: TypeDescriptor,
): descriptor is PrimitiveType {
  return (
    typeof descriptor === "string" &&
    ["string", "number", "boolean", "any"].includes(descriptor)
  );
}

function isArrayType(
  descriptor: TypeDescriptor,
): descriptor is ArrayTypeDescriptor {
  return Array.isArray(descriptor);
}

export function optional<T extends TypeDescriptor>(
  descriptor: T,
): OptionalTypeDescriptor<T> {
  return {
    _kind: "optional",
    descriptor,
  };
}

export function nullable<T extends TypeDescriptor>(
  descriptor: T,
): NullableTypeDescriptor<T> {
  return {
    _kind: "nullable",
    descriptor,
  };
}

type ValidationResult = {
  valid: boolean;
  errors: {
    property: string;
    reason: string;
  }[];
};

export function validate(
  value: unknown,
  type: TypeDescriptor,
  path: string[] = [],
): ValidationResult {
  if (isPrimitiveType(type)) {
    return validatePrimitiveType(value, type, path);
  } else if (isArrayType(type)) {
    return validateArrayType(value, type, path);
  } else if (isOptional(type)) {
    return value === undefined
      ? { valid: true, errors: [] }
      : validate(value, type.descriptor, path);
  } else if (isNullable(type)) {
    return value === null
      ? { valid: true, errors: [] }
      : validate(value, type.descriptor, path);
  } else if ("_kind" in type) {
    return {
      valid: false,
      errors: [{ property: path.join("."), reason: "Invalid descriptor" }],
    };
  } else {
    return validateObjectType(value, type, path);
  }
}

function error(property: string, expected: string, actual: unknown) {
  return {
    valid: false,
    errors: [{ property, reason: `Expected ${expected}, but got ${actual}` }],
  };
}

function validatePrimitiveType(
  value: unknown,
  descriptor: PrimitiveType,
  path: string[],
): ValidationResult {
  if (descriptor === "any" || descriptor === typeof value) {
    return { valid: true, errors: [] };
  }
  return error(path.join("."), descriptor, typeof value);
}

function validateArrayType(
  value: unknown,
  descriptor: ArrayTypeDescriptor,
  path: string[],
): ValidationResult {
  if (!Array.isArray(value)) {
    return error(path.join("."), "array", typeof value);
  }

  const errors: ValidationResult["errors"] = [];
  for (let i = 0; i < value.length; i++) {
    const result = validate(value[i], descriptor[0], path.concat(`${i}`));
    errors.push(...result.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateObjectType(
  value: unknown,
  descriptor: ObjectTypeDescriptor,
  path: string[],
): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return error(path.join("."), "object", typeof value);
  }

  const errors: ValidationResult["errors"] = [];
  for (const key in descriptor) {
    if (Object.hasOwn(descriptor, key)) {
      const result = validate(
        value[key as never],
        descriptor[key],
        path.concat(key),
      );
      errors.push(...result.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
