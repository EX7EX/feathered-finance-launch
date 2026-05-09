/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_ORDER_BOOK_ADDRESS?: string;
  readonly VITE_TEST_WBTC_ADDRESS?: string;
  readonly VITE_TEST_USDC_ADDRESS?: string;
  readonly VITE_TOKEN_FACTORY_ADDRESS?: string;
  readonly VITE_LAUNCHPAD_ADDRESS?: string;
  readonly VITE_DISTRIBUTION_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
