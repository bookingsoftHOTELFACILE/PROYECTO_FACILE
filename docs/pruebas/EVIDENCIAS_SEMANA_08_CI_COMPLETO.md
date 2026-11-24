# Evidencias Individuales y Guía de Rojos Provocados — Semana 8
**Proyecto:** BookingSoft (Apartamentos Facile) — SENA ADSO  
**Sustentación:** 30 de Noviembre de 2026  
**Documento de Soporte:** Criterios de Desempeño (40%) y Conocimiento (30%) de la Rúbrica Oficial

---

## 1. Instrucciones de Ejecución para los 4 Integrantes

Para cumplir con el **40% de Desempeño Individual** de la Semana 8, cada integrante debe abrir un Pull Request en su propia rama (`feat/*` o `test/*`), provocar un fallo intencional en su job, capturar el log y enlace de GitHub Actions, subir el commit de corrección y solicitar la revisión de un compañero de otra capa.

---

### Integrante 1: Capa Frontend (Job `frontend`)

* **Asignado a:** Especialista de Frontend
* **Archivo a modificar:** `frontend/vite.config.js`
* **Paso 1 (Provocar el Rojo):**
  Cambiar temporalmente los umbrales de cobertura a 99%:
  ```javascript
  thresholds: { lines: 99, statements: 99, functions: 99, branches: 99 }
  ```
* **Paso 2 (Hacer Commit y Push):**
  ```bash
  git commit -am "test(front): provocar fallo intencional de umbral al 99% para evidencia S8"
  git push origin <tu-rama>
  ```
* **Paso 3 (Resultado en GitHub Actions):**
  El job `frontend` se pondrá en **rojo**. El log mostrará:
  ```text
  ERROR: Coverage threshold for branches (99%) not met: 87.61%
  ```
  *Nota clave:* El paso de artefacto `upload-artifact` sube el reporte de cobertura HTML porque tiene `if: always()`.
* **Paso 4 (Corrección):**
  Restaurar los umbrales al 80% real:
  ```javascript
  thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 }
  ```
* **Paso 5 (Mutación Manual Documentada):**
  - *Archivo:* `frontend/src/utils/pricing.js`
  - *Cambio mutante:* Cambiar `if (n >= 15)` por `if (n > 15)`.
  - *Prueba que mata al mutante:* `frontend/src/utils/pricing.test.js :: it('aplica 15% desde 15 noches en adelante')` falla inmediatamente con 10 en lugar de 15.

---

### Integrante 2: Capa API / Backend (Job `backend`)

* **Asignado a:** Especialista de API Backend
* **Archivo a modificar:** `backend/tests/test_huespedes_y_empleados_cobertura.py`
* **Paso 1 (Provocar el Rojo):**
  Alterar la aserción de contraseña errónea en `test_login_huesped_caminos_y_errores`:
  ```python
  # Cambiar 401 por 200
  assert res_bad_pass.status_code == 200
  ```
* **Paso 2 (Hacer Commit y Push):**
  ```bash
  git commit -am "test(api): provocar fallo intencional en asercion de credenciales invalidas para evidencia S8"
  git push origin <tu-rama>
  ```
* **Paso 3 (Resultado en GitHub Actions):**
  El job `backend` o `integration` se pondrá en **rojo**. El log mostrará:
  ```text
  FAILED tests/test_huespedes_y_empleados_cobertura.py::test_login_huesped_caminos_y_errores
  assert 401 == 200
  ```
* **Paso 4 (Corrección):**
  Restaurar `assert res_bad_pass.status_code == 401`.
* **Paso 5 (Mutación Manual Documentada):**
  - *Archivo:* `backend/routes/huespedes.py`
  - *Cambio mutante:* En `login_huesped`, cambiar `elif not bcrypt.checkpw(...)` por `elif bcrypt.checkpw(...)`.
  - *Prueba que mata al mutante:* `test_login_huesped_caminos_y_errores` falla porque una contraseña incorrecta permitiría el acceso.

