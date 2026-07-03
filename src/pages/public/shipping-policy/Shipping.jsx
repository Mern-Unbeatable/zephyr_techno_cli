import React from "react";
import Container from "../../../layout/Container";
import { CalendarDays, ChevronRight, MapPin, Truck } from "lucide-react";

const tableOfContents = [
    { number: "01", id: "processing-dispatch", title: "Processing & Dispatch" },
    { number: "02", id: "delivery-timeframes", title: "Delivery Timeframes" },
    { number: "03", id: "shipping-methods", title: "Shipping Methods" },
    { number: "04", id: "tracking", title: "Tracking" },
    { number: "05", id: "high-value-orders", title: "High-Value Orders" },
    { number: "06", id: "delivery-responsibility", title: "Delivery Responsibility" },
    { number: "07", id: "lost-delayed", title: "Lost or Delayed Deliveries" },
    { number: "08", id: "damaged-parcels", title: "Damaged Parcels" },
    { number: "09", id: "failed-deliveries", title: "Failed Deliveries & Returned Parcels" },
    { number: "10", id: "contact", title: "Contact Information" },
];

const shippingSections = [
    {
        number: "01",
        id: "processing-dispatch",
        title: "Processing & Dispatch",
        content: [
            "Orders are typically processed within 1 working day after payment confirmation and order checks have been completed.",
        ],
    },
    {
        number: "02",
        id: "delivery-timeframes",
        title: "Delivery Timeframes",
        content: [
            "Most orders are delivered within 1–2 working days from dispatch depending on the delivery service selected and stock availability.",
        ],
        subheading: "Please note:",
        bullets: [
            "Delivery estimates are not guaranteed",
            "Delivery times may vary during busy periods, bank holidays, severe weather, courier disruption, or events outside of our control",
            "Orders placed outside business hours may be processed the next working day",
        ],
    },
    {
        number: "03",
        id: "shipping-methods",
        title: "Shipping Methods",
        content: [
            "Orders may be shipped using trusted tracked courier services including Royal Mail, DPD, UPS, or equivalent providers depending on the order value, destination, and service availability.",
        ],
    },
    {
        number: "04",
        id: "tracking",
        title: "Tracking",
        content: [
            "Tracking details will be provided where applicable once your order has been dispatched.",
        ],
    },
    {
        number: "05",
        id: "high-value-orders",
        title: "High-Value Orders",
        content: [
            "For security purposes, high-value orders may require:",
        ],
        bullets: [
            "Signature upon delivery",
        ],
    },
    {
        number: "06",
        id: "delivery-responsibility",
        title: "Delivery Responsibility",
        content: [
            "Customers are responsible for ensuring all delivery information entered at checkout is accurate and complete.",
            "Where tracking confirms delivery to the address supplied by the customer, responsibility for the parcel transfers to the customer.",
        ],
    },
    {
        number: "07",
        id: "lost-delayed",
        title: "Lost or Delayed Deliveries",
        content: [
            "If your parcel appears delayed or missing, please contact us as soon as possible and we will do our best to assist and investigate with the courier.",
            "Customers may be required to cooperate with courier investigations where necessary.",
        ],
    },
    {
        number: "08",
        id: "damaged-parcels",
        title: "Damaged Parcels",
        content: [
            "Customers should report parcels showing signs of damage, tampering, or delivery issues as soon as possible following delivery.",
        ],
    },
    {
        number: "09",
        id: "failed-deliveries",
        title: "Failed Deliveries & Returned Parcels",
        content: [
            "Where parcels are refused, unclaimed, or returned due to incorrect customer information, Zephyr Technology reserves the right to deduct applicable shipping and handling costs from any refund where permitted by law.",
        ],
    },
    {
        number: "10",
        id: "contact",
        title: "Contact Information",
        content: [
            "For any shipping-related enquiries, please contact us using the details below.",
        ],
        contact: true,
    },
];

const Shipping = () => {
    return (
        <div className="bg-[#FBFDFF] min-h-screen">
            {/* Hero */}
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
                            ZEPHYR TECHNOLOGY - SHIPPING POLICY
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
                                <Truck className="h-4 w-4 text-custom" />
                                Delivery and dispatch information
                            </span>
                        </div>
                    </div>
                </Container>
            </section>

            <Container>
                <div className="grid gap-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:py-12">
                    {/* Sticky sidebar */}
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

                    {/* Main content */}
                    <main className="min-w-0">
                        <div className="space-y-6 lg:space-y-8">
                            {shippingSections.map((section) => (
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

export default Shipping;
