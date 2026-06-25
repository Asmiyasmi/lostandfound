import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

const useMedia = (queries, values, defaultValue) => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  const [value, setValue] = useState(get);
  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries]);
  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
};

const preloadImages = async (urls) => {
  await Promise.all(
    urls.map(src => new Promise(resolve => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => resolve();
    }))
  );
};

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onItemClick,
  renderItem,
}) => {
  const columns = useMedia(
    ['(min-width:1400px)', '(min-width:1000px)', '(min-width:700px)', '(min-width:480px)'],
    [4, 3, 2, 2],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    const imgs = items.map(i => i.img || i.images?.[0]).filter(Boolean);
    preloadImages(imgs).then(() => setImagesReady(true));
  }, [items]);

  const getInitialPosition = (item) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };
    switch (animateFrom) {
      case 'top': return { x: item.x, y: -200 };
      case 'left': return { x: -200, y: item.y };
      case 'right': return { x: window.innerWidth + 200, y: item.y };
      case 'center': return { x: containerRect.width / 2 - item.w / 2, y: containerRect.height / 2 - item.h / 2 };
      default: return { x: item.x, y: item.y + 100 };
    }
  };

  const grid = useMemo(() => {
    if (!width) return [];
    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;
    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = (child.height || 300) / 2;
      const y = colHeights[col];
      colHeights[col] += height;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const totalHeight = useMemo(() => {
    if (!grid.length) return 0;
    return Math.max(...grid.map(item => item.y + item.h));
  }, [grid]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady) return;
    grid.forEach((item, index) => {
      const selector = `[data-masonry-key="${item.id}"]`;
      const animationProps = { x: item.x, y: item.y, width: item.w, height: item.h };
      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item);
        gsap.fromTo(selector, {
          opacity: 0, x: initialPos.x, y: initialPos.y, width: item.w, height: item.h,
          ...(blurToFocus && { filter: 'blur(10px)' })
        }, {
          opacity: 1, ...animationProps,
          ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8, ease: 'power3.out', delay: index * stagger
        });
      } else {
        gsap.to(selector, { ...animationProps, duration, ease, overwrite: 'auto' });
      }
    });
    hasMounted.current = true;
  }, [grid, imagesReady, stagger, blurToFocus, duration, ease]);

  const handleMouseEnter = (e, item) => {
    if (scaleOnHover) gsap.to(`[data-masonry-key="${item.id}"]`, { scale: hoverScale, duration: 0.3, ease: 'power2.out' });
    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (e, item) => {
    if (scaleOnHover) gsap.to(`[data-masonry-key="${item.id}"]`, { scale: 1, duration: 0.3, ease: 'power2.out' });
    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: totalHeight }}>
      {grid.map(item => (
        <div
          key={item.id}
          data-masonry-key={item.id}
          style={{ position: 'absolute', willChange: 'transform, width, height, opacity', padding: '8px', cursor: 'pointer', top: 0, left: 0 }}
          onClick={() => onItemClick && onItemClick(item)}
          onMouseEnter={e => handleMouseEnter(e, item)}
          onMouseLeave={e => handleMouseLeave(e, item)}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
            {renderItem ? renderItem(item) : (
              <>
                <div style={{
                  backgroundImage: `url(${item.img || item.images?.[0]})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  width: '100%', height: '100%', borderRadius: '16px',
                  boxShadow: '0px 10px 50px -10px rgba(0,0,0,0.5)',
                }} />
                {colorShiftOnHover && (
                  <div className="color-overlay" style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(45deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5))',
                    opacity: 0, pointerEvents: 'none', borderRadius: '16px',
                  }} />
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
