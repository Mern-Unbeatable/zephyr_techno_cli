import { useRef, useState, useEffect } from 'react';

const ImageUpload = ({ images, onFilesAdded, onRemove, deletingImageId = null }) => {
    const fileInputRef = useRef(null);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        // Create preview URLs for File objects or existing image URLs
        const newPreviews = images.map((img) => {
            if (img instanceof File) {
                return URL.createObjectURL(img);
            }
            if (img && typeof img === 'object' && img.imageUrl) {
                return img.imageUrl;
            }
            if (img && typeof img === 'object' && img.file instanceof File) {
                return URL.createObjectURL(img.file);
            }
            // If it's already a URL string (from API)
            return img;
        });
        setPreviews(newPreviews);

        // Cleanup object URLs
        return () => {
            newPreviews.forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [images]);

    const handleImageDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        onFilesAdded(files);
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        onFilesAdded(files);
    };

    const handleRemove = (index, e) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove(index);
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
                onClick={() => fileInputRef.current.click()}
                className="w-full border border-gray-200 rounded-lg bg-white cursor-pointer flex flex-col items-center justify-center py-16 gap-2 hover:border-teal-400 transition-colors"
            >
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>⊕ JPEG, PNG</span>
                    <span>⊕ Max 20 photos</span>
                    <span>⊕ 1920×1080px recommended</span>
                </div>
                {images.length > 0 && (
                    <p className="text-xs text-teal-600 mt-1">{images.length} file(s) selected</p>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="hidden"
                onChange={handleImageSelect}
            />

            {/* Image Previews */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {previews.map((preview, index) => {
                        const imageItem = images[index];
                        const imageKey =
                            imageItem?.id ||
                            imageItem?.file?.name ||
                            `new-${index}`;
                        const isDeleting = deletingImageId === imageItem?.id;

                        return (
                        <div key={imageKey} className="relative group">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            {onRemove && (
                                <button
                                    type="button"
                                    onClick={(e) => handleRemove(index, e)}
                                    disabled={isDeleting}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-red-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                    title="Remove image"
                                >
                                    {isDeleting ? (
                                        <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        '×'
                                    )}
                                </button>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
