// API Client for SATHI Backend v4.0 Multi-Agency Suite

const API_BASE = '/api';

export async function fetchSimulation(strategy = 'sathi', seed = 42, scenario = 'medical') {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ strategy, seed, scenario })
  });
  if (!res.ok) throw new Error('Simulation request failed');
  return res.json();
}

export async function fetchBattleMode(seed = 42, scenario = 'medical') {
  const res = await fetch(`${API_BASE}/battle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ strategy: 'sathi', seed, scenario })
  });
  if (!res.ok) throw new Error('Battle mode request failed');
  return res.json();
}

export async function fetchComparison(seed = 42, scenario = 'medical') {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ strategy: 'sathi', seed, scenario })
  });
  if (!res.ok) throw new Error('Comparison request failed');
  return res.json();
}

export async function submitWhatIfAssign(incident_id, vehicle_id, seed = 42, scenario = 'medical') {
  const res = await fetch(`${API_BASE}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident_id, vehicle_id, seed, scenario })
  });
  if (!res.ok) throw new Error('What-if assignment failed');
  return res.json();
}

export async function askAIAssistant(query, strategy = 'sathi', seed = 42, scenario = 'medical') {
  const res = await fetch(`${API_BASE}/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, strategy, seed, scenario })
  });
  if (!res.ok) throw new Error('AI Assistant query failed');
  return res.json();
}
