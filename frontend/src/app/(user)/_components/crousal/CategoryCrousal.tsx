'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { UiActions, Category } from '@/api-actions/ui-actions';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryCarouselProps {
    categories?: Category[];
}

export default function CategoryCarousel({ categories: propCategories }: CategoryCarouselProps = {}) {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [totalSlides, setTotalSlides] = React.useState(0);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        const fetchCategories = async () => {
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
                    setCategories([]);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [propCategories]);

    const slides = React.useMemo(() => {
        return categories.map((category) => ({
            ...category,
            icon: category.image || '/categories/default.svg',
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

    if (slides.length === 0) {
        return (
            <div className="w-full flex justify-center items-center py-12">
                <div className="text-center text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No categories available</p>
                    <p className="text-sm">Categories will appear here when they are added.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center items-center">
            <div className="w-full max-w-[1500px] relative">
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
                    onSwiper={(swiper) => {
                        const total = swiper.slides.length - (swiper.params.slidesPerView as number);
                        setTotalSlides(total > 0 ? total : 0);
                    }}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id} className="group h-32 relative">
                            <Link href={`/categories/${slide.slug}`} className="w-full h-full flex flex-col items-center">
                                <div
                                    className={cn(
                                        "rounded-full shadow-lg w-20 h-20",
                                        "flex items-center justify-center",
                                        "transition-all duration-500 ease-in-out",
                                        "transform hover:scale-110",
                                        "hover:shadow-xl cursor-pointer",
                                        "overflow-hidden relative",
                                        "border-2 border-gray-100 bg-gray-200"
                                    )}
                                    style={{
                                        borderRadius: '50%',
                                        clipPath: 'circle(50% at 50% 50%)'
                                    }}
                                >
                                    {slide.image && !imageErrors.has(slide.id) ? (
                                        <Image
                                            src={slide.image}
                                            alt={slide.name}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover rounded-full"
                                            style={{
                                                clipPath: 'circle(50% at 50% 50%)',
                                                objectPosition: 'center',
                                                maxWidth: '100%',
                                                maxHeight: '100%'
                                            }}
                                            onError={() => {
                                                setImageErrors(prev => new Set(prev).add(slide.id));
                                            }}
                                            unoptimized={slide.image?.endsWith('.svg')}
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
                                            "whitespace-nowrap block text-center"
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

                    {/* Left Arrow */}
                    <div className="absolute top-0 left-0 h-full z-10 swiper-button-prev-custom">
                        <button
                            className={cn(
                                "h-full px-4 flex items-center transition-colors duration-200",
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
                                    activeIndex === 0
                                        ? "text-gray-700"
                                        : "dark:hover:text-primary-foreground hover:text-gray-600"
                                )}
                            />
                        </button>
                    </div>

                    {/* Right Arrow */}
                    <div className="absolute top-0 right-0 h-full z-10 swiper-button-next-custom">
                        <button
                            className={cn(
                                "h-full px-4 flex items-center transition-colors duration-200",
                                activeIndex >= totalSlides && "opacity-40 cursor-not-allowed"
                            )}
                            onClick={(e) => {
                                if (activeIndex >= totalSlides) e.preventDefault();
                            }}
                        >
                            <ChevronRight
                                size={40}
                                className={cn(
                                    "dark:text-primary-foreground text-gray-700 transition-colors duration-200",
                                    activeIndex >= totalSlides
                                        ? "text-gray-700"
                                        : "dark:hover:text-primary-foreground hover:text-gray-600"
                                )}
                            />
                        </button>
                    </div>
                </Swiper>
            </div>
        </div>
    );
}
