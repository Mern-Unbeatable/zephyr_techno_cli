import { useEffect, useMemo, useState } from 'react';
import { FormField, SelectInput, Modal } from '../../../../components/shared/form';
import { sortConditionsForDisplay } from '../../../../utils/conditionSort';
import { sortStorageOptionsBySize, formatStorageLabel } from '../../../../utils/storageSort';

const cellKey = (storageId, conditionId) => `${storageId}::${conditionId}`;

const BulkConditionPriceModal = ({
    isOpen,
    onClose,
    conditions = [],
    models = [],
    storageOptions = [],
    existingPrices = [],
    onSave,
}) => {
    const [deviceModelId, setDeviceModelId] = useState('');
    const [matrixPrices, setMatrixPrices] = useState({});
    const [saving, setSaving] = useState(false);

    const sortedStorage = useMemo(
        () => sortStorageOptionsBySize(storageOptions),
        [storageOptions],
    );

    const orderedConditions = useMemo(
        () => sortConditionsForDisplay(conditions),
        [conditions],
    );

    const selectedModel = models.find((m) => m.id === deviceModelId);

    useEffect(() => {
        if (!isOpen) {
            setDeviceModelId('');
            setMatrixPrices({});
            return;
        }
    }, [isOpen]);

    useEffect(() => {
        if (!deviceModelId) {
            setMatrixPrices({});
            return;
        }

        const next = {};
        sortedStorage.forEach((storage) => {
            orderedConditions.forEach((condition) => {
                const match = existingPrices.find(
                    (e) =>
                        e.deviceModelId === deviceModelId &&
                        e.storageOptionId === storage.id &&
                        e.conditionId === condition.id,
                );
                next[cellKey(storage.id, condition.id)] = {
                    price: match?.price != null ? String(match.price) : '',
                    entryId: match?.id || null,
                };
            });
        });
        setMatrixPrices(next);
    }, [deviceModelId, existingPrices, sortedStorage, orderedConditions]);

    const handlePriceChange = (storageId, conditionId, value) => {
        const key = cellKey(storageId, conditionId);
        setMatrixPrices((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                price: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!deviceModelId) return;

        const entries = [];
        sortedStorage.forEach((storage) => {
            orderedConditions.forEach((condition) => {
                const key = cellKey(storage.id, condition.id);
                const cell = matrixPrices[key];
                const raw = cell?.price?.trim();
                if (raw === '' || Number.isNaN(Number(raw))) return;
                entries.push({
                    conditionId: condition.id,
                    conditionName: condition.name,
                    storageOptionId: storage.id,
                    storageName: storage.name,
                    price: raw,
                    entryId: cell?.entryId || null,
                });
            });
        });

        if (entries.length === 0) return;

        setSaving(true);
        try {
            await onSave({ deviceModelId, entries });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const showMatrix =
        deviceModelId && sortedStorage.length > 0 && orderedConditions.length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Set model prices"
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                <FormField label="Device model">
                    <SelectInput
                        name="deviceModelId"
                        value={deviceModelId}
                        onChange={(e) => setDeviceModelId(e.target.value)}
                        options={models.map((m) => ({ value: m.id, label: m.name }))}
                        placeholder="Select device model"
                    />
                </FormField>

                {selectedModel && (
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Prices for <span className="font-semibold text-gray-900">{selectedModel.name}</span>. Scroll the table if needed.
                    </p>
                )}

                {showMatrix && (
                    <div className="space-y-2">
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-left uppercase text-gray-500">
                                        <th className="w-12 py-1.5 pl-2 pr-1 font-semibold">Storage</th>
                                        {orderedConditions.map((condition) => (
                                            <th
                                                key={condition.id}
                                                className="py-1.5 px-0.5 font-semibold text-center text-[10px] leading-tight"
                                                title={condition.name}
                                            >
                                                <span className="block">
                                                    {condition.name}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedStorage.map((storage) => (
                                        <tr key={storage.id} className="border-t border-gray-100">
                                            <td className="py-1 pl-2 pr-1 font-medium text-gray-800 whitespace-nowrap">
                                                {formatStorageLabel(storage.name)}
                                            </td>
                                            {orderedConditions.map((condition) => {
                                                const key = cellKey(storage.id, condition.id);
                                                return (
                                                    <td key={condition.id} className="p-0.5">
                                                        <div className="relative w-full min-w-0">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                                                                £
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                placeholder="—"
                                                                title={`${formatStorageLabel(storage.name)} · ${condition.name}`}
                                                                value={matrixPrices[key]?.price || ''}
                                                                onChange={(e) =>
                                                                    handlePriceChange(
                                                                        storage.id,
                                                                        condition.id,
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="w-full min-w-0 rounded border border-gray-200 py-1.5 pl-6 pr-2 text-xs focus:border-custom focus:outline-none focus:ring-1 focus:ring-custom"
                                                            />
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500">
                            Leave cells blank to skip. Existing prices are pre-filled. Only filled cells are saved.
                        </p>
                    </div>
                )}

                {deviceModelId && sortedStorage.length === 0 && (
                    <p className="text-sm text-gray-500">
                        No storage options available. Add storage in Settings first.
                    </p>
                )}

                {deviceModelId && conditions.length === 0 && (
                    <p className="text-sm text-gray-500">
                        No conditions available. Add conditions in Settings first.
                    </p>
                )}

                <button
                    type="submit"
                    disabled={saving || !showMatrix}
                    className="w-full rounded-lg bg-custom cursor-pointer px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save all prices'}
                </button>
            </form>
        </Modal>
    );
};

export default BulkConditionPriceModal;
