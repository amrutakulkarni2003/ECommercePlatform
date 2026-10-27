import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../api';
import ProductCard from '../components/ProductCard';
import {
  ArrowRightIcon,
  BagIcon,
  CardIcon,
  CheckIcon,
  ChevronRightIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  SparkIcon,
  StarIcon,
  TruckIcon,
} from '../components/Icons';

const HERO_SLIDES = [
  {
    kicker: 'Mega shopping days',
    title: 'Big brands.',
    accent: 'Bigger savings.',
    copy: 'Up to 70% off on electronics, fashion, home and more. Extra 10% off on your first order.',
    primary: 'Shop the sale',
    secondary: 'View today\'s deals',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85',
    imageAlt: 'Wireless headphones on a warm yellow background',
    offerLabel: 'Deal of the day',
    offerPrice: '₹1,999',
    offerStrike: '₹2,999',
    theme: 'emerald',
    chips: ['Up to 70% off', 'Free delivery', 'Easy returns'],
  },
  {
    kicker: 'New season drop',
    title: 'Fresh fits for',
    accent: 'every mood.',
    copy: 'Denim, sneakers and easy layers for the season ahead. Styles you will reach for every day.',
    primary: 'Shop fashion',
    secondary: 'Explore new arrivals',
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85',
    imageAlt: 'Red running shoe on a bright background',
    offerLabel: 'Trending now',
    offerPrice: '₹2,999',
    offerStrike: '₹3,999',
    theme: 'sunset',
    chips: ['Flat 40% off', 'New arrivals', '7-day returns'],
  },
  {
    kicker: 'The snack shop',
    title: 'Snack happy.',
    accent: 'Every day.',
    copy: 'Chips, cookies, noodles and treats for every craving. Stock the pantry for less.',
    primary: 'Shop snacks',
    secondary: 'See quick bites',
    category: 'Snacks',
    image: '/products/dairy-milk.jpg',
    imageAlt: 'Dairy Milk chocolate bar',
    offerLabel: 'Fan favourite',
    offerPrice: '₹45',
    offerStrike: '₹50',
    theme: 'cocoa',
    chips: ['Under ₹99', 'Bundle savings', 'Always in stock'],
  },
];

const CATEGORY_IMAGES = {
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  Clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
  Books: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
  Sports: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
  Snacks: '/products/dairy-milk.jpg',
};

const CATEGORY_TAGLINES = {
  Electronics: 'Gadgets & audio',
  Clothing: 'Fresh fits',
  Books: 'Stories & study',
  'Home & Kitchen': 'Make it home',
  Sports: 'Move better',
  Snacks: 'Quick bites',
};

const TRENDING_SEARCHES = ['Headphones', 'Running shoes', 'Chocolate', 'Books'];

const discountPercent = (product) => (
  product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0
);

