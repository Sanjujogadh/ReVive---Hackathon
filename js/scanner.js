/**
 * ReVive — Friendly Smart Waste Scanner
 * Features:
 * - Extremely prominent, intuitive 4-mode input (Quick Pick, Upload, Camera, Search)
 * - Simple everyday English instructions
 * - Clean loading states & secure AI vision integration
 */

import { appState } from './state.js';
import { WASTE_DATABASE, searchWasteDatabase } from './database.js';

let streamActive = null;
let activeScanImage = null;
let activeScanMime = 'image/jpeg';
let currentScanSequence = 0;

export function initScanner() {
  renderScannerUI();
  setupQuickPills();
  setupSearchInput();
  setupFileUpload();
  setupCamera();
}

function renderScannerUI() {
  const container = document.getElementById('scanner-input-container');
  if (!container) return;

  container.innerHTML = `
    <div class="dreamy-card p-6 md:p-8">
      
      <!-- Card Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span class="text-xs uppercase tracking-wider font-bold text-emerald-800">Step 1 • Packaging Scanner</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-forest-950 font-editorial-serif tracking-tight">
            What are you recycling today?
          </h2>
        </div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Zero Sign-Up Required</span>
        </div>
      </div>

      <!-- Mode Tabs: Clean, Friendly & Rounded -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200 mb-6">
        <button id="tab-quick" class="tab-btn py-2.5 px-3 rounded-xl text-xs font-bold bg-white text-forest-950 shadow-sm transition-all flex items-center justify-center gap-1.5">
          <span>⚡</span>
          <span>Quick Pick</span>
        </button>
        <button id="tab-upload" class="tab-btn py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-forest-950 transition-all flex items-center justify-center gap-1.5">
          <span>📁</span>
          <span>Upload Photo</span>
        </button>
        <button id="tab-camera" class="tab-btn py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-forest-950 transition-all flex items-center justify-center gap-1.5">
          <span>📷</span>
          <span>Use Camera</span>
        </button>
        <button id="tab-search" class="tab-btn py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-forest-950 transition-all flex items-center justify-center gap-1.5">
          <span>🔍</span>
          <span>Search Guide</span>
        </button>
      </div>

      <!-- TAB 1: Quick Pick (Most Intuitive & Instant) -->
      <div id="panel-quick" class="tab-panel space-y-3">
        <p class="text-xs text-forest-700 font-medium">
          Tap any common packaging item to see how it should be prepared and sorted in Bengaluru:
        </p>
        <div id="quick-pills-container" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <!-- Dynamically populated chips -->
        </div>
      </div>

      <!-- TAB 2: Upload Photo -->
      <div id="panel-upload" class="tab-panel hidden space-y-4">
        <div 
          id="dropzone" 
          class="border-2 border-dashed border-emerald-300/80 hover:border-emerald-600 rounded-3xl p-8 text-center cursor-pointer transition-all bg-emerald-50/30 hover:bg-emerald-50/60"
        >
          <input type="file" id="file-input" accept="image/*" class="hidden" />
          <div class="text-4xl mb-2">📸</div>
          <p class="text-sm font-bold text-forest-950">Drop packaging photo here, or tap to browse</p>
          <p class="text-xs text-slate-500 mt-1">Accepts JPG, PNG, WEBP from your phone or laptop</p>
        </div>

        <div id="upload-status-banner" class="hidden p-3.5 rounded-2xl text-xs font-medium"></div>

        <div id="upload-preview-wrapper" class="hidden flex items-center gap-4 p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-sm">
          <img id="upload-preview-img" src="" alt="Upload preview" class="w-16 h-16 object-cover rounded-xl border border-slate-300 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p id="upload-filename" class="text-xs font-bold text-forest-950 truncate">packaging-photo.jpg</p>
            <p class="text-[11px] text-slate-500">Photo loaded and ready for analysis</p>
          </div>
          <button id="btn-analyze-upload" class="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 flex-shrink-0">
            <span>✨</span>
            <span>Analyze Photo with AI</span>
          </button>
        </div>
      </div>

      <!-- TAB 3: Camera Capture -->
      <div id="panel-camera" class="tab-panel hidden space-y-4">
        <div class="relative bg-slate-900 rounded-3xl overflow-hidden aspect-video flex items-center justify-center shadow-inner">
          <video id="camera-feed" autoplay playsinline class="w-full h-full object-cover hidden"></video>
          <canvas id="camera-canvas" class="hidden"></canvas>
          <div id="camera-placeholder" class="text-center p-6 text-slate-400">
            <div class="text-4xl mb-2">🎥</div>
            <p class="text-sm font-bold text-white">Camera Standby</p>
            <p class="text-xs text-slate-400 mt-1">Tap below to grant camera access and snap your waste packaging.</p>
          </div>
        </div>
        <div class="flex items-center justify-center gap-3">
          <button id="btn-toggle-camera" class="btn-primary px-6 py-2.5 text-xs font-bold">
            Start Camera
          </button>
          <button id="btn-capture-photo" class="btn-secondary px-6 py-2.5 text-xs font-bold hidden">
            📸 Snap Photo
          </button>
        </div>
      </div>

      <!-- TAB 4: Search by Name -->
      <div id="panel-search" class="tab-panel hidden space-y-3">
        <div class="relative">
          <input 
            type="text" 
            id="waste-search-input" 
            placeholder="Type item name (e.g. 'water bottle', 'chips bag', 'pizza box', 'can')..."
            class="w-full text-sm bg-white border border-slate-300 rounded-2xl px-4 py-3.5 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-sm"
          />
          <div class="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
        <div id="search-results-drawer" class="hidden max-h-60 overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-lg divide-y divide-slate-100"></div>
        <p class="text-[11px] text-slate-500">
          ✓ Based on Bengaluru BBMP 2020 Solid Waste Management Bye-Laws framework.
        </p>
      </div>

      <!-- Bottom Info Bar -->
      <div class="mt-6 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span id="scanner-ai-badge">AI Vision: Google Gemini Model</span>
        <button id="btn-open-key-modal" class="text-emerald-800 font-bold hover:underline flex items-center gap-1">
          <span>🔑</span>
          <span>Configure API Key</span>
        </button>
      </div>

    </div>
  `;

  setupTabSwitching();
  setupKeyModalTrigger();
}

