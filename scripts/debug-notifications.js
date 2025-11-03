#!/usr/bin/env node

import { pushSubscriptionRepository } from '../src/database/repositories.js'
import { NotificationService } from '../src/services/notification-service.js'

console.log('🔍 Debug: Testando sistema de notificações...\n')

async function debugNotifications() {
  try {
    // 1. Verificar se o serviço de notificações está funcionando
    console.log('1. Testando NotificationService...')
    const notificationService = NotificationService.getInstance()
    console.log('✅ NotificationService inicializado com sucesso')

    // 2. Verificar se há subscriptions no banco
    console.log('\n2. Verificando subscriptions no banco...')
    const allSubscriptions = await pushSubscriptionRepository.findByUserId('test-user-id')
    console.log(`📊 Subscriptions encontradas: ${allSubscriptions.length}`)

    if (allSubscriptions.length > 0) {
      console.log('📋 Subscriptions:')
      allSubscriptions.forEach((sub, index) => {
        console.log(`  ${index + 1}. ID: ${sub.id}`)
        console.log(`     Endpoint: ${sub.endpoint}`)
        console.log(`     UserId: ${sub.userId}`)
        console.log(`     Created: ${sub.createdAt}`)
      })
    } else {
      console.log('⚠️  Nenhuma subscription encontrada!')
      console.log(
        '💡 Dica: Registre uma push subscription primeiro via POST /api/notifications/subscribe',
      )
    }

    // 3. Testar criação de payload
    console.log('\n3. Testando criação de payload...')
    const testPayload = notificationService.createRecipeReviewNotification(
      'Pudim de Leite',
      'João Silva',
      5,
    )
    console.log('✅ Payload criado:', JSON.stringify(testPayload, null, 2))

    // 4. Verificar variáveis de ambiente
    console.log('\n4. Verificando variáveis de ambiente...')
    const env = process.env
    console.log(
      `VAPID_PUBLIC_KEY: ${env.VAPID_PUBLIC_KEY ? '✅ Definida' : '❌ Não definida'}`,
    )
    console.log(
      `VAPID_PRIVATE_KEY: ${env.VAPID_PRIVATE_KEY ? '✅ Definida' : '❌ Não definida'}`,
    )

    if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
      console.log('\n❌ ERRO: Variáveis VAPID não definidas!')
      console.log('💡 Execute: npm run generate-vapid-keys')
      console.log('💡 Adicione as chaves ao arquivo .env')
      return
    }

    console.log('\n✅ Debug concluído!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Verifique se as variáveis VAPID estão no .env')
    console.log('2. Registre uma push subscription via frontend')
    console.log('3. Teste criando uma avaliação')
    console.log('4. Verifique os logs do servidor para erros')
  } catch (error) {
    console.error('❌ Erro durante debug:', error)
    console.log('\n🔧 Possíveis soluções:')
    console.log('1. Verifique se o banco de dados está rodando')
    console.log('2. Verifique se as variáveis de ambiente estão corretas')
    console.log('3. Verifique se o web-push está instalado: npm install web-push')
  }
}

debugNotifications()
