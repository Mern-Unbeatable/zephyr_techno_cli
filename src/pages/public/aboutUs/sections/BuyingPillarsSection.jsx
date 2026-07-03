import Container from '../../../../layout/Container';
import {
    FiSearch,
    FiCreditCard,
    FiAward,
    FiHeadphones,
} from 'react-icons/fi';

const buyingPillars = [
    { title: 'Inspected', icon: FiSearch },
    { title: 'Flexible Pay', icon: FiCreditCard },
    { title: 'Warranty', icon: FiAward },
    { title: 'UK Support', icon: FiHeadphones },
];

const BuyingPillarsSection = () => {
    return (
        <section className='border-b border-slate-100 bg-white py-12 lg:py-16'>
            <Container>
                <div className='grid items-center gap-10 lg:grid-cols-[1fr_1fr]'>
                    <div>
                        <h2 className='text-[42px] font-bold leading-tight text-[#2E395B]'>
                            Simple Buying. Unmatched
                            <br />
                            Quality.
                        </h2>
                        <p className='mt-4 max-w-xl text-sm lg:text-base leading-6 text-slate-600'>
                            Purchasing your next device should be as exciting as the
                            first time you turn it on. We have refined our process to
                            be as frictionless as possible.
                        </p>
                    </div>

                    <div className='grid gap-3 sm:grid-cols-2'>
                        {buyingPillars.map(({ title, icon: Icon }) => (
                            <div
                                key={title}
                                className='flex items-center gap-2 rounded-md bg-[#F6FAFC] px-3 py-3 hover:scale-105 transition-all duration-300'
                            >
                                <Icon className='text-sm lg:text-base text-custom' />
                                <span className='text-sm lg:text-base text-[#334155]'>{title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default BuyingPillarsSection;
