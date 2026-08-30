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
  INITIAL_FORM,
  INITIAL_FAQS,
} from "./constants";
import { sortStorageOptionsBySize } from "../../../utils/storageSort";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "https://api.zephyrtechnology.co.uk";

const Addlisting = ({ isEdit = false, listingId = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    seriesId: "",
    deviceModelId: "",
    basePrice: "",
    compareAtPrice: "",
    stockQuantity: "",
    colorIds: [],
    storageOptionIds: [],
    introduction: "",
    listingStatus: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [specifications, setSpecifications] = useState([
    { name: "", value: "" },
  ]);
  const [includedItems, setIncludedItems] = useState([{ label: "" }]);
  const [storagePrices, setStoragePrices] = useState({});
  const [storageCompareAtPrices, setStorageCompareAtPrices] = useState({});
  const [variantStocks, setVariantStocks] = useState({});
  const [variantExpress, setVariantExpress] = useState({});
  const [colorImages, setColorImages] = useState({});
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [deletingImageId, setDeletingImageId] = useState(null);

  // Attribute options from API
  const [categories, setCategories] = useState([]);
  const [allSeries, setAllSeries] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [colors, setColors] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);
  const [storageNameById, setStorageNameById] = useState({});
  const [filteredModels, setFilteredModels] = useState([]);

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
        setColors(data.colors || []);
        const storages = sortStorageOptionsBySize(data.storageOptions || []);
        setStorageOptions(storages);
        setStorageNameById((prev) => {
          const next = { ...prev };
          storages.forEach((storage) => {
            if (storage?.id && storage?.name) next[storage.id] = storage.name;
          });
          return next;
        });
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

  // Drop storage IDs that are no longer in the active master list (soft-deleted duplicates/orphans)
  useEffect(() => {
    if (!storageOptions.length || !formData.storageOptionIds.length) return;
    const knownIds = new Set(storageOptions.map((s) => s.id));
    const pruned = formData.storageOptionIds.filter((id) => knownIds.has(id));
    if (pruned.length === formData.storageOptionIds.length) return;

    setFormData((prev) => ({ ...prev, storageOptionIds: pruned }));
    setStorageStocks((prev) => {
      const next = {};
      pruned.forEach((id) => {
        if (prev[id] !== undefined) next[id] = prev[id];
      });
      return next;
    });
    setStoragePrices((prev) => {
      const next = {};
      pruned.forEach((id) => {
        if (prev[id] !== undefined) next[id] = prev[id];
      });
      return next;
    });
  }, [storageOptions, formData.storageOptionIds]);

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
          const listingStorages = listing.availableStorageOptions || [];
          const listingStorageNames = {};
          listingStorages.forEach((storage) => {
            if (storage?.id && storage?.name) {
              listingStorageNames[storage.id] = storage.name;
            }
          });
          setStorageNameById((prev) => ({ ...prev, ...listingStorageNames }));

          const knownStorageIds = new Set(
            (storageOptions.length
              ? storageOptions
              : Object.keys(listingStorageNames).map((id) => ({ id }))
            ).map((s) => s.id),
          );
          // Prefer master-list IDs only so soft-deleted/orphan storages cannot linger in the form
          const validStorageIds = listingStorages
            .map((storage) => storage.id)
            .filter((id) => listingStorageNames[id])
            .filter((id) =>
              storageOptions.length ? knownStorageIds.has(id) : true,
            );

          setFormData({
            title: listing.title || "",
            categoryId: loadedCategoryId,
            seriesId: listing.series?.id || "",
            deviceModelId: listing.deviceModel?.id || "",
            basePrice: listing.basePrice || "",
            compareAtPrice: listing.compareAtPrice || "",
            stockQuantity: listing.stockQuantity || "",
            colorIds: listing.availableColors?.map((c) => c.id) || [],
            storageOptionIds: validStorageIds,
            introduction: listing.introduction || "",
            listingStatus: listing.listingStatus || "ACTIVE",
          });
          const nextStoragePrices = {};
          const nextStorageCompareAt = {};
          listingStorages.forEach((storage) => {
            if (!listingStorageNames[storage.id]) return;
            nextStoragePrices[storage.id] =
              storage.price != null && Number(storage.price) > 0
                ? String(storage.price)
                : "";
            nextStorageCompareAt[storage.id] =
              storage.compareAtPrice != null && Number(storage.compareAtPrice) > 0
                ? String(storage.compareAtPrice)
                : "";
          });
          setStoragePrices(nextStoragePrices);
          setStorageCompareAtPrices(nextStorageCompareAt);
          const nextVariantStocks = {};
          const nextVariantExpress = {};
          (listing.availableVariantStocks || []).forEach((row) => {
            if (!row?.colorId || !row?.storageOptionId) return;
            const key = `${row.colorId}::${row.storageOptionId}`;
            nextVariantStocks[key] =
              Number(row.stockQuantity) > 0 ? String(row.stockQuantity) : "";
            nextVariantExpress[key] = row.expressDeliveryEnabled !== false;
          });
          // Fallback: if matrix empty, seed from flat color/storage stocks
          if (
            Object.keys(nextVariantStocks).length === 0 &&
            (listing.availableColors || []).length &&
            listingStorages.length
          ) {
            (listing.availableColors || []).forEach((color) => {
              listingStorages.forEach((storage) => {
                if (!listingStorageNames[storage.id]) return;
                const colorStock = Number(color.stockQuantity) || 0;
                const storageStock = Number(storage.stockQuantity) || 0;
                const cell =
                  colorStock > 0
                    ? Math.min(colorStock, storageStock || colorStock)
                    : Math.floor(
                        storageStock /
                          Math.max((listing.availableColors || []).length, 1),
                      );
                nextVariantStocks[`${color.id}::${storage.id}`] =
                  cell > 0 ? String(cell) : "";
                nextVariantExpress[`${color.id}::${storage.id}`] = true;
              });
            });
          }
          setVariantStocks(nextVariantStocks);
          setVariantExpress(nextVariantExpress);
          if (listing.faqs?.length) {
            setFaqs(
              [...listing.faqs].sort(
                (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
              ),
            );
          }
          if (listing.specifications?.length)
            setSpecifications(listing.specifications);
          if (listing.includedItems?.length)
            setIncludedItems(listing.includedItems);

          const groupedImages = {};
          const availableColorIdSet = new Set(
            (listing.availableColors || []).map((color) => color.id),
          );
          (listing.availableColors || []).forEach((color) => {
            groupedImages[color.id] = [];
          });
          const fallbackColorId = listing.availableColors?.[0]?.id;
          (listing.images || []).forEach((img) => {
            let colorId = img.colorId;
            if (colorId && !availableColorIdSet.has(colorId)) {
              return;
            }
            if (!colorId) {
              colorId = fallbackColorId;
            }
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

  // Handle category change
  const handleCategoryChange = (e) => {
    updateField("categoryId", e.target.value);
  };

  const getStoragePriceInputValue = (storageId) => {
    const value = storagePrices[storageId];
    if (value === undefined || value === null || value === "") {
      return "";
    }
    return String(value);
  };

  const handleStoragePriceChange = (storageId, value) => {
    setStoragePrices((prev) => ({ ...prev, [storageId]: value }));
  };

  const getStorageCompareAtInputValue = (storageId) => {
    const value = storageCompareAtPrices[storageId];
    if (value === undefined || value === null || value === "") return "";
    return String(value);
  };

  const handleStorageCompareAtChange = (storageId, value) => {
    setStorageCompareAtPrices((prev) => ({ ...prev, [storageId]: value }));
  };

  const variantStockKey = (colorId, storageId) => `${colorId}::${storageId}`;

  const getVariantStockInputValue = (colorId, storageId) => {
    const value = variantStocks[variantStockKey(colorId, storageId)];
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === 0 ||
      value === "0"
    ) {
      return "";
    }
    return String(value);
  };

  const handleVariantStockChange = (colorId, storageId, value) => {
    setVariantStocks((prev) => ({
      ...prev,
      [variantStockKey(colorId, storageId)]: value,
    }));
  };

  const handleVariantExpressChange = (colorId, storageId, enabled) => {
    setVariantExpress((prev) => ({
      ...prev,
      [variantStockKey(colorId, storageId)]: enabled,
    }));
  };

  const isVariantExpressEnabled = (colorId, storageId) => {
    const key = variantStockKey(colorId, storageId);
    if (Object.prototype.hasOwnProperty.call(variantExpress, key)) {
      return Boolean(variantExpress[key]);
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleMultiToggle = (field, id) => {
    setFormData((prev) => {
      const current = prev[field];
      const isRemoving = current.includes(id);

      if (field === "storageOptionIds") {
        setStoragePrices((prevPrices) => {
          const nextPrices = { ...prevPrices };
          if (isRemoving) {
            delete nextPrices[id];
          } else {
            nextPrices[id] = prevPrices[id] ?? "";
          }
          return nextPrices;
        });
        setVariantStocks((prevStocks) => {
          const next = { ...prevStocks };
          if (isRemoving) {
            Object.keys(next).forEach((key) => {
              if (key.endsWith(`::${id}`)) delete next[key];
            });
          } else {
            prev.colorIds.forEach((colorId) => {
              const key = `${colorId}::${id}`;
              if (next[key] === undefined) next[key] = "";
            });
          }
          return next;
        });
      }

      if (field === "colorIds") {
        setVariantStocks((prevStocks) => {
          const next = { ...prevStocks };
          if (isRemoving) {
            Object.keys(next).forEach((key) => {
              if (key.startsWith(`${id}::`)) delete next[key];
            });
          } else {
            prev.storageOptionIds.forEach((storageId) => {
              const key = `${id}::${storageId}`;
              if (next[key] === undefined) next[key] = "";
            });
          }
          return next;
        });
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

  const moveFaq = (index, direction) => {
    setFaqs((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
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

  const removeImageFromState = (removed, colorId, index) => {
    setColorImages((prev) => {
      if (removed?.id) {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = (next[key] || []).filter((img) => img.id !== removed.id);
        }
        return next;
      }

      return {
        ...prev,
        [colorId]: (prev[colorId] || []).filter((_, i) => i !== index),
      };
    });
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
        const alreadyGone =
          res.status === 404 ||
          /not found/i.test(data.message || "");
        if ((!res.ok || data.success === false) && !alreadyGone) {
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

    removeImageFromState(removed, colorId, index);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    // Client-side validation
    const required = [
      { key: "title", label: "Product Title" },
      { key: "categoryId", label: "Category" },
      { key: "seriesId", label: "Series" },
      { key: "deviceModelId", label: "Model" },
    ];
    const missing = required
      .filter((f) => !formData[f.key])
      .map((f) => f.label);

    if (formData.storageOptionIds.length > 0) {
      const missingStoragePrices = formData.storageOptionIds.filter((storageId) => {
        const storageName =
          storageOptions.find((s) => s.id === storageId)?.name ||
          storageNameById[storageId];
        if (!storageName) return false;
        const price = parseFloat(storagePrices[storageId]);
        return !price || price <= 0;
      });
      if (missingStoragePrices.length > 0) {
        missing.push("Price for each selected storage option");
      }
    } else if (!formData.basePrice) {
      missing.push("Price");
    }

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
      // Listings are category-only — clear any legacy condition on save
      formDataToSend.append("conditionId", "");
      const storageEntries = formData.storageOptionIds.map((storageOptionId) => {
        const compareAt = parseFloat(storageCompareAtPrices[storageOptionId]);
        return {
          storageOptionId,
          stockQuantity: 0,
          price: parseFloat(storagePrices[storageOptionId]) || 0,
          compareAtPrice: compareAt > 0 ? compareAt : null,
        };
      });
      const minStoragePrice = storageEntries.length
        ? Math.min(...storageEntries.map((entry) => entry.price).filter((price) => price > 0))
        : parseFloat(formData.basePrice) || 0;

      formDataToSend.append("basePrice", minStoragePrice);
      if (formData.compareAtPrice) {
        formDataToSend.append("compareAtPrice", formData.compareAtPrice);
      } else {
        formDataToSend.append("compareAtPrice", "");
      }
      formDataToSend.append("storageStocks", JSON.stringify(storageEntries));
      const variantEntries = [];
      formData.colorIds.forEach((colorId) => {
        formData.storageOptionIds.forEach((storageOptionId) => {
          variantEntries.push({
            colorId,
            storageOptionId,
            stockQuantity:
              parseInt(
                variantStocks[`${colorId}::${storageOptionId}`],
                10,
              ) || 0,
            expressDeliveryEnabled: isVariantExpressEnabled(
              colorId,
              storageOptionId,
            ),
          });
        });
      });
      formDataToSend.append("variantStocks", JSON.stringify(variantEntries));
      formDataToSend.append("introduction", formData.introduction);
      formDataToSend.append("listingStatus", formData.listingStatus);

      // Append array fields as JSON strings
      formDataToSend.append("colorIds", JSON.stringify(formData.colorIds));
      formDataToSend.append(
        "storageOptionIds",
        JSON.stringify(formData.storageOptionIds),
      );
      formDataToSend.append(
        "faqs",
        JSON.stringify(
          faqs.map((faq, index) => ({
            question: faq.question,
            answer: faq.answer,
            displayOrder: index,
          })),
        ),
      );
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
          {formData.storageOptionIds.length === 0 && (
            <FormField label="Price">
              <NumberInput
                name="basePrice"
                placeholder="1200000"
                value={formData.basePrice}
                onChange={handleChange}
              />
            </FormField>
          )}
          <FormField label="Retail / RRP (optional)">
            <NumberInput
              name="compareAtPrice"
              placeholder="e.g. 1099"
              value={formData.compareAtPrice}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              Shown with a strikethrough next to the selling price. Must be higher than the selling price. Per-storage RRP can be set below.
            </p>
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
            {formData.storageOptionIds.length > 0 && (
              <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                  Price by Storage
                </p>
                {sortStorageOptionsBySize(
                  formData.storageOptionIds
                    .map((storageId) => {
                      const storageName = storageOptions.find(
                        (s) => s.id === storageId,
                      )?.name;
                      if (!storageName) return null;
                      return { id: storageId, name: storageName };
                    })
                    .filter(Boolean),
                ).map(({ id: storageId, name: storageName }) => {
                  return (
                    <div
                      key={storageId}
                      className="grid grid-cols-1 sm:grid-cols-[7rem_1fr_1fr] items-center gap-3"
                    >
                      <span className="text-sm text-gray-600 shrink-0">
                        {storageName}
                      </span>
                      <NumberInput
                        name={`storage-price-${storageId}`}
                        placeholder="Selling price"
                        value={getStoragePriceInputValue(storageId)}
                        onChange={(e) =>
                          handleStoragePriceChange(storageId, e.target.value)
                        }
                      />
                      <NumberInput
                        name={`storage-rrp-${storageId}`}
                        placeholder="RRP (optional)"
                        value={getStorageCompareAtInputValue(storageId)}
                        onChange={(e) =>
                          handleStorageCompareAtChange(storageId, e.target.value)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </FormField>
        </div>

        {formData.colorIds.length > 0 &&
          formData.storageOptionIds.length > 0 && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 overflow-x-auto">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Stock by Color × Storage
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Each cell is stock for that exact color and storage combination.
                Tick <strong>Express</strong> only when that variant is ready to ship immediately.
              </p>
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-gray-600 font-medium border-b border-gray-200">
                      Storage
                    </th>
                    {formData.colorIds.map((colorId) => (
                      <th
                        key={colorId}
                        className="p-2 text-gray-600 font-medium border-b border-gray-200 text-center whitespace-nowrap"
                      >
                        {colors.find((c) => c.id === colorId)?.name || colorId}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortStorageOptionsBySize(
                    formData.storageOptionIds
                      .map((storageId) => {
                        const storageName = storageOptions.find(
                          (s) => s.id === storageId,
                        )?.name;
                        if (!storageName) return null;
                        return { id: storageId, name: storageName };
                      })
                      .filter(Boolean),
                  ).map(({ id: storageId, name: storageName }) => (
                    <tr key={storageId}>
                      <td className="p-2 text-gray-600 whitespace-nowrap border-b border-gray-100 align-top">
                        {storageName}
                      </td>
                      {formData.colorIds.map((colorId) => (
                        <td
                          key={`${colorId}-${storageId}`}
                          className="p-2 border-b border-gray-100 min-w-[6.5rem] align-top"
                        >
                          <NumberInput
                            name={`variant-stock-${colorId}-${storageId}`}
                            placeholder="0"
                            value={getVariantStockInputValue(
                              colorId,
                              storageId,
                            )}
                            onChange={(e) =>
                              handleVariantStockChange(
                                colorId,
                                storageId,
                                e.target.value,
                              )
                            }
                          />
                          <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-600">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              checked={isVariantExpressEnabled(colorId, storageId)}
                              onChange={(e) =>
                                handleVariantExpressChange(
                                  colorId,
                                  storageId,
                                  e.target.checked,
                                )
                              }
                            />
                            Express
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
              total={faqs.length}
              onQuestionChange={handleFaqQuestionChange}
              onAnswerChange={handleFaqAnswerChange}
              onRemove={handleRemoveFaq}
              onMoveUp={() => moveFaq(index, -1)}
              onMoveDown={() => moveFaq(index, 1)}
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
