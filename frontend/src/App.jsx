/*
  App.jsx — Orquestador de BookingSoft (Fase A de la descomposición).

  Antes: 6.665 líneas con estado, handlers, portal público y PMS en un
  solo componente. Ahora:
    · state/useAppState.js   → 69 useState + 31 handlers
    · context/AppContext.jsx → publicación del estado a las vistas
    · views/                 → una vista por pestaña
    · components/            → cabecera, footer, modales y lightbox
    · api/client.js          → HTTP centralizado
*/
import { useAppState } from './state/useAppState.js';
import { AppProvider, useApp } from './context/AppContext.jsx';

import Encabezados from './components/Encabezados.jsx';
import Footer from './components/Footer.jsx';
import ModalLogin from './components/ModalLogin.jsx';
import ModalGuestAuth from './components/ModalGuestAuth.jsx';
import ModalCompromiso from './components/ModalCompromiso.jsx';
import ModalLegal from './components/ModalLegal.jsx';
import LightboxGlobal from './components/LightboxGlobal.jsx';

import VistaInicio from './views/VistaInicio.jsx';
import VistaCatalogo from './views/VistaCatalogo.jsx';
import VistaServicios from './views/VistaServicios.jsx';
import VistaCentroNegocios from './views/VistaCentroNegocios.jsx';
import VistaGaleria from './views/VistaGaleria.jsx';
import VistaReservar from './views/VistaReservar.jsx';
import VistaPerfil from './views/VistaPerfil.jsx';
import VistaViajes from './views/VistaViajes.jsx';
import VistaPms from './views/VistaPms.jsx';

function AppLayout() {
  const {
    activeTab, showLoginModal, showGuestAuthModal, showCommunityCommitmentModal, aptoLightboxPhoto,
  } = useApp();

  return (
    <div className="app-container">

      {/* ENCABEZADOS CONDICIONALES: PMS INTERNO vs WEB PÚBLICA */}
      <Encabezados />

      {/* ============================================================
          VISTAS DEL PORTAL PÚBLICO Y DEL PMS INTERNO
          ========================================================== */}
      {/* Hero oficial / pestaña Inicio */}
      {activeTab === 'inicio' && <VistaInicio />}

      {/* Catálogo de apartamentos con galerías */}
      {(activeTab === 'apartamentos' || activeTab === 'inicio') && <VistaCatalogo />}

      {/* Servicios y amenidades */}
      {activeTab === 'servicios' && <VistaServicios />}

      {/* Centro de negocios público */}
      {activeTab === 'centro_negocios_pub' && <VistaCentroNegocios />}

      {/* Galería fotográfica con lightbox */}
      {activeTab === 'galeria' && <VistaGaleria />}

      {/* Motor de reservas público */}
      {activeTab === 'reservar' && <VistaReservar />}

      {/* Mi perfil */}
      {activeTab === 'perfil' && <VistaPerfil />}

      {/* Viajes y reservas del huéspede */}
      {activeTab === 'viajes' && <VistaViajes />}

      {/* Portal de empleados / PMS */}
      {activeTab === 'pms' && <VistaPms />}

      {/* WHATSAPP, FOOTER Y MODALES GLOBALES */}
      <Footer />
      {showLoginModal && <ModalLogin />}
      {showGuestAuthModal && <ModalGuestAuth />}
      {showCommunityCommitmentModal && <ModalCompromiso />}
      {aptoLightboxPhoto && <LightboxGlobal />}
      <ModalLegal />
    </div>
  );
}

function App() {
  const estado = useAppState();
  return (
    <AppProvider value={estado}>
      <AppLayout />
    </AppProvider>
  );
}

export default App;
