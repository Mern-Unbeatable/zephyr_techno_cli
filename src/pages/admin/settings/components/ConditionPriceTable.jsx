import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

const ConditionPriceTable = ({
  models = [],
  conditions = [],
  conditionModelPrices = [],
  onAddPrice,
  onEditPrice,
  onDeletePrice,
  pageSize = 7,
}) => {
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  useEffect(() => {
    const closeMenu = () => {
      setOpenMenuKey(null);
      setMenuPosition(null);
    };

    const handleScrollOrResize = () => closeMenu();
    const handleEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // group backend entries by deviceModelId preserving order from models list
  const groups = useMemo(() => {
    const byModel = {};
    conditionModelPrices.forEach((e) => {
      const mid = e.deviceModelId || "global";
      if (!byModel[mid]) byModel[mid] = [];
      byModel[mid].push(e);
    });

    // preserve models order; include models even with no entries optionally
    const groupsFromModels = models.map((m) => ({
      model: m,
      rows: byModel[m.id] || [],
    }));
    // include any orphan model ids returned from backend that aren't in models list
    const knownIds = new Set(models.map((m) => m.id));
    const orphanGroups = Object.keys(byModel)
      .filter((mid) => !knownIds.has(mid))
      .map((mid) => ({
        model: {
          id: mid,
          name: byModel[mid]?.[0]?.deviceModel?.name || "Unknown Model",
        },
        rows: byModel[mid],
      }));

    return [...groupsFromModels, ...orphanGroups].filter(
      (g) => g.rows.length > 0,
    );
  }, [models, conditionModelPrices]);

  const flattened = groups.flatMap((g) =>
    g.rows.map((r) => {
      const dmName = r?.deviceModel?.name;
      const gmName = g?.model?.name || g?.model?.label;
      const modelName = dmName || gmName || "Unknown Model";
      return {
        ...r,
        modelName: typeof modelName === "string" ? modelName.trim() : modelName,
      };
    }),
  );

  // debug: in development, log groups to help diagnose missing names
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV === "development"
  ) {
    // eslint-disable-next-line no-console
    console.debug("ConditionPriceTable groups:", groups);
    // eslint-disable-next-line no-console
    console.debug(
      "ConditionPriceTable flattened sample:",
      flattened.slice(0, 10),
    );
  }
  const [page, setPage] = useState(1);
  const total = flattened.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, startIndex + pageSize);

  // To paginate while preserving group rowspans, we slice the flattened list and render groups that intersect the slice.
  const pageSlice = flattened.slice(startIndex, endIndex);

  // helper to find if a group's rows intersect with the page slice indices
  const renderGroups = () => {
    const result = [];
    let globalIndex = 0;
    for (const g of groups) {
      const groupSize = g.rows.length;
      const groupStart = globalIndex;
      const groupEnd = globalIndex + groupSize; // exclusive
      // check overlap with [startIndex, endIndex)
      if (groupEnd > startIndex && groupStart < endIndex) {
        // determine local slice
        const sliceFrom = Math.max(0, startIndex - groupStart);
        const sliceTo = Math.min(groupSize, endIndex - groupStart);
        for (let i = sliceFrom; i < sliceTo; i += 1) {
          const row = g.rows[i];
          result.push({
            row,
            showModel: i === sliceFrom,
            modelRowSpan: sliceTo - sliceFrom,
          });
        }
      }
      globalIndex += groupSize;
    }
    return result;
  };

  const rowsToRender = renderGroups();

  return (
    <div className="rounded-lg border border-gray-100 bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 rounded-t-lg">
        <h3 className="text-base font-semibold text-gray-900">
          Set Condition Price
        </h3>
        <button
          type="button"
          onClick={onAddPrice}
          className="rounded-md bg-custom px-3 py-1 text-sm font-medium text-white hover:bg-[#12806f]"
        >
          Add Condition
        </button>
      </div>

      <div className="p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left table-fixed">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-[#f8fbfc]">
                <th className="py-3 px-4 w-48">Model</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 w-36">Condition</th>
                <th className="py-3 px-4 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {rowsToRender.map(({ row, showModel, modelRowSpan }, idx) => {
                const condLabel =
                  row.conditionName ||
                  row.condition?.name ||
                  row.condition ||
                  (row.condition && String(row.condition)) ||
                  "—";
                const priceVal = row.price != null ? Number(row.price) : null;
                const priceLabel =
                  priceVal != null && !isNaN(priceVal)
                    ? `$${priceVal.toLocaleString()}`
                    : "—";
                return (
                  <tr
                    key={`${row.deviceModelId || row.modelId || "m"}-${condLabel}-${startIndex + idx}`}
                    className="border-t border-gray-100"
                  >
                    {showModel ? (
                      <td
                        className="py-6 px-4 align-top text-gray-700"
                        rowSpan={modelRowSpan}
                      >
                        {(() => {
                          const candidate =
                            row.modelName ||
                            row.deviceModel?.name ||
                            row.deviceModelName ||
                            row.deviceModelId;
                          const visible =
                            candidate && String(candidate).trim()
                              ? String(candidate).trim()
                              : `Unknown model (${row.deviceModelId || row.deviceModel?.id || "no-id"})`;
                          return (
                            <div className="whitespace-normal">{visible}</div>
                          );
                        })()}
                      </td>
                    ) : null}
                    <td className="py-6 px-4 align-top text-gray-700">
                      {condLabel}
                    </td>
                    <td className="py-6 px-4 align-top text-gray-700 text-center">
                      {priceLabel}
                    </td>
                    <td className="py-6 px-4 align-top text-gray-700">
                      <div className="inline-flex">
                        <button
                          type="button"
                          onClick={(event) => {
                            const rect =
                              event.currentTarget.getBoundingClientRect();
                            const menuWidth = 128;
                            const menuHeight = 82;
                            const left = Math.max(
                              8,
                              Math.min(
                                rect.right - menuWidth,
                                window.innerWidth - menuWidth - 8,
                              ),
                            );
                            const top =
                              rect.bottom + menuHeight > window.innerHeight
                                ? rect.top - menuHeight - 8
                                : rect.bottom + 8;

                            if (openMenuKey === row.id) {
                              setOpenMenuKey(null);
                              setMenuPosition(null);
                              return;
                            }

                            setOpenMenuKey(row.id);
                            setMenuPosition({ left, top });
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                          aria-label="Open row actions"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                          </svg>
                        </button>

                        {openMenuKey === row.id &&
                        menuPosition &&
                        typeof document !== "undefined"
                          ? createPortal(
                              <div
                                className="fixed z-50 w-32 overflow-hidden rounded-md border border-gray-100 bg-white shadow-lg"
                                style={{
                                  left: `${menuPosition.left}px`,
                                  top: `${menuPosition.top}px`,
                                }}
                                onMouseDown={(event) => event.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuKey(null);
                                    setMenuPosition(null);
                                    onEditPrice && onEditPrice(row);
                                  }}
                                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuKey(null);
                                    setMenuPosition(null);
                                    onDeletePrice && onDeletePrice(row);
                                  }}
                                  className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
                                >
                                  Delete
                                </button>
                              </div>,
                              document.body,
                            )
                          : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-[#f3fbfd] border border-[#f1f7f8] rounded-b-lg px-4 py-3 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total}{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50 bg-white"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50 bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionPriceTable;
