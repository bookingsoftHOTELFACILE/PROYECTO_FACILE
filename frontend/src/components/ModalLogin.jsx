/*
  ModalLogin — extraído de App.jsx durante la Fase A de descomposición.
  El estado y los handlers se consumen desde AppContext vía useApp().
*/
import {
  LogIn, Lock, User
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const ModalLogin = () => {
  const {
  loading, setShowLoginModal, loginForm, setLoginForm,
  loginError, handleLoginSubmit
  } = useApp();
  return (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>
                <Lock size={18}/> Iniciar Sesión Empleado
              </h3>
              <button className="btn-x" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.2rem' }}>
              Ingrese con sus credenciales de empleado para acceder al sistema de gestión PMS.
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-field">
                <label htmlFor="empleado-usuario">Usuario</label>
                <div className="field-input-wrap">
                  <User className="field-icon" size={16}/>
                  <input id="empleado-usuario" type="text" placeholder="Ej: admin" value={loginForm.usuario} onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })} required/>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="empleado-contrasena">Contraseña</label>
                <div className="field-input-wrap">
                  <Lock className="field-icon" size={16}/>
                  <input id="empleado-contrasena" type="password" placeholder="••••••••" value={loginForm.contrasena} onChange={(e) => setLoginForm({ ...loginForm, contrasena: e.target.value })} required/>
                </div>
              </div>

              {loginError && (
                <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px', fontSize: '0.78rem', marginBottom: '0.8rem' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button type="submit" className="btn-submit-red" disabled={loading}>
                <LogIn size={16}/> {loading ? 'Validando...' : 'Entrar al Sistema'}
              </button>
            </form>
          </div>
        </div>
  );
};

export default ModalLogin;
