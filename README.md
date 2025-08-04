# Beatrice's Sacred Companion - MVP Setup Guide

## 🌙 Project Overview
A modern spiritual companion app featuring AI mentorship, journaling, and ritual tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Supabase account
- Anthropic API key (for Claude AI) **or** OpenAI API key

### 1. Clone and Install Dependencies
```bash
cd beatrice-companion
npm install
```

### 2. Environment Setup
Copy `env.example` to `.env.local` and fill in your keys:
```bash
cp env.example .env.local
```

Select your AI provider in `.env.local`:

```env
AI_PROVIDER=anthropic   # or "openai"

# If using Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# If using OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Supabase Setup

#### Option A: Use Supabase Cloud (Recommended for MVP)
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API and copy your project URL and anon key
3. Go to SQL Editor and run the schema from `supabase/schema.sql`
4. Update `.env.local` with your Supabase credentials

#### Option B: Local Supabase with Docker
```bash
# Start local Supabase
docker-compose up -d supabase

# Apply schema
docker exec -i beatrice-companion_supabase_1 psql -U postgres -d beatrice_db < supabase/schema.sql
```

### 4. Run the Development Server

#### Without Docker:
```bash
npm run dev
```

#### With Docker:
```bash
docker-compose up app
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure
```
beatrice-companion/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main app pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   └── ui/               # UI components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   └── utils/            # Helper functions
├── types/                 # TypeScript types
├── public/               # Static assets
└── supabase/             # Database schema
```

## 🎯 MVP Features Implemented

### ✅ Phase 1 Core Features
- **Authentication**: Sign up/login with Supabase Auth
- **Dashboard**: Personalized welcome with moon phase tracking
- **Basic UI**: Mystical theme with modern minimalist design
- **Database Schema**: Complete schema for all MVP features
- **Responsive Layout**: Mobile-friendly design

### 🚧 Next Steps (Not Yet Implemented)
1. **Beatrice Chat Interface** (`/dashboard/chat`)
   - Integrate OpenAI API
   - Implement chat sessions
   - Daily check-ins

2. **Journal System** (`/dashboard/journal`)
   - Create/edit entries
   - Tag system
   - Search functionality

3. **Ritual Tracking** (`/dashboard/rituals`)
   - Log rituals
   - Track moon phases
   - Connect to journal

## 🛠 Development Commands

```bash
# Development
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server

# Docker
docker-compose up    # Start all services
docker-compose down  # Stop all services

# Database
npm run db:migrate   # Run migrations (if using Prisma later)
npm run db:seed      # Seed initial data
```

## 🔧 Configuration

### Tailwind CSS
The project uses a custom mystical theme. Key classes:
- `.card-mystical` - Glowing card effect
- `.btn-mystical` - Gradient button
- `.input-mystical` - Styled input
- `.text-gradient` - Gradient text

### Moon Phase Tracking
Automatic moon phase calculation in `lib/utils/moon-phase.ts`

## 🐛 Troubleshooting

### Supabase Connection Issues
- Verify your environment variables
- Check if RLS policies are enabled
- Ensure your IP is whitelisted in Supabase

### Anthropic Connection Issues
- Verify your ANTHROPIC_API_KEY in `.env.local`
- Check if you have credits in your Anthropic account
- Ensure API key starts with `sk-ant-`

### OpenAI Connection Issues
- Verify your OPENAI_API_KEY in `.env.local`
- Confirm your OpenAI account has API access and credits

### Docker Issues
- Run `docker-compose build` if dependencies change
- Check logs: `docker-compose logs -f app`

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`

## 📝 Notes for Development

1. **State Management**: Currently using React Context for auth. Consider Zustand for complex state.

2. **API Routes**: Create in `app/api/` for:
   - OpenAI integration
   - Complex database operations

3. **Components**: Follow the mystical design system established in `globals.css`

4. **Security**: All database operations use RLS. Never expose service role key to client.

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker Production
```bash
docker build -t beatrice-app .
docker run -p 3000:3000 --env-file .env.production beatrice-app
```

## 💜 Happy Coding!
May your code be bug-free and your commits meaningful. 🌙✨