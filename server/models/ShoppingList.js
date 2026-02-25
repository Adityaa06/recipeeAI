import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema({
    ingredient: {
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
    },
    checked: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const shoppingListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mealPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MealPlan'
    },
    title: {
        type: String,
        trim: true,
        default: 'Shopping List'
    },
    items: {
        type: [shoppingItemSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Shopping list must have at least one item'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

export default ShoppingList;
