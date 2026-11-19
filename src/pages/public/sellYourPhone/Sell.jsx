import HeroSection from './sections/HeroSection';
import OurPromiseSection from './sections/OurPromiseSection';
import CompetitivePricingSection from './sections/CompetitivePricingSection';
import HowItWorksSection from './sections/HowItWorksSection';
import WhySellSection from './sections/WhySellSection';
import BeforeSendingSection from './sections/BeforeSendingSection';
import CTASection from './sections/CTASection';
import DocumentHead from '../../../seo/DocumentHead';
import { STATIC_SEO } from '../../../seo/staticPages';

const Sell = () => {
	const seo = STATIC_SEO.sellHub;
	return (
		<>
			<DocumentHead
				title={seo.title}
				description={seo.description}
				canonicalPath={seo.canonicalPath}
				imageAlt={seo.h1}
			/>
			<div className="bg-[#FBFDFF] min-h-screen">
				<HeroSection />
				<OurPromiseSection />
				<CompetitivePricingSection />
				<HowItWorksSection />
				<WhySellSection />
				<BeforeSendingSection />
				<CTASection />
			</div>
		</>
	);
};

export default Sell;