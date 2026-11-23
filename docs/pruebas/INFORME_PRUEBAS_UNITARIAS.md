# Informe de Pruebas Unitarias Automatizadas — BookingSoft

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Responsables:** Maicol Mayor, José Chico, David López, Sebastián Parada y Ashly Echeverri  
**Herramientas usadas:** Pytest (Backend en Docker con Python 3.11) y Vitest (Frontend con Node >= 20.19)

---

## 1. Resumen de Pruebas Ejecutadas

Actualmente en la rama `develop` contamos con **98 pruebas en Backend (Pytest)** y **28 pruebas en Frontend (Vitest)** (126 casos automatizados en total), superando ampliamente el mínimo de **20 casos unitarios distintos** solicitados.

| Qué se probó | Herramienta | Cantidad de casos | Resultado |
|---|---|:---:|:---:|
| Autenticación, JWT y roles (`test_auth.py`) | Pytest | 9 | Pasando |
| Seguridad y control de acceso (`test_seguridad_acceso.py`) | Pytest | 6 | Pasando |
| Consultas y disponibilidad (`test_consultas.py`) | Pytest | 4 | Pasando |
| Modelo Huésped y límites (`test_model_huesped.py`) | Pytest | 8 | Pasando |
| Restricciones de BD (`test_bd_real_constraints.py`) | Pytest | 2 | Pasando |
| Reglas de negocio de reservas (`test_reservas_service.py`) | Pytest | 22 | Pasando |
| Reservas y doble reserva GiST (`test_reservas.py`) | Pytest | 5 | Pasando |
| Check-In y Check-Out (`test_checkin_checkout.py`) | Pytest | 7 | Pasando |
| Pagos, folio e IVA (`test_pagos.py`) | Pytest | 13 | Pasando |
| Edición de reservas RF-013 (`test_reservas_update.py`) | Pytest | 10 | Pasando |
| Salas de juntas y coworking (`test_centro_negocios.py`) | Pytest | 12 | Pasando |
| Frontend: precios, fechas, folio, catálogo y HTTP | Vitest | 28 | Pasando |

---

## 2. Detalle de 25 Casos Representativos (Qué prueba cada uno)

### Reglas de Reservas, Descuentos y Fechas (`test_reservas_service.py` y `dateUtils.test.js`)
1. **`test_validar_fechas_reserva_acepta_rango_valido`**: Verifica que si la salida es después de la entrada (`2026-07-01` a `2026-07-05`), la reserva se acepta.
2. **`test_validar_fechas_reserva_rechaza_fechas_iguales_limite`**: Caso borde donde entrada y salida son el mismo día; debe rechazarla porque mínimo es 1 noche.
3. **`test_validar_fechas_reserva_casos_invalidos_parametrizados`**: Prueba fechas al revés (salida antes que entrada) y textos mal escritos como `"2026-13-45"`.
4. **`test_validar_habitacion_disponible_rechaza_mantenimiento`**: Confirma que una habitación marcada en `'Mantenimiento'` no deje reservar.
5. **`test_calcular_costo_estadia_valores_limite_descuento` (6 noches)**: Con 6 noches el descuento debe ser `0%`.
6. **`test_calcular_costo_estadia_valores_limite_descuento` (7 noches)**: Al llegar exactamente a 7 noches, activa el `10%` de descuento.
7. **`test_calcular_costo_estadia_valores_limite_descuento` (15 noches)**: Al llegar exactamente a 15 noches, activa el `15%` de descuento.
8. **`test_calcular_costo_estadia_precio_negativo_falla`**: Si alguien intenta meter un precio negativo (`-50000`), lanza error de validación.
9. **`dateUtils.test.js` (noches sin desfase UTC)**: Comprueba que entre `2026-11-09` y `2026-11-20` calcule exactamente 11 noches sin restar un día por zona horaria.

### Validaciones del Modelo Huésped y Esquema (`test_model_huesped.py` y `test_bd_real_constraints.py`)
10. **`test_campos_obligatorios_huesped`**: Verifica que si falta `documento` o `correo`, Pydantic rechace el registro.
11. **`test_formato_correo_invalido_rechazado`**: Prueba 5 correos inválidos (`sin_arroba.com`, `usuario@`, etc.) y confirma que todos se rechazan.
12. **`test_rechaza_huesped_menor_de_edad_17_anos`**: Caso borde de alguien con 17 años respecto a una fecha fija; debe ser rechazado.
13. **`test_acepta_huesped_valor_limite_exacto_18_anos`**: Caso borde exacto de alguien que cumple 18 años en la fecha de referencia; sí lo deja registrarse.
14. **`test_insertar_reserva_con_huesped_inexistente_falla_por_foreign_key`**: Verifica que no deje guardar una reserva para un `id_huesped` (`99999`) que no existe.
15. **`test_guardar_texto_300_caracteres_en_varchar_50_falla_por_longitud`**: Verifica que un usuario de 300 letras falle al respetar el límite `VARCHAR(50)`.

### Seguridad, Reservas, Check-In/Out, Pagos y Coworking
16. **`test_login_credenciales_incorrectas`**: Confirma que una clave mala responda `401` con mensaje genérico.
17. **`test_control_acceso_rol_sin_permiso`**: Un usuario `Ama de llaves` intentando entrar a `GET /api/reservas` debe recibir `403 Forbidden`.
18. **`test_control_acceso_firma_manipulada`**: Un token JWT modificado a la fuerza debe recibir `401 Unauthorized`.
19. **`test_reserva_concurrencia_double_booking`**: Dos reservas sobre la misma habitación en fechas cruzadas: la primera pasa y la segunda se bloquea por el `GiST` de PostgreSQL.
20. **`test_checkin_registra_entrada_y_ocupa_unidad`**: Al hacer Check-In, la reserva pasa a `'Check-In'` y la habitación a `'Ocupada'`.
21. **`test_checkout_registra_salida_calcula_noches_y_libera_unidad`**: Al hacer Check-Out, la habitación pasa obligatoriamente a `'En limpieza'` (no queda disponible de una vez).
22. **`test_pago_monto_mayor_al_saldo_se_rechaza`**: Impide cobrar en ventanilla más dinero del saldo que debe el huésped.
23. **`test_no_se_cobra_sobre_reserva_cancelada`**: Bloquea cualquier cobro si la reserva ya fue cancelada.
24. **`test_solapamiento_en_el_mismo_espacio_devuelve_409`**: Impide reservar la misma sala de juntas en horas que se cruzan.
25. **`httpClient.test.js` (oculta error técnico SQL en HTTP 500)**: Comprueba que si el backend responde `500` con un error de `psycopg2`, la pantalla muestra un mensaje amigable al usuario sin mostrar código SQL.

---

## 3. Cómo correr las pruebas en vivo

```bash
# 1. Correr todas las pruebas de Backend dentro de Docker
docker compose exec backend pytest -v

# 2. Ver cobertura del Backend
docker compose exec backend pytest --cov=routes --cov=database --cov=services --cov-report=term-missing

# 3. Correr pruebas del Frontend
cd frontend && npm test -- --run
```
