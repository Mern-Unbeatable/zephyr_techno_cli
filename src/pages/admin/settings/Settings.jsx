import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import SettingsCard from './components/SettingsCard';
import Tag from './components/Tag';
import AddModal from './components/AddModal';
import ConditionPriceTable from './components/ConditionPriceTable';
import { INITIAL_SETTINGS, SECTIONS } from './constants';
import AdminDashboardTitle from '../../../components/dashboards/AdminDashboardTitle';
import { getColorHex } from '../../../utils/color';

const Settings = () => {
    // Start with no fallback categories/series/models/conditions — they'll be loaded from the API
    const [settings, setSettings] = useState({
        ...INITIAL_SETTINGS,
        categories: [],
        series: [],
        models: [],
        conditions: [],
        conditionPrices: {},
        conditionModelPrices: [],
        conditionModelPricesMap: {},
    });
    const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

    useEffect(() => {
        const token = localStorage.getItem('token');

        const loadCategories = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/attributes/categories`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return;
                const payload = await res.json();
                const data = Array.isArray(payload) ? payload : payload?.data || payload?.categories || [];
                if (!Array.isArray(data)) return;

                // normalize to { id, name }
                const normalized = data.map((c) => ({
                    id: c.id || c._id || c.uuid || c?.value || null,
                    name: c.name || c.title || c.value || String(c),
                }));

                setSettings((prev) => ({ ...prev, categories: normalized }));
            } catch (err) {
                // ignore load errors for now
            }
        };

        const loadSeries = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/attributes/series`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return;
                const payload = await res.json();
                const data = Array.isArray(payload) ? payload : payload?.data || payload?.series || payload?.data || [];
                if (!Array.isArray(data)) return;

                const normalized = data.map((s) => ({
                    value: s.id || s._id || s.uuid || s?.value || String(s),
                    label: s.name || s.title || s.value || String(s),
                    image: s.image || null,
                }));

                setSettings((prev) => ({ ...prev, series: normalized }));
            } catch (err) {
                // ignore load errors
            }
        };

        const loadModels = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/attributes/models`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return;
                const payload = await res.json();
                const data = Array.isArray(payload) ? payload : payload?.data || payload?.models || [];
                if (!Array.isArray(data)) return;

                const normalized = data.map((model) => ({
                    id: model.id || model._id || model.uuid || null,
                    name: model.name || model.title || String(model),
                    seriesId: model.seriesId || model.series?.id || null,
                    seriesName: model.series?.name || null,
                }));

                setSettings((prev) => ({ ...prev, models: normalized }));
            } catch (err) {
                // ignore load errors
            }
        };

        const loadConditions = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/attributes/conditions`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return;
                const payload = await res.json();
                const data = Array.isArray(payload) ? payload : payload?.data || payload?.conditions || [];
                if (!Array.isArray(data)) return;

                const normalized = data.map((condition) => ({
                    id: condition.id || condition._id || condition.uuid || null,
                    name: condition.name || condition.title || String(condition),
                }));

                setSettings((prev) => ({
                    ...prev,
                    conditions: normalized,
                    conditionPrices: normalized.reduce((acc, condition) => {
                        acc[condition.name] = prev.conditionPrices[condition.name] || '';
                        return acc;
                    }, {}),
                }));
            } catch (err) {
                // ignore load errors
            }
        };

        const loadStorageOptions = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/attributes/storage-options`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return;
                const payload = await res.json();
                const data = Array.isArray(payload) ? payload : payload?.data || payload?.storageOptions || [];
                if (!Array.isArray(data)) return;

                const normalized = data.map((storage) => ({
                    id: storage.id || storage._id || storage.uuid || null,
                    name: storage.name || storage.title || String(storage),
                }));

                setSettings((prev) => ({ ...prev, storage: normalized }));
            } catch (err) {
                // ignore load errors
            }
        };

        const loadRamOptions = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/attributes/ram-options`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return;
                const payload = await res.json();
                const data = Array.isArray(payload) ? payload : payload?.data || payload?.ramOptions || [];
                if (!Array.isArray(data)) return;

                const normalized = data.map((ram) => ({
                    id: ram.id || ram._id || ram.uuid || null,
                    name: ram.name || ram.title || String(ram),
                }));

                setSettings((prev) => ({ ...prev, ram: normalized }));
            } catch (err) {
                // ignore load errors
            }
        };

        const loadColors = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/attributes/colors`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return;
                const payload = await res.json();
                const data = Array.isArray(payload) ? payload : payload?.data || payload?.colors || [];
                if (!Array.isArray(data)) return;

                const normalized = data.map((color) => ({
                    id: color.id || color._id || color.uuid || null,
                    name: color.name || color.title || String(color),
                    hexCode: color.hexCode || null,
                }));

                setSettings((prev) => ({ ...prev, colors: normalized }));
            } catch (err) {
                // ignore load errors
            }
        };

        const loadConditionPrices = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/attributes/condition-model-prices`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return;
                const payload = await res.json();
                const data = Array.isArray(payload) ? payload : payload?.data || payload?.prices || [];

                const entries = Array.isArray(data)
                    ? data.map((p) => ({
                          id: p.id || p._id || null,
                          conditionId: p.conditionId || p.condition?.id || null,
                          conditionName: p.condition?.name || p.conditionName || null,
                          deviceModelId: p.deviceModelId || p.deviceModel?.id || null,
                          deviceModelName: p.deviceModel?.name || p.deviceModelName || null,
                          price: p.price || p.amount || p.value || null,
                      }))
                    : [];

                const byModel = {};
                entries.forEach((e) => {
                    const mid = e.deviceModelId || 'global';
                    if (!byModel[mid]) byModel[mid] = {};
                    const cname = e.conditionName || e.conditionId || 'unknown';
                    if (e.price != null) byModel[mid][cname] = e.price;
                });

                const firstModelId = Object.keys(byModel).find((k) => k && k !== 'global');
                const defaultPrices = firstModelId ? byModel[firstModelId] : byModel['global'] || {};

                setSettings((prev) => ({
                    ...prev,
                    conditionModelPrices: entries,
                    conditionModelPricesMap: byModel,
                    conditionPrices: { ...prev.conditionPrices, ...defaultPrices },
                }));
            } catch (err) {
                // ignore
            }
        };

        loadCategories();
        loadSeries();
        loadModels();
        loadConditions();
        loadStorageOptions();
        loadRamOptions();
        loadColors();
        loadConditionPrices();
    }, []);
    const [activeSection, setActiveSection] = useState(null);
    const [modalValues, setModalValues] = useState({});

    const sections = SECTIONS(settings);

    const handleOpenModal = (section) => {
        // Add image field for series
        if (section.key === 'series') {
            const fields = [
                { name: 'value', label: 'Series Name', type: 'text', placeholder: 'Enter series name' },
                { name: 'image', label: 'Series Image', type: 'file', accept: 'image/*' },
            ];
            setActiveSection({ ...section, fields, modalTitle: 'Add Series', valueKey: 'value' });
        } else if (section.key === 'colors') {
            setActiveSection({
                ...section,
                modalTitle: 'Add Color',
                valueKey: 'value',
                fields: [
                    { name: 'value', label: 'Color Name', placeholder: 'e.g. Rose Gold' },
                    { name: 'hexCode', label: 'Color Code', type: 'colorHex' },
                ],
            });
            setModalValues({ hexCode: '#9CA3AF', hexCodeManuallySet: false });
        } else {
            setActiveSection(section);
        }
        if (section.key !== 'colors') {
            setModalValues({});
        }
    };

    const handleCloseModal = () => {
        setActiveSection(null);
        setModalValues({});
    };

    const handleModalChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setModalValues((prev) => ({ ...prev, [name]: files?.[0] || null }));
            return;
        }

        if (activeSection?.key === 'colors' && name === 'value') {
            setModalValues((prev) => ({
                ...prev,
                value,
                hexCode: prev.hexCodeManuallySet
                    ? prev.hexCode
                    : getColorHex(value),
            }));
            return;
        }

        if (activeSection?.key === 'colors' && name === 'hexCode') {
            setModalValues((prev) => ({
                ...prev,
                hexCode: value,
                hexCodeManuallySet: true,
            }));
            return;
        }

        setModalValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleModalSubmit = async () => {
        if (!activeSection) return;

        const valueKey = activeSection.valueKey || 'value';
        const newValue = modalValues[valueKey];
        if (activeSection.key !== 'condition-model-prices' && !newValue) return;

        // If adding a category, series, model, or condition, POST to backend and use returned item
        if (
            activeSection.key === 'categories' ||
            activeSection.key === 'series' ||
            activeSection.key === 'models' ||
            activeSection.key === 'conditions'
        ) {
            // Validate models require seriesId
            if (activeSection.key === 'models') {
                if (!modalValues.modelName || !modalValues.modelName.trim()) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Missing Information',
                        text: 'Please enter a model name.',
                        confirmButtonColor: '#0891b2',
                    });
                    return;
                }
                if (!modalValues.seriesId) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Missing Information',
                        text: 'You need to select a series also.',
                        confirmButtonColor: '#0891b2',
                    });
                    return;
                }
            }

            (async () => {
                try {
                    const token = localStorage.getItem('token');
                    const endpoint = `${API_BASE_URL}/api/admin/attributes/${activeSection.key}`;
                    
                    let body, headers;
                    if (activeSection.key === 'series' && modalValues.image) {
                        // Use FormData for file upload
                        body = new FormData();
                        body.append('name', modalValues.value || newValue);
                        body.append('image', modalValues.image);
                        headers = {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        };
                    } else {
                        headers = {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        };
                        body = activeSection.key === 'models'
                            ? {
                                  name: modalValues.modelName,
                                  seriesId: modalValues.seriesId,
                              }
                            : activeSection.key === 'series'
                            ? { name: modalValues.value || newValue }
                            : { name: newValue };
                        body = JSON.stringify(body);
                    }
                    
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers,
                        body,
                    });

                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || 'Failed to create category');
                    }

                    const payload = await res.json();
                    const created = payload?.data || payload || {};
                    const id = created.id || created._id || created.uuid || created?.value || null;
                    const name = created.name || created.title || created.value || newValue;

                    if (activeSection.key === 'categories') {
                        const item = { id, name };
                        setSettings((prev) => ({ ...prev, categories: [...prev.categories, item] }));
                    } else if (activeSection.key === 'series') {
                        // series: normalize to { value, label, image } for SelectInput
                        const item = {
                            value: id || name,
                            label: name,
                            image: created.image || null,
                        };
                        setSettings((prev) => ({ ...prev, series: [...prev.series, item] }));
                    } else if (activeSection.key === 'conditions') {
                        const item = { id, name };
                        setSettings((prev) => {
                            const nextState = {
                                ...prev,
                                conditions: [...prev.conditions, item],
                            };

                            if (modalValues.price) {
                                nextState.conditionPrices = {
                                    ...prev.conditionPrices,
                                    [name]: modalValues.price,
                                };
                            }

                            return nextState;
                        });
                    } else {
                        const item = {
                            id,
                            name,
                            seriesId: created.seriesId || modalValues.seriesId || null,
                        };
                        setSettings((prev) => ({ ...prev, models: [...prev.models, item] }));
                    }

                    await Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Item added successfully.',
                        confirmButtonColor: '#0891b2',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } catch (err) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.message || 'Failed to add item.',
                        confirmButtonColor: '#0891b2',
                    });
                } finally {
                    handleCloseModal();
                }
            })();
            return;
        }

        if (activeSection.key === 'storage') {
            (async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE_URL}/api/admin/attributes/storage-options`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ name: newValue }),
                    });

                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || 'Failed to create storage option');
                    }

                    const payload = await res.json();
                    const created = payload?.data || payload || {};
                    const item = {
                        id: created.id || created._id || created.uuid || null,
                        name: created.name || created.title || newValue,
                    };

                    setSettings((prev) => ({
                        ...prev,
                        storage: [...prev.storage, item],
                    }));

                    await Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Storage option added successfully.',
                        confirmButtonColor: '#0891b2',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } catch (err) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.message || 'Failed to add storage option.',
                        confirmButtonColor: '#0891b2',
                    });
                } finally {
                    handleCloseModal();
                }
            })();
            return;
        }

        if (activeSection.key === 'ram') {
            (async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE_URL}/api/admin/attributes/ram-options`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ name: newValue }),
                    });

                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || 'Failed to create ram option');
                    }

                    const payload = await res.json();
                    const created = payload?.data || payload || {};
                    const item = {
                        id: created.id || created._id || created.uuid || null,
                        name: created.name || created.title || newValue,
                    };

                    setSettings((prev) => ({
                        ...prev,
                        ram: [...prev.ram, item],
                    }));

                    await Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'RAM option added successfully.',
                        confirmButtonColor: '#0891b2',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } catch (err) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.message || 'Failed to add RAM option.',
                        confirmButtonColor: '#0891b2',
                    });
                } finally {
                    handleCloseModal();
                }
            })();
            return;
        }

        if (activeSection.key === 'colors') {
            (async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE_URL}/api/admin/attributes/colors`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({
                            name: newValue,
                            hexCode: modalValues.hexCode || getColorHex(newValue),
                        }),
                    });

                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || 'Failed to create color');
                    }

                    const payload = await res.json();
                    const created = payload?.data || payload || {};
                    const item = {
                        id: created.id || created._id || created.uuid || null,
                        name: created.name || created.title || newValue,
                        hexCode: created.hexCode || modalValues.hexCode || null,
                    };

                    setSettings((prev) => ({
                        ...prev,
                        colors: [...prev.colors, item],
                    }));

                    await Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Color added successfully.',
                        confirmButtonColor: '#0891b2',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } catch (err) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.message || 'Failed to add color.',
                        confirmButtonColor: '#0891b2',
                    });
                } finally {
                    handleCloseModal();
                }
            })();
            return;
        }

        // Create or update condition-model-price
        if (activeSection.key === 'condition-model-prices') {
            (async () => {
                try {
                    const token = localStorage.getItem('token');
                    const conditionId = modalValues.conditionId;
                    const deviceModelId = modalValues.deviceModelId;
                    const price = modalValues.price;
                    if (!conditionId || !deviceModelId || price == null) return;

                    const isEdit = !!modalValues.id;
                    const endpoint = isEdit
                        ? `${API_BASE_URL}/api/admin/attributes/condition-model-prices/${modalValues.id}`
                        : `${API_BASE_URL}/api/admin/attributes/condition-model-prices`;
                    const method = isEdit ? 'PATCH' : 'POST';
                    const body = isEdit ? { price: Number(price) } : { conditionId, deviceModelId, price: Number(price) };

                    const res = await fetch(endpoint, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify(body),
                    });

                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || `Failed to ${isEdit ? 'update' : 'create'} condition-model price`);
                    }

                    const payload = await res.json();
                    const created = payload?.data || payload || {};
                    const entry = {
                        id: created.id || created._id || modalValues.id || null,
                        conditionId: created.conditionId || created.condition?.id || conditionId,
                        conditionName: created.conditionName || created.condition?.name || (settings.conditions.find(c => c.id === conditionId)?.name) || null,
                        deviceModelId: created.deviceModelId || created.deviceModel?.id || deviceModelId,
                        deviceModelName: created.deviceModelName || created.deviceModel?.name || (settings.models.find(m => m.id === deviceModelId)?.name) || null,
                        price: created.price || created.amount || body.price,
                    };

                    setSettings((prev) => {
                        const entries = isEdit
                            ? prev.conditionModelPrices.map((e) => (e.id === entry.id ? entry : e))
                            : [...prev.conditionModelPrices, entry];

                        const byModel = {};
                        entries.forEach((e) => {
                            const mid = e.deviceModelId || 'global';
                            if (!byModel[mid]) byModel[mid] = {};
                            const cname = e.conditionName || e.conditionId || 'unknown';
                            if (e.price != null) byModel[mid][cname] = e.price;
                        });

                        const firstModelId = Object.keys(byModel).find((k) => k && k !== 'global');
                        const defaultPrices = firstModelId ? byModel[firstModelId] : byModel['global'] || {};

                        return {
                            ...prev,
                            conditionModelPrices: entries,
                            conditionModelPricesMap: byModel,
                            conditionPrices: { ...prev.conditionPrices, ...defaultPrices },
                        };
                    });

                    await Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: isEdit ? 'Price updated successfully.' : 'Price added successfully.',
                        confirmButtonColor: '#0891b2',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } catch (err) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.message || `Failed to ${isEdit ? 'update' : 'add'} price.`,
                        confirmButtonColor: '#0891b2',
                    });
                } finally {
                    handleCloseModal();
                }
            })();
            return;
        }

        // default: local update for other sections
        setSettings((prev) => {
                    const updated = { ...prev, [activeSection.key]: [...prev[activeSection.key], newValue] };

            if (activeSection.key === 'conditions' && modalValues.price) {
                updated.conditionPrices = {
                    ...prev.conditionPrices,
                    [newValue]: modalValues.price,
                };
            }

            return updated;
        });

        handleCloseModal();
    };

    const handleDeleteItem = async (sectionKey, id, index) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
        });
        if (!isConfirmed) return;

        const deleteEndpointBySection = {
            categories: 'categories',
            series: 'series',
            models: 'models',
            conditions: 'conditions',
            storage: 'storage-options',
            ram: 'ram-options',
            colors: 'colors',
        };

        const hasApiEndpoint = deleteEndpointBySection[sectionKey] && id;

        if (hasApiEndpoint) {
            try {
                const token = localStorage.getItem('token');
                const endpointKey = deleteEndpointBySection[sectionKey];
                const res = await fetch(`${API_BASE_URL}/api/admin/attributes/${endpointKey}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                let payload = {};
                try { payload = await res.json(); } catch { /* empty body */ }

                if (!res.ok || payload.success === false) {
                    throw new Error(payload.message || `Failed to delete ${sectionKey}`);
                }

                setSettings((prev) => ({
                    ...prev,
                    [sectionKey]: prev[sectionKey].filter((_, i) => i !== index),
                }));

                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    text: payload.message || 'Item deleted successfully.',
                    confirmButtonColor: '#0891b2',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (err) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'Failed to delete item.',
                    confirmButtonColor: '#0891b2',
                });
            }
            return;
        }

        // default: local remove by index
        setSettings((prev) => ({
            ...prev,
            [sectionKey]: prev[sectionKey].filter((_, i) => i !== index),
        }));

        await Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Item removed.',
            confirmButtonColor: '#0891b2',
            timer: 2000,
            showConfirmButton: false,
        });
    };

    const handlePriceChange = (condition, price) => {
        setSettings((prev) => ({
            ...prev,
            conditionPrices: { ...prev.conditionPrices, [condition]: price },
        }));
    };

    const renderSection = (section) => (
        <SettingsCard
                key={section.key}
                title={section.title}
                onAdd={section.key === 'categories' ? undefined : () => handleOpenModal(section)}
                addLabel={section.addLabel}
            >
            <div className="flex flex-wrap gap-2">
                {settings[section.key].map((item, index) => {
                    const isString = typeof item === 'string';
                    const label = isString ? item : item?.name || item?.label || String(item);
                    const id = isString
                        ? null
                        : item?.id || item?.value || item?._id || null;
                    return (
                        <Tag
                            key={`${label}-${index}`}
                            label={label}
                            hexCode={isString ? null : item?.hexCode}
                            showColorSwatch={section.key === 'colors'}
                            onDelete={
                                section.key === 'categories'
                                    ? undefined
                                    : () => handleDeleteItem(section.key, id, index)
                            }
                        />
                    );
                })}
            </div>
        </SettingsCard>
    );

    const openAddPriceModal = () => {
        const fields = [
            {
                name: 'conditionId',
                label: 'Condition',
                type: 'select',
                options: settings.conditions.map((c) => ({ value: c.id, label: c.name })),
                placeholder: 'Select condition',
            },
            {
                name: 'deviceModelId',
                label: 'Device Model',
                type: 'select',
                options: settings.models.map((m) => ({ value: m.id, label: m.name })),
                placeholder: 'Select device model',
            },
            { name: 'price', label: 'Price', type: 'number', placeholder: '0.00' },
        ];

        setActiveSection({ key: 'condition-model-prices', modalTitle: 'Add Condition Price', fields });
        setModalValues({});
    };

    const conditionsSection = sections.find((s) => s.key === 'conditions');
    const otherSections = sections.filter((s) => s.key !== 'conditions');
    const beforePrice = otherSections.slice(0, 3);
    const afterPrice = otherSections.slice(3);

    return (
        <div className="space-y-6">
            <div>
                <AdminDashboardTitle title={"Admin Settings"} subtitle={"Manage your account and store preferences."} />
            </div>

            <div className="space-y-4">
                {beforePrice.map(renderSection)}

                {renderSection(conditionsSection)}

                <ConditionPriceTable
                    models={settings.models}
                    conditions={settings.conditions}
                    conditionModelPrices={settings.conditionModelPrices}
                    onAddPrice={openAddPriceModal}
                    onEditPrice={(entry) => {
                        // For editing an existing entry, only allow editing the price (backend expects only price in PATCH)
                        setActiveSection({ key: 'condition-model-prices', modalTitle: 'Edit Condition Price', fields: [
                                { name: 'price', label: 'Price', type: 'number' },
                            ]});

                        setModalValues({
                            id: entry.id || entry._id || '',
                            conditionId: entry.conditionId || entry.condition?.id || '',
                            deviceModelId: entry.deviceModelId || entry.deviceModel?.id || '',
                            price: entry.price != null ? entry.price : '',
                        });
                    }}
                    onDeletePrice={async (entry) => {
                        if (!entry || !entry.id) return;

                        const { isConfirmed } = await Swal.fire({
                            title: 'Delete condition price?',
                            text: 'This action cannot be undone.',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#ef4444',
                            cancelButtonColor: '#6b7280',
                            confirmButtonText: 'Yes, delete',
                        });
                        if (!isConfirmed) return;

                        try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(
                                `${API_BASE_URL}/api/admin/attributes/condition-model-prices/${entry.id}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                    },
                                }
                            );

                            let payload = {};
                            try { payload = await res.json(); } catch { /* empty body */ }

                            if (!res.ok || payload.success === false) {
                                throw new Error(payload.message || 'Failed to delete condition-model price');
                            }

                            setSettings((prev) => {
                                const entries = prev.conditionModelPrices.filter((e) => e.id !== entry.id);
                                const byModel = {};
                                entries.forEach((e) => {
                                    const mid = e.deviceModelId || 'global';
                                    if (!byModel[mid]) byModel[mid] = {};
                                    const cname = e.conditionName || e.condition?.name || e.conditionId || 'unknown';
                                    if (e.price != null) byModel[mid][cname] = e.price;
                                });

                                const firstModelId = Object.keys(byModel).find((k) => k && k !== 'global');
                                const defaultPrices = firstModelId ? byModel[firstModelId] : byModel['global'] || {};

                                return {
                                    ...prev,
                                    conditionModelPrices: entries,
                                    conditionModelPricesMap: byModel,
                                    conditionPrices: { ...prev.conditionPrices, ...defaultPrices },
                                };
                            });

                            await Swal.fire({
                                icon: 'success',
                                title: 'Deleted',
                                text: payload.message || 'Condition model price deleted.',
                                confirmButtonColor: '#0891b2',
                                timer: 2000,
                                showConfirmButton: false,
                            });
                        } catch (err) {
                            await Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: err.message || 'Failed to delete condition price.',
                                confirmButtonColor: '#0891b2',
                            });
                        }
                    }}
                />

                {afterPrice.map(renderSection)}
            </div>

            <AddModal
                title={activeSection?.modalTitle || ''}
                isOpen={!!activeSection}
                fields={activeSection?.fields || []}
                values={modalValues}
                onChange={handleModalChange}
                onSubmit={handleModalSubmit}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default Settings;