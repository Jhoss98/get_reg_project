import './App.css';
import React, { useState } from 'react';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}


function App() {
  const [tid, setTid] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [epsData, setEpsData] = useState(null);

  const fetchData = () => {

    setError(null);

    if (!tid) {
      setError("Por favor, selecciona un tipo de documento.");
      return;
    }

    if (!documentNumber.trim()) {
      setError("El número de documento no puede estar vacío.");
      return;
    }
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch(`https://paiwebservices.paiweb.gov.co:8081/api/interoperabilidad/GetInfoRegistraduria/${tid}/${documentNumber}`, requestOptions)
      .then(response => response.json())
      .then(result => {

        setResult(result);

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
          "tipoDocumento": result.tipoIdentificacion,
          "numerodocumento": result.numeroIdentificacion,
          "primerApellido": result.primerApellido,
          "primerNombre": result.primerNombre
        });
        var requestOptionsSecondFetch = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
        return fetch("https://paiwebservices.paiweb.gov.co:8081/api/interoperabilidad/GetEPSPersonaMSS", requestOptionsSecondFetch);
      })
      .then(response => response.json())
      .then(resultSecondFetch => {
        setEpsData(resultSecondFetch);
      })
      .catch(error => {
        console.log('error', error);
        setError("Hubo un error al obtener los datos.");
      });
  };

  return (
    <div className="App">
      <select value={tid} onChange={e => setTid(e.target.value)}>
        <option value="" disabled hidden>Seleccione una opción</option>
        <option value="CC">CC</option>
        <option value="TI">TI</option>
        <option value="RC">RC</option>
        <option value="PT">PT</option>
        <option value="PE">PE</option>
        <option value="CE">CE</option>
      </select>
      <input
        value={documentNumber}
        onChange={e => setDocumentNumber(e.target.value)}
        placeholder="Ingresa el número de documento"
      />
      <button onClick={fetchData}>Obtener datos</button>
      {error && <div className="error-message">{error}</div>}
      {result && (
        <table>
          <thead>
            <tr>
              <th>Tipo Identificación</th>
              <th>Número Identificación</th>
              <th>Primer Apellido</th>
              <th>Segundo Apellido</th>
              <th>Primer Nombre</th>
              <th>Segundo Nombre</th>
              <th>Fecha de Nacimiento</th>
              <th>Sexo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{result.tipoIdentificacion}</td>
              <td>{result.numeroIdentificacion}</td>
              <td>{result.primerApellido}</td>
              <td>{result.segundoApellido}</td>
              <td>{result.primerNombre}</td>
              <td>{result.segundoNombre}</td>
              <td>{formatDate(result.fechaNacimiento)}</td>
              <td>{result.sexo}</td>
            </tr>
          </tbody>
        </table>
      )}
      {epsData && (
        <table>
          <thead>
            <tr>
              <th>Régimen de Afiliación</th>
              <th>Código EPS</th>
              <th>Nombre EPS</th>
              <th>Estado de Afiliación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{epsData.regimenAfiliacion}</td>
              <td>{epsData.codigoEPS}</td>
              <td>{epsData.nombreEPS}</td>
              <td>{epsData.estadoAfiliacion}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );

}

export default App;
