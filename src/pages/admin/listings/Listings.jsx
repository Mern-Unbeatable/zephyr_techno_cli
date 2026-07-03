import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import AdminDashboardTitle from '../../../components/dashboards/AdminDashboardTitle';
import Tabs from './components/Tabs';
import Card from './components/Card';
import Pagination from './components/Pagination';
import { Link, useNavigate } from 'react-router';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const Listings = () => {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [tabs, setTabs] = useState(['All']);
    const [activeTab, setActiveTab] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Fetch all options (categories + conditions) on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/api/admin/attributes/all-options`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((r) => r.json())
            .then((payload) => {
                if (payload.success) {
                    const cats = payload.data.categories || [];
                    const conds = payload.data.conditions || [];
                    setCategories(cats);
                    setConditions(conds);
                    setTabs(['All', ...cats.filter(c => c.name !== 'Old').map(c => c.name), ...conds.map(c => c.name)]);
                }
            })
            .catch(() => {});
    }, []);

    const fetchListings = useCallback(async (page, tab) => {
        setLoading(true);
        try {
            let categoryId = '';
            let conditionId = '';
            
            if (tab !== 'All') {
                const category = categories.find(c => c.name === tab);
                const condition = conditions.find(c => c.name === tab);
                if (category) categoryId = category.id;
                if (condition) conditionId = condition.id;
            }

            const token = localStorage.getItem('token');
            const res = await fetch(
                `${API_BASE_URL}/api/admin/products?page=${page}&limit=6&categoryId=${categoryId}&conditionId=${conditionId}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }
            if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to load listings');
            
            setListings(payload.data.items || []);
            setTotalPages(payload.data.meta?.totalPages || 1);
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0891b2' });
        } finally {
            setLoading(false);
        }
    }, [categories, conditions]);

    useEffect(() => {
        if (categories.length > 0 || conditions.length > 0 || activeTab === 'All') {
            fetchListings(currentPage, activeTab);
        }
    }, [currentPage, activeTab, categories, conditions, fetchListings]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleFavorite = async (listing) => {
        try {
            const token = localStorage.getItem('token');
            const newFeaturedStatus = !listing.isFeatured;
            
            const res = await fetch(`${API_BASE_URL}/api/admin/products/${listing.id}/feature`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ isFeatured: newFeaturedStatus }),
            });
            
            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }
            if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to update featured status');
            
            // Update the listing in state
            setListings(prev => prev.map(l => 
                l.id === listing.id ? { ...l, isFeatured: newFeaturedStatus } : l
            ));
            
            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Product ${newFeaturedStatus ? 'featured' : 'unfeatured'} successfully.`,
                confirmButtonColor: '#0891b2',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0891b2' });
        }
    };

    const handleDelete = async (listing) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Delete this listing?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
        });
        if (!isConfirmed) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/products/${listing.id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }
            if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to delete listing');
            
            setListings(prev => prev.filter(l => l.id !== listing.id));
            await Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Listing deleted successfully.',
                confirmButtonColor: '#0891b2',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0891b2' });
        }
    };

    return (
        <div className="">
            {/* Header Row */}
            <div className="flex items-start justify-between">
                <AdminDashboardTitle
                    title="Phone Listings"
                    subtitle="Manage your inventory of new and used phones."
                />
                <Link to="/dashboard/admin/add-listing" className="btn-custom cursor-pointer text-white text-sm px-4 py-2 rounded transition whitespace-nowrap">
                    + Add New Listing
                </Link>
            </div>

            {/* Tabs */}
            <Tabs activeTab={activeTab} setActiveTab={handleTabChange} tabs={tabs} />

            {/* Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading...</div>
            ) : listings.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-sm text-gray-400">No listings found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {listings.map((listing) => {
                        const storageOpt = listing.availableStorageOptions?.[0]?.name || '';
                        const ramOpt = listing.availableRamOptions?.[0]?.name || '';
                        return (
                            <Card
                                key={listing.id}
                                image={listing.thumbnail || ''}
                                title={listing.title}
                                storage={storageOpt}
                                ram={ramOpt}
                                originalPrice={parseFloat(listing.basePrice) || 0}
                                discountedPrice={parseFloat(listing.basePrice) || 0}
                                stock={listing.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                                units={`${listing.stockQuantity} Units`}
                                badge={listing.condition?.name || listing.category?.name || ''}
                                onEdit={() => navigate(`/dashboard/admin/edit-listing/${listing.id}`)}
                                onDelete={() => handleDelete(listing)}
                                onFavorite={() => handleFavorite(listing)}
                                isFavorite={!!listing.isFeatured}
                            />
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default Listings;