// import React, { useState } from "react";
// import { CONDITIONS, SERIES_LIST, STORAGES, RAM_OPTIONS, COLORS_LIST } from "../constants";

// // ── Sidebar Filters ───────────────────────────────────────────────────────────
// function FilterSection({ title, children }) {
//   const [open, setOpen] = useState(true);
//   return (
//     <div className="border-b border-gray-100 pb-4 mb-4">
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="flex items-center justify-between w-full mb-3"
//       >
//         <span className="text-[14px] font-semibold tracking-widest uppercase text-[#151A2A]">
//           {title}
//         </span>
//         <svg
//           className={`w-4 h-4 text-gray-400 transition-transform ${open ? "" : "-rotate-90"}`}
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M5 15l7-7 7 7"
//           />
//         </svg>
//       </button>
//       {open && children}
//     </div>
//   );
// }

// const CustomRadio = ({ label, value, currentValue, onChange, isGroup }) => {
//   const selected = currentValue === value;
//   return (
//     <div 
//       className="flex items-center gap-2.5 cursor-pointer group m-0"
//       onClick={() => onChange(value)}
//     >
//       <div className={`w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 border-custom`}>
//         {selected && <div className="w-[8px] h-[8px] bg-custom rounded-full" />}
//       </div>
//       <span className={`${isGroup ? 'font-semibold text-[#151A2A] text-[11px] tracking-wider uppercase' : 'text-[14px] text-[#4A5565]'}`}>
//         {label}
//       </span>
//     </div>
//   );
// };

// const Filter = ({
//   categoryId,
//   setCategoryId,
//   seriesId,
//   setSeriesId,
//   conditionId,
//   setConditionId,
//   storageId,
//   setStorageId,
//   ramId,
//   setRamId,
//   colorId,
//   setColorId,
//   priceMin,
//   setPriceMin,
//   priceMax,
//   setPriceMax,
//   attributes,
//   isLoadingAttributes,
//   onClearAll,
//   onApply,
// }) => {
//   const [usedOpen, setUsedOpen] = useState(true);

//   const apply = () => {
//     if (onApply) onApply();
//   };

//   // Helper function to map color names to hex values
//   const getColorHex = (colorName) => {
//     const colorMap = {
//       'black': '#1a1a1a',
//       'midnight black': '#1a1a1a',
//       'white': '#f0ede8',
//       'starlight': '#f0ede8',
//       'yellow': '#f5d76e',
//       'blue': '#6ab0e8',
//       'blue titanium': '#4a6fa5',
//       'purple': '#6b3fa0',
//       'pink': '#e8b4b8',
//       'rose gold': '#e8b4b8',
//       'natural titanium': '#8b8681',
//       'gold': '#f9d77e',
//       'silver': '#e5e5e5',
//       'green': '#4a7c59',
//       'red': '#d32f2f',
//       'midnight': '#1a1a2e',
//     };
//     const normalized = colorName?.toLowerCase().trim() || '';
//     return colorMap[normalized] || '#000000';
//   };

//   // Extract data from new API structure
//   const categoryFilters = attributes?.categoryFilters || [];
//   const seriesList = attributes?.series || [];
//   const storageOptions = attributes?.storageOptions || [];
//   const ramOptions = attributes?.ramOptions || [];
//   const colorsList = attributes?.colors || [];

//   // Find filter types from categoryFilters
//   const allFilter = categoryFilters.find(c => c.key === "ALL");
//   const newFilter = categoryFilters.find(c => c.key === "NEW");
//   const usedFilter = categoryFilters.find(c => c.key === "USED");
//   const usedSubItems = usedFilter?.conditions || [];

//   return (
//     <div>
//       <aside className="w-full lg:w-52 lg:shrink-0">
//         <div className="flex items-center justify-between mb-5">
//           <h2 className="text-lg lg:text-xl font-semibold text-[#151A2A]">
//             Filters
//           </h2>
//           <button
//             onClick={() => {
//               if (onClearAll) onClearAll();
//               apply();
//             }}
//             className="text-xs text-custom hover:underline"
//           >
//             Clear All
//           </button>
//         </div>

//         {isLoadingAttributes && (
//           <div className="flex items-center justify-center py-8">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-custom"></div>
//           </div>
//         )}

//         {!isLoadingAttributes && (
//           <>

//         {/* Condition */}
//         {categoryFilters.length > 0 && (
//           <FilterSection title="Condition">
//             <div className="flex flex-col gap-3">
//               {allFilter && (
//                 <CustomRadio 
//                   label={allFilter.name} 
//                   value={null} 
//                   currentValue={categoryId} 
//                   onChange={() => { 
//                     setCategoryId(null); 
//                     setConditionId(null);
//                     apply(); 
//                   }} 
//                 />
//               )}
              
