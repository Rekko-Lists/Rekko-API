export type FilterOperator =
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'isNull'
    | 'between';

export type FilterValue = unknown;

export interface Filter<F extends string = string> {
    field: F;
    op: FilterOperator;
    value?: FilterValue;
}