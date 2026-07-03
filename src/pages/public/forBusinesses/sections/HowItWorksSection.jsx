import Container from '../../../../layout/Container';

const steps = [
    {
        title: 'Contact Us',
        description: 'Reach out and tell us your needs or get a quote',
    },
    {
        title: 'Get a Quote',
        description: 'We provide detailed pricing tailored to your requirements',
    },
    {
        title: 'Confirm Order',
        description: 'Review and approve your customized solution',
    },
    {
        title: 'Delivery',
        description: 'Fast delivery with professional setup',
    },
];

const HowItWorksSection = () => {
    return (
        <section className='bg-linear-to-b from-[#F9FAFB] to-[#FFFFFF] py-14 lg:py-20'>
            <Container>
                <div className='text-center'>
                    <h2 className='text-[38px] font-bold leading-tight text-[#2E395B]'>
                        How It Works
                    </h2>
                    <p className='mt-2 text-sm lg:text-base text-[#94A3B8]'>
                        Simple process, powerful results
                    </p>
                </div>

                <div className='mx-auto mt-8 max-w-4xl space-y-3'>
                    {steps.map(({ title, description }, idx) => (
                        <div
                            key={title}
                            className='flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 hover:scale-105 transition-all duration-300'
                        >
                            <span className='inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-linear-to-b from-[#00B8DB] to-custom text-base font-bold text-white'>
                                {idx + 1}
                            </span>
                            <div>
                                <h3 className='text-base xl:text-lg font-semibold text-[#111827]'>
                                    {title}
                                </h3>
                                <p className='mt-0.5 text-sm xl:text-base text-[#6B7280]'>
                                    {description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default HowItWorksSection;
