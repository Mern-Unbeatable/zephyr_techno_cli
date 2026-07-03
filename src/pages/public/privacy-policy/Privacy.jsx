import React from "react";
import Container from "../../../layout/Container";
import { CalendarDays, ChevronRight, MapPin, ShieldCheck } from "lucide-react";

const tableOfContents = [
    { number: "01", id: "introduction", title: "Introduction" },
    { number: "02", id: "information-we-collect", title: "Information We Collect" },
    { number: "03", id: "how-we-use-your-information", title: "How We Use Your Information" },
    { number: "04", id: "lawful-basis-for-processing", title: "Lawful Basis for Processing" },
    { number: "05", id: "payment-security", title: "Payment Security" },
    { number: "06", id: "data-security", title: "Data Security" },
    { number: "07", id: "cookies-and-analytics", title: "Cookies and Analytics" },
    { number: "08", id: "third-party-services", title: "Third-Party Services" },
    { number: "09", id: "fraud-prevention-and-legal-sharing", title: "Fraud Prevention and Legal Sharing" },
    { number: "10", id: "customer-rights", title: "Customer Rights" },
    { number: "11", id: "data-retention", title: "Data Retention" },
    { number: "12", id: "marketing-communications", title: "Marketing Communications" },
    { number: "13", id: "childrens-privacy", title: "Children’s Privacy" },
    { number: "14", id: "international-transfers", title: "International Transfers" },
    { number: "15", id: "changes-to-this-policy", title: "Changes to This Policy" },
    { number: "16", id: "contact-information", title: "Contact Information" },
];

