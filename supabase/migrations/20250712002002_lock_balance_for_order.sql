-- Function to lock balance for orders
create or replace function lock_balance_for_order(
  p_user_id uuid,
  p_currency text,
  p_amount numeric
) returns boolean as $$
declare
  v_available numeric;
begin
  select available_balance into v_available
  from user_balances
  where user_id = p_user_id and currency = p_currency;
  
  if v_available is null or v_available < p_amount then
    return false;
  end if;
  
  update user_balances
  set available_balance = available_balance - p_amount,
      locked_balance = locked_balance + p_amount,
      updated_at = now()
  where user_id = p_user_id and currency = p_currency;
  
  return true;
end;
$$ language plpgsql; 