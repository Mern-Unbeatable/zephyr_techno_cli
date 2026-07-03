import HeroSection from './sections/HeroSection';
import OurPromiseSection from './sections/OurPromiseSection';
import CompetitivePricingSection from './sections/CompetitivePricingSection';
import HowItWorksSection from './sections/HowItWorksSection';
import WhySellSection from './sections/WhySellSection';
import BeforeSendingSection from './sections/BeforeSendingSection';
import CTASection from './sections/CTASection';

const Sell = () => {
	return (
		<div className="bg-[#FBFDFF] min-h-screen">
			<HeroSection />
			<OurPromiseSection />
			<CompetitivePricingSection />
			<HowItWorksSection />
			<WhySellSection />
			<BeforeSendingSection />
			<CTASection />
		</div>
	);
};

export default Sell;