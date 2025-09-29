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
    prisma.ingredient.create({ data: { name: 'Leite condensado' } }),
    prisma.ingredient.create({ data: { name: 'Bacon' } }),
    prisma.ingredient.create({ data: { name: 'Parmesão' } }),
    prisma.ingredient.create({ data: { name: 'Batata' } }),
    prisma.ingredient.create({ data: { name: 'Cenoura' } }),
    prisma.ingredient.create({ data: { name: 'Brócolis' } }),
    prisma.ingredient.create({ data: { name: 'Cogumelos' } }),
    prisma.ingredient.create({ data: { name: 'Pimentão' } }),
    prisma.ingredient.create({ data: { name: 'Abobrinha' } }),
    prisma.ingredient.create({ data: { name: 'Berinjela' } }),
    prisma.ingredient.create({ data: { name: 'Limão' } }),
    prisma.ingredient.create({ data: { name: 'Laranja' } }),
    prisma.ingredient.create({ data: { name: 'Morango' } }),
    prisma.ingredient.create({ data: { name: 'Manga' } }),
    prisma.ingredient.create({ data: { name: 'Abacaxi' } }),
    prisma.ingredient.create({ data: { name: 'Coco' } }),
    prisma.ingredient.create({ data: { name: 'Canela' } }),
    prisma.ingredient.create({ data: { name: 'Gengibre' } }),
    prisma.ingredient.create({ data: { name: 'Cúrcuma' } }),
    prisma.ingredient.create({ data: { name: 'Cominho' } }),
    prisma.ingredient.create({ data: { name: 'Coentro' } }),
    prisma.ingredient.create({ data: { name: 'Salsa' } }),
    prisma.ingredient.create({ data: { name: 'Cebolinha' } }),
    prisma.ingredient.create({ data: { name: 'Vinagre' } }),
    prisma.ingredient.create({ data: { name: 'Azeitonas' } }),
    prisma.ingredient.create({ data: { name: 'Alcaparras' } }),
    prisma.ingredient.create({ data: { name: 'Camarão' } }),
    prisma.ingredient.create({ data: { name: 'Salmão' } }),
    prisma.ingredient.create({ data: { name: 'Atum' } }),
    prisma.ingredient.create({ data: { name: 'Lentilha' } }),
    prisma.ingredient.create({ data: { name: 'Grão-de-bico' } }),
    prisma.ingredient.create({ data: { name: 'Quinoa' } }),
    prisma.ingredient.create({ data: { name: 'Couscous' } }),
    prisma.ingredient.create({ data: { name: 'Pão' } }),
    prisma.ingredient.create({ data: { name: 'Tortilha' } }),
    prisma.ingredient.create({ data: { name: 'Creme de leite' } }),
    prisma.ingredient.create({ data: { name: 'Ricota' } }),
    prisma.ingredient.create({ data: { name: 'Mozzarella' } }),
    prisma.ingredient.create({ data: { name: 'Gorgonzola' } }),
    prisma.ingredient.create({ data: { name: 'Nozes' } }),
    prisma.ingredient.create({ data: { name: 'Amêndoas' } }),
    prisma.ingredient.create({ data: { name: 'Castanha' } }),
    prisma.ingredient.create({ data: { name: 'Mel' } }),
    prisma.ingredient.create({ data: { name: 'Açúcar mascavo' } }),
    prisma.ingredient.create({ data: { name: 'Cacau em pó' } }),
    prisma.ingredient.create({ data: { name: 'Baunilha' } }),
    prisma.ingredient.create({ data: { name: 'Rum' } }),
    prisma.ingredient.create({ data: { name: 'Cachaça' } }),
    prisma.ingredient.create({ data: { name: 'Vinho' } }),
    prisma.ingredient.create({ data: { name: 'Cerveja' } }),
    prisma.ingredient.create({ data: { name: 'Alface' } }),
    prisma.ingredient.create({ data: { name: 'Alga nori' } }),
    prisma.ingredient.create({ data: { name: 'Mascarpone' } }),
    prisma.ingredient.create({ data: { name: 'Biscoito' } }),
    prisma.ingredient.create({ data: { name: 'Leite de coco' } }),
    prisma.ingredient.create({ data: { name: 'Café' } }),
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
      return null // Retorna null em vez de string vazia
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

  // Receita 1: Pão de Açúcar (Café da Manhã)
  console.log('🍞 Criando receita: Pão de Açúcar...')
  const paoAcucar = await prisma.recipe.create({
    data: {
      title: 'Pão de Açúcar Tradicional',
      description: 'Um pão doce brasileiro tradicional, perfeito para o café da manhã.',
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
      prepTime: 60,
      servings: 4,
      calories: 320,
      proteinGrams: 12.5,
      carbGrams: 58.3,
      fatGrams: 4.2,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(arrozFeijao.id, 'Arroz e Feijão', [
    {
      ingredientId: findIngredient('Arroz'),
      amount: 2,
      unit: 'xícaras',
    },
    {
      ingredientId: findIngredient('Feijão'),
      amount: 1,
      unit: 'xícara',
    },
    {
      ingredientId: findIngredient('Cebola'),
      amount: 1,
      unit: 'unidade',
    },
    {
      ingredientId: findIngredient('Alho'),
      amount: 2,
      unit: 'dentes',
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
  ])

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

  // Receita 4: Pudim de Leite (Sobremesa)
  console.log('🍮 Criando receita: Pudim de Leite...')
  const pudim = await prisma.recipe.create({
    data: {
      title: 'Pudim de Leite Condensado',
      description: 'Sobremesa brasileira clássica e cremosa.',
      authorId: regularUser.id,
      difficulty: 'MEDIUM',
      prepTime: 90,
      servings: 8,
      calories: 320,
      proteinGrams: 8.2,
      carbGrams: 45.8,
      fatGrams: 12.5,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(pudim.id, 'Pudim de Leite', [
    {
      ingredientId: findIngredient('Açúcar'),
      amount: 200,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Leite'),
      amount: 400,
      unit: 'ml',
    },
    {
      ingredientId: findIngredient('Ovos'),
      amount: 4,
      unit: 'unidades',
    },
  ])

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
      prepTime: 5,
      servings: 2,
      calories: 180,
      proteinGrams: 6.5,
      carbGrams: 35.2,
      fatGrams: 3.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(smoothie.id, 'Smoothie de Banana e Aveia', [
    {
      ingredientId: findIngredient('Banana'),
      amount: 2,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Aveia'),
      amount: 3,
      unit: 'colheres de sopa',
    },
    {
      ingredientId: findIngredient('Iogurte'),
      amount: 200,
      unit: 'ml',
    },
    {
      ingredientId: findIngredient('Leite'),
      amount: 100,
      unit: 'ml',
    },
  ])

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

  // Receita 6: Risotto de Cogumelos (Jantar)
  console.log('🍄 Criando receita: Risotto de Cogumelos...')
  const risotto = await prisma.recipe.create({
    data: {
      title: 'Risotto de Cogumelos',
      description: 'Risotto cremoso italiano com cogumelos frescos.',
      authorId: adminUser.id,
      difficulty: 'MEDIUM',
      prepTime: 50,
      servings: 4,
      calories: 380,
      proteinGrams: 12.5,
      carbGrams: 58.2,
      fatGrams: 8.5,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(risotto.id, 'Risotto de Cogumelos', [
    {
      ingredientId: findIngredient('Arroz'),
      amount: 300,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Cogumelos'),
      amount: 200,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Cebola'),
      amount: 1,
      unit: 'unidade',
    },
    {
      ingredientId: findIngredient('Alho'),
      amount: 2,
      unit: 'dentes',
    },
    {
      ingredientId: findIngredient('Azeite'),
      amount: 3,
      unit: 'colheres de sopa',
    },
    {
      ingredientId: findIngredient('Vinho'),
      amount: 100,
      unit: 'ml',
    },
    {
      ingredientId: findIngredient('Parmesão'),
      amount: 50,
      unit: 'g',
    },
    { ingredientId: findIngredient('Sal'), amount: 5, unit: 'g' },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: risotto.id,
        order: 1,
        description: 'Refogue a cebola e o alho no azeite.',
        durationSec: 300,
      },
      {
        recipeId: risotto.id,
        order: 2,
        description: 'Adicione o arroz e refogue por 2 minutos.',
        durationSec: 120,
      },
      {
        recipeId: risotto.id,
        order: 3,
        description: 'Adicione o vinho e deixe evaporar.',
        durationSec: 180,
      },
      {
        recipeId: risotto.id,
        order: 4,
        description: 'Adicione os cogumelos e caldo quente aos poucos.',
        durationSec: 1200,
      },
      {
        recipeId: risotto.id,
        order: 5,
        description: 'Finalize com parmesão e sirva.',
        durationSec: 60,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: risotto.id, categoryId: findCategory('Jantar') },
      { recipeId: risotto.id, categoryId: findCategory('Italiana') },
    ],
  })

  // Receita 7: Salada Caesar (Almoço)
  console.log('🥗 Criando receita: Salada Caesar...')
  const caesar = await prisma.recipe.create({
    data: {
      title: 'Salada Caesar Clássica',
      description: 'Salada refrescante com molho Caesar e croutons.',
      authorId: regularUser.id,
      difficulty: 'EASY',
      prepTime: 15,
      servings: 2,
      calories: 250,
      proteinGrams: 15.2,
      carbGrams: 12.5,
      fatGrams: 18.5,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(caesar.id, 'Salada Caesar', [
    {
      ingredientId: findIngredient('Alface'),
      amount: 1,
      unit: 'cabeça',
    },
    {
      ingredientId: findIngredient('Pão'),
      amount: 2,
      unit: 'fatias',
    },
    {
      ingredientId: findIngredient('Parmesão'),
      amount: 30,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Azeite'),
      amount: 2,
      unit: 'colheres de sopa',
    },
    {
      ingredientId: findIngredient('Limão'),
      amount: 1,
      unit: 'unidade',
    },
    {
      ingredientId: findIngredient('Alho'),
      amount: 1,
      unit: 'dente',
    },
    { ingredientId: findIngredient('Sal'), amount: 3, unit: 'g' },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: caesar.id,
        order: 1,
        description: 'Corte o pão em cubos e asse até dourar.',
        durationSec: 300,
      },
      {
        recipeId: caesar.id,
        order: 2,
        description: 'Lave e corte a alface em pedaços.',
        durationSec: 120,
      },
      {
        recipeId: caesar.id,
        order: 3,
        description: 'Prepare o molho com azeite, limão e alho.',
        durationSec: 60,
      },
      {
        recipeId: caesar.id,
        order: 4,
        description: 'Misture tudo e sirva com parmesão ralado.',
        durationSec: 30,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: caesar.id, categoryId: findCategory('Almoço') },
      { recipeId: caesar.id, categoryId: findCategory('Vegetariano') },
    ],
  })

  // Receita 8: Tacos Mexicanos (Jantar)
  console.log('🌮 Criando receita: Tacos Mexicanos...')
  const tacos = await prisma.recipe.create({
    data: {
      title: 'Tacos Mexicanos Autênticos',
      description: 'Tacos tradicionais mexicanos com carne temperada.',
      authorId: adminUser.id,
      difficulty: 'MEDIUM',
      prepTime: 45,
      servings: 6,
      calories: 320,
      proteinGrams: 22.5,
      carbGrams: 28.5,
      fatGrams: 12.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(tacos.id, 'Tacos Mexicanos', [
    {
      ingredientId: findIngredient('Tortilha'),
      amount: 12,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Carne bovina'),
      amount: 500,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Cebola'),
      amount: 1,
      unit: 'unidade',
    },
    {
      ingredientId: findIngredient('Tomate'),
      amount: 2,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Pimentão'),
      amount: 1,
      unit: 'unidade',
    },
    {
      ingredientId: findIngredient('Cominho'),
      amount: 1,
      unit: 'colher de chá',
    },
    {
      ingredientId: findIngredient('Coentro'),
      amount: 1,
      unit: 'maço',
    },
    {
      ingredientId: findIngredient('Limão'),
      amount: 2,
      unit: 'unidades',
    },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: tacos.id,
        order: 1,
        description: 'Tempere a carne com cominho e sal.',
        durationSec: 300,
      },
      {
        recipeId: tacos.id,
        order: 2,
        description: 'Refogue a carne até dourar.',
        durationSec: 600,
      },
      {
        recipeId: tacos.id,
        order: 3,
        description: 'Corte os vegetais em cubos pequenos.',
        durationSec: 300,
      },
      {
        recipeId: tacos.id,
        order: 4,
        description: 'Aqueça as tortilhas.',
        durationSec: 60,
      },
      {
        recipeId: tacos.id,
        order: 5,
        description: 'Monte os tacos com carne e vegetais.',
        durationSec: 120,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: tacos.id, categoryId: findCategory('Jantar') },
      { recipeId: tacos.id, categoryId: findCategory('Mexicana') },
    ],
  })

  // Receita 9: Sushi de Salmão (Jantar)
  console.log('🍣 Criando receita: Sushi de Salmão...')
  const sushi = await prisma.recipe.create({
    data: {
      title: 'Sushi de Salmão Fresco',
      description: 'Sushi tradicional japonês com salmão fresco.',
      authorId: regularUser.id,
      difficulty: 'HARD',
      prepTime: 65,
      servings: 4,
      calories: 280,
      proteinGrams: 18.5,
      carbGrams: 35.2,
      fatGrams: 6.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(sushi.id, 'Sushi de Salmão', [
    {
      ingredientId: findIngredient('Arroz'),
      amount: 2,
      unit: 'xícaras',
    },
    {
      ingredientId: findIngredient('Salmão'),
      amount: 200,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Vinagre'),
      amount: 3,
      unit: 'colheres de sopa',
    },
    {
      ingredientId: findIngredient('Açúcar'),
      amount: 1,
      unit: 'colher de sopa',
    },
    { ingredientId: findIngredient('Sal'), amount: 5, unit: 'g' },
    {
      ingredientId: findIngredient('Gengibre'),
      amount: 1,
      unit: 'pedaço',
    },
    {
      ingredientId: findIngredient('Alga nori'),
      amount: 4,
      unit: 'folhas',
    },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: sushi.id,
        order: 1,
        description: 'Cozinhe o arroz com vinagre, açúcar e sal.',
        durationSec: 1200,
      },
      {
        recipeId: sushi.id,
        order: 2,
        description: 'Corte o salmão em fatias finas.',
        durationSec: 300,
      },
      {
        recipeId: sushi.id,
        order: 3,
        description: 'Prepare o gengibre em conserva.',
        durationSec: 180,
      },
      {
        recipeId: sushi.id,
        order: 4,
        description: 'Monte os sushis com arroz e salmão.',
        durationSec: 600,
      },
      {
        recipeId: sushi.id,
        order: 5,
        description: 'Sirva com molho de soja e wasabi.',
        durationSec: 0,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: sushi.id, categoryId: findCategory('Jantar') },
      { recipeId: sushi.id, categoryId: findCategory('Asiática') },
    ],
  })

  // Receita 10: Bolo de Chocolate (Sobremesa)
  console.log('🍰 Criando receita: Bolo de Chocolate...')
  const boloChocolate = await prisma.recipe.create({
    data: {
      title: 'Bolo de Chocolate Fofinho',
      description: 'Bolo de chocolate úmido e delicioso.',
      authorId: adminUser.id,
      difficulty: 'EASY',
      prepTime: 55,
      servings: 8,
      calories: 420,
      proteinGrams: 6.5,
      carbGrams: 58.2,
      fatGrams: 18.5,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(boloChocolate.id, 'Bolo de Chocolate', [
    {
      ingredientId: findIngredient('Farinha de trigo'),
      amount: 200,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Açúcar'),
      amount: 150,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Cacau em pó'),
      amount: 50,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Ovos'),
      amount: 3,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Manteiga'),
      amount: 100,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Fermento em pó'),
      amount: 10,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Leite'),
      amount: 150,
      unit: 'ml',
    },
    {
      ingredientId: findIngredient('Baunilha'),
      amount: 1,
      unit: 'colher de chá',
    },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: boloChocolate.id,
        order: 1,
        description: 'Pré-aqueça o forno a 180°C.',
        durationSec: 0,
      },
      {
        recipeId: boloChocolate.id,
        order: 2,
        description: 'Misture os ingredientes secos.',
        durationSec: 300,
      },
      {
        recipeId: boloChocolate.id,
        order: 3,
        description: 'Bata os ovos com açúcar até clarear.',
        durationSec: 300,
      },
      {
        recipeId: boloChocolate.id,
        order: 4,
        description: 'Adicione manteiga derretida e baunilha.',
        durationSec: 120,
      },
      {
        recipeId: boloChocolate.id,
        order: 5,
        description: 'Misture os ingredientes secos alternando com leite.',
        durationSec: 300,
      },
      {
        recipeId: boloChocolate.id,
        order: 6,
        description: 'Asse por 35 minutos.',
        durationSec: 2100,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: boloChocolate.id, categoryId: findCategory('Sobremesa') },
      { recipeId: boloChocolate.id, categoryId: findCategory('Vegetariano') },
    ],
  })

  // Receita 11: Frango Grelhado (Almoço)
  console.log('🍗 Criando receita: Frango Grelhado...')
  const frangoGrelhado = await prisma.recipe.create({
    data: {
      title: 'Frango Grelhado com Ervas',
      description: 'Frango temperado com ervas e grelhado na perfeição.',
      authorId: regularUser.id,
      difficulty: 'EASY',
      prepTime: 40,
      servings: 4,
      calories: 280,
      proteinGrams: 35.2,
      carbGrams: 2.5,
      fatGrams: 12.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(frangoGrelhado.id, 'Frango Grelhado', [
    {
      ingredientId: findIngredient('Frango'),
      amount: 800,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Azeite'),
      amount: 3,
      unit: 'colheres de sopa',
    },
    {
      ingredientId: findIngredient('Alho'),
      amount: 3,
      unit: 'dentes',
    },
    {
      ingredientId: findIngredient('Manjericão'),
      amount: 1,
      unit: 'maço',
    },
    {
      ingredientId: findIngredient('Salsa'),
      amount: 1,
      unit: 'maço',
    },
    {
      ingredientId: findIngredient('Limão'),
      amount: 1,
      unit: 'unidade',
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
        recipeId: frangoGrelhado.id,
        order: 1,
        description: 'Tempere o frango com sal e pimenta.',
        durationSec: 300,
      },
      {
        recipeId: frangoGrelhado.id,
        order: 2,
        description: 'Prepare o tempero com ervas e azeite.',
        durationSec: 180,
      },
      {
        recipeId: frangoGrelhado.id,
        order: 3,
        description: 'Marine o frango por 30 minutos.',
        durationSec: 1800,
      },
      {
        recipeId: frangoGrelhado.id,
        order: 4,
        description: 'Grelhe por 12 minutos de cada lado.',
        durationSec: 1440,
      },
      {
        recipeId: frangoGrelhado.id,
        order: 5,
        description: 'Sirva com limão espremido.',
        durationSec: 0,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: frangoGrelhado.id, categoryId: findCategory('Almoço') },
      { recipeId: frangoGrelhado.id, categoryId: findCategory('Sem Glúten') },
    ],
  })

  // Receita 12: Ratatouille (Jantar)
  console.log('🍆 Criando receita: Ratatouille...')
  const ratatouille = await prisma.recipe.create({
    data: {
      title: 'Ratatouille Provençal',
      description: 'Prato francês tradicional com legumes mediterrâneos.',
      authorId: adminUser.id,
      difficulty: 'MEDIUM',
      prepTime: 75,
      servings: 6,
      calories: 180,
      proteinGrams: 4.5,
      carbGrams: 22.5,
      fatGrams: 8.2,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(ratatouille.id, 'Ratatouille', [
    {
      ingredientId: findIngredient('Berinjela'),
      amount: 1,
      unit: 'unidade',
    },
    {
      ingredientId: findIngredient('Abobrinha'),
      amount: 2,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Tomate'),
      amount: 3,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Pimentão'),
      amount: 2,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Cebola'),
      amount: 1,
      unit: 'unidade',
    },
    {
      ingredientId: findIngredient('Alho'),
      amount: 3,
      unit: 'dentes',
    },
    {
      ingredientId: findIngredient('Azeite'),
      amount: 4,
      unit: 'colheres de sopa',
    },
    {
      ingredientId: findIngredient('Manjericão'),
      amount: 1,
      unit: 'maço',
    },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: ratatouille.id,
        order: 1,
        description: 'Corte todos os legumes em cubos.',
        durationSec: 900,
      },
      {
        recipeId: ratatouille.id,
        order: 2,
        description: 'Refogue a cebola e alho no azeite.',
        durationSec: 300,
      },
      {
        recipeId: ratatouille.id,
        order: 3,
        description: 'Adicione os legumes em camadas.',
        durationSec: 600,
      },
      {
        recipeId: ratatouille.id,
        order: 4,
        description: 'Cozinhe em fogo baixo por 40 minutos.',
        durationSec: 2400,
      },
      {
        recipeId: ratatouille.id,
        order: 5,
        description: 'Finalize com manjericão fresco.',
        durationSec: 60,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: ratatouille.id, categoryId: findCategory('Jantar') },
      { recipeId: ratatouille.id, categoryId: findCategory('Vegetariano') },
    ],
  })

  // Receita 13: Panqueca Americana (Café da Manhã)
  console.log('🥞 Criando receita: Panqueca Americana...')
  const panqueca = await prisma.recipe.create({
    data: {
      title: 'Panquecas Americanas Fofas',
      description: 'Panquecas fofas e douradas para o café da manhã.',
      authorId: regularUser.id,
      difficulty: 'EASY',
      prepTime: 25,
      servings: 4,
      calories: 220,
      proteinGrams: 8.5,
      carbGrams: 32.5,
      fatGrams: 6.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(panqueca.id, 'Panqueca Americana', [
    {
      ingredientId: findIngredient('Farinha de trigo'),
      amount: 150,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Açúcar'),
      amount: 30,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Fermento em pó'),
      amount: 8,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Ovos'),
      amount: 1,
      unit: 'unidade',
    },
    {
      ingredientId: findIngredient('Leite'),
      amount: 200,
      unit: 'ml',
    },
    {
      ingredientId: findIngredient('Manteiga'),
      amount: 30,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Sal'),
      amount: 2,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Baunilha'),
      amount: 1,
      unit: 'colher de chá',
    },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: panqueca.id,
        order: 1,
        description: 'Misture os ingredientes secos.',
        durationSec: 120,
      },
      {
        recipeId: panqueca.id,
        order: 2,
        description: 'Bata o ovo com leite e manteiga.',
        durationSec: 60,
      },
      {
        recipeId: panqueca.id,
        order: 3,
        description: 'Misture tudo até ficar homogêneo.',
        durationSec: 120,
      },
      {
        recipeId: panqueca.id,
        order: 4,
        description: 'Cozinhe em frigideira antiaderente.',
        durationSec: 900,
      },
      {
        recipeId: panqueca.id,
        order: 5,
        description: 'Sirva com mel ou xarope.',
        durationSec: 0,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: panqueca.id, categoryId: findCategory('Café da Manhã') },
      { recipeId: panqueca.id, categoryId: findCategory('Vegetariano') },
    ],
  })

  // Receita 14: Curry de Frango (Jantar)
  console.log('🍛 Criando receita: Curry de Frango...')
  const curry = await prisma.recipe.create({
    data: {
      title: 'Curry de Frango Indiano',
      description: 'Curry picante e aromático com frango e especiarias.',
      authorId: adminUser.id,
      difficulty: 'MEDIUM',
      prepTime: 55,
      servings: 4,
      calories: 350,
      proteinGrams: 28.5,
      carbGrams: 18.2,
      fatGrams: 18.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(curry.id, 'Curry de Frango', [
    {
      ingredientId: findIngredient('Frango'),
      amount: 600,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Cebola'),
      amount: 1,
      unit: 'unidade',
    },
    {
      ingredientId: findIngredient('Tomate'),
      amount: 2,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Gengibre'),
      amount: 1,
      unit: 'pedaço',
    },
    {
      ingredientId: findIngredient('Alho'),
      amount: 3,
      unit: 'dentes',
    },
    {
      ingredientId: findIngredient('Cúrcuma'),
      amount: 1,
      unit: 'colher de chá',
    },
    {
      ingredientId: findIngredient('Cominho'),
      amount: 1,
      unit: 'colher de chá',
    },
    {
      ingredientId: findIngredient('Leite de coco'),
      amount: 400,
      unit: 'ml',
    },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: curry.id,
        order: 1,
        description: 'Refogue a cebola até dourar.',
        durationSec: 300,
      },
      {
        recipeId: curry.id,
        order: 2,
        description: 'Adicione gengibre, alho e especiarias.',
        durationSec: 120,
      },
      {
        recipeId: curry.id,
        order: 3,
        description: 'Adicione o frango e cozinhe.',
        durationSec: 600,
      },
      {
        recipeId: curry.id,
        order: 4,
        description: 'Adicione tomate e leite de coco.',
        durationSec: 900,
      },
      {
        recipeId: curry.id,
        order: 5,
        description: 'Cozinhe até engrossar e sirva.',
        durationSec: 300,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: curry.id, categoryId: findCategory('Jantar') },
      { recipeId: curry.id, categoryId: findCategory('Asiática') },
    ],
  })

  // Receita 15: Tiramisu (Sobremesa)
  console.log('🍰 Criando receita: Tiramisu...')
  const tiramisu = await prisma.recipe.create({
    data: {
      title: 'Tiramisu Italiano',
      description: 'Sobremesa italiana clássica com café e mascarpone.',
      authorId: regularUser.id,
      difficulty: 'MEDIUM',
      prepTime: 30,
      servings: 8,
      calories: 380,
      proteinGrams: 12.5,
      carbGrams: 28.2,
      fatGrams: 25.8,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  await createRecipeIngredients(tiramisu.id, 'Tiramisu', [
    {
      ingredientId: findIngredient('Mascarpone'),
      amount: 500,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Ovos'),
      amount: 4,
      unit: 'unidades',
    },
    {
      ingredientId: findIngredient('Açúcar'),
      amount: 100,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Café'),
      amount: 200,
      unit: 'ml',
    },
    {
      ingredientId: findIngredient('Rum'),
      amount: 30,
      unit: 'ml',
    },
    {
      ingredientId: findIngredient('Biscoito'),
      amount: 200,
      unit: 'g',
    },
    {
      ingredientId: findIngredient('Cacau em pó'),
      amount: 20,
      unit: 'g',
    },
  ])

  await prisma.step.createMany({
    data: [
      {
        recipeId: tiramisu.id,
        order: 1,
        description: 'Prepare o café forte e deixe esfriar.',
        durationSec: 300,
      },
      {
        recipeId: tiramisu.id,
        order: 2,
        description: 'Bata as gemas com açúcar até clarear.',
        durationSec: 300,
      },
      {
        recipeId: tiramisu.id,
        order: 3,
        description: 'Misture o mascarpone com as gemas.',
        durationSec: 180,
      },
      {
        recipeId: tiramisu.id,
        order: 4,
        description: 'Bata as claras em neve e incorpore.',
        durationSec: 300,
      },
      {
        recipeId: tiramisu.id,
        order: 5,
        description: 'Monte em camadas com biscoitos molhados.',
        durationSec: 600,
      },
      {
        recipeId: tiramisu.id,
        order: 6,
        description: 'Leve à geladeira por 4 horas.',
        durationSec: 0,
      },
    ],
  })

  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: tiramisu.id, categoryId: findCategory('Sobremesa') },
      { recipeId: tiramisu.id, categoryId: findCategory('Italiana') },
    ],
  })

  // Criar algumas avaliações com ratings de 1-5
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
      {
        recipeId: pudim.id,
        userId: adminUser.id,
        rating: 3,
        comment: 'Sobremesa perfeita para qualquer ocasião.',
      },
      {
        recipeId: smoothie.id,
        userId: regularUser.id,
        rating: 4,
        comment: 'Muito saudável e saboroso.',
      },
      {
        recipeId: risotto.id,
        userId: adminUser.id,
        rating: 4,
        comment: 'Risotto cremoso e delicioso.',
      },
      {
        recipeId: caesar.id,
        userId: regularUser.id,
        rating: 3,
        comment: 'Salada refrescante e nutritiva.',
      },
      {
        recipeId: tacos.id,
        userId: adminUser.id,
        rating: 4,
        comment: 'Tacos autênticos e saborosos.',
      },
      {
        recipeId: sushi.id,
        userId: regularUser.id,
        rating: 5,
        comment: 'Sushi perfeito, muito fresco.',
      },
      {
        recipeId: boloChocolate.id,
        userId: adminUser.id,
        rating: 4,
        comment: 'Bolo fofinho e saboroso.',
      },
      {
        recipeId: frangoGrelhado.id,
        userId: regularUser.id,
        rating: 4,
        comment: 'Frango temperado na perfeição.',
      },
      {
        recipeId: ratatouille.id,
        userId: adminUser.id,
        rating: 3,
        comment: 'Prato vegetariano delicioso.',
      },
      {
        recipeId: panqueca.id,
        userId: regularUser.id,
        rating: 4,
        comment: 'Panquecas fofas e perfeitas.',
      },
      {
        recipeId: curry.id,
        userId: adminUser.id,
        rating: 4,
        comment: 'Curry picante e aromático.',
      },
      {
        recipeId: tiramisu.id,
        userId: regularUser.id,
        rating: 5,
        comment: 'Tiramisu clássico e perfeito.',
      },
    ],
  })

  // Criar algumas favoritas
  console.log('❤️ Criando favoritas...')
  await prisma.favorite.createMany({
    data: [
      // Receitas mais favoritadas (para testar ordenação)
      { userId: regularUser.id, recipeId: paoAcucar.id },
      { userId: adminUser.id, recipeId: paoAcucar.id },
      { userId: regularUser.id, recipeId: carbonara.id },
      { userId: adminUser.id, recipeId: carbonara.id },
      { userId: adminUser.id, recipeId: pudim.id },
      { userId: regularUser.id, recipeId: pudim.id },
      { userId: regularUser.id, recipeId: smoothie.id },
      { userId: adminUser.id, recipeId: smoothie.id },
      { userId: regularUser.id, recipeId: risotto.id },
      { userId: adminUser.id, recipeId: risotto.id },
      { userId: regularUser.id, recipeId: caesar.id },
      { userId: adminUser.id, recipeId: tacos.id },
      { userId: regularUser.id, recipeId: sushi.id },
      { userId: adminUser.id, recipeId: boloChocolate.id },
      { userId: regularUser.id, recipeId: frangoGrelhado.id },
      { userId: adminUser.id, recipeId: ratatouille.id },
      { userId: regularUser.id, recipeId: panqueca.id },
      { userId: adminUser.id, recipeId: curry.id },
      { userId: regularUser.id, recipeId: tiramisu.id },
      { userId: adminUser.id, recipeId: tiramisu.id },
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
