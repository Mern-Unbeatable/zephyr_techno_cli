import React, { useEffect, useState } from 'react';
import { User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const buildProfileFromResponse = (user = {}) => {
    const address = user.userAddresses?.[0] || {};

    return {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        region: address.state || '',
        city: address.city || '',
        zip: address.zipCode || '',
        address: address.street || '',
        country: address.country || '',
    };
};

const Account = () => {
    const { token, user: authUser, updateUser } = useAuth();
    const [profile, setProfile] = useState(buildProfileFromResponse(authUser || {}));
    const [passwords, setPasswords] = useState({
        current: '',
        newPass: '',
        confirm: '',
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        const fetchProfile = async () => {
            setLoading(true);
            setError('');

            try {
                const authToken = token || localStorage.getItem('token') || localStorage.getItem('accessToken');

                const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    signal: controller.signal,
                });

                let payload = {};
                try {
                    payload = await response.json();
                } catch {
                    payload = {};
                }

                if (!response.ok) {
                    throw new Error(payload.message || payload.error || 'Failed to load profile');
                }

                setProfile(buildProfileFromResponse(payload.data || {}));
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Failed to load profile');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        return () => controller.abort();
    }, [token]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
        setSuccess('');
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
        setSuccess('');
    };

    const saveProfile = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        try {
            const authToken = token || localStorage.getItem('token') || localStorage.getItem('accessToken');

            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
                body: JSON.stringify({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phone: profile.phone,
                    addresses: [
                        {
                            street: profile.address,
                            city: profile.city,
                            state: profile.region,
                            zipCode: profile.zip,
                            country: profile.country || 'US',
                        },
                    ],
                }),
            });

            let payload = {};
            try {
                payload = await response.json();
            } catch {
                payload = {};
            }

            if (!response.ok) {
                throw new Error(payload.message || payload.error || 'Failed to update profile');
            }

            const updatedUser = payload.data || {
                ...authUser,
                ...profile,
                userAddresses: [
                    {
                        street: profile.address,
                        city: profile.city,
                        state: profile.region,
                        zipCode: profile.zip,
                        country: profile.country || 'US',
                    },
                ],
            };

            updateUser(updatedUser);

            await Swal.fire({
                icon: 'success',
                title: 'Profile updated',
                text: payload.message || 'Your profile has been saved successfully.',
                confirmButtonColor: '#2E395B',
            });

            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwords.newPass !== passwords.confirm) {
            setError('New password and confirm password do not match');
            return;
        }

        try {
            const authToken = token || localStorage.getItem('token') || localStorage.getItem('accessToken');

            const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.newPass,
                }),
            });

            let payload = {};
            try {
                payload = await response.json();
            } catch {
                payload = {};
            }

            if (!response.ok) {
                throw new Error(payload.message || payload.error || 'Failed to change password');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Password changed',
                text: payload.message || 'Your password has been updated successfully.',
                confirmButtonColor: '#2E395B',
            });

            setSuccess('Password changed successfully.');
            setPasswords({ current: '', newPass: '', confirm: '' });
        } catch (err) {
            setError(err.message || 'Failed to change password');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <section className="rounded border border-gray-200 bg-white p-4 sm:p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">ACCOUNT SETTING</h3>

                {loading ? (
                    <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                        Loading profile...
                    </div>
                ) : null}

                {error ? (
                    <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
                ) : null}

                {success ? (
                    <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">{success}</p>
                ) : null}

                {!loading ? (
                    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                        <div className="shrink-0 self-center lg:self-start">
                            <div className="relative w-24 sm:w-28">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 shadow-sm sm:h-28 sm:w-28">
                                    <User className="h-11 w-11 sm:h-12 sm:w-12" strokeWidth={2} />
                                </div>
                            </div>
                        </div>

                        <form onSubmit={saveProfile} className="flex-1">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">First name</label>
                                    <input
                                        name="firstName"
                                        value={profile.firstName}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your first name"
                                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Last name</label>
                                    <input
                                        name="lastName"
                                        value={profile.lastName}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your last name"
                                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                                    <input
                                        name="email"
                                        value={profile.email}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your email address"
                                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Phone Number</label>
                                    <input
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your phone number"
                                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Region/State</label>
                                    <input
                                        name="region"
                                        value={profile.region}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your state or region"
                                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">City</label>
                                    <input
                                        name="city"
                                        value={profile.city}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your city"
                                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Address</label>
                                    <input
                                        name="address"
                                        value={profile.address}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your street address"
                                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Zip Code</label>
                                    <input
                                        name="zip"
                                        value={profile.zip}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your zip code"
                                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Country</label>
                                    <input
                                        name="country"
                                        value={profile.country}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your country"
                                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <button className="hover:scale-105 duration-300 cursor-pointer rounded bg-custom px-4 py-2 text-sm font-medium text-white">
                                    SAVE CHANGES
                                </button>
                            </div>
                        </form>
                    </div>
                ) : null}
            </section>

            <section className="rounded border border-gray-200 bg-white p-4 sm:p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">CHANGE PASSWORD</h3>
                <form onSubmit={changePassword} className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Current Password</label>
                        <div className="relative">
                            <input
                                name="current"
                                type={showCurrent ? 'text' : 'password'}
                                value={passwords.current}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                                className="w-full rounded border border-gray-200 px-3 py-2 text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                            >
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">New Password</label>
                        <div className="relative">
                            <input
                                name="newPass"
                                type={showNew ? 'text' : 'password'}
                                value={passwords.newPass}
                                onChange={handlePasswordChange}
                                className="w-full rounded border border-gray-200 px-3 py-2 text-sm pr-10"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label={showNew ? 'Hide new password' : 'Show new password'}
                            >
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Confirm Password</label>
                        <div className="relative">
                            <input
                                name="confirm"
                                type={showConfirm ? 'text' : 'password'}
                                value={passwords.confirm}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                                className="w-full rounded border border-gray-200 px-3 py-2 text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button className="mt-2 hover:scale-105 duration-300 cursor-pointer rounded bg-custom px-4 py-2 text-sm font-medium text-white">
                            CHANGE PASSWORD
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default Account;
