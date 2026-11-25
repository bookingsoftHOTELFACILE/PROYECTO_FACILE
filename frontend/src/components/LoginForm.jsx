import React, { useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react';

/**
 * Componente modal de inicio de sesión administrativo (PMS).
 * Permite a los empleados autenticarse con sus credenciales.
 *
 * @param {Object} props
 * @param {boolean} [props.isOpen=true] - Controla la visibilidad del modal.
 * @param {Function} props.onClose - Callback al cerrar el modal.
 * @param {Function} props.onSubmit - Callback al enviar credenciales ({ usuario, contrasena }).
 * @param {boolean} [props.loading=false] - Indicador de validación en progreso.
 * @param {string|null} [props.error=null] - Mensaje de error para credenciales inválidas.
 * @param {string} [props.initialUsuario=''] - Valor inicial opcional para usuario.
 * @param {string} [props.initialContrasena=''] - Valor inicial opcional para contraseña.
 */
export default function LoginForm({
  isOpen = true,
  onClose = () => {},
  onSubmit = () => {},
  loading = false,
  error = null,
  initialUsuario = '',
  initialContrasena = '',
}) {
  const [usuario, setUsuario] = useState(initialUsuario);
  const [contrasena, setContrasena] = useState(initialContrasena);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      usuario: usuario.trim(),
      contrasena,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="login-modal-backdrop">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>
            <Lock size={18} aria-hidden="true" /> Iniciar Sesión Empleado
          </h3>
          <button
            type="button"
            className="btn-x"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.2rem' }}>
          Ingrese con sus credenciales de empleado para acceder al sistema de gestión PMS.
        </p>

        <form onSubmit={handleSubmit} noValidate={false}>
          <div className="form-field">
            <label htmlFor="empleado-usuario">Usuario</label>
            <div className="field-input-wrap">
              <User className="field-icon" size={16} aria-hidden="true" />
              <input
                id="empleado-usuario"
                name="usuario"
                type="text"
                placeholder="Ej: admin"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="empleado-contrasena">Contraseña</label>
            <div className="field-input-wrap">
              <Lock className="field-icon" size={16} aria-hidden="true" />
              <input
                id="empleado-contrasena"
                name="contrasena"
                type="password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                color: '#b91c1c',
                background: '#fee2e2',
                padding: '0.5rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                marginBottom: '0.8rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-submit-red"
            disabled={loading}
          >
            <LogIn size={16} aria-hidden="true" /> {loading ? 'Validando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
