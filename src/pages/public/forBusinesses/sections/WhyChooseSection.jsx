import Container from '../../../../layout/Container';
import {
    FiCheckCircle,
    FiZap,
    FiTruck,
    FiUsers,
} from 'react-icons/fi';
import { LuPoundSterling } from 'react-icons/lu';

const reasons = [
    { title: 'VAT Registered UK Supplier', icon: FiCheckCircle },
    { title: 'Competitive Market Pricing', icon: LuPoundSterling },
    { title: 'Rapidly, Quote-to-Order Speed', icon: FiZap },
    { title: 'Fast & Reliable Delivery', icon: FiTruck },
    { title: 'Dedicated Team of Experts', icon: FiUsers },
];

const WhyChooseSection = () => {
    return (
        <section className='bg-white py-14 lg:py-20'>
            <Container>
                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-[#0A0A0A] sm:text-4xl'>
                        Why Choose Us
                    </h2>
                    <p className='mt-3 text-base text-[#353535]'>
                        What makes us different
                    </p>
                </div>

                <div className='mt-12 grid grid-cols-2 gap-8 text-center sm:grid-cols-3 lg:grid-cols-5'>
                    {reasons.map(({ title, icon: Icon }) => (
                        <div key={title} className='mx-auto max-w-45'>
                            <span className='mx-auto inline-flex rounded-full bg-linear-to-b from-[#CEFAFE] to-[#DBEAFE] p-4 text-[#1293c4] hover:scale-105 duration-300 transition hover:rotate-360'>
                                <Icon size={24} />
                            </span>
                            <p className='mt-4 text-sm lg:text-base text-[#0A0A0A]'>{title}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default WhyChooseSection;
