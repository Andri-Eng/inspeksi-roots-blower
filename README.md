# Sistem Inspeksi Assembly & Industrial Repair - Dokumentasi Modular

## 📋 Struktur Folder

```
Ceklist/
├── index.html                  # Landing page + Login + Kategori Selection
├── master_data.json           # Master data file
│
├── css/
│   └── shared.css             # Shared styles untuk semua modules
│
├── js/
│   ├── config.js              # Global configuration (credentials, module mapping)
│   └── shared.js              # Utility functions (session, auth, loading, canvas)
│
├── modules/                    # Independent inspection modules
│   ├── root-blower.html       # ROOT BLOWER inspection
│   ├── vacuum-pump.html       # VACUUM PUMP inspection
│   ├── rewinding.html         # MOTOR REWINDING inspection
│   ├── gearbox.html           # GEARBOX inspection
│   ├── rotary-valve.html      # ROTARY VALVE inspection
│   └── shaft-repair.html      # SHAFT INDUSTRIAL REPAIR (mapped to "OTHER")
│
└── [Image & Logo files]       # dimensi-rotor.png, logo-intidaya.jpg, etc.
```

## 🔐 Sistem Autentikasi

**Demo Credentials (dalam js/config.js):**
```
1. Username: admin          | Password: admin123    | Role: Administrator
2. Username: teknisi1       | Password: tech123     | Role: Teknisi
3. Username: supervisor     | Password: sup123      | Role: Supervisor
```

- Session disimpan di localStorage
- Session persist setelah refresh page
- Logout otomatis saat klik "Kembali ke Home"

## 🏗️ Arsitektur Modular

### Keuntungan Modular Architecture

✅ **Decoupled Code** - Perubahan di ROTARY VALVE tidak mempengaruhi ROOT BLOWER
✅ **Independent Development** - Setiap modul dapat dikembangkan secara parallel
✅ **Easy Maintenance** - Kode per-kategori terisolasi di file terpisah
✅ **Reusable Utilities** - Shared functions di js/shared.js tersedia untuk semua modul
✅ **Consistent Styling** - CSS variables di css/shared.css untuk tema unified

### File Descriptions

#### 📄 index.html
- **Purpose:** Landing page, login modal, kategori selection
- **Content:** Hero section, login form, kategori grid
- **No Module Code:** Semua code-specific module dihapus
- **Module Loading:** Menggunakan `loadModule(categoryName)` dari shared.js

#### 📄 js/config.js
```javascript
// Konfigurasi Credentials
const VALID_CREDENTIALS = [
  { username: 'admin', password: 'admin123', role: 'Administrator' },
  // ...
];

// Mapping kategori ke file modul
const INSPECTION_MODULES = {
  'ROOT BLOWER': { path: 'modules/root-blower.html', ... },
  'VACUUM PUMP': { path: 'modules/vacuum-pump.html', ... },
  // ... semua 6 kategori
};
```

#### 📄 js/shared.js
**Session Management:**
- `saveSession(username, role)` - Simpan session ke localStorage
- `getSession()` - Ambil session dari localStorage
- `clearSession()` - Hapus session
- `isSessionValid()` - Check session validity

**Authentication:**
- `validateCredentials(username, password)` - Validasi credentials

**Module Loading:**
- `async loadModule(moduleName)` - Load modul HTML dynamically via fetch
- Executes embedded scripts dalam modul
- Handles error gracefully

**Canvas & Annotation:**
- `loadCanvasImage(event, canvasId)` - Load gambar ke canvas
- `enableCanvasAnnotationMode(canvasId, callback)` - Enable interactive annotation
- `addCanvasAnnotation(canvasId, x, y, label)` - Add annotation
- `getCanvasAnnotations(canvasId)` - Get all annotations
- `clearCanvasAnnotations(canvasId)` - Clear all annotations
- `redrawCanvasAnnotations(canvasId)` - Redraw annotations

**UI Helpers:**
- `show(elementId)`, `hide(elementId)` - Toggle visibility
- `showAlert(message, type)` - Show alert message

**Other:**
- `validateFields(fieldIds)` - Validate required fields
- `syncFormData(dataMap)` - Sync values across elements
- `exportCanvasAsImage(canvasId)` - Export canvas as image
- `printPage()` - Print current page
- `formatDateID(dateString)` - Format date
- `getCurrentUser()` - Get current logged-in user

#### 📄 css/shared.css
- **Color Theme Variables** - Primary, success, danger, warning, info, dark, light
- **Landing Page Styles** - Hero section, responsive layout
- **Modal & Card Styles** - Login modal, category selection
- **Form Styles** - Input, select, form groups
- **Alert Styles** - Info, success, warning, error alerts
- **Tab Navigation** - Tab buttons and content
- **Table & Sheet Styles** - Tables for data entry
- **Canvas Styles** - Canvas container and tools
- **Responsive Breakpoints** - Mobile optimizations
- **Print Media** - Print-friendly styling

