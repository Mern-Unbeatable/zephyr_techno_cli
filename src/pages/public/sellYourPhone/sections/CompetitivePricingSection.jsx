import React from "react";
import Container from '../../../../layout/Container';
import { Check, ShieldCheck, Zap, Lock } from 'lucide-react';

const features = [
	{ icon: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/MkyIKCPWw5/7pfyrg5y_expires_30_days.png", label: "Fair & transparent valuations" },
	{ icon: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/MkyIKCPWw5/yffqcdze_expires_30_days.png", label: "No hidden charges" },
	{ icon: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/MkyIKCPWw5/jxe6vicg_expires_30_days.png", label: "Instant online quotes" },
	{ icon: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/MkyIKCPWw5/wuu9s0sv_expires_30_days.png", label: "Quotes locked for 7 days" },
];

const CompetitivePricingSection = () => {
	return (
		<section className="py-10 lg:py-16">
			<Container>
				<div className="rounded-2xl bg-white p-6 sm:p-10 lg:p-12 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
					<div className="text-center mb-6">
						<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E395B]">
							Competitive Market Pricing
						</h2>
					</div>
					<p className="text-sm sm:text-base text-[#2E395B] max-w-3xl mx-auto text-center mb-8">
						We continuously monitor the UK mobile market to ensure our prices remain fair and competitive. Our transparent valuation system means you always know exactly what your device is worth.
					</p>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
						{features.map((feature, idx) => (
													<div key={idx} className="flex items-center gap-3">
														{idx === 0 && <Check className="w-5 h-5 text-[#2E395B] shrink-0" />}
														{idx === 1 && <ShieldCheck className="w-5 h-5 text-[#2E395B] shrink-0" />}
														{idx === 2 && <Zap className="w-5 h-5 text-[#2E395B] shrink-0" />}
														{idx === 3 && <Lock className="w-5 h-5 text-[#2E395B] shrink-0" />}
														<span className="text-[#2E395B] text-sm lg:text-base">{feature.label}</span>
													</div>
												))}
					</div>
				</div>
			</Container>
		</section>
	);
};

export default CompetitivePricingSection;
