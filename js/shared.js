// ==================== SHARED UTILITY FUNCTIONS ====================

// Session Management
function saveSession(username, role) {
  const sessionData = { username, role, loginTime: new Date().toISOString() };
  localStorage.setItem('sessionData', JSON.stringify(sessionData));
  return sessionData;
}

function getSession() {
  const stored = localStorage.getItem('sessionData');
  return stored ? JSON.parse(stored) : null;
}

function clearSession() {
  localStorage.removeItem('sessionData');
}

function isSessionValid() {
  return getSession() !== null;
}

// Validate Credentials
function validateCredentials(username, password) {
  return VALID_CREDENTIALS.find(cred => 
    cred.username === username && cred.password === password
  );
}

// Show/Hide Elements
function show(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = 'flex' || 'block';
}

function hide(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = 'none';
}

// Show Alert
function showAlert(message, type = 'info') {
  const alertId = `alert-${Date.now()}`;
  const alertDiv = document.createElement('div');
  alertDiv.id = alertId;
  alertDiv.className = `alert-${type}`;
  alertDiv.textContent = message;
  
  const container = document.querySelector('.app-viewport') || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    const el = document.getElementById(alertId);
    if (el) el.remove();
  }, 3000);
}

// Form Data Sync Across Inputs
function syncFormData(dataMap) {
  Object.entries(dataMap).forEach(([selector, value]) => {
    document.querySelectorAll(selector).forEach(el => {
      el.value = value;
    });
  });
}

// Load Module Dynamically
async function loadModule(moduleName) {
  const moduleConfig = INSPECTION_MODULES[moduleName];
  
  if (!moduleConfig) {
    console.error(`Module ${moduleName} not found`);
    return false;
  }

  try {
    const response = await fetch(moduleConfig.path);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Get or create module container
    let container = document.getElementById('moduleContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'moduleContainer';
      document.body.appendChild(container);
    }

    // TAMPILKAN container
    container.style.display = 'block';
    container.style.setProperty('display', 'block', 'important');
    console.log(`📦 Module container displayed (z-index: 2000)`);

    // Clear previous content
    container.innerHTML = html;

    // Execute scripts in the loaded HTML
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      newScript.textContent = script.textContent;
      document.body.appendChild(newScript);
    });

    // Initialize auto-save & restore data
    initAutoSave(moduleName, container);

    console.log(`✅ Module ${moduleName} loaded successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to load module ${moduleName}:`, error);
    showAlert(`Gagal memuat modul ${moduleName}`, 'error');
    return false;
  }
}

// Canvas Annotation Management
const canvasAnnotations = {};

function initCanvasAnnotations(canvasId) {
  if (!canvasAnnotations[canvasId]) {
    canvasAnnotations[canvasId] = [];
  }
}

function addCanvasAnnotation(canvasId, x, y, label) {
  if (!canvasAnnotations[canvasId]) {
    canvasAnnotations[canvasId] = [];
  }
  
  canvasAnnotations[canvasId].push({ 
    x: Math.round(x), 
    y: Math.round(y), 
    label: label.toUpperCase(),
    id: Date.now() 
  });

  return canvasAnnotations[canvasId].length;
}

function getCanvasAnnotations(canvasId) {
  return canvasAnnotations[canvasId] || [];
}

function clearCanvasAnnotations(canvasId) {
  canvasAnnotations[canvasId] = [];
}

// Load Canvas Image
function loadCanvasImage(event, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      initCanvasAnnotations(canvasId);
      redrawCanvasAnnotations(canvasId);
    };
    img.src = e.target.result;
  };

  if (event.target.files[0]) {
    reader.readAsDataURL(event.target.files[0]);
  }
}

// Draw Annotations on Canvas
function redrawCanvasAnnotations(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const annotations = getCanvasAnnotations(canvasId);

  annotations.forEach((ann) => {
    // Draw semi-transparent circle
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(ann.x, ann.y, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Draw circle outline
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ann.x, ann.y, 15, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw label
    ctx.fillStyle = 'red';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ann.label, ann.x, ann.y);
  });
}

