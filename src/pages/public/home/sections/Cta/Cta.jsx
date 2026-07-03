import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Container from "../../../../../layout/Container";

const API_BASE_URL =
    import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const Cta = () => {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Email required',
                text: 'Please enter your email address.',
            });
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/public/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            let payload = {};
            try {
                payload = await response.json();
            } catch {
                payload = {};
            }

            if (!response.ok) {
                throw new Error(payload.message || 'Failed to subscribe. Please try again.');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Subscribed!',
                text: payload.message || 'Thank you for subscribing to our newsletter.',
                showConfirmButton: true,
            });
            setEmail('');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Subscription failed',
                text: err.message || 'An error occurred. Please try again.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="w-full py-10 md:py-16">
           <Container>
             <div className="bg-[#f2f2f0] rounded-2xl px-8 py-16 text-center">

                {/* Heading */}
                <h2 className="title-custom text-[#1a1d2e] mb-4">
                    Get a Newsletter
                </h2>

                {/* Subheading */}
                <p className="subtitle-custom max-w-lg mx-auto mb-10 leading-relaxed">
                    Subscribe to receive exclusive offers, new product launches, and
                    technological insights from our design lab.
                </p>

                {/* Input + Button Row */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto"
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="YOUR EMAIL ADDRESS"
                        disabled={submitting}
                        required
                        className="input w-full bg-white border rounded-lg border-[#D1D5DB] focus:outline-none placeholder:text-xs placeholder:tracking-widest placeholder:text-gray-400 text-gray-700 disabled:opacity-70"
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn bg-[#151A2A] rounded-lg text-white w-full sm:w-auto px-8 text-xs tracking-widest font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {submitting ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </form>

            </div>
           </Container>
        </section>
    );
};

export default Cta;
