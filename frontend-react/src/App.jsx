import { io } from 'socket.io-client';
import './App.css'
import { useEffect, useState } from 'react';

// Connect directly to the backend running on the laptop.
const socket = io('http://localhost:5000');
function App() {
  const [barcodeInput, setBarcodeInput] = useState('');

  useEffect(() => {
    // wait for data to arrive from the server called display-barcode
    socket.on('display-barcode', (data) => {
      console.log("Barcode number scanned from phone: ", data);
      
      // add Real-time to the input box
      setBarcodeInput(data);
    });

    // Component ပိတ်သွားရင် socket ကို ရှင်းထုတ်ပစ်မယ်
    return () => {
      socket.off('display-barcode');
    };
  }, []);
 
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Enterprise Cashiering System (MVP)</h1>
      <div style={{ marginTop: '30px' }}>
        <label>Barcode Input: </label>
        <input 
          type="text" 
          value={barcodeInput} 
          onChange={(e) => setBarcodeInput(e.target.value)}
          placeholder="ဖုန်းနဲ့ စကင်ဖတ်လိုက်ရင် ဒီမှာတန်းပေါ်မယ်"
          style={{ width: '300px', padding: '10px', fontSize: '16px' }}
        />
      </div>
    </div>
  )
}

export default App
