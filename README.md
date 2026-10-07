🍔 Quigoo

Quigoo is a modern food discovery and delivery web application designed to connect customers with local restaurants and food businesses.

The platform provides a clean restaurant browsing experience, food categories, promotional offers, location-based discovery, favorites, cart functionality, and a restaurant-owner entry point — all wrapped in a fast, responsive Next.js interface.

«Discover local food. Order what you love.»

---

✨ Features

🏠 Customer Experience

- Modern food delivery landing page
- Restaurant discovery
- Food category navigation
- Search restaurants and food
- Location-based delivery selection
- Restaurant sorting
- Active category/filter indicators
- Restaurant cards with images
- Favorite restaurants
- Shopping cart
- Promotional offers
- Responsive design

🍽️ Restaurant Discovery

- Restaurant listings
- Restaurant ratings/details
- Featured restaurant badges
- Restaurant photography
- Food category filtering
- Restaurant sorting
- Favorite/save functionality

🛒 Cart

- Add food items to cart
- Cart item counter
- Quick cart access
- Order-oriented UI

🏪 Restaurant Owners

- Dedicated restaurant-owner entry point
- Designed for future restaurant management features

---

🖥️ Tech Stack

Technology| Purpose
Next.js 16| Full-stack React framework
React 19| Frontend UI
TypeScript| Type-safe development
Tailwind CSS 4| Styling
PostgreSQL| Database
Drizzle ORM| Database ORM
Node.js| Runtime
ESLint| Code quality
PostCSS| CSS processing

---

📁 Project Structure

quigoo/
│
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   └── ...
│   │
│   └── db/
│       └── schema.ts
│
├── public/
│   └── images/
│       └── quigoo-hero.jpg
│
├── drizzle.config.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
├── package.json
└── README.md

---

🚀 Getting Started

1. Clone the repository

git clone <your-repository-url>
cd quigoo

2. Install dependencies

npm install

3. Setup PostgreSQL

Make sure PostgreSQL is installed and running locally.

Create a database named:

app_db

The current Drizzle configuration expects:

postgresql://postgres:postgres@127.0.0.1:5432/app_db

If your PostgreSQL credentials are different, update the database configuration accordingly.

---

🗄️ Database

Quigoo uses PostgreSQL + Drizzle ORM.

Database schema:

src/db/schema.ts

Drizzle configuration:

drizzle.config.json

After configuring the database, generate/apply the database schema using the appropriate Drizzle commands.

---

▶️ Run the Development Server

npm run dev

Open:

http://localhost:3000

---

🏗️ Build for Production

Create a production build:

npm run build

Start the production server:

npm start

---

🧪 Development Commands

Start development server

npm run dev

Build application

npm run build

Start production server

npm start

Run ESLint

npm run lint

Type checking

npm run typecheck

---

🎨 Design System

Quigoo uses a warm, modern visual identity focused on local food discovery.

Primary Colors

Dark Green  #18362f
Lime        #d5ef62
Orange      #f08d69
Peach       #f9e4d9
Paper       #fbfaf6
White       #ffffff

The interface combines:

- Deep green backgrounds
- Lime-green CTAs
- Warm orange accents
- Soft cream backgrounds
- Editorial-style typography
- Rounded restaurant cards
- Large food imagery

---

📱 Responsive Design

Quigoo is designed for:

- 🖥️ Desktop
- 💻 Laptop
- 📱 Mobile
- 📲 Tablet

The layout adapts restaurant grids, navigation, search, offers, and category sections for smaller screens.

---

🔮 Planned Features

The project can be expanded into a complete food-delivery platform with:

- [ ] User authentication
- [ ] Restaurant registration
- [ ] Restaurant owner dashboard
- [ ] Food menu management
- [ ] Add-to-cart backend
- [ ] Order placement
- [ ] Order tracking
- [ ] Online payments
- [ ] Delivery partner dashboard
- [ ] Live delivery tracking
- [ ] Customer reviews & ratings
- [ ] Coupons and promo codes
- [ ] Push notifications
- [ ] Location-based restaurant discovery
- [ ] Admin dashboard
- [ ] Restaurant analytics
- [ ] Order history
- [ ] AI-powered food recommendations

---

🏪 Platform Architecture

                    ┌──────────────────────┐
                    │       Customer       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Quigoo Frontend   │
                    │      Next.js         │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │      Backend/API     │
                    │      Next.js         │
                    └──────────┬───────────┘
                               │
                     ┌─────────▼─────────┐
                     │   Drizzle ORM     │
                     └─────────┬─────────┘
                               │
                     ┌─────────▼─────────┐
                     │    PostgreSQL     │
                     └───────────────────┘

     Restaurant ───────────────┘
     Delivery Partner ─────────┘
     Admin ────────────────────┘

---

🔐 Environment Variables

For production, database credentials and other secrets should be stored using environment variables rather than hardcoded configuration.

Example:

DATABASE_URL=postgresql://username:password@localhost:5432/app_db

Never commit passwords, API keys, or other secrets to GitHub.

---

🌐 Deployment

Quigoo can be deployed using platforms that support Next.js applications.

Typical deployment flow:

GitHub
   │
   ▼
Deployment Platform
   │
   ├── Next.js Application
   │
   └── Environment Variables
            │
            ▼
       PostgreSQL

For production, use a hosted PostgreSQL database instead of the local:

127.0.0.1:5432

---

🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

git checkout -b feature/new-feature

3. Make your changes
4. Run checks

npm run lint
npm run typecheck
npm run build

5. Commit your changes

git commit -m "Add new feature"

6. Push the branch

git push origin feature/new-feature

7. Open a Pull Request

---

📄 License

This project is currently intended for development and educational purposes.

Add an appropriate open-source license before distributing the project publicly.

---

💚 About Quigoo

Quigoo aims to make local food discovery and delivery simpler, faster, and more accessible, especially by helping customers discover restaurants and food businesses in their area.

Built with Next.js + PostgreSQL + Drizzle ORM.

🍔 Quigoo — Local food, delivered.
