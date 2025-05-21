import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Your existing app content */}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;