function setupTabSwitching() {
  const tabs = [
    { btn: document.getElementById('tab-quick'), panel: document.getElementById('panel-quick') },
    { btn: document.getElementById('tab-upload'), panel: document.getElementById('panel-upload') },
    { btn: document.getElementById('tab-camera'), panel: document.getElementById('panel-camera') },
    { btn: document.getElementById('tab-search'), panel: document.getElementById('panel-search') }
  ];

  tabs.forEach(tab => {
    if (!tab.btn) return;
    tab.btn.addEventListener('click', () => {
      // Invalidate any active in-flight AI scan requests from older actions
      currentScanSequence++;

      tabs.forEach(t => {
        t.btn.className = 'tab-btn py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-forest-950 transition-all flex items-center justify-center gap-1.5';
        t.panel.classList.add('hidden');
      });
      tab.btn.className = 'tab-btn py-2.5 px-3 rounded-xl text-xs font-bold bg-white text-forest-950 shadow-sm transition-all flex items-center justify-center gap-1.5';
      tab.panel.classList.remove('hidden');

      if (tab.btn.id !== 'tab-camera' && streamActive) {
        stopCamera();
      }

      // Requirement 3: When switching between Quick Pick, Upload Photo, Camera, and Search Guide, clear unrelated results.
      appState.clearSelectedItem("tab_switch");

      // Reset analyze button if it was disabled during a cancelled scan
      const analyzeBtn = document.getElementById('btn-analyze-upload');
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<span>✨</span><span>Analyze Photo with AI</span>';
      }
    });
  });
}

function setupQuickPills() {
  const container = document.getElementById('quick-pills-container');
  if (!container) return;

  container.innerHTML = WASTE_DATABASE.slice(0, 8).map(item => `
    <button 
      data-id="${item.id}" 
      class="quick-pill p-3 rounded-2xl bg-white hover:bg-emerald-50 text-left border border-slate-200 hover:border-emerald-300 transition-all shadow-sm flex flex-col justify-between"
    >
      <div class="text-2xl mb-1">${item.emoji}</div>
      <div class="text-xs font-bold text-forest-950 leading-tight">${item.name}</div>
      <div class="text-[10px] text-slate-500 mt-1 truncate">${item.friendlyBinName.split('(')[0]}</div>
    </button>
  `).join('');

  container.querySelectorAll('.quick-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = WASTE_DATABASE.find(i => i.id === id);
      if (item) {
        appState.setSelectedItem(item, 'database_selection', null);
      }
    });
  });
}

