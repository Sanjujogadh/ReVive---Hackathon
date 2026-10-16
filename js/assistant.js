/**
 * ReVive — Friendly Recycling Assistant & Evidence-Based Guidance Card
 * Everyday English, clear visual guidance, and optional 'Learn More' science section.
 */

import { appState } from './state.js';
import { WASTE_DATABASE, getWasteItemById } from './database.js';

export function initAssistant() {
  const container = document.getElementById('assistant-results-container');
  if (!container) return;

  appState.subscribe('analysisStarted', ({ imagePreview }) => {
    renderLoadingCard(container, imagePreview);
  });

  appState.subscribe('analysisFailed', ({ imagePreview, errorInfo }) => {
    renderUnconfiguredOrErrorCard(container, imagePreview, errorInfo);
  });

  appState.subscribe('itemSelected', ({ item, source, imagePreview }) => {
    renderAssistantCard(container, item, source, imagePreview);
  });

  appState.subscribe('itemCorrected', ({ item }) => {
    renderAssistantCard(container, item, 'user_correction', null);
  });

  appState.subscribe('itemCleared', () => {
    renderEmptyStateCard(container);
  });

  // Requirement 1 & 2: Show neutral empty result state on initial page load
  renderEmptyStateCard(container);
}

/**
 * Loading state with visual spinner and uploaded photo thumbnail
 */
