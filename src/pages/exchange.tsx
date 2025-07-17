
import { useExchange } from '@/hooks/use-exchange';
import { usePrice } from '@/hooks/use-price';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const Exchange = () => {
  const { token } = useAuth();
  const { orderBook, trades, userOrders, placeOrder, cancelOrder, loading, error } = useExchange('PEBL/USDT', token);
  const { price: peblPrice } = usePrice('pebl');
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    await placeOrder(side, Number(price), Number(amount));
    setPlacing(false);
    setPrice('');
    setAmount('');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>PEBL/USDT Exchange</h1>
      <div>PEBL Price: {peblPrice ? `$${peblPrice}` : 'N/A'}</div>
      <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
        <div style={{ flex: 1 }}>
          <h2>Order Book</h2>
          <div>Bids:</div>
          <ul>
            {orderBook.bids.map(o => (
              <li key={o.id}>{o.price} x {o.amount}</li>
            ))}
          </ul>
          <div>Asks:</div>
          <ul>
            {orderBook.asks.map(o => (
              <li key={o.id}>{o.price} x {o.amount}</li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Recent Trades</h2>
          <ul>
            {trades.map(t => (
              <li key={t.id}>{t.price} x {t.amount} ({t.taker_side})</li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ marginTop: 32 }}>
        <h2>Place Order</h2>
        <select value={side} onChange={e => setSide(e.target.value)} style={{ marginRight: 8 }}>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <input
          placeholder="Price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handlePlaceOrder} disabled={placing || !price || !amount}>
          {placing ? 'Placing...' : 'Submit'}
        </button>
      </div>
      <div style={{ marginTop: 32 }}>
        <h2>Your Orders</h2>
        {userOrders.length === 0 ? (
          <div>No open orders.</div>
        ) : (
          <ul>
            {userOrders.map(o => (
              <li key={o.id}>
                {o.side} {o.amount} @ {o.price} [{o.status}] {' '}
                <button onClick={() => cancelOrder(o.id)} disabled={o.status !== 'open'}>
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default Exchange;
