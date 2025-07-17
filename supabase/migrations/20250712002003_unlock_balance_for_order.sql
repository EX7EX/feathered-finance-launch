-- Function to unlock balance when order is cancelled
create or replace function unlock_balance_for_order(
  p_user_id uuid,
  p_currency text,
  p_amount numeric
) returns void as $$
begin
  update user_balances
  set available_balance = available_balance + p_amount,
      locked_balance = locked_balance - p_amount,
      updated_at = now()
  where user_id = p_user_id and currency = p_currency;
end;
$$ language plpgsql; 