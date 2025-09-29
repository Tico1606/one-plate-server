import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed limpo com 2 receitas...')

  // Limpar dados existentes
  console.log('🧹 Limpando dados existentes...')
  await prisma.recipeView.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.review.deleteMany()
  await prisma.shoppingListItem.deleteMany()
  await prisma.shoppingList.deleteMany()
  await prisma.mealPlanEntry.deleteMany()
  await prisma.mealPlan.deleteMany()
  await prisma.recipeIngredient.deleteMany()
  await prisma.recipeCategory.deleteMany()
  await prisma.step.deleteMany()
  await prisma.recipePhoto.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuário admin
  console.log('👤 Criando usuário admin...')
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-user-1',
      email: 'admin@oneplate.com',
      name: 'Admin OnePlate',
      role: 'ADMIN',
    },
  })

  // Criar usuário comum
  console.log('👤 Criando usuário comum...')
  const regularUser = await prisma.user.create({
    data: {
      id: 'user-1',
      email: 'usuario@oneplate.com',
      name: 'João Silva',
      role: 'USER',
    },
  })

  // Criar categorias
  console.log('📂 Criando categorias...')
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Lanche' } }),
    prisma.category.create({ data: { name: 'Almoço' } }),
    prisma.category.create({ data: { name: 'Jantar' } }),
    prisma.category.create({ data: { name: 'Sobremesa' } }),
    prisma.category.create({ data: { name: 'Lanche' } }),
    prisma.category.create({ data: { name: 'Brasileira' } }),
    prisma.category.create({ data: { name: 'Italiana' } }),
  ])

  // Criar ingredientes
  console.log('🥕 Criando ingredientes...')
  const ingredients = await Promise.all([
    prisma.ingredient.create({ data: { name: 'Farinha de trigo' } }),
    prisma.ingredient.create({ data: { name: 'Açúcar' } }),
    prisma.ingredient.create({ data: { name: 'Ovos' } }),
    prisma.ingredient.create({ data: { name: 'Leite' } }),
    prisma.ingredient.create({ data: { name: 'Manteiga' } }),
    prisma.ingredient.create({ data: { name: 'Fermento em pó' } }),
    prisma.ingredient.create({ data: { name: 'Sal' } }),
    prisma.ingredient.create({ data: { name: 'Massa' } }),
    prisma.ingredient.create({ data: { name: 'Queijo' } }),
    prisma.ingredient.create({ data: { name: 'Azeite' } }),
    prisma.ingredient.create({ data: { name: 'Pimenta' } }),
    prisma.ingredient.create({ data: { name: 'Bacon' } }),
    prisma.ingredient.create({ data: { name: 'Parmesão' } }),
    prisma.ingredient.create({ data: { name: 'Leite condensado' } }),
    prisma.ingredient.create({ data: { name: 'Cacau em pó' } }),
    prisma.ingredient.create({ data: { name: 'Chocolate' } }),
  ])

  // Função auxiliar para encontrar ingrediente por nome
  const findIngredient = (name: string): string | null => {
    const ingredient = ingredients.find((ing) => ing.name === name)
    if (!ingredient) {
      console.error(`❌ Ingrediente não encontrado: "${name}"`)
      console.log(
        'Ingredientes disponíveis:',
        ingredients.map((i) => i.name),
      )
      return null
    }
    return ingredient.id
  }

  // Função auxiliar para encontrar categoria por nome
  const findCategory = (name: string) =>
    categories.find((cat) => cat.name === name)?.id || ''

  // Função auxiliar para criar ingredientes de receita com validação
  const createRecipeIngredients = async (
    recipeId: string,
    recipeName: string,
    ingredientsData: Array<{
      ingredientId: string | null
      amount: number
      unit: string
    }>,
  ) => {
    const validIngredients = ingredientsData
      .filter(
        (
          ingredient,
        ): ingredient is { ingredientId: string; amount: number; unit: string } =>
          ingredient.ingredientId !== null,
      )
      .map((ingredient) => ({
        recipeId,
        ingredientId: ingredient.ingredientId,
        amount: ingredient.amount,
        unit: ingredient.unit,
      }))

    if (validIngredients.length === 0) {
      throw new Error(`Receita ${recipeName} deve ter pelo menos um ingrediente`)
    }

    await prisma.recipeIngredient.createMany({
      data: validIngredients,
    })
  }

  // Receita 1: Pão de Açúcar (Lanche)
  console.log('🍞 Criando receita: Pão de Açúcar...')
  const paoAcucar = await prisma.recipe.create({
    data: {
      title: 'Pão de Açúcar Tradicional',
      description: 'Um pão doce brasileiro tradicional, perfeito para o lanche.',
      authorId: adminUser.id,
      difficulty: 'EASY',
      prepTime: 55,
      servings: 8,
      calories: 280,
      proteinGrams: 8.5,
      carbGrams: 45.2,
      fatGrams: 6.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  // Adicionar ingredientes da receita
  await createRecipeIngredients(paoAcucar.id, 'Pão de Açúcar', [
    {
      ingredientId: findIngredient('Farinha de trigo'),
      amount: 500,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Açúcar'),
      amount: 100,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Ovos'),
      amount: 2,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Leite'),
      amount: 200,
      unit: 'ml',
    },
    {
      ingredientId: findIngredient('Manteiga'),
      amount: 50,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Fermento em pó'),
      amount: 10,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Sal'),
      amount: 5,
      unit: 'g',
    },
  ])

  // Adicionar passos da receita
  await prisma.step.createMany({
    data: [
      {
        recipeId: paoAcucar.id,
        order: 1,
        description: 'Pré-aqueça o forno a 180°C.',
        durationSec: 0,
      },
      {
        recipeId: paoAcucar.id,
        order: 2,
        description: 'Em uma tigela, misture a farinha, o açúcar, o fermento e o sal.',
        durationSec: 300,
      },
      {
        recipeId: paoAcucar.id,
        order: 3,
        description:
          'Adicione os ovos, o leite e a manteiga derretida. Misture até formar uma massa homogênea.',
        durationSec: 600,
      },
      {
        recipeId: paoAcucar.id,
        order: 4,
        description: 'Despeje a massa em uma forma untada e enfarinhada.',
        durationSec: 120,
      },
      {
        recipeId: paoAcucar.id,
        order: 5,
        description: 'Asse por 25 minutos ou até dourar.',
        durationSec: 1500,
      },
    ],
  })

  // Adicionar categorias da receita
  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: paoAcucar.id, categoryId: findCategory('Lanche') },
      { recipeId: paoAcucar.id, categoryId: findCategory('Brasileira') },
    ],
  })

  // Receita 2: Spaghetti à Carbonara (Jantar)
  console.log('🍝 Criando receita: Spaghetti à Carbonara...')
  const carbonara = await prisma.recipe.create({
    data: {
      title: 'Spaghetti à Carbonara',
      description: 'Massa italiana cremosa com bacon e queijo parmesão.',
      authorId: regularUser.id,
      difficulty: 'MEDIUM',
      prepTime: 35,
      servings: 4,
      calories: 450,
      proteinGrams: 18.5,
      carbGrams: 52.3,
      fatGrams: 16.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(carbonara.id, 'Spaghetti à Carbonara', [
    {
      ingredientId: findIngredient('Massa'),
      amount: 400,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Ovos'),
      amount: 3,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Queijo'),
      amount: 100,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Azeite'),
      amount: 2,
      unit: 'colheres de sopa',
    },
    {
      ingredientId: findIngredient('Sal'),
      amount: 5,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Pimenta'),
      amount: 1,
      unit: 'pitada',
    },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: carbonara.id,
        order: 1,
        description: 'Cozinhe a massa conforme as instruções da embalagem.',
        durationSec: 600,
      },
      {
        recipeId: carbonara.id,
        order: 2,
        description: 'Em uma tigela, bata os ovos com o queijo ralado.',
        durationSec: 120,
      },
      {
        recipeId: carbonara.id,
        order: 3,
        description: 'Refogue o bacon no azeite até ficar crocante.',
        durationSec: 300,
      },
      {
        recipeId: carbonara.id,
        order: 4,
        description: 'Misture a massa cozida com o bacon e retire do fogo.',
        durationSec: 60,
      },
      {
        recipeId: carbonara.id,
        order: 5,
        description: 'Adicione a mistura de ovos e queijo, mexendo rapidamente.',
        durationSec: 30,
      },
      {
        recipeId: carbonara.id,
        order: 6,
        description: 'Tempere com sal e pimenta. Sirva imediatamente.',
        durationSec: 0,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: carbonara.id, categoryId: findCategory('Jantar') },
      { recipeId: carbonara.id, categoryId: findCategory('Italiana') },
    ],
  })

  // Criar algumas avaliações
  console.log('⭐ Criando avaliações...')
  await prisma.review.createMany({
    data: [
      {
        recipeId: paoAcucar.id,
        userId: regularUser.id,
        rating: 4,
        comment: 'Perfeito! Ficou exatamente como esperado.',
      },
      {
        recipeId: carbonara.id,
        userId: adminUser.id,
        rating: 5,
        comment: 'Delicioso! Minha família adorou.',
      },
    ],
  })

  // Criar algumas favoritas
  console.log('❤️ Criando favoritas...')
  await prisma.favorite.createMany({
    data: [
      { userId: regularUser.id, recipeId: paoAcucar.id },
      { userId: adminUser.id, recipeId: carbonara.id },
    ],
  })

  console.log('✅ Seed limpo concluído com sucesso!')
  console.log('📊 Dados criados:')
  console.log(`   - ${await prisma.user.count()} usuários`)
  console.log(`   - ${await prisma.category.count()} categorias`)
  console.log(`   - ${await prisma.ingredient.count()} ingredientes`)
  console.log(`   - ${await prisma.recipe.count()} receitas`)
  console.log(`   - ${await prisma.review.count()} avaliações`)
  console.log(`   - ${await prisma.favorite.count()} favoritas`)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed limpo:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
