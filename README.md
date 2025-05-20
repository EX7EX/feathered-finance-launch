# Feathered Finance

A modern financial application built with React, TypeScript, and Supabase.

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Application route pages
- `/src/contexts` - React context providers
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions (including error handling utilities)
- `/src/integrations` - Third-party service integrations (Supabase client configured with environment variables)
- `/supabase` - Supabase CLI configuration and **database migrations**

## Getting Started

### Prerequisites

- Node.js 16+ and npm (or Bun)
- **Supabase CLI installed** (recommended via Homebrew on macOS: `brew install supabase/tap/supabase`)
- Access to the linked Supabase project (ask a team member for the project reference ID and necessary permissions)

### Development

1. Clone the repository
2. Set up environment variables: Copy `.env.example` to `.env` and fill in your Supabase credentials.
3. **Set up Supabase CLI:**
    - Log in to your Supabase account: `supabase login`
    - Link your local project to the remote Supabase project (replace `YOUR_PROJECT_REF` with the actual ID): `supabase link --project-ref YOUR_PROJECT_REF`
    - Pull the latest database schema migrations: `supabase migration pull`
4. Install dependencies: `bun install` (or `npm install`)
5. Start development server: `npm run dev`

### Supabase Integration

This project uses Supabase for backend functionality. The client is configured to use environment variables for connection.

**Database Schema Management:** The database schema is managed using Supabase CLI migrations, version-controlled in the `/supabase/migrations` directory. After pulling or applying migrations that change the schema, remember to generate updated TypeScript types:

```bash
supabase gen types --schema public > src/integrations/supabase/types.ts
```

Key tables (as referenced in the provided snippet - verify with your Supabase project):

- `profiles` - User profile information
- `crypto_wallets` - User cryptocurrency wallets
- `transactions` - Record of all user transactions
- `supported_currencies` - Available currencies for trading

## Deployment

- Push to main branch to trigger deployment via Lovable, or
- Run `npm run build` and deploy the `dist` folder to your hosting provider (configured in vite.config.ts)
- For mobile deployment, use Capacitor: `npm run build && npx cap sync`

## Best Practices

- Use TypeScript interfaces for component props.
- Follow folder structure conventions for new components.
- Add descriptive commit messages.
- Adhere to ESLint rules for code quality (stricter rules are now enabled).
- Utilize the provided error handling utilities in `src/lib/errorHandling.ts`.

## Areas for Improvement and Known Gaps

Based on a project audit, the following significant gaps and areas for improvement exist:

*   **Automated Testing:** The project currently lacks automated tests (unit, integration, etc.). Implementing tests is crucial for improving code reliability and confidence in making changes.
*   **Comprehensive Type Safety:** While stricter options are enabled in `tsconfig.json` and ESLint, further type-related improvements might be necessary throughout the codebase to fully leverage TypeScript's benefits.
*   **Detailed Documentation:** While this README provides a good overview, more in-depth documentation on specific features, components, and state management (e.g., state management library usage, data fetching patterns) could be beneficial beyond this README.
*   **Supabase Backend Management (Ongoing):** While the framework for managing schema via migrations is now established, actively defining and evolving the full database schema and any necessary Supabase Functions within this repository is an ongoing task.
