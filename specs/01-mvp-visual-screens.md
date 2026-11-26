# SPEC 01 — MVP visual de Arcade Vault (5 pantallas con juegos placeholder)

> **Status:** Aprobado
> **Depends on:** Ninguna (el tema CSS y las fuentes ya existen en `app/globals.css` y `app/layout.tsx`)
> **Date:** 2026-11-26
> **Objective:** Portar las 5 pantallas de `references/templates/` (biblioteca, detalle, reproductor, acceso y salón de la fama) a rutas del App Router de Next.js con datos mock y sin implementar ningún juego real.

## Por qué existe esta spec

`references/templates/` es un prototipo React por CDN (SPA con hash, `window.*` globals, Babel en el navegador). No se puede copiar tal cual a Next 16. Esta spec define cómo traducirlo a TypeScript + App Router manteniendo el diseño idéntico al prototipo. Los estilos ya están portados en `app/globals.css` (verificado: contiene `.av-nav`, `.card`, `.cover-*`, `.crt`, `.modal`, `.auth-card`, `.podium`, `.hall-table`, etc.), así que **no se reescribe CSS**.

## Scope

**In:**

- Cinco rutas del App Router: `/` (biblioteca), `/juegos/[id]` (detalle), `/jugar/[id]` (reproductor placeholder), `/acceso` (login/registro falso), `/salon` (salón de la fama).
- Navbar (con panel móvil/hamburguesa) y footer compartidos desde `app/layout.tsx`.
- Datos mock tipados: 8 juegos, categorías, generador determinista de puntuaciones (`seededScores`).
- Sesión falsa en cliente: login, registro, invitado y cerrar sesión, persistida en `localStorage` (`av_user`).
- Reproductor placeholder como la plantilla: marco CRT, arena animada por CSS, HUD (jugador, puntuación, vidas, nivel), puntaje simulado que sube solo, pausa, fin, modal de game over y guardado de puntuación en `localStorage` (`av_scores`).
- Filtro por nombre y por categoría en la biblioteca, con estado vacío "NO HAY RESULTADOS".
- Efecto tilt 3D en las tarjetas de juego.
- Cambiar `<html lang="en">` a `lang="es"` (la UI está en español).
- Rutas inexistentes (`/juegos/xxx`, `/jugar/xxx`) responden 404 con `notFound()`.

**Out of scope (para otras specs):**

- Cualquier juego real (lógica, canvas, input de teclado/táctil).
- Backend, base de datos, autenticación real, OAuth real (los botones GOOGLE y GITHUB son inertes).
- Leer `av_scores` en el salón o el detalle (se guarda pero no se muestra; el leaderboard es 100% mock).
- Validación de formularios, recuperación de contraseña, verificación de correo.
- Tests automatizados (el repo no tiene framework de tests).
- Panel "tweaks" (`.tw-*` en el CSS); no aparece en ninguna pantalla de la plantilla.
- Internacionalización; todo el texto queda en español fijo.

## Data model

```ts
// lib/games.ts
export type GameColor = "cyan" | "magenta" | "yellow" | "green";
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export interface Game {
  id: string;            // slug de ruta: "bloque-buster", "caida", ...
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;         // clase CSS existente: "cover-bricks", "cover-tetro", ...
  color: GameColor;
  best: number;
  plays: string;         // texto ya formateado: "12.4K"
}

export const GAMES: Game[];                       // los 8 juegos de data.jsx, mismo contenido
export const CATS: ("TODOS" | GameCategory)[];

// lib/scores.ts
export interface ScoreRow { rank: number; name: string; score: number; date: string }
export function seededScores(seed: number, count?: number): ScoreRow[]; // misma lógica determinista que data.jsx

// lib/auth.tsx (contexto cliente)
export interface User { name: string }            // MAYÚSCULAS, máx 10 caracteres
// useAuth(): { user: User | null; login(u: User | null): void; signOut(): void }

// lib/storage.ts
export interface SavedScore { game: string; score: number; name: string; at: number }
```

Claves de `localStorage` (sin versionado, igual que la plantilla):

- `av_user`: `User` serializado en JSON, o ausente si no hay sesión.
- `av_scores`: `SavedScore[]` serializado en JSON.

Convenciones:

- Formato numérico siempre `toLocaleString("es-ES")`.
- Los IDs de juego de `GAMES` son los slugs de URL.
- Todo acceso a `localStorage` va en `try/catch` y solo se ejecuta en cliente tras montar (nunca durante el render de servidor).

## Estructura de archivos

