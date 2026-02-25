import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Recipe from './models/Recipe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the server directory or parent directory
dotenv.config({ path: join(__dirname, '.env') });
// If .env is in project root, use this instead:
// dotenv.config({ path: join(__dirname, '..', '.env') });

const sampleRecipes = [
    {
        title: 'Chickpea Buddha Bowl',
        description: 'A healthy, colorful vegan bowl packed with protein and nutrients',
        ingredients: [
            { name: 'chickpeas', quantity: '1', unit: 'can' },
            { name: 'quinoa', quantity: '1', unit: 'cup' },
            { name: 'sweet potato', quantity: '1', unit: 'large' },
            { name: 'spinach', quantity: '2', unit: 'cups' },
            { name: 'tahini', quantity: '2', unit: 'tbsp' },
            { name: 'lemon juice', quantity: '1', unit: 'tbsp' }
        ],
        instructions: [
            'Cook quinoa according to package directions',
            'Roast diced sweet potato at 400°F for 25 minutes',
            'Sauté chickpeas with spices for 5 minutes',
            'Arrange quinoa, sweet potato, chickpeas, and spinach in a bowl',
            'Drizzle with tahini-lemon dressing'
        ],
        cookingTime: 35,
        servings: 2,
        difficulty: 'easy',
        dietaryTags: ['vegan', 'gluten-free'],
        cuisine: 'mediterranean',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
    },
    {
        title: 'Classic Margherita Pizza',
        description: 'Traditional Italian pizza with fresh mozzarella and basil',
        ingredients: [
            { name: 'pizza dough', quantity: '1', unit: 'lb' },
            { name: 'tomato sauce', quantity: '1', unit: 'cup' },
            { name: 'fresh mozzarella', quantity: '8', unit: 'oz' },
            { name: 'fresh basil', quantity: '10', unit: 'leaves' },
            { name: 'olive oil', quantity: '2', unit: 'tbsp' }
        ],
        instructions: [
            'Preheat oven to 475°F',
            'Roll out pizza dough to 12-inch circle',
            'Spread tomato sauce evenly',
            'Top with torn mozzarella',
            'Bake for 12-15 minutes until crust is golden',
            'Garnish with fresh basil and olive oil'
        ],
        cookingTime: 25,
        servings: 4,
        difficulty: 'medium',
        dietaryTags: ['vegetarian'],
        cuisine: 'italian',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'
    },
    {
        title: 'Chicken Stir Fry',
        description: 'Quick and easy Asian-inspired chicken with vegetables',
        ingredients: [
            { name: 'chicken breast', quantity: '1', unit: 'lb' },
            { name: 'broccoli', quantity: '2', unit: 'cups' },
            { name: 'bell pepper', quantity: '1', unit: 'large' },
            { name: 'soy sauce', quantity: '3', unit: 'tbsp' },
            { name: 'ginger', quantity: '1', unit: 'tbsp' },
            { name: 'garlic', quantity: '3', unit: 'cloves' }
        ],
        instructions: [
            'Cut chicken into bite-sized pieces',
            'Heat oil in wok or large pan',
            'Cook chicken until golden, remove',
            'Stir-fry vegetables for 3-4 minutes',
            'Add chicken back with sauce',
            'Serve over rice'
        ],
        cookingTime: 20,
        servings: 3,
        difficulty: 'easy',
        dietaryTags: ['gluten-free'],
        cuisine: 'chinese',
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800'
    },
    {
        title: 'Keto Avocado Egg Salad',
        description: 'Low-carb, high-fat salad perfect for keto diet',
        ingredients: [
            { name: 'eggs', quantity: '4', unit: 'large' },
            { name: 'avocado', quantity: '2', unit: 'ripe' },
            { name: 'mayonnaise', quantity: '2', unit: 'tbsp' },
            { name: 'mustard', quantity: '1', unit: 'tsp' },
            { name: 'chives', quantity: '2', unit: 'tbsp' }
        ],
        instructions: [
            'Hard boil eggs for 10 minutes',
            'Peel and chop eggs',
            'Mash avocados in bowl',
            'Mix in mayo, mustard, and chives',
            'Fold in chopped eggs',
            'Serve on lettuce wraps or alone'
        ],
        cookingTime: 15,
        servings: 2,
        difficulty: 'easy',
        dietaryTags: ['keto', 'low-carb', 'gluten-free'],
        cuisine: 'american',
        imageUrl: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800'
    },
    {
        title: 'Pad Thai',
        description: 'Authentic Thai rice noodle dish with peanuts and lime',
        ingredients: [
            { name: 'rice noodles', quantity: '8', unit: 'oz' },
            { name: 'shrimp', quantity: '1', unit: 'lb' },
            { name: 'eggs', quantity: '2', unit: 'large' },
            { name: 'bean sprouts', quantity: '1', unit: 'cup' },
            { name: 'peanuts', quantity: '1/4', unit: 'cup' },
            { name: 'fish sauce', quantity: '3', unit: 'tbsp' },
            { name: 'tamarind paste', quantity: '2', unit: 'tbsp' }
        ],
        instructions: [
            'Soak rice noodles in warm water for 30 minutes',
            'Cook shrimp in wok, set aside',
            'Scramble eggs in wok, set aside',
            'Stir-fry noodles with sauce',
            'Add shrimp, eggs, and bean sprouts',
            'Top with peanuts and lime wedges'
        ],
        cookingTime: 30,
        servings: 4,
        difficulty: 'medium',
        dietaryTags: ['gluten-free'],
        cuisine: 'thai',
        imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800'
    },
    {
        title: 'Vegetarian Tacos',
        description: 'Colorful and flavorful Mexican tacos with black beans',
        ingredients: [
            { name: 'black beans', quantity: '1', unit: 'can' },
            { name: 'corn', quantity: '1', unit: 'cup' },
            { name: 'bell peppers', quantity: '2', unit: 'medium' },
            { name: 'tortillas', quantity: '8', unit: 'small' },
            { name: 'cheese', quantity: '1', unit: 'cup' },
            { name: 'salsa', quantity: '1/2', unit: 'cup' }
        ],
        instructions: [
            'Sauté bell peppers until soft',
            'Add black beans and corn',
            'Warm tortillas',
            'Fill with bean mixture',
            'Top with cheese and salsa',
            'Serve with lime wedges'
        ],
        cookingTime: 15,
        servings: 4,
        difficulty: 'easy',
        dietaryTags: ['vegetarian'],
        cuisine: 'mexican',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800'
    },
    {
        title: 'Red Lentil Dal',
        description: 'Comforting and nutritious Indian lentil stew',
        ingredients: [
            { name: 'red lentils', quantity: '1', unit: 'cup' },
            { name: 'coconut milk', quantity: '1', unit: 'can' },
            { name: 'turmeric', quantity: '1', unit: 'tsp' },
            { name: 'cumin', quantity: '1', unit: 'tsp' },
            { name: 'onion', quantity: '1', unit: 'large' }
        ],
        instructions: [
            'Sauté onions with spices',
            'Add lentils and water, simmer for 15 mins',
            'Stir in coconut milk',
            'Serve with rice or naan'
        ],
        cookingTime: 25,
        servings: 4,
        difficulty: 'easy',
        dietaryTags: ['vegan', 'gluten-free'],
        cuisine: 'indian',
        imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800'
    },
    {
        title: 'Greek Salad',
        description: 'Fresh and crunchy Mediterranean salad',
        ingredients: [
            { name: 'cucumber', quantity: '1', unit: 'large' },
            { name: 'tomatoes', quantity: '3', unit: 'large' },
            { name: 'feta cheese', quantity: '4', unit: 'oz' },
            { name: 'olives', quantity: '1/2', unit: 'cup' }
        ],
        instructions: [
            'Chop vegetables into large chunks',
            'Toss with olive oil and oregano',
            'Top with feta and olives'
        ],
        cookingTime: 10,
        servings: 2,
        difficulty: 'easy',
        dietaryTags: ['vegetarian', 'gluten-free'],
        cuisine: 'mediterranean',
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800'
    },
    {
        title: 'Beef Broccoli',
        description: 'Classic savory Chinese stir-fry',
        ingredients: [
            { name: 'flank steak', quantity: '1', unit: 'lb' },
            { name: 'broccoli', quantity: '3', unit: 'cups' },
            { name: 'oyster sauce', quantity: '2', unit: 'tbsp' }
        ],
        instructions: [
            'Thinly slice beef',
            'Stir fry beef until browned',
            'Add broccoli and sauce, cook until tender'
        ],
        cookingTime: 20,
        servings: 3,
        difficulty: 'medium',
        dietaryTags: [],
        cuisine: 'chinese',
        imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800'
    },
    {
        title: 'Quinoa Salad',
        description: 'Protein-packed salad with lemon vinaigrette',
        ingredients: [
            { name: 'quinoa', quantity: '1', unit: 'cup' },
            { name: 'parsley', quantity: '1/2', unit: 'cup' },
            { name: 'lemon', quantity: '1', unit: 'whole' }
        ],
        instructions: [
            'Cook quinoa',
            'Toss with chopped parsley and lemon juice'
        ],
        cookingTime: 15,
        servings: 2,
        difficulty: 'easy',
        dietaryTags: ['vegan', 'gluten-free'],
        cuisine: 'american',
        imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800'
    },
    {
        title: 'Mushroom Risotto',
        description: 'Creamy Italian rice dish with earthy mushrooms',
        ingredients: [
            { name: 'arborio rice', quantity: '1', unit: 'cup' },
            { name: 'mushrooms', quantity: '8', unit: 'oz' },
            { name: 'parmesan', quantity: '1/2', unit: 'cup' }
        ],
        instructions: [
            'Sauté mushrooms',
            'Slowly add broth to rice, stirring constantly',
            'Finish with cheese and butter'
        ],
        cookingTime: 40,
        servings: 2,
        difficulty: 'hard',
        dietaryTags: ['vegetarian'],
        cuisine: 'italian',
        imageUrl: 'https://images.unsplash.com/photo-1476124369491-b79d9ce43a83?w=800'
    },
    {
        title: 'Spaghetti Aglio e Olio',
        description: 'Simple and delicious garlic and oil pasta',
        ingredients: [
            { name: 'spaghetti', quantity: '8', unit: 'oz' },
            { name: 'garlic', quantity: '6', unit: 'cloves' },
            { name: 'chili flakes', quantity: '1', unit: 'tsp' }
        ],
        instructions: [
            'Boil pasta',
            'Sauté sliced garlic in plenty of olive oil',
            'Toss and serve'
        ],
        cookingTime: 15,
        servings: 2,
        difficulty: 'easy',
        dietaryTags: ['vegan'],
        cuisine: 'italian',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'
    },
    {
        title: 'Falafel Wrap',
        description: 'Middle Eastern street food favorite',
        ingredients: [
            { name: 'falafel balls', quantity: '6', unit: 'pieces' },
            { name: 'pita bread', quantity: '2', unit: 'pieces' },
            { name: 'hummus', quantity: '4', unit: 'tbsp' }
        ],
        instructions: [
            'Bake or fry falafel',
            'Spread hummus on pita',
            'Wrap and enjoy'
        ],
        cookingTime: 15,
        servings: 2,
        difficulty: 'easy',
        dietaryTags: ['vegan', 'vegetarian'],
        cuisine: 'middle eastern',
        imageUrl: 'https://images.unsplash.com/photo-1593000434077-b6e5c253d14c?w=800'
    },
    {
        title: 'Grilled Salmon',
        description: 'Healthy and flavorful grilled fish',
        ingredients: [
            { name: 'salmon fillet', quantity: '1', unit: 'lb' },
            { name: 'lemon', quantity: '1', unit: 'whole' },
            { name: 'dill', quantity: '1', unit: 'tbsp' }
        ],
        instructions: [
            'Season salmon with salt, pepper, and dill',
            'Grill for 4-5 minutes per side'
        ],
        cookingTime: 15,
        servings: 2,
        difficulty: 'medium',
        dietaryTags: ['gluten-free'],
        cuisine: 'american',
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800'
    },
    {
        title: 'Caprese Skewers',
        description: 'Easy appetizer with tomato, mozzarella, and basil',
        ingredients: [
            { name: 'cherry tomatoes', quantity: '12', unit: 'pieces' },
            { name: 'bocconcini', quantity: '12', unit: 'pieces' },
            { name: 'basil', quantity: '12', unit: 'leaves' }
        ],
        instructions: [
            'Thread tomato, basil, and cheese onto skewers',
            'Drizzle with balsamic glaze'
        ],
        cookingTime: 10,
        servings: 4,
        difficulty: 'easy',
        dietaryTags: ['vegetarian', 'gluten-free'],
        cuisine: 'italian',
        imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800'
    },
    {
        title: 'Black Bean Soup',
        description: 'Hearty and spicy protein-filled soup',
        ingredients: [
            { name: 'black beans', quantity: '2', unit: 'cans' },
            { name: 'onion', quantity: '1', unit: 'medium' },
            { name: 'cumin', quantity: '1', unit: 'tbsp' }
        ],
        instructions: [
            'Sauté onions',
            'Add beans and water, simmer',
            'Blend half for creaminess'
        ],
        cookingTime: 20,
        servings: 4,
        difficulty: 'easy',
        dietaryTags: ['vegan', 'gluten-free'],
        cuisine: 'mexican',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'
    },
    {
        title: 'Minestrone',
        description: 'Classic Italian vegetable soup',
        ingredients: [
            { name: 'zucchini', quantity: '1', unit: 'medium' },
            { name: 'carrots', quantity: '2', unit: 'medium' },
            { name: 'pasta', quantity: '1/2', unit: 'cup' }
        ],
        instructions: [
            'Simmer vegetables in broth',
            'Add pasta and cook until tender'
        ],
        cookingTime: 30,
        servings: 4,
        difficulty: 'medium',
        dietaryTags: ['vegetarian'],
        cuisine: 'italian',
        imageUrl: 'https://images.unsplash.com/photo-1604908815604-e7ac8c0cfe69?w=800'
    },
    {
        title: 'Hummus Plate',
        description: 'Simple snacking or light lunch option',
        ingredients: [
            { name: 'hummus', quantity: '1', unit: 'cup' },
            { name: 'cucumber', quantity: '1', unit: 'medium' },
            { name: 'carrots', quantity: '2', unit: 'large' }
        ],
        instructions: [
            'Slice vegetables',
            'Serve with hummus'
        ],
        cookingTime: 5,
        servings: 1,
        difficulty: 'easy',
        dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
        cuisine: 'middle eastern',
        imageUrl: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=800'
    },
    {
        title: 'Banana Pancakes',
        description: 'Easy 3-ingredient healthy breakfast',
        ingredients: [
            { name: 'banana', quantity: '2', unit: 'ripe' },
            { name: 'eggs', quantity: '2', unit: 'large' },
            { name: 'oats', quantity: '1/2', unit: 'cup' }
        ],
        instructions: [
            'Mash bananas',
            'Whisk in eggs and oats',
            'Cook on griddle until golden brown'
        ],
        cookingTime: 10,
        servings: 2,
        difficulty: 'easy',
        dietaryTags: ['vegetarian', 'gluten-free'],
        cuisine: 'american',
        imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800'
    },
    {
        title: 'Greek Yogurt Parfait',
        description: 'Healthy layered breakfast with fruit and nuts',
        ingredients: [
            { name: 'greek yogurt', quantity: '1', unit: 'cup' },
            { name: 'honey', quantity: '1', unit: 'tbsp' },
            { name: 'mixed berries', quantity: '1/2', unit: 'cup' },
            { name: 'walnuts', quantity: '2', unit: 'tbsp' }
        ],
        instructions: [
            'Layer yogurt, berries, and nuts in a glass',
            'Drizzle with honey'
        ],
        cookingTime: 5,
        servings: 1,
        difficulty: 'easy',
        dietaryTags: ['vegetarian', 'gluten-free'],
        cuisine: 'mediterranean',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'
    }
];



async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create a default user for seeding
        const existingUser = await User.findOne({ email: 'demo@example.com' });

        let demoUser;
        if (!existingUser) {
            demoUser = await User.create({
                username: 'demo',
                email: 'demo@example.com',
                password: 'password123',
                dietaryRestrictions: ['vegetarian'],
                allergies: [],
                cuisinePreferences: ['italian', 'mexican', 'thai']
            });
            console.log('Created demo user');
        } else {
            demoUser = existingUser;
            console.log('Using existing demo user');
        }

        // Clear existing recipes (optional)
        await Recipe.deleteMany({});
        console.log('Cleared existing recipes');

        // Add createdBy to all sample recipes
        const recipesWithUser = sampleRecipes.map(recipe => ({
            ...recipe,
            createdBy: demoUser._id
        }));

        // Insert sample recipes
        const insertedRecipes = await Recipe.insertMany(recipesWithUser);
        console.log(`Inserted ${insertedRecipes.length} sample recipes`);

        console.log('\\n✅ Database seeded successfully!');
        console.log('\\nDemo Account:');
        console.log('Email: demo@example.com');
        console.log('Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
