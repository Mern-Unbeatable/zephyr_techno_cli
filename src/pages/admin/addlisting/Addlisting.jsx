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
import { sortStorageOptionsBySize, formatStorageLabel } from "../../../utils/storageSort";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "https://api.zephyrtechnology.co.uk";

/** Cell key: conditionCategoryId (or '') × colorId × storageOptionId */
const variantCellKey = (conditionCategoryId, colorId, storageId) =>
  `${conditionCategoryId || ""}::${colorId}::${storageId}`;

const buildMatrixKeys = (conditionIds, colorIds, storageIds) => {
  if (!colorIds.length || !storageIds.length) return [];
  const conditions = conditionIds.length ? conditionIds : [null];
  const keys = [];
  conditions.forEach((conditionId) => {
    colorIds.forEach((colorId) => {
      storageIds.forEach((storageId) => {
        keys.push(variantCellKey(conditionId, colorId, storageId));
      });
    });
  });
  return keys;
};

const seedMapForKeys = (prev, keys, defaultValue) => {
  const next = {};
  keys.forEach((key) => {
    next[key] = Object.prototype.hasOwnProperty.call(prev, key)
      ? prev[key]
      : defaultValue;
  });
  return next;
};

/** Prefer "New (Sealed)", else any category name containing "sealed". */
const findSealedCategory = (categoryList = []) => {
  if (!Array.isArray(categoryList) || !categoryList.length) return null;
  const normalized = categoryList.map((c) => ({
    ...c,
    nameNorm: String(c?.name || "")
      .trim()
      .toLowerCase(),
  }));
  const exactNewSealed = normalized.find(
    (c) =>
      c.nameNorm === "new (sealed)" ||
      c.nameNorm === "new sealed" ||
      c.nameNorm.includes("new (sealed)"),
  );
  if (exactNewSealed) return exactNewSealed;
  return normalized.find((c) => /sealed/i.test(c.nameNorm)) || null;
};

/**
 * Copy ""::color::storage (no-condition) cells into conditionId::color::storage
 * when those condition cells are still empty / newly seeded.
 */
