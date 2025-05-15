# Feathered Finance

A modern financial application built with React, TypeScript, and Supabase.

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Application route pages
- `/src/contexts` - React context providers
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions (including error handling utilities)
- `/src/integrations` - Third-party service integrations (Supabase client configured with environment variables)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase project set up (backend not managed in this repo - see Gaps section)

### Development

1. Clone the repository
2. Set up environment variables: Copy `.env.example` to `.env` and fill in your Supabase credentials.
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

### Supabase Integration

This project uses Supabase for backend functionality. The client is configured to use environment variables for connection.

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

*   **Supabase Backend Management:** The Supabase database schema, migrations, and serverless functions are not managed within this repository. This means the backend setup needs to be handled separately from this codebase.
*   **Automated Testing:** The project currently lacks automated tests (unit, integration, etc.). Implementing tests is crucial for improving code reliability and confidence in making changes.
*   **Comprehensive Type Safety:** While stricter options are enabled in `tsconfig.json` and ESLint, further type-related improvements might be necessary throughout the codebase to fully leverage TypeScript's benefits.
*   **Detailed Documentation:** While this README provides a good overview, more in-depth documentation on specific features, components, and state management could be beneficial.
