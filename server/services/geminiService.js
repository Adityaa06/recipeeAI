import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Gemini AI Service for Recipe and Meal Planning Intelligence
 */
class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        this.imageModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    /**
     * Helper to execute AI calls with retry logic
     */
    async withRetry(operation, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                const isRetryable = error.status === 503 || error.status === 429 || error.message?.includes('fetch failed');

                if (!isRetryable || attempt === maxRetries) break;

                const delay = Math.pow(2, attempt) * 1000;
                console.warn(`⚠️ AI attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }

    /**
     * Fetch a real food image from Google Images
     * @param {string} title - The title of the recipe
     * @returns {Promise<string|null>} Image URL or null
     */
    async fetchGoogleImage(title) {
        try {
            const query = encodeURIComponent(`${title} food`);

            // Option A: Google Custom Search API (Recommended)
            const apiKey = process.env.GOOGLE_SEARCH_KEY;
            const cx = process.env.GOOGLE_SEARCH_CX;

            if (apiKey && cx) {
                console.log(`🔍 Using Google Custom Search API for: ${title}`);
                const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${cx}&searchType=image&key=${apiKey}&num=1&safe=active`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    return data.items[0].link;
                }
            }

            // Option B: Direct Google Images Scraping Fallback
            console.log(`🕸️ Using Google Images scraping for: ${title}`);
            const searchUrl = `https://www.google.com/search?tbm=isch&q=${query}`;
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const html = await response.text();

            // Simple regex to find image URLs in Google's initial search results
            // This looks for high-res images in JSON-like structures often found in the source
            const imgRegex = /"(https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=[^"]+)"/g;
            const matches = [...html.matchAll(imgRegex)];

            if (matches && matches.length > 0) {
                // Return a random one from the first 5 to ensure variety
                const randomIndex = Math.floor(Math.random() * Math.min(matches.length, 5));
                return matches[randomIndex][1];
            }

            return null;
        } catch (error) {
            console.error(`❌ Google Image fetch failed for ${title}:`, error.message);
            return null;
        }
    }

    /**
     * Generate a unique food image based on recipe title
     * @param {string} recipeTitle - The title of the recipe
     * @returns {Promise<string>} Base64 image data or URL
     */
    async generateImage(recipeTitle) {
        try {
            console.log(`🎨 Generating AI image for: ${recipeTitle}`);
            const prompt = `Ultra realistic professional food photography of ${recipeTitle}, Indian cuisine, rich texture, detailed garnish, restaurant presentation, shallow depth of field, natural lighting, high resolution, 4K food photography`;

            const result = await this.withRetry(() => this.imageModel.generateContent(prompt));
            const response = await result.response;

            // For Gemini 2.0+ Flash, if it generates an image, it will be in the parts
            const candidates = response.candidates;
            if (candidates && candidates[0]?.content?.parts) {
                for (const part of candidates[0].content.parts) {
                    if (part.inlineData) {
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            }

            console.warn(`⚠️ No image found in AI response for: ${recipeTitle}. Falling back to Google Images...`);
            return await this.fetchGoogleImage(recipeTitle);
        } catch (error) {
            console.error(`❌ Image generation failed for ${recipeTitle}:`, error.message);
            console.log(`🔄 Attempting Google Image fallback for: ${recipeTitle}`);
            return await this.fetchGoogleImage(recipeTitle);
        }
    }

    /**
     * Parse natural language query to extract recipe search parameters
     * @param {string} query - User's natural language query
     * @returns {Promise<Object>} Parsed search parameters
     */
    async parseRecipeQuery(query) {
        try {
            const prompt = `You are a recipe search assistant. Parse the following user query and extract structured information.
      
User query: "${query}"

Extract and return ONLY a valid JSON object with these fields:
{
  "ingredients": ["list", "of", "ingredients"],
  "mealType": "breakfast/lunch/dinner/snack",
  "dietaryRestrictions": ["vegan", "gluten-free", etc.],
  "cuisine": "italian/chinese/indian/etc.",
  "cookingTime": number in minutes or null,
  "difficulty": "easy/medium/hard" or null
}

Rules:
- Return ONLY the JSON object, no additional text
- Use null for fields that cannot be determined
- Use lowercase for all values
- dietaryRestrictions must be an array (can be empty)
- ingredients must be an array (can be empty)

JSON:`;

            const result = await this.withRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse AI response');
            }

            const parsed = JSON.parse(jsonMatch[0]);
            return parsed;
        } catch (error) {
            console.error('Error parsing recipe query:', error);
            // Return fallback structure
            return {
                ingredients: [],
                mealType: null,
                dietaryRestrictions: [],
                cuisine: null,
                cookingTime: null,
                difficulty: null
            };
        }
    }

    /**
     * Generate a personalized meal plan using AI
     * @param {Object} params - Meal plan generation parameters
     * @param {Array} availableRecipes - List of recipes available in the database
     * @returns {Promise<Object>} Generated meal plan
     */
    async generateMealPlan(params, availableRecipes = []) {
        const {
            days = 7,
            dietaryRestrictions = [],
            allergies = [],
            cuisinePreferences = [],
            calorieTarget = null
        } = params;

        try {
            const recipeList = availableRecipes.map(r => `- ${r.title} (ID: ${r._id})`).join('\n');

            const prompt = `You are an expert nutritionist and meal planner. Generate a ${days}-day meal plan using ONLY the following available recipes from the database.
            
Available Recipes:
${recipeList}

Requirements:
${dietaryRestrictions.length > 0 ? `- Dietary restrictions: ${dietaryRestrictions.join(', ')}` : '- No specific dietary restrictions'}
${allergies.length > 0 ? `- Allergies to avoid: ${allergies.join(', ')}` : '- No known allergies'}
${cuisinePreferences.length > 0 ? `- Preferred cuisines: ${cuisinePreferences.join(', ')}` : '- Any cuisine'}
${calorieTarget ? `- Target calories per day: ${calorieTarget}` : '- No calorie target'}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "day": "Monday",
    "breakfastId": "Recipe ID string",
    "lunchId": "Recipe ID string",
    "dinnerId": "Recipe ID string"
  }
]

Rules:
- Generate exactly ${days} days
- For each meal, provide the "ID" from the Available Recipes list provided above.
- IMPORTANT: Ensure MAXIMUM variety. Use as many different unique recipes as possible from the list. 
- Try NOT to repeat the same recipe within the same day or even the same week if enough unique recipes are available.
- Each meal must be safe for the given restrictions and allergies.
- Return ONLY the JSON array, no additional text.

JSON:`;

            const result = await this.withRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.error('AI Response text:', text);
                throw new Error('Failed to parse AI meal plan response');
            }

            const mealPlan = JSON.parse(jsonMatch[0]);
            return mealPlan;
        } catch (error) {
            console.error('Error generating meal plan:', error);
            throw new Error('Failed to generate meal plan with AI');
        }
    }

    /**
     * Suggest ingredient substitutions
     * @param {string} ingredient - Original ingredient
     * @param {Array<string>} dietaryRestrictions - User's dietary restrictions
     * @param {string} recipeTitle - Optional context for where the ingredient is used
     * @returns {Promise<Array>} Array of substitution suggestions
     */
    async suggestSubstitutions(ingredient, dietaryRestrictions = [], recipeTitle = '') {
        try {
            const context = recipeTitle ? ` in the context of the recipe "${recipeTitle}"` : '';
            const prompt = `You are a culinary expert. Suggest substitutes for the following ingredient${context}.

Ingredient: "${ingredient}"
${dietaryRestrictions.length > 0 ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}` : 'No dietary restrictions'}

Return ONLY a valid JSON array of substitution objects:
[
  {
    "substitute": "Ingredient name",
    "reason": "Why this is a good substitute",
    "ratio": "Conversion ratio (e.g., 1:1, 2:1)"
  }
]

Rules:
- Suggest 3-5 practical substitutes
- All substitutes must comply with the dietary restrictions
- Return ONLY the JSON array, no additional text

JSON:`;

            const result = await this.withRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Failed to parse AI substitution response');
            }

            const substitutions = JSON.parse(jsonMatch[0]);
            return substitutions;
        } catch (error) {
            console.error('Error suggesting substitutions:', error);
            return [];
        }
    }

    /**
     * Explain a recipe in simple terms with nutritional insights
     * @param {Object} recipe - Recipe object
     * @returns {Promise<Object>} Recipe explanation
     */
    async explainRecipe(recipe) {
        try {
            const prompt = `You are a friendly cooking instructor. Explain this recipe in simple, encouraging terms.

Recipe: ${recipe.title}
Ingredients: ${recipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}
Instructions: ${recipe.instructions.join(' ')}

Provide a JSON object with:
{
  "simplifiedSteps": ["Step 1 in simple language", "Step 2...", ...],
  "nutritionalHighlights": "Brief nutritional benefits",
  "tips": ["Helpful tip 1", "Helpful tip 2", ...]
}

Rules:
- Use simple, encouraging language
- Provide 2-3 helpful cooking tips
- Return ONLY the JSON object, no additional text

JSON:`;

            const result = await this.withRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse AI explanation response');
            }

            const explanation = JSON.parse(jsonMatch[0]);
            return explanation;
        } catch (error) {
            console.error('Error explaining recipe:', error);
            return {
                simplifiedSteps: recipe.instructions,
                nutritionalHighlights: 'Nutritional information not available',
                tips: []
            };
        }
    }

    /**
     * Validate if a recipe matches dietary restrictions
     * @param {Object} recipe - Recipe object
     * @param {Array<string>} restrictions - Dietary restrictions to check
     * @returns {Promise<Object>} Validation result
     */
    async validateDietaryRestrictions(recipe, restrictions) {
        if (!restrictions || restrictions.length === 0) {
            return { isValid: true, warnings: [], alternatives: [] };
        }

        try {
            const prompt = `You are a dietary compliance expert. Analyze if this recipe is safe for the given dietary restrictions.

Recipe: ${recipe.title}
Ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}
Dietary Restrictions: ${restrictions.join(', ')}

