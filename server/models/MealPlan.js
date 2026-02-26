import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    breakfast: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Recipe'
    },
    lunch: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Recipe'
    },
    dinner: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Recipe'
    },
    snacks: [{
        type: mongoose.Schema.Types.Mixed,
        ref: 'Recipe'
    }]
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        default: 'My Meal Plan'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    meals: {
        type: [mealSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Meal plan must have at least one day'
        }
    },
    generatedByAI: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Validate that endDate is after startDate
mealPlanSchema.pre('save', function (next) {
    if (this.endDate <= this.startDate) {
        next(new Error('End date must be after start date'));
    } else {
        next();
    }
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;
