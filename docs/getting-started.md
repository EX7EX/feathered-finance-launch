# Getting Started

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git
- Supabase CLI (for local development)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/feathered-finance-launch.git
cd feathered-finance-launch
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_api_url
```

4. Start development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
├── lib/           # Utility functions
├── types/         # TypeScript type definitions
├── styles/        # Global styles
└── tests/         # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run preview` - Preview production build

## Next Steps

- [Architecture Overview](./architecture.md)
- [Development Guide](./development.md)
- [API Documentation](./api/README.md) 