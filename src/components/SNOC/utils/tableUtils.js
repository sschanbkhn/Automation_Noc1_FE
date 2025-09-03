// src/utils/sortUtils.js

/**
 * Get the value of a nested property using a dot-separated key.
 * @param {Object} obj - The object to get the property from.
 * @param {String} key - The dot-separated key (e.g., "department.name").
 * @returns {*} - The value of the property.
 */
export const getPropertyValue = (obj, key) => {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

/**
 * Map a simple key to a nested key if needed.
 * @param {String} key - The simple key (e.g., "department").
 * @returns {String} - The mapped nested key.
 */
export const getSortKey = (key) => {
    const keyMap = {
        department: 'department.name', // Example mapping
        group: 'group.name', // Example mapping
        // Add more mappings as needed
    };
    return keyMap[key] || key; // Return mapped key or original key
};

/**
 * Sort an array of objects based on a key and direction.
 * @param {Array} data - The array of objects to sort.
 * @param {String} key - The key to sort by (supports dot-separated keys for nested properties).
 * @param {String} direction - The direction to sort ('asc' or 'desc').
 * @returns {Array} - The sorted array.
 */
export const sortData = (data, key, direction = 'asc') => {
    const sortedData = [...data];
    const sortKey = getSortKey(key); // Map key if needed

    sortedData.sort((a, b) => {
        const aValue = getPropertyValue(a, sortKey);
        const bValue = getPropertyValue(b, sortKey);

        if (aValue === null && bValue !== null) return 1;
        if (aValue !== null && bValue === null) return -1;
        if (aValue === null && bValue === null) return 0;

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    return sortedData;
};

/**
 * Create a sorting function for requestSort.
 * @param {Function} setSortConfig - State updater function for sorting configuration.
 * @param {Object} sortConfig - Current sorting configuration.
 * @returns {Function} - Sorting function.
 */
export const createRequestSortFunction = (setSortConfig, sortConfig) => (key) => {
    const sortKey = getSortKey(key); // Map key if needed
    let direction = 'asc';
    if (sortConfig.key === sortKey && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key: sortKey, direction });
};


/**
 * Get the CSS class names for the sort indicator.
 * @param {Object} sortConfig - The current sort configuration.
 * @param {String} key - The key of the column to check.
 * @returns {String} - The class name for the sort direction.
 */
export const getClassNamesFor = (sortConfig, key) => {
    if (!sortConfig) {
        return '';
    }
    const sortKey = getSortKey(key); // Map key if needed
    if (sortConfig.key === sortKey) {
        return sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc';
    }
    return '';
};



export const filterData = (data, searchTerm, excludedFields = []) => {
    return data.filter(item => {
        return Object.keys(item).some(key => {
            if (excludedFields.includes(key)) return false; // Exclude top-level fields

            const value = item[key];

            if (typeof value === 'object' && value !== null) {
                return Object.keys(value).some(nestedKey => {
                    if (excludedFields.includes(`${key}.${nestedKey}`)) return false; // Exclude nested fields

                    const nestedValue = value[nestedKey];
                    return nestedValue && nestedValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
                });
            }

            return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
    });
};
