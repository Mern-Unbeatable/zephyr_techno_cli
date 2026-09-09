import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Truck, X, Link2, Package, Check } from 'lucide-react';
import FormField from '../../../../components/shared/form/FormField';
import TextInput from '../../../../components/shared/form/TextInput';

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const panelVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.94 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 380, damping: 28, mass: 0.85 },
    },
    exit: {
        opacity: 0,
        y: 16,
        scale: 0.96,
        transition: { duration: 0.18, ease: 'easeIn' },
    },
};

const ShipOrderModal = ({ isOpen, order, onClose, onSubmit }) => {
    const [courierName, setCourierName] = useState('');
    const [trackingLink, setTrackingLink] = useState('');
    const [submitting, setSubmitting] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !order) return;
        setCourierName(order.courierName || '');
        setTrackingLink(order.trackingNumber || '');
        setError('');
        setSubmitting(null);
    }, [isOpen, order]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape' && !submitting) handleClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, submitting]);

    const handleClose = () => {
        if (submitting) return;
        setError('');
        onClose();
    };

    const runAction = async (mode) => {
        const courier = courierName.trim();
        const tracking = trackingLink.trim();

        if (!courier) {
            setError('Courier provider name is required.');
            return;
        }
        if (!tracking) {
            setError('Tracking link is required.');
            return;
        }

        setError('');
        setSubmitting(mode);
        try {
            await onSubmit({
                order,
                courierName: courier,
                trackingNumber: tracking,
                mode,
            });
        } catch (err) {
            setError(err?.message || 'Something went wrong.');
        } finally {
            setSubmitting(null);
        }
    };

    const busy = Boolean(submitting);

    return (
        <AnimatePresence>
            {isOpen && order ? (
                <motion.div
                    key="ship-order-modal"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.22 }}
                >
                    <motion.button
                        type="button"
                        aria-label="Close overlay"
                        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] cursor-pointer border-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        onClick={handleClose}
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ship-order-title"
                        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200/80"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-600 to-teal-700 px-6 pb-5 pt-6 text-white">
                            <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
                            <div className="pointer-events-none absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />

                            <div className="relative flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <motion.div
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25"
                                        initial={{ scale: 0.7, rotate: -12, opacity: 0 }}
                                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                        transition={{ delay: 0.08, type: 'spring', stiffness: 420, damping: 22 }}
                                    >
                                        <Truck className="h-5 w-5" strokeWidth={2.2} />
                                    </motion.div>
                                    <div>
                                        <h2
                                            id="ship-order-title"
                                            className="text-lg font-semibold tracking-tight"
                                        >
                                            Ship Order
                                        </h2>
                                        <p className="mt-0.5 text-sm text-cyan-50/90">
                                            Save details now, or ship &amp; email the customer
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={busy}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/90 transition hover:bg-white/20 cursor-pointer disabled:opacity-50"
                                    aria-label="Close modal"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="relative mt-4 flex flex-wrap gap-2 text-xs">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 shadow-sm">
                                    <Package className="h-3.5 w-3.5 text-slate-700" />
                                    {order.id}
                                </span>
                                {order.customer ? (
                                    <span className="inline-flex max-w-full items-center truncate rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 shadow-sm">
                                        {order.customer}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <FormField label="Courier provider name">
                                <div className="relative">
                                    <Truck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        type="text"
                                        className="pl-9"
                                        placeholder="e.g. Royal Mail, DPD, Evri"
                                        value={courierName}
                                        onChange={(e) => setCourierName(e.target.value)}
                                        disabled={busy}
                                        autoFocus
                                    />
                                </div>
                            </FormField>

                            <FormField label="Tracking link">
                                <div className="relative">
                                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        type="text"
                                        className="pl-9"
                                        placeholder="https://tracking.example.com/..."
                                        value={trackingLink}
                                        onChange={(e) => setTrackingLink(e.target.value)}
                                        disabled={busy}
                                    />
                                </div>
                            </FormField>

                            <AnimatePresence>
                                {error ? (
                                    <motion.p
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
                                    >
                                        {error}
                                    </motion.p>
                                ) : null}
                            </AnimatePresence>

                            <p className="text-xs text-gray-500">
                                <strong className="font-medium text-gray-700">Done</strong> saves courier details only.
                                {' '}
                                <strong className="font-medium text-gray-700">Mark as Shipped</strong> updates status and emails the customer.
                            </p>

                            <div className="flex justify-end gap-2 pt-1">
                                <motion.button
                                    type="button"
                                    disabled={busy}
                                    whileHover={busy ? undefined : { scale: 1.02 }}
                                    whileTap={busy ? undefined : { scale: 0.98 }}
                                    onClick={() => runAction('save')}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4 text-cyan-600" />
                                    {submitting === 'save' ? 'Saving…' : 'Done'}
                                </motion.button>
                                <motion.button
                                    type="button"
                                    disabled={busy}
                                    whileHover={busy ? undefined : { scale: 1.02 }}
                                    whileTap={busy ? undefined : { scale: 0.98 }}
                                    onClick={() => runAction('ship')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-cyan-600/25 transition hover:bg-cyan-700 cursor-pointer disabled:opacity-50"
                                >
                                    <Truck className="h-4 w-4" />
                                    {submitting === 'ship' ? 'Shipping…' : 'Mark as Shipped'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

export default ShipOrderModal;
