'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Thumbs } from 'swiper/modules';
import Image from 'next/image';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

interface ProductImageGalleryProps {
  images: string[];
  productTitle: string;
}

export default function ProductImageGallery({ images, productTitle }: ProductImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState('');
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  const handleImageClick = (imageSrc: string) => {
    setZoomImageSrc(imageSrc);
    setIsZoomed(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const closeZoom = () => {
    setIsZoomed(false);
    setZoomImageSrc('');
  };

  // Close zoom on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeZoom();
      }
    };

    if (isZoomed) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isZoomed]);

  return (
    <div className="space-y-4">
      {/* Main Image Swiper */}
      <div className="relative group">
        <Swiper
          modules={[Autoplay, Pagination, Thumbs]}
          spaceBetween={10}
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet !bg-white !opacity-50',
            bulletActiveClass: 'swiper-pagination-bullet-active !opacity-100'
          }}
          thumbs={{ swiper: thumbsSwiper }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={images.length > 1}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="h-96 lg:h-[500px] rounded-lg overflow-hidden cursor-zoom-in"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div 
                className="relative w-full h-full group/image"
                onClick={() => handleImageClick(image)}
              >                <Image
                  src={image}
                  alt={`${productTitle} - Image ${index + 1}`}
                  fill
                  className="object-contain transition-transform duration-300 group-hover/image:scale-105"
                  priority={index === 0}
                />
                
                {/* Zoom indicator */}
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-black/50 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    <span className="text-sm">Click to zoom</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm z-10">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Swiper */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          breakpoints={{
            640: {
              slidesPerView: 5,
            },
            768: {
              slidesPerView: 6,
            },
            1024: {
              slidesPerView: 7,
            },
          }}
          className="thumbs-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className="cursor-pointer">
              <div className={`relative h-16 w-16 lg:h-20 lg:w-20 rounded-md overflow-hidden border-2 transition-colors ${
                index === activeIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
              }`}>
                <Image
                  src={image}
                  alt={`${productTitle} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeZoom}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Zoomed Image Container */}
          <div 
            ref={imageRef}
            className="relative w-full h-full max-w-4xl max-h-full cursor-move overflow-hidden"
            onMouseMove={handleMouseMove}
            onClick={closeZoom}
          >
            <div 
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{
                transform: `scale(2) translate(${50 - zoomPosition.x}%, ${50 - zoomPosition.y}%)`,
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              }}
            >
              <Image
                src={zoomImageSrc}
                alt={productTitle}
                fill
                className="object-contain"
                quality={100}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
            <p className="text-sm opacity-75">Move mouse to zoom • Click anywhere to close • Press ESC to exit</p>
          </div>
        </div>
      )}
    </div>
  );
}
