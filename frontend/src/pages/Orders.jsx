import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { orderAPI, walletAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { ArrowRightIcon, BoxIcon, CheckIcon, PackageIcon, WalletIcon } from '../components/Icons';

const ORDER_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

const PAYMENT_LABELS = {
  UPI: 'UPI',
  Card: 'Card',
  Cash: 'Cash on delivery',
  COD: 'Cash on delivery',
  Wallet: 'ShopNet wallet',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState('');
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      orderAPI.getMyOrders().then(({ data }) => {
        setOrders(data);
        setLoading(false);
      });
      walletAPI.getBalance()
        .then(({ data }) => setWalletBalance(Number(data.balance)))
        .catch(() => {});
    }
  }, [user]);

  const formatPrice = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

  const handleCancel = async (order) => {
    if (!window.confirm('Cancel this order? Any amount paid will be refunded to your ShopNet wallet.')) {
      return;
    }

    setCancelingId(order.id);
    try {
      const { data } = await orderAPI.cancelOrder(order.id);
      setOrders((current) => current.map((item) => (
        item.id === order.id
          ? {
            ...item,
            status: 'Cancelled',
            paymentStatus: item.paymentStatus === 'Paid' ? 'Refunded' : item.paymentStatus,
          }
          : item
      )));
      setWalletBalance(Number(data.walletBalance));
      setCancelMessage(
        data.refundedAmount > 0
          ? `Order #${order.id} cancelled. ${formatPrice(data.refundedAmount)} added to your wallet.`
          : `Order #${order.id} cancelled successfully.`
      );
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelingId(null);
    }
  };

  if (!user) {
    return (
      <div className="container page-shell">
        <div className="empty-state empty-state-large">
          <span className="empty-icon"><PackageIcon size={28} /></span>
          <span className="eyebrow">Your orders</span>
          <h2>Sign in to view your orders</h2>
          <p>All your past and current orders live in one place.</p>
          <Link to="/login" className="btn btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="container page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Your account</span>
          <h1>Order history</h1>
          <p>{orders.length > 0 ? `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} placed so far.` : 'Your orders will appear here after checkout.'}</p>
        </div>
        <Link to="/" className="text-link">
          Keep shopping
          <ArrowRightIcon size={16} />
        </Link>
      </div>

      {location.state?.message && (
        <div className="alert success alert-inline">
          <CheckIcon size={17} />
          {location.state.message}
        </div>
      )}

      {cancelMessage && (
        <div className="alert success alert-inline">
          <CheckIcon size={17} />
          {cancelMessage}
        </div>
      )}

      <div className="wallet-banner">
        <span className="wallet-banner-icon"><WalletIcon size={21} /></span>
        <div className="wallet-banner-copy">
          <span>ShopNet wallet</span>
          <strong>{formatPrice(walletBalance)}</strong>
        </div>
        <p>Refunds from cancelled prepaid orders land here and can be used at checkout.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state empty-state-large">
          <span className="empty-icon"><BoxIcon size={28} /></span>
          <h2>No orders yet</h2>
          <p>When you place an order, you&apos;ll be able to follow it from here.</p>
          <Link to="/" className="btn btn-primary">
            Start shopping
            <ArrowRightIcon size={17} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const currentStep = order.status === 'Pending' ? 0 : ORDER_STEPS.indexOf(order.status);
            const isCancelled = order.status === 'Cancelled';
            const canCancel = ['Pending', 'Placed', 'Confirmed'].includes(order.status);

            return (
              <article key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-heading">
                    <span className="order-icon"><PackageIcon size={20} /></span>
                    <div>
                      <strong>Order #{order.id}</strong>
                      <span className="order-date">
                        Placed {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="order-header-actions">
                    <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                    {canCancel && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleCancel(order)}
                        disabled={cancelingId === order.id}
                      >
                        {cancelingId === order.id ? 'Cancelling...' : 'Cancel order'}
                      </button>
                    )}
                  </div>
                </div>

                {!isCancelled && currentStep >= 0 && (
                  <div className="order-progress" aria-label={`Order status: ${order.status}`}>
                    {ORDER_STEPS.map((step, index) => (
                      <div key={step} className={`order-step${index <= currentStep ? ' complete' : ''}`}>
                        <span className="order-step-dot">{index < currentStep ? <CheckIcon size={11} /> : null}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-items-list">
                  {order.items.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="order-item-row">
                      <img src={item.imageUrl} alt={item.productName} />
                      <div className="order-item-copy">
                        <strong>{item.productName}</strong>
                        <span>Qty {item.quantity} · {formatPrice(item.price)} each</span>
                      </div>
                      <span className="order-item-total">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div>
                    <span className="order-label">Delivery to</span>
                    <p className="order-address">{order.shippingAddress}</p>
                  </div>
                  <div>
                    <span className="order-label">Payment</span>
                    <p>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} · <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></p>
                  </div>
                  <div className="order-total">
                    <span className="order-label">Total</span>
                    <strong>{formatPrice(order.totalAmount)}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