function renderLoadingCard(container, imagePreview) {
  container.innerHTML = `
    <div class="dreamy-card p-6 md:p-8 transition-all duration-300">
      <div class="flex items-center gap-2 mb-4">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
          Inspecting Your Photo with AI Vision...
        </span>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white/70 border border-slate-200/80">
        ${imagePreview ? `
          <div class="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-md flex-shrink-0">
            <img src="${imagePreview}" alt="Your uploaded photo" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
          </div>
        ` : ''}
        <div class="flex-1 space-y-3 text-center sm:text-left">
          <h3 class="text-2xl font-bold text-forest-950 font-editorial-serif">
            Examining Packaging Materials...
          </h3>
          <p class="text-xs text-forest-700 leading-relaxed">
            Connecting securely to Google Gemini Vision to check packaging layers, spot food stains, and find the correct Bengaluru municipal bin.
          </p>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div class="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 h-full w-3/4 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Friendly card when Gemini API key is missing or failed (NEVER stays on old item)
 */
function renderUnconfiguredOrErrorCard(container, imagePreview, errorInfo) {
  const isKeyMissing = errorInfo && errorInfo.status === 'API_KEY_NOT_CONFIGURED';

  container.innerHTML = `
    <div class="dreamy-card p-6 md:p-8 transition-all duration-300 border-2 border-emerald-300">
      
      <!-- Top Notice -->
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            ${isKeyMissing ? '🔑 Real AI Camera Vision Setup' : '⚠️ Analysis Notice'}
          </span>
        </div>
        <span class="text-[11px] text-slate-500 font-medium">Backend Secure Proxy</span>
      </div>

      <!-- Uploaded Image & Explanation -->
      <div class="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 mb-6">
        ${imagePreview ? `
          <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-white">
            <img src="${imagePreview}" alt="Your uploaded photo" class="w-full h-full object-cover" />
          </div>
        ` : ''}
        <div class="flex-1 text-center sm:text-left">
          <h3 class="text-xl font-bold text-forest-950 font-editorial-serif mb-1">
            Photo Received! Ready for AI Recognition
          </h3>
          <p class="text-xs text-forest-800 leading-relaxed">
            ${isKeyMissing ? 
              'To recognize this photo automatically using Gemini Vision, enter your free Gemini API key below. Or, select what it is from our instant guide.' : 
              (errorInfo.message || 'Could not complete visual recognition at this moment.')}
          </p>
        </div>
      </div>

      <!-- Quick Option 1: In-App API Key Activation -->
      ${isKeyMissing ? `
        <div class="p-5 rounded-2xl bg-white/90 border border-emerald-200/80 shadow-sm mb-5">
          <label class="block text-xs font-bold text-forest-950 mb-1.5">
            Option 1: Activate Real AI Recognition (One-Time Setup)
          </label>
          <p class="text-[11px] text-slate-500 mb-3">
            Paste your Google Gemini API key. It is saved safely on your local backend server and never exposed to the browser.
          </p>
          <div class="flex flex-col sm:flex-row gap-2">
            <input 
              type="password" 
              id="input-inline-gemini-key" 
              placeholder="Paste GEMINI_API_KEY (starts with AIzaSy...)" 
              class="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <button 
              id="btn-inline-save-key" 
              class="px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Activate & Scan</span>
            </button>
          </div>
          <div id="inline-key-feedback" class="hidden text-xs mt-2 font-medium"></div>
        </div>
      ` : ''}

      <!-- Quick Option 2: Instant Match from Local Guide -->
      <div class="p-5 rounded-2xl bg-slate-50/90 border border-slate-200">
        <label class="block text-xs font-bold text-forest-950 mb-1">
          Option 2: Tap your packaging item directly
        </label>
        <p class="text-[11px] text-slate-500 mb-3">
          Instant Bengaluru waste segregation guide with zero setup:
        </p>
        <div class="flex flex-wrap gap-2">
          ${WASTE_DATABASE.map(item => `
            <button 
              data-id="${item.id}" 
              class="error-select-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200 shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>${item.emoji}</span>
              <span>${item.name}</span>
            </button>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  // Inline Key Activation Handler
  const keyInput = document.getElementById('input-inline-gemini-key');
  const saveKeyBtn = document.getElementById('btn-inline-save-key');
  const feedback = document.getElementById('inline-key-feedback');

  if (saveKeyBtn && keyInput) {
    saveKeyBtn.addEventListener('click', async () => {
      const keyVal = keyInput.value.trim();
      if (!keyVal) {
        alert('Please paste your Gemini API key');
        return;
      }
      saveKeyBtn.disabled = true;
      saveKeyBtn.innerHTML = 'Verifying with Google...';

      try {
        const res = await fetch('/api/set-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: keyVal })
        });
        const data = await res.json();

        if (data.success) {
          feedback.className = 'text-xs mt-2 text-emerald-800 font-bold block';
          feedback.textContent = '✓ API Key verified! Re-analyzing your photograph now...';
          
          // Re-trigger analysis with the newly configured key!
          setTimeout(() => {
            const analyzeBtn = document.getElementById('btn-analyze-upload');
            if (analyzeBtn) analyzeBtn.click();
          }, 800);
        } else {
          feedback.className = 'text-xs mt-2 text-red-700 font-bold block';
          feedback.textContent = `❌ ${data.error || 'Verification failed.'}`;
          saveKeyBtn.disabled = false;
          saveKeyBtn.innerHTML = 'Activate & Scan';
        }
      } catch (err) {
        feedback.className = 'text-xs mt-2 text-red-700 font-bold block';
        feedback.textContent = '❌ Server connection error.';
        saveKeyBtn.disabled = false;
        saveKeyBtn.innerHTML = 'Activate & Scan';
      }
    });
  }

  // Quick Pick Item Handlers
  container.querySelectorAll('.error-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = getWasteItemById(id);
      if (item) {
        appState.setSelectedItem(item, 'database_selection', imagePreview);
      }
    });
  });
}

/**
 * Neutral empty result state on initial page load, tab switch, or when no item is selected
 */
export function renderEmptyStateCard(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="dreamy-card p-8 sm:p-12 text-center transition-all duration-300">
      <div class="w-16 h-16 mx-auto mb-4 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-3xl shadow-sm">
        🌱
      </div>
      <h3 class="text-2xl font-bold text-forest-950 font-editorial-serif tracking-tight mb-2">
        No Item Selected Yet
      </h3>
      <p class="text-xs text-forest-700 max-w-md mx-auto leading-relaxed mb-6 font-medium">
        No item selected yet. Upload a photo, use your camera, or choose an item to begin.
      </p>
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm">
        <span>👈</span>
        <span>Choose a mode on the left to begin</span>
      </div>
    </div>
  `;
}

/**
 * Item-specific reuse and repurposing guidance
 * Strictly eliminates generic blanket advice and never mentions groceries or gift-wrapping for non-bags.
 */
export function getItemReuseGuidance(item) {
  if (!item) {
    return {
      title: "Reuse Assessment:",
      badge: "Standard Stream",
      badgeColor: "bg-slate-100 text-slate-700",
      icon: "ℹ️",
      text: "No suitable reuse recommendation available.",
      takeaway: "Segregate cleanly into the municipal collection stream."
    };
  }

  const nameLower = (item.name || item.item_name || '').toLowerCase();
  const catLower = (item.category || '').toLowerCase();
  const full = nameLower + ' ' + catLower;

  // 1. Electronic items / Smartphones / iPhones
  const isEwaste = Boolean(
    catLower.includes('electronic') || catLower.includes('e-waste') ||
    item.recommendedBin === 'separate_ewaste' || item.recommendedBin === 'e_waste' ||
    /phone|iphone|smartphone|mobile|cellphone|laptop|tablet|ipad|computer/i.test(full)
  );
  if (isEwaste) {
    return {
      title: "Functioning Device — Use, Repair, Resell, or Donate First:",
      badge: "E-Waste Longevity Protocol",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
      icon: "📱",
      isEwaste: true,
      text: "If this phone or device is still functioning, recommend continued use, battery replacement, screen repair, resale (via authorized buyback platforms like Cashify or Apple Trade-In), or donation before considering disposal.",
      takeaway: "💡 Extending smartphone lifespan by 1–2 years significantly conserves rare minerals and cuts electronic waste."
    };
  }

  // 2. Paper Bags
  if (/paper bag|kraft bag/i.test(full) || (/bag/i.test(nameLower) && /paper/i.test(full))) {
    return {
      title: "Suggest Reuse Before Disposal:",
      badge: "Dry Packaging Protocol",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      icon: "🛍️",
      text: "Reuse for carrying dry goods, groceries, or packaging ONLY when clean, dry, and structurally sound (tear-free with intact handles). Do not reuse if weakened by moisture, oil, or food grease.",
      takeaway: "💡 Reusing clean kraft paper bags multiple times reduces demand for virgin wood pulp."
    };
  }

  // 3. Clear Plastic Water Bottles (PET #1)
  if (/water bottle|pet bottle/i.test(full) || (/plastic bottle/i.test(full) && !/shampoo|detergent/i.test(full))) {
    return {
      title: "Avoid Repeated Drinking-Water Storage:",
      badge: "Health & Recycling Guidance",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
      icon: "🥤",
      text: "Avoid blanket recommendations to reuse disposable single-use PET bottles for drinking water storage. Interior micro-abrasions harbor bacterial biofilm, and single-use PET can leach trace chemical compounds under heat or repeated washing. Switch to a food-grade stainless steel, copper, or glass bottle for daily hydration, and place this bottle in the Blue Bin for recycling.",
      takeaway: "💡 Recycling PET #1 into polyester yarn or rPET flakes is far safer than repeated domestic drinking-water reuse."
    };
  }

  // 4. Beverage Cartons / Tetra Paks
  if (/carton|tetra pak|tetrapak|juice box|milk carton/i.test(full)) {
    return {
      title: "Single-Use Aseptic Packaging — Not For Food Storage:",
      badge: "Composite Fiber Protocol",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
      icon: "🧃",
      text: "Single-use poly-aluminum cartons are not suitable for repeated food or beverage storage once opened, as interior folded seams harbor bacterial growth. Rinse thoroughly with water, unfold the flaps, flatten completely, and deposit into the Blue Bin for specialized hydrapulping fiber recovery.",
      takeaway: "💡 Specialized hydrapulping separates valuable long-fiber virgin paperboard from poly-aluminum linings."
    };
  }

  // 5. Greasy Pizza Boxes / Food-Soiled Cardboard
  if (/pizza box/i.test(full) || (/cardboard/i.test(full) && /greas/i.test(full))) {
    return {
      title: "Compost Soiled Sections — Food Oils Incompatible With Pulping:",
      badge: "Organic Diversion Protocol",
      badgeColor: "bg-green-100 text-green-900 border-green-200",
      icon: "🍕",
      text: "Food-soiled sections cannot be reused or mechanically pulped. Clean upper box lids may be reused for parcel padding or dry storage; greasy lower boxes saturated with cheese oils must be composted in the Green Bin (Wet/Compost).",
      takeaway: "💡 Cooking oils repel water in paper mills, causing oil spots that ruin new recycled paper batches."
    };
  }

  // 6. Clean Cardboard Boxes
  if (/cardboard box|shipping box|amazon box|corrugated box/i.test(full)) {
    return {
      title: "Suggest Reuse Before Disposal:",
      badge: "Packaging Reuse Protocol",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      icon: "📦",
      text: "Reuse sturdy, clean cardboard boxes for household storage, organizing, moving, or parcel shipping before sending to recycling. Remove non-paper tape and keep completely dry.",
      takeaway: "💡 High-grade corrugated cardboard can be recycled up to 5–7 times when kept clean and dry."
    };
  }

  // 7. Single-use items without sensible reuse
  if (
    /chips|sachet|snack|wrapper|crisps/i.test(full) ||
    /aluminum can|soda can|beverage can|tin can/i.test(full) ||
    /coffee cup|chai cup|tea cup|paper cup/i.test(full)
  ) {
    return {
      title: "Reuse Assessment:",
      badge: "Single-Use Stream",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      icon: "ℹ️",
      text: "No suitable reuse recommendation available.",
      takeaway: "💡 Segregate cleanly into the municipal collection stream according to BBMP rules."
    };
  }

  // 8. Custom reuse from database / backend
  if (item.reuseRepairSuggestion && item.reuseRepairSuggestion.trim() && !/before discarding, consider whether/i.test(item.reuseRepairSuggestion) && item.reuseRepairSuggestion !== "No suitable reuse recommendation available.") {
    return {
      title: "Suggest Reuse or Repair First:",
      badge: "Longevity Protocol",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
      icon: "🔄",
      text: item.reuseRepairSuggestion,
      takeaway: "💡 Extending the life of household goods prevents unnecessary landfill or incinerator processing."
    };
  }

  // 9. Strict fallback: Never invent generic advice
  return {
    title: "Reuse Assessment:",
    badge: "Disposal Assessment",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "ℹ️",
    text: "No suitable reuse recommendation available.",
    takeaway: "💡 Follow standard municipal segregation protocols."
  };
}

/**
 * Render the complete friendly recycling guidance card
 */
function renderAssistantCard(container, item, source, imagePreview) {
  if (!item) {
    renderEmptyStateCard(container);
    return;
  }

  // Handle Unclear / Closer photo request card
  if (item.isUnclear) {
    container.innerHTML = `
      <div class="dreamy-card p-6 md:p-8 transition-all duration-300">
        <div class="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
          <div class="flex items-center gap-2">
            <span class="text-xl">📸</span>
            <span class="text-xs uppercase tracking-wider font-bold text-amber-900">Scan Resolution Notice</span>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Closer Photo Requested
          </span>
        </div>

        <div class="flex flex-col sm:flex-row items-start gap-6 mt-6 p-6 rounded-3xl bg-amber-50/80 border border-amber-200/80">
          ${imagePreview ? `
            <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0">
              <img src="${imagePreview}" alt="Uploaded photo" class="w-full h-full object-cover" />
            </div>
          ` : `
            <div class="w-16 h-16 rounded-2xl bg-amber-200 flex items-center justify-center text-3xl flex-shrink-0">
              🔍
            </div>
          `}
          <div class="space-y-3 flex-1">
            <h3 class="text-2xl font-bold text-forest-950 font-editorial-serif tracking-tight">
              Could you take a closer photo of the item?
            </h3>
            <p class="text-xs text-forest-800 leading-relaxed font-medium">
              ${item.unclearReason || "We spotted an object or packaging item, but it's a bit too far away, out of focus, or shadowed to determine its exact materials and municipal sorting category reliably."}
            </p>
            <div class="p-4 rounded-2xl bg-white/80 border border-amber-200 text-xs text-forest-900 space-y-1.5">
              <div class="font-bold flex items-center gap-1.5 text-amber-950">
                <span>💡</span>
                <span>Tips for a fast, accurate scan:</span>
              </div>
              <ul class="list-disc pl-5 space-y-1 text-[11px] text-slate-700">
                <li>Hold the camera <strong>15–30 cm (6–12 inches)</strong> directly in front of the item.</li>
                <li>Make sure recycling resin numbers (e.g. ♳ PET, ♴ HDPE), brand text, or material seams are visible.</li>
                <li>Ensure steady lighting without heavy shadows or glare.</li>
              </ul>
            </div>
            <div class="pt-2 flex items-center gap-3">
              <button id="btn-request-closer-photo" class="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2">
                <span>📷</span>
                <span>Take or Upload a Closer Photo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const closerBtn = document.getElementById('btn-request-closer-photo');
    if (closerBtn) {
      closerBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('input-file-upload');
        if (fileInput) {
          fileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          fileInput.click();
        }
      });
    }
    return;
  }

  const isEwaste = Boolean(
    (item.category && (item.category.toLowerCase().includes('electronic') || item.category.toLowerCase().includes('e-waste'))) ||
    item.recommendedBin === 'separate_ewaste' ||
    item.recommendedBin === 'e_waste' ||
    /phone|iphone|smartphone|mobile|laptop|tablet|ipad|computer/i.test(item.name || '')
  );
  const isWasteItem = (item.isWaste !== false && Boolean(item.recommendedBin)) || isEwaste;
  const isHouseholdObject = isWasteItem && (item.itemType === 'household_object' || isEwaste);

  // Retrieve strictly object-specific reuse guidance (no generic grocery/gift text)
  const reuseInfo = getItemReuseGuidance(item);

  // Determine if item is contamination-sensitive paper/cardboard/packaging
  const isContaminationSensitive = isWasteItem && !isEwaste && Boolean(
    item.contaminationSensitive ||
    item.contamination_sensitive ||
    (
      /paper|cardboard|carton|kraft|box|pizza|takeout/i.test(((item.name || '') + ' ' + (item.category || '')).toLowerCase()) &&
      !/plastic|metal|aluminum|glass|can|bottle/i.test((item.name || '').toLowerCase())
    )
  );

  const currentContamState = item.contaminationState || (
    (item.visualContaminationRisk && (
      item.visualContaminationRisk.toLowerCase().includes('severe') ||
      item.visualContaminationRisk.toLowerCase().includes('greas') ||
      item.visualContaminationRisk.toLowerCase().includes('cheese') ||
      item.visualContaminationRisk.toLowerCase().includes('oil')
    )) ? 'soiled' : 'clean'
  );

  // Friendly source badge
  let sourceBadge = '';
  if (source === 'ai_vision') {
    if (isWasteItem) {
      const isHandHeld = (item.friendlySummary || '').toLowerCase().includes('hand') || (item.name || '').toLowerCase().includes('held');
      sourceBadge = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
        <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
        ${isEwaste ? 'Identified by Gemini Vision • Electronic Waste' : (isHandHeld ? 'Identified by Gemini Vision • Hand-Held Item' : 'Identified by Gemini Vision')}
      </span>`;
    } else {
      sourceBadge = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        <span class="w-2 h-2 rounded-full bg-slate-400"></span>
        AI Non-Waste Identification
      </span>`;
    }
  } else if (source === 'user_correction') {
    sourceBadge = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-200">
      Manually Selected
    </span>`;
  } else if (source === 'search_match') {
    sourceBadge = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200">
      🔍 Search Guide Match
    </span>`;
  } else {
    sourceBadge = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      Bengaluru Waste Segregation Guide
    </span>`;
  }

  // Contamination risk check (only for waste)
  const hasContamination = isWasteItem && item.visualContaminationRisk && (
    item.visualContaminationRisk.toLowerCase().includes('high') || 
    item.visualContaminationRisk.toLowerCase().includes('severe') ||
    item.visualContaminationRisk.toLowerCase().includes('warning') ||
    item.visualContaminationRisk.toLowerCase().includes('residue detected')
  );

  // Check if verified BBMP local rule is applicable
  const hasVerifiedBBMP = isWasteItem && Boolean(item.isLocalRuleVerified && item.bbmpGuideline);

  // Computed bin pill values
  let pillColor = item.binColor || (isEwaste ? '#7c3aed' : '#2563eb');
  let pillIcon = isEwaste ? '⚡' : '📥';
  let pillText = item.friendlyBinName || item.binLabel || (isEwaste ? 'Separate E-Waste Collection' : 'Dry Recyclables');
  if (isContaminationSensitive && currentContamState === 'soiled') {
    pillColor = '#15803d';
    pillIcon = '🌱';
    pillText = 'Green Bin (Compost / Wet)';
  }

  container.innerHTML = `
    <div class="dreamy-card p-6 md:p-8 transition-all duration-300">
      
      <!-- Top Bar: Category & Source -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
        <div class="flex items-center gap-2">
          <span class="text-xl">${item.emoji || (isEwaste ? '📱' : (isWasteItem ? '📦' : '📷'))}</span>
          <span class="text-xs uppercase tracking-wider font-bold text-forest-800">${item.category || (isEwaste ? 'Electronic Waste' : (isWasteItem ? 'Packaging Waste' : 'Non-Waste'))}</span>
        </div>
        ${sourceBadge}
      </div>

      <!-- Main Item Identity & Photo -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5">
        <div class="flex items-center gap-4">
          ${imagePreview ? `
            <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-md flex-shrink-0">
              <img src="${imagePreview}" alt="${item.name}" class="w-full h-full object-cover" />
            </div>
          ` : `
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl shadow-sm">
              ${item.emoji || (isEwaste ? '📱' : (isWasteItem ? '📦' : '📷'))}
            </div>
          `}
          <div>
            <h3 class="text-2xl sm:text-3xl font-bold text-forest-950 font-editorial-serif tracking-tight">
              ${item.name}
            </h3>
            <p class="text-xs text-forest-700 mt-0.5 leading-relaxed">
              ${item.friendlySummary || (isEwaste ? 'If functioning, prioritize repair or resale. If discarded, segregate for Separate E-Waste Collection.' : (isWasteItem ? 'Follow clean segregation protocols.' : 'This image does not appear to be waste or recyclable packaging.'))}
            </p>
          </div>
        </div>

        <!-- Target Bin Pill: ONLY for actual waste items -->
        ${isWasteItem && (item.recommendedBin || isEwaste) ? `
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-sm flex-shrink-0" style="background-color: ${pillColor};" id="target-bin-pill">
            <span>${pillIcon}</span>
            <span>${pillText}</span>
          </div>
        ` : `
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">
            <span>ℹ️</span>
            <span>No Bin Assigned (Not Waste)</span>
          </div>
        `}
      </div>

      <!-- Multi-Item Prompt & Selector (Shown when multiple items are detected in photo or collage) -->
      ${(item.hasMultipleItems && item.detectedItems && item.detectedItems.length > 1) ? `
        <div class="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-emerald-50 border border-indigo-200 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 text-xs font-bold text-forest-950">
              <span class="text-sm">🔎</span>
              <span>Multiple objects detected (${item.detectedItems.length}) — choose an item to inspect:</span>
            </div>
            <span class="text-[10px] bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full font-bold">
              ${item.detectedItems.length} Objects Found
            </span>
          </div>
          <p class="text-[11px] text-forest-700 mb-3">
            Click any detected object below to display its specific Bengaluru municipal bin, materials, and segregation guidance:
          </p>
          <div class="flex flex-wrap gap-2" id="multi-item-button-group">
            ${item.detectedItems.map((sub, idx) => {
              const isSelected = (sub.name === item.name) || (sub.item_name === item.name);
              return `
              <button 
                type="button" 
                class="multi-item-pill px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 border ${isSelected ? 'bg-forest-900 text-white border-forest-950 shadow-md ring-2 ring-emerald-400 scale-[1.02]' : 'bg-white text-forest-900 hover:bg-emerald-50 border-slate-300'}"
                data-multi-idx="${idx}"
              >
                <span class="text-base">${sub.emoji || (sub.isWaste ? '📦' : '👤')}</span>
                <span>${sub.name || sub.item_name}</span>
                <span class="text-[10px] opacity-80 font-normal">(${sub.isWaste ? (sub.friendlyBinName ? sub.friendlyBinName.split('(')[0].trim() : 'Recyclable') : 'Non-Waste'})</span>
                ${isSelected ? '<span class="ml-1 text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>' : ''}
              </button>
            `;}).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Active-Use / Held Item Notice (Strictly Item-Specific: Never generic grocery/gift text) -->
      ${(isWasteItem && (
        (item.friendlySummary || '').toLowerCase().includes('in active use') ||
        (item.friendlySummary || '').toLowerCase().includes('photo with people') ||
        (item.friendlySummary || '').toLowerCase().includes('held in hand') ||
        (item.friendlySummary || '').toLowerCase().includes('held or displayed') ||
        (item.hasMultipleItems && item.detectedItems && item.detectedItems.some(d => (d.category || '').toLowerCase().includes('person') || (d.name || '').toLowerCase().includes('person') || (d.name || '').toLowerCase().includes('selfie')))
      )) ? `
        <div class="mt-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-3 shadow-sm">
          <span class="text-xl">${isEwaste ? '📱' : (/paper bag|kraft bag/i.test(item.name || '') ? '🛍️' : (/bottle/i.test(item.name || '') ? '🥤' : (/carton/i.test(item.name || '') ? '🧃' : '✋')))}</span>
          <div class="text-xs text-amber-950 flex-1">
            <strong class="font-bold block text-sm mb-0.5">Item photographed with person — Still in active use?</strong>
            <p class="leading-relaxed">
              ${isEwaste ? `Since someone is holding or using this <strong>${item.name}</strong>, it appears to be an active personal device! If it is still functioning, recommend continued use, battery/screen repair, resale (via Apple Trade-In, Cashify), or donation before considering e-waste disposal.` :
                (/paper bag|kraft bag/i.test(item.name || '') ? `Since someone is carrying this <strong>${item.name}</strong>, check if it is still serving a useful everyday purpose! If the bag is clean, dry, and structurally sound (tear-free with intact handles), continue reusing it for carrying dry items before recycling.` :
                (/bottle/i.test(item.name || '') ? `Since someone is holding this <strong>${item.name}</strong>, finish your beverage first! Note: avoid reusing single-use disposable PET bottles for repeated long-term drinking-water storage; when finished, empty all liquids, crush flat, and recycle in the Blue Bin.` :
                (/carton/i.test(item.name || '') ? `Since someone is holding this <strong>${item.name}</strong>, it appears to be currently in use. Once finished, do not reuse the carton for repeated food storage; rinse with water, flatten, and deposit in the Blue Bin for fiber recovery.` :
                `Since someone is holding or carrying this <strong>${item.name}</strong>, verify whether it is still serving a useful purpose. If you do intend to discard it, follow the municipal segregation protocol below.`)))}
            </p>
          </div>
        </div>
      ` : ''}

      ${isWasteItem ? (isHouseholdObject ? `
        <!-- Household Object & E-Waste Guidance: Reuse/Repair First + Disposal Reality -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          
          <!-- Card 1: Suggest Reuse or Repair First -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/70 border border-purple-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs font-bold text-purple-950 mb-1.5 uppercase tracking-wider">
                <span>${reuseInfo.icon || '🔄'}</span>
                <span>${reuseInfo.title}</span>
              </div>
              <p class="text-xs text-purple-950 leading-relaxed font-medium">
                ${reuseInfo.text}
              </p>
            </div>
            <div class="mt-3 pt-2 border-t border-purple-200/60 text-[10px] text-purple-800">
              ${reuseInfo.takeaway}
            </div>
          </div>

          <!-- Card 2: Cautious Disposal & Recycling Reality -->
          <div class="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs font-bold text-amber-950 mb-1.5 uppercase tracking-wider">
                <span>⚖️</span>
                <span>${isEwaste ? 'Disposal Protocol — Separate E-Waste Collection:' : 'Cautious Disposal & Recycling Reality:'}</span>
              </div>
              <p class="text-xs text-amber-950 leading-relaxed">
                ${item.cautiousDisposalNote || (isEwaste ? 'Smartphones must NOT be placed in ordinary Blue (Dry), Green (Wet), Grey (Landfill), or Red household bins. Lithium-ion batteries pose severe fire hazards if compacted in garbage trucks, while authorized e-waste recyclers safely recover precious gold, silver, and copper.' : 'Unlike single-use packaging containers with resin codes (#1 PET, #2 HDPE), rigid household plastic items (clips, toothbrushes, pens, toys) are rarely melted down by municipal recyclers. In Bengaluru, hand over to dry waste collection (DWCC) for secondary manual sorting; non-recyclable composite plastics are diverted to RDF (cement kiln fuel).')}
              </p>
            </div>
            <div class="mt-3 pt-2 border-t border-amber-200/60 text-[10px] text-amber-900 font-semibold">
              🔍 ${isEwaste ? 'Authorized Stream: Separate E-Waste Collection / Certified Recycler (Do NOT throw in ordinary bins)' : `Acceptance status: ${item.recyclingCertainty === 'conditional_or_uncertain' ? 'Conditional / Uncertain for mechanical re-melting.' : 'Accepted stream.'}`}
            </div>
          </div>

        </div>

        <!-- Card 3: BBMP Local Municipal Guidance -->
        <div class="mt-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 text-xs font-bold text-emerald-950 mb-1.5 uppercase tracking-wider">
              <span>🏛️</span>
              <span>${isEwaste ? 'Bengaluru E-Waste Guidance (BBMP Framework):' : 'Bengaluru Disposal Guidance (BBMP Framework):'}</span>
            </div>
            <p class="text-xs text-emerald-950 leading-relaxed">
              ${item.bbmpGuideline || (isEwaste ? 'Under the E-Waste (Management) Rules and BBMP SWM guidelines, electronic devices must NOT be disposed of in ordinary Blue, Green, Grey, or Red household bins. Hand over at designated BBMP Dry Waste Collection Centres (DWCCs) with authorized e-waste tie-ups, producer take-back drop-off points, or KSPCB-registered e-waste recycling facilities.' : 'Under BBMP Solid Waste Management Bye-Laws 2020, non-packaging rigid dry items must be given to your local Pourakarmika or neighborhood Dry Waste Collection Centre (DWCC) for secondary manual sorting.')}
            </p>
          </div>
          <div class="mt-3 pt-2 border-t border-emerald-200/60 text-[10px] text-emerald-800/80">
            <strong>Guideline Reference:</strong> ${isEwaste ? 'Central E-Waste (Management) Rules & BBMP Solid Waste Management Bye-Laws 2020' : 'BBMP Solid Waste Management Bye-Laws 2020 (Schedule-I: Dry Waste Stream)'}
          </div>
        </div>

        <!-- Card 4: Likely Materials Breakdown (Curious about the material science?) -->
        ${(item.likelyMaterials && item.likelyMaterials.length > 0) ? `
          <div class="mt-5 pt-4 border-t border-slate-200/60">
            <details class="group cursor-pointer">
              <summary class="flex items-center justify-between text-xs font-bold text-forest-800 hover:text-forest-950 select-none py-1">
                <span class="flex items-center gap-2">
                  <span>🔬</span>
                  <span>Curious about the materials? (Manufacturing Materials & Polymers)</span>
                </span>
                <span class="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              
              <div class="p-4 mt-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Likely Manufacturing Materials:
                  </span>
                  <ul class="space-y-1">
                    ${item.likelyMaterials.map(mat => `
                      <li class="text-xs text-slate-700 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>${mat}</span>
                      </li>
                    `).join('')}
                  </ul>
                  <p class="text-[11px] text-slate-500 mt-2 italic">
                    ${item.compositionNote || 'Standard consumer goods manufacturing estimates.'}
                  </p>
                </div>
                
                ${item.isComposite ? `
                  <div class="pt-2 border-t border-slate-200 text-xs text-slate-700">
                    <span class="font-bold text-forest-900">Composite Structure:</span> Contains bonded or assembled materials (e.g. plastic body with metal spring or rubber grip), which prevents clean mechanical melting without manual disassembly.
                  </div>
                ` : ''}
              </div>
            </details>
          </div>
        ` : ''}
      ` : `
        <!-- Packaging Waste Guidance (Standard Packaging Stream) -->

        <!-- Contamination-Aware Assessment: Paper & Packaging Cleanliness (When relevant) -->
        ${isContaminationSensitive ? `
          <div class="mt-5 p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-sm" id="contamination-assessment-card">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                <span>🔍</span>
                <span>Cleanliness & Contamination Assessment (BBMP Protocol)</span>
              </div>
              <span class="text-[10px] bg-amber-200/90 text-amber-950 px-2.5 py-0.5 rounded-full font-bold">
                User Verification
              </span>
            </div>
            <p class="text-xs text-amber-950 leading-relaxed mb-3">
              Packaging cleanliness cannot always be reliably determined from a photograph. Under Bengaluru BBMP SWM Bye-Laws 2020, <strong>food oils, gravies, and cooking grease cannot be dissolved in water-based paper pulping vats</strong> and will contaminate clean recycling batches. Please confirm the physical condition of this <strong>${item.name}</strong>:
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="contamination-toggle-group">
              <button 
                type="button" 
                class="contamination-state-btn p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${currentContamState !== 'soiled' ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-300' : 'bg-amber-100/40 border-amber-300/70 hover:bg-white'}"
                data-contam-state="clean"
              >
                <span class="text-xl">✨</span>
                <div>
                  <div class="text-xs font-bold text-forest-950 flex items-center gap-1.5">
                    <span>Clean & Dry Packaging</span>
                    ${currentContamState !== 'soiled' ? '<span class="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold uppercase">Active</span>' : ''}
                  </div>
                  <div class="text-[11px] text-forest-800 mt-0.5 leading-snug">
                    Free of food oil, liquids, and grease stains. Safe for municipal dry recycling (Blue Bin).
                  </div>
                </div>
              </button>

              <button 
                type="button" 
                class="contamination-state-btn p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${currentContamState === 'soiled' ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-400' : 'bg-amber-100/40 border-amber-300/70 hover:bg-white'}"
                data-contam-state="soiled"
              >
                <span class="text-xl">⚠️</span>
                <div>
                  <div class="text-xs font-bold text-forest-950 flex items-center gap-1.5">
                    <span>Food-Soiled / Greasy Packaging</span>
                    ${currentContamState === 'soiled' ? '<span class="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold uppercase">Active</span>' : ''}
                  </div>
                  <div class="text-[11px] text-forest-800 mt-0.5 leading-snug">
                    Stained with cooking oil, food grease, or food residue. Diverted to compost (Green Bin) or RDF.
                  </div>
                </div>
              </button>
            </div>

            <div id="contamination-status-explanation" class="mt-3 p-3 rounded-xl bg-white/90 border border-amber-200 text-xs text-amber-950">
              ${currentContamState === 'soiled' ? `
                <div class="flex items-center gap-1.5 font-bold text-emerald-950">
                  <span>🌱</span>
                  <span>Disposal Stream Adjusted: Green Bin (Compost / Wet Waste)</span>
                </div>
                <p class="mt-1 text-[11px] leading-relaxed text-amber-900">
                  Because this item is soiled with food oils or grease, cellulose fibers cannot be dissolved and repulped in water. For plain unlaminated paper bags or cardboard (such as pizza boxes), place soiled portions into the <strong>Green Bin (Wet / Compost)</strong> for decentralized municipal composting, or tear off clean unsoiled flaps for the Blue Bin while composting the oily portions.
                </p>
              ` : `
                <div class="flex items-center gap-1.5 font-bold text-blue-950">
                  <span>📥</span>
                  <span>Disposal Stream: Blue Bin (Clean Dry Recycling)</span>
                </div>
                <p class="mt-1 text-[11px] leading-relaxed text-amber-900">
                  Confirmed clean and dry. Flatten to conserve collection volume and place into the <strong>Blue Bin</strong> for BBMP Dry Waste Collection Centres (DWCCs) to send to paper pulping mills.
                </p>
              `}
            </div>
          </div>
        ` : ''}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          
          <!-- Card 1: Item-Specific Reuse or Longevity Advice -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/70 border border-purple-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs font-bold text-purple-950 mb-1.5 uppercase tracking-wider">
                <span>${reuseInfo.icon || '🔄'}</span>
                <span>${reuseInfo.title}</span>
              </div>
              <p class="text-xs text-purple-950 leading-relaxed font-medium">
                ${reuseInfo.text}
              </p>
            </div>
            <div class="mt-3 pt-2 border-t border-purple-200/60 text-[10px] text-purple-800">
              ${reuseInfo.takeaway}
            </div>
          </div>

          <!-- Card 2: How to Prepare for Disposal -->
          <div class="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs font-bold text-forest-900 mb-1.5 uppercase tracking-wider">
                <span>✨</span>
                <span>How to Prepare This Item:</span>
              </div>
              <p class="text-xs text-forest-800 leading-relaxed">
                ${currentContamState === 'soiled' ? 'Tear off heavily soiled or greasy sections and segregate to the Green Bin (Wet/Compost) for composting. Recycle only clean, dry portions in the Blue Bin.' : (item.howToPrepare || 'Empty any food or liquid residue, keep clean and dry, and place into the designated bin.')}
              </p>
            </div>

            ${hasContamination ? `
              <div class="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <span class="text-sm">⚠️</span>
                <div>
                  <strong>Contamination Alert:</strong> ${item.visualContaminationRisk}
                </div>
              </div>
            ` : ''}
          </div>

        </div>

        <!-- Card 3: Verified Bengaluru BBMP Rule (Only when applicable and verified) -->
        <div class="mt-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 text-xs font-bold text-emerald-950 mb-1.5 uppercase tracking-wider">
              <span>🏛️</span>
              <span>Bengaluru Disposal Guidance (BBMP Framework):</span>
            </div>
            <p class="text-xs text-emerald-950 leading-relaxed">
              ${currentContamState === 'soiled' ? 'BBMP SWM Bye-Laws 2020 strictly prohibit oil-soaked or food-contaminated paper in the dry recyclables stream. Clean cardboard goes to dry waste; oil-soaked portions go to wet waste for decentralized composting.' : (item.bbmpGuideline || 'Under BBMP Solid Waste Management Bye-Laws 2020 (Schedule-I, Category B: Dry Waste), clean and dry paper packaging must be segregated into the Blue Bin for collection by DWCCs.')}
            </p>
          </div>
          ${item.officialSourceCitation ? `
            <div class="mt-3 pt-2 border-t border-emerald-200/60 text-[10px] text-emerald-800/80">
              <strong>Guideline Reference:</strong> ${item.officialSourceCitation}
            </div>
          ` : ''}
        </div>

        <!-- Sustainable Packaging Alternative (Only for Waste) -->
        ${item.sustainableAlternative ? `
          <div class="mt-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-200/60 flex items-start gap-3">
            <span class="text-lg">🌱</span>
            <div class="text-xs text-purple-950">
              <strong class="font-bold block mb-0.5">Eco-Friendly Alternative:</strong>
              <span>${item.sustainableAlternative}</span>
            </div>
          </div>
        ` : ''}

        <!-- Collapsible 'Learn More' Technical Science Section (Only for Waste with layers) -->
        ${(item.estimatedComposition && item.estimatedComposition.length > 0) ? `
          <div class="mt-5 pt-4 border-t border-slate-200/60">
            <details class="group cursor-pointer">
              <summary class="flex items-center justify-between text-xs font-bold text-forest-800 hover:text-forest-950 select-none py-1">
                <span class="flex items-center gap-2">
                  <span>🔬</span>
                  <span>Curious about the material science? (Packaging Layers & Polymers)</span>
                </span>
                <span class="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              
              <div class="p-4 mt-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Estimated Packaging Layers (Industry Standard):
                  </span>
                  <ul class="space-y-1">
                    ${item.estimatedComposition.map(layer => `
                      <li class="text-xs text-slate-700 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>${layer}</span>
                      </li>
                    `).join('')}
                  </ul>
                  <p class="text-[11px] text-slate-500 mt-2 italic">
                    ${item.compositionNote || 'Standard commercial packaging estimate.'}
                  </p>
                </div>
                
                ${item.difficultyLevel ? `
                  <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span>Recycling Facility Sorting Difficulty:</span>
                    <span class="font-bold text-forest-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      ${item.difficultyLevel}
                    </span>
                  </div>
                ` : ''}
              </div>
            </details>
          </div>
        ` : ''}
      `) : `
        <!-- Friendly Guidance Card for Non-Waste Images -->
        <div class="mt-6 p-6 rounded-3xl bg-white/80 border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-2xl flex-shrink-0">
            🌿
          </div>
          <div class="space-y-2 flex-1">
            <h4 class="text-base font-bold text-forest-950 font-editorial-serif">
              Not a Waste or Packaging Item
            </h4>
            <p class="text-xs text-forest-800 leading-relaxed">
              Our AI vision model identified this photo as <strong>${item.name}</strong> (${item.category}). Because this is not discardable packaging or waste, no municipal recycling bin or disposal instructions are assigned.
            </p>
            <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium flex items-center gap-2 mt-2">
              <span>💡</span>
              <span><strong>Ready to test packaging or household items?</strong> Snap or upload a photo of a claw clip, toothbrush, pen, broken toy, plastic bottle, or snack packet!</span>
            </div>
          </div>
        </div>
      `}

      <!-- Action Footer -->
      <div class="mt-6 pt-5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-4">
        <!-- Correction / Explore Dropdown -->
        <div class="flex items-center gap-2">
          <label for="assistant-correct-select" class="text-xs font-medium text-slate-600 whitespace-nowrap">
            ${isWasteItem ? 'Different packaging item?' : 'Explore packaging guide:'}
          </label>
          <select id="assistant-correct-select" class="text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700">
            <option value="" disabled selected>Select from verified guide...</option>
            ${WASTE_DATABASE.map(dbItem => `
              <option value="${dbItem.id}" ${dbItem.id === item.id ? 'disabled' : ''}>
                ${dbItem.emoji} ${dbItem.name}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Digital Twin Sorting Button: ONLY for actual waste items -->
        ${isWasteItem && item.simulationProperties ? `
          <button id="btn-dispatch-facility" class="btn-primary px-6 py-3 text-xs font-bold flex items-center gap-2">
            <span>Watch It Get Sorted in Virtual Facility</span>
            <span>➔</span>
          </button>
        ` : ''}
      </div>

    </div>
  `;

  // Attach contamination toggle buttons
  const contamBtns = container.querySelectorAll('.contamination-state-btn');
  contamBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const state = btn.getAttribute('data-contam-state');
      const isSoiled = (state === 'soiled');
      const updatedItem = {
        ...item,
        contaminationState: state,
        recommendedBin: isSoiled ? 'wet_organics' : 'dry_recyclables',
        friendlyBinName: isSoiled ? 'Green Bin (Compost / Wet)' : 'Blue Bin (Clean Dry Recycling)',
        binLabel: isSoiled ? 'Wet / Organic Waste Bin' : 'Dry Recyclables Bin',
        binColor: isSoiled ? '#15803d' : '#2563eb',
        howToPrepare: isSoiled
          ? 'Tear off heavily soiled or greasy sections and segregate to the Green Bin (Wet/Compost) for composting. Recycle only clean, dry portions in the Blue Bin.'
          : 'Keep clean and completely dry, flatten to conserve space, remove non-paper tape, and place into the Blue Bin.',
        bbmpGuideline: isSoiled
          ? 'BBMP SWM Bye-Laws 2020 strictly prohibit oil-soaked or food-contaminated paper in the dry recyclables stream. Clean cardboard goes to dry waste; oil-soaked portions go to wet waste for decentralized composting.'
          : 'Under BBMP Solid Waste Management Bye-Laws 2020 (Schedule-I, Category B: Dry Waste), clean and dry paper packaging must be segregated into the Blue Bin for collection by DWCCs.',
        simulationProperties: isSoiled ? {
          conveyorSpeed: 0.9,
          sensorDetection: 'Optical Moisture & Grease Sensor: Food-Soiled Paperboard Detected',
          airJetDivert: 'Ejected from Paper Line ➔ Diverted to Organic Compost',
          contaminationWarning: 'Alert: Food grease detected. Ejected to protect clean paper pulp vats.'
        } : {
          conveyorSpeed: 1.1,
          sensorDetection: 'Optical Sensor: Clean Recyclable Paper Packaging Detected',
          airJetDivert: 'Sorted to Clean Paper Recycling Chute',
          contaminationWarning: null
        }
      };
      appState.setSelectedItem(updatedItem, source, imagePreview);
    });
  });

  // Attach multi-item pill switchers
  const multiBtns = container.querySelectorAll('.multi-item-pill');
  multiBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-multi-idx'), 10);
      if (!isNaN(idx) && item.detectedItems && item.detectedItems[idx]) {
        const picked = item.detectedItems[idx];
        const pickedLower = ((picked.name || picked.item_name || '') + ' ' + (picked.category || '')).toLowerCase();
        const isPickedEwaste = Boolean(
          pickedLower.includes('phone') || pickedLower.includes('iphone') || pickedLower.includes('smartphone') ||
          pickedLower.includes('mobile') || pickedLower.includes('laptop') || pickedLower.includes('tablet') ||
          pickedLower.includes('ipad') || pickedLower.includes('computer') || pickedLower.includes('electronic') ||
          (picked.category && (picked.category.toLowerCase().includes('electronic') || picked.category.toLowerCase().includes('e-waste'))) ||
          picked.recommended_bin === 'separate_ewaste' || picked.bin === 'separate_ewaste'
        );
        const isPickedPerson = !isPickedEwaste && (
          pickedLower.includes('person') || pickedLower.includes('portrait') || pickedLower.includes('selfie') ||
          pickedLower.includes('human') || pickedLower.includes('face')
        );
        const isPickedWaste = !isPickedPerson && (picked.isWaste !== false && picked.item_type !== 'non_waste' || isPickedEwaste);
        const pickedType = isPickedPerson ? 'non_waste' : (isPickedEwaste ? 'household_object' : (picked.item_type || (pickedLower.includes('packaging') ? 'packaging_waste' : 'household_object')));

        let pPrep = picked.how_to_prepare || picked.howToPrepare;
        let pBbmp = picked.bbmp_guideline || picked.bbmpGuideline;
        const reuseResult = getItemReuseGuidance(picked);
        let pReuse = picked.reuse_repair_suggestion || picked.reuseRepairSuggestion || reuseResult.text;
        let pCaution = picked.cautious_disposal_note || picked.cautiousDisposalNote;
        let pSummary = picked.friendly_summary;

        if (isPickedEwaste) {
          if (!pReuse) {
            pReuse = "If the phone is still functioning, recommend continued use, battery replacement, screen repair, resale (via authorized buyback platforms like Cashify or Apple Trade-In), or donation before considering disposal.";
          }
          if (!pCaution) {
            pCaution = "Smartphones must never be discarded in ordinary municipal dustbins. Volatile lithium batteries pose severe fire hazards if crushed in garbage compactors, while authorized e-waste recyclers safely recover precious gold, silver, and copper.";
          }
          if (!pBbmp) {
            pBbmp = "Under the E-Waste (Management) Rules and BBMP SWM guidelines, electronic devices must NOT be disposed of in ordinary Blue, Green, Grey, or Red household bins. Hand over at designated BBMP Dry Waste Collection Centres (DWCCs) with authorized e-waste tie-ups, producer take-back drop-off points, or KSPCB-registered e-waste recycling facilities.";
          }
          if (!pPrep) {
            pPrep = "Back up personal data, perform a factory reset, and remove SIM/microSD cards. Do not throw into ordinary Blue, Green, Grey, or Red household bins.";
          }
          if (!pSummary) {
            pSummary = `Identified ${picked.name || picked.item_name}. If functioning, prioritize reuse or repair; if discarded, segregate for Separate E-Waste Collection.`;
          }
        }

        const isContamSensitive = Boolean(
          picked.contaminationSensitive || picked.contamination_sensitive || (
            isPickedWaste && !isPickedEwaste &&
            /paper|cardboard|carton|kraft|box|pizza|takeout/i.test(pickedLower) &&
            !/plastic|metal|aluminum|glass|can|bottle/i.test(pickedLower)
          )
        );

        let pMaterials = picked.likely_materials || picked.likelyMaterials || [];
        if (isPickedEwaste && (!pMaterials || pMaterials.length === 0)) {
          pMaterials = [
            "Aluminosilicate Display Glass",
            "Lithium-Ion / Lithium-Polymer Battery Cell",
            "Multilayer PCB (Copper, Gold, Silicon, Solder)",
            "Anodized Aluminum / Titanium / Stainless Steel Enclosure",
            "Rare Earth Elements (Neodymium Magnets in Speaker & Taptic Engine)"
          ];
        }

        const updatedItem = {
          ...item,
          id: 'multi_' + idx + '_' + Date.now(),
          name: picked.name || picked.item_name,
          isWaste: isPickedWaste,
          itemType: pickedType,
          category: isPickedEwaste ? 'Electronic Waste' : (picked.category || (isPickedWaste ? (pickedType === 'household_object' ? 'Household Object' : 'Packaging Waste') : 'Person / Portrait')),
          emoji: picked.emoji || (isPickedEwaste ? '📱' : (isPickedWaste ? '📦' : '👤')),
          friendlySummary: isPickedWaste ? pSummary : 'This subject is a person / portrait, not discardable waste or packaging.',
          recommendedBin: isPickedWaste ? (isPickedEwaste ? 'separate_ewaste' : (picked.recommended_bin || picked.bin || 'dry_recyclables')) : null,
          friendlyBinName: isPickedWaste ? (isPickedEwaste ? 'Separate E-Waste Collection' : (picked.friendlyBinName || 'Blue Bin (Clean Dry Recycling)')) : null,
          binLabel: isPickedWaste ? (isPickedEwaste ? 'Separate E-Waste Collection' : (picked.bin_label || picked.binLabel || 'Dry Recyclables Bin')) : null,
          binColor: isPickedWaste ? (isPickedEwaste ? '#7c3aed' : (picked.binColor || '#2563eb')) : null,
          likelyMaterials: isPickedWaste ? pMaterials : [],
          estimatedComposition: isPickedWaste ? pMaterials : [],
          howToPrepare: isPickedWaste ? pPrep : null,
          bbmpGuideline: isPickedWaste ? pBbmp : null,
          isLocalRuleVerified: isPickedWaste ? Boolean(pBbmp) : false,
          officialSourceCitation: isPickedWaste ? (isPickedEwaste ? 'Central E-Waste (Management) Rules & BBMP SWM Bye-Laws 2020' : 'BBMP Solid Waste Management Bye-Laws 2020 (Schedule-I)') : null,
          reuseRepairSuggestion: isPickedWaste ? pReuse : null,
          cautiousDisposalNote: isPickedWaste ? pCaution : null,
          contaminationSensitive: isContamSensitive,
          contaminationState: 'clean',
          hasMultipleItems: true, // preserve list so user can toggle between items!
          detectedItems: item.detectedItems,
          simulationProperties: isPickedWaste ? {
            conveyorSpeed: 1.0,
            sensorDetection: `AI Vision: ${picked.name || picked.item_name} Detected`,
            airJetDivert: isPickedEwaste ? 'Diverted to Certified E-Waste Specialized Vault' : `Sorted to ${picked.friendlyBinName || 'Dry Waste'} Chute`,
            contaminationWarning: isPickedEwaste ? 'Notice: Electronic item detected. Routed to Separate E-Waste Collection.' : null
          } : null
        };
        appState.setSelectedItem(updatedItem, 'ai_vision', imagePreview);
      }
    });
  });

  // Attach correction dropdown
  const correctSelect = document.getElementById('assistant-correct-select');
  if (correctSelect) {
    correctSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const targetItem = getWasteItemById(selectedId);
      if (targetItem) {
        appState.correctItem(targetItem);
      }
    });
  }

  // Attach "Watch in Facility" button
  const dispatchBtn = document.getElementById('btn-dispatch-facility');
  if (dispatchBtn) {
    dispatchBtn.addEventListener('click', () => {
      const twinSection = document.getElementById('digital-twin-section');
      if (twinSection) {
        twinSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      appState.dispatchItemToFacility(item);
    });
  }
}
