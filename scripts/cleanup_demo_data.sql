-- Cleanup Demo Data Script
-- This script removes all demo data and prepares the database for production

-- 1. Remove demo users and their data
DELETE FROM user_balances WHERE user_id LIKE 'demo-user-%';
DELETE FROM orders WHERE user_id LIKE 'demo-user-%';
DELETE FROM trades WHERE user_id LIKE 'demo-user-%';
DELETE FROM positions WHERE user_id LIKE 'demo-user-%';
DELETE FROM audit_logs WHERE user_id LIKE 'demo-user-%';

-- 2. Remove demo orders (any remaining)
DELETE FROM orders WHERE status = 'demo' OR user_id IS NULL;

-- 3. Remove demo trades
DELETE FROM trades WHERE trade_id LIKE 'demo-%';

-- 4. Remove demo positions
DELETE FROM positions WHERE position_id LIKE 'demo-%';

-- 5. Reset order book to empty (real orders will populate)
DELETE FROM order_book WHERE 1=1;

-- 6. Clear any demo market data
UPDATE supported_currencies 
SET exchange_rate_to_usd = 0, 
    market_cap = 0, 
    volume_24h = 0, 
    price_change_24h = 0, 
    price_change_percentage_24h = 0,
    last_price_update = NULL
WHERE code IN ('BTC', 'ETH', 'SOL', 'ADA', 'DOT') 
AND exchange_rate_to_usd > 0;

-- 7. Remove demo price history
DELETE FROM price_history WHERE currency IN ('BTC', 'ETH', 'SOL', 'ADA', 'DOT');

-- 8. Reset system counters
UPDATE system_health SET 
    status = 'healthy',
    last_check = NOW(),
    next_check = NOW() + INTERVAL '5 minutes'
WHERE component IN ('database', 'api', 'market_data', 'order_matching');

-- 9. Clear any demo notifications
DELETE FROM notifications WHERE user_id LIKE 'demo-user-%';

-- 10. Reset platform statistics
UPDATE platform_stats SET 
    total_users = 0,
    total_volume_24h = 0,
    total_trades_24h = 0,
    active_orders = 0,
    last_updated = NOW();

-- 11. Clear demo audit logs
DELETE FROM audit_logs WHERE action LIKE '%demo%' OR user_id LIKE 'demo-user-%';

-- 12. Reset any demo configurations
UPDATE platform_config SET value = 'false' WHERE key = 'demo_mode';

-- Production Ready - Database is now clean
-- Real users will register and create their own data
-- Market data will be populated by real-time feeds
-- Orders will be placed by real users
-- Balances will be managed through deposits/withdrawals 