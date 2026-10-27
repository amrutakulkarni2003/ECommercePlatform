import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, productAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import {
  BoxIcon,
  ChartIcon,
  ClipboardIcon,
  PackageIcon,
  PlusIcon,
  UsersIcon,
} from '../components/Icons';

const PAYMENT_LABELS = {
  UPI: 'UPI',
  Card: 'Card',
  Cash: 'Cash on delivery',
  COD: 'Cash on delivery',
};

const STATUS_FLOW = {
  Pending: ['Confirmed', 'Cancelled'],
  Placed: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const statusOptionsFor = (status) => [status, ...(STATUS_FLOW[status] || [])];

const EMPTY_PRODUCT = {
  name: '',
  brand: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '',
  imageUrl: '',
  categoryId: '',
};

const TABS = [
  { id: 'dashboard', label: 'Overview', Icon: ChartIcon },
  { id: 'orders', label: 'Orders', Icon: ClipboardIcon },
  { id: 'products', label: 'Products', Icon: BoxIcon },
  { id: 'users', label: 'Customers', Icon: UsersIcon },
];

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes, usersRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllOrders(),
        productAPI.getAll({ pageSize: 100 }),
        productAPI.getCategories(),
        adminAPI.getUsers(),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const refreshProducts = async () => {
    const { data } = await productAPI.getAll({ pageSize: 100 });
    setProducts(data.products);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminAPI.updateOrderStatus(id, status);
      const [ordersRes, statsRes] = await Promise.all([
        adminAPI.getAllOrders(),
        adminAPI.getDashboard(),
      ]);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not update order status.');
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : null,
      stock: parseInt(productForm.stock, 10),
      categoryId: parseInt(productForm.categoryId, 10),
    };

    if (editingId) {
      await adminAPI.updateProduct(editingId, payload);
    } else {
      await adminAPI.createProduct(payload);
    }

    setProductForm(EMPTY_PRODUCT);
    setEditingId(null);
    await refreshProducts();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setProductForm({
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      stock: product.stock,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
    });
    setTab('products');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await adminAPI.deleteProduct(id);
    await refreshProducts();
  };

  const formatPrice = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

  if (loading) return <Loader />;

  const statCards = stats ? [
    { label: 'Revenue', value: formatPrice(stats.totalRevenue), detail: 'Paid orders', Icon: ChartIcon, accent: true },
    { label: 'Orders', value: stats.totalOrders, detail: `${stats.pendingOrders} awaiting confirmation`, Icon: ClipboardIcon },
    { label: 'Products', value: stats.totalProducts, detail: 'Active listings', Icon: BoxIcon },
    { label: 'Customers', value: stats.totalUsers, detail: 'Registered accounts', Icon: UsersIcon },
  ] : [];

  return (
    <div className="container page-shell admin-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Operations</span>
          <h1>Admin dashboard</h1>
          <p>Keep an eye on the store, your orders, and the collection.</p>
        </div>
        <span className="admin-user"><span className="nav-avatar">{user?.name?.charAt(0)}</span>{user?.name}</span>
      </div>

      <div className="admin-tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && stats && (
        <div className="stats-grid">
          {statCards.map(({ label, value, detail, Icon, accent }) => (
            <article key={label} className={`stat-card${accent ? ' stat-card-accent' : ''}`}>
              <span className="stat-icon"><Icon size={20} /></span>
              <span className="stat-label">{label}</span>
              <h3>{value}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="admin-table-wrap">
          <div className="table-heading">
            <div>
              <h2>Recent orders</h2>
              <p>Update fulfilment status as orders move along.</p>
            </div>
            <span className="count-pill">{orders.length} orders</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>#{order.id}</strong></td>
                  <td>
                    <span className="table-primary">{order.customerName}</span>
                    <small>{order.customerEmail}</small>
                  </td>
                  <td>{formatPrice(order.totalAmount)}</td>
                  <td><span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td>
                    <span className="table-primary">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                    <small className={`payment-status ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</small>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(event) => handleStatusUpdate(order.id, event.target.value)}
                      className="table-select"
                      disabled={!(STATUS_FLOW[order.status] || []).length}
                      title={(STATUS_FLOW[order.status] || []).length ? 'Move this order to the next stage' : 'No further status updates'}
                      aria-label={`Update status for order ${order.id}`}
                    >
                      {statusOptionsFor(order.status).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'products' && (
        <div className="admin-products">
          <form onSubmit={handleProductSubmit} className="admin-form">
            <div className="form-heading">
              <span className="form-icon"><PackageIcon size={20} /></span>
              <div>
                <h3>{editingId ? 'Edit product' : 'Add a product'}</h3>
                <p>{editingId ? 'Update the details below.' : 'Add something new to the collection.'}</p>
              </div>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Product name</span>
                <input
                  placeholder="e.g. Wireless headphones"
                  value={productForm.name}
                  onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Brand</span>
                <input
                  placeholder="e.g. Cadbury"
                  value={productForm.brand}
                  onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Category</span>
                <select
                  value={productForm.categoryId}
                  onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })}
                  required
                >
                  <option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Price (₹)</span>
                <input
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Discount price (₹)</span>
                <input
                  placeholder="Optional"
                  type="number"
                  step="0.01"
                  value={productForm.discountPrice}
                  onChange={(event) => setProductForm({ ...productForm, discountPrice: event.target.value })}
                />
              </label>
              <label className="field">
                <span>Stock</span>
                <input
                  placeholder="0"
                  type="number"
                  value={productForm.stock}
                  onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Image URL</span>
                <input
                  placeholder="https://..."
                  value={productForm.imageUrl}
                  onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
                  required
                />
              </label>
            </div>

            <label className="field">
              <span>Description</span>
              <textarea
                placeholder="What makes this product worth bringing home?"
                value={productForm.description}
                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                required
                rows={3}
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save changes' : <><PlusIcon size={17} /> Add product</>}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditingId(null);
                    setProductForm(EMPTY_PRODUCT);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="admin-table-wrap">
            <div className="table-heading">
              <div>
                <h2>All products</h2>
                <p>Manage prices, stock, and listings.</p>
              </div>
              <span className="count-pill">{products.length} products</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <img src={product.imageUrl} alt="" />
                        <div>
                          <span className="table-primary">{product.name}</span>
                          <small>{product.brand}</small>
                        </div>
                      </div>
                    </td>
                    <td>{formatPrice(product.discountPrice || product.price)}</td>
                    <td>{product.stock}</td>
                    <td>{product.categoryName}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn-sm" onClick={() => handleEdit(product)}>Edit</button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-table-wrap">
          <div className="table-heading">
            <div>
              <h2>Customers</h2>
              <p>Everyone with a ShopNet account.</p>
            </div>
            <span className="count-pill">{users.length} accounts</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div className="table-user">
                      <span className="nav-avatar">{account.name?.charAt(0).toUpperCase()}</span>
                      <span className="table-primary">{account.name}</span>
                    </div>
                  </td>
                  <td>{account.email}</td>
                  <td>{account.phone || '—'}</td>
                  <td><span className="role-pill">{account.role}</span></td>
                  <td>{new Date(account.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
