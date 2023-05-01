import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Crear un elemento raíz en el DOM para renderizar la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar el componente App dentro del modo estricto de React
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
