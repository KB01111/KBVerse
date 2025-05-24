import React, { useEffect, useRef, useCallback } from 'react';

interface SynchronizedImageViewerProps {
  imageUrl: string;
  className?: string;
  syncGroup?: string;
}

const SynchronizedImageViewer: React.FC<SynchronizedImageViewerProps> = ({
  imageUrl,
  className = '',
  syncGroup = 'default'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ scrollLeft: number; scrollTop: number }>;
      if (ev.target === containerRef.current) {
        return;
      }
      if (containerRef.current) {
        containerRef.current.scrollLeft = ev.detail.scrollLeft;
        containerRef.current.scrollTop = ev.detail.scrollTop;
      }
    };

    window.addEventListener(`sync-scroll-${syncGroup}`, handler);
    return () => {
      window.removeEventListener(`sync-scroll-${syncGroup}`, handler);
    };
  }, [syncGroup]);

// Debounce helper used to limit scroll event frequency
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

  const handleScroll = useCallback(
    debounce(() => {
      if (containerRef.current) {
        const event = new CustomEvent(`sync-scroll-${syncGroup}`, {
          detail: {
            scrollLeft: containerRef.current.scrollLeft,
            scrollTop: containerRef.current.scrollTop,
          },
        });
        window.dispatchEvent(event);
      }
    }, 16), // ~60fps
    [syncGroup]
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      role="img"
      aria-label="Synchronized image viewer"
      tabIndex={0}
    >
      <img
        src={imageUrl}
        alt="Generated"
        className="max-w-none"
        onError={(e) => {
          console.error('Failed to load image:', imageUrl);
          e.currentTarget.alt = 'Failed to load image';
          e.currentTarget.style.border = '1px solid red';
        }}
      />
    </div>
  );
};

export default SynchronizedImageViewer;
