// Script para habilitar a extensão unaccent no PostgreSQL
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function enableUnaccent() {
  try {
    console.log('🔧 Habilitando extensão unaccent...')

    // Habilitar extensão unaccent
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS unaccent`

    // Verificar se foi criada
    const extensions = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'unaccent'
    `

    console.log('✅ Extensão unaccent habilitada:', extensions)

    // Testar a função
    const test = await prisma.$queryRaw`
      SELECT unaccent('Pão de Açúcar') as normalized
    `

    console.log('🧪 Teste unaccent:', test)
  } catch (error) {
    console.error('❌ Erro ao habilitar unaccent:', error)
  } finally {
    await prisma.$disconnect()
  }
}

enableUnaccent()
