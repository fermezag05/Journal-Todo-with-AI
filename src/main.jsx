import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import PasscodeGate from './components/PasscodeGate.jsx'
import { StoreProvider } from './store.jsx'
import './styles/tokens.css'
import './styles/base.css'
import './styles/shell.css'
import './styles/home.css'
import './styles/journal.css'
import './styles/tasks.css'
import './styles/itinerary.css'
import './styles/gate.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PasscodeGate>
      <HashRouter>
        <StoreProvider>
          <App />
        </StoreProvider>
      </HashRouter>
    </PasscodeGate>
  </React.StrictMode>,
)