// Enable Canvas Annotation Mode
function enableCanvasAnnotationMode(canvasId, callback) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  canvas.style.cursor = 'crosshair';

  canvas.onclick = function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const label = prompt('Masukkan label area (misal: A, B, C, atau nama area):', 'A');
    if (label) {
      const count = addCanvasAnnotation(canvasId, x, y, label);
      redrawCanvasAnnotations(canvasId);
      if (callback) callback(count);
    }
  };
}

// Disable Canvas Annotation Mode
function disableCanvasAnnotationMode(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (canvas) {
    canvas.style.cursor = 'default';
    canvas.onclick = null;
  }
}

// Export Canvas as PNG
function exportCanvasAsImage(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  return canvas.toDataURL('image/png');
}

// Print/Export Page
function printPage() {
  window.print();
}

// Validate Required Fields
function validateFields(fieldIds) {
  let isValid = true;
  const errors = [];

  fieldIds.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    if (!field.value || field.value.trim() === '') {
      isValid = false;
      errors.push(field.name || fieldId);
      field.style.borderColor = '#dc3545';
    } else {
      field.style.borderColor = '#cbd5e1';
    }
  });

  return { isValid, errors };
}

// Format Date to Indonesian Format
function formatDateID(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

// Get Current User Info
function getCurrentUser() {
  const session = getSession();
  return session ? `${session.username} (${session.role})` : 'Guest';
}

// Initialize Page on Load
function initializeAppOnLoad() {
  // Sengaja dikosongkan agar index.html mengontrol tampilan halaman utama sepenuhnya
}

// Add this to DOM when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAppOnLoad);
} else {
  initializeAppOnLoad();
}

// ==================== AUTO SAVE & RESTORE FOR FORMS ====================
function initAutoSave(moduleName, container) {
  if (!container) return;
  
  // 1. Restore data if exists
  restoreAutoSave(moduleName, container);
  
  // 2. Set up event listener for auto-save on any input changes
  container.addEventListener('input', debounce(() => {
    saveFormData(moduleName, container);
  }, 500));
  
  container.addEventListener('change', () => {
    saveFormData(moduleName, container);
  });
}

function saveFormData(moduleName, container) {
  const data = [];
  container.querySelectorAll('input, select, textarea').forEach((el, index) => {
    if (el.type === 'radio' || el.type === 'checkbox') {
      data.push({ index, checked: el.checked, type: el.type, value: el.value });
    } else {
      data.push({ index, value: el.value, type: el.type });
    }
  });
  localStorage.setItem(`draft_${moduleName}`, JSON.stringify(data));
  console.log(`💾 Auto-saved draft for ${moduleName}`);
}

function restoreAutoSave(moduleName, container) {
  const stored = localStorage.getItem(`draft_${moduleName}`);
  if (!stored) return;
  
  try {
    const data = JSON.parse(stored);
    const elements = container.querySelectorAll('input, select, textarea');
    data.forEach(item => {
      const el = elements[item.index];
      if (el) {
        if (el.type === 'radio' || el.type === 'checkbox') {
          el.checked = item.checked;
        } else {
          el.value = item.value;
        }
        // Trigger event input/change to run any local event listeners in modules
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    console.log(`🔌 Restored draft for ${moduleName}`);
  } catch (e) {
    console.error(`Failed to restore draft for ${moduleName}:`, e);
  }
}

function clearModuleDraft(moduleName) {
  localStorage.removeItem(`draft_${moduleName}`);
  console.log(`🗑️ Cleared draft for ${moduleName}`);
}

// Simple debounce helper
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Listen to any page-leaving actions that mean a reset or explicit navigation back to home
document.addEventListener('click', function(e) {
  const btn = e.target.closest('button, a');
  if (btn) {
    const text = btn.textContent || '';
    const html = btn.outerHTML || '';
    if (
      text.includes('Kembali ke Home') || 
      text.includes('Kembali ke Menu Utama') || 
      html.includes('index.html')
    ) {
      const activeModule = localStorage.getItem('activeModule');
      if (activeModule) {
        // Option: clear module draft when going back to home so it starts clean next time
        localStorage.removeItem(`draft_${activeModule}`);
      }
      localStorage.removeItem('activeModule');
    }
  }
});
