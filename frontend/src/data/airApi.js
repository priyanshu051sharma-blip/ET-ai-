import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

export const fetchCityOverview    = () => client.get('/api/air/city-overview').then(r => r.data).catch(() => ({ zones: [], city_avg_aqi: 0, city_score: 0, critical_zones: 0, worst_zones: [], total_zones: 0 }));
export const fetchHealthAdvisory  = (loc) => client.get(`/api/air/health-advisory?location=${encodeURIComponent(loc)}`).then(r => r.data).catch(() => null);
export const fetchMultiCity       = () => client.get('/api/air/multi-city').then(r => r.data).catch(() => ({ cities: [] }));
export const fetchInterventionPlan= (loc) => client.get(`/api/air/intervention-plan?location=${encodeURIComponent(loc)}`).then(r => r.data).catch(() => ({ actions: [] }));
export const fetchWardComparison  = () => client.get('/api/air/ward-comparison').then(r => r.data).catch(() => ({ wards: [] }));
export const fetchForecast        = (loc) => client.get(`/api/ai/forecast?location=${encodeURIComponent(loc)}`).then(r => r.data.forecast || []).catch(() => []);
export const fetchSourceAnalysis  = (loc) => client.get(`/api/ai/source-analysis?location=${encodeURIComponent(loc)}`).then(r => r.data).catch(() => ({ sources: [], explanation: '' }));
export const fetchLocations       = () => client.get('/api/locations').then(r => r.data).catch(() => ({ locations: [] }));
export const fetchLatestReadings  = (loc) => client.get(`/api/readings/latest?location=${encodeURIComponent(loc)}`).then(r => r.data.readings || []).catch(() => []);
export const sendAirChat          = (message, location) => client.post('/api/chat', { message, location }).then(r => r.data.response || '').catch(() => 'Unable to reach AI assistant.');
