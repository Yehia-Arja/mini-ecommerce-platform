import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .max(255, 'Email address must be at most 255 characters long.')
    .email('Enter a valid email address.'),
  password: z
    .string()
    .trim()
    .min(1, 'Password is required.')
    .max(255, 'Password must be at most 255 characters long.')
    .min(8, 'Password must be at least 8 characters long.'),
})
