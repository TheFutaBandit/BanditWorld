import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import SignupLogin from './components/signuplogin/SignupLogin.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SignupLogin />
    </React.StrictMode>,
)
