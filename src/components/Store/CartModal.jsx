import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import './CartModal.css';

export default function CartModal() {
  const { isOpen, items, total, removeItem, closeCart, clearCart } = useCart();
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle, redirecting, success
  const params = useParams();
  const artistSlug = params?.slug || 'nehuen-lozano';

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setCheckoutStatus('redirecting');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          artistSlug,
        }),
      });

      if (!res.ok) throw new Error('Error al generar la preferencia de pago');
      const { init_point } = await res.json();
      
      // Clear local cart just before redirecting so they return to a clean state
      clearCart();
      
      // Redirect cleanly to Mercado Pago Checkout Pro Gate
      window.location.href = init_point;
    } catch (e) {
      console.error(e);
      alert('❌ Ocurrió un error al procesar el pago con Mercado Pago. Por favor, inténtelo de nuevo.');
      setCheckoutStatus('idle');
    }
  };

  return (
    <div className="cart-backdrop" onClick={closeCart}>
      <aside className="cart-modal glass-strong" onClick={(e) => e.stopPropagation()}>
        <header className="cart-modal__header">
          <h2 className="cart-modal__title font-display">Tu Bóveda</h2>
          <button className="cart-modal__close" onClick={closeCart} aria-label="Cerrar carrito">
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-modal__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="cart-modal__empty-icon">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="font-mono">Tu carrito está vacío</p>
            <button className="cart-modal__shop-btn font-mono" onClick={closeCart}>
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="cart-modal__items">
              {items.map((item) => (
                <article key={item.id} className="cart-item">
                  <div
                    className="cart-item__cover-mini"
                    style={{ background: `linear-gradient(135deg, ${item.coverColor}, #111)` }}
                  />
                  <div className="cart-item__details">
                    <h4 className="cart-item__title">{item.title}</h4>
                    <span className="cart-item__type font-mono">{item.type}</span>
                  </div>
                  <div className="cart-item__action">
                    <span className="cart-item__price font-mono">${item.price}</span>
                    <button
                      className="cart-item__remove"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Eliminar ${item.title}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <footer className="cart-modal__footer">
              <div className="cart-modal__summary">
                <span className="font-mono">Total</span>
                <span className="cart-modal__total font-display">${total.toLocaleString('es-AR')}</span>
              </div>

              <button
                className={`cart-modal__checkout-btn font-mono ${
                  checkoutStatus !== 'idle' ? 'cart-modal__checkout-btn--loading' : ''
                }`}
                onClick={handleCheckout}
                disabled={checkoutStatus !== 'idle'}
              >
                {checkoutStatus === 'idle' && (
                  <>
                    <span>INICIAR PAGO</span>
                    <span className="cart-modal__mp-tag">Mercado Pago</span>
                  </>
                )}
                {checkoutStatus === 'redirecting' && <span>REDIRECCIONANDO...</span>}
                {checkoutStatus === 'success' && <span>✓ PAGO EXITOSO</span>}
              </button>
              
              <p className="cart-modal__mp-hint font-mono">
                Redirección segura a la pasarela oficial.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
