import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productAPI, reviewAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import {
  CheckIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  RefreshIcon,
  ShieldIcon,
  StarIcon,
  TruckIcon,
} from '../components/Icons';

function RatingStars({ value, size = 16 }) {
  return (
    <span className="stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          size={size}
          className={`star${star <= Math.round(value) ? '' : ' empty'}`}
        />
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      productAPI.getOne(id),
      productAPI.getReviews(id),
    ]).then(([productResponse, reviewResponse]) => {
      setProduct(productResponse.data);
      setReviews(reviewResponse.data);
      setLoading(false);
    }).catch(() => navigate('/'));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    await addToCart(parseInt(id, 10), quantity);
    navigate('/cart');
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await reviewAPI.addReview(parseInt(id, 10), reviewForm);
      const [{ data: updatedReviews }, { data: updatedProduct }] = await Promise.all([
        productAPI.getReviews(id),
        productAPI.getOne(id),
      ]);
      setReviews(updatedReviews);
      setProduct(updatedProduct);
      setReviewForm({ rating: 5, comment: '' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return null;

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const inStock = product.stock > 0;

  return (
    <div className="container detail-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRightIcon size={14} />
        <Link to="/#categories">{product.categoryName}</Link>
        <ChevronRightIcon size={14} />
        <span>{product.name}</span>
      </nav>

      <div className="product-detail">
        <div className="detail-media">
          <img src={product.imageUrl} alt={product.name} className="detail-img" />
          {discount > 0 && <span className="detail-sale-badge">Save {discount}%</span>}
        </div>

        <div className="detail-info">
          <span className="eyebrow">
            {product.brand ? `${product.brand} · ${product.categoryName}` : product.categoryName}
          </span>
          <h1>{product.name}</h1>

          <div className="detail-rating">
            <RatingStars value={product.rating} size={17} />
            <strong>{product.rating}</strong>
            <span>{product.reviewCount} reviews</span>
          </div>

          <p className="detail-desc">{product.description}</p>

          <div className="detail-price">
            <span className="price-current">
              ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
            </span>
            {product.discountPrice && (
              <>
                <span className="price-original">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="price-discount">Save {discount}%</span>
              </>
            )}
          </div>

          <div className={`stock-pill ${inStock ? 'in-stock' : 'out-of-stock'}`}>
            {inStock ? <CheckIcon size={15} /> : <span className="stock-dot" />}
            {inStock ? `In stock · ${product.stock} available` : 'Currently out of stock'}
          </div>

          {inStock && (
            <div className="detail-actions">
              {user ? (
                <>
                  <div className="qty-selector" aria-label="Quantity selector">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon size={16} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      aria-label="Increase quantity"
                    >
                      <PlusIcon size={16} />
                    </button>
                  </div>
                  <button type="button" onClick={handleAddToCart} className="btn btn-primary btn-lg detail-add">
                    Add to cart
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg detail-add">
                  Sign in to add to cart
                </Link>
              )}
            </div>
          )}

          <ul className="detail-benefits">
            <li>
              <TruckIcon size={19} />
              <div>
                <strong>Free delivery</strong>
                <span>On orders over ₹999</span>
              </div>
            </li>
            <li>
              <ShieldIcon size={19} />
              <div>
                <strong>Secure checkout</strong>
                <span>Your details stay protected</span>
              </div>
            </li>
            <li>
              <RefreshIcon size={19} />
              <div>
                <strong>Easy returns</strong>
                <span>A simple, no-fuss process</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <section className="reviews-section">
        <div className="reviews-heading">
          <div>
            <span className="eyebrow">Community notes</span>
            <h2>Customer reviews</h2>
          </div>
          <div className="reviews-summary">
            <strong>{product.rating}</strong>
            <RatingStars value={product.rating} size={15} />
            <span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>

        <div className="review-layout">
          <div>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <h3>Share your thoughts</h3>
                <label>
                  Your rating
                  <select
                    value={reviewForm.rating}
                    onChange={(event) => setReviewForm({ ...reviewForm, rating: parseInt(event.target.value, 10) })}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>{rating} out of 5</option>
                    ))}
                  </select>
                </label>
                <label>
                  Your review
                  <textarea
                    placeholder="What did you like? What should others know?"
                    value={reviewForm.comment}
                    onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                    required
                    rows={5}
                  />
                </label>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish review'}
                </button>
              </form>
            ) : (
              <div className="review-signin">
                <StarIcon size={24} />
                <h3>Bought this item?</h3>
                <p>Sign in to share a review with the ShopNet community.</p>
                <Link to="/login" className="btn btn-outline">Sign in to review</Link>
              </div>
            )}
          </div>

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="reviews-empty">
                <p>No reviews yet. Be the first to share your experience.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="review-item">
                  <div className="review-avatar">{review.userName?.charAt(0).toUpperCase()}</div>
                  <div className="review-content">
                    <div className="review-header">
                      <div>
                        <strong>{review.userName}</strong>
                        <small>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                      </div>
                      <RatingStars value={review.rating} size={14} />
                    </div>
                    <p>{review.comment}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