Return ONLY a valid JSON object:
{
  "isValid": true/false,
  "warnings": ["Warning 1", "Warning 2", ...],
  "alternatives": ["Alternative suggestion 1", ...]
}

Rules:
- isValid should be false if ANY ingredient violates restrictions
- Provide specific warnings about problematic ingredients
- Suggest alternatives if recipe is not valid
- Return ONLY the JSON object, no additional text

JSON:`;

            const result = await this.withRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse AI validation response');
            }

            const validation = JSON.parse(jsonMatch[0]);
            return validation;
        } catch (error) {
            console.error('Error validating dietary restrictions:', error);
            return {
                isValid: true,
                warnings: ['Unable to validate dietary restrictions'],
                alternatives: []
            };
        }
    }

    /**
     * AI-driven recipe search
     * @param {string} query - User's search query
     * @param {Object} userPreferences - User's dietary preferences and restrictions
     * @returns {Promise<Object>} AI-generated search keywords and suggestions
     */
    async searchRecipesWithAI(query, userPreferences = {}) {
        try {
            const prompt = `You are a recipe search assistant. Based on the user's search query, suggest relevant recipes.

User Query: "${query}"

${userPreferences.dietaryRestrictions ? `Dietary Restrictions: ${userPreferences.dietaryRestrictions.join(', ')}` : ''}
${userPreferences.cuisine ? `Preferred Cuisine: ${userPreferences.cuisine}` : ''}
${userPreferences.cookingTime ? `Max Cooking Time: ${userPreferences.cookingTime} minutes` : ''}

