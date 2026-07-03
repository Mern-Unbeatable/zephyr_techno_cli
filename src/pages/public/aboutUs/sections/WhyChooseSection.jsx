import Container from '../../../../layout/Container';
import { FiCheck } from 'react-icons/fi';

const reasonItems = [
    'Trusted by thousands',
    'Competitive pricing',
    'Quality assurance',
    'Fast delivery',
    'Excellent support',
    'Secure transactions',
];

const WhyChooseSection = () => {
    return (
        <section className='bg-[#EEF5F8] py-14'>
            <Container>
                <h2 className='text-center text-[34px] font-bold text-[#2E395B]'>
                    Why Choose Zephyr Technology?
                </h2>

                <div className='mx-auto mt-8 grid max-w-4xl gap-y-2 text-sm text-[#1F2937] sm:grid-cols-2 lg:grid-cols-3'>
                    {reasonItems.map((item) => (
                        <div key={item} className='flex items-center gap-2'>
                            <FiCheck className='text-xs lg:text-base text-custom' />
                            <span className='text-sm lg:text-base'>{item}</span>
                        </div>
                    ))}
                </div>

                <p className='mt-8 text-center text-xs lg:text-sm xl:text-base text-[#9CA3AF]'>
                    All transactions are protected and your data is kept secure.
                </p>
            </Container>
        </section>
    );
};

export default WhyChooseSection;
