import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';
import FormField from "./components/FormField";
import TextInput from "./components/TextInput";
import SelectInput from "./components/SelectInput";
import DateInput from "./components/DateInput";
import SegmentedControl from "./components/SegmentedControl";
import ProductTagList from "./components/ProductTagList";
import {
  DISCOUNT_TYPES,
  INITIAL_FORM,
  INITIAL_PRODUCTS,
} from "./constants";

const CreatePromo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedProducts, setSelectedProducts] = useState(INITIAL_PRODUCTS);
  const [series, setSeries] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch series (categories) on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/admin/attributes/series`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((payload) => { if (payload.success) setSeries(payload.data || []); })
      .catch(() => {});
  }, []);

  // Fetch models when category (seriesId) changes
  useEffect(() => {
    if (!formData.applicableCategory) { setModels([]); return; }
    setLoadingModels(true);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/admin/attributes/models?seriesId=${formData.applicableCategory}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((payload) => { if (payload.success) setModels(payload.data || []); })
      .catch(() => {})
      .finally(() => setLoadingModels(false));
  }, [formData.applicableCategory]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateField(name, type === "checkbox" ? checked : value);
  };

  const handleCategoryChange = (e) => {
    updateField("applicableCategory", e.target.value);
    updateField("applicableProduct", "");
    setSelectedProducts([]);
  };

  const handleProductSelect = (e) => {
    const modelId = e.target.value;
    if (!modelId) return;
    const model = models.find((m) => m.id === modelId);
    if (!model) return;
    updateField("applicableProduct", modelId);
    if (!selectedProducts.some((p) => p.id === modelId)) {
      setSelectedProducts((prev) => [...prev, { id: model.id, name: model.name }]);
    }
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const discountTypeMap = { percentage: 'PERCENTAGE', fixed: 'FIXED_AMOUNT' };
    const payload = {
      code: formData.promoCode,
      discountType: discountTypeMap[formData.discountType] || formData.discountType.toUpperCase(),
      discountValue: String(formData.discountValue),
      minOrderValue: formData.minimumOrder || '0',
      maxUsageCount: formData.unlimited ? null : (parseInt(formData.usageLimit) || 100),
      startDate: new Date().toISOString(),
      expiryDate: formData.expiryDate
        ? new Date(formData.expiryDate).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      applicableModelIds: selectedProducts.map((p) => p.id),
    };
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/promocodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      let data = {};
      try { data = await res.json(); } catch { /* empty */ }
      if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to create promo code');
      await Swal.fire({
        icon: 'success',
        title: 'Created!',
        text: data.message || 'Promo code created successfully.',
        confirmButtonColor: '#0891b2',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/dashboard/admin/promo-code');
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to create promo code.',
        confirmButtonColor: '#0891b2',
      });
    }
  };

  const isPercentage = formData.discountType === "percentage";

  return (
    <div className="">
      <p className="mb-4 text-sm text-gray-500">
        Promo Code &gt; Create Promo Code
      </p>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-3 flex items-center gap-1.5 text-sm font-medium text-cyan-500 hover:text-cyan-600"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Create Promo Code
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Promo Code">
          <TextInput
            name="promoCode"
            value={formData.promoCode}
            onChange={handleChange}
            placeholder="SAVE10"
          />
        </FormField>

        <FormField label="Discount Type">
          <SegmentedControl
            options={DISCOUNT_TYPES}
            value={formData.discountType}
            onChange={(value) => updateField("discountType", value)}
          />
        </FormField>

        <FormField label="Discount Value">
          <TextInput
            type="number"
            name="discountValue"
            value={formData.discountValue}
            onChange={handleChange}
            placeholder={isPercentage ? "10" : "10"}
            min="0"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <FormField label="Minimum Order Amount">
            <TextInput
              type="number"
              name="minimumOrder"
              value={formData.minimumOrder}
              onChange={handleChange}
              placeholder="50"
              min="0"
            />
          </FormField>

          <FormField label="Expiry Date">
            <DateInput
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            label="Usage Limit"
            action={
              <label className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="unlimited"
                  checked={formData.unlimited}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 accent-cyan-500"
                />
                Unlimited
              </label>
            }
          >
            <TextInput
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="100"
              min="1"
              disabled={formData.unlimited}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* <FormField label="Applicable Users">
            <SelectInput
              name="applicableUsers"
              value={formData.applicableUsers}
              onChange={handleChange}
              options={USER_OPTIONS}
            />
          </FormField> */}

          <FormField label="Applicable Category">
            <SelectInput
              name="applicableCategory"
              value={formData.applicableCategory}
              onChange={handleCategoryChange}
              options={series.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Select category"
            />
          </FormField>
          <FormField label="Applicable Product">
            <SelectInput
              name="applicableProduct"
              value={formData.applicableProduct}
              onChange={handleProductSelect}
              options={models.map((m) => ({ value: m.id, label: m.name }))}
              placeholder={loadingModels ? 'Loading...' : 'Select product'}
              disabled={!formData.applicableCategory || loadingModels}
            />
            <ProductTagList
              products={selectedProducts}
              onRemove={handleRemoveProduct}
            />
          </FormField>
        </div>

        {/* <FormField label="Applicable Product">
          <SelectInput
            name="applicableProduct"
            value={formData.applicableProduct}
            onChange={handleProductSelect}
            options={PRODUCT_OPTIONS}
          />
          <ProductTagList
            products={selectedProducts}
            onRemove={handleRemoveProduct}
          />
        </FormField> */}

        <div className="flex justify-end gap-3  pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-600 transition"
          >
            Create Promo Code
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePromo;
