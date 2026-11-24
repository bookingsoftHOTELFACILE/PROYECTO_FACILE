# 🧪 Informe de Pruebas Unitarias Automatizadas

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Fecha de Ejecución:** Noviembre 2026  
**Entorno de Ejecución:** Contenedor Docker `bookingsoft-backend` (Linux x86_64, Python 3.11.18, Pytest 8.2.2) y Node.js v24.13.1 (Vitest)  
**Responsable:** Maicol Mayor (QA Lead)  
**Total de Casos de Prueba Ejecutados:** **146 Casos Automatizados** (118 Backend Pytest + 28 Frontend Vitest)  
**Resultado Global:** **100% Pasados (0 Fallos, 0 Errores)**  

---

## 1. Resumen Ejecutivo de la Suite de Pruebas

| Módulo Evaluado | Framework | Casos Ejecutados | Casos Exitosos | Casos Fallidos | Tasa de Éxito |
|---|---|:---:|:---:|:---:|:---:|
| **Autenticación y Seguridad (Auth/RBAC)** | Pytest | 9 | 9 | 0 | 100% |
| **Centro de Negocios y Coworking** | Pytest | 12 | 12 | 0 | 100% |
| **Check-In / Check-Out Transaccional** | Pytest | 9 | 9 | 0 | 100% |
| **Consultas y Disponibilidad de Unidades** | Pytest | 4 | 4 | 0 | 100% |
| **Llave Digital Yale (Servicio IoT)** | Pytest | 18 | 18 | 0 | 100% |
| **Validaciones del Modelo Huésped** | Pytest | 8 | 8 | 0 | 100% |
| **Pagos, Folio Contable y Facturación** | Pytest | 13 | 13 | 0 | 100% |
| **Motor de Reservas y Concurrencia** | Pytest | 5 | 5 | 0 | 100% |
| **Servicio de Reservas y Tarifas (Límites)** | Pytest | 22 | 22 | 0 | 100% |
| **Edición y Actualización de Reservas** | Pytest | 10 | 10 | 0 | 100% |
| **Seguridad de Acceso y Permisos** | Pytest | 6 | 6 | 0 | 100% |
| **Restricciones de BD (FK y límites)** | Pytest | 2 | 2 | 0 | 100% |
| **Frontend: Utilidades, Catálogo y HTTP** | Vitest | 28 | 28 | 0 | 100% |
| **TOTAL CONSOLIDADO** | **Pytest + Vitest** | **146** | **146** | **0** | **100%** |

---

## 2. Detalle de Casos de Prueba Automatizados Representativos (Top 25 Casos Críticos)

A continuación se documenta el diseño formal de más de 20 casos distintos cubriendo entradas, lógica aplicada y resultado esperado:

### Módulo: Autenticación y Control de Acceso (test_auth.py)
1. **`test_registro_exitoso`**
   - *Objetivo:* Verificar que un nuevo colaborador se registre con contraseña hasheada y rol válido.
   - *Datos de entrada:* Correo único, contraseña `Secret2026!`, rol `Recepcionista 24h`.
   - *Resultado esperado:* HTTP 201 Created, ID generado, contraseña no expuesta en el JSON de respuesta.
   - *Estado:* ✅ PASS

2. **`test_registro_usuario_duplicado`**
   - *Objetivo:* Prevenir la duplicidad de cuentas por correo electrónico.
   - *Datos de entrada:* Mismo correo de un usuario previamente existente.
   - *Resultado esperado:* HTTP 400 Bad Request / 409 Conflict con mensaje descriptivo.
   - *Estado:* ✅ PASS

3. **`test_control_acceso_rol_sin_permiso`**
   - *Objetivo:* Comprobar que un usuario ajeno al área de recepción no pueda acceder a endpoints operativos de reservas.
   - *Datos de entrada:* Token JWT de `Ama de llaves` (`amallaves`) apuntando a `GET /api/reservas`.
   - *Resultado esperado:* HTTP 403 Forbidden.
   - *Estado:* ✅ PASS

4. **`test_control_acceso_firma_manipulada`**
   - *Objetivo:* Detectar alteraciones maliciosas en el payload o firma del JWT.
   - *Datos de entrada:* Token con firma modificada arbitrariamente.
   - *Resultado esperado:* HTTP 401 Unauthorized (`Could not validate credentials`).
   - *Estado:* ✅ PASS

### Módulo: Check-In / Check-Out y Estados (test_checkin_checkout.py)
5. **`test_checkin_registra_entrada_y_ocupa_unidad`**
   - *Objetivo:* Al registrar Check-In presencial, la unidad habitacional debe pasar a estado `Ocupada`.
   - *Datos de entrada:* ID de reserva confirmada para la fecha actual.
   - *Resultado esperado:* HTTP 200, estado de reserva = `Check-In`, estado de habitación = `Ocupada`.
   - *Estado:* ✅ PASS

