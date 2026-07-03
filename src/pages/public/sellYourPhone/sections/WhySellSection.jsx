import React from "react";
import Container from '../../../../layout/Container';
import { CreditCard, ShieldCheck, RefreshCw, Check } from 'lucide-react';

const reasons = [
	{
		icon: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/MkyIKCPWw5/ua0ck55h_expires_30_days.png",
		text: "Fast, secure UK payments within 24–48 hours",
	},
	{
		icon: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/MkyIKCPWw5/2bkfkigx_expires_30_days.png",
		text: "Trusted and established UK mobile retailer",
	},
	{
		icon: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/MkyIKCPWw5/h4tv4rl8_expires_30_days.png",
		text: "Free returns if you decline a revised offer",
	},
	{
		icon: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/MkyIKCPWw5/p7d5ttyx_expires_30_days.png",
		text: "Fair grading process with transparent communication",
	},
];

const WhySellSection = () => {
	return (
		<section className="bg-white py-14 lg:py-20">
			<Container>
				<div className="flex flex-col items-center gap-8 lg:gap-10">
					<div className="text-center max-w-3xl">
						<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E395B]">
							Why Sell To Zephyr Technology?
						</h2>
					</div>
					
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto w-full">
						{reasons.map((reason, idx) => (
							<div key={idx} className="flex items-center gap-3">
								{idx === 0 && <CreditCard className="w-5 h-5 text-[#2E395B] shrink-0" />}
								{idx === 1 && <ShieldCheck className="w-5 h-5 text-[#2E395B] shrink-0" />}
								{idx === 2 && <RefreshCw className="w-5 h-5 text-[#2E395B] shrink-0" />}
								{idx === 3 && <Check className="w-5 h-5 text-[#2E395B] shrink-0" />}
								<span className="text-[#2E395B] text-sm lg:text-base leading-snug">
									{reason.text}
								</span>
							</div>
						))}
					</div>
					
					<div className="text-center mt-2">
						<p className="text-[#6A7282] text-xs sm:text-sm lg:text-base">
							We aim to make the trade-in process simple, fair, and reliable from start to finish.
						</p>
					</div>
				</div>
			</Container>
		</section>
	);
};

export default WhySellSection;
