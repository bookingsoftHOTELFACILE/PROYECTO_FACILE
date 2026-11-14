import {
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const ModalLegal = () => {
  const { reservas, modalLegalTipo, setModalLegalTipo } = useApp();

    if (!modalLegalTipo) return null;

    let titulo = '';
    let contenido = null;

    if (modalLegalTipo === 'terminos') {
      titulo = '📜 Términos del Servicio de Hospedaje — Apartahotel Facile';
      contenido = (
        <>
          <p>Los presentes Términos del Servicio de Hospedaje regulan la relación jurídica y contractual entre el usuario o huésped (en adelante, "el Huésped") y <strong>Apartahotel Facile S.A.S.</strong> (ubicado en Bogotá D.C., Colombia) gestionado a través de la plataforma tecnológica <strong>BookingSoft PMS</strong>. Al realizar una reserva, registrarse en la plataforma o hacer uso de nuestras instalaciones, usted declara haber leído, comprendido y aceptado en su totalidad los siguientes términos y condiciones:</p>
          
          <h4>1. Naturaleza del Contrato de Alojamiento</h4>
          <p>El contrato de hospedaje suscrito es de naturaleza civil y comercial de arrendamiento de servicio de alojamiento por días, regulado por la Ley General de Turismo (Ley 300 de 1996, Ley 1558 de 2012 y Ley 2068 de 2020 de la República de Colombia). La admisión a las instalaciones está supeditada al registro legal completo de cada ocupante en la recepción o en el canal digital del sistema.</p>

          <h4>2. Registro, Identificación Obligatoria y Edades</h4>
          <p>Todo huésped titular y acompañante debe presentar al momento del ingreso o en el registro digital un documento de identidad oficial físico y vigente (Cédula de Ciudadanía para nacionales colombianos, Cédula de Extranjería o Pasaporte original con sello de ingreso vigente para extranjeros). Queda estrictamente prohibido el ingreso de menores de edad que no estén acompañados por sus padres o por un tutor legal debidamente acreditado con autorización notariada y registro civil de nacimiento, en cumplimiento estricto de la Ley 679 de 2001 y Ley 1336 de 2009 sobre prevención de la explotación sexual de niños, niñas y adolescentes (ESCNNA).</p>

          <h4>3. Horarios de Check-In, Check-Out y Salida Tardía</h4>
          <p>El horario oficial de ingreso (Check-In) es a partir de las <strong>3:00 PM (15:00 horas)</strong>. El horario oficial de salida (Check-Out) y entrega del apartamento es como máximo a las <strong>11:00 AM (11:00 horas)</strong> del día de finalización de su reserva. El incumplimiento del horario de salida sin previa autorización de la recepción generará un cobro automático por recargo de salida tardía (Late Check-Out) equivalente al 50% de la tarifa diaria si la salida se realiza antes de las 3:00 PM, o del 100% de la tarifa diaria si se realiza posterior a las 3:00 PM.</p>

          <h4>4. Capacidad de Alojamiento y Política de Visitas</h4>
          <p>Cada tipo de apartamento (Sencillo, Doble, Suite) posee un límite máximo de ocupantes estrictamente regulado. Queda rotundamente prohibido superar el número de personas declaradas en la reserva. Las visitas externas únicamente están permitidas en el área del lobby y Business Center de 8:00 AM a 8:00 PM. No se autoriza el acceso de visitantes a los apartamentos ni a las áreas privadas sin previo registro en recepción con documento de identidad y pago de la tarifa por huésped adicional.</p>

          <h4>5. Convivencia, Silencio y Sustancias Prohibidas</h4>
          <p>Para garantizar el descanso y bienestar de todos los huéspedes, se establece una <strong>franja estricta de silencio obligatorio desde las 10:00 PM hasta las 7:00 AM</strong>. Queda totalmente prohibida la realización de fiestas, eventos masivos, reproductores de audio a alto volumen, el consumo de cigarrillos o vapeadores dentro de los apartamentos (espacio 100% libre de humo Ley 1335 de 2009), así como el consumo o porte de sustancias psicoactivas ilícitas o armas de cualquier índole.</p>

          <h4>6. Custodia, Daños e Inventario del Inmueble</h4>
          <p>El Huésped titular es el responsable directo de la conservación y buen estado de la planta física, mobiliario, electrodomésticos, lencería y llaves/tarjetas de acceso entregadas. Al ingresar, el huésped dispone de dos (2) horas para reportar cualquier anomalía previa. Todo daño, mancha indeleble, rotura de elementos o pérdida de activos será facturado directamente a la cuenta del huésped con base en la lista de reposición oficial de Apartahotel Facile.</p>
        </>
      );
    } else if (modalLegalTipo === 'pagos') {
      titulo = '💳 Términos de Pago, Tarifas y Políticas de Cancelación — BookingSoft';
      contenido = (
        <>
          <p>Los presentes Términos de Pago regulan la gestión financiera, cobranza, aplicación de tarifas y políticas de cancelación administradas por la plataforma <strong>BookingSoft Payments</strong> para las reservas efectuadas en <strong>Apartahotel Facile</strong> (Bogotá, Colombia):</p>

          <h4>1. Moneda, Tasas e Impuestos</h4>
          <p>Todas las tarifas de alojamiento, servicios de coworking y consumos adicionales se expresan y liquidan en <strong>Pesos Colombianos (COP)</strong>. Las tarifas publicadas en la web incluyen los impuestos de ley vigentes en Colombia, incluyendo el Impuesto al Valor Agregado (IVA) para residentes nacionales conforme a la normativa de la DIAN y la exención tributaria de IVA en alojamiento exclusivamente para turistas extranjeros no residentes que presenten pasaporte con sello de entrada PIP-3, PIP-5, PIP-6, TP-7, TP-11 o V (Visa de Turismo).</p>

          <h4>2. Descuentos Automatizados por Larga Estadía</h4>
          <p>BookingSoft PMS aplica un motor de liquidación tarifaria inteligente que incentiva la permanencia prolongada. Los descuentos se aplican automáticamente sobre la tarifa base del alojamiento:</p>
          <ul>
            <li><strong>Descuento del 10%:</strong> Aplicable a reservas continuas de 7 a 14 noches.</li>
            <li><strong>Descuento del 15%:</strong> Aplicable a reservas continuas de 15 noches o más.</li>
          </ul>
          <p>Si una reserva con descuento de larga estadía es modificada o acortada por el huésped antes de cumplir el periodo mínimo exigido, el descuento acumulado se recalculará retroactivamente y la diferencia tarifaria será cobrada al momento del saldo final.</p>

          <h4>3. Medios de Pago Autorizados</h4>
          <p>Aceptamos pagos electrónicos mediante tarjetas de crédito o débito (Visa, Mastercard, American Express), transferencias bancarias directas, pasarelas de pago PSE / Wompi y pagos en efectivo o terminal datáfono al momento del registro presencial en recepción. Toda reserva web queda sujeta a la validación de fondos o confirmación de comprobante bancario.</p>

          <h4>4. Política de Cancelación y Reembolsos</h4>
          <p>Comprendemos que los planes de viaje pueden cambiar. Nuestra política de cancelación estandarizada establece lo siguiente:</p>
          <ul>
            <li><strong>Cancelación Gratuita (Más de 48 Horas antes):</strong> El huésped puede cancelar su reserva de manera totalmente gratuita y sin penalidad hasta 48 horas antes de las 3:00 PM del día oficial de check-in. Los reembolsos de depósitos previos se procesarán en un plazo de 3 a 5 días hábiles a la misma cuenta o tarjeta de origen.</li>
            <li><strong>Cancelación Tardía (Menos de 48 Horas antes):</strong> Toda cancelación efectuada dentro de las 48 horas previas al check-in estará sujeta al cobro de una penalidad administrativa equivalente al 100% del valor de la primera noche de estancia.</li>
            <li><strong>No Presentación (No-Show):</strong> Si el huésped no se presenta antes de las 11:59 PM del día de llegada sin notificación escrita previa, la reserva será declarada "No-Show". Se cobrará el valor de la primera noche y las noches posteriores quedarán liberadas automáticamente en el PMS.</li>
          </ul>
        </>
      );
    } else if (modalLegalTipo === 'discriminacion') {
      titulo = '🤝 Política Inclusiva y Contra la Discriminación — Apartahotel Facile';
      contenido = (
        <>
          <p>En <strong>Apartahotel Facile</strong> y <strong>BookingSoft</strong> creemos que la hospitalidad auténtica exige un entorno fundamentado en el respeto, la dignidad humana, la equidad y la plena inclusión. Esta política establece nuestras pautas obligatorias de convivencia y servicio:</p>

          <h4>1. Declaración de Tolerancia Cero</h4>
          <p>Queda rotundamente prohibida cualquier conducta, comentario, sesgo, restricción de acceso o trato diferenciado de carácter discriminatorio dirigido contra cualquier huésped, visitante, colaborador o proveedor de servicios. Esta prohibición abarca motivos fundados en etnia, raza, origen nacional o regional, religión, creencia filosófica, sexo, orientación sexual, identidad de género, expresión de género, edad, estado civil, condición socioeconómica, discapacidad física, sensorial o cognitiva.</p>

          <h4>2. Garantía de Acceso Equitativo y Trato Digno</h4>
          <p>Todos los usuarios de Apartahotel Facile tienen derecho a acceder a los servicios de alojamiento, áreas comunes, salones de negocios y servicios de recepción en igualdad de condiciones. Nuestro equipo de trabajo está capacitado para brindar una atención empática, respetuosa y libre de prejuicios a toda la comunidad nacional e internacional.</p>

          <h4>3. Mascotas de Asistencia y Accesibilidad</h4>
          <p>En cumplimiento de las leyes colombianas de accesibilidad, los perros guía y animales de asistencia debidamente certificados para personas con discapacidad tienen acceso libre y garantizado a las instalaciones del apartahotel sin costo adicional.</p>

          <h4>4. Procedimiento de Denuncia y Sanciones</h4>
          <p>Cualquier incidente discriminatorio reportado será investigado de manera prioritaria por la administración de Apartahotel Facile. El incumplimiento de esta política por parte de un huésped o visitante dará lugar a la cancelación inmediata de su contrato de hospedaje sin derecho a reembolso, la expulsión de las instalaciones y el correspondiente reporte ante la Policía Nacional de Colombia en virtud de la Ley 1482 de 2011 (Ley Antidiscriminación) y el Código Nacional de Seguridad y Convivencia Ciudadana.</p>
        </>
      );
    } else if (modalLegalTipo === 'ley1581') {
      titulo = '🛡️ Tratamiento de Datos Personales (Ley 1581 de 2012 de Colombia)';
      contenido = (
        <>
          <p>En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong>, el Decreto Reglamentario 1377 de 2013 y demás normas concordantes de la República de Colombia, <strong>Apartahotel Facile S.A.S.</strong> y <strong>BookingSoft PMS</strong> informan a sus huéspedes, usuarios y clientes el tratamiento que se le da a sus datos personales:</p>

          <h4>1. Identificación de los Responsables del Tratamiento</h4>
          <p><strong>Responsable principal:</strong> Apartahotel Facile S.A.S., con domicilio en Bogotá D.C., Colombia.<br />
          <strong>Encargado tecnológico del procesamiento:</strong> Plataforma BookingSoft PMS.</p>

          <h4>2. Finalidades Específicas de la Recolección</h4>
          <p>Los datos personales solicitados (nombre completo, tipo y número de documento de identidad, nacionalidad, dirección de correo electrónico, número telefónico, fecha de nacimiento y datos de tarjeta de crédito/débito) son recolectados con las siguientes finalidades explícitas:</p>
          <ul>
            <li>Validar y procesar la reserva de alojamiento y la confirmación del servicio.</li>
            <li>Cumplir con las obligaciones legales de registro hotelero nacional expedidas por el Ministerio de Comercio, Industria y Turismo y la Policía Nacional (Tarjeta de Registro de Alojamiento - TRA / RNT).</li>
            <li>Emitir facturas electrónicas de venta y comprobantes de contabilidad conforme a los requerimientos de la DIAN.</li>
            <li>Garantizar la seguridad de las instalaciones a través de controles de acceso en recepción y sistemas de videovigilancia en áreas comunes.</li>
            <li>Enviar notificaciones operativas de confirmación, claves de acceso Wi-Fi y encuestas de satisfacción del servicio.</li>
          </ul>

          <h4>3. Derechos del Titular de la Información (Hábeas Data)</h4>
          <p>De conformidad con el Artículo 8 de la Ley 1581 de 2012, el titular de los datos personales cuenta con los siguientes derechos inalienables:</p>
          <ul>
            <li><strong>Conocer, actualizar y rectificar</strong> sus datos personales frente a los Responsables del Tratamiento.</li>
            <li><strong>Solicitar prueba de la autorización</strong> otorgada para el tratamiento de sus datos.</li>
            <li><strong>Ser informado</strong> previa solicitud respecto al uso que se le ha dado a sus datos personales.</li>
            <li><strong>Revocar la autorización y/o solicitar la supresión</strong> de sus datos cuando en el tratamiento no se respeten los principios, derechos y garantías constitucionales.</li>
          </ul>

          <h4>4. Canal Oficial para el Ejercicio de Derechos ARCO</h4>
          <p>Para ejercer sus derechos de acceso, rectificación, cancelación u oposición (ARCO), el titular puede enviar una comunicación formal al correo electrónico oficial de la administración de Apartahotel Facile o radicar su solicitud directamente en la recepción del establecimiento.</p>
        </>
      );
    } else if (modalLegalTipo === 'privacidad') {
      titulo = '🔒 Política de Privacidad y Seguridad Tecnológica — BookingSoft PMS';
      contenido = (
        <>
          <p>La plataforma <strong>BookingSoft PMS</strong> ha sido diseñada bajo estrictos criterios de arquitectura segura, privacidad por diseño y confidencialidad de la información para la operación de <strong>Apartahotel Facile</strong>:</p>

          <h4>1. Cifrado Criptográfico de Contraseñas (bcrypt)</h4>
          <p>La seguridad de las credenciales de acceso de nuestros huéspedes y empleados es absoluta. Todas las contraseñas guardadas en la base de datos de BookingSoft se procesan mediante algoritmos de cifrado unidireccional de alto rendimiento <strong>bcrypt</strong> con salado dinámico. Esto garantiza que las claves de usuario jamás se almacenen en texto plano y sean computacionalmente imposibles de descifrar, protegiendo su cuenta incluso ante intentos no autorizados de lectura.</p>

          <h4>2. Autenticación Cifrada mediante JSON Web Tokens (JWT)</h4>
          <p>El acceso a las funciones del PMS y a la zona de gestión de reservas de huéspedes utiliza tokens de sesión autenticados e intransferibles (JWT). Estos tokens expiran de forma automática y viajan cifrados bajo protocolos seguros HTTPS para evitar la interceptación de credenciales en redes públicas o Wi-Fi.</p>

          <h4>3. Compromiso de No Divulgación a Terceros</h4>
          <p>En BookingSoft asumimos un compromiso férreo con la privacidad. <strong>No vendemos, comercializamos, alquilamos ni compartimos</strong> bajo ninguna modalidad la información personal, correos electrónicos o historiales de reserva de nuestros huéspedes con empresas de publicidad, brokers de datos ni terceros ajenos a la prestación directa del servicio de alojamiento.</p>

          <h4>4. Resguardo de la Información y Servidores</h4>
          <p>La infraestructura tecnológica de BookingSoft opera sobre servidores virtualizados y protegidos en contenedores aislados Docker, con cortafuegos activos y copias de respaldo automatizadas para prevenir pérdidas accidentales de datos o fallos en el sistema.</p>
        </>
      );
    }

    return (
      <div className="modal-legal-overlay" onClick={() => setModalLegalTipo(null)}>
        <div className="modal-legal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-legal-header">
            <h3>{titulo}</h3>
            <button className="btn-close-mini" onClick={() => setModalLegalTipo(null)}>✕</button>
          </div>
          <div className="modal-legal-body">
            {contenido}
          </div>
          <div className="modal-legal-footer">
            <button className="btn-submit-red" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }} onClick={() => setModalLegalTipo(null)}>
              Entendido y Aceptar
            </button>
          </div>
        </div>
      </div>
    );
};

export default ModalLegal;
