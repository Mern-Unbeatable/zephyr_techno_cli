import Container from '../../../../layout/Container';
import {
    FiMonitor,
    FiTablet,
    FiHeadphones,
    FiCode,
} from 'react-icons/fi';

const offerings = [
    {
        title: 'Hardware',
        description: 'Latest laptops, desktops & computing solutions',
        icon: FiMonitor,
    },
    {
        title: 'Mobiles & Tablets',
        description: 'Mobile devices and fleet management',
        icon: FiTablet,
    },
    {
        title: 'Accessories & Peripherals',
        description: 'Full range of tech accessories',
        icon: FiHeadphones,
    },
    {
        title: 'Software Sale',
        description: 'Professional software license Sell',
        icon: FiCode,
    },
];

const OfferingsSection = () => {
    return (
        <section className='bg-[#F4F9FF] py-14 lg:py-20'>
            <Container>
                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-[#0A0A0A] sm:text-4xl'>
                        Our Offering
                    </h2>
                    <p className='mt-3 text-base text-[#4A5565]'>
                        Comprehensive technology solutions tailored to your business
                    </p>
                </div>

                <div className='mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
                    {offerings.map(({ title, description, icon: Icon }) => (
                        <div
                            key={title}
                            className='rounded-2xl border border-gray-100 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-all hover:scale-105 hover:border-custom duration-300'
                        >
                            <span className='inline-flex rounded-[14px] bg-linear-to-b from-[#CEFAFE] to-[#DBEAFE] p-4 text-[#1293c4]'>
                                <Icon size={26} />
                            </span>
                            <h3 className='mt-6 text-xl font-bold text-[#0A0A0A]'>
                                {title}
                            </h3>
                            <p className='mt-3 text-base text-[#4A5565]'>
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default OfferingsSection;
