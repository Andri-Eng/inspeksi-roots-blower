// ==================== GLOBAL CONFIGURATION ====================

// Credentials & Authentication
const VALID_CREDENTIALS = [
  { username: 'admin', password: 'admin123', role: 'Administrator' },
  { username: 'teknisi', password: 'tech123', role: 'Teknisi' },
  { username: 'supervisor', password: 'sup123', role: 'Supervisor' }
];

// Module Configuration
const INSPECTION_MODULES = {
  'ROOT BLOWER': {
    path: 'modules/root-blower.html',
    title: 'ROOT BLOWER INSPECTION',
    icon: '🔧',
    description: 'Modul inspeksi Roots Blower Assembly'
  },
  'VACUUM PUMP': {
    path: 'modules/vacuum-pump.html',
    title: 'VACUUM PUMP INSPECTION',
    icon: '⚙️',
    description: 'Modul inspeksi Vacuum Pump'
  },
  'REWINDING': {
    path: 'modules/rewinding.html',
    title: 'MOTOR REWINDING INSPECTION',
    icon: '⚡',
    description: 'Modul inspeksi Motor Rewinding'
  },
  'GEARBOX': {
    path: 'modules/gearbox.html',
    title: 'GEARBOX INSPECTION',
    icon: '🔩',
    description: 'Modul inspeksi Gearbox'
  },
  'ROTARY VALVE': {
    path: 'modules/rotary-valve.html',
    title: 'ROTARY VALVE INSPECTION',
    icon: '🛞',
    description: 'Modul inspeksi Rotary Valve'
  },
  'OTHER': {
    path: 'modules/shaft-repair.html',
    title: 'SHAFT INDUSTRIAL REPAIR',
    icon: '🔨',
    description: 'Modul inspeksi Shaft Repair & Industrial Repair'
  }
};

// Color Theme
const THEME = {
  primary: '#007bff',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  dark: '#343a40',
  light: '#f8f9fa'
};
