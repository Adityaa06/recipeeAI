import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        trim: true
    }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.Mixed,
        default: () => new mongoose.Types.ObjectId()
    },
    title: {
        type: String,
        required: [true, 'Recipe title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long']
    },
    description: {
        type: String,
        required: [true, 'Recipe description is required'],
        trim: true
    },
    ingredients: {
        type: [ingredientSchema],
        required: [true, 'At least one ingredient is required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Recipe must have at least one ingredient'
        }
    },
    instructions: {
        type: [String],
        required: [true, 'Cooking instructions are required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Recipe must have at least one instruction step'
        }
    },
    cookingTime: {
        type: Number,
        required: [true, 'Cooking time is required'],
        min: [1, 'Cooking time must be at least 1 minute']
    },
    servings: {
        type: Number,
        required: [true, 'Number of servings is required'],
        min: [1, 'Servings must be at least 1']
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    dietaryTags: [{
        type: String,
        enum: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 'halal', 'kosher', 'other']
    }],
    cuisine: {
        type: String,
        enum: ['italian', 'chinese', 'indian', 'mexican', 'japanese', 'thai', 'mediterranean', 'american', 'french', 'korean', 'middle eastern', 'greek', 'american', 'other'],
        default: 'other'
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/400x300?text=Recipe+Image'
    },
    source: {
        type: String,
        enum: ['seeded', 'user', 'ai'],
        default: 'user'
    },
    isAIGenerated: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for text search on title and description
recipeSchema.index({ title: 'text', description: 'text' });

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
