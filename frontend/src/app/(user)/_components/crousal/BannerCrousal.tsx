'use client';
import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  sort_order: number;
}

interface BannerCrousalProps {
  banners?: Banner[];
  loading?: boolean;
}

export default function BannerCrousal({ banners = [], loading = false }: BannerCrousalProps) {

  if (loading) {
    return (
      <div className="w-full max-w-[calc(100vw-10px)] sm:max-w-[calc(100vw-2px)] px-2 sm:px-4 mx-auto h-[170px] sm:h-[240px] bg-gray-200 animate-pulse rounded-lg"></div>
    );
  }

  const displayBanners = banners.length > 0 ? banners : [];

  return (
    <div className="w-full max-w-[calc(100vw-10px)] sm:max-w-[calc(100vw-2px)] px-2 sm:px-4 mx-auto h-[170px] sm:h-[240px] relative group">
      <Swiper
        style={{
          ['--swiper-navigation-color' as string]: '#2563eb',
          ['--swiper-pagination-color' as string]: '#2563eb',
        }}
        className="w-full h-full rounded-lg overflow-hidden"
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={{
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        }}
        modules={[Autoplay, Pagination, Navigation]}
      >        {displayBanners.map((banner) => (
          <SwiperSlide key={banner.id} className="relative">
            <div className="w-full h-full relative">
              <Image 
                src={banner.image_url}
                alt={banner.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                priority={true}
              />
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Buttons */}
        <div className="absolute top-15 left-0 h-[120px] z-10 swiper-button-prev-custom transition-opacity duration-300 ">
          <button className="h-full px-2  bg-background/90 hover:bg-background/75 transition-all duration-300 flex items-center">
            <ChevronLeft size={25} className=" dark:text-primary-foreground text-gray-800" />
          </button>
        </div>
        <div className="absolute top-15 right-0 h-[120px] z-10 swiper-button-next-custom  transition-opacity duration-300">
          <button className="h-full px-2  bg-background/90 hover:bg-background/75 transition-all duration-300 flex items-center">
            <ChevronRight size={25} className="dark:text-primary-foreground text-gray-800" />
          </button>
        </div>
      </Swiper>
    </div>
  );
}