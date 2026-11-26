# 🎨 Criterio 10: Frontend, Vistas, Enrutamiento, Navegación, Sistema de Diseño (UX/UI) y PMS

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Tecnología:** React 18 + Vite + Tailwind CSS + Lucide Icons + ExcelJS  
**Fecha:** Noviembre 2026  
**Criterio Oficial:** Front-end (Pantallas, enrutamiento, navegación, manejo de colores, UX, UI).

---

## 1. Arquitectura de Navegación y Vistas de la SPA

La aplicación implementa una arquitectura desacoplada para atender dos grandes audiencias con una sola SPA optimizada:

### A. Vistas Públicas (Experiencia del Huésped):
1. **Inicio (`VistaInicio.jsx`):** Hero interactivo, llamado a la acción (*CTA*) de reserva rápida y servicios principales del apartahotel.
2. **Catálogo de Unidades (`VistaCatalogo.jsx` / `alojamientosData.js`):** Tarjetas de apartamentos con galería fotográfica, tipologías (Dúplex, Dobles, Familiares), tarifas por noche en COP y cálculo reactivo de descuentos.
3. **Galería General (`VistaGaleria.jsx`):** Visor multimedia con Lightbox accesible para recorrer las instalaciones y áreas comunes.
4. **Coworking & Salas (`VistaCentroNegocios.jsx`):** Catálogo de salas de juntas y puestos de coworking con especificaciones técnicas y reserva por bloques.
5. **Servicios Exclusivos (`VistaServicios.jsx`):** Información de valor agregado (Wi-Fi de alta velocidad, parqueadero, cerraduras inteligentes, aseo).
6. **Perfil de Huésped (`VistaPerfil.jsx`):** Consulta de datos personales y estado de cuenta.
7. **Mis Viajes (`VistaViajes.jsx`):** Historial de estancias pasadas y activas con opción de cancelación dentro de los plazos permitidos.

### B. Panel de Control Hotelero PMS (`VistaPms.jsx` - Uso Operativo Interno):
1. **👑 Personal & Roles:** Control integral de colaboradores con protección especial para la cuenta maestra creadora del software (`Administrador Grupo BookingSoft`), rol inmutable `Grupo BookingSoft`, contacto corporativo `bookingsoft4@gmail.com` y omisión de campo cédula.
2. **Recepción (Walk-In):** Formulario de registro rápido de reservas presenciales con validación de traslape en vivo.
3. **Gestión de Huéspedes:** Tabla paginada de huéspedes con activación/suspensión de perfiles según normatividad SIRE/TRA y DIAN.
4. **Módulo de Reservas:** Visualización en cuadrícula de reservas activas, estados (`Confirmada`, `Check-In`, `Completada`, `Cancelada`), botón para abrir el **Folio Contable** y modal de edición de reserva.
5. **Mantenimiento y Aseo:** Monitoreo del estado físico de las unidades (`Disponible`, `Ocupada`, `En limpieza`, `Mantenimiento`) para amas de llaves y personal técnico.
6. **Salas & Coworking:** Control de ocupación y liberación de espacios de negocio.

---

## 2. Modales Especializados de Alta Precisión

- **Modal Folio de la Reserva (#1218):**
  - Desglose transparente de la estadía: Noches x tarifa base, base gravable con IVA incluido, IVA 19%, total de la reserva, monto pagado y **saldo pendiente en rojo**.
  - **Cerradura Inteligente (IoT):** Bloque oscuro con indicador `MQTT v5.0 Conectado`, código RFID y PIN temporal de teclado (`049481 #`).
  - **Pasarela de Cobros:** Registro de abonos con 7 métodos de pago (`Efectivo`, `Tarjeta de crédito`, `Tarjeta de débito`, `PSE`, `Nequi`, `Transferencia`, `Bono`).
  - **Acciones Oficiales:** Descarga de Folio Contable en `.xlsx` estructurado (ExcelJS), visualización de Factura Electrónica DIAN (FEV / PDF) y descarga de Factura XML (UBL 2.1 con CUFE).
- **Modal Factura DIAN (`ModalFacturaDian.jsx`):** Representación gráfica oficial de factura electrónica con código QR fiscal, CUFE simulado y desglose tributario.

---

## 3. Sistema de Diseño UX/UI y Manejo de Colores

El sistema adopta una paleta cromática profesional y armónica basada en la identidad del apartahotel:

| Elemento Visual | Código Hexadecimal | Significado / Uso en UI |
|---|:---:|---|
| **Rojo Facile Primario** | `#d91a2a` | Color de marca, botones principales de acción (*CTA*), pestañas activas y branding. |
| **Pizarra Oscura (Navy)** | `#0f172a` | Encabezados de alta jerarquía, botones secundarios y panel IoT de cerraduras. |
| **Esmeralda Positivo** | `#059669` / `#ecfdf5` | Estados exitosos, disponibilidad confirmada, saldo pagado y telemetría activa. |
| **Ámbar Preventivo** | `#d97706` / `#fffbeb` | Estados parciales, unidades en limpieza y alertas operativas. |
| **Rojo Alerta** | `#b91c1c` / `#fee2e2` | Saldo pendiente por cobrar, habitaciones en mantenimiento o perfiles inactivos. |
| **Gris Neutro Suave** | `#f8fafc` / `#e2e8f0` | Fondos de contenedor, tarjetas y bordes sutiles para reducir fatiga visual. |

### Criterios de Accesibilidad (a11y):
- Contraste de texto conforme a **WCAG 2.1 AA** (ratio superior a 4.5:1).
- Localizadores accesibles en formularios mediante `aria-label`, `role="alert"` y etiquetas `<label>` vinculadas con `htmlFor`.
- Skeleton loaders accesibles y estados de carga (`aria-busy="true"`) para prevenir pantallas en blanco ante conexiones lentas.
