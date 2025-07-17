-- Production Setup Script
-- This script sets up the essential platform infrastructure for production launch
-- NO demo data, NO fake users, NO fake orders

-- 1. Platform Configuration
INSERT INTO platform_config (key, value, description) VALUES
('platform_name', 'Feathered Finance', 'Platform display name'),
('platform_token', 'PEBL', 'Platform utility token symbol'),
('min_order_size_usd', '10', 'Minimum order size in USD'),
('max_leverage', '100', 'Maximum allowed leverage'),
('funding_rate_interval', '8', 'Funding rate interval in hours'),
('maintenance_mode', 'false', 'Platform maintenance mode'),
('kyc_required', 'true', 'KYC requirement for trading'),
('demo_mode', 'false', 'Demo mode disabled for production');

-- 2. Essential Trading Pairs (Real Market Data)
-- These will be populated by market data feeds, not hardcoded
INSERT INTO trading_pairs (base_currency, quote_currency, symbol, min_order_size, max_order_size, price_precision, quantity_precision, maker_fee, taker_fee, is_active, market_type) VALUES
('BTC', 'USDT', 'BTC/USDT', 0.0001, 1000, 2, 6, 0.001, 0.001, true, 'spot'),
('ETH', 'USDT', 'ETH/USDT', 0.001, 10000, 2, 5, 0.001, 0.001, true, 'spot'),
('SOL', 'USDT', 'SOL/USDT', 0.1, 100000, 4, 2, 0.001, 0.001, true, 'spot'),
('BTC', 'USDT', 'BTCUSDT', 0.0001, 1000, 2, 6, 0.0005, 0.0007, true, 'perpetual'),
('ETH', 'USDT', 'ETHUSDT', 0.001, 10000, 2, 5, 0.0005, 0.0007, true, 'perpetual');

-- 3. Platform Token (PEBL) - Only essential platform token
INSERT INTO supported_currencies (code, name, symbol, currency_type, exchange_rate_to_usd, precision, is_active, is_platform_token) VALUES
('PEBL', 'Feathered Finance Token', 'PEBL', 'crypto', 0.10, 8, true, true);

-- 4. Essential Fiat Currencies
INSERT INTO supported_currencies (code, name, symbol, currency_type, exchange_rate_to_usd, precision, is_active) VALUES
('USD', 'US Dollar', 'USD', 'fiat', 1.00, 2, true),
('USDT', 'Tether USD', 'USDT', 'stablecoin', 1.00, 2, true),
('USDC', 'USD Coin', 'USDC', 'stablecoin', 1.00, 2, true);

-- 5. Risk Management Configuration
INSERT INTO risk_config (max_position_size_usd, max_leverage, liquidation_threshold, margin_call_threshold, funding_rate_max) VALUES
(1000000, 100, 0.8, 0.9, 0.0075);

-- 6. Fee Structure
INSERT INTO fee_structure (tier_name, maker_fee, taker_fee, min_volume_usd, max_volume_usd) VALUES
('Standard', 0.001, 0.001, 0, 10000),
('Silver', 0.0008, 0.0008, 10000, 100000),
('Gold', 0.0006, 0.0006, 100000, 1000000),
('Platinum', 0.0004, 0.0004, 1000000, 999999999);

-- 7. System Health Check
INSERT INTO system_health (component, status, last_check, next_check) VALUES
('database', 'healthy', NOW(), NOW() + INTERVAL '5 minutes'),
('api', 'healthy', NOW(), NOW() + INTERVAL '5 minutes'),
('market_data', 'healthy', NOW(), NOW() + INTERVAL '5 minutes'),
('order_matching', 'healthy', NOW(), NOW() + INTERVAL '5 minutes');

-- 8. API Rate Limits
INSERT INTO rate_limits (endpoint, requests_per_minute, requests_per_hour, requests_per_day) VALUES
('/api/orders', 60, 1000, 10000),
('/api/market-data', 120, 2000, 20000),
('/api/balances', 30, 500, 5000),
('/api/trades', 60, 1000, 10000);

-- 9. Market Data Sources Configuration
INSERT INTO market_data_sources (source_name, api_url, api_key_required, is_active, priority) VALUES
('CoinGecko', 'https://api.coingecko.com/api/v3', false, true, 1),
('Binance', 'https://api.binance.com/api/v3', false, true, 2),
('Coinbase', 'https://api.coinbase.com/v2', true, true, 3);

-- 10. Notification Templates
INSERT INTO notification_templates (type, subject, body, is_active) VALUES
('order_filled', 'Order Filled - {symbol}', 'Your {side} order for {amount} {symbol} at {price} has been filled.', true),
('liquidation_warning', 'Liquidation Warning - {symbol}', 'Your position in {symbol} is at risk of liquidation. Please add margin.', true),
('kyc_approved', 'KYC Approved', 'Your KYC verification has been approved. You can now start trading.', true),
('kyc_rejected', 'KYC Rejected', 'Your KYC verification was rejected. Please review and resubmit.', true);

-- 11. Audit Log Configuration
INSERT INTO audit_config (log_level, retention_days, sensitive_fields) VALUES
('info', 365, 'password,api_key,private_key');

-- 12. Compliance Settings
INSERT INTO compliance_config (kyc_provider, aml_enabled, geo_restrictions, restricted_countries) VALUES
('sumsub', true, true, 'US,CN,IR,KP');

-- Production Ready - No Demo Data
-- Market data will be populated by real-time feeds
-- User data will be created through registration
-- Orders will be placed by real users
-- Balances will be managed through deposits/withdrawals 