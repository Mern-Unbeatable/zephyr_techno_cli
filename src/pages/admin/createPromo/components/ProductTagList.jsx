const ProductTagList = ({ products, onRemove }) => {
    if (!products.length) return null;

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {products.map((product, index) => {
                const label = typeof product === 'string' ? product : product.name;
                return (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
                    >
                        {label}
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`Remove ${label}`}
                        >
                            &#x2715;
                        </button>
                    </span>
                );
            })}
        </div>
    );
};

export default ProductTagList;