const getTimeLeft = () => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const distance = Math.max(0, end - now);

  return {
    hours: String(Math.floor(distance / 3600000)).padStart(2, '0'),
    minutes: String(Math.floor((distance % 3600000) / 60000)).padStart(2, '0'),
    seconds: String(Math.floor((distance % 60000) / 1000)).padStart(2, '0'),
  };
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [spotlight, setSpotlight] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [brands, setBrands] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const pageSize = 12;

  useEffect(() => {
    productAPI.getCategories().then(({ data }) => setCategories(data));
    productAPI.getBrands().then(({ data }) => setBrands(data));
    productAPI.getAll({ page: 1, pageSize: 24, sortBy: 'rating' })
      .then(({ data }) => setSpotlight(data.products));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (heroPaused) return undefined;

    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [heroPaused]);

  useEffect(() => {
    setLoading(true);
    const params = { page, pageSize, sortBy };
    if (search) params.search = search;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (brand) params.brand = brand;

    productAPI.getAll(params).then(({ data }) => {
      setProducts(data.products);
      setTotal(data.total);
      setLoading(false);
    });
  }, [search, selectedCategory, brand, sortBy, page]);

  const totalPages = Math.ceil(total / pageSize);
  const slide = HERO_SLIDES[activeSlide];

  const dealProducts = useMemo(() => (
    [...spotlight]
      .filter((product) => product.discountPrice)
      .sort((a, b) => discountPercent(b) - discountPercent(a))
      .slice(0, 4)
  ), [spotlight]);

  const trendingProducts = useMemo(() => (
    spotlight.filter((product) => product.stock > 0).slice(0, 4)
  ), [spotlight]);

  const activeCategory = categories.find(
    (category) => String(category.id) === selectedCategory,
  );

  const scrollToCatalog = () => {
    requestAnimationFrame(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const browseCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    scrollToCatalog();
  };

  const shopSlide = () => {
    const category = categories.find((item) => item.name === slide.category);
    browseCategory(category ? String(category.id) : '');
  };

  const quickSearch = (term) => {
    setSearch(term);
    setSelectedCategory('');
    setBrand('');
    setPage(1);
    scrollToCatalog();
  };

  const applyBrand = (brandName) => {
    setBrand(brandName);
    setPage(1);
    scrollToCatalog();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setBrand('');
    setPage(1);
  };

  return (
    <div className="mkt-home">
      <section
        className="container mkt-hero-wrap"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        <div className={`mkt-hero mkt-theme-${slide.theme}`}>
          <div className="mkt-hero-copy">
            <span className="mkt-kicker">
              <SparkIcon size={14} />
              {slide.kicker}
            </span>
            <h1>
              {slide.title}
              <br />
              <em>{slide.accent}</em>
            </h1>
            <p className="mkt-hero-lede">{slide.copy}</p>
            <div className="mkt-hero-actions">
              <button type="button" className="mkt-btn mkt-btn-primary" onClick={shopSlide}>
                {slide.primary}
                <ArrowRightIcon size={18} />
              </button>
              <a href="#deals" className="mkt-btn mkt-btn-ghost">
                {slide.secondary}
              </a>
            </div>
            <div className="mkt-hero-chips">
              {slide.chips.map((chip) => (
                <span key={chip}>
                  <CheckIcon size={13} />
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="mkt-hero-media">
            <div className="mkt-hero-halo" aria-hidden="true" />
            <div className="mkt-hero-image">
              <img key={slide.image} src={slide.image} alt={slide.imageAlt} />
            </div>
            <div className="mkt-hero-offer">
              <span>{slide.offerLabel}</span>
              <div>
                <strong>{slide.offerPrice}</strong>
                <s>{slide.offerStrike}</s>
              </div>
              <small>
                <TruckIcon size={13} />
                Free delivery
              </small>
            </div>
            <div className="mkt-hero-rating">
              <span className="mkt-hero-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon key={index} size={12} />
                ))}
              </span>
              <strong>4.8/5</strong>
              <small>12k+ happy shoppers</small>
            </div>
          </div>

          <div className="mkt-hero-dots" role="tablist" aria-label="Promotions">
            {HERO_SLIDES.map((item, index) => (
              <button
                key={item.kicker}
                type="button"
                className={index === activeSlide ? 'active' : ''}
                aria-label={`Show ${item.kicker}`}
                aria-selected={index === activeSlide}
                role="tab"
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>

          <div className="mkt-hero-arrows">
            <button
              type="button"
              aria-label="Previous promotion"
              onClick={() => setActiveSlide((current) => (
                (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
              ))}
            >
              <ArrowRightIcon size={17} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button
              type="button"
              aria-label="Next promotion"
              onClick={() => setActiveSlide((current) => (current + 1) % HERO_SLIDES.length)}
            >
              <ArrowRightIcon size={17} />
            </button>
          </div>
        </div>

        <div className="mkt-search-card">
          <div className="mkt-search-intro">
            <span className="mkt-search-icon">
              <SearchIcon size={20} />
            </span>
            <div>
              <strong>What are you shopping for today?</strong>
              <span>Search products, brands and categories</span>
            </div>
          </div>

          <form
            className="mkt-search-form"
            onSubmit={(event) => {
              event.preventDefault();
              scrollToCatalog();
            }}
          >
            <label className="mkt-search-select">
              <span>Category</span>
              <select
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="mkt-search-input">
              <SearchIcon size={18} />
              <input
                type="search"
                placeholder="Search for headphones, shoes, snacks..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <button type="submit" className="mkt-btn mkt-btn-dark mkt-search-btn">
              Search
            </button>
          </form>

          <div className="mkt-trending-searches">
            <span>
              <SparkIcon size={13} />
              Trending:
            </span>
            {TRENDING_SEARCHES.map((term) => (
              <button key={term} type="button" onClick={() => quickSearch(term)}>
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container mkt-section" id="categories">
        <div className="mkt-section-head">
          <div>
            <span className="mkt-eyebrow">Shop by category</span>
            <h2>Everything you need, <em>beautifully picked.</em></h2>
            <p>From daily essentials to little luxuries, find it all in one place.</p>
          </div>
          <button type="button" className="mkt-link" onClick={() => browseCategory('')}>
            View all products
            <ArrowRightIcon size={16} />
          </button>
        </div>

        <div className="mkt-category-grid">
          <button
            type="button"
            className={`mkt-category mkt-category-all${selectedCategory === '' ? ' active' : ''}`}
            onClick={() => browseCategory('')}
          >
            <span className="mkt-category-media">
              <BagIcon size={30} />
            </span>
            <span className="mkt-category-copy">
              <strong>All products</strong>
              <small>{total > 0 ? `${total} essentials` : 'Shop everything'}</small>
            </span>
            <ChevronRightIcon size={17} />
          </button>

          {categories.map((category) => {
            const image = CATEGORY_IMAGES[category.name];

            return (
              <button
                key={category.id}
                type="button"
                className={`mkt-category${selectedCategory === String(category.id) ? ' active' : ''}`}
                onClick={() => browseCategory(String(category.id))}
              >
                <span className="mkt-category-media">
                  {image ? (
                    <img src={image} alt="" loading="lazy" />
                  ) : (
                    <BagIcon size={28} />
                  )}
                </span>
                <span className="mkt-category-copy">
                  <strong>{category.name}</strong>
                  <small>{CATEGORY_TAGLINES[category.name] || category.description}</small>
                </span>
                <ChevronRightIcon size={17} />
              </button>
            );
          })}
        </div>
      </section>

      {dealProducts.length > 0 && (
        <section className="container mkt-section" id="deals">
          <div className="mkt-deal-shell">
            <div className="mkt-section-head mkt-deal-head">
              <div>
                <span className="mkt-eyebrow mkt-eyebrow-light">
                  <SparkIcon size={14} />
                  Limited-time offers
                </span>
                <h2>Deals of the day</h2>
                <p>Our biggest markdowns, refreshed daily. Do not wait too long.</p>
              </div>

              <div className="mkt-countdown">
                <span>Ends in</span>
                <div className="mkt-countdown-clock">
                  <strong>{timeLeft.hours}</strong>
                  <small>hrs</small>
                  <b>:</b>
                  <strong>{timeLeft.minutes}</strong>
                  <small>min</small>
                  <b>:</b>
                  <strong>{timeLeft.seconds}</strong>
                  <small>sec</small>
                </div>
              </div>
            </div>

            <div className="mkt-deal-grid">
              {dealProducts.map((product, index) => {
                const off = discountPercent(product);

                return (
                  <article className="mkt-deal-card" key={product.id}>
                    <Link to={`/product/${product.id}`} className="mkt-deal-media">
                      <img src={product.imageUrl} alt={product.name} loading="lazy" />
                      {off > 0 && <span className="mkt-deal-badge">{off}% off</span>}
                      <span className="mkt-deal-tag">#{index + 1} bestseller</span>
                    </Link>

                    <div className="mkt-deal-body">
                      <span className="mkt-deal-brand">{product.brand}</span>
                      <Link to={`/product/${product.id}`} className="mkt-deal-name">
                        {product.name}
                      </Link>
                      <div className="mkt-deal-meta">
                        <span className="mkt-rating">
                          <StarIcon size={12} />
                          {product.rating}
                        </span>
                        <span>{product.reviewCount} reviews</span>
                      </div>
                      <div className="mkt-deal-prices">
                        <strong>
                          ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                        </strong>
                        {product.discountPrice && (
                          <s>₹{product.price.toLocaleString('en-IN')}</s>
                        )}
                      </div>
                      <Link to={`/product/${product.id}`} className="mkt-deal-cta">
                        Grab deal
                        <ArrowRightIcon size={15} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="container mkt-promos">
        <article className="mkt-promo mkt-promo-pay">
          <span className="mkt-promo-icon"><CardIcon size={22} /></span>
          <div>
            <span>Pay your way</span>
            <strong>UPI, cards, wallet &amp; COD</strong>
            <p>Choose what works for you at checkout.</p>
          </div>
        </article>
        <article className="mkt-promo mkt-promo-delivery">
          <span className="mkt-promo-icon"><TruckIcon size={22} /></span>
          <div>
            <span>Free delivery</span>
            <strong>On orders over ₹999</strong>
            <p>Track every order from checkout to doorstep.</p>
          </div>
        </article>
        <article className="mkt-promo mkt-promo-returns">
          <span className="mkt-promo-icon"><RefreshIcon size={22} /></span>
          <div>
            <span>Simple returns</span>
            <strong>Changed your mind?</strong>
            <p>Our straightforward process keeps it easy.</p>
          </div>
        </article>
      </section>

      {trendingProducts.length > 0 && (
        <section className="container mkt-section">
          <div className="mkt-section-head">
            <div>
              <span className="mkt-eyebrow">Loved by shoppers</span>
              <h2>Trending right now</h2>
              <p>The pieces everyone is adding to their carts this week.</p>
            </div>
            <button type="button" className="mkt-link" onClick={() => browseCategory('')}>
              Shop bestsellers
              <ArrowRightIcon size={16} />
            </button>
          </div>

          <div className="mkt-trending-grid">
            {trendingProducts.map((product, index) => (
              <article className="mkt-trending-card" key={product.id}>
                <Link to={`/product/${product.id}`} className="mkt-trending-media">
                  <img src={product.imageUrl} alt={product.name} loading="lazy" />
                  <span className="mkt-trending-rank">#{index + 1}</span>
                </Link>
                <div className="mkt-trending-body">
                  <span className="mkt-deal-brand">{product.brand}</span>
                  <Link to={`/product/${product.id}`} className="mkt-trending-name">
                    {product.name}
                  </Link>
                  <div className="mkt-trending-foot">
                    <strong>
                      ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                    </strong>
                    <span className="mkt-rating">
                      <StarIcon size={12} />
                      {product.rating}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section className="container mkt-brands" aria-label="Featured brands">
          <div className="mkt-brands-head">
            <span>Shop by brand</span>
            <p>Trusted names, curated for you</p>
          </div>
          <div className="mkt-brand-list">
            {brands.slice(0, 10).map((item) => (
              <button
                key={item.name}
                type="button"
                className="mkt-brand"
                onClick={() => applyBrand(item.name)}
              >
                <span>{item.name.charAt(0)}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.count} {item.count === 1 ? 'item' : 'items'}</small>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="container mkt-section mkt-catalog" id="catalog">
        <div className="mkt-section-head">
          <div>
            <span className="mkt-eyebrow">The full collection</span>
            <h2>{activeCategory ? activeCategory.name : 'Explore all products'}</h2>
            <p>Filter by category, brand and more to find exactly what you need.</p>
          </div>
          <span className="mkt-total-pill">
            {total} {total === 1 ? 'product' : 'products'}
          </span>
        </div>

        <div className="mkt-filter-bar">
          <label className="mkt-search-field">
            <SearchIcon size={18} />
            <input
              type="search"
              placeholder="Search the collection..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <label className="mkt-select">
            <span>Category</span>
            <select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>

          <label className="mkt-select">
            <span>Brand</span>
            <select
              value={brand}
              onChange={(event) => {
                setBrand(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All brands</option>
              {brands.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="mkt-select">
            <span>Sort by</span>
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>

          {(search || selectedCategory || brand) && (
            <button type="button" className="mkt-clear" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="product-card skeleton-card" key={index}>
                <div className="skeleton skeleton-media" />
                <div className="skeleton-body">
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line medium" />
                  <div className="skeleton skeleton-button" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="page-arrow"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ArrowRightIcon size={17} style={{ transform: 'rotate(180deg)' }} />
                  Previous
                </button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        type="button"
                        key={pageNumber}
                        className={page === pageNumber ? 'active' : ''}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="page-arrow"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ArrowRightIcon size={17} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-icon"><SearchIcon size={26} /></span>
            <h2>No products found</h2>
            <p>Try a different search term or clear your filters.</p>
            <button type="button" className="btn btn-primary" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="container promise-section" id="why-shopnet">
        <div className="promise-grid">
          <article>
            <span className="promise-icon"><TruckIcon size={22} /></span>
            <h3>Easy delivery</h3>
            <p>Free shipping across India on orders over ₹999, with clear tracking from checkout to doorstep.</p>
          </article>
          <article>
            <span className="promise-icon"><ShieldIcon size={22} /></span>
            <h3>Safe &amp; secure</h3>
            <p>Protected accounts, secure sign-in, and a checkout experience built to keep your details private.</p>
          </article>
          <article>
            <span className="promise-icon"><RefreshIcon size={22} /></span>
            <h3>Simple returns</h3>
            <p>Changed your mind? Our straightforward return process keeps the whole experience low-effort.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
