import { useEffect, useRef } from 'react';

const baseClasses =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white';

const NumberInput = ({ className = '', ...props }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;

        const handleWheel = (event) => {
            event.preventDefault();
        };

        input.addEventListener('wheel', handleWheel, { passive: false });

        return () => input.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <input
            ref={inputRef}
            type="number"
            className={`${baseClasses} ${className}`}
            {...props}
        />
    );
};

export default NumberInput;
