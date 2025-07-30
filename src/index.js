import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import click-to-component
import { ClickToComponent } from 'click-to-react-component';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Chỉ bật trong development */}
    {process.env.NODE_ENV === 'development' && <ClickToComponent />}
    <App />
  </React.StrictMode>
);