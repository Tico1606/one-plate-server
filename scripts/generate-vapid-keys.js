#!/usr/bin/env node

import webpush from 'web-push'

console.log('🔑 Gerando chaves VAPID para notificações push...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ Chaves VAPID geradas com sucesso!\n')
console.log('📋 Adicione estas variáveis ao seu arquivo .env:\n')
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log('\n⚠️  IMPORTANTE: Mantenha a chave privada segura e nunca a compartilhe!')
console.log('📖 Para mais informações, consulte: documentation/notifications-api.md')
