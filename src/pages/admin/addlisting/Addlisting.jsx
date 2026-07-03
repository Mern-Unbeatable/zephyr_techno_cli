import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import AdminDashboardTitle from "../../../components/dashboards/AdminDashboardTitle";
import FormField from "./components/FormField";
import TextInput from "./components/TextInput";
import NumberInput from "./components/NumberInput";
import SelectInput from "./components/SelectInput";
import Textarea from "./components/Textarea";
import FaqItem from "./components/FaqItem";
import TechnicalSpecItem from "./components/TechnicalSpecItem";
import IncludedItem from "./components/IncludedItem";
import ImageUpload from "./components/ImageUpload";
import {
  CATEGORY_OPTIONS,
  SERIES_OPTIONS,
  MODEL_OPTIONS,
  CONDITION_OPTIONS,
  COLOR_OPTIONS,
  STORAGE_OPTIONS,
  RAM_OPTIONS,
  INITIAL_FORM,
  INITIAL_FAQS,
} from "./constants";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "https://api-zephyr-techno.maktechgroup.tech";

const Addlisting = ({ isEdit = false, listingId = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    seriesId: "",
    deviceModelId: "",
    conditionId: "",
    basePrice: "",
    stockQuantity: "",
    colorIds: [],
    storageOptionIds: [],
    ramOptionIds: [],
    introduction: "",
    listingStatus: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [specifications, setSpecifications] = useState([
    { name: "", value: "" },
  ]);
  const [includedItems, setIncludedItems] = useState([{ label: "" }]);
  const [colorImages, setColorImages] = useState({});
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [deletingImageId, setDeletingImageId] = useState(null);

  // Attribute options from API
  const [categories, setCategories] = useState([]);
  const [allSeries, setAllSeries] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [colors, setColors] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);
  const [ramOptions, setRamOptions] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);

  // Category-condition business rules
  const [availableConditions, setAvailableConditions] = useState([]);
  const [conditionDisabled, setConditionDisabled] = useState(false);

  // Fetch all attribute options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/admin/attributes/all-options`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        let payload = {};
        try {
          payload = await res.json();
        } catch {
          /* empty */
        }
        if (!res.ok || payload.success === false)
          throw new Error("Failed to load options");

        const data = payload.data;
        setCategories(data.categories || []);
        setAllSeries(data.series || []);
        setAllModels(data.models || []);
        setConditions(data.conditions || []);
        setAvailableConditions(data.conditions || []);
        setColors(data.colors || []);
        setStorageOptions(data.storageOptions || []);
        setRamOptions(data.ramOptions || []);
      } catch (err) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message,
          confirmButtonColor: "#0891b2",
        });
      }
    };
    fetchOptions();
  }, []);

  // Filter models when series changes
  useEffect(() => {
    if (formData.seriesId) {
      const filtered = allModels.filter(
        (m) => m.seriesId === formData.seriesId,
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels([]);
    }
  }, [formData.seriesId, allModels]);

  // Apply category-condition rules when formData.categoryId is available
  // Ensure same behavior for add and edit: when category is 'New' condition is disabled
  useEffect(() => {
    if (!conditions.length || !formData.categoryId) return;
    const category = categories.find((cat) => cat.id === formData.categoryId);
    const categoryName = category?.name?.toLowerCase();

    if (categoryName === "new") {
      // For 'New' category, no condition should be required
      setAvailableConditions([]);
      setConditionDisabled(true);
      updateField("conditionId", "");
    } else if (categoryName === 'used' || categoryName === 'old') {
      // For used/old, exclude 'New' and 'Brand New (Sealed)' condition options
      const usedConditions = conditions.filter(c => {
          const cName = c.name?.toLowerCase() || '';
          return cName !== 'new' && cName !== 'brand new (sealed)';
      });
      setAvailableConditions(usedConditions);
      setConditionDisabled(false);
      // If currently empty, pick the first available used condition
      if (!formData.conditionId)
        updateField("conditionId", usedConditions[0]?.id || "");
    } else {
      // Default: show all conditions and enable selection
      setAvailableConditions(conditions);
      setConditionDisabled(false);
      if (!formData.conditionId)
        updateField("conditionId", conditions[0]?.id || "");
    }
  }, [conditions, categories, formData.categoryId]);

  // Fetch listing data when in edit mode
  useEffect(() => {
    if (isEdit && listingId) {
      const fetchListing = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `${API_BASE_URL}/api/admin/products/${listingId}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
          );
          let payload = {};
          try {
            payload = await res.json();
          } catch {
            /* empty */
          }
          if (!res.ok || payload.success === false)
            throw new Error(payload.message || "Failed to load listing");

          const listing = payload.data;
          // Map API data to form structure
          const loadedCategoryId = listing.category?.id || "";
          setFormData({
            title: listing.title || "",
            categoryId: loadedCategoryId,
            seriesId: listing.series?.id || "",
            deviceModelId: listing.deviceModel?.id || "",
            conditionId: listing.condition?.id || "",
            basePrice: listing.basePrice || "",
            stockQuantity: listing.stockQuantity || "",
            colorIds: listing.availableColors?.map((c) => c.id) || [],
            storageOptionIds:
              listing.availableStorageOptions?.map((s) => s.id) || [],
            ramOptionIds: listing.availableRamOptions?.map((r) => r.id) || [],
            introduction: listing.introduction || "",
            listingStatus: listing.listingStatus || "ACTIVE",
          });
          if (listing.faqs?.length) setFaqs(listing.faqs);
          if (listing.specifications?.length)
            setSpecifications(listing.specifications);
          if (listing.includedItems?.length)
            setIncludedItems(listing.includedItems);

          const groupedImages = {};
          (listing.availableColors || []).forEach((color) => {
            groupedImages[color.id] = [];
          });
          const fallbackColorId = listing.availableColors?.[0]?.id;
          (listing.images || []).forEach((img) => {
            const colorId = img.colorId || fallbackColorId;
            if (!colorId) return;
            if (!groupedImages[colorId]) groupedImages[colorId] = [];
            groupedImages[colorId].push({
              id: img.id,
              imageUrl: img.imageUrl,
              displayOrder: img.displayOrder,
            });
          });
          setColorImages(groupedImages);
          setRemovedImageIds([]);
        } catch (err) {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: err.message,
            confirmButtonColor: "#0891b2",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchListing();
    }
  }, [isEdit, listingId]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category change with business rules
  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    updateField("categoryId", selectedCategoryId);

    const category = categories.find((cat) => cat.id === selectedCategoryId);
    const categoryName = category?.name?.toLowerCase();

    if (categoryName === "new") {
      setAvailableConditions([]);
      setConditionDisabled(true);
      updateField("conditionId", "");
    } else if (categoryName === 'used' || categoryName === 'old') {
      const usedConditions = conditions.filter(c => {
          const cName = c.name?.toLowerCase() || '';
          return cName !== 'new' && cName !== 'brand new (sealed)';
      });
      setAvailableConditions(usedConditions);
      setConditionDisabled(false);
      updateField("conditionId", usedConditions[0]?.id || "");
    } else {
      setAvailableConditions(conditions);
      setConditionDisabled(false);
      updateField("conditionId", conditions[0]?.id || "");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleMultiToggle = (field, id) => {
    setFormData((prev) => {
      const current = prev[field];
      const isRemoving = current.includes(id);

      if (field === "colorIds") {
        if (isRemoving) {
          const removedExisting = (colorImages[id] || [])
            .filter((img) => img.id)
            .map((img) => img.id);
          if (removedExisting.length > 0) {
            setRemovedImageIds((prevRemoved) => [
              ...new Set([...prevRemoved, ...removedExisting]),
            ]);
          }
          setColorImages((prevImages) => {
            const next = { ...prevImages };
            delete next[id];
            return next;
          });
        } else {
          setColorImages((prevImages) => ({
            ...prevImages,
            [id]: prevImages[id] || [],
          }));
        }
      }

      return {
        ...prev,
        [field]: isRemoving
          ? current.filter((v) => v !== id)
          : [...current, id],
      };
    });
  };

  const handleFaqQuestionChange = (index, value) => {
    const updated = [...faqs];
    updated[index].question = value;
    setFaqs(updated);
  };

  const handleFaqAnswerChange = (index, value) => {
    const updated = [...faqs];
    updated[index].answer = value;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);

  const handleTechnicalSpecSpecificationChange = (index, value) => {
    const updated = [...specifications];
    updated[index].name = value;
    setSpecifications(updated);
  };

  const handleTechnicalSpecValueChange = (index, value) => {
    const updated = [...specifications];
    updated[index].value = value;
    setSpecifications(updated);
  };

  const handleRemoveTechnicalSpec = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const addTechnicalSpec = () =>
    setSpecifications([...specifications, { name: "", value: "" }]);

  const handleIncludedLabelChange = (index, value) => {
    const updated = [...includedItems];
    updated[index].label = value;
    setIncludedItems(updated);
  };

  const handleRemoveIncludedItem = (index) => {
    setIncludedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addIncludedItem = () =>
    setIncludedItems([...includedItems, { label: "" }]);

  const handleColorImageAdd = (colorId, files) => {
    const wrapped = files.map((file) => ({ file }));
    setColorImages((prev) => ({
      ...prev,
      [colorId]: [...(prev[colorId] || []), ...wrapped],
    }));
  };

  const handleColorImageRemove = async (colorId, index) => {
    const items = colorImages[colorId] || [];
    const removed = items[index];
    if (!removed) return;

    if (isEdit && removed.id && listingId) {
      const result = await Swal.fire({
        title: "Delete image?",
        text: "This image will be removed from the listing.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Delete",
      });
      if (!result.isConfirmed) return;

      setDeletingImageId(removed.id);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/admin/products/${listingId}/gallery/${removed.id}`,
          {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        let data = {};
        try {
          data = await res.json();
        } catch {
          /* empty */
        }
        if (!res.ok || data.success === false) {
          throw new Error(data.message || "Failed to delete image");
        }
      } catch (err) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message,
          confirmButtonColor: "#0891b2",
        });
        return;
      } finally {
        setDeletingImageId(null);
      }
    } else if (removed?.id) {
      setRemovedImageIds((prevRemoved) => [
        ...new Set([...prevRemoved, removed.id]),
      ]);
    }

    setColorImages((prev) => ({
      ...prev,
      [colorId]: (prev[colorId] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    // Client-side validation
    const required = [
      { key: "title", label: "Product Title" },
      { key: "categoryId", label: "Category" },
      { key: "seriesId", label: "Series" },
      { key: "deviceModelId", label: "Model" },
      ...(!conditionDisabled
        ? [{ key: "conditionId", label: "Condition" }]
        : []),
      { key: "basePrice", label: "Price" },
    ];
    const missing = required
      .filter((f) => !formData[f.key])
      .map((f) => f.label);
    if (missing.length > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: `Please fill in: ${missing.join(", ")}`,
        confirmButtonColor: "#0891b2",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Append text fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("seriesId", formData.seriesId);
      formDataToSend.append("deviceModelId", formData.deviceModelId);
      if (formData.conditionId)
        formDataToSend.append("conditionId", formData.conditionId);
      formDataToSend.append("basePrice", formData.basePrice);
      formDataToSend.append("stockQuantity", formData.stockQuantity);
      formDataToSend.append("introduction", formData.introduction);
      formDataToSend.append("listingStatus", formData.listingStatus);

      // Append array fields as JSON strings
      formDataToSend.append("colorIds", JSON.stringify(formData.colorIds));
      formDataToSend.append(
        "storageOptionIds",
        JSON.stringify(formData.storageOptionIds),
      );
      formDataToSend.append(
        "ramOptionIds",
        JSON.stringify(formData.ramOptionIds),
      );
      formDataToSend.append("faqs", JSON.stringify(faqs));
      formDataToSend.append("specifications", JSON.stringify(specifications));
      formDataToSend.append(
        "includedItems",
        JSON.stringify(includedItems.filter((item) => item.label?.trim())),
      );
      formDataToSend.append("highlights", JSON.stringify([]));

      const newFiles = [];
      const imageMeta = [];
      const keptImages = [];

      formData.colorIds.forEach((colorId) => {
        (colorImages[colorId] || []).forEach((item, index) => {
          if (item.file) {
            newFiles.push(item.file);
            imageMeta.push({ colorId, displayOrder: index });
          } else if (item.id) {
            keptImages.push({
              id: item.id,
              colorId,
              displayOrder: index,
            });
          }
        });
      });

      newFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });
      if (imageMeta.length > 0) {
        formDataToSend.append("imageMeta", JSON.stringify(imageMeta));
      }
      if (isEdit) {
        formDataToSend.append("keptImages", JSON.stringify(keptImages));
        formDataToSend.append(
          "removedImageIds",
          JSON.stringify(removedImageIds),
        );
      }

      const url = isEdit
        ? `${API_BASE_URL}/api/admin/products/${listingId}`
        : `${API_BASE_URL}/api/admin/products`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formDataToSend,
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        /* empty */
      }
      if (!res.ok || data.success === false)
        throw new Error(
          data.message || `Failed to ${isEdit ? "update" : "create"} listing`,
        );

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `Listing ${isEdit ? "updated" : "created"} successfully.`,
        confirmButtonColor: "#0891b2",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/dashboard/admin/listing");
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: "#0891b2",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
  };

  if (loading && isEdit) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading listing...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pb-3">
        <p className="text-xs text-gray-400 mb-2">
          Listing &gt; {isEdit ? "Edit" : "Create"} Listing
        </p>
        <Link
          to="/dashboard/admin/listing"
          className="text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
        >
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="pb-10">
        <AdminDashboardTitle
          title={isEdit ? "Edit Listing" : "Add New Listing"}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormField label="Product Title">
            <TextInput
              name="title"
              placeholder="E.g. iPhone 15 Pro Max"
              value={formData.title}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Category">
            <SelectInput
              name="categoryId"
              value={formData.categoryId}
              onChange={handleCategoryChange}
              options={[
                { value: "", label: "Select Category" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </FormField>
          <FormField label="Series">
            <SelectInput
              name="seriesId"
              value={formData.seriesId}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Series" },
                ...allSeries.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormField label="Model">
            <SelectInput
              name="deviceModelId"
              value={formData.deviceModelId}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Model" },
                ...filteredModels.map((m) => ({ value: m.id, label: m.name })),
              ]}
              disabled={!formData.seriesId}
            />
          </FormField>
          {!conditionDisabled && (
            <FormField label="Condition">
              <SelectInput
                name="conditionId"
                value={formData.conditionId}
                onChange={handleChange}
                disabled={false}
                options={[
                  { value: "", label: "Select Condition" },
                  ...availableConditions.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                ]}
              />
            </FormField>
          )}
          <FormField label="Price">
            <NumberInput
              name="basePrice"
              placeholder="1200000"
              value={formData.basePrice}
              onChange={handleChange}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField label="Color">
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.colorIds.includes(c.id)}
                    onChange={() => handleMultiToggle("colorIds", c.id)}
                    className="accent-teal-600"
                  />
                  <span className="text-base text-gray-700">{c.name}</span>
                </label>
              ))}
              {colors.length === 0 && (
                <span className="text-sm text-gray-400">
                  No colors available
                </span>
              )}
            </div>
          </FormField>
          <FormField label="Stock Quantity">
            <NumberInput
              name="stockQuantity"
              placeholder="0"
              value={formData.stockQuantity}
              onChange={handleChange}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField label="Storage Options">
            <div className="flex flex-wrap gap-2">
              {storageOptions.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.storageOptionIds.includes(s.id)}
                    onChange={() => handleMultiToggle("storageOptionIds", s.id)}
                    className="accent-teal-600"
                  />
                  <span className="text-base text-gray-700">{s.name}</span>
                </label>
              ))}
              {storageOptions.length === 0 && (
                <span className="text-sm text-gray-400">
                  No storage options
                </span>
              )}
            </div>
          </FormField>
          <FormField label="RAM Options">
            <div className="flex flex-wrap gap-2">
              {ramOptions.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.ramOptionIds.includes(r.id)}
                    onChange={() => handleMultiToggle("ramOptionIds", r.id)}
                    className="accent-teal-600"
                  />
                  <span className="text-base text-gray-700">{r.name}</span>
                </label>
              ))}
              {ramOptions.length === 0 && (
                <span className="text-sm text-gray-400">No RAM options</span>
              )}
            </div>
          </FormField>
        </div>

        <div className="mb-6">
          <FormField label="Introduction">
            <Textarea
              name="introduction"
              placeholder="Write something about the phone..."
              value={formData.introduction}
              onChange={handleChange}
              rows={4}
            />
          </FormField>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Frequently Asked Question
          </h2>
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              index={index}
              faq={faq}
              onQuestionChange={handleFaqQuestionChange}
              onAnswerChange={handleFaqAnswerChange}
              onRemove={handleRemoveFaq}
            />
          ))}
          <button
            type="button"
            onClick={addFaq}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium mt-1 cursor-pointer"
          >
            Add Another Question
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Technical Specifications
          </h2>
          {specifications.map((spec, index) => (
            <TechnicalSpecItem
              key={index}
              index={index}
              spec={spec}
              onSpecificationChange={handleTechnicalSpecSpecificationChange}
              onValueChange={handleTechnicalSpecValueChange}
              onRemove={handleRemoveTechnicalSpec}
            />
          ))}
          <button
            type="button"
            onClick={addTechnicalSpec}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium mt-1 cursor-pointer"
          >
            Add Another Specification
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            What&apos;s Included
          </h2>
          {includedItems.map((item, index) => (
            <IncludedItem
              key={index}
              index={index}
              item={item}
              onLabelChange={handleIncludedLabelChange}
              onRemove={handleRemoveIncludedItem}
            />
          ))}
          <button
            type="button"
            onClick={addIncludedItem}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium mt-1 cursor-pointer"
          >
            Add Another Item
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Product Images by Color
          </h2>
          {formData.colorIds.length === 0 ? (
            <p className="text-sm text-gray-400">
              Select at least one color to upload images.
            </p>
          ) : (
            <div className="space-y-6">
              {formData.colorIds.map((colorId) => {
                const color = colors.find((c) => c.id === colorId);
                return (
                  <FormField
                    key={colorId}
                    label={`${color?.name || "Color"} Images`}
                  >
                    <ImageUpload
                      images={colorImages[colorId] || []}
                      deletingImageId={deletingImageId}
                      onFilesAdded={(files) =>
                        handleColorImageAdd(colorId, files)
                      }
                      onRemove={(index) =>
                        handleColorImageRemove(colorId, index)
                      }
                    />
                  </FormField>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="btn-custom text-white text-sm font-medium py-2 px-6 rounded-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Save"}
        </button>
      </form>
    </div>
  );
};

export default Addlisting;