6. **`test_checkin_rechaza_unidad_ocupada`**
   - *Objetivo:* Bloquear el Check-In si por inconsistencia la habitación ya tiene otro huésped alojado.
   - *Datos de entrada:* Asignación sobre unidad con flag `Ocupada`.
   - *Resultado esperado:* HTTP 409 Conflict.
   - *Estado:* ✅ PASS

7. **`test_checkout_registra_salida_calcula_noches_y_libera_unidad`**
   - *Objetivo:* El Check-Out debe marcar la habitación en estado `En limpieza` (no disponible hasta aseo) y fijar fecha real de salida.
   - *Datos de entrada:* Reserva activa con saldo en ceros.
   - *Resultado esperado:* HTTP 200, habitación en estado `En limpieza`.
   - *Estado:* ✅ PASS

### Módulo: Motor de Reservas y Prevención de Overbooking (test_reservas.py)
8. **`test_reserva_concurrencia_double_booking`**
   - *Objetivo:* Validar que dos solicitudes simultáneas para el mismo apartamento y fechas sean controladas por la base de datos.
   - *Datos de entrada:* Solicitud A (10 al 15 Nov) y Solicitud B (12 al 18 Nov) sobre Apto 201.
   - *Resultado esperado:* Solicitud A aceptada (HTTP 201), Solicitud B rechazada (HTTP 409 Conflict).
   - *Estado:* ✅ PASS

9. **`test_alta_atomica_rollback_si_reserva_falla`**
   - *Objetivo:* Si ocurre un fallo al vincular la reserva, la creación del huésped no debe dejar registros huérfanos.
   - *Datos de entrada:* Huésped válido con reserva con fechas corruptas intencionalmente.
   - *Resultado esperado:* Transacción abortada en PostgreSQL (Rollback automático).
   - *Estado:* ✅ PASS

### Módulo: Lógica Tarifaria y Valores Límite (test_reservas_service.py)
10. **`test_validar_fechas_reserva_rechaza_fechas_iguales_limite`**
    - *Objetivo:* Comprobar que una reserva no pueda tener la misma fecha de entrada y salida (estancia mínima: 1 noche).
    - *Datos de entrada:* `fecha_entrada = '2026-11-20'`, `fecha_salida = '2026-11-20'`.
    - *Resultado esperado:* ValueError / HTTP 400 con mensaje de error específico.
    - *Estado:* ✅ PASS

11. **`test_validar_fechas_reserva_salida_anterior_a_entrada`**
    - *Objetivo:* Rechazar rangos con inversión cronológica.
    - *Datos de entrada:* `fecha_entrada = '2026-11-25'`, `fecha_salida = '2026-11-22'`.
    - *Resultado esperado:* Rechazo con código de validación 400 / 422.
    - *Estado:* ✅ PASS

12. **`test_calcular_costo_estadia_valores_limite_descuento [6 noches - 0%]`**
    - *Objetivo:* Valor límite inferior: 6 noches no deben recibir descuento de larga estadía.
    - *Datos de entrada:* 6 noches a $250.000 COP.
    - *Resultado esperado:* Subtotal = $1.500.000, Descuento = $0 (0%).
    - *Estado:* ✅ PASS

13. **`test_calcular_costo_estadia_valores_limite_descuento [7 noches - 10%]`**
    - *Objetivo:* Valor límite exacto: a partir de 7 noches se activa 10% de ahorro automático.
    - *Datos de entrada:* 7 noches a $250.000 COP.
    - *Resultado esperado:* Subtotal = $1.750.000, Descuento = $175.000 (10%), Total = $1.575.000 COP.
    - *Estado:* ✅ PASS

14. **`test_calcular_costo_estadia_valores_limite_descuento [15 noches - 15%]`**
    - *Objetivo:* Valor límite superior: a partir de 15 noches se activa 15% de descuento mensual/quincenal.
    - *Datos de entrada:* 15 noches a $200.000 COP.
    - *Resultado esperado:* Descuento = $450.000 COP (15%).
    - *Estado:* ✅ PASS

15. **`test_calcular_costo_estadia_precio_negativo_falla`**
    - *Objetivo:* Protección contra tarifas corruptas menores a cero.
    - *Datos de entrada:* Tarifa = -$50.000 COP.
    - *Resultado esperado:* Aserción de excepción controlada.
    - *Estado:* ✅ PASS

