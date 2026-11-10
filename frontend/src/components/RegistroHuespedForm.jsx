import React, {useState} from 'react';

export default function ResgistroHuespedForm({onSubmit}) {
    const [nombreLegal, setNombreLegal]= useState('');
    const[apellidoLegal, setApellidoLegal]= useState('');
    const[documento, setDocumento]=useState('');
    const[telefono, setTelefono]=useState('');
    const[correo, setCorreo]= useState('');
    const[habeasData, setHabeasData]= useState(false);
    const[error, setError]= useState('');

    const handleSubmit = async(e) => {
        e.preventDefault();
        

        if (

            !nombreLegal.trim() ||
            !apellidoLegal.trim() ||
            !documento.trim() ||
            !telefono.trim() ||
            !correo.trim() 


        ){

          setError('Nombre, apellidos, documento, teléfono y correo electrónico son obligatorios.');
          return; 
        } 
    
         if(!habeasData){
            setError('Debe aceptar los Términos del Servicio y la Política de Protección de Datos (Ley 1581 de 2012 de Colombia).');
            return;
         }

         setError('');
         
         if (onSubmit) {
            await onSubmit ({
                nombre: `${nombreLegal.trim()} ${apellidoLegal.trim()}`,
                documento: documento.trim(),
                telefono: telefono.trim(),
                correo: correo.trim(),
                habeasData,
            });
         }
    };


    return (
    <form onSubmit={handleSubmit} aria-label="Formulario de registro de huésped" noValidate>
      <h4>Ahora creemos tu cuenta</h4>
      {error && (
        <div role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="reg-nombre">Nombre(s)</label>
        <input
          id="reg-nombre"
          type="text"
          placeholder="Nombre(s)"
          value={nombreLegal}
          onChange={(e) => setNombreLegal(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="reg-apellido">Apellido(s)</label>
        <input
          id="reg-apellido"
          type="text"
          placeholder="Apellido(s)"
          value={apellidoLegal}
          onChange={(e) => setApellidoLegal(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="reg-documento">Documento (Cédula/Pasaporte)</label>
        <input
          id="reg-documento"
          type="text"
          name="documento"
          placeholder="Ej: 1017283944"
          value={documento}
          onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>
      <div>
        <label htmlFor="reg-telefono">Teléfono de contacto</label>
        <input
          id="reg-telefono"
          type="text"
          name="telefono"
          placeholder="Ej: 3154449876"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>
      <div>
        <label htmlFor="reg-correo">Correo electrónico</label>
        <input
          id="reg-correo"
          type="email"
          name="correo"
          placeholder="correo@ejemplo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="reg-habeas-data">
          <input
            id="reg-habeas-data"
            type="checkbox"
            checked={habeasData}
            onChange={(e) => setHabeasData(e.target.checked)}
          />
          Autorizo expresamente el tratamiento de mis datos personales según la Ley 1581 de 2012 de Colombia.
        </label>
      </div>
      <button type="submit">Aceptar y continuar</button>
    </form>
  );
}