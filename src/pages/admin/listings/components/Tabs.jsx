import React from 'react';

const Tabs = ({ activeTab, setActiveTab, tabs = ['All'] }) => {
    return (
        <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="p-1 md:p-0.5 border border-gray-200 rounded-lg inline-flex md:w-1/2 md:flex bg-[#f3f4f6] space-x-1.5 md:space-x-1.5">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            md:flex-1 text-center py-2.5 md:py-2 px-4 md:px-3.5 cursor-pointer
                            text-base md:text-sm 
                            rounded-lg transition-all duration-200 ease-in-out font-medium whitespace-nowrap
                            ${activeTab === tab 
                                ? 'bg-custom text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tabs;