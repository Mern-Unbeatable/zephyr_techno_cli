import React from 'react';
import Container from '../../../layout/Container';
import { CalendarDays, ChevronRight, MapPin, FileText } from 'lucide-react';

const tableOfContents = [
    { number: "01", id: "introduction", title: "Introduction" },
    { number: "02", id: "business-details", title: "Business Details" },
    { number: "03", id: "product-information", title: "Product Information and Availability" },
    { number: "04", id: "genuine-products", title: "Genuine Products and Product Checks" },
    { number: "05", id: "device-status", title: "Device Status and Network Blacklist Policy" },
    { number: "06", id: "sealed-device", title: "Sealed Device Policy" },
    { number: "07", id: "pricing", title: "Pricing" },
    { number: "08", id: "orders-payments", title: "Orders and Payments" },
    { number: "09", id: "fraud-security", title: "Fraud and Security Checks" },
    { number: "10", id: "delivery-shipping", title: "Delivery and Shipping" },
    { number: "11", id: "lost-parcels", title: "Lost, Missing, Damaged, Refused, or Undeliverable Parcels" },
    { number: "12", id: "packaging-fraud", title: "Packaging, Dispatch Evidence, and Return Fraud Protection" },
    { number: "13", id: "returns-refunds", title: "Returns and Refunds" },
    { number: "14", id: "warranty", title: "Warranty and Device Issues" },
    { number: "15", id: "trade-in", title: "Sell Your Phone and Trade-In Terms" },
    { number: "16", id: "trade-in-ownership", title: "Trade-In Ownership and Customer Responsibility" },
    { number: "17", id: "trade-in-data", title: "Trade-In Data Responsibility" },
    { number: "18", id: "trade-in-accessories", title: "Trade-In Accessories and Packaging" },
    { number: "19", id: "imei-recording", title: "IMEI and Serial Number Recording" },
    { number: "20", id: "compatibility", title: "Device Compatibility Disclaimer" },
    { number: "21", id: "repairs", title: "Unauthorised Repairs and Modifications" },
    { number: "22", id: "website-access", title: "Website Access and Technical Issues" },
    { number: "23", id: "account-security", title: "Customer Account and Information Security" },
    { number: "24", id: "abusive-behaviour", title: "Abusive or Threatening Behaviour" },
    { number: "25", id: "liability", title: "Limitation of Liability" },
    { number: "26", id: "intellectual-property", title: "Intellectual Property and Manufacturer Disclaimer" },
    { number: "27", id: "force-majeure", title: "Force Majeure" },
    { number: "28", id: "governing-law", title: "Governing Law" },
    { number: "29", id: "statutory-rights", title: "Statutory Rights" },
    { number: "30", id: "contact", title: "Contact Information" },
    { number: "31", id: "updates", title: "Updates to These Terms" },
    { number: "32", id: "vat-scheme", title: "VAT Scheme Information" },
];

