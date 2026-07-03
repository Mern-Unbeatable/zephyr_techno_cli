import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import leftsideImage from '../../assets/auth/opt.jpg';
import { GoArrowLeft } from 'react-icons/go';
import { useAuth } from '../../context/AuthContext';

const OTP_LENGTH = 6;

const ForgetCode = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyResetOtp, resendOtp } = useAuth();

    const [email] = useState(
        location.state?.email || sessionStorage.getItem('pendingResetPasswordEmail') || ''
    );
    const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/forget-password', { replace: true });
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const nextDigits = [...otpDigits];
        nextDigits[index] = value;
        setOtpDigits(nextDigits);
        setError('');

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key !== 'Backspace') return;

        if (otpDigits[index]) {
            const nextDigits = [...otpDigits];
            nextDigits[index] = '';
            setOtpDigits(nextDigits);
            return;
        }

        if (index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        const nextDigits = Array(OTP_LENGTH).fill('');

        text.split('').forEach((digit, index) => {
            nextDigits[index] = digit;
        });

        setOtpDigits(nextDigits);
        setError('');

        if (text.length > 0) {
            inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is missing. Please request a new reset code.');
            return;
        }

        const otp = otpDigits.join('');
        if (otp.length !== OTP_LENGTH) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setIsSubmitting(true);

        try {
            await verifyResetOtp({ email, otp });
            sessionStorage.removeItem('pendingResetPasswordEmail');
            sessionStorage.setItem('verifiedResetPasswordEmail', email);
            navigate('/reset-password', { replace: true, state: { email } });
        } catch (err) {
            setError(err.message || 'Failed to verify reset code. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError('Email is missing. Please request a new reset code.');
            return;
        }

        setIsSubmitting(true);

        try {
            await resendOtp({ email, type: 'password-reset' });
            setOtpDigits(Array(OTP_LENGTH).fill(''));
            setError('');
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.message || 'Unable to resend the reset code.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden">
            <div className="hidden md:block w-1/2 h-full overflow-hidden">
                <img
                    src={leftsideImage}
                    className="w-full h-full ken-burns-image object-cover"
                    alt="OTP Verification"
                />
            </div>

            <div className="absolute top-4 right-4 z-50">
                <button
                    onClick={() => navigate('/login')}
                    aria-label="Back to Login"
                    className="flex items-center gap-0.5 duration-300 px-3 py-2 transition cursor-pointer hover:scale-105"
                >
                    <GoArrowLeft className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Back</span>
                </button>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-10 overflow-y-auto">
                <div className="w-full max-w-sm form-stagger">
                    <div className="border border-gray-200 rounded-2xl p-8 shadow-sm">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                            OTP Verification
                        </h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Enter the verification code for reset password.
                        </p>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="flex w-full gap-3 mb-2" onPaste={handlePaste}>
                                {otpDigits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className={`flex-1 min-w-0 aspect-square text-center text-lg font-semibold rounded-lg border-2 focus:outline-none focus:border-custom transition-colors ${
                                            digit ? 'border-custom' : 'border-gray-200'
                                        } ${error ? 'border-red-400!' : ''}`}
                                    />
                                ))}
                            </div>

                            {error ? <p className="text-red-500 text-xs mb-4">{error}</p> : null}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-custom w-full text-base font-semibold mt-4 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? 'Verifying...' : 'Verify'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-4">
                            Didn't receive a code?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-custom font-semibold hover:underline"
                            >
                                Resend
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetCode;
