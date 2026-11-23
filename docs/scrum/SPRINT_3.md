# Informe de Sprint 3 — Pagos, Coworking, Mantenimiento y Pruebas

**Objetivo del Sprint:** Terminar los módulos de folio/pagos, aseo y mantenimiento, coworking y edición de reservas; limpiar la estructura del código y consolidar las pruebas automáticas.

---

## 1. Qué planeamos y qué alcanzó a entrar

- **Puntos comprometidos:** 51 puntos en total (`HU-008`, `HU-010`, `HU-013`, `HU-015` terminadas; `HU-007`, `HU-011` y `HU-012` quedaron documentadas como diferidas para una siguiente fase porque dependían de hardware o integraciones externas).

| Tarea | Qué se hizo | Responsable | Estado |
|---|---|---|:---:|
| **T-3.1** | Cálculo de folio en `services/folio.py` con desglose de IVA 19% y abonos | Maicol Mayor / David López | Listo |
| **T-3.2** | Tablero de Ama de Llaves para pasar habitaciones de `En limpieza` a `Disponible` | Sebastián Parada | Listo |
| **T-3.3** | Bitácora técnica de Mantenimiento para reportar daños y bloquear unidad | Sebastián Parada | Listo |
| **T-3.4** | Módulo de Salas de Juntas y Coworking por horas (`ModuloSalasCoworkingPMS.jsx`) | José Miguel Chico | Listo |
| **T-3.5** | Pasarela de pagos simulada (`pasarela.py`) y borrador de factura en XML | Maicol Mayor | Listo (simulado) |
| **T-3.6** | Dividir `App.jsx` (6.665 líneas) en vistas, componentes, contexto y `api/client.js` | José Miguel Chico | Listo |
| **T-3.7** | Ampliar pruebas en Pytest (pagos, coworking, edición RF-013, seguridad RBAC) | Maicol Mayor | Listo |
| **T-3.8** | Pruebas unitarias y de componentes en Vitest (precios, fechas, folio, HTTP) | Maicol Mayor / José Chico / David López | Listo |
| **T-3.9** | Auditoría interna de seguridad y corrección de endpoints sin rol (`H-01`, `H-02`) | Sebastián Parada / José Chico | Listo |
| **T-3.10** | Consolidar documentos de arquitectura, pruebas y requisitos | Ashly Echeverri / David López | Listo |

---

## 2. Qué problemas reales resolvimos en este Sprint

1. **Seguridad de endpoints (`H-01` y `H-02`):** En una revisión vimos que cancelar una reserva (`DELETE`) y consultar el inventario completo de habitaciones se podían llamar sin token. Se cerró con `requiere_rol(...)` y se dejó `/api/habitaciones/publicas` solo con los datos públicos para visitantes.
2. **Modularización del código:** Sacamos las vistas a `frontend/src/views/`, los modales a `components/` y la capa de base de datos del backend a `backend/repositories/base.py` para no repetir el código de conexión en cada archivo.
3. **Versión de Node para correr Vitest:** Descubrimos que en Node 18 Vitest fallaba por `jsdom@30`, así que fijamos Node `>= 20.19` en `frontend/package.json` y en GitHub Actions (`.github/workflows/ci.yml`).

---

## 3. Cierre y aprendizajes del Sprint 3

- **Qué salió bien:** Dejar funcionando todo el ciclo completo desde que el huésped entra (`Check-In`), paga en el folio (`ModalFolioReserva.jsx`), sale (`Check-Out` pasando a `En limpieza`) y se edita su reserva (`RF-013`), respaldado por pruebas automáticas.
- **Qué quedó pendiente para Fase 2:** Conectar una pasarela bancaria real (Wompi/PSE), timbrar facturas ante la DIAN y conectar cerraduras físicas Yale (solo se dejó la propuesta en `docs/arquitectura/`).