```
app/
  layout.tsx            (modificar: lang="es", AuthProvider, Nav, footer)
  page.tsx              (reemplazar: biblioteca)
  juegos/[id]/page.tsx  (detalle)
  jugar/[id]/page.tsx   (reproductor)
  acceso/page.tsx       (auth)
  salon/page.tsx        (salón de la fama)
components/
  nav.tsx               (client)
  footer.tsx
  game-card.tsx         (client, tilt)
  library.tsx           (client, búsqueda + chips)
  game-detail.tsx
  game-player.tsx       (client)
  auth-form.tsx         (client)
  hall-of-fame.tsx      (client)
lib/
  games.ts
  scores.ts
  auth.tsx              (client, contexto)
  storage.ts
```

Los nombres de componentes y rutas son decisión de esta spec; si el implementador necesita otro corte, debe justificarlo en el PR.

## Implementation plan

0. Leer la guía relevante de `node_modules/next/dist/docs/01-app` (routing, dynamic routes, `notFound`, Client Components, `next/link`, `useRouter`, `usePathname`, tipos `PageProps`/`LayoutProps`). Sin código.
1. Crear `lib/games.ts` y `lib/scores.ts` portando `data.jsx` a TypeScript. Cambiar `lang="en"` a `lang="es"` en `app/layout.tsx`. Verificar: `npm run build` pasa.
2. Crear `lib/auth.tsx` (contexto + `localStorage` `av_user`, leído tras montar), `components/nav.tsx` (links con `next/link`, estado activo con `usePathname`, panel móvil, botón sesión) y `components/footer.tsx`; montarlos en `app/layout.tsx` dentro de `<div id="root">` con `<main className="av-main">`. Verificar: navbar y footer visibles en `/`.
3. Biblioteca: `components/game-card.tsx`, `components/library.tsx` y `app/page.tsx` (hero, buscador, chips, grilla, estado vacío). Tarjeta navega a `/juegos/[id]`. Verificar: filtros funcionan.
4. Detalle: `components/game-detail.tsx` y `app/juegos/[id]/page.tsx` con `generateStaticParams` y `notFound()`. Botón "JUGAR AHORA" apunta a `/jugar/[id]`, "VOLVER AL VAULT" a `/`.
5. Acceso: `components/auth-form.tsx` y `app/acceso/page.tsx`. Pestañas entrar/crear (campo correo solo en crear), submit llama `login({ name })` y redirige a `/`; "JUGAR COMO INVITADO" llama `login(null)` y redirige a `/`.
6. Salón: `components/hall-of-fame.tsx` y `app/salon/page.tsx`. Tabs por juego, podio top 3, tabla animada, fila "TU MEJOR MARCA" solo con sesión, botón a `/`.
7. Reproductor: `lib/storage.ts`, `components/game-player.tsx` y `app/jugar/[id]/page.tsx` con `generateStaticParams` y `notFound()`. HUD, puntaje simulado cada 220 ms, subida de nivel, pausa/reanudar, FIN abre modal, guardar puntuación escribe en `av_scores`, "JUGAR DE NUEVO", "VOLVER AL VAULT", "SALIR" a `/juegos/[id]`.
8. Limpieza: eliminar restos del scaffold en `app/page.tsx` y cualquier import sin uso. Ejecutar `npm run lint` y `npm run build`.

## Acceptance criteria

