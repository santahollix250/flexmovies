import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // IMPORTANT: Add this
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* WRAP App with BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);