function setupSearchInput() {
  const input = document.getElementById('waste-search-input');
  const drawer = document.getElementById('search-results-drawer');
  if (!input || !drawer) return;

  const performSearch = (queryText) => {
    const q = (queryText || '').trim();
    if (!q) {
      drawer.classList.add('hidden');
      drawer.innerHTML = '';
      return;
    }

    const matches = searchWasteDatabase(q);
    if (matches.length === 0) {
      drawer.classList.remove('hidden');
      drawer.innerHTML = `
        <div class="p-4 text-xs">
          <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
            <div class="font-bold flex items-center gap-1.5 mb-1.5 text-xs text-amber-900">
              <span>⚠️</span>
              <span>Uncertain Classification Notice</span>
            </div>
            <p class="text-[11px] text-amber-900 leading-relaxed mb-2.5">
              ${matches.uncertaintyMessage || `No verified waste or packaging items match "${q}".`}
            </p>
            <div class="text-[10px] text-amber-800">
              Try searching for common items: 
              <button type="button" class="font-bold underline cursor-pointer quick-search-suggest text-amber-950 hover:text-emerald-900" data-query="plastic wrapper">plastic wrapper</button>, 
              <button type="button" class="font-bold underline cursor-pointer quick-search-suggest text-amber-950 hover:text-emerald-900" data-query="water bottle">water bottle</button>, 
              <button type="button" class="font-bold underline cursor-pointer quick-search-suggest text-amber-950 hover:text-emerald-900" data-query="juice carton">juice carton</button>, or 
              <button type="button" class="font-bold underline cursor-pointer quick-search-suggest text-amber-950 hover:text-emerald-900" data-query="battery">battery</button>.
            </div>
          </div>
        </div>
      `;

      drawer.querySelectorAll('.quick-search-suggest').forEach(btn => {
        btn.addEventListener('click', (ev) => {
          ev.preventDefault();
          const targetQ = btn.getAttribute('data-query');
          input.value = targetQ;
          performSearch(targetQ);
        });
      });
      return;
    }

    drawer.classList.remove('hidden');
    let html = '';

    if (matches.hasUnrecognizedTerms && matches.uncertaintyMessage) {
      html += `
        <div class="p-3 bg-amber-50/90 border-b border-amber-200 text-amber-950 text-xs flex items-start gap-2">
          <span class="text-sm">⚠️</span>
          <div class="text-[11px] leading-snug">
            <strong>Uncertainty Notice:</strong> ${matches.uncertaintyMessage}
          </div>
        </div>
      `;
    }

    html += matches.map(item => `
      <div 
        data-id="${item.id}" 
        class="search-row p-3 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-xl">${item.emoji}</span>
          <div>
            <div class="font-bold text-forest-950">${item.name}</div>
            <div class="text-[11px] text-slate-500">${item.friendlySummary}</div>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded text-white flex-shrink-0" style="background-color: ${item.binColor};">
          ${item.binLabel.split(' ')[0]}
        </span>
      </div>
    `).join('');

    drawer.innerHTML = html;

    drawer.querySelectorAll('.search-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        const selected = WASTE_DATABASE.find(i => i.id === id);
        if (selected) {
          appState.setSelectedItem(selected, 'search_match', null);
          input.value = selected.name;
          drawer.classList.add('hidden');
        }
      });
    });
  };

  input.addEventListener('input', (e) => {
    performSearch(e.target.value);
  });
}

