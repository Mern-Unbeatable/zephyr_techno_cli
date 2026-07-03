import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router';

import Container from '../../../../layout/Container';
import heroImage from '../../../../assets/aboutUs.webp';
import bgCircle from "../../../../assets/circle.png"

const HeroSection = () => {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className='relative overflow-hidden bg-linear-to-r from-[#ECFEFF] via-[#F3FBFC] to-[#FFFFFF]'>
            <Container>
                <div className='grid items-center gap-8 pt-16 lg:grid-cols-2'>
                    <div className='pr-6 max-w-2xl'>
                        <p className='text-xs font-semibold uppercase tracking-widest text-custom mb-4'>
                            UK Mobile &amp; Electronics Retailer
                        </p>

                        <h1 className='relative z-10 text-4xl font-extrabold leading-tight text-[#243048] sm:text-5xl lg:text-6xl'>
                            About <span className='relative inline-block'>Zephyr
                                <span className='absolute left-0 bottom-0 z-0 block w-full -translate-y-1'>
                                    <svg viewBox="0 0 200 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className='w-full h-3'>
                                        <path d="M0 7 C30 0, 50 10, 100 6 C150 2, 180 8, 200 6" fill="none" stroke="#2BB4C9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
                                    </svg>
                                </span>
                            </span>
                            <br />
                            Technology
                        </h1>

                        <p className='mt-6 text-lg text-[#536171] max-w-xl'>
                            Pioneering a cleaner, more transparent way to buy and sell premium consumer electronics across the United Kingdom.
                        </p>

                        <Link
                            to='/products'
                            className='mt-6 inline-flex items-center rounded-md bg-custom px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:brightness-110 cursor-pointer'
                        >
                            Shop Now
                        </Link>
                    </div>

                    <motion.div
                        className='relative flex items-center justify-end'
                        animate={
                            shouldReduceMotion
                                ? undefined
                                : {
                                      y: [0, -12, 0, 10, 0],
                                      x: [0, 10, 0, -8, 0],
                                      rotate: [0, -1.5, 0, 1.5, 0],
                                  }
                        }
                        transition={
                            shouldReduceMotion
                                ? undefined
                                : {
                                      duration: 7,
                                      ease: 'easeInOut',
                                      repeat: Infinity,
                                      repeatType: 'mirror',
                                  }
                        }
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                    >
                        <img
                            src={bgCircle}
                            alt='decorative circle'
                            className='absolute right-0 top-1/2 z-0 w-80 -translate-y-1/2 object-contain sm:w-96'
                        />
                        <div className='absolute right-8 top-1/2 z-1 h-96 w-72 -translate-y-1/2 rounded-full bg-[#1EB5D0]/45 blur-3xl sm:h-112 sm:w-84' />
                        <img
                            src={heroImage}
                            alt='phones'
                            className='relative z-10 w-120 max-w-[55vw] scale-110 object-contain'
                        />
                    </motion.div>
                </div>
            </Container>

            <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 overflow-hidden'>
                <svg
                    viewBox='0 0 1440 180'
                    preserveAspectRatio='none'
                    className='absolute inset-0 h-full w-full'
                    aria-hidden='true'
                >
                    <path
                        d='M0,112L80,92C160,72,320,32,480,48C640,64,800,144,960,144C1120,144,1280,64,1360,32L1440,0L1440,180L1360,180C1280,180,1120,180,960,180C800,180,640,180,480,180C320,180,160,180,80,180L0,180Z'
                        fill='#FFFFFF'
                    />
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;
