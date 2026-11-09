export interface RegisterInput {
  name: string;
  rollNumber: string;
  email: string;
  password: string;
}

export interface LoginInput {
  identifier: string; // can be email or roll number
  password: string;
}

export function validateRegisterInput(input: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: RegisterInput;
} {
  const errors: Record<string, string> = {};

  if (!input || typeof input !== "object") {
    return { isValid: false, errors: { form: "Invalid request payload" } };
  }

  const { name, rollNumber, email, password } = input as Record<
    string,
    unknown
  >;

  // Name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.name = "Full name is required";
  } else if (name.trim().length > 100) {
    errors.name = "Name cannot exceed 100 characters";
  }

  // Roll Number
  if (
    !rollNumber ||
    typeof rollNumber !== "string" ||
    rollNumber.trim().length === 0
  ) {
    errors.rollNumber = "Roll number is required";
  } else if (!/^[A-Za-z0-9_-]+$/.test(rollNumber.trim())) {
    errors.rollNumber =
      "Roll number can only contain letters, numbers, hyphens, and underscores";
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.email = "Email address is required";
  } else if (!emailRegex.test(email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  // Password
  if (!password || typeof password !== "string") {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    data: {
      name: (name as string).trim(),
      rollNumber: (rollNumber as string).trim().toUpperCase(),
      email: (email as string).trim().toLowerCase(),
      password: password as string,
    },
  };
}

export function validateLoginInput(input: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: LoginInput;
} {
  const errors: Record<string, string> = {};

  if (!input || typeof input !== "object") {
    return { isValid: false, errors: { form: "Invalid request payload" } };
  }

  const { identifier, password } = input as Record<string, unknown>;

  if (
    !identifier ||
    typeof identifier !== "string" ||
    identifier.trim().length === 0
  ) {
    errors.identifier = "Email or Roll Number is required";
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    data: {
      identifier: (identifier as string).trim(),
      password: password as string,
    },
  };
}

