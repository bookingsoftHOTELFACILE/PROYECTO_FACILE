# Informe de Planning Poker — Cómo puntuamos las Historias

**Facilitador (Scrum Master):** David López  
**Product Owner:** Ashly Echeverri  
**Participantes:** David López, José Miguel Chico, Maicol Mayor, Sebastián Parada y Ashly Echeverri  
**Escala usada:** Serie de Fibonacci (`1, 2, 3, 5, 8, 13, 21`)

---

## 1. Cómo lo hicimos

Para no poner números al azar, primero escogimos tres ejemplos de referencia que todo el grupo entendiera:
- **1 punto:** Cambiar un texto o enlace pequeño en el pie de página.
- **2 puntos (`HU-003`):** Listar empleados desde la base de datos con un filtro sencillo.
- **13 puntos (`HU-005`):** El motor completo de reservas con Check-In y Check-Out, porque toca base de datos, evitar que dos reservas se crucen en las mismas fechas y varios cambios en la interfaz.

Cada integrante votaba con su carta al tiempo y, cuando alguien ponía un número muy alto o muy bajo, nos explicaba por qué.

---

## 2. Discusiones principales durante la votación

### HU-001: Registro de usuarios y huéspedes
- **Primera ronda:** José (3), Maicol (3), Sebastián (5), David (2).
- **Qué hablamos:** David pensó que era rápido porque en React es un formulario normal, pero Sebastián explicó que en el backend había que encriptar la contraseña con `bcrypt`, validar que el correo tuviera formato válido y evitar cédulas o correos repetidos en PostgreSQL.
- **Acuerdo final:** **3 puntos**.

### HU-002: Inicio de sesión y permisos por rol (JWT + RBAC)
- **Primera ronda:** José (5), Maicol (5), Sebastián (8), David (3).
- **Qué hablamos:** No era solo validar usuario y clave; había que generar el token JWT, guardarlo en `localStorage` para que no se pierda al recargar con `F5`, y bloquear rutas según los 4 roles (Administrador, Recepcionista, Ama de llaves, Mantenimiento).
- **Acuerdo final:** **5 puntos**.

### HU-005: Reservas Walk-In, Check-In y Check-Out
- **Primera ronda:** José (13), Maicol (13), Sebastián (21), David (13).
- **Qué hablamos:** Sebastián propuso subirla a 21 por la idea de conectar cerraduras reales y pagos en línea. Acordamos dejar las cerraduras físicas como propuesta aparte para Fase 2 y centrarnos en que la base de datos bloqueara dobles reservas con `GiST`, calculara los descuentos y cambiara los estados de la habitación.
- **Acuerdo final:** **13 puntos**.

### HU-008: Módulo de limpieza y mantenimiento
- **Primera ronda:** José (5), Maicol (5), Sebastián (5), David (8).
- **Qué hablamos:** David la veía más larga por los tableros y filtros de habitaciones, pero José comentó que podíamos reutilizar las mismas tarjetas y modales que ya teníamos en el catálogo.
- **Acuerdo final:** **5 puntos**.

### HU-010: Folio y pagos de la reserva
- **Primera ronda:** José (13), Maicol (8), Sebastián (13), David (13).
- **Qué hablamos:** Manejar dinero, abonos parciales, IVA del 19% incluido, anulaciones y que no te deje cobrar más del saldo pendiente requiere mucho cuidado en las cuentas y varias pruebas.
- **Acuerdo final:** **13 puntos**.

### HU-013: Salas de Juntas y Coworking
- **Primera ronda:** José (8), Maicol (5), Sebastián (8), David (8).
- **Qué hablamos:** A diferencia de los apartamentos (que se cobran por noches), acá las reservas son por bloques de horas en un mismo día y con paquetes de 4 horas o día completo.
- **Acuerdo final:** **8 puntos**.

---

## 3. Lo que nos dejó este ejercicio

Votar en grupo nos sirvió bastante porque al principio el que hacía frontend pensaba que ciertas cosas eran fáciles, hasta que el que hacía backend o base de datos explicaba las validaciones que tocaba hacer detrás. Así repartimos mejor las tareas y no nos cargamos de trabajo imposible en un solo Sprint.
