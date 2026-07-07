import { useState, useMemo } from 'react';
import nrcData from '../../../data/nrc.json';

const NRC_TYPES = [
  { code: 'N', label: '(N) နိုင်' },
  { code: 'A', label: '(A) ဧည့်' },
  { code: 'P', label: '(P) ပြု' }
];

export default function NrcInput({ value, onChange }) {
  const [stateNo, setStateNo] = useState('');
  const [township, setTownship] = useState('');
  const [type, setType] = useState('N');
  const [number, setNumber] = useState('');

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (!value) {
      setStateNo('');
      setTownship('');
      setType('N');
      setNumber('');
    }
  }

  // Organize NRC data: group townships by state
  const stateMap = useMemo(() => {
    const map = {};
    nrcData.forEach(item => {
      if (!map[item.state_code]) {
        map[item.state_code] = {
          state_code: item.state_code,
          state_en: item.state_en,
          state_mm: item.state_mm,
          townships: []
        };
      }
      // Add township if not already present
      if (!map[item.state_code].townships.find(t => t.code === item.township_code_en)) {
        map[item.state_code].townships.push({
          code: item.township_code_en,
          code_mm: item.township_code_mm,
          name_en: item.township_en[0] || '',
          name_mm: item.township_mm[0] || ''
        });
      }
    });
    return map;
  }, []);

  const states = useMemo(() => Object.values(stateMap).sort((a, b) => parseInt(a.state_code) - parseInt(b.state_code)), [stateMap]);
  const selectedState = stateMap[stateNo];
  const availableTownships = selectedState ? selectedState.townships : [];

  // Helper Function that will send data in NRC String format to the Parent Component
  const handleValueChange = (nextState, nextTownship, nextType, nextNumber) => {
    if (nextState && nextTownship && nextType && nextNumber) {
      onChange(`${nextState}/${nextTownship}(${nextType})${nextNumber}`);
    } else {
      onChange(''); // information incomplete, sent blank.
    }
  };

  const handleStateChange = (e) => {
    const nextStateNo = e.target.value;
    setStateNo(nextStateNo);
    setTownship(''); // Reset township when state changes
    handleValueChange(nextStateNo, '', type, number);
  };

  const handleTownshipChange = (e) => {
    const nextTownship = e.target.value;
    setTownship(nextTownship);
    handleValueChange(stateNo, nextTownship, type, number);
  };

  const handleTypeChange = (e) => {
    const nextType = e.target.value;
    setType(nextType);
    handleValueChange(stateNo, township, nextType, number);
  };

  const handleNumberChange = (e) => {
    let nextNumber = e.target.value.replace(/\D/g, ''); // Only numbers allowed
    nextNumber = nextNumber.slice(0, 6); // Max 6 digits
    setNumber(nextNumber);
    handleValueChange(stateNo, township, type, nextNumber);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 2fr', gap: '8px', alignItems: 'center' }}>
      {/* State Selection */}
      <select 
        value={stateNo} 
        onChange={handleStateChange} 
        className="form-select"
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        <option value="">State</option>
        {states.map(state => (
          <option key={state.state_code} value={state.state_code}>
            {state.state_code}/ {state.state_en}
          </option>
        ))}
      </select>

      {/* Township Selection */}
      <select 
        value={township} 
        onChange={handleTownshipChange} 
        disabled={!stateNo} 
        className="form-select"
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        <option value="">Township</option>
        {availableTownships.map(ts => (
          <option key={ts.code} value={ts.code}>
            {ts.code} ({ts.name_en})
          </option>
        ))}
      </select>

      {/* NRC Type */}
      <select 
        value={type} 
        onChange={handleTypeChange} 
        className="form-select"
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        {NRC_TYPES.map(t => (
          <option key={t.code} value={t.code}>{t.label}</option>
        ))}
      </select>

      {/* Serial Number */}
      <input
        type="text"
        maxLength="6"
        placeholder="123456"
        value={number}
        onChange={handleNumberChange}
        className="form-control"
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>
  );
}