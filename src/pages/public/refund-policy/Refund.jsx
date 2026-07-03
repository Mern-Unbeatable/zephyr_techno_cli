import React from 'react';
import Container from '../../../layout/Container';
import { Shield, FileCheck, RefreshCw, Headphones, Package, Mail, MapPin } from 'lucide-react';
import bannerImage from '../../../assets/refund/banner_image.png';
import packageImage from '../../../assets/refund/bottom_image.png';
import contactImage from '../../../assets/refund/contact.png';

const featureCards = [
    {
        icon: Shield,
        iconBg: 'bg-[#E8F8F0]',
        iconColor: 'text-[#10B981]',
        title: 'Secure Returns',
        description: 'Full protection on eligible returns'
    },
    {
        icon: FileCheck,
        iconBg: 'bg-[#EEF2FF]',
        iconColor: 'text-[#6366F1]',
        title: 'Fair Process',
        description: 'Transparent and customer focused'
    },
    {
        icon: RefreshCw,
        iconBg: 'bg-[#FFF3E0]',
        iconColor: 'text-[#F97316]',
        title: 'Easy Exchange',
        description: 'Quick replacement available'
    },
    {
        icon: Headphones,
        iconBg: 'bg-[#F3F4F6]',
        iconColor: 'text-[#6B7280]',
        title: 'Expert Support',
        description: 'Dedicated customer service team'
    }
];

