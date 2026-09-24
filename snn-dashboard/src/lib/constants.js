export const CITY_COORDS = {
  abudhabi:  { center: [24.4539, 54.3773], zoom: 15 },
  beirut:    { center: [33.8938, 35.5018], zoom: 15 },
  mumbai:    { center: [19.0760, 72.8777], zoom: 15 },
  paris:     { center: [48.8566, 2.3522],  zoom: 15 },
  hongkong:  { center: [22.3193, 114.1694],zoom: 15 },
  bordeaux:  { center: [44.8378, -0.5792], zoom: 15 },
  pisa:      { center: [43.7228, 10.4017], zoom: 15 },
  cupertino: { center: [37.3230, -122.0322], zoom: 15 },
  nantes:    { center: [47.2184, -1.5536], zoom: 15 },
  rennes:    { center: [48.1173, -1.6778], zoom: 15 },
  beihai:    { center: [21.4811, 109.1200], zoom: 15 },
}

export const CHANGE_TYPES = {
  1: { name: 'Construction / Urban Sprawl', color: '#EF4444', severity: 'high',   icon: '🔴' },
  2: { name: 'Vegetation Clearance',        color: '#22C55E', severity: 'medium', icon: '🟢' },
  3: { name: 'Water Body Change',           color: '#3B82F6', severity: 'high',   icon: '🔵' },
  4: { name: 'Other Land Alteration',       color: '#EAB308', severity: 'low',    icon: '🟡' },
}

export const SEVERITY_CONFIG = {
  high:   { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)',  border: 'rgba(239, 68, 68, 0.3)' },
  medium: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
  low:    { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)',  border: 'rgba(34, 197, 94, 0.3)' },
}
