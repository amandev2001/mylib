import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced ImagePreview component that handles book covers similar to Google Play Books:
 * - Multiple image layers for visual effects
 * - Maintains aspect ratio (default book cover ratio is 2:3)
 * - Smart sizing based on container and image dimensions
 * - Loading states and fallback images
 */
const ImagePreview = ({ 
  src, 
  alt, 
  fallbackSrc, 
  className = '',
  containerClassName = '',
  aspectRatio = '2/3',
  withShadow = true,
  withMultiLayer = false,
  onError,
  onLoad
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  // Handle image load event to get natural dimensions
  const handleImageLoad = (e) => {
    setImageLoaded(true);
    setImageError(false);
    
    if (onLoad) onLoad(e);
  };

  // Handle image error
  const handleImageError = (e) => {
    setImageError(true);
    setImageLoaded(false);
    
    // Use fallback source if provided
    if (fallbackSrc && e.target.src !== fallbackSrc) {
      e.target.src = fallbackSrc;
    }
    
    if (onError) onError(e);
  };

  return (
    <div 
      className={`image-preview-container relative ${withShadow ? 'shadow-lg' : ''} ${containerClassName}`}
      style={{ aspectRatio }}
    >
      {/* Primary image - main visible layer */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg ${imageLoaded ? '' : 'opacity-0'} ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {/* Secondary image layer for visual effects (Google Play Books style) */}
      {withMultiLayer && imageLoaded && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
        />
      )}
      
      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Book edge shadow effect */}
      {withShadow && imageLoaded && (
        <div className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-l from-black/20 to-transparent rounded-r-lg"></div>
      )}
    </div>
  );
};

ImagePreview.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  fallbackSrc: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  aspectRatio: PropTypes.string,
  withShadow: PropTypes.bool,
  withMultiLayer: PropTypes.bool,
  onError: PropTypes.func,
  onLoad: PropTypes.func
};

export default ImagePreview; 