function setupFileUpload() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const previewWrapper = document.getElementById('upload-preview-wrapper');
  const previewImg = document.getElementById('upload-preview-img');
  const filenameElem = document.getElementById('upload-filename');
  const analyzeBtn = document.getElementById('btn-analyze-upload');
  const statusBanner = document.getElementById('upload-status-banner');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-emerald-600', 'bg-emerald-50/60');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-emerald-600', 'bg-emerald-50/60');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-emerald-600', 'bg-emerald-50/60');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    // Invalidate any in-flight scans from previous actions
    currentScanSequence++;

    // Clear previous results immediately upon loading a new photo
    appState.clearSelectedItem("new_upload");

    if (statusBanner) {
      statusBanner.classList.add('hidden');
      statusBanner.innerHTML = '';
    }
    filenameElem.textContent = file.name;
    activeScanMime = file.type || 'image/jpeg';
    const reader = new FileReader();
    reader.onload = (ev) => {
      activeScanImage = ev.target.result;
      previewImg.src = activeScanImage;
      previewWrapper.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
      // 1. Synchronize image source from activeScanImage or previewImg.src
      let imageToAnalyze = activeScanImage;
      if (!imageToAnalyze && previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
        imageToAnalyze = previewImg.src;
      }

      if (!imageToAnalyze) {
        if (statusBanner) {
          statusBanner.className = 'p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5';
          statusBanner.innerHTML = '<span>⚠️</span><div>Please select or snap a photo first before analyzing.</div>';
          statusBanner.classList.remove('hidden');
        }
        return;
      }

      // Assign a unique scan sequence ID to prevent race conditions from out-of-order asynchronous responses
      const scanId = ++currentScanSequence;

      // 2. Extract exact MIME type from data URL
      const mimeMatch = imageToAnalyze.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : (activeScanMime || 'image/jpeg');

      // 3. Clear banners and set loading state
      if (statusBanner) {
        statusBanner.className = 'p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2';
        statusBanner.innerHTML = '<span class="animate-pulse">🔍</span><span>Sending photo to Google Gemini Vision...</span>';
        statusBanner.classList.remove('hidden');
      }

      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Analyzing with Gemini...
      `;

      // 4. Update Assistant card to show loading skeleton with the photo!
      appState.startAnalysis(imageToAnalyze);

      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageToAnalyze, mimeType: mimeType })
        });
        const resData = await response.json();

        // Discard stale response if user switched tabs, uploaded new photo, or started a newer scan
        if (scanId !== currentScanSequence) {
          console.warn(`[Scanner] Discarding stale scan response #${scanId} (active: #${currentScanSequence})`);
          return;
        }

        if (resData.success && resData.data) {
          const aiData = resData.data;
          const isEwasteTop = Boolean(
            (aiData.category && aiData.category.toLowerCase().includes('electronic')) ||
            aiData.recommended_bin === 'separate_ewaste' ||
            /phone|iphone|smartphone|mobile|laptop|tablet|ipad|computer/i.test(aiData.item_name || '')
          );
          const isWaste = isEwasteTop || Boolean(
            aiData.is_waste !== false &&
            aiData.recommended_bin &&
            aiData.recommended_bin !== 'not_waste' &&
            aiData.recommended_bin !== 'none' &&
            aiData.category !== 'Non-Waste'
          );

          let recBin = null;
          let binLabel = null;
          let friendlyBinName = null;
          let binColor = null;
          let bbmpGuideline = null;
          let isLocalRuleVerified = false;
          let officialSourceCitation = null;
          let simulationProperties = null;

          if (isWaste) {
            recBin = aiData.recommended_bin;
            if (isEwasteTop && (!recBin || recBin === 'not_waste' || recBin === 'none' || recBin === 'hazardous_sanitary')) {
              recBin = 'separate_ewaste';
            }
            binLabel = 'Landfill / RDF Co-Processing';
            friendlyBinName = 'Grey Bin (Landfill / Cement Fuel)';
            binColor = '#64748b';
            bbmpGuideline = 'BBMP SWM Bye-laws require non-recyclable residues and contaminated plastics to be segregated for RDF energy recovery.';
            
            if (recBin === 'dry_recyclables') {
              binLabel = 'Dry Recyclables Bin';
              friendlyBinName = 'Blue Bin (Clean Dry Recycling)';
              binColor = '#2563eb';
              bbmpGuideline = 'Classified under BBMP SWM Bye-Laws 2020 (Schedule-I, Category B: Dry Waste). Must be rinsed and dry before handing to BBMP dry waste collection auto or DWCC.';
            } else if (recBin === 'wet_organics') {
              binLabel = 'Wet / Organic Waste Bin';
              friendlyBinName = 'Green Bin (Compost / Wet)';
              binColor = '#15803d';
              bbmpGuideline = 'Classified under BBMP SWM Bye-Laws 2020 (Schedule-I, Category A: Wet Waste). Segregate daily for municipal composting or biomethanation.';
            } else if (recBin === 'hazardous_sanitary') {
              binLabel = 'Domestic Hazardous & Sanitary Bin';
              friendlyBinName = 'Red Bag (Sanitary & Hazardous)';
              binColor = '#dc2626';
              bbmpGuideline = 'Classified under BBMP SWM Bye-Laws 2020 (Schedule-I, Category C: Domestic Hazardous Waste). Wrap separately and hand over on designated hazardous collection days.';
            } else if (recBin === 'separate_ewaste' || recBin === 'e_waste') {
              binLabel = 'Separate E-Waste Collection';
              friendlyBinName = 'Separate E-Waste Collection';
              binColor = '#7c3aed';
              bbmpGuideline = 'Under the E-Waste (Management) Rules and BBMP SWM guidelines, electronic devices must NOT be disposed of in ordinary Blue, Green, Grey, or Red household bins. Hand over at designated BBMP DWCC e-waste drop-offs or authorized e-waste recycling facilities.';
            }

            if (aiData.bbmp_guideline && !isEwasteTop) {
              bbmpGuideline = aiData.bbmp_guideline;
            }

            isLocalRuleVerified = Boolean(aiData.bbmp_applicable !== false && bbmpGuideline);
            officialSourceCitation = isLocalRuleVerified ? (isEwasteTop ? 'Central E-Waste (Management) Rules & BBMP SWM Bye-Laws 2020' : 'BBMP Solid Waste Management Bye-Laws 2020 (Schedule-I)') : null;

            simulationProperties = {
              conveyorSpeed: 1.0,
              sensorDetection: `AI Vision: ${aiData.item_name} Detected`,
              airJetDivert: isEwasteTop ? 'Diverted to Certified E-Waste Specialized Vault' : `Sorted to ${binLabel} Chute`,
              contaminationWarning: isEwasteTop ? 'Notice: Electronic item detected. Routed to Separate E-Waste Collection.' : ((aiData.visual_contamination && !aiData.visual_contamination.toLowerCase().includes('clean')) ? aiData.visual_contamination : null)
            };
          }

          const itemType = isEwasteTop ? 'household_object' : (aiData.item_type || (isWaste ? (aiData.category && aiData.category.toLowerCase().includes('packaging') ? 'packaging_waste' : 'household_object') : 'non_waste'));
          const likelyMaterials = aiData.likely_materials || aiData.packaging_composition || [];
          const reuseRepairSuggestion = aiData.reuse_repair_suggestion || null;
          const recyclingCertainty = aiData.recycling_certainty || (isWaste ? (itemType === 'household_object' ? 'conditional_or_uncertain' : 'verified_stream') : 'not_applicable');
          const cautiousDisposalNote = aiData.cautious_disposal_note || null;
          const isComposite = Boolean(aiData.is_composite || aiData.is_multi_layer);

          // Handle Unclear / Closer photo request
          const isUnclear = Boolean(aiData.is_unclear || aiData.needs_closer_photo);
          const unclearReason = aiData.unclear_reason || null;

          // Handle Multiple detected items
          const rawDetected = aiData.detected_items || [];
          const hasMultipleItems = rawDetected.length > 1 || Boolean(aiData.has_multiple_items && rawDetected.length > 0);
          const detectedItems = rawDetected.map(d => {
            const dName = (d.item_name || d.name || '').toLowerCase();
            const dCat = (d.category || '').toLowerCase();
            const isEwasteItem = Boolean(
              dCat.includes('electronic') || dCat.includes('e-waste') ||
              dName.includes('phone') || dName.includes('iphone') || dName.includes('smartphone') ||
              dName.includes('mobile') || dName.includes('laptop') || dName.includes('tablet') ||
              dName.includes('ipad') || dName.includes('computer')
            );
            const isSubWaste = isEwasteItem || (d.is_waste !== false && d.item_type !== 'non_waste' && Boolean(d.recommended_bin) && d.recommended_bin !== 'not_waste' && d.recommended_bin !== 'none');
            let dBin = d.recommended_bin;
            if (isEwasteItem && (!dBin || dBin === 'not_waste' || dBin === 'none' || dBin === 'hazardous_sanitary')) {
              dBin = 'separate_ewaste';
            } else if (!dBin && isSubWaste) {
              dBin = 'dry_recyclables';
            }
            let dFriendlyBin = null;
            let dBinLabel = null;
            let dColor = null;

            if (isSubWaste) {
              dFriendlyBin = 'Blue Bin (Clean Dry Recycling)';
              dBinLabel = 'Dry Recyclables Bin';
              dColor = '#2563eb';
              if (dBin === 'wet_organics') {
                dFriendlyBin = 'Green Bin (Wet Waste)';
                dBinLabel = 'Wet / Organic Waste Bin';
                dColor = '#16a34a';
              } else if (dBin === 'hazardous_sanitary') {
                dFriendlyBin = 'Red Bag (Sanitary & Hazardous)';
                dBinLabel = 'Domestic Hazardous & Sanitary Bin';
                dColor = '#dc2626';
              } else if (dBin === 'separate_ewaste' || dBin === 'e_waste') {
                dFriendlyBin = 'Separate E-Waste Collection';
                dBinLabel = 'Separate E-Waste Collection';
                dColor = '#7c3aed';
              } else if (dBin === 'landfill_rdf') {
                dFriendlyBin = 'Grey Bin (Landfill / Cement Fuel)';
                dBinLabel = 'Landfill / RDF Co-Processing';
                dColor = '#64748b';
              }
            }

            let dEmoji = '📦';
            const dLower = (d.item_name || d.name || '').toLowerCase();
            const dCatLower = (d.category || '').toLowerCase();

            if (!isSubWaste) {
              if (dCatLower.includes('person') || dLower.includes('person') || dLower.includes('selfie') || dLower.includes('human') || dLower.includes('face')) {
                dEmoji = '👤';
              } else if (dCatLower.includes('landscape') || dLower.includes('city') || dLower.includes('skyline')) {
                dEmoji = '🏙️';
              } else if (dCatLower.includes('animal') || dLower.includes('pet')) {
                dEmoji = '🐾';
              } else {
                dEmoji = '📷';
              }
            } else {
              if (dLower.includes('phone') || dLower.includes('mobile') || dLower.includes('smartphone') || dLower.includes('cellular')) dEmoji = '📱';
              else if (dLower.includes('laptop') || dLower.includes('computer') || dLower.includes('tablet')) dEmoji = '💻';
              else if (dLower.includes('battery') || dLower.includes('batteries')) dEmoji = '🔋';
              else if (dLower.includes('cable') || dLower.includes('charger') || dLower.includes('wire')) dEmoji = '🔌';
              else if (dLower.includes('bag') || dCatLower.includes('bag')) dEmoji = '🛍️';
              else if (dLower.includes('carton') || dLower.includes('tetra')) dEmoji = '🧃';
              else if (dLower.includes('bottle')) dEmoji = '🥤';
              else if (dLower.includes('can') || dLower.includes('tin')) dEmoji = '🥫';
              else if (dLower.includes('chips') || dLower.includes('sachet') || dLower.includes('snack') || dLower.includes('wrapper')) dEmoji = '🍟';
              else if (dLower.includes('clip') || dLower.includes('claw')) dEmoji = '📎';
              else if (dLower.includes('toothbrush')) dEmoji = '🪥';
              else if (dLower.includes('pen') || dLower.includes('pencil') || dLower.includes('marker')) dEmoji = '🖊️';
              else if (dLower.includes('toy')) dEmoji = '🧸';
              else if (dLower.includes('cup') || dLower.includes('coffee')) dEmoji = '☕';
              else if (dLower.includes('box') || dLower.includes('cardboard')) dEmoji = '📦';
              else if (dLower.includes('apple') || dLower.includes('fruit') || dLower.includes('banana') || dLower.includes('food') || dLower.includes('vegetable')) dEmoji = '🍎';
            }

            return {
              ...d,
              name: d.item_name || d.name,
              item_name: d.item_name || d.name,
              friendlyBinName: dFriendlyBin,
              binLabel: d.bin_label || dBinLabel,
              binColor: dColor,
              emoji: dEmoji,
              isWaste: isSubWaste,
              likely_materials: d.likely_materials || [],
              how_to_prepare: d.how_to_prepare || null,
              bbmp_guideline: d.bbmp_guideline || null,
              reuse_repair_suggestion: d.reuse_repair_suggestion || null,
              cautious_disposal_note: d.cautious_disposal_note || null
            };
          });

          // Choose appropriate emoji
          let itemEmoji = '✨';
          const itemNameLower = (aiData.item_name || '').toLowerCase();
          const categoryLower = (aiData.category || '').toLowerCase();
          if (!isWaste) {
            if (categoryLower.includes('person') || itemNameLower.includes('selfie') || itemNameLower.includes('person') || itemNameLower.includes('human') || itemNameLower.includes('face')) {
              itemEmoji = '👤';
            } else if (categoryLower.includes('landscape') || itemNameLower.includes('skyline') || itemNameLower.includes('city') || itemNameLower.includes('building')) {
              itemEmoji = '🏙️';
            } else if (categoryLower.includes('animal') || itemNameLower.includes('pet') || itemNameLower.includes('dog') || itemNameLower.includes('cat')) {
              itemEmoji = '🐾';
            } else {
              itemEmoji = '📷';
            }
          } else {
            if (itemNameLower.includes('phone') || itemNameLower.includes('mobile') || itemNameLower.includes('smartphone')) {
              itemEmoji = '📱';
            } else if (itemNameLower.includes('laptop') || itemNameLower.includes('computer') || itemNameLower.includes('tablet')) {
              itemEmoji = '💻';
            } else if (itemNameLower.includes('battery') || itemNameLower.includes('batteries')) {
              itemEmoji = '🔋';
            } else if (itemNameLower.includes('bag') || categoryLower.includes('bag')) {
              itemEmoji = '🛍️';
            } else if (itemNameLower.includes('carton') || itemNameLower.includes('tetra')) {
              itemEmoji = '🧃';
            } else if (itemNameLower.includes('clip') || itemNameLower.includes('claw')) {
              itemEmoji = '📎';
            } else if (itemNameLower.includes('toothbrush') || itemNameLower.includes('brush')) {
              itemEmoji = '🪥';
            } else if (itemNameLower.includes('pen') || itemNameLower.includes('pencil') || itemNameLower.includes('marker')) {
              itemEmoji = '🖊️';
            } else if (itemNameLower.includes('toy') || itemNameLower.includes('car') || itemNameLower.includes('doll')) {
              itemEmoji = '🧸';
            } else if (categoryLower.includes('plastic') || itemNameLower.includes('bottle')) {
              itemEmoji = '🥤';
            } else if (categoryLower.includes('metal') || itemNameLower.includes('can')) {
              itemEmoji = '🥫';
            } else if (categoryLower.includes('paper') || itemNameLower.includes('box')) {
              itemEmoji = '📦';
            } else if (categoryLower.includes('snack') || itemNameLower.includes('chips') || itemNameLower.includes('wrapper') || itemNameLower.includes('sachet')) {
              itemEmoji = '🍟';
            } else if (categoryLower.includes('organic') || categoryLower.includes('food') || itemNameLower.includes('fruit')) {
              itemEmoji = '🍎';
            } else {
              itemEmoji = itemType === 'household_object' ? '🏠' : '📦';
            }
          }

          const matchedItem = {
            id: 'ai_' + Date.now(),
            isWaste: isWaste,
            itemType: itemType,
            emoji: itemEmoji,
            name: aiData.item_name || (isWaste ? 'Identified Waste Item' : 'Non-Waste Subject'),
            friendlySummary: aiData.friendly_summary || (isWaste ? 'Identified via real-time Google Gemini Vision.' : 'This image does not appear to be waste or recyclable packaging.'),
            category: aiData.category || (isWaste ? (itemType === 'household_object' ? 'Household Object' : 'Packaging Waste') : 'Non-Waste'),
            friendlyBinName: friendlyBinName,
            binLabel: binLabel,
            binColor: binColor,
            recommendedBin: recBin,
            howToPrepare: isWaste ? (aiData.how_to_prepare || 'Keep clean and dry, and place into the assigned dry waste stream.') : null,
            likelyMaterials: likelyMaterials,
            estimatedComposition: likelyMaterials,
            compositionNote: isWaste ? `Visual analysis by ${resData.source || 'Google Gemini'}. Estimated manufacturing materials.` : null,
            reuseRepairSuggestion: reuseRepairSuggestion,
            recyclingCertainty: recyclingCertainty,
            cautiousDisposalNote: cautiousDisposalNote,
            isComposite: isComposite,
            visualContaminationRisk: isWaste ? (aiData.visual_contamination || 'Visual surface assessment completed.') : null,
            recyclabilityStatus: isWaste ? (aiData.recyclability_assessment || (recyclingCertainty === 'conditional_or_uncertain' ? 'Conditional / Secondary Sorting Needed' : 'Standard Recycling Stream')) : null,
            difficultyLevel: isWaste ? (aiData.difficulty_level || (isComposite ? 'Complex / Mixed Materials' : 'Standard Stream')) : null,
            bbmpGuideline: bbmpGuideline,
            officialSourceCitation: officialSourceCitation,
            isLocalRuleVerified: isLocalRuleVerified,
            sustainableAlternative: isWaste ? (reuseRepairSuggestion || aiData.sustainable_alternative) : null,
            simulationProperties: simulationProperties,
            isUnclear: isUnclear,
            unclearReason: unclearReason,
            hasMultipleItems: hasMultipleItems,
            detectedItems: detectedItems
          };

          // Update state with newly identified item AND the photograph!
          appState.setSelectedItem(matchedItem, 'ai_vision', imageToAnalyze);

          if (statusBanner) {
            if (isUnclear) {
              statusBanner.className = 'p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-xs flex items-center gap-2';
              statusBanner.innerHTML = `<span>📸</span><span>Closer photo needed: <strong>${unclearReason || 'Item is too distant or blurry'}</strong></span>`;
            } else if (hasMultipleItems) {
              statusBanner.className = 'p-3 rounded-2xl bg-indigo-100 border border-indigo-300 text-indigo-950 text-xs flex items-center gap-2';
              statusBanner.innerHTML = `<span>🔎</span><span>Multiple items detected (${detectedItems.length}). Choose which to inspect!</span>`;
            } else if (!isWaste) {
              statusBanner.className = 'p-3 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 text-xs flex items-center gap-2';
              statusBanner.innerHTML = `<span>ℹ️</span><span>Subject identified: <strong>${matchedItem.name}</strong> (Non-waste item)</span>`;
            } else if (itemType === 'household_object') {
              statusBanner.className = 'p-3 rounded-2xl bg-purple-100 border border-purple-300 text-purple-950 text-xs flex items-center gap-2';
              statusBanner.innerHTML = `<span>✓</span><span>Household object identified: <strong>${matchedItem.name}</strong></span>`;
            } else {
              statusBanner.className = 'p-3 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2';
              statusBanner.innerHTML = `<span>✓</span><span>Packaging identified: <strong>${matchedItem.name}</strong></span>`;
            }
          }

        } else {
          // Discard stale response
          if (scanId !== currentScanSequence) return;
          // Explicitly notify assistant card of error
          appState.setAnalysisError(resData);
          if (statusBanner) {
            statusBanner.className = 'p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5';
            statusBanner.innerHTML = `<span>⚠️</span><div><strong>AI Analysis Notice:</strong> ${resData.message || resData.error || 'Could not complete scan.'}</div>`;
          }
        }
      } catch (err) {
        if (scanId !== currentScanSequence) return;
        appState.setAnalysisError({
          status: 'NETWORK_ERROR',
          message: 'Could not connect to the local server analysis endpoint.',
          error: err.toString()
        });
        if (statusBanner) {
          statusBanner.className = 'p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-start gap-2.5';
          statusBanner.innerHTML = `<span>❌</span><div><strong>Connection Error:</strong> ${err.message || 'Server request failed.'}</div>`;
        }
      } finally {
        if (scanId === currentScanSequence) {
          analyzeBtn.disabled = false;
          analyzeBtn.innerHTML = '<span>✨</span><span>Analyze Photo with AI</span>';
        }
      }
    });
  }
}