const policySections = [
    {
        number: "01",
        id: "introduction",
        title: "Introduction",
        content: [
            "ZEPHYR CORP LTD trading as Zephyr Technology respects your privacy and is committed to protecting your personal information.",
            "This Privacy Policy explains how we collect, use, store, share, and protect customer information when using our website, products, trade-in services, customer support channels, and related services.",
        ],
    },
    {
        number: "02",
        id: "information-we-collect",
        title: "Information We Collect",
        content: [
            "We may collect personal information when you place an order, sell a device to us, contact customer support, use our website, create an account, sign up for updates, or interact with our services.",
        ],
        bullets: [
            "Full name",
            "Billing address",
            "Delivery address",
            "Email address",
            "Phone number",
            "Payment information",
            "Device information",
            "IMEI numbers and serial numbers",
            "Trade-in details",
            "Order history",
            "IP address",
            "Website usage information",
            "Communication history",
            "Fraud prevention and verification information",
        ],
    },
    {
        number: "03",
        id: "how-we-use-your-information",
        title: "How We Use Your Information",
        content: [
            "Customer information may be used to operate our business, provide services, protect customers, and prevent fraud.",
            "We do not sell customer personal information to third parties.",
        ],
        bullets: [
            "Process orders and payments",
            "Arrange deliveries and returns",
            "Provide customer support",
            "Process trade-ins",
            "Verify device information",
            "Prevent fraud and chargeback abuse",
            "Improve website performance",
            "Respond to enquiries",
            "Contact customers regarding orders, services, updates, or support issues",
            "Comply with legal, accounting, and regulatory obligations",
        ],
    },
    {
        number: "04",
        id: "lawful-basis-for-processing",
        title: "Lawful Basis for Processing",
        content: [
            "We process personal information where necessary to perform a contract, comply with legal obligations, protect legitimate business interests, prevent fraud, provide customer service, and where consent has been provided for optional marketing communications.",
        ],
    },
    {
        number: "05",
        id: "payment-security",
        title: "Payment Security",
        content: [
            "Payments are processed securely using trusted third-party payment providers.",
            "Zephyr Technology does not store full payment card information on our servers.",
            "Payment providers may process information according to their own terms and privacy policies.",
        ],
    },
    {
        number: "06",
        id: "data-security",
        title: "Data Security",
        content: [
            "We take reasonable technical and organisational measures to protect customer information from unauthorised access, loss, misuse, disclosure, alteration, and destruction.",
            "However, no online platform or method of electronic storage can guarantee complete security.",
        ],
    },
    {
        number: "07",
        id: "cookies-and-analytics",
        title: "Cookies and Analytics",
        content: [
            "Our website may use cookies, pixels, analytics tools, and similar technologies to improve user experience, website functionality, performance, security, marketing, and advertising.",
            "Customers may manage cookie preferences through their browser settings or any cookie tools provided on our website where applicable.",
        ],
    },
    {
        number: "08",
        id: "third-party-services",
        title: "Third-Party Services",
        content: [
            "We may use third-party providers for payment processing, delivery tracking, analytics, email communication, marketing tools, fraud prevention, hosting, website management, and customer service systems.",
            "These providers process information in accordance with their own privacy policies and contractual obligations.",
        ],
    },
    {
        number: "09",
        id: "fraud-prevention-and-legal-sharing",
        title: "Fraud Prevention and Legal Sharing",
        content: [
            "We may share relevant information with payment providers, banks, courier companies, fraud prevention agencies, legal advisers, regulators, law enforcement, Action Fraud, or other relevant authorities where necessary to prevent fraud, investigate claims, protect our business, comply with legal duties, or enforce our terms.",
        ],
    },
    {
        number: "10",
        id: "customer-rights",
        title: "Customer Rights",
        content: [
            "Customers may have the right to request access to personal information, correction of inaccurate information, deletion where legally permitted, restriction of processing, objection to processing, and withdrawal of marketing consent.",
            "Requests may be submitted using the contact details in this Privacy Policy. We may need to verify identity before completing certain requests.",
        ],
    },
    {
        number: "11",
        id: "data-retention",
        title: "Data Retention",
        content: [
            "We retain customer information only for as long as necessary for order fulfilment, legal obligations, accounting records, fraud prevention, customer support, dispute resolution, warranty support, trade-in records, and business administration.",
            "Retention periods may vary depending on the type of information and the purpose for which it is held.",
        ],
    },
    {
        number: "12",
        id: "marketing-communications",
        title: "Marketing Communications",
        content: [
            "Customers may receive marketing communications where consent has been provided or where permitted by law.",
            "Customers can unsubscribe from marketing communications at any time using the unsubscribe option or by contacting us.",
        ],
    },
    {
        number: "13",
        id: "childrens-privacy",
        title: "Children’s Privacy",
        content: [
            "Our services are not intentionally directed at children, and we do not knowingly collect personal information from children without appropriate permission where required.",
        ],
    },
    {
        number: "14",
        id: "international-transfers",
        title: "International Transfers",
        content: [
            "Some third-party service providers may process information outside the United Kingdom.",
            "Where this occurs, we aim to ensure appropriate safeguards are in place where required by law.",
        ],
    },
    {
        number: "15",
        id: "changes-to-this-policy",
        title: "Changes to This Policy",
        content: [
            "Zephyr Technology reserves the right to update this Privacy Policy at any time without prior notice.",
            "The latest version will be published on our website.",
        ],
    },
    {
        number: "16",
        id: "contact-information",
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
            "For privacy-related enquiries, data requests, customer support, complaints, or formal correspondence, customers may contact us using the above details.",
            "Company Registration Number: 15640926",
        ],
        contact: true,
    },
];

const Privacy = () => {
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
                            ZEPHYR TECHNOLOGY - PRIVACY POLICY
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
                                <ShieldCheck className="h-4 w-4 text-custom" />
                                Data protection and transparency
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
                            {policySections.map((section) => (
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
                                                {section.content?.map((paragraph) => (
                                                    <p key={paragraph}>{paragraph}</p>
                                                ))}

                                                {section.quote ? (
                                                    <blockquote className="border-l-4 border-custom bg-[#F6FBFC] px-5 py-4 text-[#5D6879]">
                                                        <p className="text-[15px] leading-7">“{section.quote}”</p>
                                                    </blockquote>
                                                ) : null}

                                                {section.bullets ? (
                                                    <ul className="space-y-3 pt-1">
                                                        {section.bullets.map((bullet) => (
                                                            <li key={bullet} className="flex gap-3">
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

export default Privacy;