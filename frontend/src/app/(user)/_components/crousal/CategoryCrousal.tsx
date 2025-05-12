'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import {  Pagination, Navigation } from 'swiper/modules';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryCarousel() {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [totalSlides, setTotalSlides] = React.useState(0);
    const slides = [
        { id: 1, bgColor: 'bg-blue-600', title: 'Electronics', icon: '/categories/electronics.svg' },
        { id: 2, bgColor: 'bg-purple-600', title: 'Fashion', icon: '/categories/fashion.svg' },
        { id: 3, bgColor: 'bg-green-600', title: 'Home', icon: '/categories/home.svg' },
        { id: 4, bgColor: 'bg-red-600', title: 'Sports', icon: '/categories/sports.svg' },
        { id: 5, bgColor: 'bg-yellow-600', title: 'Books', icon: '/categories/books.svg' },
        { id: 6, bgColor: 'bg-pink-600', title: 'Beauty', icon: '/categories/beauty.svg' },
        { id: 7, bgColor: 'bg-indigo-600', title: 'Toys', icon: '/categories/toys.svg' },
        { id: 8, bgColor: 'bg-teal-600', title: 'Groceries', icon: '/categories/groceries.svg' },
        { id: 9, bgColor: 'bg-orange-600', title: 'Automotive', icon: '/categories/automotive.svg' },
        { id: 10, bgColor: 'bg-cyan-600', title: 'Music', icon: '/categories/music.svg' },
        { id: 11, bgColor: 'bg-lime-600', title: 'Garden', icon: '/categories/garden.svg' },
        { id: 12, bgColor: 'bg-amber-600', title: 'Pets', icon: '/categories/pets.svg' }
    ];
    

    // const getLastSlideIndex = () => {
    //     const width = window?.innerWidth || 0;
    //     let slidesPerView = 1;
        
    //     if (width >= 1024) slidesPerView = 7;
    //     else if (width >= 768) slidesPerView = 4;
    //     else if (width >= 640) slidesPerView = 4;
    //     else if (width >= 320) slidesPerView = 3;

    //     return Math.max(0, slides.length - slidesPerView);
    // };

    React.useEffect(() => {
        // setTotalSlides(getLastSlideIndex());
        // // const handleResize = () => setTotalSlides(getLastSlideIndex());
        // window.addEventListener('resize', handleResize);
        // return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="w-full flex justify-center items-center">
            <div className="w-full max-w-[1500px]">
                <Swiper
                    style={{
                        ['--swiper-navigation-color' as string]: '#2563eb',
                        ['--swiper-pagination-color' as string]: '#2563eb'
                    }}
                    className="!px-4 !py-12"
                    spaceBetween={20}
                    slidesPerView={1}
                    centeredSlides={false}
                    navigation={{
                        prevEl: '.swiper-button-prev-custom',
                        nextEl: '.swiper-button-next-custom',
                      }}
                    breakpoints={{
                        320: { slidesPerView: 3 },
                        640: { slidesPerView: 4 },
                        768: { slidesPerView: 5 },
                        1024: { slidesPerView: 7 }
                    }}
                    modules={[Pagination, Navigation]}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                >
                    {slides.map(slide => (
                        <SwiperSlide 
                            key={slide.id} 
                            className="group h-32 relative"
                        >
                            <div className="w-full h-full flex flex-col items-center">
                                <div
                                    className={cn(
                                        "rounded-full shadow-lg w-20 h-20", 
                                        "flex items-center justify-center",
                                        "transition-all duration-500 ease-in-out",
                                        "transform hover:scale-110",
                                        "hover:shadow-xl cursor-pointer",
                                        "overflow-hidden",
                                        slide.bgColor,
                                        `hover:${slide.bgColor}/90`
                                    )}
                                >
                                    <img 
                                        src={slide.icon} 
                                        alt={slide.title}
                                        className="w-10 h-10 object-contain invert" 
                                    />
                                </div>
                                <div className="w-full absolute top-20"> 
                                    <span 
                                        className={cn(
                                            "font-medium text-gray-700 text-base", 
                                            "transition-all duration-500",
                                            "group-hover:text-blue-600",
                                            "whitespace-nowrap",
                                            "block text-center"
                                        )}
                                    >
                                        {slide.title}
                                    </span>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                    <div className="absolute top-0 left-0 h-full z-10 swiper-button-prev-custom">
                        <button
                            className={cn(
                                "h-full px-4 flex items-center transition-colors duration-200",
                                "disabled:opacity-40 disabled:cursor-not-allowed ",
                                activeIndex === 0 && "opacity-40 cursor-not-allowed"
                            )}
                            onClick={(e) => {
                                if (activeIndex === 0) e.preventDefault();
                            }}
                        >
                            <ChevronLeft 
                                size={40} 
                                className={cn(
                                    "dark:text-primary-foreground text-gray-700 transition-colors duration-200",
                                    activeIndex === 0 ? "text-gray-700" : "dark:hover:text-primary-foreground hover:text-gray-600"
                                )} 
                            />
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 h-full z-10 swiper-button-next-custom">
                        <button
                            className={cn(
                                "h-full px-4 flex items-center transition-colors duration-200",
                                "disabled:opacity-40 disabled:cursor-not-allowed",
                                activeIndex >= totalSlides && "opacity-40 cursor-not-allowed"
                            )}
                            onClick={(e) => {
                                if (activeIndex >= totalSlides) e.preventDefault();
                            }}
                        >
                            <ChevronRight 
                                size={40} 
                                className={cn(
                                    "dark:text-primary-foreground  text-gray-700 transition-colors duration-200",
                                    activeIndex >= totalSlides ? "text-gray-700" : "dark:hover:text-primary-foreground hover:text-gray-600"
                                )} 
                            />
                        </button>
                    </div>
                </Swiper>
            </div>
        </div>
    );
}