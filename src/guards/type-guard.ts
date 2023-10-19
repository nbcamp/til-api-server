type BasicType = "string" | "number" | "boolean" | "any";

export type TypeDescriptor =
  | BasicType
  | NullableTypeDescriptor
  | OptionalTypeDescriptor
  | ObjectTypeDescriptor
  | ArrayTypeDescriptor;

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

export type InferType<T> = T extends BasicType
  ? InferBasicType<T>
  : T extends NullableTypeDescriptor
  ? InferNullableType<T>
  : T extends OptionalTypeDescriptor
  ? InferOptionalType<T>
  : T extends ArrayTypeDescriptor
  ? InferArrayType<T>
  : T extends ObjectTypeDescriptor
  ? InferObjectType<T>
  : never;

type InferBasicType<T extends BasicType> = T extends "string"
  ? string
  : T extends "number"
  ? number
  : T extends "boolean"
  ? boolean
  : T extends "any"
  ? any
  : never;

type InferNullableType<T> = T extends NullableTypeDescriptor<infer U>
  ? InferType<U> | null
  : never;

type InferOptionalType<T> = T extends OptionalTypeDescriptor<infer U>
  ? InferType<U> | undefined
  : never;

type InferArrayType<T> = T extends ArrayTypeDescriptor
  ? Array<InferType<T[0]>>
  : never;

type InferObjectType<T> = T extends ObjectTypeDescriptor
  ? {
      [K in keyof T]: InferType<T[K]>;
    }
  : never;

type ValidationResult = {
  valid: boolean;
  errors: {
    property: string;
    reason: string;
  }[];
};

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

function isPrimitiveType(descriptor: TypeDescriptor): descriptor is BasicType {
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

export function validate(
  value: unknown,
  descriptor: TypeDescriptor,
  path: string[] = [],
): ValidationResult {
  if (isPrimitiveType(descriptor)) {
    return validateBasicType(value, descriptor, path);
  } else if (isArrayType(descriptor)) {
    return validateArrayType(value, descriptor[0], path);
  } else if (isOptional(descriptor)) {
    return value === undefined
      ? { valid: true, errors: [] }
      : validate(value, descriptor.descriptor, path);
  } else if (isNullable(descriptor)) {
    return value === null
      ? { valid: true, errors: [] }
      : validate(value, descriptor.descriptor, path);
  } else if ("_kind" in descriptor) {
    return {
      valid: false,
      errors: [{ property: path.join("."), reason: "Invalid descriptor" }],
    };
  } else {
    return validateObjectType(value, descriptor, path);
  }
}

function validateBasicType(
  value: unknown,
  descriptor: BasicType,
  path: string[],
): ValidationResult {
  switch (descriptor) {
    case "string":
      if (typeof value === "string") return { valid: true, errors: [] };
      break;
    case "number":
      if (typeof value === "number") return { valid: true, errors: [] };
      break;
    case "boolean":
      if (typeof value === "boolean") return { valid: true, errors: [] };
      break;
    case "any":
      return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: [{ property: path.join("."), reason: `Expected ${descriptor}` }],
  };
}

function validateArrayType(
  value: unknown,
  descriptor: TypeDescriptor,
  path: string[],
): ValidationResult {
  if (!Array.isArray(value)) {
    return {
      valid: false,
      errors: [{ property: path.join("."), reason: "Expected an array" }],
    };
  }

  let errors: ValidationResult["errors"] = [];
  for (let i = 0; i < value.length; i++) {
    const result = validate(value[i], descriptor, path.concat(String(i)));
    errors = errors.concat(result.errors);
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
    return {
      valid: false,
      errors: [{ property: path.join("."), reason: "Expected an object" }],
    };
  }

  let errors: ValidationResult["errors"] = [];
  for (const key in descriptor) {
    if (Object.prototype.hasOwnProperty.call(descriptor, key)) {
      const result = validate(
        (value as any)[key],
        descriptor[key],
        path.concat(key),
      );
      errors = errors.concat(result.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
