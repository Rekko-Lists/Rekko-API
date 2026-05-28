# Clean Code Violations - PENDIENTES

**Fecha:** 28 de mayo de 2026  
**Progreso:** 11/87 solucionados (13%)

## ✅ COMPLETADOS (No en este documento)

- Constructor User → DTO Pattern
- Constructor Anime → DTO Pattern
- Constantes centralizadas (`src/constants/index.ts`)
- Express types (`src/types/express.types.ts`)
- JWT tipado con interfaces
- Parsing utilities (`src/utils/parsing.util.ts`)
- Mensajes corregidos

---

## 🔴 CRÍTICO - 10 PENDIENTES
### 5. Validación de parseInt duplicada (~30 veces)

**Patrón:**

```typescript
const id = parseInt(req.params.id as string);
if (isNaN(id)) throw new ValidationError('Invalid ID');
```

**Ubicaciones:**

- `watch.controller.ts`
- `post.controller.ts`
- `comment.controller.ts`
- `challenge.controller.ts`
- `anime.controller.ts`

**Solución:** Usar `parseNumericParam()` de `src/utils/parsing.util.ts`

---

### 6. Paginación duplicada (12+ veces)

**Patrón repetido:**

```typescript
const maxPages = Math.ceil(result.total / limit);
if (page > maxPages) throw new NotFoundError(...);
return {
    data: result.data,
    pagination: { page, limit, total, pages: maxPages }
};
```

**Ubicaciones:**

- `user.service.ts`
- `post.service.ts`
- `anime.service.ts`
- `comment.service.ts`
- Y más...

**Solución:** Crear `PaginationFormatter` utility

---

### 7. Constantes de paginación inconsistentes

**Problema:** Límites hardcodeados en múltiples lugares

- `40` en anime.controller.ts (seed)
- `110` en find.schemas.ts
- `20` en CLAUDE.md

**Solución:** Centralizar en `src/constants/index.ts`

---

### 8. Strings de propósito en tokens

**Problema:**

```typescript
verifyToken(token, 'verify-email'); // String mágico
verifyToken(token, 'change-email'); // String mágico
```

**Solución:** Usar enum centralizado en constants

---

### 9. Rutas regex hardcodeadas

**Ubicación:** `src/middlewares/auth.middleware.ts`

```typescript
/^\/[^/]+$/.test(req.path); // Regex mágico
```

**Solución:** Usar `PUBLIC_USER_ROUTE_PATTERNS` de constants

---

### 10. Validación de password duplicada (5 veces)

**Problema:** Mismo schema en:

- `createUserSchema`
- `userResetPassword`
- Otros...

**Solución:** Extraer a variable `passwordSchema` centralizada

---

## 🟠 ALTO - 29 PENDIENTES

### Nomenclatura

#### 1. Métodos Repository genéricos sin sufijo

**Problema:** Difícil distinguir `find()`, `findById()`, `findByUsername()`

**Solución:** Nombres más explícitos:

- `findByIdWithFields()`
- `findByUsernameIncludingRelations()`
- `updateProfileData()`

---

#### 2. Variables ambiguas en loops

**Ejemplo:**

```typescript
const [likedIds, ratesById, watchById] = ... // ¿Map? ¿Array?
```

**Solución:**

```typescript
const [likedAnimeIds, ratingsByAnimeId, watchStatesByAnimeId] = ...
```

---

#### 3. Génerico innecesario `<T>` en interfaces

**Problema:**

```typescript
export interface UserRepository<User> extends Repository<User, ...>
```

Siempre es `User`, no necesita ser genérico.

---

### Funciones - Múltiples responsabilidades

#### 4. `buildPrismaSelect()` hace múltiples cosas

**Hace:**

- Merge fields
- Map fields
- Validar
- Build select

**Solución:** Separar en 3 funciones

---

#### 5. `buildUserStateMap()` hace 3 queries + merge

**Ubicación:** `src/services/anime/anime.service.ts`

**Solución:** Separar en:

- `getUserLikedAnimeIds()`
- `getUserRatings()`
- `getUserWatchStates()`
- `mergeStateData()`

---

#### 6. getPosts hace query + enriquecimiento + formateo

**Ubicación:** `src/controllers/publication/post.controller.ts`

**Solución:** Mover enriquecimiento a middleware o servicio separado

---

### Duplicación

#### 7. Validación de entrada (12+ veces)

Mismo patrón en múltiples schemas:

```typescript
email: z.email();
newEmail: z.email();
```

**Solución:** Crear `emailSchema` centralizado

---

#### 8. Formateo de respuesta paginada (12+ lugares)

```typescript
ok(res, 'Found', {
    [dataKey]: formatted,
    pagination: { page, limit, total, pages }
});
```

**Solución:** Crear helper `sendPaginatedResponse()`

---

#### 9. Error handling inconsistente