const termsSections = [
    {
        number: "01",
        id: "introduction",
        title: "Introduction",
        content: [
            "These Terms and Conditions govern the use of the Zephyr Technology website and all purchases, sales, trade-ins, services, communications, and interactions with Zephyr Technology.",
            "By accessing our website or purchasing, selling, or using any service provided by Zephyr Technology, you confirm that you have read, understood, and agreed to these Terms and Conditions.",
            "Zephyr Technology reserves the right to amend, update, or modify these Terms at any time without prior notice. The version published on our website at the time of use will apply.",
        ],
    },
    {
        number: "02",
        id: "business-details",
        title: "Business Details",
        content: [
            "ZEPHYR CORP LTD trading as Zephyr Technology is a UK-based mobile phone and electronics retailer specialising in smartphones, consumer electronics, accessories, and device trade-ins.",
            "We aim to provide genuine products, competitive pricing, reliable UK delivery, fair trade-in processes, and transparent customer service.",
        ],
    },
    {
        number: "03",
        id: "product-information",
        title: "Product Information and Availability",
        content: [
            "We aim to ensure all product descriptions, pricing, specifications, colours, storage capacities, model names, images, and availability are accurate. However, errors may occasionally occur.",
            "Images shown on the website are for illustration purposes only. Actual products may vary slightly in colour, packaging, appearance, or included contents.",
            "Availability is not guaranteed until dispatch confirmation has been provided.",
        ],
        subheading: "Zephyr Technology reserves the right to:",
        bullets: [
            "Correct pricing or listing errors",
            "Amend product descriptions",
            "Remove products from sale",
            "Cancel orders resulting from incorrect information",
            "Limit quantities purchased",
            "Refuse or cancel orders where stock becomes unavailable",
        ],
    },
    {
        number: "04",
        id: "genuine-products",
        title: "Genuine Products and Product Checks",
        content: [
            "Zephyr Technology only sells genuine manufacturer products sourced from trusted suppliers.",
            "Devices listed as brand new or Factory Sealed are unopened unless otherwise stated.",
            "Where devices are listed as used, refurbished, graded, or pre-owned, cosmetic condition and specifications will be stated where possible.",
            "All products are professionally checked to ensure authenticity and quality before dispatch where reasonably possible.",
        ],
    },
    {
        number: "05",
        id: "device-status",
        title: "Device Status and Network Blacklist Policy",
        content: [
            "All devices sold by Zephyr Technology undergo verification and multi-point checks prior to sale, including checks relating to functionality, authenticity, and blacklist status at the time of dispatch.",
            "While we take reasonable steps to ensure devices are fully functional and clear for use at the time of dispatch at the point of sale, customers acknowledge that network blacklist databases are controlled by third-party network providers and may occasionally change after delivery due to circumstances outside of our control.",
            "In the unlikely event that a device supplied by Zephyr Technology becomes network blacklisted after purchase, customers should contact us as soon as possible with supporting evidence.",
            "At Zephyr Technology, we always aim to support our customers fairly and transparently. If any issue arises, please get in touch with our team directly and we will always do our best to investigate the situation and work towards a reasonable solution.",
            "Nothing within this policy affects a customer's statutory rights under applicable UK consumer law.",
        ],
        subheading: "Depending on the situation, we may:",
        bullets: [
            "Provide a replacement device where appropriate",
            "Offer a repair or exchange where appropriate",
            "Provide compensation where applicable",
            "Issue a partial or full refund depending on the circumstances and time elapsed since purchase",
            "Request IMEI numbers, proof of purchase, diagnostic evidence, and cooperation during investigation",
            "Refuse claims where devices have been tampered with, modified, switched, or where IMEI records do not match our records",
        ],
    },
    {
        number: "06",
        id: "sealed-device",
        title: "Sealed Device Policy",
        content: [
            "Devices sold as sealed or brand new must remain unopened and with all original manufacturer seals intact to qualify for full return eligibility where permitted by law.",
            "Opened, activated, registered, used, or tampered sealed devices may be subject to reduced refunds or refusal where permitted under UK consumer regulations.",
            "Returned sealed devices must match our dispatch records, serial numbers, IMEI records, and packaging records.",
        ],
    },
    {
        number: "07",
        id: "pricing",
        title: "Pricing",
        content: [
            "All prices displayed are subject to change without notice.",
            "Pricing may vary due to supplier costs, market demand, currency fluctuations, promotional activity, stock availability, and human or technical pricing errors.",
            "If a pricing error occurs after an order is placed, Zephyr Technology reserves the right to cancel the order and issue a refund.",
        ],
    },
    {
        number: "08",
        id: "orders-payments",
        title: "Orders and Payments",
        content: [
            "Orders are only confirmed once payment has been successfully received and verified.",
            "All payments are processed securely through trusted third-party payment gateways.",
            "Zephyr Technology is not responsible for payment provider outages, banking delays, declined payments, or verification failures outside of our control.",
        ],
        subheading: "Zephyr Technology reserves the right to:",
        bullets: [
            "Cancel or refuse any order",
            "Request additional verification",
            "Delay dispatch for security checks",
            "Limit quantities purchased",
            "Refuse service to any customer",
            "Accept payment methods including Visa, Mastercard, Apple Pay, Google Pay, PayPal, bank transfer, and other approved payment providers",
        ],
    },
    {
        number: "09",
        id: "fraud-security",
        title: "Fraud and Security Checks",
        content: [
            "To protect customers and prevent fraud, Zephyr Technology may conduct identity verification and security checks on orders.",
            "Orders flagged as high risk may be delayed, cancelled, or refunded without notice.",
            "Fraudulent activity including manipulated shipping labels, false delivery claims, fraudulent chargebacks, altered serial numbers, switched returns, empty box claims, or false payment disputes may be reported to relevant authorities.",
        ],
        subheading: "Zephyr Technology may:",
        bullets: [
            "Request proof of identity",
            "Request proof of address",
            "Request payment verification",
            "Cancel suspicious orders",
            "Refuse transactions",
            "Report suspected fraud to Action Fraud, courier fraud teams, payment providers, financial institutions, fraud prevention agencies, and law enforcement authorities",
        ],
    },
    {
        number: "10",
        id: "delivery-shipping",
        title: "Delivery and Shipping",
        content: [
            "We aim to dispatch orders promptly; however, dispatch and delivery times are estimates only and are not guaranteed.",
            "Customers are responsible for ensuring delivery details are accurate and complete.",
            "Once tracking confirms delivery to the address supplied by the customer, responsibility for the parcel transfers to the customer.",
            "Customers must report missing, damaged, or incorrect deliveries within 48 hours of delivery confirmation.",
        ],
        subheading: "We are not responsible for delays caused by:",
        bullets: [
            "Courier company delays",
            "Weather disruption",
            "Customs delays",
            "Failed delivery attempts",
            "Incorrect customer information",
            "Events outside of our control",
        ],
    },
    {
        number: "11",
        id: "lost-parcels",
        title: "Lost, Missing, Damaged, Refused, or Undeliverable Parcels",
        content: [
            "Where tracking confirms delivery to the address supplied by the customer, Zephyr Technology shall not be held liable for parcels claimed as lost, missing, or stolen after delivery.",
            "Where parcels are refused, unclaimed, returned to sender, or undeliverable due to incorrect customer information, Zephyr Technology reserves the right to deduct applicable delivery, return, insurance, and handling costs from any refund where permitted by law.",
            "Customers agree to cooperate fully with delivery investigations. Failure to cooperate may result in refusal of claims, refunds, replacements, or compensation.",
        ],
        subheading: "During investigations, we may:",
        bullets: [
            "Request identification",
            "Request proof of non-receipt",
            "Conduct internal investigations",
            "Cooperate with courier investigations",
            "Request signed declarations",
            "Request police or Action Fraud reports where necessary",
            "Report false claims or fraudulent activity to relevant authorities",
        ],
    },
    {
        number: "12",
        id: "packaging-fraud",
        title: "Packaging, Dispatch Evidence, and Return Fraud Protection",
        content: [
            "Zephyr Technology may record packaging weights, serial numbers, IMEI information, dispatch evidence, packaging identifiers, and where appropriate photographic or video evidence for fraud prevention and quality assurance purposes.",
            "Any returned parcel containing incorrect items, missing devices, switched products, altered serial numbers, empty packaging, or signs of tampering may be investigated and reported to the relevant authorities.",
            "Inspection results, photographs, diagnostic reports, packaging evidence, courier records, IMEI records, and communications may be relied upon during disputes or investigations.",
        ],
    },
    {
        number: "13",
        id: "returns-refunds",
        title: "Returns and Refunds",
        content: [
            "Customers may request returns in accordance with UK consumer laws.",
            "Refunds are processed after inspection and approval.",
            "Zephyr Technology is not responsible for customer damage occurring after delivery.",
        ],
        subheading: "Return conditions:",
        bullets: [
            "Returned products must be returned in the same condition received",
            "Returned products must include original packaging where applicable",
            "Returned products must include accessories where applicable",
            "Returned products must not show signs of misuse, accidental damage, tampering, extended use, or unauthorised modification",
            "We may refuse returns, apply deductions for damage or missing items, or reject incomplete returns where permitted by law",
            "Devices returned after activation, use, account login, physical damage, software modification, tampering, or part replacement may be subject to reduced refunds or refusal where permitted under UK consumer laws",
        ],
    },
    {
        number: "14",
        id: "warranty",
        title: "Warranty and Device Issues",
        content: [
            "Any manufacturer warranty remains the responsibility of the manufacturer unless otherwise stated.",
            "Battery performance and battery health naturally reduce over time through normal usage. Zephyr Technology is not responsible for normal battery degradation occurring after purchase.",
            "Devices showing signs of tampering or unauthorised repair may void eligibility for support, return, refund, replacement, or warranty assistance.",
        ],
        subheading: "Not covered:",
        bullets: [
            "Accidental damage",
            "Liquid damage",
            "Misuse",
            "Third-party repairs",
            "Software modifications",
            "Battery degradation through normal use",
            "Network or provider restrictions",
            "User-installed software issues",
            "Jailbreaking, rooting, or unauthorised software changes",
        ],
    },
    {
        number: "15",
        id: "trade-in",
        title: "Sell Your Phone and Trade-In Terms",
        content: [
            "Customers using our trade-in service confirm that they legally own the device being sold, the device is not stolen, the device is free from undisclosed finance agreements, the device is accurately graded, and all personal data has been removed.",
            "Quotes are valid for 7 calendar days from the date provided, subject to the device matching the selected condition and description.",
            "If a device differs from the selected condition, Zephyr Technology may issue a revised offer following inspection.",
            "If the revised offer is declined, eligible devices may be returned free of charge where the original condition selected was reasonably accurate.",
            "Devices that are activation locked, blacklisted, reported lost or stolen, counterfeit, unsafe, heavily tampered with, or account locked may receive a £0 valuation and may be refused, recycled, or reported where appropriate.",
        ],
        subheading: "Trade-in requirements:",
        bullets: [
            "Devices must be removed from iCloud, Samsung, Google, MDM, or similar accounts",
            "Devices must be factory reset",
            "Devices must match the submitted condition",
            "Devices must not be counterfeit, blacklisted, reported lost or stolen, or subject to undisclosed finance",
        ],
    },
    {
        number: "16",
        id: "trade-in-ownership",
        title: "Trade-In Ownership and Customer Responsibility",
        content: [
            "By selling a device to Zephyr Technology, customers confirm that they are the lawful owner of the device, the device has not been obtained fraudulently, the device is not subject to undisclosed finance agreements, and they have the legal right to sell the device.",
            "Customers agree to indemnify and hold harmless Zephyr Technology against claims, investigations, losses, liabilities, or costs arising from unlawful ownership, fraud, theft, finance disputes, or unauthorised sale of the device.",
        ],
    },
    {
        number: "17",
        id: "trade-in-data",
        title: "Trade-In Data Responsibility",
        content: [
            "Customers are solely responsible for backing up data, removing accounts, removing SIM cards, and erasing personal information before sending devices to us.",
            "Zephyr Technology accepts no liability for data loss, data recovery, SIM card loss, remaining personal data, stored passwords, photos, messages, files, or account access left on devices.",
        ],
    },
    {
        number: "18",
        id: "trade-in-accessories",
        title: "Trade-In Accessories and Packaging",
        content: [
            "Unless specifically requested, chargers, cases, SIM cards, packaging, cables, and accessories do not increase the trade-in value and may be responsibly recycled.",
            "Zephyr Technology is not responsible for returning unwanted accessories, packaging, or SIM cards sent with devices.",
        ],
    },
    {
        number: "19",
        id: "imei-recording",
        title: "IMEI and Serial Number Recording",
        content: [
            "For fraud prevention, verification, warranty, and security purposes, Zephyr Technology may record IMEI numbers, serial numbers, device identifiers, dispatch records, and packaging identifiers for dispatched and traded-in devices.",
            "Returned products must match the original dispatched device records.",
            "Any discrepancies involving switched devices, altered serial numbers, incorrect returns, or fraudulent activity may result in refusal of refunds and escalation to relevant authorities.",
        ],
    },
    {
        number: "20",
        id: "compatibility",
        title: "Device Compatibility Disclaimer",
        content: [
            "Customers are responsible for ensuring devices purchased are compatible with their intended carrier, network provider, accessories, software requirements, eSIM requirements, or personal usage requirements.",
            "Zephyr Technology is not responsible for incompatibility caused by carrier restrictions, regional software limitations, customer software changes, third-party applications, network provider limitations, or customer setup choices.",
        ],
    },
    {
        number: "21",
        id: "repairs",
        title: "Unauthorised Repairs and Modifications",
        content: [
            "Zephyr Technology is not responsible for issues arising from third-party repairs, unauthorised modifications, software alterations, replacement parts installed after delivery, jailbreaking or rooting devices, or accidental or intentional damage caused after delivery.",
            "Devices showing signs of tampering, repair attempts, or modification may void eligibility for returns, refunds, replacements, or support.",
        ],
    },
    {
        number: "22",
        id: "website-access",
        title: "Website Access and Technical Issues",
        content: [
            "Zephyr Technology does not guarantee uninterrupted or error-free access to the website.",
            "We are not responsible for temporary outages, website downtime, technical errors, hosting failures, payment gateway interruptions, software bugs, maintenance periods, or issues outside of our reasonable control.",
        ],
    },
    {
        number: "23",
        id: "account-security",
        title: "Customer Account and Information Security",
        content: [
            "Customers are responsible for maintaining the confidentiality of their account details and ensuring account information remains accurate and up to date.",
            "Zephyr Technology shall not be responsible for unauthorised account access resulting from customer negligence, password sharing, compromised devices, or inaccurate customer information.",
        ],
    },
    {
        number: "24",
        id: "abusive-behaviour",
        title: "Abusive or Threatening Behaviour",
        content: [
            "Zephyr Technology reserves the right to refuse service, cancel orders, restrict communication, or terminate customer interactions where customers engage in abusive behaviour, threats, harassment, fraudulent claims, repeated misuse of return systems, excessive chargebacks or disputes, or attempts to manipulate policies or systems.",
        ],
    },
    {
        number: "25",
        id: "liability",
        title: "Limitation of Liability",
        content: [
            "To the maximum extent permitted by law, Zephyr Technology shall not be liable for indirect losses, loss of profits, business interruption, data loss, courier delays, delivery issues, third-party failures, website downtime, technical errors, compatibility issues, customer misuse, or circumstances outside of our reasonable control.",
            "Our maximum liability shall not exceed the purchase amount paid by the customer, except where liability cannot legally be limited.",
        ],
    },
    {
        number: "26",
        id: "intellectual-property",
        title: "Intellectual Property and Manufacturer Disclaimer",
        content: [
            "All website content including logos, branding, graphics, product layouts, text, images, and website design remain the property of Zephyr Technology unless otherwise stated.",
            "Unauthorised use, copying, reproduction, distribution, or modification is prohibited.",
            "Zephyr Technology is an independent retailer and is not affiliated with, authorised by, sponsored by, or endorsed by Apple Inc. or any other manufacturer unless explicitly stated.",
        ],
    },
    {
        number: "27",
        id: "force-majeure",
        title: "Force Majeure",
        content: [
            "Zephyr Technology shall not be held liable for delays or failures caused by events outside of our reasonable control including natural disasters, internet outages, supplier failures, government action, industrial disputes, cyber attacks, courier disruption, payment provider failures, or other unforeseeable events.",
        ],
    },
    {
        number: "28",
        id: "governing-law",
        title: "Governing Law",
        content: [
            "These Terms and Conditions are governed by the laws of England and Wales.",
            "Any disputes shall be subject to the jurisdiction of the courts of England and Wales.",
        ],
    },
    {
        number: "29",
        id: "statutory-rights",
        title: "Statutory Rights",
        content: [
            "Nothing within these Terms and Conditions excludes or limits any rights customers may have under applicable UK consumer protection laws.",
        ],
    },
    {
        number: "30",
        id: "contact",
        title: "Contact Information",
        content: [
            "ZEPHYR CORP LTD",
            "Trading as Zephyr Technology",
            "The Porter Building",
            "1 Brunel Way",
            "Slough",
            "England",
            "SL1 1FQ",
            "Email: support@zephyrtechnology.co.uk",
            "Customers may contact us by email or in writing using the above details for customer support, legal enquiries, complaints, returns, or formal correspondence.",
            "Company Registration Number: 15640926",
        ],
        contact: true,
    },
    {
        number: "31",
        id: "updates",
        title: "Updates to These Terms",
        content: [
            "Zephyr Technology reserves the right to amend or update these Terms and Conditions at any time without prior notice.",
            "The latest version will be published on our website and will be effective immediately upon posting.",
        ],
    },
    {
        number: "32",
        id: "vat-scheme",
        title: "VAT Scheme Information",
        content: [
            "Certain products sold by Zephyr Technology may be supplied under the VAT Margin Scheme for second-hand goods in accordance with HMRC regulations unless otherwise stated.",
            "Where the VAT Margin Scheme applies, VAT is not separately reclaimable or itemised on customer invoices.",
            "Where products are sold with standard VAT treatment, this will be clearly stated where applicable.",
            "Zephyr Technology reserves the right to determine the applicable VAT treatment for products sold through the website or through direct business transactions.",
        ],
    },
];

