import { z } from "zod"

export const name = z
  .string()
  .min(1)
  .max(100)
  .transform((str) => str.trim())

export const tweetId = z
  .string()

export const UpdateName = z.object({
  name,
  tweetId,
})
