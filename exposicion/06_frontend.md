# ⚛️ Parte 6: Frontend — React (App.jsx) explicado
> Todo el frontend vive en un solo archivo App.jsx. Aquí está explicado sección por sección.

---

## ¿Qué es React y por qué se usa?

React es una biblioteca de JavaScript para construir interfaces de usuario. En lugar de manipular el HTML directamente (como con jQuery), React trabaja con **componentes** y **estado**. Cuando el estado cambia, React actualiza automáticamente solo las partes de la pantalla que necesitan cambiar.

**¿Por qué un solo archivo `App.jsx`?**
Para este proyecto académico, toda la UI cabe en un solo componente. En proyectos más grandes se dividiría en múltiples componentes, pero para la escala de BookingSoft esto es suficiente y más fácil de explicar.

---

## `main.jsx` — El punto de entrada de React

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

Muy simple: encuentra el elemento `<div id="root">` del `index.html` e inyecta la aplicación React ahí. Todo el HTML que ve el usuario es generado dinámicamente por React, no escrito manualmente.

---

## Los datos iniciales — Modo Simulación

```jsx
const HUESPEDES_INICIALES = [
  { id_huesped: 1, nombre: "John Doe", documento: "12345678", ... },
  { id_huesped: 2, nombre: "Sofía Restrepo", documento: "98765432", ... },
  { id_huesped: 3, nombre: "Thomas Miller", documento: "PP998877", ... },
];

const HABITACIONES_INICIALES = [
  { id_habitacion: 1, numero: "101A", tipo: "Habitaciones", capacidad: 2, precio_noche: 243000, estado: "Disponible" },
  ...
];

const RESERVAS_INICIALES = [ ... ];
```

**¿Para qué sirven estos datos?**
El frontend tiene un "Modo Simulación": si el backend no está disponible (por ejemplo, en clase donde no hay Docker corriendo), el frontend funciona igual usando estos datos en memoria. El profesor puede ver el formulario, hacer registros y reservas, y todo funciona visualmente, aunque no persiste en ninguna BD.

Estos datos espejo los del `schema.sql` — los mismos huéspedes y habitaciones.

---

## El estado de React — `useState`

```jsx
function App() {
  const [backendActivo, setBackendActivo] = useState(false);
  const [huespedes,    setHuespedes]    = useState(HUESPEDES_INICIALES);
  const [habitaciones, setHabitaciones] = useState(HABITACIONES_INICIALES);
  const [reservas,     setReservas]     = useState(RESERVAS_INICIALES);
  const [formData,     setFormData]     = useState({ nombre: '', documento: '', ... });
  const [selectedHuesped, setSelectedHuesped] = useState(null);
  const [cotizacion, setCotizacion] = useState(null);
  const [alert, setAlert] = useState(null);
```

**¿Qué es `useState`?**
Es un "hook" de React que crea una variable reactiva. Cuando se llama `setHuespedes(nuevaLista)`, React automáticamente re-renderiza la pantalla mostrando la nueva lista. No hay que manipular el DOM manualmente.

**¿Por qué tantas variables de estado?**
Cada variable controla una parte diferente de la UI:
- `backendActivo`: el badge "Backend conectado / Modo Simulación" en el header
- `huespedes/habitaciones/reservas`: los datos que se muestran en las tablas
- `formData`: los campos del formulario de registro (cambia con cada tecla)
- `selectedHuesped`: el huésped seleccionado para hacer la reserva
- `cotizacion`: el desglose de precios calculado en tiempo real
- `alert`: el mensaje de éxito o error debajo de los formularios

---

## `useEffect` — Verificar si el backend está activo

