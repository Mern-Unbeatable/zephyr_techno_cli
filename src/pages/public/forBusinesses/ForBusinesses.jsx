import HeroSection from './sections/HeroSection';
import AboutIntroSection from './sections/AboutIntroSection';
import OfferingsSection from './sections/OfferingsSection';
import WhyChooseSection from './sections/WhyChooseSection';
import HowItWorksSection from './sections/HowItWorksSection';
import ContactFormSection from './sections/ContactFormSection';

const ForBusinesses = () => {
    return (
        <div className='bg-[#FBFDFF]'>
            <HeroSection />
            <AboutIntroSection />
            <OfferingsSection />
            <WhyChooseSection />
            <HowItWorksSection />
            <ContactFormSection />
        </div>
    );
};

export default ForBusinesses;
