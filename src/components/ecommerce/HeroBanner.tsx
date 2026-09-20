'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export interface BannerItem {
  id?: number | string;
  title?: string;
  heading?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  banner_image?: string;
  previewUrl?: string;
  linkUrl?: string;
  link?: string;
  cta_link?: string;
  buttonText?: string;
  cta_text?: string;
  btn_text?: string;
}

interface HeroBannerProps {
  banners: any;
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const parseBanners = useCallback((): BannerItem[] => {
    if (!banners) return [];
    if (Array.isArray(banners)) return banners;
    if (typeof banners === 'string') {
      try {
        const parsed = JSON.parse(banners);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    if (typeof banners === 'object' && (banners as any).slides) {
      const slides = (banners as any).slides;
      if (Array.isArray(slides)) return slides;
      try {
        const parsed = JSON.parse(slides);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [banners]);

  const validBanners = parseBanners();

  useEffect(() => {
    if (validBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validBanners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [validBanners.length]);

  if (validBanners.length === 0) return null;

  const currentBanner = validBanners[currentIndex] || {};
  const title = currentBanner.title || currentBanner.heading || '';
  const subtitle = currentBanner.subtitle || currentBanner.description || '';
  const ctaText = currentBanner.buttonText || currentBanner.cta_text || currentBanner.btn_text || '';
  const ctaLink = currentBanner.linkUrl || currentBanner.cta_link || currentBanner.link || '/shop';

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? validBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validBanners.length);
  };

  return (
    <section className="container mx-auto px-4 my-3">
      <div className="relative w-full h-40 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-md bg-slate-900 group">
        
        {validBanners.map((banner: BannerItem, index: number) => {
          const rawImgUrl = banner.previewUrl || banner.image || banner.banner_image;
          if (!rawImgUrl) return null;

          const isActive = index === currentIndex;

          return (
            <div
              key={banner.id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={rawImgUrl}
                alt={banner.title || 'Hero Banner'}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          );
        })}

        {(title || subtitle || ctaText) && (
          <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 sm:p-10 text-white pointer-events-none">
            <div className="max-w-md space-y-2 pointer-events-auto">
              {title && (
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-md">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-100 line-clamp-2 drop-shadow">
                  {subtitle}
                </p>
              )}
              {ctaText && (
                <div className="pt-1">
                  <Link
                    href={ctaLink}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-4.5 py-2 rounded-lg transition-all shadow-md active:scale-95"
                  >
                    {ctaText} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {validBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-30 focus:outline-none cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-30 focus:outline-none cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
              {validBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? 'w-5 bg-emerald-500' : 'w-1.5 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}