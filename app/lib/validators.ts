import { z } from 'zod';
// Assuming your generated prisma client is here
import { OrderStatus, OrderItemStatus } from '@prisma/client'; 

// --- Reusable Regex & Constants ---
const phoneRegex = /^\d{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordError = 'Password must be at least 8 characters long and include an uppercase, lowercase, number, and special character.';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// --- Auth Schemas ---

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'A valid email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const SendOtpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const SignUpSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email format' }),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      { message: 'Password must include uppercase, lowercase, number & special character.' }
    ),
  // ✅ changed from string → structured address
  address: z
    .object({
      streetAddress: z.string().min(1, { message: 'Street address is required' }),
      city: z.string().min(1, { message: 'City is required' }),
      state: z.string().min(1, { message: 'State is required' }),
      zipCode: z.string().min(1, { message: 'ZIP code is required' }),
      label: z.string().optional(),
    })
    .optional(),
});
  
export const VerifyOtpSchema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(5, { message: 'Invalid email address' }),
  // Preprocess otp to ensure it's a trimmed string, then validate numeric 6 digits
  otp: z.preprocess(
    (val) => {
      if (typeof val === 'number') return String(val).trim();
      if (typeof val === 'string') return val.trim();
      return '';
    },
    z
      .string()
      .regex(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  ),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
  password: z.string().regex(passwordRegex, { message: passwordError }),
});

// --- Category Schemas ---

export const CategorySchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }),
  image: z.string().min(1, { message: 'Image URL is required' }),
});

export const UpdateCategorySchema = z.object({
  id: z.string().min(1, { message: 'Category ID is required' }),
  name: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
});

export const DeleteCategorySchema = z.object({
  id: z.string().min(1, { message: 'Category ID is required' }),
});

// --- Product Schemas ---

export const ProductSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  color: z.string().min(1, { message: 'Color is required' }),
  ocassion: z.string().min(1, { message: 'Ocassion is required' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be 0 or more' }),
  categoryId: z.string().min(1, { message: 'Category ID is required' }),
  images: z
    .array(z.string().min(1))
    .min(1, { message: 'At least one image is required' }),
});

export const UpdateProductSchema = z.object({
  id: z.string().min(1, { message: 'Product ID is required' }),
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  ocassion: z.string().min(1).optional(),
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  images: z.array(z.string().min(1)).min(1).optional(),
});

export const DeleteProductSchema = z.object({
  id: z.string().min(1, { message: 'Product ID is required from search params' }),
});



// --- Cart & Checkout Schemas ---
export const CartAddSchema = z.object({
  productId: z.string().min(1, { message: 'Product ID is required' }),
  quantity: z.coerce.number().int().positive({ message: 'Quantity must be greater than 0' }),
  productName: z.string().min(1, { message: 'Product name is required' }),
  productImage: z.string().optional(),
  price: z.coerce.number().positive({ message: 'Price must be positive' }),
  withPolish: z.boolean().optional().default(false),
});


export const CartUpdateSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.coerce.number().int().positive({ message: 'Quantity must be at least 1' }),
});

export const CartDeleteSchema = z.object({
  cartItemId: z.string().min(1),
});

const AddressSchema = z.object({
  streetAddress: z.string().min(1, { message: 'Street address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  zipCode: z.string().min(1, { message: 'Zip code is required' }),
  country: z.string().optional(),
});

export const CheckoutSchema = z.object({
  address: AddressSchema,
});

// --- Order & Return Schemas ---

const UpdateOrderStatusSchema = z.object({
  action: z.literal('UPDATE_ORDER_STATUS'),
  orderId: z.string().min(1, { message: 'Order ID is required' }),
  status: z.nativeEnum(OrderStatus),
});

const UpdateReturnStatusSchema = z.object({
  action: z.literal('UPDATE_RETURN_STATUS'),
  orderItemId: z.string().min(1, { message: 'Order Item ID is required' }),
  newStatus: z.nativeEnum(OrderItemStatus),
});

export const AdminOrderUpdateSchema = z.discriminatedUnion('action', [
  UpdateOrderStatusSchema,
  UpdateReturnStatusSchema,
]);

export const ReturnRequestSchema = z.object({
  orderItemId: z.string().min(1, { message: 'Order Item ID is required' }),
  reason: z.string().min(1, { message: 'A reason for return is required' }),
  notes: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: 'File too large. Maximum size is 5MB.',
    })
    .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), {
      message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
    })
    .optional(),
});

// --- Generic Schemas ---

export const IdParamSchema = z.object({
  id: z.string().min(1, { message: 'An ID parameter is required' }),
});

// --- PAGINATION SCHEMAS (THE FIX) ---

/**
 * Preprocessing helper for query params.
 * Checks if the value is null, "", or a string number < 1.
 * If so, returns the default value.
 * Otherwise, returns the original value for coercion.
 */
const preprocessQueryParam = (val: unknown, defaultValue: string) => {
  if (val === null || val === "") return defaultValue;
  if (typeof val === "string") {
    const num = parseInt(val, 10);
    // If it's a string that's not a number, or a number < 1, use default
    if (isNaN(num) || num < 1) return defaultValue;
  }
  return val;
};

// Fixed schema for product filtering
export const ProductQuerySchema = z.object({
  page: z.preprocess(
    (val) => preprocessQueryParam(val, "1"), // Default page 1
    z.coerce.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => preprocessQueryParam(val, "12"), // Default limit 12
    z.coerce.number().int().min(1).max(100).default(12) // Max 100
  ),
  // You could add more here, like:
  // category: z.string().optional(),
  // sort: z.enum(['price_asc', 'price_desc']).optional(),
});

// Fixed schema for general admin tables
export const PaginationSchema = z.object({
  page: z.preprocess(
    (val) => preprocessQueryParam(val, "1"), // Default page 1
    z.coerce.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => preprocessQueryParam(val, "20"), // Default limit 20
    z.coerce.number().int().min(1).max(100).default(20) // Max 100
  ),
});

