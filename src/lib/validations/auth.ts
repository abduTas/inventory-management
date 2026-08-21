import { z } from "zod";

export const signupSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const loginSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(1, "Password is required"),
});

export const storeSetupSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  storeName: z.string().min(2, "Store name is required"),
  currency: z.string(),
  timezone: z.string(),
  defaultReorderLevel: z.coerce.number().int().min(0),
});

export type StoreSetupFormInput = z.input<typeof storeSetupSchema>;
export type StoreSetupInput = z.output<typeof storeSetupSchema>;

export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  cost_price: z.coerce.number().min(0),
  sell_price: z.coerce.number().min(0),
  reorder_level: z.coerce.number().int().min(0).optional().nullable(),
  quantity: z.coerce.number().int().min(0),
  barcode: z.string().optional(),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = ProductFormOutput;