//               {newFilter && (
//                 <CustomRadio 
//                   label={newFilter.name} 
//                   value={newFilter.categoryId} 
//                   currentValue={categoryId} 
//                   onChange={(id) => { 
//                     setCategoryId(id);
//                     setConditionId(newFilter.conditionId || null);
//                     apply(); 
//                   }} 
//                 />
//               )}
              
//               {usedFilter && (
//                 <div>
//                   <div className="flex items-center justify-between w-full py-1 -my-1">
//                     <CustomRadio 
//                       label={usedFilter.name} 
//                       value={usedFilter.categoryId} 
//                       isGroup={true} 
//                       currentValue={categoryId} 
//                       onChange={(id) => { 
//                         setCategoryId(id);
//                         setConditionId(null);
//                         apply(); 
//                       }} 
//                     />
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setUsedOpen(!usedOpen);
//                       }}
//                       className="p-1 hover:bg-gray-50 rounded"
//                     >
//                       <svg
//                         className={`w-4 h-4 text-[#8A94A6] transition-transform ${usedOpen ? "" : "rotate-180"}`}
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth={1.5}
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
//                       </svg>
//                     </button>
//                   </div>
                  
//                   {usedOpen && usedSubItems.length > 0 && (
//                     <div className="flex flex-col gap-3 pl-7 mt-3">
//                       {usedSubItems.map((item) => (
//                         <CustomRadio 
//                           key={item.id} 
//                           label={item.name} 
//                           value={item.id} 
//                           currentValue={conditionId} 
//                           onChange={(id) => { 
//                             setCategoryId(usedFilter.categoryId);
//                             setConditionId(id); 
//                             apply(); 
//                           }} 
//                         />
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </FilterSection>
//         )}

//         {/* Series */}
//         {seriesList.length > 0 && (
//           <FilterSection title="Series">
//             <div className="flex flex-col gap-3">
//               <CustomRadio 
//                 label="All" 
//                 value={null} 
//                 currentValue={seriesId} 
//                 onChange={() => { setSeriesId(null); apply(); }} 
//               />
//               {seriesList.map((s) => (
//                 <CustomRadio 
//                   key={s.id} 
//                   label={s.name} 
//                   value={s.id} 
//                   currentValue={seriesId} 
//                   onChange={(id) => { setSeriesId(id); apply(); }} 
//                 />
//               ))}
//             </div>
//           </FilterSection>
//         )}

//         {/* Price Range */}
//         <FilterSection title="Price Range">
//           <input
//             type="range"
//             min={0}
//             max={2000}
//             step={50}
//             value={priceMax}
//             onChange={(e) => setPriceMax(Number(e.target.value))}
//             onMouseUp={apply}
//             onTouchEnd={apply}
//             className="products-price-range w-full"
//           />
//           <div className="flex justify-between mt-2 gap-2">
//             <div className="flex-1">
//               <p className="text-[14px] text-gray-400 mb-1">Min</p>
//               <input
//                 type="number"
//                 min={0}
//                 max={priceMax}
//                 value={priceMin}
//                 onChange={(e) => setPriceMin(Number(e.target.value))}
//                 onBlur={apply}
//                 className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[14px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-custom/20"
//                 placeholder="$0"
//               />
//             </div>
//             <div className="flex-1">
//               <p className="text-[14px] text-gray-400 mb-1">Max</p>
//               <input
//                 type="number"
//                 min={priceMin}
//                 max={2000}
//                 value={priceMax}
//                 onChange={(e) => setPriceMax(Number(e.target.value))}
//                 onBlur={apply}
//                 className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[14px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-custom/20"
//                 placeholder="$2000"
//               />
//             </div>
//           </div>
//         </FilterSection>

//         {/* Storage */}
//         {storageOptions.length > 0 && (
//           <FilterSection title="Storage">
//             <div className="grid grid-cols-2 gap-2">
//               {storageOptions.map((s) => (
//                 <button
//                   key={s.id}
//                   onClick={() => {
//                     setStorageId(storageId === s.id ? null : s.id);
//                     apply();
//                   }}
//                   className={`py-1.5 rounded-lg text-[14px] leading-5 font-medium border transition-all
//                         ${
//                           storageId === s.id
//                             ? "bg-custom border-custom text-white"
//                             : "bg-white border-gray-200 text-gray-600 hover:border-custom"
//                         }`}
//                 >
//                   {s.name}
//                 </button>
//               ))}
//             </div>
//           </FilterSection>
//         )}