### Módulo: Folio Contable y Liquidación (test_pagos.py)
16. **`test_folio_desglosa_iva_y_saldo`**
    - *Objetivo:* Validar la correcta formulación del folio contable hotelero.
    - *Datos de entrada:* Reserva de 2 noches por $500.000 COP.
    - *Resultado esperado:* Subtotal, IVA del 19% discriminado o exento según normativa hotelera, y saldo pendiente exacto.
    - *Estado:* ✅ PASS

17. **`test_pago_parcial_actualiza_saldo`**
    - *Objetivo:* Registro de un abono previo al Check-In y actualización del balance pendiente.
    - *Datos de entrada:* Total $500.000 COP, abono de $200.000 COP.
    - *Resultado esperado:* Saldo restante en folio = $300.000 COP, estado = `Parcial`.
    - *Estado:* ✅ PASS

18. **`test_pago_monto_mayor_al_saldo_se_rechaza`**
    - *Objetivo:* Evitar sobrepagos accidentales en ventanilla que generen descuadres de caja.
    - *Datos de entrada:* Saldo pendiente $100.000 COP, intento de cobro por $150.000 COP.
    - *Resultado esperado:* HTTP 400 Bad Request con mensaje: `El monto excede el saldo pendiente`.
    - *Estado:* ✅ PASS

19. **`test_no_se_cobra_sobre_reserva_cancelada`**
    - *Objetivo:* Bloquear cualquier transacción financiera sobre reservas inactivas.
    - *Datos de entrada:* Intento de cobro en reserva con estado `Cancelada`.
    - *Resultado esperado:* HTTP 400 Bad Request.
    - *Estado:* ✅ PASS

### Módulo: Centro de Negocios y Coworking (test_centro_negocios.py)
20. **`test_solapamiento_en_el_mismo_espacio_devuelve_409`**
   - *Objetivo:* Prevenir que dos reuniones reserven la misma sala en el mismo bloque horario.
   - *Datos de entrada:* Sala de Juntas 1, Reserva A (10:00 - 12:00), Reserva B (11:00 - 13:00).
   - *Resultado esperado:* HTTP 409 Conflict para la Reserva B.
   - *Estado:* ✅ PASS

21. **`test_horarios_contiguos_estan_permitidos`**
   - *Objetivo:* Permitir que una reserva inicie en el mismo minuto exacto que termina la anterior.
   - *Datos de entrada:* Reserva A (08:00 - 10:00) y Reserva B (10:00 - 12:00).
   - *Resultado esperado:* Ambas reservas creadas con HTTP 201 Created.
   - *Estado:* ✅ PASS

22. **`test_hora_fin_anterior_o_igual_es_rechazada`**
   - *Objetivo:* Validación de coherencia temporal en reservas horarias.
   - *Datos de entrada:* Hora inicio = 16:00, Hora fin = 15:00.
   - *Resultado esperado:* HTTP 422 Unprocessable Entity.
   - *Estado:* ✅ PASS

### Módulo: Validaciones de Huéspedes (test_model_huesped.py)
23. **`test_formato_correo_invalido_rechazado`**
   - *Objetivo:* Validar sintaxis estricta de correo electrónico mediante parametrización (`sin_arroba`, `usuario@`, `@dominio.com`).
   - *Resultado esperado:* Rechazo preventivo por esquema Pydantic antes de llegar a la base de datos.
   - *Estado:* ✅ PASS

24. **`test_rechaza_huesped_menor_de_edad_17_anos`**
   - *Objetivo:* Cumplimiento legal de registro hotelero en Colombia (huésped principal debe ser mayor de edad).
   - *Datos de entrada:* Fecha de nacimiento que calcula 17 años y 364 días.
   - *Resultado esperado:* Rechazo con advertencia de mayoría de edad requerida.
   - *Estado:* ✅ PASS

25. **`test_acepta_huesped_valor_limite_exacto_18_anos`**
   - *Objetivo:* Verificar que un huésped con exactamente 18 años cumplidos el día de hoy sea admitido.
   - *Datos de entrada:* Fecha de nacimiento de hace exactamente 18 años.
   - *Resultado esperado:* Registro exitoso (HTTP 201).
   - *Estado:* ✅ PASS

---

## 3. Comandos de Reproducción y Verificación

Para la auditoría y verificación por parte del comité evaluador del SENA:

1. **Ejecución de las 118 pruebas de backend:** Ejecutar el comando `pytest -v` directamente en el contenedor `bookingsoft-backend`.
2. **Reporte de cobertura de código:** Ejecutar `pytest` en `backend/` (la configuración en `backend/pyproject.toml` incluye `--cov=routes --cov=database --cov=services --cov-report=term-missing`).
3. **Ejecución de las 28 pruebas de frontend:** Ejecutar el comando `npm test -- --run` en el directorio `frontend/`.
