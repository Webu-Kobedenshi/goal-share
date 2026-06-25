import { clearAppSession } from '../../utils/session'

export default defineEventHandler((event) => {
  clearAppSession(event)
  return { ok: true }
})
