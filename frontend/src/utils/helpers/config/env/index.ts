import { buildEnvProxy } from './buildEnvProxy.ts'
import { parseConfig } from './env.schema.ts'

const ENV = buildEnvProxy<Record<string, unknown>>(import.meta.env, key => `VITE_${key}`)

export const CONFIG = parseConfig(ENV)

export type Config = typeof CONFIG
