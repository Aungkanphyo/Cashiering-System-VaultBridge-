import { io } from 'socket.io-client';
import './App.css'
import { useEffect, useState } from 'react';
import TestComponents from './TestComponents';

// Connect directly to the backend running on the laptop.
const socket = io('http://localhost:5000');
function App() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [devMode, setDevMode] = useState(() => localStorage.getItem('devMode') === 'true');

  useEffect(() => {
    // wait for data to arrive from the server called display-barcode
    socket.on('display-barcode', (data) => {
      console.log("Barcode number scanned from phone: ", data);
      
      // add Real-time to the input box
      setBarcodeInput(data);
    });

    // when close component clear socket
    return () => {
      socket.off('display-barcode');
    };
  }, []);

  const toggleDevMode = () => {
    const newState = !devMode;
    setDevMode(newState);
    localStorage.setItem('devMode', newState);
  };

  // Dev Mode Toggle
  if (devMode) {
    return (
      <div>
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          backgroundColor: '#ff6b6b',
          padding: '10px 15px',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '12px',
          cursor: 'pointer',
          border: '2px solid #c92a2a'
        }} onClick={toggleDevMode}>
          🧪 DEV MODE (click to exit)
        </div>
        <TestComponents />
      </div>
    );
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      {/* Dev Mode Toggle Button */}
      <button
        onClick={toggleDevMode}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '8px 12px',
          backgroundColor: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 100
        }}
      >
        🧪 Test Mode
      </button>

      <h1>Enterprise Cashiering System (MVP)</h1>
      <div style={{ marginTop: '30px' }}>
        <label>Barcode Input: </label>
        <input 
          type="text" 
          value={barcodeInput} 
          onChange={(e) => setBarcodeInput(e.target.value)}
          placeholder="Scan with phone will appear there"
          style={{ width: '300px', padding: '10px', fontSize: '16px' }}
        />
      </div>
    </div>
  )
}

export default App
