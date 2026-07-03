import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router';

import Container from '../../../../layout/Container';
import printer from '../../../../assets/printer.png';

const HeroSection = () => {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className='bg-linear-to-b from-[#ECFEFF] via-[#EFF6FF] to-[#FFFFFF] py-12 lg:py-20'>
            <Container>
                <div className='grid items-center gap-10 lg:grid-cols-2'>
                    <div>
                        <span className='inline-flex rounded-full bg-[#CEFAFE] px-4 py-1.5 text-sm font-medium text-[#007595]'>
                            UK&apos;s Trusted Technology Partner
                        </span>
                        <h1 className='mt-5 text-4xl font-bold leading-tight text-[#0A0A0A] sm:text-5xl lg:text-6xl'>
                            Supplying
                            <br />
                            Technology
                            <br />
                            Solutions for
                            <br />
                            <span className='text-[#00B8DB]'>UK Businesses</span>
                        </h1>
                        <p className='mt-5 max-w-2xl text-base leading-8 text-[#4A5565] lg:text-xl'>
                            From cutting-edge hardware to comprehensive support, we
                            deliver technology solutions that power your business
                            forward.
                        </p>
                        <Link
                            to='/contact'
                            className='mt-6 inline-flex items-center rounded-lg bg-linear-to-b from-[#00B8DB] to-custom hover:scale-105 px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:brightness-110 cursor-pointer'
                        >
                            Get Started Today
                        </Link>
                    </div>

                    <motion.div
                        className='relative mx-auto flex w-full max-w-3xl items-center justify-center rounded-[28px] lg:p-12'
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
                        <motion.img
                            src={printer}
                            alt='Business technology illustration'
                            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
                            animate={
                                shouldReduceMotion
                                    ? undefined
                                    : { opacity: 1, scale: 1 }
                            }
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className='drop-shadow-[0_28px_60px_rgba(0,184,219,0.22)]'
                        />
                    </motion.div>
                </div>
            </Container>
        </section>
    );
};

export default HeroSection;
