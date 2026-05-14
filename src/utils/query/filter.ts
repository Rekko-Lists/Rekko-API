export const parseFilters = (
    queryParams: Record<string, any>
) => {
    const filters: Record<string, any> = {};

    for (const [key, value] of Object.entries(queryParams)) {
        if (
            [
                'page',
                'limit',
                'sortField',
                'sortOrder',
                'fields'
            ].includes(key)
        ) {
            continue;
        }

        // Mirar si tiene el formato: field[operator]=value
        if (typeof value === 'object' && value !== null) {
            filters[key] = {};

            for (const [
                operator,
                operatorValue
            ] of Object.entries(value)) {
                const stringValue = String(operatorValue);

                let convertedValue: any = stringValue;
                if (stringValue === 'true')
                    convertedValue = true;
                else if (stringValue === 'false')
                    convertedValue = false;
                else if (!isNaN(Number(stringValue)))
                    convertedValue = Number(stringValue);

                filters[key][operator] = convertedValue;
            }
        }
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
};
