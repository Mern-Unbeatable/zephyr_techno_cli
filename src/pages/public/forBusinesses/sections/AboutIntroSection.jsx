import Container from '../../../../layout/Container';

const AboutIntroSection = () => {
    return (
        <section className='bg-white py-14 lg:py-20'>
            <Container>
                <div className='grid items-start gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16'>
                    <div>
                        <div className='flex items-center gap-3'>
                            <span className='inline-block h-1 w-12 bg-linear-to-b from-[#00B8DB] to-[#155DFC]' />
                            <span className='text-base font-medium text-[#0092B8]'>
                                About Us
                            </span>
                        </div>
                        <h2 className='mt-4 max-w-xl text-3xl font-bold leading-tight text-[#0A0A0A] sm:text-4xl'>
                            Leading Technology Supplier in the UK
                        </h2>
                    </div>
                    <p className='text-lg leading-9 text-[#535353]'>
                        At Zephyr Technology, we specialize in providing end-to-end
                        technology solutions for businesses across the UK. Whether you
                        need mobile devices, laptops, or hardware solutions, we&apos;ve
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