const Terms = () => {
    return (
        <div className="bg-[#FBFDFF] min-h-screen">
            <section className="relative overflow-hidden border-b border-[#DDEEF3] bg-[linear-gradient(180deg,#EAF7FA_0%,#F7FCFD_42%,#FBFDFF_100%)]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-[#88EDFC]/15 blur-3xl" />
                    <div className="absolute -left-16 top-24 h-56 w-56 rounded-full bg-white/70 blur-3xl" />
                </div>

                <Container>
                    <div className="relative mx-auto flex max-w-4xl flex-col items-center px-2 py-16 text-center sm:py-20 lg:py-24">
                        <span className="inline-flex items-center rounded-full border border-[#D4EEF4] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#7F9CAC] backdrop-blur">
                            Legal
                        </span>

                        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#4E5A79] sm:text-5xl lg:text-6xl">
                            ZEPHYR TECHNOLOGY - TERMS & CONDITIONS
                        </h1>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#7F8897] sm:text-base">
                            ZEPHYR CORP LTD trading as Zephyr Technology
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-[#7F8897] sm:text-sm">
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE8EE] bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
                                <CalendarDays className="h-4 w-4 text-custom" />
                                Last Updated: May 20, 2024
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE8EE] bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
                                <FileText className="h-4 w-4 text-custom" />
                                Terms of service and use
                            </span>
                        </div>
                    </div>
                </Container>
            </section>

            <Container>
                <div className="grid gap-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:py-12">
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 rounded-2xl border border-[#E4EDF1] bg-white/80 p-5 shadow-[0_12px_30px_rgba(23,28,30,0.04)] backdrop-blur">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8A93A6]">
                                Contents
                            </p>

                            <nav className="mt-4 space-y-1.5">
                                {tableOfContents.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="group flex items-start gap-3 rounded-lg px-2 py-1.5 text-sm text-[#6F7A8F] transition-colors hover:bg-[#F6FAFB] hover:text-[#4E5A79]"
                                    >
                                        <span className="mt-0.5 min-w-[1.8rem] text-[11px] font-semibold tracking-[0.18em] text-[#9DA7B6] group-hover:text-custom">
                                            {item.number}
                                        </span>
                                        <span className="leading-5 font-medium">{item.title}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <main className="min-w-0">
                        <div className="space-y-6 lg:space-y-8">
                            {termsSections.map((section) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-24 rounded-2xl border border-[#ECF1F4] bg-white/80 p-6 shadow-[0_10px_30px_rgba(23,28,30,0.03)] backdrop-blur sm:p-7"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="pt-1 text-[11px] font-semibold tracking-[0.28em] text-[#B9C4D2]">
                                            {section.number}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-semibold tracking-tight text-[#4E5A79] sm:text-[1.8rem]">
                                                    {section.title}
                                                </h2>
                                                <span className="hidden h-px flex-1 bg-[#E6EEF2] sm:block" />
                                            </div>

                                            <div className="mt-5 space-y-4 text-sm leading-7 text-[#798495] sm:text-[15px]">
                                                {section.content?.map((paragraph, idx) => (
                                                    <p key={idx}>{paragraph}</p>
                                                ))}

                                                {section.subheading ? (
                                                    <p className="pt-2 font-semibold text-[#5D6879]">
                                                        {section.subheading}
                                                    </p>
                                                ) : null}

                                                {section.bullets ? (
                                                    <ul className="space-y-3 pt-1">
                                                        {section.bullets.map((bullet, idx) => (
                                                            <li key={idx} className="flex gap-3">
                                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-custom" />
                                                                <span>{bullet}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : null}

                                                {section.contact ? (
                                                    <div className="rounded-2xl border border-[#DCEAF0] bg-[#F4FAFC] p-5 sm:p-6">
                                                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                                            <div className="space-y-3">
                                                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8EA1B0]">
                                                                    ZEPHYR CORP LTD
                                                                </p>
                                                                <p>Trading as Zephyr Technology</p>
                                                                <p className="flex items-start gap-2">
                                                                    <MapPin className="mt-1 h-4 w-4 text-custom" />
                                                                    <span>
                                                                        The Porter Building
                                                                        <br />
                                                                        1 Brunel Way
                                                                        <br />
                                                                        Slough
                                                                        <br />
                                                                        England
                                                                        <br />
                                                                        SL1 1FQ
                                                                    </span>
                                                                </p>
                                                                <p className="text-[#4E5A79]">Email: support@zephyrtechnology.co.uk</p>
                                                                <p className="text-[#4E5A79]">Company Registration Number: 15640926</p>
                                                            </div>

                                                            <a
                                                                href="mailto:support@zephyrtechnology.co.uk"
                                                                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-custom shadow-sm transition-transform hover:-translate-y-0.5"
                                                            >
                                                                support@zephyrtechnology.co.uk
                                                                <ChevronRight className="h-4 w-4" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </main>
                </div>
            </Container>
        </div>
    );
};

export default Terms;