- [ ] `npm run lint` termina sin errores ni warnings.
- [ ] `npm run build` termina sin errores.
- [ ] Existen las rutas `/`, `/juegos/bloque-buster`, `/jugar/bloque-buster`, `/acceso` y `/salon`, y cada una renderiza sin errores en la consola del navegador.
- [ ] `/` muestra exactamente 8 tarjetas de juego con la portada CSS correspondiente.
- [ ] Escribir "serp" en el buscador deja solo la tarjeta SERPENTINA; el chip "PUZZLE" deja solo CAÍDA; una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Click en una tarjeta o en su botón JUGAR navega a `/juegos/[id]` del juego correcto.
- [ ] `/juegos/inexistente` y `/jugar/inexistente` devuelven la página 404.
- [ ] El detalle muestra tags, descripción larga, 3 estadísticas y 10 filas de "MEJORES PUNTUACIONES"; recargar muestra las mismas puntuaciones (determinista).
- [ ] En `/acceso`, la pestaña "CREAR CUENTA" muestra el campo de correo y "INICIAR SESIÓN" lo oculta.
- [ ] Entrar con usuario "px_kai" guarda `{"name":"PX_KAI"}` en `localStorage["av_user"]`, redirige a `/` y la navbar muestra `PX_KAI ▾`.
- [ ] Con el campo usuario vacío, el login usa el nombre `PLAYER1`.
- [ ] Click en `PX_KAI ▾` cierra sesión: se elimina `av_user` y la navbar vuelve a "Iniciar Sesión".
- [ ] "JUGAR COMO INVITADO" redirige a `/` sin crear `av_user`.
- [ ] Recargar con `av_user` presente mantiene la sesión sin error de hidratación en consola.
- [ ] `/salon` muestra el podio con 3 posiciones, 12 filas en la tabla y cambia de datos al elegir otro juego en las tabs.
- [ ] La fila "TU MEJOR MARCA EN …" aparece solo con sesión iniciada.
- [ ] En `/jugar/[id]` la puntuación aumenta sola; PAUSA la detiene y muestra "EN PAUSA"; REANUDAR la reanuda.
- [ ] FIN abre el modal "FIN DEL JUEGO" con la puntuación final; "GUARDAR PUNTUACIÓN" añade una entrada a `localStorage["av_scores"]` y muestra "PUNTUACIÓN GUARDADA_".
- [ ] "JUGAR DE NUEVO" reinicia puntuación (0), vidas (3) y nivel (01); "VOLVER AL VAULT" navega a `/`.
- [ ] El link activo de la navbar es "Biblioteca" en `/`, `/juegos/*` y `/jugar/*`, y "Salón de la Fama" en `/salon`.
- [ ] A 375 px de ancho: los links de la navbar se ocultan, el botón `≡` abre el panel lateral con los links y se cierra al pulsar el fondo o un link; no hay scroll horizontal.
- [ ] `<html>` tiene `lang="es"`.
- [ ] La apariencia de cada pantalla coincide visualmente con `references/templates/Arcade Vault.html` abierto en el navegador (mismas clases, mismo texto).

## Decisions

- **Sí:** rutas reales del App Router. Dan URLs compartibles, 404 nativo y Server Components por defecto. **No:** SPA con hash como la plantilla; va contra el framework y no escala.
- **Sí:** `localStorage` con las claves `av_user` y `av_scores` de la plantilla. No hay backend y la plantilla ya lo define. **No:** solo memoria, porque el login falso no se sentiría real al recargar.
- **Sí:** guardar `av_scores` pero no leerlo todavía. Mezclar puntuaciones reales y mock agrega alcance que pertenece a una spec de ranking real.
- **Sí:** reproductor idéntico a la plantilla (puntaje simulado, modal de game over). **No:** pantalla estática "PRÓXIMAMENTE"; pierde el flujo que se quiere validar (jugar, terminar, guardar).
- **Sí:** `lib/` + `components/` en la raíz. Datos y componentes se reutilizan entre pantallas. **No:** todo dentro de `app/`.
- **Sí:** no tocar `globals.css`; ya contiene el tema portado.
- **Sí:** `seededScores` conserva su algoritmo determinista para que servidor y cliente generen los mismos datos y no haya errores de hidratación.
- **Sí:** estado de la tab del salón y de los filtros de la biblioteca en estado de cliente. **No:** query params; no se pidió compartir filtros.
- **Sí:** botones sociales GOOGLE y GITHUB inertes, como en la plantilla.
- **No:** tests automatizados; no hay framework instalado y agregarlo es otra decisión.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| Error de hidratación por leer `localStorage` en el primer render | Leer `av_user` en `useEffect` tras montar; la navbar muestra "Iniciar Sesión" hasta entonces. |
| Next 16.4.6 tiene cambios incompatibles con lo conocido (p. ej. `params` asíncrono, tipos `PageProps`) | Paso 0 obliga a leer `node_modules/next/dist/docs/` antes de escribir código. |
| `Math.random` en el puntaje simulado rompe el render de servidor | Solo se ejecuta dentro de `setInterval` en un efecto de cliente. |
| `localStorage` deshabilitado (modo privado) | Todo acceso va en `try/catch`; la app funciona sin persistir. |
| En el reproductor, el nombre inicial depende de `user`, que llega tras montar | Sincronizar el nombre con `user` en un efecto cuando cambie, mientras no se haya guardado. |
| El estado de la navbar (panel móvil abierto) persiste al navegar | Cerrar el panel en cada click de link. |

## What is **not** in this spec

- Ningún juego real jugable.
- Backend, autenticación real u OAuth real.
- Mostrar en el salón o detalle las puntuaciones guardadas en `av_scores`.
- Validación de formularios y recuperación de contraseña.
- Tests automatizados.
- Internacionalización y versión en otros idiomas.

Cada uno de estos puntos, si se aborda, va en su propia spec.
