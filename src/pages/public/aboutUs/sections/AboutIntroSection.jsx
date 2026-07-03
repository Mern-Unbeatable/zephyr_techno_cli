import Container from '../../../../layout/Container';

const AboutIntroSection = () => {
    return (
        <section className='bg-white py-12 lg:py-16'>
            <Container>
                <div className='grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]'>
                    <div>
                        <div className='flex items-center gap-2'>
                            <span className='h-0.5 w-8 bg-custom' />
                            <span className='text-xs text-custom'>About Us</span>
                        </div>
                        <h2 className='mt-3 max-w-sm text-[30px] font-bold leading-tight text-[#111827]'>
                            Leading Technology Supplier in the UK
                        </h2>
                    </div>

                    <p className='max-w-3xl text-sm leading-7 text-[#4B5563] sm:text-base'>
                        At Zephyr Technology, we specialize in providing end-to-end
                        technology solutions for businesses across the UK. Whether you
                        need mobile devices, laptops, or hardware solutions, we have
                        got you covered with expert support and competitive pricing.
                        From initial setup to help requirements, we deliver seamless
                        service when you need it.
                    </p>
                </div>
            </Container>
        </section>
    );
};

export default AboutIntroSection;
