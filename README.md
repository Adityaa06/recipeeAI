# Recipe AI - Smart Meal Planning System

A full-stack MERN application powered by Google Gemini AI for intelligent recipe search, personalized meal planning, and automated shopping list generation.

## 🚀 Features

- **AI-Powered Recipe Search**: Natural language search using Google Gemini API
- **Smart Meal Planning**: Generate weekly meal plans based on dietary preferences
- **Automated Shopping Lists**: Generate shopping lists from meal plans automatically
- **Dietary Restrictions**: Support for vegan, keto, gluten-free, and more
- **Ingredient Substitutions**: AI-suggested alternatives for missing ingredients
- **Recipe Explanations**: Get simplified cooking instructions and nutritional insights
- **Dietary Validation**: Verify recipes against your dietary restrictions

## 📋 Technology Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **Google Gemini API** - AI/NLM capabilities
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Gemini API Key ([Get one here](https://ai.google.dev/))

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/recipe-meal-planner
   JWT_SECRET=your_super_secret_jwt_key_change_this
   GEMINI_API_KEY=your_gemini_api_key_here
   CLIENT_URL=http://localhost:5173
   ```

5. **Start the server**:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:5173`

4. **Build for production** (optional):
   ```bash
   npm run build
   ```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Recipes
- `GET /api/recipes` - Get all recipes (with filters)
- `POST /api/recipes/search` - AI-powered natural language search
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create recipe (protected)
- `PUT /api/recipes/:id` - Update recipe (protected)
- `DELETE /api/recipes/:id` - Delete recipe (protected)

### Meal Plans
- `GET /api/mealplans` - Get user meal plans (protected)
- `GET /api/mealplans/:id` - Get single meal plan (protected)
- `POST /api/mealplans` - Create meal plan (protected)
- `POST /api/mealplans/generate` - Generate AI meal plan (protected)
- `PUT /api/mealplans/:id` - Update meal plan (protected)
- `DELETE /api/mealplans/:id` - Delete meal plan (protected)

### Shopping Lists
- `GET /api/shoppinglists` - Get user shopping lists (protected)
- `GET /api/shoppinglists/:id` - Get single shopping list (protected)
- `POST /api/shoppinglists` - Create shopping list (protected)
- `POST /api/shoppinglists/generate` - Generate from meal plan (protected)
- `PUT /api/shoppinglists/:id` - Update shopping list (protected)
- `DELETE /api/shoppinglists/:id` - Delete shopping list (protected)

### AI Features
- `POST /api/ai/substitute` - Get ingredient substitutions
- `POST /api/ai/explain` - Get recipe explanation
- `POST /api/ai/validate` - Validate dietary restrictions

## 🤖 Google Gemini API Integration

### AI Features Implemented

1. **Natural Language Recipe Search**
   - Parses user queries like "vegan dinner with chickpeas"
   - Extracts ingredients, cuisine, dietary restrictions, cooking time
   - Returns structured search parameters

2. **AI Meal Plan Generation**
   - Generates balanced weekly meal plans
   - Respects dietary restrictions and allergies
   - Considers cuisine preferences

3. **Ingredient Substitution**
   - Suggests diet-compatible alternatives
   - Provides conversion ratios
   - Explains why substitutes work

4. **Recipe Explanation**
   - Simplifies cooking instructions
   - Provides nutritional highlights
   - Offers helpful cooking tips

5. **Dietary Validation**
   - Checks recipe compatibility
   - Identifies problematic ingredients
   - Suggests alternatives

### Sample API Requests

#### AI Recipe Search
```bash
POST /api/recipes/search
{
  "query": "quick vegan breakfast under 20 minutes"
}
```

#### Generate Meal Plan
```bash
POST /api/mealplans/generate
{
  "days": 7,
  "title": "Weekly Vegan Plan"
}
```

#### Get Ingredient Substitutions
```bash
POST /api/ai/substitute
{
  "ingredient": "butter",
  "dietaryRestrictions": ["vegan"]
}
```

## 🎨 Frontend Features

### Pages
- **Home** - Landing page with features showcase
- **Login/Signup** - Authentication with dietary preference selection
- **Dashboard** - User overview with stats and quick actions
- **Recipe Search** - AI-powered search with filters
- **Recipe Details** - Full recipe view with AI features
- **Meal Planner** - Create and manage meal plans
- **Shopping List** - Track ingredients with checkboxes
- **Profile** - Manage dietary preferences and account

### Components
- Responsive Navbar with authentication awareness
- Protected route wrapper
- Reusable recipe cards
- AI-powered search bar
- Loading spinners
- Error handling

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT token authentication
- Protected API routes
- Gemini API key stored server-side only
- Input validation and sanitization
- CORS configuration

## 📁 Project Structure

```
recipe/
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   └── geminiService.js
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## 🧪 Testing

1. **Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Create User**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
   ```

3. **Test AI Search**:
   - Open frontend at http://localhost:5173
   - Navigate to Recipe Search
   - Try: "vegan dinner with chickpeas"

## 📝 Environment Variables

### Server (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/recipe-meal-planner
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```

## 🚀 Deployment

### Backend (Node.js)
- Deploy to platforms like Heroku, Railway, or Render
- Set environment variables in platform dashboard
- Use MongoDB Atlas for production database

### Frontend (React)
- Build: `npm run build` in client directory
- Deploy to Vercel, Netlify, or similar
- Update API base URL for production

## 🤝 Contributing

This is a demonstration project. Feel free to fork and extend!

## 📄 License

ISC

## 🔗 Resources

- [Google Gemini API Documentation](https://ai.google.dev/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Built with ❤️ using MERN Stack and Google Gemini AI**