**Problema:** Misma situación → diferentes errores:

```typescript
throw new NotFoundError('Post', postId); // Con ID
throw new NotFoundError('No posts found'); // Sin ID
```

**Solución:** Mensajes consistentes

---

### Patrón de dependencias

#### 10. DI inconsistente

- A veces via container: `req.container!.services`
- A veces directo: `new Service(...)`
- A veces inyectado: constructor

**Solución:** Centralizar todo via container

---

#### 11. Repository con lógica de negocio

**Problema:**

```typescript
// En repository
async updateReputation(userId, increment) { }
async searchByName(query, limit) { }
```

**Solución:** Mover a servicios, repository solo Prisma abstraction

---

## 🟡 MEDIO - 27 PENDIENTES

### 1. Comentarios redundantes

Remover comentarios obvios:

```typescript
if (!genres || genres.length === 0) return null; // ← Obvio
```

Mantener solo comentarios que expliquen "por qué"

---

### 2. Comentarios en español

Cambiar a English:

```typescript
// El correo se ha verificado → Email has been verified
```

---

### 3. Valores por defecto dispersos

Centralizar defaults en `DEFAULTS` constant:

- PORT: 5000
- PAGINATION.PAGE: 1
- PAGINATION.LIMIT: 10
- Etc

---

### 4. Tipos incompletos

**Ejemplo:**

```typescript
const prisma.$transaction(async (tx: any) => { }) // ❌ any
```

**Solución:**

```typescript
async (tx: Prisma.TransactionClient) => {};
```

---

### 5. Interfaces genéricas con restricciones débiles

```typescript
export interface LikeRepository {
    like<T>(userId: number, targetId: number): Promise<T>;
}
```

**Solución:** Métodos específicos:

```typescript
likePost(userId: number, postId: number): Promise<Post>;
likeComment(userId: number, commentId: number): Promise<Comment>;
```

---

### 6. Prisma select repetida

Múltiples lugares definen el mismo select pattern.

**Solución:** Centralizar en `SelectPatterns` constant

---

### 7. Strings hardcodeados en validators

```typescript
z.email('Email must be valid');
z.string().min(8, 'Password must be at least 8 characters');
```

**Solución:** Centralizar en `VALIDATION_MESSAGES` constant

---

## 🟢 BAJO - 10 PENDIENTES

### 1. Imports no usados

Ejecutar: `npm run eslint -- --fix`

---

### 2. Imports circulares potenciales

Verificar estructura de imports en:

- `domain/entities`
- `domain/schemas`
- `domain/repositories`

---

### 3. Mezcla de import styles

Usar named imports siempre (no default + named)

---

### 4. Comentarios desactualizados

Revisar comentarios que describieron decisiones pasadas

---

---

## 📋 PLAN DE TRABAJO - PRÓXIMAS PRIORIDADES

### Fase 1: CRÍTICO (1 semana)

1. [ ] Remover error silencioso en optionalAuthMiddleware
2. [ ] Split UserService en 4 servicios
3. [ ] Remover `as any` remanentes
4. [ ] Aplicar `parseNumericParam()` en todos los controllers
5. [ ] Aplicar constantes de paginación

### Fase 2: ALTO (2 semanas)

1. [ ] Crear `PaginationFormatter` utility
2. [ ] Crear `sendPaginatedResponse()` helper
3. [ ] Centralizar validación (email, password)
4. [ ] Split AnimeService en 5 servicios
5. [ ] Refactorizar Repository pattern

### Fase 3: MEDIO (1 semana)

1. [ ] Limpiar comentarios (español → english)
2. [ ] Centralizar tipos de Prisma
3. [ ] Centralizar validation messages
4. [ ] Remover comentarios redundantes

### Fase 4: BAJO (2-3 días)

1. [ ] Limpiar imports no usados
2. [ ] Verificar imports circulares
3. [ ] Estandarizar import style

---

## 📊 MÉTRICAS

| Categoría      | CRÍTICO | ALTO   | MEDIO  | BAJO   | Total  |
| -------------- | ------- | ------ | ------ | ------ | ------ |
| Nomenclatura   | 2       | 3      | 1      | 0      | 6      |
| Funciones      | 2       | 3      | 1      | 0      | 6      |
| Clases         | 2       | 2      | 1      | 0      | 5      |
| Duplicación    | 2       | 3      | 2      | 0      | 7      |
| Error Handling | 1       | 1      | 1      | 0      | 3      |
| Tipos          | 0       | 2      | 3      | 0      | 5      |
| Constantes     | 0       | 4      | 2      | 0      | 6      |
| Imports        | 0       | 0      | 0      | 4      | 4      |
| Comentarios    | 0       | 0      | 4      | 0      | 4      |
| Patrones       | 1       | 8      | 7      | 2      | 18     |
| **TOTAL**      | **10**  | **29** | **27** | **10** | **76** |