//         {/* RAM */}
//         {ramOptions.length > 0 && (
//           <FilterSection title="RAM">
//             <div className="grid grid-cols-2 gap-2">
//               {ramOptions.map((r) => (
//                 <button
//                   key={r.id}
//                   onClick={() => {
//                     setRamId(ramId === r.id ? null : r.id);
//                     apply();
//                   }}
//                   className={`py-1.5 rounded-lg text-[14px] leading-5 font-medium border transition-all
//                         ${
//                           ramId === r.id
//                             ? "bg-custom border-custom text-white"
//                             : "bg-white border-gray-200 text-gray-600 hover:border-custom"
//                         }`}
//                 >
//                   {r.name}
//                 </button>
//               ))}
//             </div>
//           </FilterSection>
//         )}

//         {/* Color */}
//         {colorsList.length > 0 && (
//           <FilterSection title="Color">
//             <div className="flex flex-wrap gap-2">
//               {colorsList.map((c) => {
//                 const hex = getColorHex(c.name);
//                 return (
//                   <button
//                     key={c.id}
//                     title={c.name}
//                     onClick={() => {
//                       setColorId(colorId === c.id ? null : c.id);
//                       apply();
//                     }}
//                     className={`w-6 h-6 rounded-full border-2 transition-all
//                           ${colorId === c.id ? "border-custom scale-110" : "border-transparent hover:scale-105"}`}
//                     style={{
//                       backgroundColor: hex,
//                       boxShadow: hex === "#f0ede8" ? "inset 0 0 0 1px #e5e7eb" : "none",
//                     }}
//                   />
//                 );
//               })}
//             </div>
//           </FilterSection>
//         )}
//         </>
//         )}
//       </aside>
//     </div>
//   );
// };

// export default Filter;








import React, { useState } from "react";
import { getColorHex, isLightColor } from "../../../../utils/color";

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full mb-3">
        <span className="text-[14px] font-semibold tracking-widest uppercase text-[#151A2A]">{title}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      {open && children}
    </div>
  );
}

const CustomRadio = ({ label, value, currentValue, onChange, isGroup }) => {
  const selected = currentValue === value;
  return (
    <div className="flex items-center gap-2.5 cursor-pointer group m-0" onClick={() => onChange(value)}>
      <div className="w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 border-custom">
        {selected && <div className="w-[8px] h-[8px] bg-custom rounded-full" />}
      </div>
      <span className={`${isGroup ? 'font-semibold text-[#151A2A] text-[11px] tracking-wider uppercase' : 'text-[14px] text-[#4A5565]'}`}>
        {label}
      </span>
    </div>
  );
};

