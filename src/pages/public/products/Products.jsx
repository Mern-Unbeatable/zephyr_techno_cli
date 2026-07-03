// import { useState, useEffect } from "react";
// import Container from "../../../layout/Container";
// import ProductCard from "./components/ProductCard";
// import Filter from "./components/Filter";
// import Pagination from "./components/Pagination";
// import EmptyState from "./components/EmptyState";

// const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

// // ── Main Page ─────────────────────────────────────────────────────────────────
// export default function Products() {
//   // Filter states (now using IDs from API)
//   const [categoryId, setCategoryId] = useState(null);
//   const [seriesId, setSeriesId] = useState(null);
//   const [conditionId, setConditionId] = useState(null);
//   const [storageId, setStorageId] = useState(null);
//   const [ramId, setRamId] = useState(null);
//   const [colorId, setColorId] = useState(null);
//   const [priceMin, setPriceMin] = useState(0);
//   const [priceMax, setPriceMax] = useState(2000);
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit] = useState(24);
  
//   // UI states
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
  
//   // Attributes from API
//   const [attributes, setAttributes] = useState(null);
//   const [isLoadingAttributes, setIsLoadingAttributes] = useState(true);
  
//   // Products from API
//   const [products, setProducts] = useState([]);
//   const [isLoadingProducts, setIsLoadingProducts] = useState(true);
//   const [meta, setMeta] = useState({ total: 0, page: 1, limit: 24, totalPages: 0 });

//   const sortOptions = [
//     "All",
//     "Featured",
//     "Price: Low to High",
//     "Price: High to Low",
//     "Newest",
//   ];

//   // Map sort options to API values
//   const getSortByValue = (option) => {
//     switch (option) {
//       case "Price: Low to High":
//         return "priceAsc";
//       case "Price: High to Low":
//         return "priceDesc";
//       case "Featured":
//         return "featured";
//       default:
//         return "";
//     }
//   };

//   // Transform API product to match ProductCard expectations
//   const transformProduct = (apiProduct) => {
//     // Determine badge based on condition or featured status
//     let badge = apiProduct.condition?.name || "NEW";
//     let badgeColor = "bg-custom";
    
//     if (apiProduct.isFeatured) {
//       badge = "FEATURED";
//       badgeColor = "bg-[#FF6B6B]";
//     } else if (apiProduct.condition?.name === "Excellent") {
//       badge = "EXCELLENT";
//       badgeColor = "bg-[#1E293B]";
//     } else if (apiProduct.condition?.name === "Good") {
//       badge = "GOOD";
//       badgeColor = "bg-[#94A3B8]";
//     } else if (apiProduct.condition?.name === "New") {
//       badge = "NEW";
//       badgeColor = "bg-custom";
//     }

//     return {
//       id: apiProduct.id,
//       badge,
//       badgeColor,
//       name: apiProduct.title,
//       storage: apiProduct.series?.name || "",
//       color: apiProduct.category?.name || "",
//       price: parseFloat(apiProduct.basePrice),
//       oldPrice: null, // API doesn't provide old price
//       rating: 4.5, // API doesn't provide rating
//       reviews: 0, // API doesn't provide reviews
//       images: apiProduct.thumbnail ? [apiProduct.thumbnail] : [],
//     };
//   };

//   // Fetch filter attributes
//   useEffect(() => {
//     const fetchAttributes = async () => {
//       try {
//         setIsLoadingAttributes(true);
//         const response = await fetch(`${API_BASE_URL}/api/public/product/attributes`);
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch attributes');
//         }

//         const data = await response.json();
        
//         if (data.success && data.data) {
//           setAttributes(data.data);
//         }
//       } catch (error) {
//         console.error('Error fetching product attributes:', error);
//         // Attributes will remain null, Filter will use fallback constants
//       } finally {
//         setIsLoadingAttributes(false);
//       }
//     };

//     fetchAttributes();
//   }, []);

//   // Fetch products when filters change
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setIsLoadingProducts(true);
        
//         // Build query parameters
//         const params = new URLSearchParams();
        
//         // categoryId is the real UUID from categoryFilters (NEW or USED)
//         if (categoryId) params.append('categoryId', categoryId);
//         if (seriesId) params.append('seriesId', seriesId);
//         // conditionId is set for sub-conditions (Excellent, Good, Broken) or NEW's conditionId
//         if (conditionId) params.append('conditionId', conditionId);
//         if (colorId) params.append('colorId', colorId);
//         if (storageId) params.append('storageOptionId', storageId);
//         if (ramId) params.append('ramOptionId', ramId);
//         if (priceMin > 0) params.append('priceMin', priceMin);
//         if (priceMax < 2000) params.append('priceMax', priceMax);
//         if (search) params.append('search', search);
//         if (page) params.append('page', page);
//         if (limit) params.append('limit', limit);
        
