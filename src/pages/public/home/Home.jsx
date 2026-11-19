import React, { Suspense } from "react";
import Featured from "./sections/featured/Featured";
import Highlights from "./sections/highlights/Highlights";
import Hero from "./sections/Hero/Hero";
import Promotion from "../promotion/Promotion";
import Cta from "./sections/Cta/Cta";
import Review from "./sections/review/Review";
import Category from "../category/Category";
import SaleNotification from "../../../components/shared/SaleNotification";
import DocumentHead from "../../../seo/DocumentHead";
import { STATIC_SEO } from "../../../seo/staticPages";

const Home = () => {
  const seo = STATIC_SEO.home;
  return (
    <>
      <DocumentHead
        title={seo.title}
        description={seo.description}
        canonicalPath={seo.canonicalPath}
        imageAlt={seo.h1}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Zephyr Technology",
            url: "https://www.zephyrtechnology.co.uk/",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Zephyr Technology",
            url: "https://www.zephyrtechnology.co.uk/",
          },
        ]}
      />
      <SaleNotification />
      <section>
        <Hero />
        <Category />
        <Suspense fallback={<div>Loading...</div>}>
          <Featured />
        </Suspense>
      </section>
      <Promotion />
      <Highlights />
      <Review />
      <Cta />
    </>
  );
};

export default Home;
