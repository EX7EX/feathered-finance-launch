import { useState, useEffect, useCallback } from 'react';

export function useExchange(pair: string, token?: string) {
  const [orderBook, setOrderBook] = useState<{ bids: any[]; asks: any[] }>({ bids: [], asks: [] });
  const [trades, setTrades] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderBook = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exchange/orderbook?pair=${pair}`);
      if (!res.ok) throw new Error('Failed to fetch order book');
      setOrderBook(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [pair]);

  const fetchTrades = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/exchange/trades?pair=${pair}`);
      if (!res.ok) throw new Error('Failed to fetch trades');
      setTrades(await res.json());
    } catch (e: any) {
      setError(e.message);
    }
  }, [pair]);

  const fetchUserOrders = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch('/api/exchange/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user orders');
      setUserOrders(await res.json());
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);

  useEffect(() => { fetchOrderBook(); fetchTrades(); }, [fetchOrderBook, fetchTrades]);
  useEffect(() => { if (token) fetchUserOrders(); }, [fetchUserOrders, token]);

  const placeOrder = async (side: string, price: number, amount: number) => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch('/api/exchange/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ side, pair, price, amount }),
      });
      if (!res.ok) throw new Error('Failed to place order');
      await fetchOrderBook();
      await fetchTrades();
      await fetchUserOrders();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const cancelOrder = async (id: string) => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch('/api/exchange/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to cancel order');
      await fetchOrderBook();
      await fetchTrades();
      await fetchUserOrders();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return { orderBook, trades, userOrders, placeOrder, cancelOrder, loading, error };
} 