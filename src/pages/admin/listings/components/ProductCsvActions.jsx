import { useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { Download, Upload } from 'lucide-react';
import CsvImportPreviewModal from '../../../../components/dashboards/CsvImportPreviewModal';
import { downloadCsv, normalizeHeader, readSpreadsheetFile, todayStamp } from '../../../../utils/csv';
import { readApiErrorMessage } from '../../../../utils/apiError';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';

const COLUMNS = {
    variantId: 'Variant ID',
    product: 'Product',
    model: 'Model',
    status: 'Status',
    condition: 'Condition',
    color: 'Colour',
    storage: 'Storage',
    price: 'Price',
    compareAtPrice: 'Compare At Price',
    stockQuantity: 'Stock',
    expressDeliveryEnabled: 'Express Delivery',
};

const HEADER_ALIASES = {
    variantId: ['variant id', 'variantid', 'id'],
    price: ['price'],
    compareAtPrice: ['compare at price', 'compare-at price', 'compare at', 'compareatprice'],
    stockQuantity: ['stock', 'stock quantity', 'quantity', 'qty'],
    expressDeliveryEnabled: ['express delivery', 'express'],
};

const READ_ONLY_ALIASES = {
    product: ['product', 'product title', 'title'],
    model: ['model'],
    status: ['status'],
    condition: ['condition'],
    color: ['colour', 'color'],
    storage: ['storage'],
};

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatMoney = (value) =>
    value == null ? '—' : `£${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const FIELD_LABELS = {
    price: 'Price',
    compareAtPrice: 'Compare at',
    stockQuantity: 'Stock',
    expressDeliveryEnabled: 'Express',
};

const formatField = (field, value) => {
    if (field === 'stockQuantity') return value;
    if (field === 'expressDeliveryEnabled') return value ? 'Yes' : 'No';
    return formatMoney(value);
};

const previewColumns = [
    { key: 'line', label: 'Line', className: 'w-16 text-gray-400' },
    { key: 'label', label: 'Variant' },
    {
        key: 'diff',
        label: 'Changes',
        className: 'w-72',
        render: (row) => (
            <div className="space-y-1">
                {Object.entries(row.diff).map(([field, { from, to }]) => (
                    <div key={field} className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="w-20 font-medium text-gray-500">{FIELD_LABELS[field]}</span>
                        <span className="text-gray-400 line-through">{formatField(field, from)}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-gray-900">{formatField(field, to)}</span>
                    </div>
                ))}
            </div>
        ),
    },
];

const ProductCsvActions = ({ onImported }) => {
    const fileInputRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [preview, setPreview] = useState(null);

    const showError = (message) =>
        Swal.fire({ icon: 'error', title: 'CSV import', text: message, confirmButtonColor: '#0891b2' });

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/products/variants/export`, {
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error(await readApiErrorMessage(res, 'Failed to load products.'));
            const payload = await res.json();
            const rows = Array.isArray(payload?.data) ? payload.data : [];
            const keys = Object.keys(COLUMNS);

            downloadCsv(`shop-products-${todayStamp()}.csv`, [
                keys.map((key) => COLUMNS[key]),
                ...rows.map((row) =>
                    keys.map((key) => {
                        if (key === 'expressDeliveryEnabled') return row[key] ? 'Yes' : 'No';
                        if (key === 'status') return row[key] === 'ACTIVE' ? 'Active' : 'Inactive';
                        return row[key] ?? '';
                    }),
                ),
            ]);
        } catch (err) {
            showError(err.message || 'Failed to download CSV.');
        } finally {
            setDownloading(false);
        }
    };

    const requestImport = (rows, dryRun) =>
        fetch(`${API_BASE_URL}/api/admin/products/variants/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ rows, dryRun }),
        }).then(async (res) => {
            if (!res.ok) throw new Error(await readApiErrorMessage(res, 'Failed to import CSV.'));
            const payload = await res.json();
            return payload.data;
        });

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setParsing(true);
        try {
            const table = await readSpreadsheetFile(file);
            if (table.length < 2) throw new Error('The file is empty or has no product rows.');

            const header = table[0].map(normalizeHeader);
            const indexOf = (field) => header.findIndex((h) => HEADER_ALIASES[field].includes(h));
            const indexes = Object.fromEntries(
                Object.keys(HEADER_ALIASES).map((field) => [field, indexOf(field)]),
            );

            if (indexes.variantId === -1) {
                throw new Error('The file must include a "Variant ID" column. Download the CSV first to get the correct format.');
            }

            const readOnlyIndexes = Object.entries(READ_ONLY_ALIASES)
                .map(([field, aliases]) => [field, header.findIndex((h) => aliases.includes(h))])
                .filter(([, index]) => index !== -1);

            const rows = table.slice(1).map((cells, i) => {
                const row = { line: i + 2 };
                Object.entries(indexes).forEach(([field, index]) => {
                    row[field] = index === -1 ? '' : cells[index] ?? '';
                });
                readOnlyIndexes.forEach(([field, index]) => {
                    row[field] = cells[index] ?? '';
                });
                return row;
            });

            const result = await requestImport(rows, true);
            setPreview({ fileName: file.name, rows, result });
        } catch (err) {
            showError(err.message || 'Failed to read CSV.');
        } finally {
            setParsing(false);
        }
    };

    const handleConfirm = async () => {
        if (!preview) return;
        setConfirming(true);
        try {
            const result = await requestImport(preview.rows, false);
            setPreview(null);
            await onImported?.();
            await Swal.fire({
                icon: 'success',
                title: 'Products updated',
                text: `${result.summary.updated} variant(s) updated across ${result.summary.products} product(s).`,
                confirmButtonColor: '#0891b2',
            });
        } catch (err) {
            showError(err.message || 'Failed to import CSV.');
        } finally {
            setConfirming(false);
        }
    };

    const summary = preview
        ? [
              { label: 'Variants updated', value: preview.result.summary.updated, tone: 'blue' },
              { label: 'Products affected', value: preview.result.summary.products, tone: 'green' },
              { label: 'Unchanged', value: preview.result.summary.unchanged, tone: 'gray' },
              { label: 'Errors', value: preview.result.summary.errors, tone: 'red' },
          ]
        : [];

    return (
        <>
            <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
                <Download className="h-4 w-4" />
                {downloading ? 'Preparing…' : 'Download CSV'}
            </button>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded border border-custom bg-white px-3 py-2 text-sm font-medium text-custom transition hover:bg-teal-50 disabled:opacity-60"
            >
                <Upload className="h-4 w-4" />
                {parsing ? 'Checking…' : 'Upload CSV'}
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.tsv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleFileChange}
            />

            <CsvImportPreviewModal
                isOpen={!!preview}
                title="Review shop product updates"
                fileName={preview?.fileName}
                summary={summary}
                columns={previewColumns}
                changes={preview?.result.changes || []}
                errors={preview?.result.errors || []}
                warnings={preview?.result.warnings || []}
                emptyMessage="No price, compare-at price, stock or express delivery changes found in this file."
                warningsTitle="Changes in read-only columns will not be saved"
                warningsHint="Only Price, Compare At Price, Stock and Express Delivery are updated by CSV. Change the product title, model, status, condition, colour or storage from the listing's Edit page."
                confirming={confirming}
                onConfirm={handleConfirm}
                onClose={() => setPreview(null)}
            />
        </>
    );
};

export default ProductCsvActions;
