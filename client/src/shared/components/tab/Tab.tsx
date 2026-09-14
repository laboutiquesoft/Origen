import React, { useRef, useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  // Estados para arrastrar con el mouse
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Verificar si hay scroll disponible
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  // Scroll con botones
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Scroll con la rueda del mouse (Shift + Wheel o Wheel horizontal)
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    if (e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Eventos para arrastrar con el mouse (Drag to Scroll)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsMouseDown(false);
  const handleMouseUp = () => setIsMouseDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Velocidad de arrastre
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={`relative w-full border-b border-[var(--border-color)] ${className}`}>
      {/* Flecha Izquierda */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--bg-main)]/90 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full shadow-md text-gray-600 transition-all border border-[var(--border-color)]"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Tira de Pestañas */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex space-x-1 overflow-x-auto scrollbar-none select-none py-1 transition-all ${
          isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`
                relative py-3 px-4 text-sm font-semibold transition-all duration-150 ease-in-out
                flex items-center gap-2 whitespace-nowrap outline-none border-b-2 -mb-[2px]
                ${
                  isActive
                    ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                    : 'border-transparent text-gray-500 hover:text-[var(--main-color)]'
                }
              `}
              role="tab"
              aria-selected={isActive}
            >
              {/* Ícono de la pestaña */}
              {tab.icon && (
                <span
                  className={`text-base transition-colors ${
                    isActive ? 'text-[var(--accent-color)]' : 'text-gray-400 group-hover:text-[var(--main-color)]'
                  }`}
                >
                  {tab.icon}
                </span>
              )}

              {/* Etiqueta */}
              <span>{tab.label}</span>

              {/* Badge opcional */}
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                    isActive
                      ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Flecha Derecha */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--bg-main)]/90 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full shadow-md text-gray-600 transition-all border border-[var(--border-color)]"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};