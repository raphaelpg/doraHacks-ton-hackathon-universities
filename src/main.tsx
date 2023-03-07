import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style/index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { CONSTANTS_URL_MANIFEST } from './settings/constants';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <TonConnectUIProvider manifestUrl={CONSTANTS_URL_MANIFEST}>
    <App />
  </TonConnectUIProvider>,
)
