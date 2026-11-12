import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, X } from 'lucide-react';

const toneClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
    red: 'bg-red-50 text-red-600 border-red-100',
};

/**
 * Preview of a CSV import before anything is saved.
 * columns: [{ key, label, className?, render?(row) }]
 * summary: [{ label, value, tone }]
 */
const CsvImportPreviewModal = ({
    isOpen,
    title = 'Review CSV import',
    fileName,
    summary = [],
    columns = [],
    changes = [],
    errors = [],
    warnings = [],
    warningsTitle = 'Warnings',
    warningsHint = '',
    emptyMessage = 'No changes found in this file.',
    confirming = false,
    onConfirm,
    onClose,
}) => {
    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape' && !confirming) onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, confirming, onClose]);

    if (typeof document === 'undefined') return null;

    const canConfirm = changes.length > 0 && !confirming;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => !confirming && onClose?.()}
                    />
                    <motion.div
                        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-cyan-600 to-teal-500 px-6 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="text-lg font-semibold">{title}</h2>
                                    {fileName && (
                                        <p className="text-xs text-white/80">{fileName}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={confirming}
                                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-50"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                            <p className="text-sm text-gray-600">
                                Nothing has been saved yet. Check the changes below, then click{' '}
                                <span className="font-semibold text-gray-900">Confirm import</span>.
                            </p>

                            {summary.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {summary.map((item) => (
                                        <div
                                            key={item.label}
                                            className={`rounded-xl border px-4 py-3 ${toneClasses[item.tone] || toneClasses.gray}`}
                                        >
                                            <p className="text-2xl font-semibold">{item.value}</p>
                                            <p className="text-xs font-medium">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors.length > 0 && (
                                <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        {errors.length} row{errors.length === 1 ? '' : 's'} will be skipped
                                    </div>
                                    <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-red-700">
                                        {errors.map((error, index) => (
                                            <li key={`${error.line}-${index}`}>
                                                {error.line ? (
                                                    <span className="font-semibold">Line {error.line}: </span>
                                                ) : null}
                                                {error.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {warnings.length > 0 && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-700">
                                        <AlertTriangle className="h-4 w-4" />
                                        {warningsTitle} ({warnings.length} row{warnings.length === 1 ? '' : 's'})
                                    </div>
                                    {warningsHint && (
                                        <p className="mb-2 text-xs text-amber-700/90">{warningsHint}</p>
                                    )}
                                    <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-amber-800">
                                        {warnings.map((warning, index) => (
                                            <li key={`${warning.line}-${index}`}>
                                                {warning.line ? (
                                                    <span className="font-semibold">Line {warning.line}: </span>
                                                ) : null}
                                                {warning.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {changes.length > 0 ? (
                                <div className="overflow-hidden rounded-xl border border-gray-100">
                                    <div className="max-h-[42vh] overflow-auto">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="sticky top-0 bg-[#f8fbfc] text-xs uppercase text-gray-500">
                                                <tr>
                                                    {columns.map((column) => (
                                                        <th
                                                            key={column.key}
                                                            className={`px-4 py-2.5 font-semibold ${column.className || ''}`}
                                                        >
                                                            {column.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {changes.map((row, index) => (
                                                    <tr
                                                        key={`${row.line}-${index}`}
                                                        className="border-t border-gray-100 text-gray-700"
                                                    >
                                                        {columns.map((column) => (
                                                            <td
                                                                key={column.key}
                                                                className={`px-4 py-2.5 align-top ${column.className || ''}`}
                                                            >
                                                                {column.render ? column.render(row) : row[column.key]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                                    <CheckCircle2 className="h-4 w-4 text-gray-400" />
                                    {emptyMessage}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={confirming}
                                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={!canConfirm}
                                className="rounded-lg bg-custom px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#12806f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {confirming
                                    ? 'Saving…'
                                    : `Confirm import (${changes.length} change${changes.length === 1 ? '' : 's'})`}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
};

export default CsvImportPreviewModal;
