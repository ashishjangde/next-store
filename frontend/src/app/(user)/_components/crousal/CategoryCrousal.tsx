'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import {  Pagination, Navigation } from 'swiper/modules';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { UiActions, Category } from '@/api-actions/ui-actions';
import Link from 'next/link';

interface CategoryCarouselProps {
    categories?: Category[]; // Allow passing categories as props
}

export default function CategoryCarousel({ categories: propCategories }: CategoryCarouselProps = {}) {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [totalSlides, setTotalSlides] = React.useState(0);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Fallback sample data with proper Category interface
    const fallbackSlides: Category[] = [
        { id: '1', name: 'Electronics', slug: 'electronics', is_active: true, level: 0, sort_order: 1, image_url: '/categories/electronics.svg' },
        { id: '2', name: 'Fashion', slug: 'fashion', is_active: true, level: 0, sort_order: 2, image_url: '/categories/fashion.svg' },
        { id: '3', name: 'Home', slug: 'home', is_active: true, level: 0, sort_order: 3, image_url: '/categories/home.svg' },
        { id: '4', name: 'Sports', slug: 'sports', is_active: true, level: 0, sort_order: 4, image_url: '/categories/sports.svg' },
        { id: '5', name: 'Books', slug: 'books', is_active: true, level: 0, sort_order: 5, image_url: '/categories/books.svg' },
        { id: '6', name: 'Beauty', slug: 'beauty', is_active: true, level: 0, sort_order: 6, image_url: '/categories/beauty.svg' },
        { id: '7', name: 'Toys', slug: 'toys', is_active: true, level: 0, sort_order: 7, image_url: '/categories/toys.svg' },
        { id: '8', name: 'Groceries', slug: 'groceries', is_active: true, level: 0, sort_order: 8, image_url: '/categories/groceries.svg' },
    ];

    // Color palette for categories
    const colorPalette = [
        'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-red-600',
        'bg-yellow-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
        'bg-orange-600', 'bg-cyan-600', 'bg-lime-600', 'bg-amber-600'
    ];    // Fetch categories from API only if not provided as props
    React.useEffect(() => {
        const fetchCategories = async () => {
            // If categories are provided as props, use them directly
            if (propCategories && propCategories.length > 0) {
                setCategories(propCategories);
                setIsLoading(false);
                return;
            }

            try {
                const response = await UiActions.getCategories();
                if (response.data && response.data.length > 0) {
                    setCategories(response.data);
                } else {
                    // Use fallback data if API returns empty
                    setCategories(fallbackSlides);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                // Use fallback data if API fails
                setCategories(fallbackSlides);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [propCategories]);

    const slides = React.useMemo(() => {
        if (categories.length === 0) return fallbackSlides;
        
        return categories.map((category, index) => ({
            ...category,
            bgColor: colorPalette[index % colorPalette.length],
            icon: category.image_url || '/categories/default.svg',
            productCount: category._count?.Products || 0
        }));
    }, [categories]);

    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center py-12">
                <div className="animate-pulse flex space-x-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-300 rounded-full mb-2"></div>
                            <div className="w-16 h-4 bg-gray-300 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    


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
                >                    {slides.map((slide, index) => (
                        <SwiperSlide 
                            key={slide.id} 
                            className="group h-32 relative"
                        >
                            <Link href={`/categories/${slide.slug}`} className="w-full h-full flex flex-col items-center">
                                <div
                                    className={cn(
                                        "rounded-full shadow-lg w-20 h-20", 
                                        "flex items-center justify-center",
                                        "transition-all duration-500 ease-in-out",
                                        "transform hover:scale-110",
                                        "hover:shadow-xl cursor-pointer",
                                        "overflow-hidden",
                                        colorPalette[index % colorPalette.length],
                                    )}
                                >
                                    {slide.image_url ? (
                                        <img 
                                            src={slide.image_url} 
                                            alt={slide.name}
                                            className="w-10 h-10 object-contain invert"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    const icon = document.createElement('div');
                                                    icon.innerHTML = '<svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>';
                                                    parent.appendChild(icon.firstChild as Node);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Package className="w-10 h-10 text-white" />
                                    )}
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
                                        {slide.name}
                                    </span>
                                    {slide._count?.Products && (
                                        <span className="text-xs text-gray-500 block text-center mt-1">
                                            {slide._count.Products} items
                                        </span>
                                    )}
                                </div>
                            </Link>
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