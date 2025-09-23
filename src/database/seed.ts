import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (cuidado em produção!)
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
    prisma.category.create({ data: { name: 'Café da Manhã' } }),
    prisma.category.create({ data: { name: 'Almoço' } }),
    prisma.category.create({ data: { name: 'Jantar' } }),
    prisma.category.create({ data: { name: 'Sobremesa' } }),
    prisma.category.create({ data: { name: 'Lanche' } }),
    prisma.category.create({ data: { name: 'Vegetariano' } }),
    prisma.category.create({ data: { name: 'Vegano' } }),
    prisma.category.create({ data: { name: 'Sem Glúten' } }),
    prisma.category.create({ data: { name: 'Brasileira' } }),
    prisma.category.create({ data: { name: 'Italiana' } }),
    prisma.category.create({ data: { name: 'Mexicana' } }),
    prisma.category.create({ data: { name: 'Asiática' } }),
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
    prisma.ingredient.create({ data: { name: 'Arroz' } }),
    prisma.ingredient.create({ data: { name: 'Feijão' } }),
    prisma.ingredient.create({ data: { name: 'Cebola' } }),
    prisma.ingredient.create({ data: { name: 'Alho' } }),
    prisma.ingredient.create({ data: { name: 'Tomate' } }),
    prisma.ingredient.create({ data: { name: 'Azeite' } }),
    prisma.ingredient.create({ data: { name: 'Pimenta' } }),
    prisma.ingredient.create({ data: { name: 'Carne bovina' } }),
    prisma.ingredient.create({ data: { name: 'Frango' } }),
    prisma.ingredient.create({ data: { name: 'Peixe' } }),
    prisma.ingredient.create({ data: { name: 'Queijo' } }),
    prisma.ingredient.create({ data: { name: 'Massa' } }),
    prisma.ingredient.create({ data: { name: 'Molho de tomate' } }),
    prisma.ingredient.create({ data: { name: 'Manjericão' } }),
    prisma.ingredient.create({ data: { name: 'Chocolate' } }),
    prisma.ingredient.create({ data: { name: 'Banana' } }),
    prisma.ingredient.create({ data: { name: 'Aveia' } }),
    prisma.ingredient.create({ data: { name: 'Iogurte' } }),
  ])

  // Função auxiliar para encontrar ingrediente por nome
  const findIngredient = (name: string) =>
    ingredients.find((ing) => ing.name === name)?.id || ''

  // Função auxiliar para encontrar categoria por nome
  const findCategory = (name: string) =>
    categories.find((cat) => cat.name === name)?.id || ''

  // Receita 1: Pão de Açúcar (Café da Manhã)
  console.log('🍞 Criando receita: Pão de Açúcar...')
  const paoAcucar = await prisma.recipe.create({
    data: {
      title: 'Pão de Açúcar Tradicional',
      description: 'Um pão doce brasileiro tradicional, perfeito para o café da manhã.',
      authorId: adminUser.id,
      difficulty: 'EASY',
      prepMinutes: 30,
      cookMinutes: 25,
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
  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: paoAcucar.id,
        ingredientId: findIngredient('Farinha de trigo'),
        amount: 500,
        unit: 'g',
      },
      {
        recipeId: paoAcucar.id,
        ingredientId: findIngredient('Açúcar'),
        amount: 100,
        unit: 'g',
      },
      {
        recipeId: paoAcucar.id,
        ingredientId: findIngredient('Ovos'),
        amount: 2,
        unit: 'unidades',
      },
      {
        recipeId: paoAcucar.id,
        ingredientId: findIngredient('Leite'),
        amount: 200,
        unit: 'ml',
      },
      {
        recipeId: paoAcucar.id,
        ingredientId: findIngredient('Manteiga'),
        amount: 50,
        unit: 'g',
      },
      {
        recipeId: paoAcucar.id,
        ingredientId: findIngredient('Fermento em pó'),
        amount: 10,
        unit: 'g',
      },
      {
        recipeId: paoAcucar.id,
        ingredientId: findIngredient('Sal'),
        amount: 5,
        unit: 'g',
      },
    ],
  })

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
      { recipeId: paoAcucar.id, categoryId: findCategory('Café da Manhã') },
      { recipeId: paoAcucar.id, categoryId: findCategory('Brasileira') },
    ],
  })

  // Receita 2: Arroz e Feijão (Almoço)
  console.log('🍚 Criando receita: Arroz e Feijão...')
  const arrozFeijao = await prisma.recipe.create({
    data: {
      title: 'Arroz e Feijão Tradicional',
      description: 'O clássico brasileiro que não pode faltar na mesa.',
      authorId: regularUser.id,
      difficulty: 'EASY',
      prepMinutes: 15,
      cookMinutes: 45,
      servings: 4,
      calories: 320,
      proteinGrams: 12.5,
      carbGrams: 58.3,
      fatGrams: 4.2,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: arrozFeijao.id,
        ingredientId: findIngredient('Arroz'),
        amount: 2,
        unit: 'xícaras',
      },
      {
        recipeId: arrozFeijao.id,
        ingredientId: findIngredient('Feijão'),
        amount: 1,
        unit: 'xícara',
      },
      {
        recipeId: arrozFeijao.id,
        ingredientId: findIngredient('Cebola'),
        amount: 1,
        unit: 'unidade',
      },
      {
        recipeId: arrozFeijao.id,
        ingredientId: findIngredient('Alho'),
        amount: 2,
        unit: 'dentes',
      },
      {
        recipeId: arrozFeijao.id,
        ingredientId: findIngredient('Azeite'),
        amount: 2,
        unit: 'colheres de sopa',
      },
      {
        recipeId: arrozFeijao.id,
        ingredientId: findIngredient('Sal'),
        amount: 5,
        unit: 'g',
      },
    ],
  })

  await prisma.step.createMany({
    data: [
      {
        recipeId: arrozFeijao.id,
        order: 1,
        description: 'Cozinhe o feijão com água e sal até ficar macio.',
        durationSec: 1800,
      },
      {
        recipeId: arrozFeijao.id,
        order: 2,
        description: 'Refogue a cebola e o alho no azeite.',
        durationSec: 300,
      },
      {
        recipeId: arrozFeijao.id,
        order: 3,
        description: 'Adicione o arroz e refogue por 2 minutos.',
        durationSec: 120,
      },
      {
        recipeId: arrozFeijao.id,
        order: 4,
        description: 'Adicione água quente e cozinhe até secar.',
        durationSec: 1200,
      },
      {
        recipeId: arrozFeijao.id,
        order: 5,
        description: 'Sirva com o feijão cozido.',
        durationSec: 0,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: arrozFeijao.id, categoryId: findCategory('Almoço') },
      { recipeId: arrozFeijao.id, categoryId: findCategory('Brasileira') },
    ],
  })

  // Receita 3: Spaghetti à Carbonara (Jantar)
  console.log('🍝 Criando receita: Spaghetti à Carbonara...')
  const carbonara = await prisma.recipe.create({
    data: {
      title: 'Spaghetti à Carbonara',
      description: 'Massa italiana cremosa com bacon e queijo parmesão.',
      authorId: adminUser.id,
      difficulty: 'MEDIUM',
      prepMinutes: 20,
      cookMinutes: 15,
      servings: 4,
      calories: 450,
      proteinGrams: 18.5,
      carbGrams: 52.3,
      fatGrams: 16.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: carbonara.id,
        ingredientId: findIngredient('Massa'),
        amount: 400,
        unit: 'g',
      },
      {
        recipeId: carbonara.id,
        ingredientId: findIngredient('Ovos'),
        amount: 3,
        unit: 'unidades',
      },
      {
        recipeId: carbonara.id,
        ingredientId: findIngredient('Queijo'),
        amount: 100,
        unit: 'g',
      },
      {
        recipeId: carbonara.id,
        ingredientId: findIngredient('Azeite'),
        amount: 2,
        unit: 'colheres de sopa',
      },
      {
        recipeId: carbonara.id,
        ingredientId: findIngredient('Sal'),
        amount: 5,
        unit: 'g',
      },
      {
        recipeId: carbonara.id,
        ingredientId: findIngredient('Pimenta'),
        amount: 1,
        unit: 'pitada',
      },
    ],
  })

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

  // Receita 4: Pudim de Leite (Sobremesa)
  console.log('🍮 Criando receita: Pudim de Leite...')
  const pudim = await prisma.recipe.create({
    data: {
      title: 'Pudim de Leite Condensado',
      description: 'Sobremesa brasileira clássica e cremosa.',
      authorId: regularUser.id,
      difficulty: 'MEDIUM',
      prepMinutes: 30,
      cookMinutes: 60,
      servings: 8,
      calories: 320,
      proteinGrams: 8.2,
      carbGrams: 45.8,
      fatGrams: 12.5,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: pudim.id,
        ingredientId: findIngredient('Açúcar'),
        amount: 200,
        unit: 'g',
      },
      {
        recipeId: pudim.id,
        ingredientId: findIngredient('Leite'),
        amount: 400,
        unit: 'ml',
      },
      {
        recipeId: pudim.id,
        ingredientId: findIngredient('Ovos'),
        amount: 4,
        unit: 'unidades',
      },
    ],
  })

  await prisma.step.createMany({
    data: [
      {
        recipeId: pudim.id,
        order: 1,
        description: 'Faça a calda: derreta o açúcar em fogo baixo até ficar dourado.',
        durationSec: 600,
      },
      {
        recipeId: pudim.id,
        order: 2,
        description: 'Despeje a calda na forma e reserve.',
        durationSec: 60,
      },
      {
        recipeId: pudim.id,
        order: 3,
        description: 'Bata os ovos, o leite e o leite condensado no liquidificador.',
        durationSec: 120,
      },
      {
        recipeId: pudim.id,
        order: 4,
        description: 'Despeje a mistura na forma com a calda.',
        durationSec: 30,
      },
      {
        recipeId: pudim.id,
        order: 5,
        description: 'Cozinhe em banho-maria por 1 hora.',
        durationSec: 3600,
      },
      {
        recipeId: pudim.id,
        order: 6,
        description: 'Deixe esfriar e desenforme na geladeira.',
        durationSec: 0,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: pudim.id, categoryId: findCategory('Sobremesa') },
      { recipeId: pudim.id, categoryId: findCategory('Brasileira') },
    ],
  })

  // Receita 5: Smoothie de Banana e Aveia (Lanche)
  console.log('🥤 Criando receita: Smoothie de Banana e Aveia...')
  const smoothie = await prisma.recipe.create({
    data: {
      title: 'Smoothie de Banana e Aveia',
      description: 'Lanche saudável e energético para qualquer hora do dia.',
      authorId: adminUser.id,
      difficulty: 'EASY',
      prepMinutes: 5,
      cookMinutes: 0,
      servings: 2,
      calories: 180,
      proteinGrams: 6.5,
      carbGrams: 35.2,
      fatGrams: 3.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: smoothie.id,
        ingredientId: findIngredient('Banana'),
        amount: 2,
        unit: 'unidades',
      },
      {
        recipeId: smoothie.id,
        ingredientId: findIngredient('Aveia'),
        amount: 3,
        unit: 'colheres de sopa',
      },
      {
        recipeId: smoothie.id,
        ingredientId: findIngredient('Iogurte'),
        amount: 200,
        unit: 'ml',
      },
      {
        recipeId: smoothie.id,
        ingredientId: findIngredient('Leite'),
        amount: 100,
        unit: 'ml',
      },
    ],
  })

  await prisma.step.createMany({
    data: [
      {
        recipeId: smoothie.id,
        order: 1,
        description: 'Descasque as bananas e corte em pedaços.',
        durationSec: 60,
      },
      {
        recipeId: smoothie.id,
        order: 2,
        description: 'Coloque todos os ingredientes no liquidificador.',
        durationSec: 30,
      },
      {
        recipeId: smoothie.id,
        order: 3,
        description: 'Bata por 1-2 minutos até ficar homogêneo.',
        durationSec: 120,
      },
      {
        recipeId: smoothie.id,
        order: 4,
        description: 'Sirva imediatamente com gelo se desejar.',
        durationSec: 0,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: smoothie.id, categoryId: findCategory('Lanche') },
      { recipeId: smoothie.id, categoryId: findCategory('Vegetariano') },
    ],
  })

  // Criar algumas avaliações
  console.log('⭐ Criando avaliações...')
  await prisma.review.createMany({
    data: [
      {
        recipeId: paoAcucar.id,
        userId: regularUser.id,
        rating: 5,
        comment: 'Perfeito! Ficou exatamente como esperado.',
      },
      {
        recipeId: arrozFeijao.id,
        userId: adminUser.id,
        rating: 4,
        comment: 'Receita clássica e bem explicada.',
      },
      {
        recipeId: carbonara.id,
        userId: regularUser.id,
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
      { userId: regularUser.id, recipeId: carbonara.id },
      { userId: adminUser.id, recipeId: pudim.id },
    ],
  })

  console.log('✅ Seed concluído com sucesso!')
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
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