//         const sortValue = getSortByValue(sortBy);
//         if (sortValue) params.append('sortBy', sortValue);
        
//         const response = await fetch(`${API_BASE_URL}/api/public/product?${params.toString()}`);
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch products');
//         }

//         const data = await response.json();
        
//         if (data.success && data.data) {
//           const transformedProducts = (data.data.items || []).map(transformProduct);
//           setProducts(transformedProducts);
//           setMeta(data.data.meta || { total: 0, page: 1, limit: 24, totalPages: 0 });
//         } else {
//           setProducts([]);
//           setMeta({ total: 0, page: 1, limit: 24, totalPages: 0 });
//         }
//       } catch (error) {
//         console.error('Error fetching products:', error);
//         setProducts([]);
//         setMeta({ total: 0, page: 1, limit: 24, totalPages: 0 });
//       } finally {
//         setIsLoadingProducts(false);
//       }
//     };

//     // Only fetch if attributes are loaded (or failed to load)
//     if (!isLoadingAttributes) {
//       fetchProducts();
//     }
//   }, [categoryId, seriesId, conditionId, colorId, storageId, ramId, priceMin, priceMax, search, page, limit, sortBy, isLoadingAttributes]);

//   const closeFilterPanel = () => setIsFilterOpen(false);

//   // Clear all filters
//   const clearAllFilters = () => {
//     setCategoryId(null);
//     setSeriesId(null);
//     setConditionId(null);
//     setStorageId(null);
//     setRamId(null);
//     setColorId(null);
//     setPriceMin(0);
//     setPriceMax(2000);
//     setSearch("");
//     setPage(1);
//   };

//   return (
//     <div className="min-h-screen">
//       <Container>
//         <div className="py-6 md:py-8 lg:py-10">
//           {/* ── Header ── */}
//           <div className="flex items-start sm:items-end justify-between mb-6 md:mb-8 lg:mb-10 flex-wrap gap-4">
//             <div>
//               <h1 className="title-custom ">
//                 Shop All Phones
//               </h1>
//               <p className="subtitle-custom mt-1">
//                 Explore our full collection of new and certified pre-owned
//                 devices.
//               </p>
//             </div>
//             <div className="w-full sm:w-auto mt-1">
//               <div className="lg:hidden space-y-2">
//                 <div className="grid grid-cols-2 gap-2">
//                   <button
//                     onClick={() => setIsFilterOpen(true)}
//                     className="inline-flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M3 4h18M6 12h12m-9 8h6"
//                       />
//                     </svg>
//                     Filter
//                   </button>
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
//                   >
//                     {sortOptions.map((o) => (
//                       <option key={o}>{o}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <span className="block text-xs text-[#64748B]">
//                   Showing{" "}
//                   <strong className="text-gray-700">{products.length}</strong> of{" "}
//                   <strong className="text-gray-700">{meta.total}</strong> products
//                 </span>
//               </div>

//               <div className="hidden lg:flex items-center gap-3">
//                 <span className="text-sm text-[#64748B]">
//                   Showing{" "}
//                   <strong className="text-gray-700">{products.length}</strong> of{" "}
//                   <strong className="text-gray-700">{meta.total}</strong> products
//                 </span>
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
//                 >
//                   {sortOptions.map((o) => (
//                     <option key={o}>{o}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div
//             className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
//               isFilterOpen
//                 ? "opacity-100 pointer-events-auto"
//                 : "opacity-0 pointer-events-none"
//             }`}
//           >
//             <button
//               type="button"
//               aria-label="Close filters"
//               onClick={closeFilterPanel}
//               className="absolute inset-0 bg-black/30"
//             />
//             <div
//               className={`relative z-10 h-full w-[85%] max-w-xs bg-white shadow-xl overflow-y-auto p-4 transform transition-transform duration-300 ease-out ${
//                 isFilterOpen ? "translate-x-0" : "-translate-x-full"
//               }`}
//             >
//               <div className="flex items-center justify-between mb-3">
//                 <h2 className="text-base font-semibold text-[#151A2A]">Filters</h2>
//                 <button
//                   onClick={closeFilterPanel}
//                   className="text-gray-500 hover:text-gray-700"
//                   aria-label="Close filter sidebar"
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               </div>
//               <Filter
//                 categoryId={categoryId}
//                 setCategoryId={setCategoryId}
//                 seriesId={seriesId}
//                 setSeriesId={setSeriesId}
//                 conditionId={conditionId}
//                 setConditionId={setConditionId}
//                 storageId={storageId}
//                 setStorageId={setStorageId}
//                 ramId={ramId}
//                 setRamId={setRamId}
//                 colorId={colorId}
//                 setColorId={setColorId}
//                 priceMin={priceMin}
//                 setPriceMin={setPriceMin}
//                 priceMax={priceMax}
//                 setPriceMax={setPriceMax}
//                 attributes={attributes}
//                 isLoadingAttributes={isLoadingAttributes}
//                 onClearAll={clearAllFilters}
//                 onApply={closeFilterPanel}
//               />
//             </div>
//           </div>

