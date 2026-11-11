/*
  AppContext — puente entre useAppState() (dueño del estado) y las vistas.

  ¿Para qué? Evitar el paso de props en cascada: App.jsx crea el estado y
             lo publica; cada vista consume solo lo que necesita con
             `const { ... } = useApp()`.
*/
import { createContext, useContext } from 'react';

const AppContext = createContext(null);

export function AppProvider({ value, children }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp debe usarse dentro de <AppProvider>.');
  }
  return ctx;
}

export default AppContext;
