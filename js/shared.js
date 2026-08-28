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

    // Upgrade preview buttons to File Dropdown Menu
    upgradeActionButtonsToDropdown(moduleName, container);

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

// Upgrade Action Buttons to File Dropdown Menu
function upgradeActionButtonsToDropdown(moduleName, container) {
  if (!container) return;
  
  // Find all action buttons
  const buttons = container.querySelectorAll('button.btn-action');
  buttons.forEach(btn => {
    const onClickAttr = btn.getAttribute('onclick') || '';
    if (onClickAttr.includes('openMergedReviewModal')) {
      const parent = btn.parentNode;
      if (!parent) return;
      
      const dropdownWrapper = document.createElement('div');
      dropdownWrapper.className = 'dropdown no-print';
      dropdownWrapper.style.flex = '2';
      dropdownWrapper.style.position = 'relative';
      
      dropdownWrapper.innerHTML = `
        <button type="button" class="btn-action dropdown-toggle" style="background-color: #007bff; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 15px;" onclick="toggleFileDropdown(this, event)">
          📁 Menu File <span style="font-size: 10px;">▼</span>
        </button>
        <div class="dropdown-menu">
          <button type="button" class="dropdown-item" onclick="triggerImportJSON(event, '${moduleName}')">📂 Open File (JSON)</button>
          <button type="button" class="dropdown-item" onclick="triggerExportJSON(event, '${moduleName}')">💾 Save (JSON)</button>
          <button type="button" class="dropdown-item" onclick="triggerExportExcel(event, '${moduleName}')">📊 Export to Excel</button>
          <button type="button" class="dropdown-item" onclick="openMergedReviewModal(); event.preventDefault();">📄 Export to PDF</button>
        </div>
      `;
      
      // Let's remove the inline margin-top from the button inside dropdown-toggle if there's any conflict, 
      // but wrapping it fits perfectly.
      btn.style.marginTop = '0';
      parent.replaceChild(dropdownWrapper, btn);
    }
  });
}

// Toggle Dropdown Menu Visibility
function toggleFileDropdown(btn, event) {
  event.stopPropagation();
  const dropdownMenu = btn.nextElementSibling;
  if (!dropdownMenu) return;
  
  // Close all other dropdowns
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    if (menu !== dropdownMenu) {
      menu.classList.remove('show');
    }
  });
  
  dropdownMenu.classList.toggle('show');
}

// Global click handler to dismiss open dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('show');
    });
  }
});