```jsx
useEffect(() => {
  const verificarBackend = async () => {
    try {
      const res = await fetch(`/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        setBackendActivo(true);
        cargarDatosBackend();   // ← cargar datos reales si el backend está disponible
      }
    } catch {
      setBackendActivo(false);  // ← usar datos simulados
    }
  };
  verificarBackend();
}, []);  // ← [] significa "ejecutar solo al cargar la página"
```

**¿Qué es `useEffect`?**
Es un hook que ejecuta código cuando el componente carga o cuando cambia una dependencia. Con `[]` vacío, solo se ejecuta UNA vez al cargar la página.

**`AbortSignal.timeout(2000)`**: Si el backend no responde en 2 segundos, se cancela la petición y se activa el modo simulación. Sin esto, el usuario esperaría indefinidamente si el backend está caído.

**¿Por qué `/health` en vez de `http://localhost:4000/health`?**
Porque en producción (con Docker + Nginx), el frontend y el backend están en la misma URL base. Nginx redirige `/health` al backend internamente. Usar `http://localhost:4000` solo funcionaría en desarrollo local.

---

## `useEffect` — Cotización en tiempo real

```jsx
useEffect(() => {
  if (reservaData.id_habitacion && reservaData.fecha_entrada && reservaData.fecha_salida) {
    const eDt = new Date(reservaData.fecha_entrada);
    const sDt = new Date(reservaData.fecha_salida);
    const hab = habitaciones.find(h => h.id_habitacion === parseInt(reservaData.id_habitacion));
    
    if (sDt > eDt && hab) {
      const noches   = Math.ceil(Math.abs(sDt - eDt) / (1000 * 60 * 60 * 24));
      const subtotal = noches * hab.precio_noche;
      const descuento = noches > 15 ? subtotal * 0.15 : 0;
      setCotizacion({ noches, subtotal, descuento, total: subtotal - descuento });
    }
  }
}, [reservaData, habitaciones]);
```

Este `useEffect` tiene `[reservaData, habitaciones]` como dependencias. Se ejecuta CADA VEZ que el usuario cambia algún campo del formulario de reserva. Así la cotización se actualiza en tiempo real mientras el usuario escoge fechas.

**`(sDt - eDt) / (1000 * 60 * 60 * 24)`**: JavaScript trabaja fechas en milisegundos. Para convertir a días: ÷1000 (ms→s) ÷60 (s→min) ÷60 (min→h) ÷24 (h→días).

**La regla del 15%** es la misma que en `fn_calcular_noches_y_precio()` de la BD — se mantiene consistencia entre el cálculo del frontend (para preview) y el del backend (para el registro real).

---

## Registro de huésped — El flujo completo

