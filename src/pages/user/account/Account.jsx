import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { filterUkCounties } from '../../../data/ukCounties';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';
const UK_COUNTRY = 'United Kingdom';

const addressInputClass =
    'h-12 w-full rounded-sm border border-[#E5E7EB] bg-white px-4 text-base text-[#151A2A] placeholder-[#6B7280] focus:border-custom focus:outline-none focus:ring-1 focus:ring-custom';

const addressLabelClass = 'text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]';

const resolveImageUrl = (url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url) || url.startsWith('blob:')) return url;
    return `${API_BASE_URL.replace(/\/$/, '')}/${String(url).replace(/^\/+/, '')}`;
};

const splitStreet = (street = '') => {
    const raw = String(street).trim();
    if (!raw) return { address: '', addressLine2: '' };
    const idx = raw.indexOf(', ');
    if (idx === -1) return { address: raw, addressLine2: '' };
    return { address: raw.slice(0, idx), addressLine2: raw.slice(idx + 2) };
};

const buildStreet = (line1 = '', line2 = '') => {
    const streetLine = line1.trim();
    const addressLine2 = line2.trim();
    return addressLine2 ? `${streetLine}, ${addressLine2}` : streetLine;
};

const buildProfileFromResponse = (user = {}) => {
    const address = user.userAddresses?.[0] || {};
    const { address: street, addressLine2 } = splitStreet(address.street);

    return {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        region: address.state || '',
        city: address.city || '',
        zip: address.zipCode || '',
        address: street,
        addressLine2,
        country: UK_COUNTRY,
        avatar: user.avatar || '',
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
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countyOpen, setCountyOpen] = useState(false);
    const countyBlurTimer = useRef(null);
    const avatarInputRef = useRef(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(() =>
        resolveImageUrl(authUser?.avatar),
    );

    const countySuggestions = useMemo(
        () => filterUkCounties(profile.region || ''),
        [profile.region],
    );

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
                setAvatarFile(null);
                setAvatarPreview(resolveImageUrl(payload.data?.avatar));
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
        const nextValue =
            name === 'phone' ? value.replace(/[^\d+()\-\s]/g, '') : value;
        setProfile((prev) => ({ ...prev, [name]: nextValue }));
        setSuccess('');
    };

    const handleCountyFocus = () => {
        if (countyBlurTimer.current) clearTimeout(countyBlurTimer.current);
        setCountyOpen(true);
    };

    const handleCountyBlur = () => {
        countyBlurTimer.current = setTimeout(() => setCountyOpen(false), 150);
    };

    const selectCounty = (county) => {
        setProfile((prev) => ({ ...prev, region: county }));
        setCountyOpen(false);
        setSuccess('');
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }
        setAvatarFile(file);
        setAvatarPreview((prev) => {
            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
            return URL.createObjectURL(file);
        });
        setSuccess('');
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
        setSuccess('');
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        if (saving) return;

        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const authToken = token || localStorage.getItem('token') || localStorage.getItem('accessToken');
            const formData = new FormData();
            formData.append('firstName', profile.firstName);
            formData.append('lastName', profile.lastName);
            formData.append('phone', profile.phone);
            formData.append(
                'addresses',
                JSON.stringify([
                    {
                        street: buildStreet(profile.address, profile.addressLine2),
                        city: profile.city,
                        state: profile.region,
                        zipCode: profile.zip.trim().toUpperCase(),
                        country: UK_COUNTRY,
                    },
                ]),
            );
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
                body: formData,
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
                        street: buildStreet(profile.address, profile.addressLine2),
                        city: profile.city,
                        state: profile.region,
                        zipCode: profile.zip.trim().toUpperCase(),
                        country: UK_COUNTRY,
                    },
                ],
            };

            updateUser(updatedUser);
            setAvatarFile(null);
            setAvatarPreview(resolveImageUrl(updatedUser.avatar) || avatarPreview);

            await Swal.fire({
                icon: 'success',
                title: 'Profile updated',
                text: payload.message || 'Your profile has been saved successfully.',
                confirmButtonColor: '#2E395B',
            });

            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
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
                            <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                                <div className="h-full w-full overflow-hidden rounded-full bg-cyan-100 text-cyan-600 shadow-sm">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center">
                                            <User className="h-11 w-11 sm:h-12 sm:w-12" strokeWidth={2} />
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-custom text-white shadow-md ring-2 ring-white hover:brightness-110"
                                    title="Upload profile photo"
                                >
                                    <Camera className="h-4 w-4" strokeWidth={2} />
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
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
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className={addressLabelClass}>Country</label>
                                    <div className="flex h-12 items-center rounded-sm border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-base text-[#151A2A]">
                                        {UK_COUNTRY}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className={addressLabelClass}>Address Line 1</label>
                                    <input
                                        name="address"
                                        value={profile.address}
                                        onChange={handleProfileChange}
                                        placeholder="221B Baker Street"
                                        autoComplete="address-line1"
                                        className={addressInputClass}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className={addressLabelClass}>
                                        Address Line 2{' '}
                                        <span className="font-normal normal-case tracking-normal text-[#9CA3AF]">
                                            (Optional)
                                        </span>
                                    </label>
                                    <input
                                        name="addressLine2"
                                        value={profile.addressLine2}
                                        onChange={handleProfileChange}
                                        placeholder="Flat 2"
                                        autoComplete="address-line2"
                                        className={addressInputClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className={addressLabelClass}>Town / City</label>
                                        <input
                                            name="city"
                                            value={profile.city}
                                            onChange={handleProfileChange}
                                            placeholder="London"
                                            autoComplete="address-level2"
                                            className={addressInputClass}
                                        />
                                    </div>

                                    <div className="relative flex flex-col gap-2">
                                        <label className={addressLabelClass}>
                                            County{' '}
                                            <span className="font-normal normal-case tracking-normal text-[#9CA3AF]">
                                                (Optional)
                                            </span>
                                        </label>
                                        <input
                                            name="region"
                                            value={profile.region}
                                            onChange={handleProfileChange}
                                            onFocus={handleCountyFocus}
                                            onBlur={handleCountyBlur}
                                            placeholder="Greater London"
                                            autoComplete="address-level1"
                                            className={addressInputClass}
                                        />
                                        {countyOpen && countySuggestions.length > 0 && (
                                            <ul
                                                className="absolute top-full right-0 left-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-sm border border-[#E5E7EB] bg-white py-1 shadow-lg"
                                                role="listbox"
                                            >
                                                {countySuggestions.map((county) => (
                                                    <li key={county} role="option">
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => selectCounty(county)}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-[#151A2A] transition-colors hover:bg-[#F0F4F6]"
                                                        >
                                                            {county}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className={addressLabelClass}>Postcode</label>
                                        <input
                                            name="zip"
                                            value={profile.zip}
                                            onChange={handleProfileChange}
                                            placeholder="NW1 6XE"
                                            autoComplete="postal-code"
                                            className={addressInputClass}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className={addressLabelClass}>Phone Number</label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={profile.phone}
                                        onChange={handleProfileChange}
                                        placeholder="+44"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        className={addressInputClass}
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded bg-custom px-4 py-2 text-sm font-medium text-white duration-300 hover:scale-105 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                                >
                                    {saving ? (
                                        <>
                                            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            SAVING...
                                        </>
                                    ) : (
                                        'SAVE CHANGES'
                                    )}
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