Please provide a JSON response with search keywords and suggestions:
{
  "searchKeywords": ["keyword1", "keyword2", "keyword3"],
  "suggestedRecipeTypes": ["type1", "type2"],
  "cuisineSuggestions": ["cuisine1", "cuisine2"],
  "reasoning": "Brief explanation of the search interpretation"
}

Focus on understanding the intent behind the query. For example:
- "healthy breakfast" → vegetarian, low-calorie, breakfast recipes
- "quick dinner" → recipes under 30 minutes, dinner category
- "comfort food" → hearty, satisfying recipes`;

            const result = await this.withRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid AI response format');
            }

            const aiSuggestions = JSON.parse(jsonMatch[0]);
            return aiSuggestions;
        } catch (error) {
            console.error('Error in AI recipe search:', error);
            throw new Error('Failed to process AI search query');
        }
    }

    /**
     * Generate complete recipes using AI when database search returns insufficient results
     * @param {string} query - User's search query
     * @param {number} count - Number of recipes to generate
     * @returns {Promise<Array>} Array of AI-generated recipe objects
     */
    async generateRecipe(query, count = 3) {
        try {
            const prompt = `You are a professional chef and recipe creator. Generate ${count} complete, realistic, and authentic recipes based on the user's search query.

User Query: "${query}"