## 📦 Module Template

Setiap modul mengikuti template standar:

```html
<div class="app-viewport">
  <!-- 1. Init Form (Order Data) -->
  <div id="[prefix]PageInit" class="auth-card">
    [Form fields untuk input data awal]
  </div>

  <!-- 2. Main System (Tabs & Sheets) -->
  <div id="[prefix]MainSystem" class="main-system">
    <div class="tab-container">
      <button class="nav-btn-home" onclick="resetToHome()">🏠 Home</button>
      <button class="tab-btn active" onclick="[prefix]SwitchTab('tab1', this)">Tab 1</button>
      <!-- More tabs -->
    </div>
    
    <!-- Tab Contents -->
    <div id="tab-tab1" class="tab-content active">
      <div class="sheet"><!-- Content --></div>
    </div>
    <!-- More tabs -->
  </div>

  <!-- 3. Preview Modal -->
  <div id="[prefix]ReviewModal" class="preview-modal">
    <!-- Preview content -->
  </div>
</div>

<script>
  function [prefix]ProcessInitData() { /* Validate & process */ }
  function [prefix]SwitchTab(tabName, btn) { /* Switch tabs */ }
  function [prefix]OpenReview() { /* Show preview */ }
  function [prefix]CloseReview() { /* Hide preview */ }
</script>
```

**Prefix Convention:** 
- RB = Root Blower
- VP = Vacuum Pump
- RW = Rewinding
- GB = Gearbox
- RV = Rotary Valve
- SR = Shaft Repair

## 🚀 Cara Menggunakan

### 1. Login
- Klik "START ANALYSIS"
- Masukkan credentials (demo: admin/admin123)
- Sistem akan menyimpan session di localStorage

### 2. Pilih Kategori
- Pilih kategori dari grid (6 opsi)
- Sistem akan load modul HTML secara dinamis via fetch

### 3. Isi Data Inspeksi
- Isi form "DATA ORDER & PERSONEL"
- Navigasi antar tabs untuk setiap section
- Klik "🔍 Preview Document" untuk lihat hasil

### 4. Print/Save
- Klik "🖨️ Print to PDF" dari preview modal
- Gunakan browser Print dialog untuk save sebagai PDF

### 5. Logout
- Klik "🏠 Home" di setiap modul
- Session akan dihapus, kembali ke landing page

## 🛠️ Development Guide

### Menambah Module Baru

1. **Buat file baru** di `modules/nama-module.html`
2. **Update config.js** - Tambahkan entry di INSPECTION_MODULES:
   ```javascript
   'NAMA KATEGORI': {
     path: 'modules/nama-module.html',
     title: 'JUDUL MODULE',
     icon: '🔧',
     description: 'Deskripsi'
   }
   ```
3. **Tambahkan tombol** di kategori menu di index.html:
   ```html
   <button class="btn-category" onclick="selectCategory('NAMA KATEGORI')">NAMA KATEGORI</button>
   ```
4. **Implementasikan modul** dengan template standar

### Customize Styling

- Edit `css/shared.css` untuk perubahan global
- Gunakan CSS variables dari `:root` untuk konsistensi
- Tambah `<style>` inline di modul untuk styling spesifik

### Add Canvas Annotation

Di modul Anda:
```javascript
// Enable annotation mode
enableCanvasAnnotationMode('canvasId', function(x, y) {
  addCanvasAnnotation('canvasId', x, y, 'Label Text');
});

// Get annotations
const annotations = getCanvasAnnotations('canvasId');

// Clear annotations
clearCanvasAnnotations('canvasId');
```

### Form Data Sync

Gunakan class naming convention untuk auto-sync:
```html
<input class="data-sync-brand-rb" /> <!-- sync across all .data-sync-brand-rb -->
<input class="data-sync-brand-rb" />
```

Sync dengan JavaScript:
```javascript
syncFormData({
  'data-sync-brand-rb': brandValue,
  'data-sync-type-rb': typeValue
});
```

## ⚠️ Important Notes

- **No Backend Required** - Sistem fully client-side (file-based)
- **localStorage Dependency** - Browser harus support localStorage
- **Relative Paths** - Semua paths relative to index.html location
- **CORS** - Jika hosting di server, pastikan CORS configured
- **Print Styling** - Gunakan media queries `@media print` untuk print layout

## 📝 Future Enhancement

- [ ] Backend API integration untuk session storage
- [ ] Database untuk master data
- [ ] Multi-user support dengan role-based access control
- [ ] Export data to Excel/PDF dengan formatting
- [ ] Image upload dan annotation persistence
- [ ] Offline mode support
- [ ] Mobile app version (React Native)
- [ ] Real-time collaboration features

## 🤝 Support

Untuk pertanyaan atau issues, silahkan hubungi admin@intidaya.co.id
