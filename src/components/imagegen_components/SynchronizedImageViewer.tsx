import React, { useEffect, useRef } from 'react';

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
      if (ev.target === containerRef.current) return;
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

  const handleScroll = () => {
    if (containerRef.current) {
      const event = new CustomEvent(`sync-scroll-${syncGroup}`, {
        detail: {
          scrollLeft: containerRef.current.scrollLeft,
          scrollTop: containerRef.current.scrollTop
        }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
    >
      <img src={imageUrl} alt="Generated" className="max-w-none" />
    </div>
  );
};

export default SynchronizedImageViewer;