const refundSections = [
    {
        id: 'introduction',
        title: 'Introduction',
        content: 'At Zephyr Technology, customer satisfaction is important to us and we aim to resolve issues fairly and transparently.'
    },
    {
        id: 'return-eligibility',
        title: 'Return Eligibility',
        content: 'Customers may request a return in accordance with applicable UK consumer laws.',
        bullets: [
            'Items must be returned in the same condition received',
            'Products must not show signs of misuse, tampering, accidental damage, or unauthorised modification',
            'Original packaging and included accessories should be returned where applicable',
            'Sealed products should remain unopened where possible'
        ]
    },
    {
        id: 'sealed-devices',
        title: 'Sealed & Brand New Devices',
        content: [
            'Devices sold as sealed or brand new must remain unopened and with original manufacturer seals intact to qualify for full return eligibility where permitted by law.',
            'Opened, activated, or tampered sealed devices may be subject to reduced refunds or refusal where permitted under UK consumer regulations.'
        ]
    },
    {
        id: 'faulty-items',
        title: 'Faulty or Incorrect Items',
        content: 'If you receive an incorrect, damaged, or faulty item, please contact us as soon as possible with the following information:',
        bullets: [
            'Your order number',
            'Photos/videos where applicable',
            'A description of the issue'
        ],
        footer: 'We will always do our best to investigate the situation and work towards a fair resolution.'
    },
    {
        id: 'return-requests',
        title: 'Return Requests',
        content: 'Customers should contact Zephyr Technology as soon as reasonably possible after receiving an item if they believe there is an issue with their order.'
    },
    {
        id: 'inspection',
        title: 'Inspection of Returns',
        content: 'All returned products are inspected upon arrival before refunds, replacements, exchanges, or compensation are approved.',
        subheading: 'Zephyr Technology reserves the right to document inspection findings including:',
        bullets: [
            'IMEI numbers',
            'Serial numbers',
            'Packaging condition',
            'Device condition',
            'Diagnostic results',
            'Photographic or video evidence where appropriate'
        ]
    },
    {
        id: 'return-shipping',
        title: 'Return Shipping',
        content: [
            'Where a return is approved, Zephyr Technology may provide a prepaid return label where appropriate.',
            'Customers must package returned items securely to help prevent damage during transit.',
            'Zephyr Technology is not responsible for items damaged due to inadequate packaging by the customer during the return process.',
            'For high-value returns, we recommend customers obtain proof of postage and retain tracking information until the return has been fully processed.'
        ]
    },
    {
        id: 'refund-processing',
        title: 'Refund Processing',
        content: [
            'Approved refunds are typically processed back to the original payment method after inspection and approval.',
            'Processing times may vary depending on banks, payment providers, financial institutions, or third-party services outside of our control.'
        ]
    },
    {
        id: 'cancellation',
        title: 'Cancellation Rights',
        content: [
            'Customers may have cancellation rights under applicable UK consumer laws.',
            'However, certain products including opened sealed devices, activated devices, or customised products may not qualify for full cancellation rights where exemptions apply.'
        ]
    },
    {
        id: 'blacklist',
        title: 'Blacklist Policy',
        content: [
            'All devices sold by Zephyr Technology undergo verification and multi-point checks prior to sale.',
            'In the unlikely event that a device supplied by us becomes network blacklisted after purchase, customers should contact us promptly with supporting evidence so we can investigate and assist where appropriate.'
        ]
    },
    {
        id: 'exchanges',
        title: 'Exchanges & Replacements',
        content: 'Where appropriate, Zephyr Technology may offer the following depending on the nature of the issue and product availability:',
        bullets: [
            'Replacements',
            'Exchanges',
            'Repairs',
            'Store credit',
            'Partial refunds'
        ]
    },
    {
        id: 'non-returnable',
        title: 'Non-Returnable Situations',
        content: 'Zephyr Technology reserves the right to refuse returns or reduce refunds where:',
        bullets: [
            'Devices are returned in a different condition to dispatch',
            'IMEI or serial numbers do not match records',
            'Products have been tampered with',
            'Devices show signs of misuse or unauthorised repair',
            'Products are missing accessories or packaging where applicable',
            'Fraudulent activity is suspected',
            'Incorrect items are returned',
            'Devices show signs of excessive use after delivery',
            'Devices are activation locked or account locked after delivery'
        ]
    },
    {
        id: 'business',
        title: 'Business Purchases',
        content: 'Certain business-to-business purchases may not qualify for the same cancellation or return rights available to consumers under UK consumer legislation.'
    },
    {
        id: 'investigation',
        title: 'Investigation & Resolution Times',
        content: 'While we always aim to resolve issues as quickly as possible, investigation and resolution times may vary depending on:',
        bullets: [
            'The nature of the issue',
            'Courier investigations',
            'Payment provider investigations',
            'Manufacturer involvement',
            'Third-party response times'
        ]
    },
    {
        id: 'fraud-prevention',
        title: 'Fraud Prevention & Evidence Recording',
        content: 'For fraud prevention purposes, Zephyr Technology may record:',
        bullets: [
            'IMEI numbers',
            'Serial numbers',
            'Packaging evidence',
            'Dispatch records',
            'Tracking information',
            'Device diagnostics',
            'Photographic or video evidence where appropriate'
        ],
        footer: 'This information may be relied upon during investigations, disputes, chargebacks, returns, fraud prevention processes, or legal proceedings where necessary.'
    },
    {
        id: 'chargebacks',
        title: 'Chargebacks & Payment Disputes',
        content: 'Customers agree to contact Zephyr Technology directly before initiating chargebacks or payment disputes wherever reasonably possible so we can attempt to resolve issues fairly.',
        subheading: 'Fraudulent or abusive chargebacks may be disputed using supporting evidence including:',
        bullets: [
            'Tracking confirmation',
            'IMEI records',
            'Device diagnostics',
            'Customer communications',
            'Dispatch evidence',
            'Fraud screening information'
        ]
    },
    {
        id: 'responsibility',
        title: 'Customer Responsibility',
        content: 'Customers are responsible for:',
        bullets: [
            'Checking product compatibility before purchase',
            'Backing up personal data',
            'Removing passwords and accounts before returns where required',
            'Packaging returns securely'
        ],
        footer: 'Zephyr Technology accepts no liability for personal data left on returned devices.'
    },
    {
        id: 'support',
        title: 'Customer Support',
        content: [
            'At Zephyr Technology, we always aim to treat customers fairly and transparently.',
            'If any issue arises, please contact our support team directly and we will always do our best to investigate and work towards a reasonable solution.'
        ]
    }
];

const returnSteps = [
    {
        number: '1',
        title: 'Contact Us',
        description: 'Reach out to our support team with your order details and issue description'
    },
    {
        number: '2',
        title: 'Get Approval',
        description: 'Receive return authorisation and prepaid shipping label from our team'
    },
    {
        number: '3',
        title: 'Ship Item',
        description: 'Package securely and ship using the provided label with full tracking'
    },
    {
        number: '4',
        title: 'Get Refund',
        description: 'Receive your refund after inspection and approval of your return'
    }
];

