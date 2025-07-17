import fs from 'fs';
import path from 'path';
import { createAdminSupabaseClient } from '../src/integrations/supabase/client';

async function main() {
  const supabase = createAdminSupabaseClient();
  const filePath = path.join(__dirname, 'top100tokens_raw.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const tokens = JSON.parse(raw);
  for (const token of tokens) {
    const symbol = token.symbol.toUpperCase();
    const name = token.name;
    // Check if already exists
    const { data: exists } = await supabase
      .from('supported_currencies')
      .select('code')
      .eq('code', symbol)
      .single();
    if (!exists) {
      await supabase.from('supported_currencies').insert({
        code: symbol,
        name,
        symbol,
        currency_type: 'crypto',
        is_active: true,
        precision: 8
      });
    }
  }
  console.log('Token seeding complete.');
}

main(); 