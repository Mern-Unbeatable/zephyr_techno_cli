import React, { useEffect, useState } from "react";
import Container from "../../../../../layout/Container";
import { Link } from "react-router-dom";
import Card from "./components/Card";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const Featured = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    let mounted = true;
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/product?sortBy=featured`);
        const payload = await res.json();
        if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to load featured products');
        const items = payload.data?.items || [];
        if (mounted) setData(items);
      } catch (err) {
        console.error('Failed to load featured products', err);
      }
    };
    fetchFeatured();
    return () => { mounted = false };
  }, []);

  return (
    <Container>
      <div className="py-10 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
          <div>
            <h1 className="title-custom">Featured Deals</h1>
            <p className="subtitle-custom mt-1">
              Our handpicked selection for this week.
            </p>
          </div>
          <div>
            <Link
              to="/products"
              className="text-sm hover:scale-95 cursor-pointer text-custom flex items-center justify-center"
            >
              View All Products →
            </Link>
          </div>
        </div>

        {/* cards */}
        <div className="mt-10 w-full grid grid-cols-1 min-[350px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {data?.map((item) => (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              tag={item.category?.name}
              badgeColor={item.isFeatured ? 'bg-cyan-500' : 'bg-gray-400'}
              variant={item.deviceModel?.name}
              price={item.basePrice}
              oldPrice={null}
              currency={'£'}
              rating={0}
              reviews={0}
              images={[item.thumbnail].filter(Boolean)}
            />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Featured;