const Refund = () => {
    return (
        <div className="bg-[#FBFDFF] min-h-screen">
            {/* Hero Section with Banner */}
            <section 
                className="relative h-[400px] bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${bannerImage})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 to-[#1E293B]/70" />
                
                <Container>
                    <div className="relative z-10 text-center text-white">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur mb-6">
                            <Shield className="h-3.5 w-3.5" />
                            Customer Protection Policy
                        </div>
                        
                        <h1 className="text-5xl font-bold tracking-tight lg:text-6xl mb-4">
                            Refund Policy
                        </h1>
                        
                        <p className="text-lg text-white/90 max-w-2xl mx-auto">
                            Customer satisfaction is important to us and we aim to resolve issues fairly
                        </p>
                    </div>
                </Container>
            </section>

            {/* Feature Cards */}
            <section className="relative -mt-16 z-20">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {featureCards.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div 
                                    key={index}
                                    className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#E5E7EB] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all"
                                >
                                    <div className={`${feature.iconBg} ${feature.iconColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-[#6B7280]">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* Main Content */}
            <Container>
                <div className="py-16">
                    {/* Page Title */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#D4EEF4] bg-[#EAF7FA] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0891B2] mb-4">
                            Policy Overview
                        </div>
                        <h2 className="text-4xl font-bold text-[#1F2937] mb-4">
                            REFUND & RETURNS POLICY
                        </h2>
                        <p className="text-[#6B7280] max-w-2xl mx-auto">
                            ZEPHYR CORP LTD trading as Zephyr Technology
                        </p>
                        <p className="text-sm text-[#9CA3AF] mt-2">
                            We're committed to providing a fair and transparent returns process<br />
                            that protects your rights as a customer
                        </p>
                    </div>

                    {/* Policy Sections */}
                    <div className="max-w-6xl mx-auto space-y-6">
                        {refundSections.map((section) => (
                            <div 
                                key={section.id}
                                id={section.id}
                                className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E7EB]"
                            >
                                <h3 className="text-xl font-bold text-[#1F2937] mb-4">
                                    {section.title}
                                </h3>
                                
                                {Array.isArray(section.content) ? (
                                    section.content.map((paragraph, idx) => (
                                        <p key={idx} className="text-[#4B5563] leading-relaxed mb-3">
                                            {paragraph}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-[#4B5563] leading-relaxed mb-4">
                                        {section.content}
                                    </p>
                                )}

                                {section.subheading && (
                                    <p className="font-semibold text-[#374151] mt-5 mb-3">
                                        {section.subheading}
                                    </p>
                                )}

                                {section.bullets && (
                                    <ul className="space-y-2 mt-4">
                                        {section.bullets.map((bullet, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-[#4B5563]">
                                                <span className="text-custom mt-1">•</span>
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {section.footer && (
                                    <p className="text-[#6B7280] italic mt-5 pt-4 border-t border-[#E5E7EB]">
                                        {section.footer}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Quality Assurance Section */}
                    <div className="max-w-6xl mx-auto mt-12">
                        <img 
                            src={packageImage} 
                            alt="Quality Assurance" 
                            className="w-full h-auto rounded-2xl"
                        />
                    </div>

                    {/* How Returns Work */}
                    <div className="max-w-6xl mx-auto mt-16">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#2563EB] mb-4">
                                <Package className="h-3.5 w-3.5" />
                                Simple Process
                            </div>
                            <h2 className="text-3xl font-bold text-[#1F2937] mb-3">
                                How Returns Work
                            </h2>
                            <p className="text-[#6B7280]">
                                Follow these simple steps for a smooth return experience
                            </p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {returnSteps.map((step, index) => (
                                <div key={index} className="relative">
                                    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E5E7EB] h-full">
                                        <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] rounded-xl flex items-center justify-center font-bold text-xl mb-4">
                                            {step.number}
                                        </div>
                                        <h4 className="font-bold text-[#1F2937] mb-2">
                                            {step.title}
                                        </h4>
                                        <p className="text-sm text-[#6B7280] leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                    {index < returnSteps.length - 1 && (
                                        <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#E5E7EB]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="max-w-6xl mx-auto mt-16">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E5E7EB]">
                            <div className="grid md:grid-cols-2 gap-0">
                                <div className="p-10">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#D4EEF4] bg-[#EAF7FA] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0891B2] mb-6">
                                        Get In Touch
                                    </div>
                                    
                                    <h3 className="text-3xl font-bold text-[#1F2937] mb-6">
                                        Contact Information
                                    </h3>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                                                ZEPHYR CORP LTD
                                            </p>
                                            <p className="text-[#4B5563]">Trading as Zephyr Technology</p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-custom shrink-0 mt-0.5" />
                                            <div className="text-[#4B5563]">
                                                The Porter Building<br />
                                                1 Brunel Way<br />
                                                Slough<br />
                                                England<br />
                                                SL1 1FQ
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-custom" />
                                            <a 
                                                href="mailto:support@zephyrtechnology.co.uk"
                                                className="text-custom font-medium hover:underline"
                                            >
                                                support@zephyrtechnology.co.uk
                                            </a>
                                        </div>

                                        <div className="text-sm text-[#6B7280] pt-4 border-t border-[#E5E7EB]">
                                            Company Registration Number: 15640926
                                        </div>
                                    </div>
                                </div>

                                <div className="relative h-64 md:h-auto">
                                    <img 
                                        src={contactImage} 
                                        alt="Customer Support" 
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Refund;