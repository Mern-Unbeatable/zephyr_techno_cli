import { Link } from 'react-router';
import Container from '../../../../layout/Container';
import bgImage from "../../../../assets/ctabg.png";

const CommunityCtaSection = () => {
    return (
        <section
            className='relative overflow-hidden py-16 lg:py-20'
            style={{
                backgroundImage: `linear-gradient(rgba(37, 52, 98, 0.78), rgba(37, 52, 98, 0.78)), url(${bgImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className='pointer-events-none absolute inset-0 bg-black/20' />
            <Container>
                <div className='relative z-10 text-center'>
                    <h3 className='text-3xl font-bold text-white sm:text-5xl'>
                        Join The Zephyr Community
                    </h3>
                    <p className='mt-3 text-sm lg:text-base text-[#B9C7E6]'>
                        Follow Zephyr Technology for the latest devices, updates, and offers.
                    </p>
                    <div className='mt-7 flex flex-wrap items-center justify-center gap-3'>
                        <Link
                            to='/products'
                            className='rounded-sm bg-custom px-6 py-2 text-sm lg:text-base font-medium text-white transition-all duration-300 hover:brightness-110 hover:scale-105 cursor-pointer'
                        >
                            Shop Now
                        </Link>
                        <Link
                            to='/sell'
                            className='rounded-sm  px-6 py-2 text-sm lg:text-base font-medium text-white border border-white hover:border-[#243462] transition-all hover:scale-105 duration-300 hover:bg-[#243462] cursor-pointer'
                        >
                            Sell Your Phone
                        </Link>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default CommunityCtaSection;
