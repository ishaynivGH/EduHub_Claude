# LSIeduHub - Learning Platform

A comprehensive EdTech platform for students of all ages, featuring interactive games, progress tracking, teacher dashboards, and multiple subjects.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (with npm or yarn)
- GitHub account
- Supabase account (free tier available)
- Stripe account (for payments)

### Installation

1. **Install dependencies:**
```bash
cd C:\Users\ishay\Desktop\LSIeduHub
npm install
```

2. **Set up environment variables:**
```bash
# Copy the example file
cp .env.example .env.local

# Then edit .env.local and add your:
# - Supabase URL and API key
# - Stripe publishable key
# - Stripe secret key
```

3. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
LSIeduHub/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions
├── public/               # Static assets
├── package.json          # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.ts   # Tailwind config
└── next.config.js       # Next.js config
```

## 🔧 Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + Pastel Theme
- **Payments**: Stripe
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Hosting**: Vercel

## 📋 Development Phases

### Phase 1: MVP Foundation (Weeks 1-4)
- [x] Project setup
- [ ] Supabase integration
- [ ] User authentication (signup/login)
- [ ] Multiple profiles per user
- [ ] Stripe subscriptions
- [ ] First migrated game
- [ ] Progress tracking

### Phase 2: Core Learning (Weeks 5-8)
- [ ] Migrate all 7 English games
- [ ] Lessons/courses structure
- [ ] Progress dashboard
- [ ] Parent dashboard
- [ ] Leaderboards

### Phase 3: Content & Admin (Weeks 9-14)
- [ ] Admin CMS
- [ ] Teacher dashboard
- [ ] Multi-subject (Math, Hebrew)
- [ ] Analytics and reporting

### Phase 4: Scale Content (Weeks 15-20)
- [ ] Science, Chemistry, Calculus
- [ ] Grade-based content organization
- [ ] Bulk content tools

### Phase 5: Mobile Apps (Weeks 21-28)
- [ ] React Native setup
- [ ] iOS app
- [ ] Android app
- [ ] Offline support

## 🔐 Setting Up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your URL and API key
4. Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 💳 Setting Up Stripe

1. Go to [stripe.com](https://stripe.com)
2. Create an account
3. Get your API keys
4. Add to `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
```

## 📦 Build & Deploy

### Build for production:
```bash
npm run build
npm run start
```

### Deploy to Vercel:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

## 🧪 Testing

```bash
npm run lint
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🤝 Contributing

This is a solo project. Feel free to customize and extend as needed!

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

**Status**: 🚧 Under Development (Phase 1)
**Last Updated**: 2026-03-31