function setupCamera() {
  const toggleBtn = document.getElementById('btn-toggle-camera');
  const captureBtn = document.getElementById('btn-capture-photo');
  const video = document.getElementById('camera-feed');
  const canvas = document.getElementById('camera-canvas');
  const placeholder = document.getElementById('camera-placeholder');

  if (!toggleBtn || !video) return;

  toggleBtn.addEventListener('click', async () => {
    if (streamActive) {
      stopCamera();
    } else {
      try {
        streamActive = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        video.srcObject = streamActive;
        video.classList.remove('hidden');
        placeholder.classList.add('hidden');
        captureBtn.classList.remove('hidden');
        toggleBtn.textContent = 'Stop Camera';
        toggleBtn.classList.replace('btn-primary', 'btn-secondary');
      } catch (err) {
        alert('Camera access could not be initialized. You can still upload photos or use Quick Pick!');
      }
    }
  });

  if (captureBtn && canvas) {
    captureBtn.addEventListener('click', () => {
      // Invalidate any in-flight scans and clear previous item
      currentScanSequence++;
      appState.clearSelectedItem("camera_capture");

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const snapshot = canvas.toDataURL('image/jpeg');

      stopCamera();

      // Switch to upload tab preview
      const uploadTabBtn = document.getElementById('tab-upload');
      if (uploadTabBtn) uploadTabBtn.click();

      const previewWrapper = document.getElementById('upload-preview-wrapper');
      const previewImg = document.getElementById('upload-preview-img');
      const filenameElem = document.getElementById('upload-filename');

      // CRITICAL FIX: Synchronize activeScanImage and activeScanMime
      activeScanImage = snapshot;
      activeScanMime = 'image/jpeg';

      if (previewWrapper && previewImg) {
        previewImg.src = snapshot;
        filenameElem.textContent = 'camera-capture-' + Date.now() + '.jpg';
        previewWrapper.classList.remove('hidden');
      }
    });
  }
}

function stopCamera() {
  const video = document.getElementById('camera-feed');
  const placeholder = document.getElementById('camera-placeholder');
  const toggleBtn = document.getElementById('btn-toggle-camera');
  const captureBtn = document.getElementById('btn-capture-photo');

  if (streamActive) {
    streamActive.getTracks().forEach(track => track.stop());
    streamActive = null;
  }
  if (video) video.classList.add('hidden');
  if (placeholder) placeholder.classList.remove('hidden');
  if (captureBtn) captureBtn.classList.add('hidden');
  if (toggleBtn) {
    toggleBtn.textContent = 'Start Camera';
    toggleBtn.classList.replace('btn-secondary', 'btn-primary');
  }
}

function setupKeyModalTrigger() {
  const btn = document.getElementById('btn-open-key-modal');
  const modal = document.getElementById('key-config-modal');
  if (btn && modal) {
    btn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  }
}
