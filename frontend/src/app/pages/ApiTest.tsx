import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function ApiTest() {
  const [gstData, setGstData] = useState<any>(null);
  const [esicData, setEsicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const test = async () => {
      try {
        console.log('[ApiTest] Starting API test...');
        const gst = await api.get('/gst-news');
        console.log('[ApiTest] GST response:', gst);
        setGstData(gst);

        const esic = await api.get('/esic-news');
        console.log('[ApiTest] ESIC response:', esic);
        setEsicData(esic);
      } catch (err: any) {
        console.error('[ApiTest] Error:', err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    test();
  }, []);

  if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', color: '#fff', background: '#05080D', minHeight: '100vh' }}>
      <h1>API Test Results</h1>
      
      {error && <div style={{ background: '#ff0000', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>ERROR: {error}</div>}

      <div style={{ marginBottom: '2rem' }}>
        <h2>GST News</h2>
        <pre style={{ background: '#0D1526', padding: '1rem', overflow: 'auto', maxHeight: '400px' }}>
          {JSON.stringify(gstData, null, 2)}
        </pre>
      </div>

      <div>
        <h2>ESIC News</h2>
        <pre style={{ background: '#0D1526', padding: '1rem', overflow: 'auto', maxHeight: '400px' }}>
          {JSON.stringify(esicData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
