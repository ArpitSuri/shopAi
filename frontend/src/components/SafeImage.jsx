import { PLACEHOLDER_IMG } from '../utils/format';

// Falls back to a grey placeholder when the URL is empty or broken
export default function SafeImage({ src, alt, className = '' }) {
  return (
    <img
      src={src || PLACEHOLDER_IMG}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = PLACEHOLDER_IMG;
      }}
    />
  );
}
