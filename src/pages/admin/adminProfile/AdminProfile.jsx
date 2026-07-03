import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FormField, TextInput } from '../../../components/shared/form';
import ProfileHeader from './components/ProfileHeader';
import AdminDashboardTitle from '../../../components/dashboards/AdminDashboardTitle';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const AdminProfile = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [profileMeta, setProfileMeta] = useState({
        phone: null,
        addresses: [],
    });

    useEffect(() => {
        const controller = new AbortController();

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

                const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

                const user = payload?.data || {};
                const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

                setFormData((prev) => ({
                    ...prev,
                    fullName,
                    email: user.email || '',
                }));
                setProfileMeta({
                    phone: user.phone || null,
                    addresses: Array.isArray(user.userAddresses) ? user.userAddresses : [],
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    // Keep the existing UI stable if the profile cannot be loaded.
                }
            }
        };

        fetchProfile();

        return () => controller.abort();
    }, []);

    const updateField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const [firstName = '', ...rest] = String(formData.fullName || '').trim().split(/\s+/);
        const lastName = rest.join(' ');
        const wantsPasswordChange = Boolean(formData.currentPassword || formData.newPassword || formData.confirmPassword);

        if (wantsPasswordChange && !formData.currentPassword) {
            await Swal.fire({
                icon: 'error',
                title: 'Current password required',
                text: 'Please enter your current password to change it.',
                confirmButtonColor: '#2E395B',
            });
            return;
        }

        if (wantsPasswordChange && formData.newPassword !== formData.confirmPassword) {
            await Swal.fire({
                icon: 'error',
                title: 'Passwords do not match',
                text: 'Please make sure the new password and confirmation are the same.',
                confirmButtonColor: '#2E395B',
            });
            return;
        }

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phone: profileMeta.phone,
                    addresses: profileMeta.addresses,
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

            const updatedUser = payload?.data || {};
            const updatedFullName = [updatedUser.firstName || firstName, updatedUser.lastName || lastName].filter(Boolean).join(' ').trim();

            setFormData((prev) => ({
                ...prev,
                fullName: updatedFullName,
                email: updatedUser.email || prev.email,
            }));
            setProfileMeta((prev) => ({
                ...prev,
                phone: updatedUser.phone ?? prev.phone,
                addresses: Array.isArray(updatedUser.userAddresses) ? updatedUser.userAddresses : prev.addresses,
            }));

            if (wantsPasswordChange) {
                const passwordResponse = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        currentPassword: formData.currentPassword,
                        newPassword: formData.newPassword,
                    }),
                });

                let passwordPayload = {};
                try {
                    passwordPayload = await passwordResponse.json();
                } catch {
                    passwordPayload = {};
                }

                if (!passwordResponse.ok) {
                    throw new Error(passwordPayload.message || passwordPayload.error || 'Failed to change password');
                }

                setFormData((prev) => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));

                await Swal.fire({
                    icon: 'success',
                    title: 'Profile updated',
                    text: passwordPayload.message || 'Your profile and password have been updated successfully.',
                    confirmButtonColor: '#2E395B',
                });
                return;
            }

            await Swal.fire({
                icon: 'success',
                title: 'Profile updated',
                text: payload.message || 'Your profile has been saved successfully.',
                confirmButtonColor: '#2E395B',
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Update failed',
                text: err.message || 'Unable to save profile changes.',
                confirmButtonColor: '#2E395B',
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className=''>
                <AdminDashboardTitle title="Admin Profile" subtitle={"Manage your account and store preferences."} />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-8">
                <ProfileHeader />

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="mb-6 text-base font-semibold text-gray-900">Personal Information</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField label="Full Name">
                                <TextInput
                                    name="fullName"
                                    placeholder="John Industries"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </FormField>
                            <FormField label="Email">
                                <TextInput
                                    name="email"
                                    type="email"
                                    placeholder="admin@johnindustries.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </FormField>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-6 text-base font-semibold text-gray-900">Change Password</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <FormField label="Current Password">
                                <TextInput
                                    name="currentPassword"
                                    type="password"
                                    placeholder="••••••"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                />
                            </FormField>
                            <FormField label="New Password">
                                <TextInput
                                    name="newPassword"
                                    type="password"
                                    placeholder="••••••"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                />
                            </FormField>
                            <FormField label="Confirm New Password">
                                <TextInput
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </FormField>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="rounded-lg btn-custom px-6 py-2.5 text-sm font-medium text-white  transition"
                    >
                        Save Preferences
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;