```jsx
const handleUserSubmit = async (e) => {
  e.preventDefault();  // ← evita que el formulario recargue la página (comportamiento default HTML)

  // Verificar habeas data
  if (!habeasData) {
    setAlert({ type: 'error', message: 'Debe autorizar el tratamiento de datos...' });
    return;
  }

  // Validar campos vacíos
  if (!formData.nombre.trim() || !formData.documento.trim() || ...) { ... }

  setLoading(true);

  if (backendActivo) {
    // ── CON BACKEND ──────────────────────────────────
    const res = await fetch(`/api/user/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (res.ok) {
      setAlert({ type: 'success', message: data.message });
      cargarDatosBackend();  // refrescar la tabla de huéspedes
    } else {
      setAlert({ type: 'error', message: data.detail });
    }
  } else {
    // ── MODO SIMULACIÓN ───────────────────────────────
    const existe = huespedes.find(h => h.documento === formData.documento);
    if (existe) { setAlert({ type: 'error', ... }); return; }

    const nuevoHuesped = { id_huesped: Math.max(...ids) + 1, ...formData, lealtad: 'Silver', estado: 'Activo' };
    setHuespedes(prev => [...prev, nuevoHuesped]);  // agregar a la lista local
    setAlert({ type: 'success', message: '¡Registrado! (Modo Simulación)' });
  }
};
```

**`e.preventDefault()`**: Por defecto, cuando se hace submit de un formulario HTML, el navegador recarga la página. En React no queremos eso — manejamos el submit nosotros con JavaScript.

**`setHuespedes(prev => [...prev, nuevoHuesped])`**: El operador spread `...prev` copia todos los huéspedes existentes. Luego agrega el nuevo al final. En React, el estado es inmutable — siempre se crea un nuevo array en lugar de modificar el existente.

---

## La UI — JSX y los componentes visuales

```jsx
return (
  <div className="app-container">
    <div className="bg-overlay" />

    <header className="app-header">
      <span className="logo-icon">🏨</span>
      <h1>BookingSoft</h1>
      <p>Apartamentos Facile — Calle 97 #21-62, Bogotá Chicó</p>

      {/* Badge dinámico que cambia según backendActivo */}
      <span style={{ color: backendActivo ? '#4ade80' : '#fbbf24' }}>
        {backendActivo ? <Wifi size={13}/> : <WifiOff size={13}/>}
        {backendActivo ? 'Backend FastAPI conectado' : 'Modo Simulación (sin backend)'}
      </span>
    </header>

    <main className="main-content">
      {/* Columna izquierda: formularios */}
      <div className="column-flow">
        <section>PASO 1: Registro de Huésped</section>
        <section>PASO 2: Crear Reserva</section>
      </div>

      {/* Columna derecha: tablas de datos */}
      <div className="column-db">
        <section>Tabla de Huéspedes</section>
        <section>Tabla de Reservas</section>
      </div>
    </main>

    <footer>© 2026 BookingSoft</footer>
  </div>
);
```

**¿Qué es JSX?**
JSX es la sintaxis de React que combina HTML y JavaScript. No es HTML real — Vite lo compila a llamadas de `React.createElement()`. Las llaves `{}` permiten insertar JavaScript dentro del HTML: `{backendActivo ? 'Conectado' : 'Simulación'}`.

**Iconos de `lucide-react`:**
```jsx
import { UserPlus, ShieldCheck, Mail, Phone, Wifi, WifiOff, ... } from 'lucide-react';
```
Lucide es una biblioteca de iconos SVG como componentes React. Cada `<Wifi size={13}/>` renderiza un ícono SVG escalable sin necesidad de imágenes.

---

## `vite.config.js` — El proxy de desarrollo

```js
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})
```

**¿Para qué sirve este proxy?**
En desarrollo local (sin Docker), el frontend corre en el puerto 3000 y el backend en el 4000. Sin el proxy, el navegador bloquearía las peticiones por CORS. Con el proxy, cuando el frontend llama a `/api/algo`, Vite intercepta la petición y la reenvía a `http://localhost:4000/api/algo` internamente — el navegador nunca ve el cambio de puerto.

**En producción (Docker):** Nginx hace el mismo trabajo con `proxy_pass http://backend:4000/api/`. El `vite.config.js` solo aplica durante el desarrollo local con `npm run dev`.

---

## `index.css` — El sistema de estilos

El CSS define el diseño completo de la interfaz:
- **Variables CSS:** colores, sombras y gradientes definidos una vez y reutilizados
- **Glassmorphism:** efecto de vidrio esmerilado en las tarjetas (`backdrop-filter: blur`)
- **Modo oscuro:** fondo oscuro con colores dorados y verdes (`#c9a84c`, `#4ade80`)
- **Animaciones:** `fade-in` con `@keyframes` para los mensajes de alerta
- **Layout:** `display: grid` para la distribución de columnas

---

## Resumen del flujo completo usuario → BD

```
1. Usuario abre http://localhost:3000
2. Nginx sirve index.html + App.jsx compilado
3. React carga → useEffect verifica /health
4. Backend responde OK → React llama /api/huespedes, /api/habitaciones, /api/reservas
5. Las tablas se llenan con datos reales de PostgreSQL

6. Usuario llena el formulario y hace submit
7. React llama POST /api/user/registro con JSON
8. Nginx recibe la petición y la redirige a backend:4000
9. FastAPI valida el JWT (si aplica) y el payload con Pydantic
10. Python ejecuta SQL contra PostgreSQL
11. PostgreSQL valida constraints y ejecuta triggers
12. Respuesta viaja de vuelta: PostgreSQL → Python → Nginx → React → UI
13. React actualiza el estado → la tabla se actualiza automáticamente
```
