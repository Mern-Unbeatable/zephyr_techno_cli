// src/components/Review.jsx
// npm install swiper
import React from 'react';

import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Container from '../../../../../layout/Container';

const reviews = [
    {
        id: 1,
        stars: 5,
        text: "I recently bought a smartphone from this website, and the experience was excellent. The delivery was fast, the product was genuine, and the price was better than local stores.",
        author: "Sabo Masties",
    },
    {
        id: 2,
        stars: 5,
        text: "Great service and smooth ordering process. I loved how easy it was to compare different phones before buying. The customer support team was also very helpful!",
        author: "Sam",
    },
    {
        id: 3,
        stars: 5,
        text: "I was a bit worried about buying a phone online, but this site proved me wrong. The phone arrived perfectly packaged and works flawlessly. I'll definitely shop here again!",
        author: "Mansur",
    },
    {
        id: 4,
        stars: 5,
        text: "Absolutely love the shopping experience here. Wide range of products, competitive prices, and super fast delivery. Will definitely recommend to friends and family.",
        author: "Rahima",
    },
     {
        id: 5,
        stars: 5,
        text: "Great service and smooth ordering process. I loved how easy it was to compare different phones before buying. The customer support team was also very helpful!",
        author: "Sam",
    },
    
];

const StarRating = ({ count }) => (
    <div className="flex gap-1 mb-4">
        {Array.from({ length: count }).map((_, i) => (
            <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
            </svg>
        ))}
    </div>
);

const Review = () => {
    const swiperRef = useRef(null);
    const [activeBtn, setActiveBtn] = useState('next');

    return (
        <Container>
            {/*
              ✅ overflow-x-hidden on the section — clips horizontal bleed from scaled cards
                 but does NOT clip the card itself on mobile like a wrapper overflow-hidden does
              ✅ py-10 on section gives vertical breathing room for scale-110
            */}
            <section className="w-full py-16 px-6 sm:px-8 overflow-x-hidden">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-14">
                    What Our Users Say
                </h2>

                <div className="max-w-6xl mx-auto py-10">
                    {/* ✅ No overflow-hidden here — was clipping mobile cards */}
                    <Swiper
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        slidesPerView={3}
                        spaceBetween={24}
                        centeredSlides={true}
                        initialSlide={1}
                        loop={true}
                        style={{ overflow: 'visible' }}
                        breakpoints={{
                            0:    { slidesPerView: 1, centeredSlides: false, loop: true },
                            640:  { slidesPerView: 1, centeredSlides: false, loop: true },
                            768:  { slidesPerView: 2, centeredSlides: false, loop: true },
                            1024: { slidesPerView: 3, centeredSlides: true,  loop: true },
                        }}
                    >
                        {reviews.map((review) => (
                            <SwiperSlide key={review.id}>
                                {({ isActive }) => (
                                    <div
                                        className={`
                                            p-6 rounded-xl border transition-all duration-500
                                            ${isActive
                                                ? 'bg-white shadow-lg border-gray-200 scale-110 z-10'
                                                : 'bg-white border-gray-100 shadow-sm scale-95 opacity-80 h-55'
                                            }
                                        `}
                                    >
                                        <StarRating count={review.stars} />
                                        <p className={`
                                            text-gray-600 text-sm leading-relaxed mb-4
                                            ${isActive ? '' : 'line-clamp-4'}
                                        `}>
                                            {review.text}
                                        </p>
                                        <p className="font-bold text-gray-800 text-sm">
                                            -{review.author}
                                        </p>
                                    </div>
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4 mt-2">
                    <button
                        onClick={() => {
                            swiperRef.current?.slidePrev();
                            setActiveBtn('prev');
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-md transition-all ${
                            activeBtn === 'prev'
                                ? 'bg-[#29b8c9] text-white hover:bg-[#1fa3b3]'
                                : 'text-gray-400 hover:text-gray-700'
                        }`}
                        aria-label="Previous"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={() => {
                            swiperRef.current?.slideNext();
                            setActiveBtn('next');
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-md transition-all ${
                            activeBtn === 'next'
                                ? 'bg-[#29b8c9] text-white hover:bg-[#1fa3b3]'
                                : 'text-gray-400 hover:text-gray-700'
                        }`}
                        aria-label="Next"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </section>
        </Container>
    );
};

export default Review;