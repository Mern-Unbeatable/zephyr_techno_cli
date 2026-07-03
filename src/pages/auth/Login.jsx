// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import leftImage from '../../assets/auth/login.jpg';
import { getRoles } from '../../utils/roles';
import { GoArrowLeft } from 'react-icons/go';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        setIsSubmitting(true);

        try {
            const authData = await login({ email, password });
            const redirectPath = getRoles(authData.role);

            if (redirectPath === '/login') {
                setError('Your account role is not authorized for a dashboard.');
                return;
            }

            navigate(redirectPath, { replace: true });
        } catch (err) {
            setError(err.message || 'Unable to login right now. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden">
            {/* Left - Image */}
            <div className="hidden md:block w-1/2 h-full overflow-hidden">
                <img
                    src={leftImage}
                    className="w-full h-full ken-burns-image object-cover"
                    alt="Login"
                />
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
                <div className="w-full max-w-sm form-stagger">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                        Login to Continue
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 mb-6 lg:mb-8">
                        Sign in to your account to view contact details.
                    </p>

                    <form onSubmit={handleLogin}>
                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email here..."
                                className="input w-full bg-[#ebecf0] border-none focus:outline-none"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-2">
                            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password here..."
                                    className="input w-full bg-[#ebecf0] border-none pr-10 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <VscEyeClosed /> : <VscEye />}
                                </button>
                            </div>
                        </div>

                        {error ? (
                            <p className="mb-3 text-sm font-medium text-red-500">{error}</p>
                        ) : null}

                        {/* Forgot Password */}
                        <div className="text-right mb-5">
                            <Link to="/forget-password" className="text-sm font-semibold text-custom hover:underline">
                                Forget Password?
                            </Link>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-custom w-full text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Sign Up */}
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Don't Have an account{' '}
                        <Link to="/register" className="text-custom font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;