const bridgeLegacyMatrixMap = (
  prev,
  next,
  conditionIds,
  colorIds,
  storageIds,
  { isEmpty, copyOnlyIfNewKey = false } = {},
) => {
  if (!conditionIds.length || !colorIds.length || !storageIds.length) {
    return next;
  }

  colorIds.forEach((colorId) => {
    storageIds.forEach((storageId) => {
      const legacyKey = variantCellKey(null, colorId, storageId);
      if (!Object.prototype.hasOwnProperty.call(prev, legacyKey)) return;

      conditionIds.forEach((conditionId) => {
        const key = variantCellKey(conditionId, colorId, storageId);
        if (copyOnlyIfNewKey) {
          if (Object.prototype.hasOwnProperty.call(prev, key)) return;
          next[key] = prev[legacyKey];
          return;
        }
        if (isEmpty?.(next[key])) {
          next[key] = prev[legacyKey];
        }
      });
    });
  });

  return next;
};

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
  const [conditionCategoryIds, setConditionCategoryIds] = useState([]);
  const [variantStocks, setVariantStocks] = useState({});
  const [variantPrices, setVariantPrices] = useState({});
  const [variantCompareAt, setVariantCompareAt] = useState({});
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
        const loadedCategories = data.categories || [];
        setCategories(loadedCategories);
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

        // New listings: default-tick New (Sealed) so matrix keys use the condition
        // namespace from the start (avoids wiping prices on first condition tick).
        if (!isEdit) {
          const sealed = findSealedCategory(loadedCategories);
          if (sealed?.id) {
            setConditionCategoryIds((prev) =>
              prev.length > 0 ? prev : [sealed.id],
            );
            setFormData((prev) =>
              prev.categoryId ? prev : { ...prev, categoryId: sealed.id },
            );
          }
        }
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
  }, [isEdit]);

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
    const keys = buildMatrixKeys(
      conditionCategoryIds,
      formData.colorIds,
      pruned,
    );
    setVariantStocks((prev) => seedMapForKeys(prev, keys, ""));
    setVariantPrices((prev) => seedMapForKeys(prev, keys, ""));
    setVariantCompareAt((prev) => seedMapForKeys(prev, keys, ""));
    setVariantExpress((prev) => seedMapForKeys(prev, keys, true));
  }, [
    storageOptions,
    formData.storageOptionIds,
    formData.colorIds,
    conditionCategoryIds,
  ]);

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

          const listingConditions = listing.availableConditions || [];
          const nextConditionIds = listingConditions
            .map((row) => row.id)
            .filter(Boolean);
          setConditionCategoryIds(nextConditionIds);

          const loadedColorIds =
            listing.availableColors?.map((c) => c.id) || [];
          const nextVariantStocks = {};
          const nextVariantPrices = {};
          const nextVariantCompareAt = {};
          const nextVariantExpress = {};
          (listing.availableVariantStocks || []).forEach((row) => {
            if (!row?.colorId || !row?.storageOptionId) return;
            const key = variantCellKey(
              row.conditionCategoryId,
              row.colorId,
              row.storageOptionId,
            );
            nextVariantStocks[key] =
              Number(row.stockQuantity) > 0 ? String(row.stockQuantity) : "";
            nextVariantPrices[key] =
              row.price != null && Number(row.price) > 0
                ? String(row.price)
                : "";
            nextVariantCompareAt[key] =
              row.compareAtPrice != null && Number(row.compareAtPrice) > 0
                ? String(row.compareAtPrice)
                : "";
            nextVariantExpress[key] = row.expressDeliveryEnabled !== false;
          });

          // Fallback: seed empty matrix from flat color/storage stocks
          const desiredKeys = buildMatrixKeys(
            nextConditionIds,
            loadedColorIds,
            validStorageIds,
          );
          if (
            Object.keys(nextVariantStocks).length === 0 &&
            desiredKeys.length > 0
          ) {
            const listingStoragesForFallback = listingStorages.filter((s) =>
              listingStorageNames[s.id],
            );
            loadedColorIds.forEach((colorId) => {
              const color = (listing.availableColors || []).find(
                (c) => c.id === colorId,
              );
              listingStoragesForFallback.forEach((storage) => {
                const colorStock = Number(color?.stockQuantity) || 0;
                const storageStock = Number(storage.stockQuantity) || 0;
                const cellStock =
                  colorStock > 0
                    ? Math.min(colorStock, storageStock || colorStock)
                    : Math.floor(
                        storageStock / Math.max(loadedColorIds.length, 1),
                      );
                const storagePrice =
                  storage.price != null && Number(storage.price) > 0
                    ? String(storage.price)
                    : "";
                const storageCompare =
                  storage.compareAtPrice != null &&
                  Number(storage.compareAtPrice) > 0
                    ? String(storage.compareAtPrice)
                    : "";
                const conditions =
                  nextConditionIds.length > 0 ? nextConditionIds : [null];
                conditions.forEach((conditionId) => {
                  const key = variantCellKey(
                    conditionId,
                    colorId,
                    storage.id,
                  );
                  nextVariantStocks[key] =
                    cellStock > 0 ? String(cellStock) : "";
                  nextVariantPrices[key] = storagePrice;
                  nextVariantCompareAt[key] = storageCompare;
                  nextVariantExpress[key] = true;
                });
              });
            });
          }

          // Ensure every current combo has a key (seed blanks for missing)
          desiredKeys.forEach((key) => {
            if (nextVariantStocks[key] === undefined) nextVariantStocks[key] = "";
            if (nextVariantPrices[key] === undefined) nextVariantPrices[key] = "";
            if (nextVariantCompareAt[key] === undefined)
              nextVariantCompareAt[key] = "";
            if (nextVariantExpress[key] === undefined)
              nextVariantExpress[key] = true;
          });

          // Bridge legacy color×storage rows (no conditionCategoryId) into each condition
          if (nextConditionIds.length > 0) {
            loadedColorIds.forEach((colorId) => {
              validStorageIds.forEach((storageId) => {
                const legacyKey = variantCellKey(null, colorId, storageId);
                const hasLegacy =
                  nextVariantPrices[legacyKey] ||
                  nextVariantStocks[legacyKey] ||
                  nextVariantCompareAt[legacyKey] ||
                  Object.prototype.hasOwnProperty.call(
                    nextVariantExpress,
                    legacyKey,
                  );
                if (!hasLegacy) return;
                nextConditionIds.forEach((conditionId) => {
                  const key = variantCellKey(conditionId, colorId, storageId);
                  if (!nextVariantPrices[key]) {
                    nextVariantPrices[key] = nextVariantPrices[legacyKey] || "";
                  }
                  if (!nextVariantStocks[key]) {
                    nextVariantStocks[key] = nextVariantStocks[legacyKey] || "";
                  }
                  if (!nextVariantCompareAt[key]) {
                    nextVariantCompareAt[key] =
                      nextVariantCompareAt[legacyKey] || "";
                  }
                  if (
                    !Object.prototype.hasOwnProperty.call(
                      nextVariantExpress,
                      key,
                    ) &&
                    Object.prototype.hasOwnProperty.call(
                      nextVariantExpress,
                      legacyKey,
                    )
                  ) {
                    nextVariantExpress[key] = nextVariantExpress[legacyKey];
                  }
                });
              });
            });
          }

          setVariantStocks(nextVariantStocks);
          setVariantPrices(nextVariantPrices);
          setVariantCompareAt(nextVariantCompareAt);
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

  const syncMatrixMaps = (conditionIds, colorIds, storageIds) => {
    const keys = buildMatrixKeys(conditionIds, colorIds, storageIds);
    const isBlank = (value) =>
      value === undefined || value === null || value === "";

    setVariantStocks((prev) =>
      bridgeLegacyMatrixMap(
        prev,
        seedMapForKeys(prev, keys, ""),
        conditionIds,
        colorIds,
        storageIds,
        { isEmpty: isBlank },
      ),
    );
    setVariantPrices((prev) =>
      bridgeLegacyMatrixMap(
        prev,
        seedMapForKeys(prev, keys, ""),
        conditionIds,
        colorIds,
        storageIds,
        { isEmpty: isBlank },
      ),
    );
    setVariantCompareAt((prev) =>
      bridgeLegacyMatrixMap(
        prev,
        seedMapForKeys(prev, keys, ""),
        conditionIds,
        colorIds,
        storageIds,
        { isEmpty: isBlank },
      ),
    );
    setVariantExpress((prev) =>
      bridgeLegacyMatrixMap(
        prev,
        seedMapForKeys(prev, keys, true),
        conditionIds,
        colorIds,
        storageIds,
        { copyOnlyIfNewKey: true },
      ),
    );
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    updateField("categoryId", e.target.value);
  };

  const toggleConditionCategory = (categoryId) => {
    setConditionCategoryIds((prev) => {
      const isRemoving = prev.includes(categoryId);
      const next = isRemoving
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      syncMatrixMaps(next, formData.colorIds, formData.storageOptionIds);

      // Keep primary category in sync when conditions are used.
      if (!isRemoving && !formData.categoryId) {
        updateField("categoryId", categoryId);
      } else if (isRemoving && formData.categoryId === categoryId && next[0]) {
        updateField("categoryId", next[0]);
      }

      return next;
    });
  };

  const getVariantStockInputValue = (key) => {
    const value = variantStocks[key];
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

  const getVariantPriceInputValue = (key) => {
    const value = variantPrices[key];
    if (value === undefined || value === null || value === "") return "";
    return String(value);
  };

  const getVariantCompareAtInputValue = (key) => {
    const value = variantCompareAt[key];
    if (value === undefined || value === null || value === "") return "";
    return String(value);
  };

  const handleVariantStockChange = (key, value) => {
    setVariantStocks((prev) => ({ ...prev, [key]: value }));
  };

  const handleVariantPriceChange = (key, value) => {
    setVariantPrices((prev) => ({ ...prev, [key]: value }));
  };

  const handleVariantCompareAtChange = (key, value) => {
    setVariantCompareAt((prev) => ({ ...prev, [key]: value }));
  };

  const handleVariantExpressChange = (key, enabled) => {
    setVariantExpress((prev) => ({ ...prev, [key]: enabled }));
  };

  const isVariantExpressEnabled = (key) => {
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
      const nextIds = isRemoving
        ? current.filter((v) => v !== id)
        : [...current, id];

      const nextColorIds = field === "colorIds" ? nextIds : prev.colorIds;
      const nextStorageIds =
        field === "storageOptionIds" ? nextIds : prev.storageOptionIds;
      syncMatrixMaps(conditionCategoryIds, nextColorIds, nextStorageIds);

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
        [field]: nextIds,
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

    if (!formData.colorIds.length) {
      missing.push("at least one Color");
    }
    if (!formData.storageOptionIds.length) {
      missing.push("at least one Storage option");
    }

    const matrixKeys = buildMatrixKeys(
      conditionCategoryIds,
      formData.colorIds,
      formData.storageOptionIds,
    );
    if (matrixKeys.length > 0) {
      const missingPrices = matrixKeys.filter((key) => {
        const price = parseFloat(variantPrices[key]);
        return !price || price <= 0;
      });
      if (missingPrices.length > 0) {
        missing.push("Price for every Condition × Colour × Storage row");
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
      // Sell-side Condition model is unused on listings — clear any legacy value
      formDataToSend.append("conditionId", "");

      const conditionsForCells = conditionCategoryIds.length
        ? conditionCategoryIds
        : [null];
      const variantEntries = [];
      conditionsForCells.forEach((conditionCategoryId) => {
        formData.colorIds.forEach((colorId) => {
          formData.storageOptionIds.forEach((storageOptionId) => {
            const key = variantCellKey(
              conditionCategoryId,
              colorId,
              storageOptionId,
            );
            const price = parseFloat(variantPrices[key]) || 0;
            const compareAt = parseFloat(variantCompareAt[key]);
            const entry = {
              colorId,
              storageOptionId,
              stockQuantity: parseInt(variantStocks[key], 10) || 0,
              price,
              compareAtPrice: compareAt > 0 ? compareAt : null,
              expressDeliveryEnabled: isVariantExpressEnabled(key),
            };
            if (conditionCategoryId) {
              entry.conditionCategoryId = conditionCategoryId;
            }
            variantEntries.push(entry);
          });
        });
      });

      // storageStocks rollup: min price per storage from matrix cells
      const storageEntries = formData.storageOptionIds.map((storageOptionId) => {
        const cells = variantEntries
          .filter((entry) => entry.storageOptionId === storageOptionId)
          .filter((entry) => entry.price > 0)
          .sort((a, b) => a.price - b.price);
        const cheapest = cells[0];
        return {
          storageOptionId,
          stockQuantity: variantEntries
            .filter((entry) => entry.storageOptionId === storageOptionId)
            .reduce((sum, entry) => sum + (entry.stockQuantity || 0), 0),
          price: cheapest?.price || 0,
          compareAtPrice: cheapest?.compareAtPrice ?? null,
        };
      });

      // conditionStocks rollup (bridge): min price + sum stock per condition
      const conditionEntries = conditionCategoryIds.map((categoryId) => {
        const cells = variantEntries.filter(
          (entry) => entry.conditionCategoryId === categoryId,
        );
        const priced = cells
          .filter((entry) => entry.price > 0)
          .sort((a, b) => a.price - b.price);
        const cheapest = priced[0];
        return {
          categoryId,
          stockQuantity: cells.reduce(
            (sum, entry) => sum + (entry.stockQuantity || 0),
            0,
          ),
          price: cheapest?.price || 0,
          compareAtPrice: cheapest?.compareAtPrice ?? null,
        };
      });

      const allCellPrices = variantEntries
        .map((entry) => entry.price)
        .filter((price) => price > 0);
      const resolvedBasePrice = allCellPrices.length
        ? Math.min(...allCellPrices)
        : parseFloat(formData.basePrice) || 0;

      formDataToSend.append("basePrice", resolvedBasePrice);
      if (formData.compareAtPrice) {
        formDataToSend.append("compareAtPrice", formData.compareAtPrice);
      } else {
        formDataToSend.append("compareAtPrice", "");
      }
      formDataToSend.append("storageStocks", JSON.stringify(storageEntries));
      formDataToSend.append(
        "conditionCategoryIds",
        JSON.stringify(conditionCategoryIds),
      );
      formDataToSend.append("conditionStocks", JSON.stringify(conditionEntries));
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
          <FormField label="Primary Category">
            <SelectInput
              name="categoryId"
              value={formData.categoryId}
              onChange={handleCategoryChange}
              options={[
                { value: "", label: "Select Category" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for shop filters. Add selectable buy conditions below for New Sealed / Used, etc.
            </p>
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
          {!(
            formData.colorIds.length > 0 && formData.storageOptionIds.length > 0
          ) && (
            <FormField label="Price">
              <NumberInput
                name="basePrice"
                placeholder="1200000"
                value={formData.basePrice}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Used only until Colour and Storage are selected — then the matrix below is the source of truth.
              </p>
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
              Product-level fallback RRP. Prefer per-row RRP in the Condition × Colour × Storage matrix.
            </p>
          </FormField>
        </div>

        <div className="mb-4">
          <FormField label="Condition options (customer selector)">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={conditionCategoryIds.includes(c.id)}
                    onChange={() => toggleConditionCategory(c.id)}
                    className="accent-teal-600"
                  />
                  <span className="text-base text-gray-700">{c.name}</span>
                </label>
              ))}
              {categories.length === 0 && (
                <span className="text-sm text-gray-400">
                  No categories available — add them in Settings first
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Customers pick one of these on the product page (alongside Colour and Storage). Price, stock, and Express are set per combo in the matrix below.
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
                  <span className="text-base text-gray-700">{formatStorageLabel(s.name)}</span>
                </label>
              ))}
              {storageOptions.length === 0 && (
                <span className="text-sm text-gray-400">
                  No storage options
                </span>
              )}
            </div>
          </FormField>
        </div>

        {formData.colorIds.length > 0 &&
          formData.storageOptionIds.length > 0 && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 overflow-x-auto">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {conditionCategoryIds.length > 0
                  ? "Price, stock & Express by Condition × Colour × Storage"
                  : "Price, stock & Express by Colour × Storage"}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Single source of truth for customer price, RRP, stock, and Express
                delivery. Every row needs a selling price. Tick{" "}
                <strong>Express</strong> only when that exact variant is ready to
                ship immediately.
              </p>
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {conditionCategoryIds.length > 0 && (
                      <th className="text-left p-2 text-gray-600 font-medium border-b border-gray-200 whitespace-nowrap">
                        Condition
                      </th>
                    )}
                    <th className="text-left p-2 text-gray-600 font-medium border-b border-gray-200 whitespace-nowrap">
                      Colour
                    </th>
                    <th className="text-left p-2 text-gray-600 font-medium border-b border-gray-200 whitespace-nowrap">
                      Storage
                    </th>
                    <th className="text-left p-2 text-gray-600 font-medium border-b border-gray-200 min-w-[7rem]">
                      Price
                    </th>
                    <th className="text-left p-2 text-gray-600 font-medium border-b border-gray-200 min-w-[7rem]">
                      RRP
                    </th>
                    <th className="text-left p-2 text-gray-600 font-medium border-b border-gray-200 min-w-[5rem]">
                      Stock
                    </th>
                    <th className="text-left p-2 text-gray-600 font-medium border-b border-gray-200 whitespace-nowrap">
                      Express
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(conditionCategoryIds.length > 0
                    ? conditionCategoryIds
                    : [null]
                  ).flatMap((conditionId) => {
                    const conditionName = conditionId
                      ? categories.find((c) => c.id === conditionId)?.name ||
                        conditionId
                      : null;
                    const sortedStorages = sortStorageOptionsBySize(
                      formData.storageOptionIds
                        .map((storageId) => {
                          const storageName =
                            storageOptions.find((s) => s.id === storageId)
                              ?.name || storageNameById[storageId];
                          if (!storageName) return null;
                          return { id: storageId, name: storageName };
                        })
                        .filter(Boolean),
                    );
                    return formData.colorIds.flatMap((colorId) => {
                      const colorName =
                        colors.find((c) => c.id === colorId)?.name || colorId;
                      return sortedStorages.map(({ id: storageId, name: storageName }) => {
                        const key = variantCellKey(
                          conditionId,
                          colorId,
                          storageId,
                        );
                        return (
                          <tr key={key}>
                            {conditionCategoryIds.length > 0 && (
                              <td className="p-2 text-gray-600 whitespace-nowrap border-b border-gray-100 align-middle">
                                {conditionName}
                              </td>
                            )}
                            <td className="p-2 text-gray-600 whitespace-nowrap border-b border-gray-100 align-middle">
                              {colorName}
                            </td>
                            <td className="p-2 text-gray-600 whitespace-nowrap border-b border-gray-100 align-middle">
                              {formatStorageLabel(storageName)}
                            </td>
                            <td className="p-2 border-b border-gray-100 align-middle">
                              <NumberInput
                                name={`variant-price-${key}`}
                                placeholder="Price"
                                value={getVariantPriceInputValue(key)}
                                onChange={(e) =>
                                  handleVariantPriceChange(key, e.target.value)
                                }
                              />
                            </td>
                            <td className="p-2 border-b border-gray-100 align-middle">
                              <NumberInput
                                name={`variant-rrp-${key}`}
                                placeholder="RRP"
                                value={getVariantCompareAtInputValue(key)}
                                onChange={(e) =>
                                  handleVariantCompareAtChange(
                                    key,
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                            <td className="p-2 border-b border-gray-100 align-middle">
                              <NumberInput
                                name={`variant-stock-${key}`}
                                placeholder="0"
                                value={getVariantStockInputValue(key)}
                                onChange={(e) =>
                                  handleVariantStockChange(key, e.target.value)
                                }
                              />
                            </td>
                            <td className="p-2 border-b border-gray-100 align-middle">
                              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                  checked={isVariantExpressEnabled(key)}
                                  onChange={(e) =>
                                    handleVariantExpressChange(
                                      key,
                                      e.target.checked,
                                    )
                                  }
                                />
                                Express
                              </label>
                            </td>
                          </tr>
                        );
                      });
                    });
                  })}
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
