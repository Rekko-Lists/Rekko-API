export function buildPrismaSelect(
    defaultFields: string[],
    fieldMappings: Record<string, any> = {},
    fields?: string[]
): Record<string, any> {
    const additionalFields =
        fields && fields.length > 0 ? fields : [];
    const allFields = [
        ...new Set([...defaultFields, ...additionalFields])
    ];

    const select: Record<string, any> = {};

    allFields.forEach((field) => {
        if (fieldMappings[field]) {
            const mapping = fieldMappings[field];
            select[mapping.selectKey || field] =
                mapping.config || true;
        } else {
            select[field] = true;
        }
    });

    return select;
}
