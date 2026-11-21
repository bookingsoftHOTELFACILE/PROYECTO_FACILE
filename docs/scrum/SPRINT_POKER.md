# 🃏 Informe de Planning Poker — Estimación Ágil de Historias de Usuario

**Proyecto:** BookingSoft PMS (Apartahotel Facile)  
**Fecha de Sesión:** Inicio de Ciclo de Desarrollo (Semana 1)  
**Facilitador (Scrum Master):** David López  
**Product Owner:** Ashly Echeverri  
**Participantes:** David López, José Miguel Chico, Maicol Mayor, Sebastián Parada, Ashly Echeverri  
**Técnica:** Planning Poker Ágil con cartas de la Secuencia de Fibonacci: **[1, 2, 3, 5, 8, 13, 21]**

---

## 1. Definición del Valor de Referencia (Baseline Story)

Para calibrar la escala del equipo, se eligió una historia base de complejidad mínima y conocida:
- **Historia Base (1 punto):** Modificar un mensaje informativo de pie de página en la vista web.
- **Historia de 2 puntos:** `HU-003: Consulta y listado de usuarios` (lectura paginada en BD con filtro simple).
- **Historia de referencia de 13 puntos (Épica / Gran Esfuerzo):** `HU-005: Check-In / Check-Out y asignación de unidades` (involucra bloqueo transaccional en PostgreSQL, prevención de overbooking, cambios de estado en tiempo real y UI interactiva de selección de habitación).

---

## 2. Registro de Rondas de Votación y Discusión Técnica

A continuación se detalla la bitácora de votación en donde se registraron las divergencias y el consenso final:

### HU-001: Registro de Nuevos Colaboradores y Usuarios
- **Votos Ronda 1:**
  - José Chico: 3 SP
  - Maicol Mayor: 3 SP
  - Sebastián Parada: 5 SP (argumentó necesidad de validar hash de contraseña Argon2/Bcrypt y formato de correo regex)
  - David López: 2 SP (consideraba que el formulario React era directo)
- **Discusión:** Sebastián explicó que la validación estricta de contraseñas y unicidad de documento de identidad en PostgreSQL aumentaba la complejidad del backend.
- **Consenso Ronda 2:** **3 SP** (Se acordó usar esquemas de validación nativos de Pydantic).

---

### HU-002: Autenticación JWT y Control de Roles (RBAC)
- **Votos Ronda 1:**
  - José Chico: 5 SP
  - Maicol Mayor: 5 SP
  - Sebastián Parada: 8 SP
  - David López: 3 SP
- **Discusión:** La persistencia segura del token en localStorage/cookies, el refresco del token y la interceptación en Axios/Fetch para redirigir si el token expira requieren middleware robusto.
- **Consenso Ronda 2:** **5 SP**

---

### HU-005: Motor de Reservas Walk-In, Check-In y Check-Out
- **Votos Ronda 1:**
  - José Chico: 13 SP
  - Maicol Mayor: 13 SP
  - Sebastián Parada: 21 SP (propuso dividir en dos historias por la complejidad de cerraduras y pagos)
  - David López: 13 SP
- **Discusión:** La historia comprende validación de solapamiento de fechas `[fecha_entrada, fecha_salida]`, cambio de estado de habitación a "Ocupada", generación de token de acceso y cálculo de cotización en vivo con impuestos. Es la historia núcleo del negocio.
- **Consenso Ronda 2:** **13 SP** (Se mantuvo en 13 SP manteniendo la lógica de cerraduras en modo desacoplado).

---

### HU-008: Módulo Operativo de Aseo y Mantenimiento
- **Votos Ronda 1:**
  - José Chico: 5 SP
  - Maicol Mayor: 5 SP
  - Sebastián Parada: 5 SP
  - David López: 8 SP (consideraba muchas tarjetas kanban)
- **Consenso Ronda 2:** **5 SP** (Reutilización de componentes modales ya existentes).

---

### HU-010: Gestión Financiera, Depósitos y Folio Contable
- **Votos Ronda 1:**
  - José Chico: 13 SP
  - Maicol Mayor: 8 SP
  - Sebastián Parada: 13 SP
  - David López: 13 SP
- **Discusión:** El balance contable exige consistencia estricta: cargos por noches + consumos de minibar + penalidades - depósitos en garantía = saldo neto. No puede haber discrepancias numéricas en moneda COP.
- **Consenso Ronda 2:** **13 SP**

---

### HU-013: Módulo de Coworking y Salas de Juntas
- **Votos Ronda 1:**
  - José Chico: 8 SP
  - Maicol Mayor: 5 SP
  - Sebastián Parada: 8 SP
  - David López: 8 SP
- **Consenso Ronda 2:** **8 SP** (Franjas horarias por horas en lugar de días completos).

---

## 3. Resumen Consolidado de Velocidad Estimada del Equipo

- **Capacidad estimada del equipo:** 30 - 35 Story Points por Sprint (para 5 integrantes).
- **Velocidad real alcanzada:**
  - **Sprint 1:** 13 SP completados (Sprint de calibración inicial de Docker, DB y Auth).
  - **Sprint 2:** 29 SP completados (Foco en el núcleo de reservas y catálogo).
  - **Sprint 3:** 51 SP completados (Esfuerzo intensificado de cierre y múltiples módulos funcionales).
- **Conclusión de la técnica:** El Planning Poker permitió nivelar la comprensión entre frontend y backend, evitando subestimar la complejidad de las validaciones de base de datos y la gestión de estados asíncronos en React.
