'use client';
import React, { useEffect, useState } from 'react';
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
  is_active: boolean;
  sort_order: number;
}

export default function BannerCrousal() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ui/banners`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setBanners(data.data);
      } else {
        // Fallback to sample data if API fails
        setBanners(sampleBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      // Fallback to sample data
      setBanners(sampleBanners);
    } finally {
      setLoading(false);
    }
  };

  // Sample banners as fallback
  const sampleBanners = [
    {
      id: '1',
      title: 'Summer Sale - Up to 50% Off',
      description: 'Great deals on summer collection',
      image_url: '/api/placeholder/1200/500',
      is_active: true,
      sort_order: 1
    },
    {
      id: '2',
      title: 'New Arrivals',
      description: 'Check out our latest products',
      image_url: '/api/placeholder/1200/500',
      is_active: true,
      sort_order: 2
    },
    {
      id: '3',
      title: 'Free Shipping',
      description: 'On orders over $50',
      image_url: '/api/placeholder/1200/500',
      is_active: true,
      sort_order: 3
    },
    {
      id: '4',
      title: 'Best Sellers',
      description: 'Most popular items this month',
      image_url: '/api/placeholder/1200/500',
      is_active: true,
      sort_order: 4
    },
    {
      id: '5',
      title: 'Limited Time Offer',
      description: 'Exclusive deals ending soon',
      image_url: '/api/placeholder/1200/500',
      is_active: true,
      sort_order: 5
    }
  ];

  if (loading) {
    return (
      <div className="w-full max-w-[calc(100vw-10px)] sm:max-w-[calc(100vw-2px)] px-2 sm:px-4 mx-auto h-[170px] sm:h-[240px] bg-gray-200 animate-pulse rounded-lg"></div>
    );
  }

  const displayBanners = banners.length > 0 ? banners : sampleBanners;

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
      >
        {displayBanners.map((banner) => (
          <SwiperSlide key={banner.id} className="relative">
            <div className="w-full h-full flex items-center justify-center relative">
              <img 
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = '/api/placeholder/1200/500';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h2 className="text-2xl sm:text-4xl font-bold mb-2">{banner.title}</h2>
                  {banner.description && (
                    <p className="text-sm sm:text-lg opacity-90">{banner.description}</p>
                  )}
                </div>
              </div>
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