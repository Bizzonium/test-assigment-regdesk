import { createEnv as createEnvCore } from '@t3-oss/env-core'
import { createEnv as createEnvNextjs } from '@t3-oss/env-nextjs'
import { z } from 'zod'

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app
 * isn't built with invalid env vars.
 */
const serverEnvSchema = {
  NODE_ENV: z.enum(['development', 'test', 'production']),

  BACKEND_BIND_HOST: z.string(),
  BACKEND_BIND_PORT: z.coerce.number().min(1).max(65535),
}

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app
 * isn't built with invalid env vars. To expose them to the client, prefix them with
 * `NEXT_PUBLIC_`.
 */
const clientEnvSchema = {
  // NEXT_PUBLIC_CLIENTVAR: z.string(),
}

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 */
const runtimeEnv = {
  NODE_ENV: process.env.NODE_ENV,

  BACKEND_BIND_HOST: process.env.BACKEND_BIND_HOST,
  BACKEND_BIND_PORT: process.env.BACKEND_BIND_PORT,
}

const isServer = typeof window === 'undefined'

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
const skipValidation = !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION

/**
 * Makes it so that empty strings are treated as undefined.
 * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
 */
const emptyStringAsUndefined = true

export const envNextjs = createEnvNextjs({
  server: serverEnvSchema,
  client: clientEnvSchema,
  runtimeEnv: runtimeEnv,
  isServer: isServer,
  skipValidation: skipValidation,
  emptyStringAsUndefined: emptyStringAsUndefined,
})

export const envGeneric = createEnvCore({
  server: serverEnvSchema,
  runtimeEnvStrict: runtimeEnv,
  isServer: isServer,
  skipValidation: skipValidation,
  emptyStringAsUndefined: emptyStringAsUndefined,
})
