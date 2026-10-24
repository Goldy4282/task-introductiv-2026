import {useState} from 'react';

// image: an imported URL, {src, alt}, or a rectangle from a sprite sheet.
export default function ObjectImage({image, label, className = ''}) {
  const [failedSource, setFailedSource] = useState(null);
  const picture = typeof image === 'string' ? {src: image} : image;
  const src = picture?.src;
  if (!src || failedSource === src) {
    return <span className={`object-picture image-placeholder ${className}`} role="img" aria-label={`Fără imagine: ${label}`}>Fără imagine</span>;
  }
  const alt = picture.alt || label;
  const cropped = [picture.x, picture.y, picture.w, picture.h].every(Number.isFinite) && picture.w > 0 && picture.h > 0;
  if (cropped) {
    return <svg className={`object-picture pixel ${className}`} viewBox={`${picture.x} ${picture.y} ${picture.w} ${picture.h}`} role="img" aria-label={alt}>
      <image href={src} width={picture.sheetWidth ?? 768} height={picture.sheetHeight ?? 768} onError={() => setFailedSource(src)}/>
    </svg>;
  }
  return <img key={src} className={`object-picture ${picture.pixel ? 'pixel' : ''} ${className}`} src={src} alt={alt} draggable={false} onError={() => setFailedSource(src)}/>;
}
