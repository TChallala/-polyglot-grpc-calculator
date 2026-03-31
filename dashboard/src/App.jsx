import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Activity, Server, Cpu, Database, ChevronRight, Play } from 'lucide-react';
import './App.css';

const SERVICES = [
  { id: 'add', name: 'Add Service', lang: 'Node.js', color: '#339933', port: 50051 },
  { id: 'subtract', name: 'Subtract Service', lang: 'Java', color: '#ED8B00', port: 50052 },
  { id: 'multiply', name: 'Multiply Service', lang: 'Go', color: '#00ADD8', port: 50053 },
  { id: 'divide', name: 'Divide Service', lang: 'Python', color: '#3776AB', port: 50054 },
];

function App() {
  const [expression, setExpression] = useState('10 / 2 + 5 * 3 - 2');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeNodes, setActiveNodes] = useState([]);
  const [error, setError] = useState(null);

  const calculate = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setActiveNodes(['orchestrator']);

    try {
      // Simulate orchestration flow for visualization
      // In a real overkill, we'd use WebSockets for real-time traces
      const response = await axios.post('http://localhost:3000/calculate', { expression });
      
      // Artificial delay to see the "flow" sequence
      const ops = expression.match(/[\+\-\*\/]/g) || [];
      for (const op of ops) {
        let nodeId = '';
        if (op === '+') nodeId = 'add';
        if (op === '-') nodeId = 'subtract';
        if (op === '*') nodeId = 'multiply';
        if (op === '/') nodeId = 'divide';
        
        setActiveNodes(prev => [...prev, nodeId]);
        await new Promise(r => setTimeout(r, 600));
      }

      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to Orchestrator');
    } finally {
      setLoading(false);
      setTimeout(() => setActiveNodes([]), 2000);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="glass-card">
        <header className="header">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h1>Overkill Calculator</h1>
            <p>Polyglot gRPC Microservices Cluster</p>
          </motion.div>
        </header>

        <div className="input-container">
          <input 
            type="text" 
            value={expression} 
            onChange={(e) => setExpression(e.target.value)}
            placeholder="Enter expression (e.g. 10 + 5)"
          />
          <button onClick={calculate} disabled={loading}>
            {loading ? <Activity className="animate-spin" /> : <Play fill="currentColor" />}
          </button>
        </div>

        <div className="visualization">
          <div className="orchestrator-node">
            <motion.div 
              className={`node ${activeNodes.includes('orchestrator') ? 'active' : ''}`}
              animate={activeNodes.includes('orchestrator') ? { scale: 1.05 } : { scale: 1 }}
            >
              <div className="node-label">Central Logic</div>
              <div className="node-name">Orchestrator</div>
              <div className="lang-tag">Node.js / MathJS</div>
            </motion.div>
          </div>

          <div className="node-grid">
            {SERVICES.map((svc) => (
              <motion.div 
                key={svc.id}
                className={`node ${activeNodes.includes(svc.id) ? 'active' : ''}`}
                animate={activeNodes.includes(svc.id) ? { y: -10, scale: 1.05 } : { y: 0, scale: 1 }}
              >
                <div className="node-label">gRPC Worker</div>
                <div className="node-name">{svc.name}</div>
                <div className="lang-tag" style={{ border: `1px solid ${svc.color}`, color: svc.color }}>
                  {svc.lang}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {result !== null && (
            <motion.div 
              className="result-display"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              {result}
            </motion.div>
          )}
          {error && (
            <motion.div style={{ color: '#ff4444', marginTop: '2rem' }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
