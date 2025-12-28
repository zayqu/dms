// dms/client/src/components/SellerSaleForm.jsx
import React, { forwardRef, useImperativeHandle } from 'react';
import apiClient from '../services/api';
import { enqueue, startQueueProcessor, getQueue } from '../utils/syncQueue';

const SellerSaleForm = forwardRef(function SellerSaleForm(props, ref) {
  const { onSaved } = props;
  const [items, setItems] = React.useState([]);
  const [paymentMethod, setPaymentMethod] = React.useState('Mpesa');
  const [queuedCount, setQueuedCount] = React.useState(0);

  useImperativeHandle(ref, () => ({ addLine: (product) => addLine(product) }));

  React.useEffect(() => {
    startQueueProcessor({ intervalMs: 60_000 });
    const t = setInterval(async () => { const q = await getQueue(); setQueuedCount(q.length); }, 1500);
    (async ()=>{ const q = await getQueue(); setQueuedCount(q.length); })();
    return () => clearInterval(t);
  }, []);

  const addLine = (product) => setItems(prev => [...prev, { productId: product._id, name: product.name, qty: 1, unitPrice: product.sellPrice }]);

  const updateLine = (i, key, val) => {
    const copy = items.slice();
    copy[i][key] = (key === 'qty' || key === 'unitPrice') ? Number(val) : val;
    setItems(copy);
  };

  const removeLine = (i) => setItems(items.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (items.length === 0) return alert('Add items');
    const payload = {
      type: 'sale',
      items: items.map(it => ({ productId: it.productId, qty: it.qty, unitPrice: it.unitPrice })),
      paymentMethod
    };

    try {
      await apiClient.api('/api/transactions', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      setItems([]);
      const q = await getQueue(); setQueuedCount(q.length);
      if (onSaved) onSaved();
      alert('Sale recorded');
    } catch (err) {
      console.warn('Save failed, enqueueing', err && err.message ? err.message : err);
      try {
        await enqueue('transaction', payload);
        const q = await getQueue(); setQueuedCount(q.length);
        setItems([]);
        alert('You are offline — sale saved locally and will sync when online.');
        startQueueProcessor();
      } catch (enqErr) {
        console.error('enqueue failed', enqErr);
        alert('Failed to save sale. Try again.');
      }
    }
  };

  const total = items.reduce((s, i) => s + (i.qty * i.unitPrice), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h4>Sale</h4>
        <div style={{ fontSize: 13, color: queuedCount ? '#c0392b' : '#0b6' }}>
          {queuedCount ? `${queuedCount} queued` : 'All synced'}
        </div>
      </div>

      <div className="card">
        <div>
          <label>Payment</label>
          <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option>Mpesa</option><option>AirtelMoney</option><option>Cash</option><option>Bank</option>
          </select>
        </div>

        <div style={{ marginTop: 8 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{it.name}</div>
              </div>
              <input className="input" style={{ width: 80 }} type="number" value={it.qty} onChange={e => updateLine(i, 'qty', e.target.value)} />
              <input className="input" style={{ width: 100 }} type="number" value={it.unitPrice} onChange={e => updateLine(i, 'unitPrice', e.target.value)} />
              <button className="btn" onClick={() => removeLine(i)}>X</button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <div style={{ fontWeight: 700 }}>Total: {total} TZS</div>
          <button className="btn" onClick={submit}>Complete Sale</button>
        </div>
      </div>
    </div>
  );
});

export default SellerSaleForm;