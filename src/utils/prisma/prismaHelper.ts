import {
    FilterOperator,
    FindOptions,
    PrismaPageQuery
} from '../../domain/schemas/find.schemas';

export function buildPrismaPageQuery(
    findOptions: FindOptions,
    defaultSortField: string = 'id'
): PrismaPageQuery {
    const { pagination, sort } = findOptions;
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const orderBy: Record<string, 'asc' | 'desc'> =
        sort && sort.length > 0
            ? {
                  [sort[0].field]: sort[0].order as
                      | 'asc'
                      | 'desc'
              }
            : { [defaultSortField]: 'asc' };

    return { skip, take, orderBy };
}

export function buildPrismaPageQueryArray(
    findOptions: FindOptions,
    defaultSortField: string = 'id'
): {
    skip: number;
    take: number;
    orderBy: Record<string, 'asc' | 'desc'>[];
} {
    const { pagination, sort } = findOptions;
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const orderBy: Record<string, 'asc' | 'desc'>[] =
        sort && sort.length > 0
            ? sort.map((s) => ({
                  [s.field]: s.order as 'asc' | 'desc'
              }))
            : [{ [defaultSortField]: 'asc' }];

    return { skip, take, orderBy };
}

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

export function buildFilterWhere(
    filters: Record<string, FilterOperator>
): Record<string, any> {
    const where: Record<string, any> = {};

    for (const [field, operators] of Object.entries(filters)) {
        const fieldWhere: Record<string, any> = {};

        if (operators.lt !== undefined)
            fieldWhere.lt = operators.lt;
        if (operators.lte !== undefined)
            fieldWhere.lte = operators.lte;
        if (operators.gt !== undefined)
            fieldWhere.gt = operators.gt;
        if (operators.gte !== undefined)
            fieldWhere.gte = operators.gte;
        if (operators.eq !== undefined)
            fieldWhere.equals = operators.eq;
        if (operators.ne !== undefined)
            fieldWhere.not = operators.ne;

        if (Object.keys(fieldWhere).length > 0) {
            where[field] = fieldWhere;
        }
    }

    return where;
}
