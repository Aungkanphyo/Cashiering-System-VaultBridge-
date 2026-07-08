import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import AddStaffModal from './features/staff/components/AddStaffModal';
import NrcInput from './features/staff/components/NrcInput';
import './App.css';

export default function TestComponents() {
  const [activeTest, setActiveTest] = useState('nrc'); // 'nrc' | 'modal' | 'sidebar'
  const [nrcValue, setNrcValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [currentView, setCurrentView] = useState('users');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Test Navigation */}
      <div style={{
        padding: '20px',
        backgroundColor: '#333',
        color: '#fff',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <strong>Test View:</strong>
        <button
          onClick={() => setActiveTest('nrc')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTest === 'nrc' ? '#4CAF50' : '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          NRC Input Component
        </button>
        <button
          onClick={() => setActiveTest('modal')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTest === 'modal' ? '#4CAF50' : '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Staff Modal
        </button>
        <button
          onClick={() => setActiveTest('sidebar')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTest === 'sidebar' ? '#4CAF50' : '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sidebar
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* NRC Input Test */}
        {activeTest === 'nrc' && (
          <div style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2>🧪 NRC Input Component Test</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>Test the NRC input section in isolation</p>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>NRC NUMBER</label>
                <NrcInput value={nrcValue} onChange={setNrcValue} />
              </div>

              <div style={{
                backgroundColor: '#f0f0f0',
                padding: '15px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                <strong>Output Value:</strong>
                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                  {nrcValue ? <span style={{ color: '#4CAF50' }}>✓ {nrcValue}</span> : <span style={{ color: '#999' }}>Empty (fill all fields)</span>}
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px', fontSize: '14px', lineHeight: '1.6' }}>
                <strong>Expected Format:</strong><br />
                State/Township(Type)Number<br />
                Example: <code>1/001(N)123456</code>
              </div>
            </div>
          </div>
        )}

        {/* Add Staff Modal Test */}
        {activeTest === 'modal' && (
          <div style={{ flex: 1, padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2>🧪 Add Staff Modal Test</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>The modal should appear below. Test the form and NRC input within it.</p>

              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                Open Add Staff Modal
              </button>

              <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '14px' }}>
                <strong>Focus on testing:</strong>
                <ul style={{ marginTop: '10px', marginBottom: 0 }}>
                  <li>Fill out all form fields</li>
                  <li>Verify NRC input updates correctly</li>
                  <li>Test form submission (check console)</li>
                  <li>Verify close functionality</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Test */}
        {activeTest === 'sidebar' && (
          <div style={{ display: 'flex', flex: 1, minHeight: '100%' }}>
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div style={{ flex: 1, padding: '40px' }}>
              <h2>🧪 Sidebar Component Test</h2>
              <p style={{ marginBottom: '20px' }}>Current View: <code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '3px' }}>{currentView}</code></p>

              <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
                <strong>Menu Items:</strong>
                <ul style={{ marginTop: '10px', marginBottom: 0, fontSize: '14px' }}>
                  <li>Dashboard</li>
                  <li>Categories View / Add Category</li>
                  <li>Products View / Add Product</li>
                  <li>User & Cashiers</li>
                  <li>Payment Methods</li>
                  <li>Register Sessions</li>
                  <li>Sales & Split Payments</li>
                </ul>
              </div>

              <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '14px' }}>
                <strong>Test:</strong> Click menu items in the sidebar. The "Current View" above should update.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