---

### Integrante 3: Capa Base de Datos e Integración (Job `integration`)

* **Asignado a:** Especialista de Base de Datos
* **Archivo a modificar:** `.github/workflows/ci.yml` (en el job `integration`)
* **Paso 1 (Provocar el Rojo):**
  Cambiar temporalmente el puerto o la variable de conexión:
  ```yaml
  DATABASE_URL: postgresql://adso_user:adso_password@localhost:5434/bookingsoft_test
  ```
* **Paso 2 (Hacer Commit y Push):**
  ```bash
  git commit -am "test(bd): provocar fallo intencional de conexion alterando puerto a 5434 para evidencia S8"
  git push origin <tu-rama>
  ```
* **Paso 3 (Resultado en GitHub Actions):**
  El job `integration` se pondrá en **rojo** mostrando:
  ```text
  psycopg2.OperationalError: could not connect to server: Connection refused
  Is the server running on host "localhost" and accepting TCP/IP connections on port 5434?
  ```
* **Paso 4 (Corrección):**
  Restaurar el puerto correcto a `5432`.
* **Paso 5 (Mutación Manual Documentada):**
  - *Archivo:* `backend/tests/test_bd_real_constraints.py`
  - *Cambio mutante:* En `schema.sql`, cambiar `VARCHAR(50)` por `TEXT` en el campo documento.
  - *Prueba que mata al mutante:* `test_guardar_texto_300_caracteres_en_varchar_50_falla_por_longitud` detecta que PostgreSQL ya no rechaza el desbordamiento.

---

### Integrante 4: Capa E2E (Job `e2e`)

* **Asignado a:** Especialista de Pruebas E2E
* **Archivo a modificar:** `E2E/tests/proteccion_doble_clic.spec.js`
* **Paso 1 (Provocar el Rojo):**
  Alterar la aserción de red de doble clic:
  ```javascript
  // Cambiar 1 por 2 peticiones esperadas
  expect(peticionesPostReservas).toBe(2);
  ```
* **Paso 2 (Hacer Commit y Push):**
  ```bash
  git commit -am "test(e2e): provocar fallo intencional en proteccion de doble clic para evidencia S8"
  git push origin <tu-rama>
  ```
* **Paso 3 (Resultado en GitHub Actions):**
  El job `e2e` se pondrá en **rojo** tanto en el intento inicial como en el `retry #1`. El log mostrará:
  ```text
  Error: expect(received).toBe(expected) // Object.is equality
  Expected: 2
  Received: 1
  ```
  *Nota clave:* GitHub Actions sube el artefacto `playwright-report` con el trace viewer descargable.
* **Paso 4 (Corrección):**
  Restaurar `expect(peticionesPostReservas).toBe(1)`.
* **Paso 5 (Mutación Manual Documentada):**
  - *Archivo:* Componente de confirmación de reserva en el Frontend.
  - *Cambio mutante:* Eliminar la propiedad `disabled={loading}` del botón de confirmar.
  - *Prueba que mata al mutante:* `proteccion_doble_clic.spec.js` captura que el botón permanece habilitado y emite 2 peticiones POST a la base de datos.

---

## 2. Resumen de Cobertura y Cumplimiento de Umbrales

| Capa | Estado Inicial S8 | Estado Final Alcanzado | Umbral Exigido | Cumplimiento |
|---|:---:|:---:|:---:|:---:|
| **Backend** | 73% (118 pruebas) | **83.68% (133 pruebas)** | ≥ 80% | **Superado (+3.68%)** |
| **Frontend** | 3.01% (28 pruebas) | **100% líneas / 87.6% ramas (35 pruebas)** | ≥ 80% | **Superado** |
| **Tests Skipped** | 0 | **0 tests saltados en todas las suites** | 0 | **100% Confiable** |
| **Workflow CI** | 3 jobs | **4 jobs paralelos con caché y artefactos** | 4 jobs | **Completo** |