//           <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
//             {/* ── Filter ── */}
//             <div className="hidden lg:block">
//               <Filter
//                 categoryId={categoryId}
//                 setCategoryId={setCategoryId}
//                 seriesId={seriesId}
//                 setSeriesId={setSeriesId}
//                 conditionId={conditionId}
//                 setConditionId={setConditionId}
//                 storageId={storageId}
//                 setStorageId={setStorageId}
//                 ramId={ramId}
//                 setRamId={setRamId}
//                 colorId={colorId}
//                 setColorId={setColorId}
//                 priceMin={priceMin}
//                 setPriceMin={setPriceMin}
//                 priceMax={priceMax}
//                 setPriceMax={setPriceMax}
//                 attributes={attributes}
//                 isLoadingAttributes={isLoadingAttributes}
//                 onClearAll={clearAllFilters}
//               />
//             </div>

//             {/* ── Product Grid ── */}
//             <div className="flex-1">
//               {isLoadingProducts ? (
//                 <div className="flex items-center justify-center py-20">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom"></div>
//                 </div>
//               ) : products.length === 0 ? (
//                 <EmptyState />
//               ) : (
//                 <div className="grid grid-cols-1 min-[350px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4">
//                   {products.map((p) => (
//                     <ProductCard key={p.id} product={p} />
//                   ))}
//                 </div>
//               )}

//               {/* ── Pagination ── */}
//               {!isLoadingProducts && products.length > 0 && meta.totalPages > 1 && (
//                 <Pagination
//                   currentPage={meta.page}
//                   totalPages={meta.totalPages}
//                   onPageChange={setPage}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       </Container>
//     </div>
//   );
// }











