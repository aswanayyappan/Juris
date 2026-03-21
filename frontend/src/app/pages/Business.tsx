import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import './BusinessDashboard.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry"
];

const LOADING_MSGS = [
  "Initializing compliance engine...",
  "Fetching MCA21 registry data...",
  "Cross-referencing GST portal records...",
  "Pulling Income Tax department filings...",
  "Scanning Labour law compliance matrix...",
  "Running EPFO & ESIC verification...",
  "Generating risk assessment model...",
  "Calculating penalty exposure...",
  "Building compliance calendar...",
  "Constructing director profiles...",
  "Aggregating 340+ compliance data points...",
  "JURIS intelligence ready ✓"
];

export const Business: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<'form' | 'loading' | 'dashboard'>('form');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [businessData, setBusinessData] = useState<any>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [apiError, setApiError] = useState<string>('');
  
  // Form State
  const [name, setName] = useState(() => localStorage.getItem('formName') || '');
  const [state, setState] = useState(() => localStorage.getItem('formState') || '');
  const [type, setType] = useState(() => localStorage.getItem('formType') || '');
  const [cin, setCin] = useState(() => localStorage.getItem('formCin') || '');

  // Save form fields to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('formName', name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem('formState', state);
  }, [state]);

  useEffect(() => {
    localStorage.setItem('formType', type);
  }, [type]);

  useEffect(() => {
    localStorage.setItem('formCin', cin);
  }, [cin]);

  // Loading Animation State
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBusiness();
    // Check API status
    checkApiStatus();
  }, [user, navigate]);

  const checkApiStatus = async () => {
    try {
      setApiStatus('checking');
      const res = await api.get('/auth/me');
      setApiStatus('ok');
      setApiError('');
      console.log('[Business] API health check: OK');
    } catch (err: any) {
      setApiStatus('error');
      setApiError(err.response?.status === 401 ? 'Auth expired' : 'Backend unreachable');
      console.error('[Business] API health check failed:', err.message);
    }
  };

  const fetchBusiness = async () => {
    try {
      console.log('[Business] Checking for cached business data...');
      const cachedData = localStorage.getItem('businessData');
      const cachedId = localStorage.getItem('businessId');
      
      if (cachedData && cachedId) {
        console.log('[Business] Loading from cache');
        setBusinessId(cachedId);
        setBusinessData(JSON.parse(cachedData));
        setView('dashboard');
        return;
      }
      
      console.log('[Business] Fetching user profile...');
      const res = await api.get('/auth/me');
      console.log('[Business] Auth response:', res.data);
      
      // Safe access to businessId - check both response and localStorage
      const bizId = res.data?.user?.businessId || localStorage.getItem('businessId');
      console.log('[Business] User businessId:', bizId);
      
      if (bizId) {
        console.log('[Business] Fetching business data for:', bizId);
        const check = await api.get(`/businesses/${bizId}`);
        console.log('[Business] Business data received:', check.data);
        
        if (check.data?.business?.syntheticData) {
          setBusinessId(bizId);
          setBusinessData(check.data.business.syntheticData);
          localStorage.setItem('businessId', bizId);
          localStorage.setItem('businessData', JSON.stringify(check.data.business.syntheticData));
          setView('dashboard');
          console.log('[Business] Dashboard view set, data saved to cache');
        } else {
          console.log('[Business] No syntheticData found, showing form');
          setView('form');
        }
      } else {
        console.log('[Business] No businessId found, showing form');
        setView('form');
      }
    } catch (err: any) {
      console.error('[Business] Fetch error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      console.log('[Business] Showing form due to error');
      setView('form');
    }
  };

  const handleRegister = async () => {
    if (!name || !state || !type) {
      alert("Please fill in Business Name, State, and Type.");
      return;
    }
    setView('loading');
    setLoadingIndex(0);

    // Run custom loading animation intervals
    const msgsLength = LOADING_MSGS.length;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i <= msgsLength) {
        setLoadingIndex(i);
      } else {
        clearInterval(interval);
      }
    }, 200);

    try {
      console.log('[Business] Creating business with:', { name, state, type, cin });
      const res = await api.post('/businesses', { name, state, type, cin });
      console.log('[Business] Create response:', res);
      
      const businessId = (res as any).businessId;
      if (!businessId) {
        throw new Error('No businessId returned from server. Response: ' + JSON.stringify(res));
      }
      localStorage.setItem('businessId', businessId);
      
      // Fetch the newly built data back down
      console.log('[Business] Fetching business data for ID:', businessId);
      let fetchRef;
      try {
        fetchRef = await api.get(`/businesses/${businessId}`);
        console.log('[Business] Fetch response:', fetchRef);
      } catch (getErr: any) {
        console.error('[Business] GET request failed:', getErr.message);
        throw new Error(`Failed to fetch business data: ${getErr.message}`);
      }
      
      const business = (fetchRef as any).business;
      if (!business || !business.syntheticData) {
        throw new Error('No syntheticData found in business data. Response: ' + JSON.stringify(fetchRef));
      }
      
      // Delay strict resolution to allow loading animation to finish natively
      setTimeout(() => {
        clearInterval(interval);
        const businessId = (res as any).businessId;
        const syntheticData = (fetchRef as any).business?.syntheticData;
        
        if (!syntheticData) {
          console.error('[Business] No syntheticData in response:', fetchRef);
          alert('Error: Server returned incomplete data. Check console.');
          setView('form');
          return;
        }
        
        setBusinessId(businessId);
        setBusinessData(syntheticData);
        localStorage.setItem('businessId', businessId);
        localStorage.setItem('businessData', JSON.stringify(syntheticData));
        setView('dashboard');
        console.log('[Business] Dashboard loaded successfully, data saved to cache');
      }, msgsLength * 200);

    } catch (error: any) {
      console.error('[Business] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      clearInterval(interval);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to generate compliance data.';
      alert(`Error: ${errorMsg}\n\nCheck browser console for details.`);
      setView('form');
    }
  };

  const exportJSON = () => {
    if(!businessData) return;
    const blob = new Blob([JSON.stringify(businessData,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessData.company.name || "juris"}-compliance-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const colorJSON = (obj: any) => {
    if (!obj) return '';
    const jsonStr = JSON.stringify(obj, null, 2);
    return jsonStr
      .replace(/("[\w_]+")\s*:/g, '<span class="json-key">$1</span>:')
      .replace(/:\s*"([^"]*?)"/g, ': <span class="json-str">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-num">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="json-bool">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>');
  };

  const TopBarTools = () => (
    <div style={{position: 'absolute', top: '15px', right: '2rem', display: 'flex', gap: '10px', zIndex: 200, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
      {businessData && (
        <button 
          style={{background: 'rgba(255,68,85,0.1)', color: 'var(--red)', border: '1px solid rgba(255,68,85,0.2)', padding: '5px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: 'IBM Plex Mono'}}
          onClick={async () => {
            if (window.confirm("Are you sure you want to reset and delete this business data?")) {
              try {
                await api.delete(`/businesses/${businessId}`);
                setBusinessData(null);
                setBusinessId('');
                setView('form');
              } catch (e) { alert("Failed to reset data"); }
            }
          }}>
          Reset Data
        </button>
      )}
      <button 
        style={{background: 'rgba(61,142,255,0.1)', color: 'var(--blue)', border: '1px solid rgba(61,142,255,0.2)', padding: '5px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: 'IBM Plex Mono'}}
        onClick={() => {
          const logs = `
View → Developer Tools → Console (Press F12 or Ctrl+Shift+I)

TROUBLESHOOTING STEPS:
1. Check browser console for [Business] logs
2. Verify form inputs are filled (Name, State, Type required)
3. Click "Test API Connection" button
4. Check network tab for failed requests
5. Verify backend is running on correct URL

COMMON ISSUES:
- API_URL not configured correctly
- Backend server not responding
- Authentication token expired
- Network/CORS issues
          `;
          alert(logs);
        }}>
        View Help
      </button>
      <button 
        style={{background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: 'IBM Plex Mono'}}
        onClick={async () => {
          localStorage.removeItem('businessId');
          localStorage.removeItem('businessData');
          localStorage.removeItem('formName');
          localStorage.removeItem('formState');
          localStorage.removeItem('formType');
          localStorage.removeItem('formCin');
          await api.post('/auth/logout');
          navigate('/login');
        }}>
        Logout System
      </button>
    </div>
  );

  // ── Render Form ──
  if (view === 'form') {
    return (
      <div className="dash-wrapper">
        <TopBarTools />
        <div className="form-screen" style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem'}}>
          <div className="form-logo" style={{fontFamily:'var(--mono)', fontSize:'11px', letterSpacing:'0.3em', color:'var(--accent)', textTransform:'uppercase', marginBottom:'2rem', display:'flex', alignItems:'center', gap:'10px'}}>
            <div className="form-logo-dot" style={{width:'8px',height:'8px',background:'var(--accent)',borderRadius:'50%',animation:'dash-pulse 2s infinite'}}></div>
            JURIS Compliance Intelligence
          </div>
          <div className="form-card fade-up" style={{width:'100%', maxWidth:'520px', background:'var(--surface)', border:'0.5px solid var(--border2)', borderRadius:'var(--radius2)', padding:'2.5rem', boxShadow:'0 0 60px rgba(0,212,170,0.06)'}}>
            <div className="form-title" style={{fontSize:'26px', fontWeight:700, letterSpacing:'-0.5px', marginBottom:'4px'}}>
              Register Your <span style={{color:'var(--accent)'}}>Business</span>
            </div>
            
            <label className="form-label" style={{display:'block', fontSize:'11px', fontFamily:'var(--mono)', letterSpacing:'0.15em', color:'var(--text2)', textTransform:'uppercase', marginBottom:'6px'}}>Business Name *</label>
            <input className="form-input" style={{width:'100%', padding:'11px 14px', fontSize:'14px', fontFamily:'var(--sans)', background:'var(--bg2)', border:'0.5px solid var(--border2)', color:'var(--text)', borderRadius:'var(--radius)', outline:'none'}} placeholder="e.g. Acme Technologies Pvt Ltd" value={name} onChange={e=>setName(e.target.value)} />
            
            <label className="form-label" style={{display:'block', fontSize:'11px', fontFamily:'var(--mono)', letterSpacing:'0.15em', color:'var(--text2)', textTransform:'uppercase', marginBottom:'6px', marginTop:'20px'}}>State *</label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger style={{width:'100%', padding:'8px 12px', fontSize:'14px', fontFamily:'var(--sans)', background:'var(--bg2)', border:'0.5px solid var(--border2)', color:'var(--text)', borderRadius:'var(--radius)', outline:'none'}}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent style={{background:'var(--bg2)', border:'0.5px solid var(--border2)', borderRadius:'var(--radius)'}}>
                {STATES.map(s => (
                  <SelectItem key={s} value={s} style={{color:'var(--text)', padding:'8px 14px'}}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label className="form-label" style={{display:'block', fontSize:'11px', fontFamily:'var(--mono)', letterSpacing:'0.15em', color:'var(--text2)', textTransform:'uppercase', marginBottom:'6px', marginTop:'20px'}}>CIN *</label>
            <input className="form-input" style={{width:'100%', padding:'11px 14px', fontSize:'14px', fontFamily:'var(--sans)', background:'var(--bg2)', border:'0.5px solid var(--border2)', color:'var(--text)', borderRadius:'var(--radius)', outline:'none'}} placeholder="Enter CIN" value={cin} onChange={e=>setCin(e.target.value)} />
            
            <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr', gap:'14px', marginTop:'20px'}}>
              <div>
                <label className="form-label" style={{display:'block', fontSize:'11px', fontFamily:'var(--mono)', letterSpacing:'0.15em', color:'var(--text2)', textTransform:'uppercase', marginBottom:'6px'}}>Business Type *</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger style={{width:'100%', padding:'8px 12px', fontSize:'14px', fontFamily:'var(--sans)', background:'var(--bg2)', border:'0.5px solid var(--border2)', color:'var(--text)', borderRadius:'var(--radius)', outline:'none'}}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent style={{background:'var(--bg2)', border:'0.5px solid var(--border2)', borderRadius:'var(--radius)'}}>
                    {["Pvt Ltd","LLP","Partnership","Sole Proprietorship","Public Ltd"].map(t => (
                      <SelectItem key={t} value={t} style={{color:'var(--text)', padding:'8px 14px'}}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <button 
              style={{marginTop:'28px', width:'100%', padding:'14px', background:'var(--accent)', color:'var(--bg)', fontFamily:'var(--sans)', fontSize:'14px', fontWeight:700, letterSpacing:'0.05em', border:'none', borderRadius:'var(--radius)', cursor:'pointer'}}
              onClick={() => {
                if (!name || !state || !type || !cin) {
                  alert("Please fill in all required fields.");
                  return;
                }
                console.log('[Business] All fields filled, calling handleRegister()');
                handleRegister();
              }}>
              FIND COMPLIANCE DATA
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ── Render Loading ──
  if (view === 'loading') {
    return (
      <div className="dash-wrapper">
        <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2rem', padding:'2rem'}}>
          <div style={{fontFamily:'var(--mono)', fontSize:'13px', color:'var(--accent)', letterSpacing:'0.2em', display:'flex', alignItems:'center', gap:'10px'}}>
            <div className="form-logo-dot" style={{width:'8px',height:'8px',background:'var(--accent)',borderRadius:'50%',animation:'dash-pulse 2s infinite'}}></div>
            JURIS ENGINE RUNNING
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', width:'240px'}}>
            {Array.from({length: 30}).map((_, i) => (
              <div key={i} style={{height:'6px', background: i < loadingIndex * 2.5 ? 'var(--accent)' : 'var(--surface2)', transition:'background 0.1s'}} />
            ))}
          </div>
          <div style={{fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text2)', textAlign:'center', lineHeight:2.2, maxWidth:'400px'}}>
            {LOADING_MSGS.slice(0, loadingIndex).map((msg, idx) => (
              <div key={idx} style={{color: idx === loadingIndex - 1 ? 'var(--accent)' : 'var(--text2)'}}>{msg}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render Dashboard ──
  const d = businessData;
  if (!d) return null;
  
  // Safety check: ensure required properties exist
  if (!d.company || !d.dashboard || !d.alerts) {
    console.error('[Business] Incomplete business data:', d);
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{textAlign:'center', padding:'2rem'}}>
          <div style={{color:'var(--red)', fontSize:'14px', marginBottom:'1rem'}}>Error: Incomplete data received from server</div>
          <button onClick={() => window.location.reload()} style={{padding:'8px 16px', background:'var(--accent)', color:'var(--bg)', border:'none', borderRadius:'6px', cursor:'pointer'}}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  const c = d.company;
  
  const navItems = [
    { id: "overview", label: "Overview", dot: "#00D4AA", count: d.alerts.length, countClass: d.alerts.some((a:any) => a.level === "High") ? "danger" : "warn" },
    { id: "gst", label: "GST & Tax", dot: "#3D8EFF", count: d.gst.filing_history.filter((f:any) => f.gstr3b === "Missed").length, countClass: "danger" },
    { id: "roc", label: "ROC / MCA", dot: "#9B6BFF", count: d.roc.dir3_kyc.pending_directors.length, countClass: "warn" },
    { id: "incometax", label: "Income Tax", dot: "#FFB300", count: d.income_tax.tds_sections.length, countClass: "ok" },
    { id: "labour", label: "Labour Laws", dot: "#FF4455", count: d.labour.contracts.missing, countClass: d.labour.contracts.missing > 0 ? "danger" : "ok" },
    { id: "licenses", label: "Licenses", dot: "#00D4AA", count: d.licenses.filter((l:any) => l.status !== "Active" && l.status !== "Not Applicable" && l.status !== "Perpetual").length, countClass: "warn" },
    { id: "risk", label: "Risk Engine", dot: "#FF4455", count: d.risk_engine.score, countClass: d.risk_engine.level === "High" ? "danger" : d.risk_engine.level === "Medium" ? "warn" : "ok" },
    { id: "calendar", label: "Cal. Events", dot: "#3D8EFF", count: d.compliance_calendar.length, countClass: "info" },
    { id: "directors", label: "Directors", dot: "#9B6BFF", count: d.directors.length, countClass: "ok" },
    { id: "penalties", label: "Penalties", dot: "#FF4455", count: d.penalties.length, countClass: d.penalties.length > 0 ? "danger" : "ok" },
    { id: "financial", label: "Financials", dot: "#00D4AA", count: null },
    { id: "rawjson", label: "Raw JSON", dot: "#4A5E78", count: null }
  ];

  const hc = d.dashboard.compliance_health >= 70 ? "var(--accent)" : d.dashboard.compliance_health >= 45 ? "var(--amber)" : "var(--red)";

  // Components translations
  const sc = (s:string) => s==="Missed"||s==="Overdue" ? "badge-high" : s==="Pending"||s==="Due Soon" ? "badge-med" : "badge-low";

  return (
    <div className="dash-wrapper">
      <TopBarTools />
      <div className="dash">
        <div className="dash-header">
          <div className="dash-brand" onClick={() => navigate('/')}>
            <div className="form-logo-dot" style={{width:'8px',height:'8px',background:'var(--accent)',borderRadius:'50%'}}></div>
            JURIS
          </div>
          <div className="dash-company">
            {c.name}
            <small>{c.cin} · {c.entity_type} · {c.state}</small>
          </div>
          <div className="dash-status">
            <div className="status-dot"></div>
            <span style={{ color: hc, fontWeight: 600 }}>{d.dashboard.compliance_health}</span>
            <span style={{ color: 'var(--text3)' }}>/100</span>
            <span style={{ color: 'var(--text2)' }}>Health Score</span>
          </div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Main App</button>
        </div>

        <div className="dash-body">
          <div className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-section-title">Modules</div>
              {navItems.map(n => (
                <div key={n.id} className={`nav-item ${activeTab === n.id ? 'active' : ''}`} onClick={() => setActiveTab(n.id)}>
                  <div className="nav-dot" style={{ background: n.dot }}></div>
                  {n.label}
                  {n.count !== null && n.count !== 0 && (
                    <span className={`nav-count ${n.countClass}`}>{n.count}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="main">
            {/* OVERVIEW TAB */}
            <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
              <div className="section-hero fade-up">
                <h2>Compliance Overview</h2>
                <p>{c.name} · {c.industry} · {c.entity_type} · Est. {c.incorporation_date}</p>
              </div>

              <div className="metric-grid metric-grid-5" style={{ marginBottom: '1.25rem' }}>
                <div className="metric"><div className="metric-label">Health Score</div><div className="metric-val" style={{ color: hc }}>{d.dashboard.compliance_health}</div><div className="metric-sub">out of 100</div></div>
                <div className="metric"><div className="metric-label">Risk Score</div><div className="metric-val" style={{ color: d.risk_engine.level === "High" ? "var(--red)" : d.risk_engine.level === "Medium" ? "var(--amber)" : "var(--accent)" }}>{d.risk_engine.score}</div><div className="metric-sub">{d.risk_engine.level} Risk</div></div>
                <div className="metric"><div className="metric-label">Active Alerts</div><div className="metric-val metric-amber">{d.alerts.length}</div><div className="metric-sub">{d.alerts.filter((a:any) => a.level === "High").length} critical</div></div>
                <div className="metric"><div className="metric-label">Penalty Exposure</div><div className="metric-val metric-red">₹{(d.total_penalty_now || 0).toLocaleString()}</div><div className="metric-sub">accrued to date</div></div>
                <div className="metric"><div className="metric-label">Employees</div><div className="metric-val metric-blue">{d.company.employees}</div><div className="metric-sub">PF eligible: {d.labour.pf_eligible}</div></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-title">Compliance Health Ring</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
                      <svg viewBox="0 0 120 120" width="110" height="110">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface2)" strokeWidth="10" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke={hc} strokeWidth="10"
                          strokeDasharray={(2 * Math.PI * 50).toFixed(1)} strokeDashoffset={((2 * Math.PI * 50) * (1 - d.dashboard.compliance_health / 100)).toFixed(1)}
                          strokeLinecap="round" transform="rotate(-90 60 60)" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--mono)', color: hc }}>{d.dashboard.compliance_health}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: '0.1em' }}>HEALTH</div>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[
                        ["GST", d.dashboard.subscore_gst, "#3D8EFF"],
                        ["Labour", d.dashboard.subscore_labour, "#FF4455"],
                        ["Income Tax", d.dashboard.subscore_tax, "#FFB300"],
                        ["Licenses", d.dashboard.subscore_licenses, "#00D4AA"],
                        ["ROC", d.dashboard.subscore_roc, "#9B6BFF"]
                      ].map(([l, v, c]: any) => (
                        <div key={l} className="prog-row">
                          <div className="prog-header">
                            <span style={{ fontSize: '10px', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{l}</span>
                            <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: v >= 70 ? 'var(--accent)' : v >= 45 ? 'var(--amber)' : 'var(--red)' }}>{v}</span>
                          </div>
                          <div className="prog-bar"><div className="prog-fill" style={{ width: `${v}%`, background: c }}></div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card" style={{maxHeight:'320px', overflowY:'auto'}}>
                  <div className="card-title">Active Alerts</div>
                  {d.alerts.map((a:any, idx:number) => (
                    <div key={idx} className="alert-item">
                      <div className={`alert-icon ${a.level.toLowerCase()}`}>{a.level === "High" ? "🔴" : a.level === "Medium" ? "🟡" : "🟢"}</div>
                      <div className="alert-body">
                        <div className="alert-title" style={{ fontSize: '12px' }}>{a.title}</div>
                        <div className="alert-meta">{a.module} · {a.action}</div>
                      </div>
                      <span className={`badge badge-${a.level === "High" ? "high" : a.level === "Medium" ? "med" : "low"}`}>{a.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-title">Company Profile</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                  {[
                    ["CIN", c.cin], ["GSTIN", c.gstin], ["PAN", c.pan], ["TAN", c.tan],
                    ["Industry", c.industry], ["Entity Type", c.entity_type], ["State", c.state],
                    ["Incorporation", c.incorporation_date], ["Employees", c.employees],
                    ["Turnover", "₹" + c.turnover_cr + " Cr"], ["Auth Capital", "₹" + (c.authorized_capital || 0).toLocaleString()],
                    ["Paid-up Capital", "₹" + (c.paid_up_capital || 0).toLocaleString()]
                  ].map(([k, v]: any) => (
                    <div key={k} className="fin-row"><span className="fin-key">{k}</span><span className="fin-val" style={{ fontSize: '11px' }}>{v}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* GST TAB */}
            <div className={`tab-content ${activeTab === 'gst' ? 'active' : ''}`}>
              <div className="section-hero"><h2>GST &amp; Tax Compliance</h2><p>GSTIN: {d.gst.gstin} · Category: {d.gst.category} · Registered: {d.gst.registration_date}</p></div>
              <div className="metric-grid metric-grid-4" style={{ marginBottom: '1.25rem' }}>
                <div className="metric"><div className="metric-label">GSTR-3B Status</div><div className="metric-val" style={{ color: d.gst.gstr3b.status === "Missed" ? "var(--red)" : "var(--amber)" }}>{d.gst.gstr3b.status}</div><div className="metric-sub">Due {d.gst.gstr3b.due_date}</div></div>
                <div className="metric"><div className="metric-label">ITC Available</div><div className="metric-val metric-accent">₹{(d.gst.itc.available / 100000).toFixed(1)}L</div><div className="metric-sub">Utilized: ₹{(d.gst.itc.utilized / 100000).toFixed(1)}L</div></div>
                <div className="metric"><div className="metric-label">ITC Blocked</div><div className="metric-val metric-amber">₹{(d.gst?.itc?.blocked || 0).toLocaleString()}</div><div className="metric-sub">Rule 86A / Sec 17(5)</div></div>
                <div className="metric"><div className="metric-label">Pending Liability</div><div className="metric-val metric-red">₹{(d.gst?.pending_liability || 0).toLocaleString()}</div><div className="metric-sub">To be paid</div></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-title">Return Status</div>
                  <table className="data-table">
                    <tbody>
                      <tr><td className="td-key">GSTR-1</td><td className="td-val"><span className={`badge ${sc(d.gst.gstr1.status)}`}>{d.gst.gstr1.status}</span> <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{d.gst.gstr1.due_date}</span></td></tr>
                      <tr><td className="td-key">GSTR-3B</td><td className="td-val"><span className={`badge ${sc(d.gst.gstr3b.status)}`}>{d.gst.gstr3b.status}</span> <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{d.gst.gstr3b.due_date}</span></td></tr>
                      <tr><td className="td-key">GSTR-3B Late Fee</td><td className="td-val" style={{ color: 'var(--red)', fontFamily: 'var(--mono)' }}>₹{(d.gst?.gstr3b?.penalty || 0).toLocaleString()}</td></tr>
                      <tr><td className="td-key">GSTR-9 (Annual)</td><td className="td-val"><span className="badge badge-low">{d.gst.gstr9.status}</span> <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{d.gst.gstr9.due_date}</span></td></tr>
                      <tr><td className="td-key">ITC Mismatch</td><td className="td-val"><span className={`badge ${d.gst.itc.mismatch ? "badge-med" : "badge-low"}`}>{d.gst.itc.mismatch ? "Detected" : "None"}</span></td></tr>
                      <tr><td className="td-key">E-Way Bills (YTD)</td><td className="td-val mono">{(d.gst?.eway_bills_ytd || 0).toLocaleString()}</td></tr>
                      <tr><td className="td-key">HSN Codes</td><td className="td-val">{d.gst.hsn_codes.map((h:string) => <span key={h} className="tag tag-blue">{h}</span>)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card">
                  <div className="card-title">ITC Analysis</div>
                  {[
                    ["ITC Available", d.gst.itc.available, "var(--accent)"],
                    ["ITC Utilized", d.gst.itc.utilized, "var(--blue)"],
                    ["ITC Blocked", d.gst.itc.blocked, "var(--amber)"]
                  ].map(([l, v, col]: any) => (
                    <div key={l} className="prog-row" style={{ marginBottom: '14px' }}>
                      <div className="prog-header">
                        <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{l}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: col }}>₹{(v || 0).toLocaleString()}</span>
                      </div>
                      <div className="prog-bar" style={{ height: '7px' }}>
                        <div className="prog-fill" style={{ width: `${Math.min(v / d.gst.itc.available * 100, 100).toFixed(0)}%`, background: col }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROC TAB */}
            <div className={`tab-content ${activeTab === 'roc' ? 'active' : ''}`}>
              <div className="section-hero"><h2>ROC / MCA Compliance</h2><p>CIN: {d.roc.cin} · ROC: {d.roc.roc_office} · Directors: {d.roc.directors_count}</p></div>
              <div className="metric-grid metric-grid-4" style={{ marginBottom: '1.25rem' }}>
                <div className="metric"><div className="metric-label">AOC-4</div><div className="metric-val metric-accent">{d.roc.aoc4.status}</div><div className="metric-sub">Due {d.roc.aoc4.due_date}</div></div>
                <div className="metric"><div className="metric-label">MGT-7A</div><div className="metric-val metric-accent">{d.roc.mgt7a.status}</div><div className="metric-sub">Due {d.roc.mgt7a.due_date}</div></div>
                <div className="metric"><div className="metric-label">DIN KYC</div><div className="metric-val" style={{ color: d.roc.dir3_kyc.status === "Pending" ? "var(--amber)" : "var(--accent)" }}>{d.roc.dir3_kyc.status}</div><div className="metric-sub">{d.roc.dir3_kyc.pending_directors.length} pending</div></div>
                <div className="metric"><div className="metric-label">Charges</div><div className="metric-val metric-blue">{d.roc.charges_registered}</div><div className="metric-sub">with ROC</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-title">Board Meeting History</div>
                  <div className="timeline">
                    {d.roc.board_meetings.map((m:any, idx:number) => (
                      <div key={idx} className="tl-item">
                        <div className="tl-dot" style={{ background: m.quorum ? "var(--accent)" : "var(--amber)" }}></div>
                        <div className="tl-date">{m.date}</div>
                        <div className="tl-label">Quorum: <span style={{ color: m.quorum ? "var(--accent)" : "var(--red)" }}>{m.quorum ? "Met" : "Not Met"}</span> · {m.resolutions} res.</div>
                      </div>
                    ))}
                  </div>
                </div>
                {d.roc.charge_details.length > 0 && (
                  <div className="card">
                    <div className="card-title">Registered Charges</div>
                    {d.roc.charge_details.map((ch:any) => (
                      <div key={ch.id} className="fin-row">
                        <span className="fin-key">{ch.id}</span>
                        <span className="fin-val">₹{(ch?.amount || 0).toLocaleString()} · {ch?.holder}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* DIRECTORS TAB */}
            <div className={`tab-content ${activeTab === 'directors' ? 'active' : ''}`}>
              <div className="section-hero"><h2>Directors &amp; Governance</h2><p>{d.directors.length} directors registered</p></div>
              <div className="director-grid">
                {d.directors.map((dir:any, i:number) => {
                  const colors = ["#3D8EFF","#9B6BFF","#00D4AA","#FF4455","#FFB300"];
                  const col = colors[i%colors.length];
                  return (
                    <div key={i} className="director-card">
                      <div className="director-avatar" style={{ background: col+'22', color: col }}>{dir.name.substring(0,2).toUpperCase()}</div>
                      <div className="director-name">{dir.name}</div>
                      <div className="director-din">DIN: {dir.din}</div>
                      <div className="director-role">{dir.role}</div>
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        <span className={`tag ${dir.kyc_status === "Completed" ? "tag-green" : "tag-amber"}`}>KYC {dir.kyc_status}</span>
                        <span className="tag tag-blue">{dir.nationality}</span>
                        {dir?.shares && <span className="tag tag-green">₹{(dir.shares || 0).toLocaleString()} shares</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CALENDAR TAB */}
            <div className={`tab-content ${activeTab === 'calendar' ? 'active' : ''}`}>
               <div className="section-hero"><h2>Compliance Calendar</h2><p>Next 120 days · {d.compliance_calendar.length} events</p></div>
               <div className="cal-grid">
                 {d.compliance_calendar.map((e:any, idx:number) => {
                   const ms = new Date(e.date).getTime() - new Date().getTime();
                   const days = Math.round(ms/86400000);
                   const col = days < 0 ? "var(--red)" : days <= 14 ? "var(--amber)" : days <= 30 ? "var(--blue)" : "var(--text3)";
                   return (
                     <div key={idx} className="cal-item">
                       <div className="cal-date" style={{ color: col }}>{e.date}</div>
                       <div className="cal-label">{e.label} <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>[{e.module}]</span></div>
                       <span className={`badge ${e.priority==="High"?"badge-high":e.priority==="Medium"?"badge-med":"badge-low"}`}>{e.priority}</span>
                       <div className="cal-days" style={{ color: col }}>{days < 0 ? Math.abs(days) + "d ago" : days === 0 ? "Today" : days + "d"}</div>
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* RAW JSON TAB */}
            <div className={`tab-content ${activeTab === 'rawjson' ? 'active' : ''}`}>
              <div className="section-hero"><h2>Raw RegTech Payload Engine JSON</h2><p>{Object.keys(d).length} top-level keys · 340+ data points natively mapped</p></div>
              <button className="export-btn" onClick={exportJSON}>⬇ Export JSON Dataset Payload</button>
              <div className="json-wrap" dangerouslySetInnerHTML={{ __html: colorJSON(d) }}></div>
            </div>

            {/* INCOME TAX TAB */}
            <div className={`tab-content ${activeTab === 'incometax' ? 'active' : ''}`}>
              <div className="section-hero"><h2>Income Tax Compliance</h2><p>PAN: {d.income_tax.pan} · Tax Regime: {d.income_tax.tax_regime}</p></div>
              <div className="metric-grid metric-grid-4" style={{ marginBottom: '1.25rem' }}>
                <div className="metric"><div className="metric-label">ITR Status</div><div className="metric-val" style={{ color: d.income_tax.itr_status === "Filed" ? "var(--accent)" : "var(--amber)" }}>{d.income_tax.itr_status}</div><div className="metric-sub">FY {d.income_tax.last_itr_fy}</div></div>
                <div className="metric"><div className="metric-label">TDS Deducted</div><div className="metric-val metric-blue">₹{(d.income_tax.tds_deducted / 100000).toFixed(1)}L</div><div className="metric-sub">This FY</div></div>
                <div className="metric"><div className="metric-label">Tax Arrears</div><div className="metric-val" style={{ color: (d.income_tax?.tax_arrears || 0) > 0 ? "var(--red)" : "var(--accent)" }}>₹{(d.income_tax?.tax_arrears || 0).toLocaleString()}</div><div className="metric-sub">Outstanding</div></div>
                <div className="metric"><div className="metric-label">Demand Notices</div><div className="metric-val" style={{ color: d.income_tax.notices_pending > 0 ? "var(--red)" : "var(--accent)" }}>{d.income_tax.notices_pending}</div><div className="metric-sub">Pending</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-title">TDS Sections</div>
                  <table className="data-table">
                    <tbody>
                      {d.income_tax.tds_sections.map((section:any, idx:number) => (
                        <tr key={idx}><td className="td-key">{section?.section}</td><td className="td-val"><span style={{ color: 'var(--blue)', fontFamily: 'var(--mono)', fontSize: '11px' }}>₹{(section?.amount || 0).toLocaleString()}</span></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card">
                  <div className="card-title">ITR Filing Schedule</div>
                  <table className="data-table">
                    <tbody>
                      {[
                        { fy: "2023-24", status: "Filed", date: "30-11-2024" },
                        { fy: "2022-23", status: "Filed", date: "15-10-2023" },
                        { fy: "2021-22", status: "Filed", date: "22-09-2022" }
                      ].map((itr:any, idx:number) => (
                        <tr key={idx}><td className="td-key">FY {itr.fy}</td><td className="td-val"><span className={`badge ${itr.status === "Filed" ? "badge-low" : "badge-med"}`}>{itr.status}</span> <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{itr.date}</span></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Demand Notices & Correspondence</div>
                {d.income_tax.notices_pending > 0 ? (
                  <div>
                    <div className="alert-item">
                      <div className="alert-icon high">⚠️</div>
                      <div className="alert-body">
                        <div className="alert-title">Outstanding Demand Notice</div>
                        <div className="alert-meta">Assessment Year: {d.income_tax?.last_itr_fy || 'N/A'} · Amount: ₹{(d.income_tax?.tax_arrears || 0).toLocaleString()}</div>
                      </div>
                      <span className="badge badge-high">Action Required</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--accent)', fontSize: '13px', padding: '1rem', background: 'rgba(0,212,170,0.05)', borderRadius: '8px' }}>✓ No pending demand notices detected</div>
                )}
              </div>
            </div>

            {/* LABOUR LAWS TAB */}
            <div className={`tab-content ${activeTab === 'labour' ? 'active' : ''}`}>
              <div className="section-hero"><h2>Labour Law Compliance</h2><p>Total Employees: {d.labour.total_employees} · PF Eligible: {d.labour.pf_eligible} · ESI Eligible: {d.labour.esi_eligible}</p></div>
              <div className="metric-grid metric-grid-4" style={{ marginBottom: '1.25rem' }}>
                <div className="metric"><div className="metric-label">Employee Contracts</div><div className="metric-val" style={{ color: d.labour.contracts.missing > 0 ? "var(--red)" : "var(--accent)" }}>{d.labour.contracts.total - d.labour.contracts.missing}/{d.labour.contracts.total}</div><div className="metric-sub">{d.labour.contracts.missing} missing</div></div>
                <div className="metric"><div className="metric-label">PF Contribution</div><div className="metric-val metric-accent">12%</div><div className="metric-sub">₹{(d.labour.pf_contribution / 100000).toFixed(1)}L/year</div></div>
                <div className="metric"><div className="metric-label">ESI Coverage</div><div className="metric-val metric-blue">{d.labour.esi_eligible}</div><div className="metric-sub">employees</div></div>
                <div className="metric"><div className="metric-label">Statutory Compliance</div><div className="metric-val" style={{ color: d.labour.statutory_compliant ? "var(--accent)" : "var(--amber)" }}>{d.labour.statutory_compliant ? "✓ Compliant" : "⚠ Pending"}</div><div className="metric-sub">Current status</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-title">Mandatory Registrations</div>
                  {[
                    { name: "Professional Tax", status: "Registered", code: "PT-2024-001" },
                    { name: "EPF/PF Account", status: "Active", code: "DL/ESI/12345" },
                    { name: "ESI Account", status: "Active", code: "DL/ESI/67890" },
                    { name: "DLMS Registration", status: "Pending", code: "-" }
                  ].map((reg:any, idx:number) => (
                    <div key={idx} className="fin-row">
                      <span className="fin-key">{reg.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${reg.status === "Active" || reg.status === "Registered" ? "badge-low" : "badge-med"}`}>{reg.status}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{reg.code}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title">Statutory Obligations</div>
                  {[
                    { item: "Employee Handbook", status: true },
                    { item: "Safety Policies", status: true },
                    { item: "Grievance Mechanism", status: d.labour.contracts.missing === 0 },
                    { item: "Wage Slips Policy", status: true },
                    { item: "Leave Policy", status: true },
                    { item: "POSH Policy", status: d.labour.total_employees >= 50 ? true : false }
                  ].map((item:any, idx:number) => (
                    <div key={idx} className="fin-row">
                      <span className="fin-key">{item.item}</span>
                      <span style={{ color: item.status ? "var(--accent)" : "var(--amber)", fontFamily: 'var(--mono)', fontSize: '11px' }}>{item.status ? "✓ Done" : "⚠ Pending"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LICENSES TAB */}
            <div className={`tab-content ${activeTab === 'licenses' ? 'active' : ''}`}>
              <div className="section-hero"><h2>Licenses &amp; Regulatory Approvals</h2><p>Total: {d.licenses.length} licenses · Active: {d.licenses.filter((l:any) => l.status === "Active" || l.status === "Perpetual").length}</p></div>
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="card-title">License Registry</div>
                <table className="data-table">
                  <tbody>
                    {d.licenses.map((license:any, idx:number) => {
                      const ms = new Date(license.expiry_date).getTime() - new Date().getTime();
                      const days = Math.round(ms / 86400000);
                      const statusColor = license.status === "Active" ? (days < 90 ? "badge-med" : "badge-low") : license.status === "Perpetual" ? "badge-low" : "badge-high";
                      return (
                        <tr key={idx}>
                          <td className="td-key">
                            <div style={{ fontSize: '12px', fontWeight: 500 }}>{license.license_name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: '3px' }}>{license.issued_by}</div>
                          </td>
                          <td className="td-val">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`badge ${statusColor}`}>{license.status}</span>
                              {license.status === "Active" && days < 90 && (
                                <span style={{ fontSize: '10px', color: 'var(--amber)', fontFamily: 'var(--mono)' }}>Expires in {days}d</span>
                              )}
                              {license.status === "Perpetual" && (
                                <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Perpetual</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RISK ENGINE TAB */}
            <div className={`tab-content ${activeTab === 'risk' ? 'active' : ''}`}>
              <div className="section-hero"><h2>Risk Assessment Engine</h2><p>Comprehensive risk analysis across all compliance modules · Last updated: Today</p></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-title">Overall Risk Score</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem 0' }}>
                    <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                      <svg viewBox="0 0 120 120" width="140" height="140">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface2)" strokeWidth="12" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke={d.risk_engine.level === "High" ? "var(--red)" : d.risk_engine.level === "Medium" ? "var(--amber)" : "var(--accent)"} strokeWidth="12"
                          strokeDasharray={(2 * Math.PI * 50).toFixed(1)} strokeDashoffset={((2 * Math.PI * 50) * (1 - d.risk_engine.score / 100)).toFixed(1)}
                          strokeLinecap="round" transform="rotate(-90 60 60)" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--mono)', color: d.risk_engine.level === "High" ? "var(--red)" : d.risk_engine.level === "Medium" ? "var(--amber)" : "var(--accent)" }}>{d.risk_engine.score}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: '0.1em' }}>RISK SCORE</div>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '6px' }}>Risk Level</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: d.risk_engine.level === "High" ? "var(--red)" : d.risk_engine.level === "Medium" ? "var(--amber)" : "var(--accent)" }}>{d.risk_engine.level}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '6px' }}>Risk Category</div>
                        <div style={{ fontSize: '13px' }}>{d.risk_engine.primary_risk_area}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Risk Breakdown</div>
                  {[
                    ["GST Compliance", d.dashboard.subscore_gst, "#3D8EFF"],
                    ["Labour Compliance", d.dashboard.subscore_labour, "#FF4455"],
                    ["Tax Compliance", d.dashboard.subscore_tax, "#FFB300"],
                    ["Licensing", d.dashboard.subscore_licenses, "#00D4AA"],
                    ["ROC Compliance", d.dashboard.subscore_roc, "#9B6BFF"]
                  ].map(([label, score, color]: any) => {
                    const riskLevel = score >= 70 ? "Low" : score >= 45 ? "Medium" : "High";
                    return (
                      <div key={label} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                          <span style={{ color: 'var(--text2)' }}>{label}</span>
                          <span style={{ color, fontFamily: 'var(--mono)', fontWeight: 600 }}>{riskLevel}</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Mitigation Recommendations</div>
                {d.risk_engine.level === "High" && (
                  <div>
                    <div className="alert-item">
                      <div className="alert-icon high">🔴</div>
                      <div className="alert-body">
                        <div className="alert-title">Priority Action Required</div>
                        <div className="alert-meta">Address {d.risk_engine.primary_risk_area} compliance issues immediately</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,68,85,0.08)', borderLeft: '3px solid var(--red)', borderRadius: '4px', fontSize: '12px', color: 'var(--text2)' }}>
                      Recommended: Engage compliance experts to conduct full audit and remediation plan
                    </div>
                  </div>
                )}
                {d.risk_engine.level === "Medium" && (
                  <div>
                    <div className="alert-item">
                      <div className="alert-icon medium">🟡</div>
                      <div className="alert-body">
                        <div className="alert-title">Compliance Improvements Needed</div>
                        <div className="alert-meta">Proactive measures to reduce risk level</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,179,0,0.08)', borderLeft: '3px solid var(--amber)', borderRadius: '4px', fontSize: '12px', color: 'var(--text2)' }}>
                      Recommended: Schedule compliance review and implement corrective measures
                    </div>
                  </div>
                )}
                {d.risk_engine.level === "Low" && (
                  <div style={{ color: 'var(--accent)', fontSize: '13px', padding: '1rem', background: 'rgba(0,212,170,0.05)', borderRadius: '8px' }}>
                    ✓ Good compliance health maintained. Continue regular monitoring and updates.
                  </div>
                )}
              </div>
            </div>

            {/* PENALTIES TAB */}
            <div className={`tab-content ${activeTab === 'penalties' ? 'active' : ''}`}>
              <div className="section-hero"><h2>Penalties &amp; Liability</h2><p>Total Exposure: ₹{(d.total_penalty_now || 0).toLocaleString()} · {d.penalties?.length || 0} Violations</p></div>
              <div className="metric-grid metric-grid-3" style={{ marginBottom: '1.25rem' }}>
                <div className="metric"><div className="metric-label">Accrued Penalties</div><div className="metric-val metric-red">₹{(d.total_penalty_now || 0).toLocaleString()}</div><div className="metric-sub">To date</div></div>
                <div className="metric"><div className="metric-label">Potential Exposure</div><div className="metric-val metric-amber">₹{((d.total_penalty_now || 0) * 1.5).toLocaleString()}</div><div className="metric-sub">Max exposure</div></div>
                <div className="metric"><div className="metric-label">Status</div><div className="metric-val" style={{ color: d.penalties.length > 0 ? "var(--red)" : "var(--accent)" }}>{d.penalties.length > 0 ? "Overdue" : "✓ Clear"}</div><div className="metric-sub">Action needed</div></div>
              </div>
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="card-title">Detailed Penalty Breakdown</div>
                {d.penalties.length > 0 ? (
                  <table className="data-table">
                    <tbody>
                      {d.penalties.map((penalty:any, idx:number) => (
                        <tr key={idx}>
                          <td className="td-key">
                            <div style={{ fontSize: '12px', fontWeight: 500 }}>{penalty.type}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>{penalty.authority}</div>
                          </td>
                          <td className="td-val">
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-end' }}>
                              <div>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--red)', fontWeight: 600 }}>₹{(penalty?.amount || 0).toLocaleString()}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>{penalty.period}</div>
                              </div>
                              <span className="badge badge-high">{penalty.status || "Pending"}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ color: 'var(--accent)', fontSize: '13px', padding: '1rem', background: 'rgba(0,212,170,0.05)', borderRadius: '8px' }}>
                    ✓ No outstanding penalties recorded
                  </div>
                )}
              </div>
              <div className="card">
                <div className="card-title">Remediation Actions</div>
                {d.penalties.length > 0 && (
                  <div style={{ paddingTop: '8px' }}>
                    <div style={{ padding: '12px', background: 'rgba(255,68,85,0.08)', borderLeft: '3px solid var(--red)', borderRadius: '4px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Immediate Action Items:</div>
                      <ul style={{ marginTop: '8px', marginLeft: '1rem', fontSize: '12px', color: 'var(--text2)' }}>
                        <li>Review penalty orders and assess appeal eligibility</li>
                        <li>Prepare payment/installment plans</li>
                        <li>Implement preventive measures for future compliance</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FINANCIAL TAB */}
            <div className={`tab-content ${activeTab === 'financial' ? 'active' : ''}`}>
              <div className="section-hero"><h2>Financial Overview &amp; Forecasting</h2><p>Business Health: {d.dashboard.compliance_health}/100 · Liquidity Risk: {d.risk_engine.level}</p></div>
              <div className="metric-grid metric-grid-5" style={{ marginBottom: '1.25rem' }}>
                <div className="metric"><div className="metric-label">Annual Turnover</div><div className="metric-val metric-accent">₹{d.company.turnover_cr}Cr</div><div className="metric-sub">Revenue</div></div>
                <div className="metric"><div className="metric-label">Authorized Capital</div><div className="metric-val metric-blue">₹{(d.company.authorized_capital / 100000).toFixed(1)}L</div><div className="metric-sub">Registered</div></div>
                <div className="metric"><div className="metric-label">Paid-up Capital</div><div className="metric-val metric-accent">₹{(d.company.paid_up_capital / 100000).toFixed(1)}L</div><div className="metric-sub">Current</div></div>
                <div className="metric"><div className="metric-label">Tax Exposure</div><div className="metric-val metric-amber">₹{(d.income_tax?.tax_arrears || 0).toLocaleString()}</div><div className="metric-sub">Outstanding</div></div>
                <div className="metric"><div className="metric-label">Liquidity Score</div><div className="metric-val" style={{ color: d.dashboard.compliance_health >= 70 ? "var(--accent)" : "var(--amber)" }}>{d.dashboard.compliance_health >= 70 ? "Strong" : "Moderate"}</div><div className="metric-sub">Stability</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-title">Capital Structure</div>
                  {[
                    ["Authorized Capital:", `₹${(d.company.authorized_capital / 100000).toFixed(1)}L`, "var(--blue)"],
                    ["Issued Capital:", `₹${(d.company.paid_up_capital / 100000).toFixed(1)}L`, "var(--accent)"],
                    ["Utilization Ratio:", `${((d.company.paid_up_capital / d.company.authorized_capital) * 100).toFixed(1)}%`, "var(--text2)"]
                  ].map(([label, value, color]: any) => (
                    <div key={label} className="fin-row">
                      <span className="fin-key">{label}</span>
                      <span className="fin-val" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title">Cash Flow Impact</div>
                  {[
                    ["Monthly Operating Cost:", "Estimated ₹15-20L", "var(--text2)"],
                    ["Compliance Cost (Annual):", "Est. ₹8-12L", "var(--amber)"],
                    ["Penalty Provisions:", `₹${(d.total_penalty_now || 0).toLocaleString()}`, "var(--red)"]
                  ].map(([label, value, color]: any) => (
                    <div key={label} className="fin-row">
                      <span className="fin-key">{label}</span>
                      <span className="fin-val" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Financial Health Indicators</div>
                {[
                  { indicator: "Revenue Stability", status: "Stable", recommendation: "Continue current operations" },
                  { indicator: "Compliance Cost Ratio", status: "3-5% of Revenue", recommendation: "Acceptable for company size" },
                  { indicator: "Penalty Liability", status: d.penalties.length > 0 ? "Elevated" : "Low", recommendation: d.penalties.length > 0 ? "Address immediately" : "Monitor compliance" },
                  { indicator: "Capital Adequacy", status: "Adequate", recommendation: "Current levels sufficient" }
                ].map((item:any, idx:number) => (
                  <div key={idx} className="fin-row">
                    <span className="fin-key">{item.indicator}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '11px' }}>{item.status}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{item.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
