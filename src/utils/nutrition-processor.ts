/**
 * Processa campos nutricionais, substituindo valores vazios/null por "-"
 * e convertendo números para string para armazenamento no banco
 */
export function processNutritionalFields(data: any) {
  const processedData = { ...data }

  // Campos nutricionais que devem ser processados
  const nutritionalFields = ['calories', 'proteinGrams', 'carbGrams', 'fatGrams']

  nutritionalFields.forEach((field) => {
    const value = processedData[field]

    if (value === null || value === undefined || value === '') {
      // Substituir valores vazios por "-"
      processedData[field] = '-'
    } else if (typeof value === 'number') {
      // Converter números para string para armazenamento no banco
      processedData[field] = value.toString()
    }
    // Se já é string (incluindo "-"), manter como está
  })

  return processedData
}