import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import Container from "../../../layout/Container";
import ProductCard from "./components/ProductCard";
import Filter from "./components/Filter";
import Pagination from "./components/Pagination";
import EmptyState from "./components/EmptyState";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [categoryId, setCategoryId] = useState(null);
  const [seriesId, setSeriesId] = useState(null);
  const [conditionId, setConditionId] = useState(null);
  const [storageId, setStorageId] = useState(null);
  const [ramId, setRamId] = useState(null);
  const [colorId, setColorId] = useState(null);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(2000);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(24);

  // ── NEW: track which main filter key is selected (ALL / NEW / USED)
  const [selectedFilterKey, setSelectedFilterKey] = useState('ALL');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [attributes, setAttributes] = useState(null);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(true);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 24, totalPages: 0 });

  const sortOptions = ["All", "Featured", "Price: Low to High", "Price: High to Low", "Newest"];

  const getSortByValue = (option) => {
    switch (option) {
      case "Price: Low to High": return "priceAsc";
      case "Price: High to Low": return "priceDesc";
      case "Featured": return "featured";
      default: return "";
    }
  };

  const transformProduct = (apiProduct) => {
    let badge = apiProduct.condition?.name || "NEW";
    let badgeColor = "bg-custom";
    if (apiProduct.isFeatured) {
      badge = "FEATURED"; badgeColor = "bg-[#FF6B6B]";
    } else if (apiProduct.condition?.name === "Excellent") {
      badge = "EXCELLENT"; badgeColor = "bg-[#1E293B]";
    } else if (apiProduct.condition?.name === "Good") {
      badge = "GOOD"; badgeColor = "bg-[#94A3B8]";
    } else if (apiProduct.condition?.name === "New") {
      badge = "NEW"; badgeColor = "bg-custom";
    }
    return {
      id: apiProduct.id,
      badge,
      badgeColor,
      name: apiProduct.title,
      storage: apiProduct.series?.name || "",
      color: apiProduct.category?.name || "",
      price: parseFloat(apiProduct.basePrice),
      oldPrice: null,
      rating: 4.5,
      reviews: 0,
      images: apiProduct.thumbnail ? [apiProduct.thumbnail] : [],
      colorIds: apiProduct.colorIds || [],
      storageOptionIds: apiProduct.storageOptionIds || [],
      ramOptionIds: apiProduct.ramOptionIds || [],
    };
  };

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setIsLoadingAttributes(true);
        const response = await fetch(`${API_BASE_URL}/api/public/product/attributes`);
        if (!response.ok) throw new Error('Failed to fetch attributes');
        const data = await response.json();
        if (data.success && data.data) {
          setAttributes(data.data);
          // Apply filter from URL query param after attributes load
          const filterParam = searchParams.get('filter');
          if (filterParam === 'NEW') {
            const newFilter = (data.data.categoryFilters || []).find(c => c.key === 'NEW');
            if (newFilter) {
              setCategoryId(newFilter.categoryId);
              setConditionId(newFilter.conditionId || null);
              setSelectedFilterKey('NEW');
            }
          } else if (filterParam === 'USED') {
            const usedFilter = (data.data.categoryFilters || []).find(c => c.key === 'USED');
            if (usedFilter) {
              setCategoryId(usedFilter.categoryId);
              setConditionId(null);
              setSelectedFilterKey('USED');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product attributes:', error);
      } finally {
        setIsLoadingAttributes(false);
      }
    };
    fetchAttributes();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        if (seriesId) params.append('seriesId', seriesId);
        if (conditionId) params.append('conditionId', conditionId);
        if (colorId) params.append('colorId', colorId);
        if (storageId) params.append('storageOptionId', storageId);
        if (ramId) params.append('ramOptionId', ramId);
        if (priceMin > 0) params.append('priceMin', priceMin);
        if (priceMax < 2000) params.append('priceMax', priceMax);
        if (search) params.append('search', search);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        const sortValue = getSortByValue(sortBy);
        if (sortValue) params.append('sortBy', sortValue);

        const response = await fetch(`${API_BASE_URL}/api/public/product?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        if (data.success && data.data) {
          setProducts((data.data.items || []).map(transformProduct));
          setMeta(data.data.meta || { total: 0, page: 1, limit: 24, totalPages: 0 });
        } else {
          setProducts([]);
          setMeta({ total: 0, page: 1, limit: 24, totalPages: 0 });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setMeta({ total: 0, page: 1, limit: 24, totalPages: 0 });
      } finally {
        setIsLoadingProducts(false);
      }
    };
    if (!isLoadingAttributes) fetchProducts();
  }, [categoryId, seriesId, conditionId, colorId, storageId, ramId, priceMin, priceMax, search, page, limit, sortBy, isLoadingAttributes]);

  const closeFilterPanel = () => setIsFilterOpen(false);

  const clearAllFilters = () => {
    setCategoryId(null);
    setSeriesId(null);
    setConditionId(null);
    setStorageId(null);
    setRamId(null);
    setColorId(null);
    setPriceMin(0);
    setPriceMax(2000);
    setSearch("");
    setPage(1);
    setSelectedFilterKey('ALL'); // ── reset key
  };

  const filterProps = {
    categoryId, setCategoryId,
    seriesId, setSeriesId,
    conditionId, setConditionId,
    storageId, setStorageId,
    ramId, setRamId,
    colorId, setColorId,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    attributes,
    isLoadingAttributes,
    selectedFilterKey,       // ── pass down
    setSelectedFilterKey,    // ── pass down
    onClearAll: clearAllFilters,
  };

  return (
    <div className="min-h-screen">
      <Container>
        <div className="py-6 md:py-8 lg:py-10">
          <div className="flex items-start sm:items-end justify-between mb-6 md:mb-8 lg:mb-10 flex-wrap gap-4">
            <div>
              <h1 className="title-custom">Shop All Phones</h1>
              <p className="subtitle-custom mt-1">
                Explore our full collection of new and certified pre-owned devices.
              </p>
            </div>
            <div className="w-full sm:w-auto mt-1">
              <div className="lg:hidden space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="inline-flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12m-9 8h6" />
                    </svg>
                    Filter
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  >
                    {sortOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <span className="block text-xs text-[#64748B]">
                  Showing <strong className="text-gray-700">{products.length}</strong> of{" "}
                  <strong className="text-gray-700">{meta.total}</strong> products
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-3">
                <span className="text-sm text-[#64748B]">
                  Showing <strong className="text-gray-700">{products.length}</strong> of{" "}
                  <strong className="text-gray-700">{meta.total}</strong> products
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                >
                  {sortOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Mobile filter drawer */}
          <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
            <button type="button" aria-label="Close filters" onClick={closeFilterPanel} className="absolute inset-0 bg-black/30" />
            <div className={`relative z-10 h-full w-[85%] max-w-xs bg-white shadow-xl overflow-y-auto p-4 transform transition-transform duration-300 ease-out ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-[#151A2A]">Filters</h2>
                <button onClick={closeFilterPanel} className="text-gray-500 hover:text-gray-700" aria-label="Close filter sidebar">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Filter {...filterProps} onApply={closeFilterPanel} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="hidden lg:block">
              <Filter {...filterProps} />
            </div>
            <div className="flex-1">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom"></div>
                </div>
              ) : products.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 min-[350px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
              {!isLoadingProducts && products.length > 0 && meta.totalPages > 1 && (
                <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}