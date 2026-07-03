import HeroSection from './sections/HeroSection';
import AboutIntroSection from './sections/AboutIntroSection';
import WhyChooseSection from './sections/WhyChooseSection';
import BuyingPillarsSection from './sections/BuyingPillarsSection';
import SellStepsSection from './sections/SellStepsSection';
import CommunityCtaSection from './sections/CommunityCtaSection';

const AboutUs = () => {
    return (
        <div className='bg-[#FBFDFF]'>
            <HeroSection />
            <AboutIntroSection />
            <WhyChooseSection />
            <BuyingPillarsSection />
            <SellStepsSection />
            <CommunityCtaSection />
        </div>
    );
};

export default AboutUs;
