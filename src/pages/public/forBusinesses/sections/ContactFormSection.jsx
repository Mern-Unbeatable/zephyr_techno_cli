import { useState } from 'react';
import Swal from 'sweetalert2';
import Container from '../../../../layout/Container';

const ContactFormSection = () => {
    const [form, setForm] = useState({
        companyName: '',
        name: '',
        email: '',
        phone: '',
        requirements: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Sanitize phone number to only allow digits and tel characters
        if (name === 'phone') {
            const sanitized = value.replace(/[^\d+()\-\s]/g, '');
            setForm((s) => ({ ...s, [name]: sanitized }));
        } else {
            setForm((s) => ({ ...s, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        // simple validation
        if (!form.companyName || !form.name || !form.email || !form.requirements) {
            Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Please fill in all required fields.' });
            return;
        }

        setSubmitting(true);
        try {
            const base = import.meta.env.VITE_BASE_URL || '';
            const res = await fetch(`${base}/api/public/business-form`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Request failed');
            }

            const data = await res.json();
            Swal.fire({
                icon: 'success',
                title: 'Submitted',
                showConfirmButton: true,
            });
            setForm({ companyName: '', name: '', email: '', phone: '', requirements: '' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Submission failed', text: err.message || 'Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className='bg-white py-14 lg:py-20'>
            <Container>
                <div className='mx-auto max-w-3xl text-center'>
                    <h2 className='text-3xl font-bold text-[#0A0A0A] sm:text-4xl'>
                        Looking for a trusted technology supplier?
                    </h2>
                    <p className='mt-4 text-base text-[#4A5565]'>Let&apos;s talk.</p>
                </div>

                <form className='mx-auto mt-10 max-w-4xl space-y-5' onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className='mb-2 block text-sm lg:text-base font-semibold text-[#0A0A0A]'>
                            Company Name
                        </label>
                        <input
                            type='text'
                            name='companyName'
                            value={form.companyName}
                            onChange={handleChange}
                            placeholder='Enter company name'
                            className='h-12.5 w-full rounded-[14px] border border-gray-200 bg-white px-4 text-sm text-[#0A0A0A] outline-none focus:border-[#00B8DB]'
                        />
                    </div>

                    <div>
                        <label className='mb-2 block text-sm lg:text-base font-semibold text-[#0A0A0A]'>
                            Name
                        </label>
                        <input
                            type='text'
                            name='name'
                            value={form.name}
                            onChange={handleChange}
                            placeholder='Enter your name'
                            className='h-12.5 w-full rounded-[14px] border border-gray-200 bg-white px-4 text-sm text-[#0A0A0A] outline-none focus:border-[#00B8DB]'
                        />
                    </div>

                    <div>
                        <label className='mb-2 block text-sm lg:text-base font-semibold text-[#0A0A0A]'>
                            Email
                        </label>
                        <input
                            type='email'
                            name='email'
                            value={form.email}
                            onChange={handleChange}
                            placeholder='Enter your email'
                            className='h-12.5 w-full rounded-[14px] border border-gray-200 bg-white px-4 text-sm text-[#0A0A0A] outline-none focus:border-[#00B8DB]'
                        />
                    </div>

                    <div>
                        <label className='mb-2 block text-sm lg:text-base font-semibold text-[#0A0A0A]'>
                            Phone Number
                        </label>
                        <input
                            type='tel'
                            name='phone'
                            value={form.phone}
                            onChange={handleChange}
                            placeholder='Enter your phone number'
                            className='h-12.5 w-full rounded-[14px] border border-gray-200 bg-white px-4 text-sm text-[#0A0A0A] outline-none focus:border-[#00B8DB]'
                            inputMode='tel'
                            autoComplete='tel'
                            pattern='[0-9()+\-\s]*'
                        />
                    </div>

                    <div>
                        <label className='mb-2 block text-sm lg:text-base font-semibold text-[#0A0A0A]'>
                            Requirements
                        </label>
                        <textarea
                            rows={5}
                            name='requirements'
                            value={form.requirements}
                            onChange={handleChange}
                            placeholder='Enter your requirements'
                            className='w-full rounded-[14px] border border-gray-200 bg-white px-4 py-3 text-sm text-[#0A0A0A] outline-none focus:border-[#00B8DB] resize-none'
                        />
                    </div>

                    <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`inline-flex w-full items-center justify-center rounded-[14px] bg-linear-to-b from-[#00B8DB] to-custom py-4 text-base font-medium text-white transition-all duration-300 hover:brightness-110 ${submitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </Container>
        </section>
    );
};

export default ContactFormSection;

// --- Hook and handlers placed below component to avoid inline clutter ---




