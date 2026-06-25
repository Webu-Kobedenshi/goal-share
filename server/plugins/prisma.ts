import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../app/generated/prisma/client'

export default defineNitroPlugin((nitroApp) => {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DIRECT_URL is not set')
  }

  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  nitroApp.hooks.hook('request', (event) => {
    event.context.prisma = prisma
  })

  nitroApp.hooks.hookOnce('close', async () => {
    await prisma.$disconnect()
  })
})

declare module 'h3' {
  interface H3EventContext {
    prisma: PrismaClient
  }
}
