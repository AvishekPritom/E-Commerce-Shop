import { BASE_URL } from "../../api";
import styles from "./HomeCard.module.css";
import { Link } from "react-router-dom";

const HomeCard = ({ product }) => {
  // Helper function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-warning"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-warning"></i>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-warning"></i>);
    }
    
    return stars;
  };

  // Helper function to get fallback image
  const getImageSrc = () => {
    if (product.image) {
      return `${BASE_URL}${product.image}`;
    }
    return 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image';
  };

  return (
    <div className={`col-lg-3 col-md-4 col-sm-6 ${styles.col} mb-4`}>
      <Link to={`/products/${product.slug}`} className={styles.link}>
        <div className={`card h-100 shadow-sm ${styles.card} border-0`}>
          {/* Product Image */}
          <div className={styles.cardImaWrapper}>
            <img
              src={getImageSrc()}
              className={`card-img-top ${styles.cardImgTop}`}
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image';
              }}
            />
            
            {/* Stock Badge */}
            <div className="position-absolute top-0 end-0 m-2">
              {product.in_stock ? (
                <span className="badge bg-success">
                  <i className="fas fa-check me-1"></i>In Stock
                </span>
              ) : (
                <span className="badge bg-danger">
                  <i className="fas fa-times me-1"></i>Out of Stock
                </span>
              )}
            </div>

            {/* Category Badge */}
            <div className="position-absolute top-0 start-0 m-2">
              <span className="badge bg-primary">{product.category || 'General'}</span>
            </div>
          </div>

          {/* Product Details */}
          <div className={`card-body d-flex flex-column ${styles.cardBody}`}>
            {/* Brand */}
            {product.brand && (
              <div className="mb-2">
                <small className="text-muted fw-bold">{product.brand}</small>
              </div>
            )}

            {/* Product Name */}
            <h5 className={`card-title ${styles.cardTittle} mb-2`}>{product.name}</h5>
            
            {/* Description */}
            <p className="card-text text-muted small mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
              {product.description ? 
                (product.description.length > 80 ? 
                  `${product.description.substring(0, 80)}...` : 
                  product.description
                ) : 
                'No description available'
              }
            </p>

            {/* Rating */}
            {product.rating && (
              <div className="d-flex align-items-center mb-2">
                <div className="me-2">
                  {renderStars(product.rating)}
                </div>
                <small className="text-muted">({product.rating})</small>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-3">
                <div className="d-flex flex-wrap gap-1">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <span key={index} className="badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>
                      {feature}
                    </span>
                  ))}
                  {product.features.length > 2 && (
                    <span className="badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>
                      +{product.features.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Price and Stock */}
            <div className="mt-auto">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className={`${styles.cardText} mb-0 fw-bold text-success`}>
                    ৳{product.price ? Number(product.price).toLocaleString() : '0'}
                  </h6>
                  {product.stock_quantity && (
                    <small className="text-muted">
                      {product.stock_quantity} units left
                    </small>
                  )}
                </div>
                
                <div className="btn-group" role="group">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to cart functionality
                      console.log('Add to cart:', product.name);
                    }}
                  >
                    <i className="fas fa-cart-plus"></i>
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to wishlist functionality
                      console.log('Add to wishlist:', product.name);
                    }}
                  >
                    <i className="far fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HomeCard;
