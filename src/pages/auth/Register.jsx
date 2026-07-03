// src/pages/Register.jsx
import { useState } from 'react';
import leftsideImage from '../../assets/auth/register.webp';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';
import { Link, useNavigate } from 'react-router';
import { GoArrowLeft } from 'react-icons/go';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!firstName || !lastName || !email || !phone || !password) {
            setError('All fields are required.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password and confirm password do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            await register({ firstName, lastName, email, phone, password });
            sessionStorage.setItem('pendingVerificationEmail', email);
            navigate('/otp-verification', { replace: true, state: { email } });
        } catch (err) {
            setError(err.message || 'Unable to register right now. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden">
            {/* Left - Image */}
            <div className="hidden md:block w-1/2 h-full overflow-hidden">
                <img
                    src={leftsideImage}
                    className="w-full h-full ken-burns-image object-cover"
                    alt="Register"
                />
                {/* <KamuiImage src={leftsideImage} alt="Register"/> */}
            </div>

            {/* Top-right Back Button */}
            <div className="absolute top-4 right-4 z-50">
                <button
                                    onClick={() => navigate('/')}
                                    aria-label="Back to Home"
                                    className="flex items-center gap-0.5 duration-300 px-3 py-2 transition cursor-pointer hover:scale-105"
                                >
                                    
                                    <GoArrowLeft className="w-4 h-4 text-gray-500"/>
                                    <span className="text-xs text-gray-500">Home</span>
                                </button>
            </div>

            {/* Right - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-10 overflow-y-auto">
                <div className="w-full max-w-md py-10 form-stagger">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                        Register Account
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">
                        Provide your basic personal details to create your user profile.
                    </p>

                    <form onSubmit={handleRegister}>

                    {/* First Name & Last Name */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter your first name"
                                className="input w-full bg-[#ebecf0] border-none focus:outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter your last name"
                                className="input w-full bg-[#ebecf0] border-none focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your business email.."
                            className="input w-full bg-[#ebecf0] border-none focus:outline-none"
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter your Phone number.."
                            className="input w-full bg-[#ebecf0] border-none focus:outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="write password"
                                className="input w-full bg-[#ebecf0] border-none focus:outline-none"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VscEyeClosed /> : <VscEye />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="confirm password"
                                className="input w-full bg-[#ebecf0] border-none focus:outline-none"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <VscEyeClosed /> : <VscEye />}
                            </button>
                        </div>
                    </div>

                    {error ? (
                        <p className="mb-4 text-sm font-medium text-red-500">{error}</p>
                    ) : null}

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-custom w-full text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Creating Account...' : 'Sign UP'}
                    </button>

                    </form>

                    {/* Log In */}
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already Have an account{' '}
                        <Link to="/login" className="text-custom font-semibold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;