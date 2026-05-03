import { z } from 'zod'

const RULES = [
  { test: (v: string) => v.length >= 12,            label: 'at least 12 characters' },
  { test: (v: string) => /[A-Z]/.test(v),           label: 'an uppercase letter' },
  { test: (v: string) => /[0-9]/.test(v),           label: 'a number' },
  { test: (v: string) => /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(v), label: 'a special character' },
]

export function validatePassword(value: string): string | null {
  const missing = RULES.filter((r) => !r.test(value)).map((r) => r.label)
  if (missing.length === 0) return null
  return `Password must include: ${missing.join(', ')}.`
}

export const passwordSchema = z.string().superRefine((val, ctx) => {
  const error = validatePassword(val)
  if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error })
})
