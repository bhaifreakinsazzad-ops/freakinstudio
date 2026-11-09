import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
