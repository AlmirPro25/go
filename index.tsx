
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/App'; // Changed to named import

function mountApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Fatal Error: Could not find root element with ID 'root' to mount to. Ensure it exists in your index.html.");
    // Display a user-friendly message on the page itself if possible
    document.body.innerHTML = `
      <div style="font-family: sans-serif; padding: 20px; text-align: center; color: #ff4d4d; background-color: #fff0f0; border: 1px solid #ffb8b8; border-radius: 8px;">
        <h1>Application Mount Error</h1>
        <p>Could not find the root HTML element (<code>#root</code>) to start the application.</p>
        <p>Please check the browser console for more details or contact support.</p>
      </div>
    `;
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  // DOMContentLoaded has already fired
  mountApp();
}