// Import JSON file data to form
function triggerImportJSON(event, moduleName) {
  event.preventDefault();
  event.stopPropagation();
  
  const menu = event.target.closest('.dropdown-menu');
  if (menu) menu.classList.remove('show');
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const payload = JSON.parse(evt.target.result);
        
        // Validation check
        if (payload.moduleName && payload.moduleName !== moduleName) {
          if (!confirm(`File ini tampaknya ditujukan untuk modul "${payload.moduleName}". Apakah Anda yakin ingin memuatnya ke modul "${moduleName}"?`)) {
            return;
          }
        }
        
        const data = payload.data || payload;
        if (!Array.isArray(data)) {
          throw new Error("Format data tidak valid.");
        }
        
        const container = document.getElementById('moduleContainer');
        if (!container) return;
        
        const elements = container.querySelectorAll('input, select, textarea');
        data.forEach(item => {
          const el = elements[item.index];
          if (el) {
            if (el.type === 'radio' || el.type === 'checkbox') {
              el.checked = item.checked;
            } else {
              el.value = item.value;
            }
            // Trigger input/change events to update UI dynamically
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        
        // Immediately save data to local draft
        saveFormData(moduleName, container);
        showAlert('Data berhasil diimpor dari file JSON!', 'success');
      } catch (err) {
        console.error('Error parsing JSON:', err);
        showAlert('Gagal mengimpor file JSON. Pastikan format file benar.', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Export form data to JSON file
async function triggerExportJSON(event, moduleName) {
  event.preventDefault();
  event.stopPropagation();
  
  const menu = event.target.closest('.dropdown-menu');
  if (menu) menu.classList.remove('show');

  const container = document.getElementById('moduleContainer');
  if (!container) return;

  const data = [];
  container.querySelectorAll('input, select, textarea').forEach((el, index) => {
    if (el.type === 'radio' || el.type === 'checkbox') {
      data.push({ index, checked: el.checked, type: el.type, value: el.value });
    } else {
      data.push({ index, value: el.value, type: el.type });
    }
  });

  const payload = {
    moduleName: moduleName,
    timestamp: new Date().toISOString(),
    data: data
  };

  // Get details for dynamic filename
  let customerVal = '';
  let typesnVal = '';
  const customerEl = container.querySelector('.sync-customer') || container.querySelector('[class*="customer"]');
  const typesnEl = container.querySelector('.sync-typesn') || container.querySelector('[class*="type"]') || container.querySelector('[class*="sn"]');
  if (customerEl) customerVal = customerEl.value.trim().replace(/[^a-zA-Z0-9]/g, '_');
  if (typesnEl) typesnVal = typesnEl.value.trim().replace(/[^a-zA-Z0-9]/g, '_');

  const dateStr = new Date().toISOString().slice(0, 10);
  let fileName = `INSPEKSI_${moduleName.toUpperCase().replace(/\s+/g, '_')}`;
  if (customerVal) fileName += `_${customerVal}`;
  if (typesnVal) fileName += `_${typesnVal}`;
  fileName += `_${dateStr}.json`;

  const jsonString = JSON.stringify(payload, null, 2);

  // Coba gunakan File System Access API agar muncul Save File Dialog pemilihan lokasi
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'JSON Files',
          accept: {
            'application/json': ['.json']
          }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();
      showAlert('Draft berhasil disimpan!', 'success');
      return;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('User membatalkan dialog penyimpanan.');
        return;
      }
      console.error('Error dengan showSaveFilePicker, menggunakan fallback:', err);
    }
  }

  // Fallback ke unduhan otomatis biasa jika browser tidak mendukung showSaveFilePicker
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showAlert('Draft berhasil diekspor ke JSON!', 'success');
}

// Trigger Excel Export
function triggerExportExcel(event, moduleName) {
  event.preventDefault();
  event.stopPropagation();
  
  const menu = event.target.closest('.dropdown-menu');
  if (menu) menu.classList.remove('show');

  showAlert('Sedang memproses ekspor ke Excel...', 'info');

  if (typeof XLSX === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    document.head.appendChild(script);
    script.onload = () => {
      exportToExcelWorksheets(moduleName);
    };
    script.onerror = () => {
      showAlert('Gagal memuat library Excel. Periksa koneksi internet.', 'error');
    };
  } else {
    exportToExcelWorksheets(moduleName);
  }
}

// Export all tabs into an Excel Workbook with multiple sheets
function exportToExcelWorksheets(moduleName) {
  try {
    const wb = XLSX.utils.book_new();
    const tabs = document.querySelectorAll('.tab-content');
    
    if (tabs.length === 0) {
      showAlert('Tidak ada data tab untuk diekspor.', 'error');
      return;
    }

    tabs.forEach(tab => {
      const tabId = tab.id;
      const tabNameKey = tabId.replace('tab-', '');
      const btn = document.querySelector(`.tab-btn[onclick*="'${tabNameKey}'"]`) || 
                  document.querySelector(`.tab-btn[onclick*="switchTab('${tabNameKey}'"]`) ||
                  document.querySelector(`.tab-btn[onclick*="${tabNameKey}"]`);
      let sheetName = btn ? btn.textContent.trim() : tabNameKey.toUpperCase();
      sheetName = sheetName.replace(/[\\\/?\*:\[\]]/g, '').substring(0, 30);
      if (!sheetName) sheetName = tabId;

      // Find all tables in this tab
      const tables = tab.querySelectorAll('table');
      if (tables.length === 0) return;

      const tempContainer = document.createElement('div');
      
      tables.forEach((table, index) => {
        const clone = table.cloneNode(true);
        
        // Replace inputs with values
        clone.querySelectorAll('input, select, textarea').forEach(el => {
          let val = '';
          if (el.type === 'checkbox' || el.type === 'radio') {
            val = el.checked ? '✓' : '';
          } else {
            val = el.value || '';
          }
          const span = document.createElement('span');
          span.textContent = val;
          el.parentNode.replaceChild(span, el);
        });

        // Clean up buttons and no-print elements in the cloned table
        clone.querySelectorAll('.no-print, button, .btn-insert-row, .btn-delete-row').forEach(el => el.remove());
        
        tempContainer.appendChild(clone);
        
        // Add spacing rows between tables
        if (index < tables.length - 1) {
          const spaceTable = document.createElement('table');
          spaceTable.innerHTML = '<tr><td style="border:none;">&nbsp;</td></tr>';
          tempContainer.appendChild(spaceTable);
        }
      });

      // Convert compiled tables to worksheet
      const ws = XLSX.utils.table_to_sheet(tempContainer);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Make filename dynamic
    const container = document.getElementById('moduleContainer') || document.body;
    let customerVal = '';
    let typesnVal = '';
    const customerEl = container.querySelector('.sync-customer') || container.querySelector('[class*="customer"]');
    const typesnEl = container.querySelector('.sync-typesn') || container.querySelector('[class*="type"]') || container.querySelector('[class*="sn"]');
    if (customerEl) customerVal = customerEl.value.trim().replace(/[^a-zA-Z0-9]/g, '_');
    if (typesnEl) typesnVal = typesnEl.value.trim().replace(/[^a-zA-Z0-9]/g, '_');

    const dateStr = new Date().toISOString().slice(0, 10);
    let fileName = `INSPEKSI_${moduleName.toUpperCase().replace(/\s+/g, '_')}`;
    if (customerVal) fileName += `_${customerVal}`;
    if (typesnVal) fileName += `_${typesnVal}`;
    fileName += `_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
    showAlert('Data berhasil diekspor ke Excel!', 'success');
  } catch (err) {
    console.error('Error exporting to Excel:', err);
    showAlert('Gagal mengekspor data ke Excel.', 'error');
  }
}

// Print to PDF
function triggerPrintPDF(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const menu = event.target.closest('.dropdown-menu');
  if (menu) menu.classList.remove('show');
  
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
