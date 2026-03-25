import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

console.log('DATABASE_URL:', process.env.DATABASE_URL)
const url = process.env.DATABASE_URL || 'file:./dev.db'
const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        name: 'test-mjs',
        email: `test-${Date.now()}@test.com`,
        password: '123'
      }
    })
    console.log('User created:', user.id)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
