import React from 'react';

const AdminDashboardTitle = ({ title, subtitle }) => {
    return (
        <div className='mb-5'>
            <h1 className="text-[#050609] text-3xl lg:text-[35px] font-semibold">{title}</h1>
            <div>
                {subtitle && <p className="text-sm md:text-base text-[#464646]">{subtitle}</p>}
            </div>
        </div>
    );
};

export default AdminDashboardTitle;