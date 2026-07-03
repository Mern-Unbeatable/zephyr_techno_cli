import React from 'react';

const Stats = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {stats.map((stat, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

export default Stats;