Generate ${count} different recipes that match this query. Return ONLY a valid JSON array with this EXACT structure:
[
  {
    "title": "Recipe Name",
    "description": "Detailed, appetizing description of the dish (2-3 sentences)",
    "ingredients": [
      {
        "name": "ingredient name",
        "quantity": "amount",
        "unit": "measurement unit (cup/tbsp/tsp/gram/piece/etc.)"
      }
    ],
    "instructions": [
      "Step 1: Detailed instruction",
      "Step 2: Detailed instruction",
      "Step 3: Detailed instruction"
    ],
    "cookingTime": number_in_minutes,
    "servings": number_of_servings,
    "difficulty": "easy|medium|hard",
    "dietaryTags": ["vegan", "vegetarian", "gluten-free", "dairy-free", "keto", "paleo", "low-carb", "halal", "kosher"],
    "cuisine": "italian|chinese|indian|mexican|japanese|thai|mediterranean|american|french|korean|middle eastern|greek|other"
  }
]

CRITICAL RULES:
1. Generate REAL, AUTHENTIC recipes from world culinary knowledge
2. Each recipe must be DIFFERENT and UNIQUE
3. Include 6-12 ingredients per recipe
4. Include 4-8 detailed instruction steps
5. Cooking time should be realistic (15-90 minutes)
6. Servings typically 2-6
7. Use only the exact values from the enums provided above
8. dietaryTags should be an array (can be empty if none apply)
9. All measurements must be specific and realistic
10. Instructions must be clear, step-by-step, and professional
11. Return ONLY the JSON array, no additional text or markdown

JSON:`;

            const result = await this.withRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.error('AI Response text:', text);
                throw new Error('Failed to parse AI recipe generation response');
            }

            const recipes = JSON.parse(jsonMatch[0]);

            // Generate images for each recipe concurrently
            console.log(`🖼️ Generating ${recipes.length} images for AI recipes...`);
            const recipesWithImages = await Promise.all(recipes.map(async (recipe) => {
                const imageUrl = await this.generateImage(recipe.title);
                return {
                    ...recipe,
                    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
                };
            }));

            // Returning clean objects to be persisted by the controller
            return recipesWithImages.map(recipe => ({
                ...recipe,
                source: 'ai',
                isAIGenerated: true
            }));
        } catch (error) {
            console.error('Error generating recipes with AI:', error);
            throw new Error('Failed to generate recipes with AI');
        }
    }
}

export default new GeminiService();
