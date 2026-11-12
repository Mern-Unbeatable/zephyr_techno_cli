import { useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { Download, Upload } from 'lucide-react';
import CsvImportPreviewModal from '../../../../components/dashboards/CsvImportPreviewModal';
import { downloadCsv, normalizeHeader, readSpreadsheetFile, todayStamp } from '../../../../utils/csv';
import { readApiErrorMessage } from '../../../../utils/apiError';
import { sortConditionsForDisplay } from '../../../../utils/conditionSort';
import { formatStorageLabel, storageSizeInGb } from '../../../../utils/storageSort';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';
const IMPORT_URL = `${API_BASE_URL}/api/admin/attributes/condition-model-prices/import`;

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatMoney = (value) =>
    value == null ? '—' : `£${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const previewColumns = [
    { key: 'line', label: 'Line', className: 'w-16 text-gray-400' },
    { key: 'model', label: 'Model' },
    { key: 'storage', label: 'Storage', className: 'w-24' },
    { key: 'condition', label: 'Condition' },
    {
        key: 'price',
        label: 'Price',
        className: 'w-44',
        render: (row) =>
            row.action === 'create' ? (
                <span>
                    <span className="mr-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
                        New
                    </span>
                    <span className="font-semibold text-gray-900">{formatMoney(row.newPrice)}</span>
                </span>
            ) : (
                <span>
                    <span className="text-gray-400 line-through">{formatMoney(row.oldPrice)}</span>
                    <span className="mx-1.5 text-gray-400">→</span>
                    <span className="font-semibold text-gray-900">{formatMoney(row.newPrice)}</span>
                </span>
            ),
    },
];

const SellPriceCsvActions = ({ models = [], conditions = [], onImported }) => {
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
            const res = await fetch(`${API_BASE_URL}/api/admin/attributes/condition-model-prices`, {
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error(await readApiErrorMessage(res, 'Failed to load prices.'));
            const payload = await res.json();
            const prices = Array.isArray(payload?.data) ? payload.data : [];

            const orderedConditions = sortConditionsForDisplay(conditions);
            const modelOrder = new Map(models.map((m, i) => [m.id, i]));
            const grouped = new Map();

            prices.forEach((p) => {
                if (!p.storageOptionId || !p.deviceModel?.name) return;
                const key = `${p.deviceModelId}::${p.storageOptionId}`;
                if (!grouped.has(key)) {
                    grouped.set(key, {
                        modelId: p.deviceModelId,
                        model: p.deviceModel.name,
                        storage: formatStorageLabel(p.storageOption?.name || ''),
                        prices: {},
                    });
                }
                grouped.get(key).prices[p.conditionId] = p.price;
            });

            const rows = [...grouped.values()].sort((a, b) => {
                const ma = modelOrder.get(a.modelId) ?? 999;
                const mb = modelOrder.get(b.modelId) ?? 999;
                if (ma !== mb) return ma - mb;
                return storageSizeInGb(a.storage) - storageSizeInGb(b.storage);
            });

            downloadCsv(`sell-your-phone-prices-${todayStamp()}.csv`, [
                ['Model', 'Storage', ...orderedConditions.map((c) => c.name)],
                ...rows.map((row) => [
                    row.model,
                    row.storage,
                    ...orderedConditions.map((c) =>
                        row.prices[c.id] != null ? Number(row.prices[c.id]) : '',
                    ),
                ]),
            ]);
        } catch (err) {
            showError(err.message || 'Failed to download CSV.');
        } finally {
            setDownloading(false);
        }
    };

    const requestImport = (rows, dryRun) =>
        fetch(IMPORT_URL, {
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
            if (table.length < 2) throw new Error('The file is empty or has no price rows.');

            const header = table[0].map((cell) => String(cell).trim());
            const modelIndex = header.findIndex((h) => normalizeHeader(h) === 'model');
            const storageIndex = header.findIndex((h) => normalizeHeader(h) === 'storage');
            if (modelIndex === -1 || storageIndex === -1) {
                throw new Error('The first row must include "Model" and "Storage" columns. Download the CSV first to get the correct format.');
            }

            const conditionColumns = header
                .map((name, index) => ({ name, index }))
                .filter(({ name, index }) => name && index !== modelIndex && index !== storageIndex);

            const rows = table.slice(1).map((cells, i) => ({
                line: i + 2,
                model: cells[modelIndex] ?? '',
                storage: cells[storageIndex] ?? '',
                prices: Object.fromEntries(
                    conditionColumns.map(({ name, index }) => [name, cells[index] ?? '']),
                ),
            }));

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
            const { created, updated } = result.summary;
            await Swal.fire({
                icon: 'success',
                title: 'Prices imported',
                text: `${updated} price(s) updated and ${created} new price(s) added.`,
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
              { label: 'Prices updated', value: preview.result.summary.updated, tone: 'blue' },
              { label: 'New prices', value: preview.result.summary.created, tone: 'green' },
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
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
                <Download className="h-4 w-4" />
                {downloading ? 'Preparing…' : 'Download CSV'}
            </button>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
                className="inline-flex items-center gap-1.5 rounded-md border border-custom bg-white px-3 py-1 text-sm font-medium text-custom hover:bg-teal-50 disabled:opacity-60"
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
                title="Review Sell Your Phone prices"
                fileName={preview?.fileName}
                summary={summary}
                columns={previewColumns}
                changes={preview?.result.changes || []}
                errors={preview?.result.errors || []}
                confirming={confirming}
                onConfirm={handleConfirm}
                onClose={() => setPreview(null)}
            />
        </>
    );
};

export default SellPriceCsvActions;
