export const parseFilters = (
    queryParams: Record<string, any>
) => {
    const filters: Record<string, any> = {};

    const reserved = ['page', 'limit', 'sortField', 'sortOrder', 'fields'];

    for (const [key, value] of Object.entries(queryParams)) {
        if (reserved.includes(key)) continue;

        // Caso 1: qs ya parseó los corchetes → value es objeto
        // ej: req.query = { malRank: { gt: '0' } }
        if (typeof value === 'object' && value !== null) {
            filters[key] = {};
            for (const [operator, operatorValue] of Object.entries(value)) {
                filters[key][operator] = convertValue(String(operatorValue));
            }
            continue;
        }

        // Caso 2: clave plana con corchetes → 'malRank[gt]' = '0'
        // Pasa cuando qs no decodifica los corchetes percent-encoded
        const match = key.match(/^(\w+)\[(\w+)\]$/);
        if (match) {
            const [, fieldName, operator] = match;
            if (!filters[fieldName]) filters[fieldName] = {};
            filters[fieldName][operator] = convertValue(String(value));
        }
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
};

function convertValue(str: string): boolean | number | string {
    if (str === 'true')  return true;
    if (str === 'false') return false;
    if (!isNaN(Number(str))) return Number(str);
    return str;
}