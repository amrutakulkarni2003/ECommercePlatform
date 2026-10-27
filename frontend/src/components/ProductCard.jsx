import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartIcon, StarIcon } from './Icons';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 10;

  return (
    <article className={`product-card${soldOut ? ' is-sold-out' : ''}`}>
      <Link to={`/product/${product.id}`} className="product-media">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        <div className="product-badges">
          {discount > 0 && <span className="badge badge-sale">Save {discount}%</span>}
          {lowStock && <span className="badge badge-stock">Only {product.stock} left</span>}
        </div>
        {soldOut && <span className="sold-out-label">Sold out</span>}
      </Link>

      <div className="product-info">
        <div className="product-meta">
          <span className="product-category">
            {product.brand ? `${product.brand} · ${product.categoryName}` : product.categoryName}
          </span>
          <span className="product-rating" aria-label={`${product.rating} out of 5`}>
            <StarIcon size={13} />
            {product.rating}
          </span>
        </div>

        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-price">
          <span className="price-current">₹{(product.discountPrice || product.price).toLocaleString('en-IN')}</span>
          {product.discountPrice && (
            <span className="price-original">₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>

        {user ? (
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="product-add"
            disabled={soldOut}
          >
            <CartIcon size={17} />
            {soldOut ? 'Unavailable' : 'Add to cart'}
          </button>
        ) : (
          <Link to="/login" className="product-add">
            <CartIcon size={17} />
            Sign in to buy
          </Link>
        )}
      </div>
    </article>
  );
}
