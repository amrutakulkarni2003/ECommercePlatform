import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, walletAPI } from '../api';
import {
  ArrowRightIcon,
  BagIcon,
  CardIcon,
  CashIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
  TruckIcon,
  UpiIcon,
  WalletIcon,
} from '../components/Icons';

const PAYMENT_METHODS = [
  {
    id: 'UPI',
    label: 'UPI',
    description: 'Google Pay, PhonePe, Paytm & more',
    Icon: UpiIcon,
  },
  {
    id: 'Card',
    label: 'Credit / Debit card',
    description: 'Visa, Mastercard, RuPay & Amex',
    Icon: CardIcon,
  },
  {
    id: 'Cash',
    label: 'Cash on delivery',
    description: 'Pay in cash when your order arrives',
    Icon: CashIcon,
  },
];

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [placedOrder, setPlacedOrder] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const formatPrice = (value) => `₹${Number(value).toLocaleString('en-IN')}`;
  const walletInsufficient = totalPrice > walletBalance;
  const paymentOptions = [
    ...PAYMENT_METHODS,
    {
      id: 'Wallet',
      label: 'ShopNet wallet',
      description: walletInsufficient
        ? `Balance ${formatPrice(walletBalance)} · Not enough for this order`
        : `Balance ${formatPrice(walletBalance)} available`,
      Icon: WalletIcon,
    },
  ];

  useEffect(() => {
    if (user) {
      walletAPI.getBalance()
        .then(({ data }) => setWalletBalance(Number(data.balance)))
        .catch(() => {});
    }
  }, [user]);

  const handleCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    setCard({ ...card, number: digits.replace(/(\d{4})(?=\d)/g, '$1 ') });
  };

  const handleExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCard({
      ...card,
      expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits,
    });
  };

  if (!user) {
    return (
      <div className="container page-shell">
        <div className="empty-state empty-state-large">
          <span className="empty-icon"><BagIcon size={28} /></span>
          <span className="eyebrow">Your bag</span>
          <h2>Sign in to see your cart</h2>
          <p>Your selected items will be waiting for you once you sign in.</p>
          <Link to="/login" className="btn btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setPlacing(true);
    const orderAmount = totalPrice;
    try {
      const { data } = await orderAPI.placeOrder({
        shippingAddress: address,
        paymentMethod,
      });
      clearCart();
      setPlacedOrder({
        orderId: data.orderId,
        amount: orderAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash' ? 'Pending' : 'Paid',
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const goToOrders = () => {
    navigate('/orders', {
      state: { message: `Order #${placedOrder.orderId} placed successfully.` },
    });
  };

  const changeQuantity = (id, quantity) => {
    updateQuantity(id, quantity).catch((error) => {
      alert(error.response?.data?.message || 'Could not update quantity');
    });
  };

  const successModal = placedOrder && (
    <div
      className="order-success-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div className="order-success-card">
        <span className="order-success-icon"><CheckIcon size={30} strokeWidth={2.4} /></span>
        <span className="eyebrow">Order placed</span>
        <h2 id="order-success-title">Order placed successfully!</h2>
        <p>
          {placedOrder.paymentMethod === 'Cash'
            ? `Your order is placed. We will confirm it shortly. Pay ${formatPrice(placedOrder.amount)} in cash when it arrives.`
            : placedOrder.paymentMethod === 'Wallet'
              ? `Your ShopNet wallet was charged ${formatPrice(placedOrder.amount)}.`
              : `We received your ${placedOrder.paymentMethod} payment of ${formatPrice(placedOrder.amount)}.`}
        </p>

        <div className="order-success-meta">
          <div>
            <span>Order</span>
            <strong>#{placedOrder.orderId}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{placedOrder.paymentMethod}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatPrice(placedOrder.amount)}</strong>
          </div>
        </div>

        <div className="order-success-actions">
          <button type="button" className="btn btn-primary btn-full" onClick={goToOrders}>
            View my orders
            <ArrowRightIcon size={17} />
          </button>
          <button type="button" className="btn btn-outline btn-full" onClick={() => navigate('/')}>
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <>
        {successModal}
        <div className="container page-shell">
          <div className="empty-state empty-state-large">
            <span className="empty-icon"><BagIcon size={28} /></span>
            <span className="eyebrow">Your bag</span>
            <h2>Your cart is feeling light</h2>
            <p>Explore the collection and add something worth keeping.</p>
            <Link to="/" className="btn btn-primary">
              Continue shopping
              <ArrowRightIcon size={17} />
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {successModal}
      <div className="container page-shell">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Your bag</span>
            <h1>Shopping cart</h1>
            <p>{items.length} {items.length === 1 ? 'item' : 'items'} ready to make your everyday a little better.</p>
          </div>
          <Link to="/" className="text-link">
            Continue shopping
            <ArrowRightIcon size={16} />
          </Link>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article key={item.id} className="cart-item">
                <Link to={`/product/${item.productId}`} className="cart-item-media">
                  <img src={item.imageUrl} alt={item.productName} />
                </Link>

                <div className="cart-item-info">
                  <Link to={`/product/${item.productId}`} className="cart-item-name">
                    {item.productName}
                  </Link>
                  <p className="cart-item-price">{formatPrice(item.discountPrice || item.price)} each</p>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-selector" aria-label={`Quantity for ${item.productName}`}>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon size={15} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      disabled={item.quantity >= item.stock}
                      title={item.quantity >= item.stock ? 'Maximum available stock reached' : undefined}
                    >
                      <PlusIcon size={15} />
                    </button>
                  </div>
                  <p className="cart-item-total">{formatPrice((item.discountPrice || item.price) * item.quantity)}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="btn-remove"
                    aria-label={`Remove ${item.productName}`}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <span className="eyebrow">Almost yours</span>
            <h2>Order summary</h2>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span className="summary-free">Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="summary-note">
              <TruckIcon size={17} />
              <span>Free delivery included on this order.</span>
            </div>

            {!showCheckout ? (
              <button type="button" onClick={() => setShowCheckout(true)} className="btn btn-primary btn-full btn-lg">
                Proceed to checkout
                <ArrowRightIcon size={18} />
              </button>
            ) : (
              <form onSubmit={handlePlaceOrder} className="checkout-form">
                <label htmlFor="shipping-address">Shipping address</label>
                <textarea
                  id="shipping-address"
                  placeholder="House number, street, city, state, PIN code"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  required
                  rows={4}
                />

                <span className="checkout-label">Payment method</span>
                <div className="payment-methods" role="radiogroup" aria-label="Payment method">
                  {paymentOptions.map(({ id, label, description, Icon }) => {
                    const selected = paymentMethod === id;
                    const disabled = id === 'Wallet' && walletInsufficient;
                    return (
                      <button
                        type="button"
                        key={id}
                        role="radio"
                        aria-checked={selected}
                        className={`payment-option${selected ? ' selected' : ''}${disabled ? ' is-disabled' : ''}`}
                        onClick={() => setPaymentMethod(id)}
                        disabled={disabled}
                        title={disabled ? 'Add refunds to your wallet first, or choose another payment method.' : undefined}
                      >
                        <span className="payment-icon"><Icon size={19} /></span>
                        <span className="payment-option-copy">
                          <strong>{label}</strong>
                          <small>{description}</small>
                        </span>
                        <span className={`payment-check${selected ? '' : ' is-empty'}`}>
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="payment-fields">
                    <label className="field">
                      <span>UPI ID</span>
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={(event) => setUpiId(event.target.value)}
                        autoComplete="off"
                        pattern="[^@\s]+@[^@\s]+"
                        title="Enter a valid UPI ID, for example name@bank"
                        required
                      />
                    </label>
                    <p className="payment-hint">
                      <UpiIcon size={14} />
                      You&apos;ll get a collect request in your UPI app. Approve it to pay instantly.
                    </p>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="payment-fields">
                    <label className="field">
                      <span>Card number</span>
                      <input
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        value={card.number}
                        onChange={(event) => handleCardNumber(event.target.value)}
                        autoComplete="cc-number"
                        maxLength={19}
                        pattern="[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}"
                        title="Enter the 16-digit card number"
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Name on card</span>
                      <input
                        placeholder="Name as printed on the card"
                        value={card.name}
                        onChange={(event) => setCard({ ...card, name: event.target.value })}
                        autoComplete="cc-name"
                        required
                      />
                    </label>
                    <div className="field-row">
                      <label className="field">
                        <span>Expiry</span>
                        <input
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={(event) => handleExpiry(event.target.value)}
                          autoComplete="cc-exp"
                          inputMode="numeric"
                          maxLength={5}
                          pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                          title="Use MM/YY format"
                          required
                        />
                      </label>
                      <label className="field">
                        <span>CVV</span>
                        <input
                          type="password"
                          placeholder="123"
                          value={card.cvv}
                          onChange={(event) => setCard({
                            ...card,
                            cvv: event.target.value.replace(/\D/g, '').slice(0, 3),
                          })}
                          autoComplete="cc-csc"
                          inputMode="numeric"
                          maxLength={3}
                          pattern="[0-9]{3}"
                          title="3-digit CVV"
                          required
                        />
                      </label>
                    </div>
                    <p className="payment-hint">
                      <ShieldIcon size={14} />
                      Demo mode — card details stay in your browser and are never sent or stored.
                    </p>
                  </div>
                )}

                {paymentMethod === 'Cash' && (
                  <div className="payment-fields">
                    <p className="payment-hint">
                      <CashIcon size={15} />
                      Pay {formatPrice(totalPrice)} in cash when your order arrives. Please keep exact change ready.
                    </p>
                  </div>
                )}

                {paymentMethod === 'Wallet' && (
                  <div className="payment-fields">
                    <p className="payment-hint">
                      <WalletIcon size={15} />
                      Available balance: <strong>{formatPrice(walletBalance)}</strong>. {formatPrice(totalPrice)} will be deducted instantly.
                    </p>
                    <p className="payment-hint">
                      <ShieldIcon size={14} />
                      Refunds from cancelled prepaid orders are added to this wallet automatically.
                    </p>
                  </div>
                )}

                <p className="payment-demo-note">
                  <ShieldIcon size={13} />
                  Secure demo checkout. No real money is charged.
                </p>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={placing || (paymentMethod === 'Wallet' && walletInsufficient)}
                >
                  {placing ? 'Placing order...' : `Place order · ${formatPrice(totalPrice)}`}
                </button>

                <p className="secure-note">
                  <ShieldIcon size={15} />
                  Secure checkout. Your details stay private.
                </p>
              </form>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
