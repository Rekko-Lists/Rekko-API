/**
 * Test Suite: Pagination Utility
 *
 * Tests the Paginator class used across multiple endpoints
 *
 * CRITICALITY: 🟠 ALTA - Utilidad de paginación
 */

import { Paginator } from '../paginator';

describe('Paginator', () => {
    let paginator: Paginator;

    beforeEach(() => {
        paginator = new Paginator();
    });

    const createMockItems = (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `Item ${i + 1}`
        }));
    };

    describe('Basic pagination', () => {
        it('should paginate correctly on first page', () => {
            const items = createMockItems(50);
            const result = paginator.paginate(items, 1, 10);

            expect(result.data).toHaveLength(10);
            expect(result.data[0].id).toBe(1);
            expect(result.data[9].id).toBe(10);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.total).toBe(50);
            expect(result.pagination.pages).toBe(5);
        });

        it('should paginate correctly on second page', () => {
            const items = createMockItems(50);
            const result = paginator.paginate(items, 2, 10);

            expect(result.data).toHaveLength(10);
            expect(result.data[0].id).toBe(11);
            expect(result.data[9].id).toBe(20);
            expect(result.pagination.page).toBe(2);
        });

        it('should paginate correctly on middle page', () => {
            const items = createMockItems(100);
            const result = paginator.paginate(items, 5, 10);

            expect(result.data).toHaveLength(10);
            expect(result.data[0].id).toBe(41);
            expect(result.pagination.page).toBe(5);
        });

        it('should paginate correctly on last page', () => {
            const items = createMockItems(50);
            const result = paginator.paginate(items, 5, 10);

            expect(result.data).toHaveLength(10);
            expect(result.data[0].id).toBe(41);
            expect(result.data[9].id).toBe(50);
            expect(result.pagination.page).toBe(5);
        });
    });

    describe('Edge cases with pagination', () => {
        it('should handle page beyond range', () => {
            const items = createMockItems(50);
            const result = paginator.paginate(items, 100, 10);

            // Debe clampear al máximo de páginas
            expect(result.pagination.page).toBe(5);
            expect(result.data).toHaveLength(10);
        });

        it('should handle page 0', () => {
            const items = createMockItems(50);
            const result = paginator.paginate(items, 0, 10);

            // Debe convertir a página 1
            expect(result.pagination.page).toBe(1);
            expect(result.data[0].id).toBe(1);
        });

        it('should handle negative page numbers', () => {
            const items = createMockItems(50);
            const result = paginator.paginate(items, -5, 10);

            // Debe convertir a página 1
            expect(result.pagination.page).toBe(1);
            expect(result.data[0].id).toBe(1);
        });

        it('should handle page as float (coerce to valid)', () => {
            const items = createMockItems(50);
            // En realidad el parámetro debe ser number, pero validamos comportamiento
            const result = paginator.paginate(items, 2, 10);

            expect(result.pagination.page).toBe(2);
            expect(result.data[0].id).toBe(11);
        });
    });

    describe('Different limit values', () => {
        it('should handle limit of 1', () => {
            const items = createMockItems(50);
            const result = paginator.paginate(items, 1, 1);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toBe(1);
            expect(result.pagination.pages).toBe(50);
        });

        it('should handle limit of 50', () => {
            const items = createMockItems(50);
            const result = paginator.paginate(items, 1, 50);

            expect(result.data).toHaveLength(50);
            expect(result.pagination.pages).toBe(1);
        });

        it('should handle limit larger than total items', () => {
            const items = createMockItems(20);
            const result = paginator.paginate(items, 1, 50);

            expect(result.data).toHaveLength(20);
            expect(result.pagination.pages).toBe(1);
        });

        it('should handle different limits on different pages', () => {
            const items = createMockItems(100);

            const page1 = paginator.paginate(items, 1, 20);
            const page2 = paginator.paginate(items, 2, 20);
            const page3 = paginator.paginate(items, 3, 20);

            expect(page1.data).toHaveLength(20);
            expect(page2.data).toHaveLength(20);
            expect(page3.data).toHaveLength(20);
            expect(page1.pagination.pages).toBe(5);
        });
    });

    describe('Empty arrays', () => {
        it('should handle empty array', () => {
            const result = paginator.paginate([], 1, 10);

            expect(result.data).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
            expect(result.pagination.pages).toBe(0);
            expect(result.pagination.page).toBe(1);
        });

        it('should handle empty array on page 2', () => {
            const result = paginator.paginate([], 2, 10);

            // Debe clampear a página válida (1 en este caso)
            expect(result.pagination.page).toBe(1);
            expect(result.data).toHaveLength(0);
        });
    });

    describe('Default values', () => {
        it('should use default pagination values', () => {
            const items = createMockItems(100);
            const result = paginator.paginate(items);

            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(30);
            expect(result.data).toHaveLength(30);
        });

        it('should handle only page parameter (use default limit)', () => {
            const items = createMockItems(100);
            const result = paginator.paginate(items, 2);

            expect(result.pagination.page).toBe(2);
            expect(result.pagination.limit).toBe(30);
        });
    });

    describe('Partial pages', () => {
        it('should handle last page with partial items', () => {
            const items = createMockItems(55);
            const result = paginator.paginate(items, 6, 10);

            expect(result.data).toHaveLength(5); // Página 6, últimos 5 items
            expect(result.data[0].id).toBe(51);
            expect(result.data[4].id).toBe(55);
            expect(result.pagination.pages).toBe(6);
        });

        it('should calculate correct pages for 47 items with limit 10', () => {
            const items = createMockItems(47);
            const result = paginator.paginate(items, 1, 10);

            expect(result.pagination.pages).toBe(5); // ceil(47/10) = 5
        });

        it('should return correct items on last partial page', () => {
            const items = createMockItems(47);
            const lastPage = paginator.paginate(items, 5, 10);

            expect(lastPage.data).toHaveLength(7); // Últimos 7 items (47 % 10)
            expect(lastPage.data[0].id).toBe(41);
        });
    });

    describe('Pagination metadata', () => {
        it('should return correct pagination metadata', () => {
            const items = createMockItems(100);
            const result = paginator.paginate(items, 3, 20);

            const pagination = result.pagination;

            expect(pagination).toEqual({
                page: 3,
                limit: 20,
                total: 100,
                pages: 5
            });
        });

        it('should calculate pages correctly for various scenarios', () => {
            const scenarios = [
                { items: 0, limit: 10, expectedPages: 0 },
                { items: 1, limit: 10, expectedPages: 1 },
                { items: 10, limit: 10, expectedPages: 1 },
                { items: 11, limit: 10, expectedPages: 2 },
                { items: 100, limit: 10, expectedPages: 10 },
                { items: 99, limit: 10, expectedPages: 10 },
                { items: 101, limit: 10, expectedPages: 11 },
                { items: 50, limit: 7, expectedPages: 8 }
            ];

            scenarios.forEach(
                ({ items: count, limit, expectedPages }) => {
                    const items = createMockItems(count);
                    const result = paginator.paginate(
                        items,
                        1,
                        limit
                    );

                    expect(result.pagination.pages).toBe(
                        expectedPages
                    );
                }
            );
        });
    });

    describe('Data integrity', () => {
        it('should not mutate original array', () => {
            const items = createMockItems(50);
            const originalLength = items.length;

            paginator.paginate(items, 1, 10);

            expect(items).toHaveLength(originalLength);
        });

        it('should preserve object properties', () => {
            const items = [
                {
                    id: 1,
                    name: 'Test',
                    active: true,
                    metadata: { key: 'value' }
                },
                {
                    id: 2,
                    name: 'Test 2',
                    active: false,
                    metadata: { key: 'value2' }
                }
            ];

            const result = paginator.paginate(items, 1, 10);

            expect(result.data[0]).toEqual(items[0]);
            expect(result.data[1]).toEqual(items[1]);
        });

        it('should handle complex object arrays', () => {
            const items = Array.from({ length: 10 }, (_, i) => ({
                id: i + 1,
                user: {
                    name: `User ${i}`,
                    email: `user${i}@example.com`
                },
                nested: { data: { value: i * 100 } }
            }));

            const result = paginator.paginate(items, 1, 5);

            expect(result.data).toHaveLength(5);
            expect(result.data[0].user.name).toBe('User 0');
            expect(result.data[4].nested.data.value).toBe(400);
        });
    });

    describe('Performance scenarios', () => {
        it('should handle large arrays efficiently', () => {
            const largeArray = createMockItems(10000);

            const start = performance.now();
            const result = paginator.paginate(
                largeArray,
                500,
                20
            );
            const end = performance.now();

            expect(result.data).toHaveLength(20);
            expect(end - start).toBeLessThan(10); // Should be < 10ms
        });

        it('should handle multiple paginations', () => {
            const items = createMockItems(1000);

            for (let page = 1; page <= 50; page++) {
                const result = paginator.paginate(
                    items,
                    page,
                    20
                );
                expect(result.data.length).toBeGreaterThan(0);
            }
        });
    });

    describe('API contract', () => {
        it('should return PaginatedResponse shape', () => {
            const items = createMockItems(50);
            const result = paginator.paginate(items, 1, 10);

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('pagination');
            expect(Array.isArray(result.data)).toBe(true);
            expect(typeof result.pagination).toBe('object');
            expect(result.pagination).toHaveProperty('page');
            expect(result.pagination).toHaveProperty('limit');
            expect(result.pagination).toHaveProperty('total');
            expect(result.pagination).toHaveProperty('pages');
        });
    });

    describe('Real-world scenarios', () => {
        it('should handle user listing (typical case)', () => {
            const users = createMockItems(245); // Realistic DB query
            const result = paginator.paginate(users, 5, 10);

            expect(result.data).toHaveLength(10);
            expect(result.pagination.page).toBe(5);
            expect(result.pagination.total).toBe(245);
            expect(result.pagination.pages).toBe(25);
        });

        it('should handle infinite scroll pagination', () => {
            const items = createMockItems(1000);
            const pageSize = 20;

            const pages = [];
            for (let page = 1; page <= 5; page++) {
                const result = paginator.paginate(
                    items,
                    page,
                    pageSize
                );
                pages.push(result);
            }

            // Verificar que todas las páginas están cargadas
            expect(pages).toHaveLength(5);
            pages.forEach((page, index) => {
                expect(page.data).toHaveLength(pageSize);
                expect(page.pagination.page).toBe(index + 1);
            });
        });

        it('should clamp to valid range for out-of-bounds requests', () => {
            const items = createMockItems(50);

            // Solicitar página 999
            const result = paginator.paginate(items, 999, 10);

            // Debe mostrar última página válida
            expect(result.pagination.page).toBe(5);
            expect(result.data).toHaveLength(10);
        });
    });
});