const Filter = ({
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
  selectedFilterKey,       // ── 'ALL' | 'NEW' | 'USED'
  setSelectedFilterKey,    // ── setter
  onClearAll,
  onApply,
}) => {
  const [usedOpen, setUsedOpen] = useState(true);

  const apply = () => { if (onApply) onApply(); };

  const categoryFilters = attributes?.categoryFilters || [];
  const seriesList = attributes?.series || [];
  const storageOptions = attributes?.storageOptions || [];
  const ramOptions = attributes?.ramOptions || [];
  const colorsList = attributes?.colors || [];

  const allFilter = categoryFilters.find(c => c.key === "ALL");
  const newFilter = categoryFilters.find(c => c.key === "NEW");
  const usedFilter = categoryFilters.find(c => c.key === "USED");
  const usedSubItems = usedFilter?.conditions || [];

  return (
    <div>
      <aside className="w-full lg:w-52 lg:shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg lg:text-xl font-semibold text-[#151A2A]">Filters</h2>
          <button onClick={() => { if (onClearAll) onClearAll(); apply(); }} className="text-xs text-custom hover:underline">
            Clear All
          </button>
        </div>

        {isLoadingAttributes && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-custom"></div>
          </div>
        )}

        {!isLoadingAttributes && (
          <>
            {/* Condition */}
            {categoryFilters.length > 0 && (
              <FilterSection title="Condition">
                <div className="flex flex-col gap-3">

                  {/* ALL */}
                  {allFilter && (
                    <CustomRadio
                      label={allFilter.name}
                      value="ALL"
                      currentValue={selectedFilterKey}
                      onChange={() => {
                        setSelectedFilterKey('ALL');
                        setCategoryId(null);
                        setConditionId(null);
                        apply();
                      }}
                    />
                  )}

                  {/* NEW */}
                  {newFilter && (
                    <CustomRadio
                      label={newFilter.name}
                      value="NEW"
                      currentValue={selectedFilterKey}
                      onChange={() => {
                        setSelectedFilterKey('NEW');
                        setCategoryId(newFilter.categoryId || null);
                        setConditionId(newFilter.conditionId || null);
                        apply();
                      }}
                    />
                  )}

                  {/* USED */}
                  {usedFilter && (
                    <div>
                      <div className="flex items-center justify-between w-full py-1 -my-1">
                        <CustomRadio
                          label={usedFilter.name}
                          value="USED"
                          isGroup={true}
                          currentValue={selectedFilterKey}
                          onChange={() => {
                            setSelectedFilterKey('USED');
                            setCategoryId(usedFilter.categoryId || null);
                            setConditionId(null);
                            apply();
                          }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); setUsedOpen(!usedOpen); }}
                          className="p-1 hover:bg-gray-50 rounded"
                        >
                          <svg className={`w-4 h-4 text-[#8A94A6] transition-transform ${usedOpen ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* USED sub-conditions */}
                      {usedOpen && usedSubItems.length > 0 && (
                        <div className="flex flex-col gap-3 pl-7 mt-3">
                          {usedSubItems.map((item) => (
                            <CustomRadio
                              key={item.id}
                              label={item.name}
                              value={item.id}
                              currentValue={conditionId}
                              onChange={(id) => {
                                setSelectedFilterKey('USED');
                                setCategoryId(usedFilter.categoryId || null);
                                setConditionId(id);
                                apply();
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FilterSection>
            )}

            {/* Series */}
            {seriesList.length > 0 && (
              <FilterSection title="Series">
                <div className="flex flex-col gap-3">
                  <CustomRadio label="All" value={null} currentValue={seriesId} onChange={() => { setSeriesId(null); apply(); }} />
                  {seriesList.map((s) => (
                    <CustomRadio key={s.id} label={s.name} value={s.id} currentValue={seriesId} onChange={(id) => { setSeriesId(id); apply(); }} />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Price Range */}
            <FilterSection title="Price Range">
              <input type="range" min={0} max={2000} step={50} value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                onMouseUp={apply} onTouchEnd={apply}
                className="products-price-range w-full"
              />
              <div className="flex justify-between mt-2 gap-2">
                <div className="flex-1">
                  <p className="text-[14px] text-gray-400 mb-1">Min</p>
                  <input type="number" min={0} max={priceMax} value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))} onBlur={apply}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[14px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-custom/20"
                    placeholder="$0"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] text-gray-400 mb-1">Max</p>
                  <input type="number" min={priceMin} max={2000} value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))} onBlur={apply}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[14px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-custom/20"
                    placeholder="$2000"
                  />
                </div>
              </div>
            </FilterSection>

            {/* Storage */}
            {storageOptions.length > 0 && (
              <FilterSection title="Storage">
                <div className="grid grid-cols-2 gap-2">
                  {storageOptions.map((s) => (
                    <button key={s.id} onClick={() => { setStorageId(storageId === s.id ? null : s.id); apply(); }}
                      className={`py-1.5 rounded-lg text-[14px] leading-5 font-medium border transition-all ${storageId === s.id ? "bg-custom border-custom text-white" : "bg-white border-gray-200 text-gray-600 hover:border-custom"}`}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* RAM */}
            {ramOptions.length > 0 && (
              <FilterSection title="RAM">
                <div className="grid grid-cols-2 gap-2">
                  {ramOptions.map((r) => (
                    <button key={r.id} onClick={() => { setRamId(ramId === r.id ? null : r.id); apply(); }}
                      className={`py-1.5 rounded-lg text-[14px] leading-5 font-medium border transition-all ${ramId === r.id ? "bg-custom border-custom text-white" : "bg-white border-gray-200 text-gray-600 hover:border-custom"}`}>
                      {r.name}
                    </button>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Color */}
            {colorsList.length > 0 && (
              <FilterSection title="Color">
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((c) => {
                    const hex = getColorHex(c.name, c.hexCode);
                    return (
                      <button key={c.id} title={c.name} onClick={() => { setColorId(colorId === c.id ? null : c.id); apply(); }}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${colorId === c.id ? "border-custom scale-110" : "border-transparent hover:scale-105"} ${isLightColor(hex) ? "border-gray-300" : ""}`}
                        style={{
                          backgroundColor: hex,
                          boxShadow: isLightColor(hex) ? "inset 0 0 0 1px #e5e7eb" : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </FilterSection>
            )}
          </>
        )}
      </aside>
    </div>
  );
};

export default Filter;