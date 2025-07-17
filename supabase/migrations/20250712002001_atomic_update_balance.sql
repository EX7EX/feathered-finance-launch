-- Function for atomic balance updates
create or replace function atomic_update_balance(
  p_user_id uuid,
  p_currency text,
  p_amount numeric,
  p_reason text default 'trade',
  p_trade_id uuid default null
) returns void as $$
declare
  v_balance_before numeric;
  v_balance_after numeric;
begin
  -- Get current balance
  select balance into v_balance_before
  from user_balances
  where user_id = p_user_id and currency = p_currency;
  
  if v_balance_before is null then
    -- Create new balance record
    insert into user_balances (user_id, currency, balance, available_balance)
    values (p_user_id, p_currency, p_amount, p_amount);
    v_balance_before := 0;
    v_balance_after := p_amount;
  else
    -- Update existing balance
    v_balance_after := v_balance_before + p_amount;
    update user_balances
    set balance = v_balance_after,
        available_balance = available_balance + p_amount,
        updated_at = now()
    where user_id = p_user_id and currency = p_currency;
  end if;
  
  -- Record balance change
  insert into balance_history (
    user_id, currency, change_amount, balance_before, balance_after, reason, related_trade_id
  ) values (
    p_user_id, p_currency, p_amount, v_balance_before, v_balance_after, p_reason, p_trade_id
  );
end;
$$ language plpgsql; 