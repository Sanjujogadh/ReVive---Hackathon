/**
 * ReVive — Friendly Community Impact & Telemetry Dashboard
 * CLEARLY LABELED AS SIMULATED TELEMETRY.
 * Everyday English, approachable metrics, and simple packaging science insights.
 */

import { appState } from './state.js';

export function initDashboard() {
  renderDashboard();
  setupDashboardSubscribers();
}

function renderDashboard() {
  const container = document.getElementById('dashboard-container');
  if (!container) return;

  const state = appState.getState();
  const tel = state.telemetry;

  container.innerHTML = `
    <div class="dreamy-card p-6 md:p-8">
      
      <!-- Section Header with SIMULATED Badge -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-8 pb-5 border-b border-slate-200/60">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              [SIMULATED COMMUNITY IMPACT]
            </span>
            <span class="text-xs text-slate-500 font-medium">Ward 150 Virtual Recycling Hub</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-forest-950 font-editorial-serif tracking-tight">
            How Correct Sorting Protects Our City
          </h2>
          <p class="text-xs text-forest-700 mt-0.5">
            Real-time simulated stats showing the environmental difference clean segregation makes.
          </p>
        </div>
        <div class="text-xs text-slate-500">
          Facility Simulation: <span class="font-bold text-forest-900 font-mono">Active</span>
        </div>
      </div>

      <!-- Friendly Impact KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <!-- KPI 1 -->
        <div class="p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-forest-900">Kept Out of Landfill</span>
            <span class="text-xl">⚖️</span>
          </div>
          <div class="text-3xl font-extrabold text-forest-950 font-editorial-serif" id="kpi-diverted-kg">
            ${tel.divertedKgSimulated} <span class="text-sm font-sans font-normal text-slate-500">kg</span>
          </div>
          <p class="text-[11px] text-slate-500 mt-2">
            Clean paper, dry plastics & metals recovered for reuse.
          </p>
        </div>

        <!-- KPI 2 -->
        <div class="p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-forest-900">Contamination Prevented</span>
            <span class="text-xl">🛡️</span>
          </div>
          <div class="text-3xl font-extrabold text-amber-900 font-editorial-serif" id="kpi-contamination-count">
            ${tel.contaminationPreventedCount}
          </div>
          <p class="text-[11px] text-slate-500 mt-2">
            Greasy boxes & hazardous items caught before spoiling clean batches.
          </p>
        </div>

        <!-- KPI 3 -->
        <div class="p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-forest-900">Items Sorted</span>
            <span class="text-xl">🔄</span>
          </div>
          <div class="text-3xl font-extrabold text-blue-900 font-editorial-serif" id="kpi-items-sorted">
            ${tel.totalItemsSorted}
          </div>
          <p class="text-[11px] text-slate-500 mt-2">
            Packaging items routed through simulated sorting lines.
          </p>
        </div>

        <!-- KPI 4 -->
        <div class="p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-forest-900">Ward Collection Schedule [SIMULATED]</span>
            <span class="text-xl">🚛</span>
          </div>
          <div class="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block mb-1">
            Daily Morning Collection (6:30–10:30 AM)
          </div>
          <p class="text-[11px] text-slate-500 mt-1">
            Standard municipal collection window under BBMP SWM Bye-Laws.
          </p>
        </div>

      </div>

      <!-- Packaging Science & Live Sorting Stream -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Left: Why is some packaging so hard to recycle? -->
        <div class="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80">
          <h3 class="text-base font-bold text-forest-950 font-editorial-serif mb-2 flex items-center gap-2">
            <span>🔬</span>
            <span>Why is some packaging so tricky to recycle?</span>
          </h3>
          <p class="text-xs text-forest-800 leading-relaxed mb-4">
            Most ordinary people think all plastic and paper can be recycled together. In reality, modern food packaging often fuses different materials together like a sandwich:
          </p>
          <div class="space-y-3">
            <div class="p-3.5 bg-white/90 rounded-2xl border border-emerald-200/60 text-xs">
              <strong class="text-forest-950 block mb-0.5">1. Silver-Lined Snack Bags (Chips, Biscuits):</strong>
              <span class="text-slate-600">The shiny silver inside isn't separate foil — it's microscopically sprayed onto plastic. Melting it contaminates new plastic, so Bengaluru centers bale them for cement factory energy (RDF) instead.</span>
            </div>
            <div class="p-3.5 bg-white/90 rounded-2xl border border-emerald-200/60 text-xs">
              <strong class="text-forest-950 block mb-0.5">2. Food Grease on Pizza Boxes:</strong>
              <span class="text-slate-600">Recycling paper requires mixing it into a warm water slurry. Food oils never dissolve in water and leave greasy holes in new paper, which is why greasy halves must be composted.</span>
            </div>
            <div class="p-3.5 bg-white/90 rounded-2xl border border-emerald-200/60 text-xs">
              <strong class="text-forest-950 block mb-0.5">3. Paper Coffee Cups:</strong>
              <span class="text-slate-600">They look like simple paper, but an invisible plastic film lines the inside to hold hot chai and coffee. Standard city paper mills cannot dissolve this plastic.</span>
            </div>
          </div>
        </div>

        <!-- Right: Live Activity Feed -->
        <div class="p-6 rounded-3xl bg-white/90 border border-slate-200 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-forest-950 flex items-center gap-2">
                <span>📋</span>
                <span>Live Facility Activity Feed</span>
              </h3>
              <span class="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">SIMULATED FEED</span>
            </div>
            
            <div id="facility-log-feed" class="space-y-2.5 divide-y divide-slate-100">
              <!-- Dynamically populated events -->
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Updates dynamically when you test items</span>
            <span class="text-emerald-800 font-bold">● Stream Connected</span>
          </div>
        </div>

      </div>

    </div>
  `;

  renderTelemetryFeed(tel.recentFacilityLogs);
}

function renderTelemetryFeed(logs) {
  const container = document.getElementById('facility-log-feed');
  if (!container) return;

  container.innerHTML = logs.map(entry => `
    <div class="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        <span class="font-bold text-forest-950">${entry.item}</span>
      </div>
      <div class="flex items-center gap-2 text-[11px]">
        <span class="px-2 py-0.5 rounded-lg bg-slate-100 font-medium text-slate-700">${entry.bin}</span>
        <span class="text-slate-400">${entry.time}</span>
      </div>
    </div>
  `).join('');
}

function setupDashboardSubscribers() {
  appState.subscribe('telemetryUpdated', (telemetry) => {
    const kpiDiverted = document.getElementById('kpi-diverted-kg');
    const kpiContamination = document.getElementById('kpi-contamination-count');
    const kpiItems = document.getElementById('kpi-items-sorted');

    if (kpiDiverted) {
      kpiDiverted.innerHTML = `${telemetry.divertedKgSimulated} <span class="text-sm font-sans font-normal text-slate-500">kg</span>`;
    }
    if (kpiContamination) {
      kpiContamination.textContent = telemetry.contaminationPreventedCount;
    }
    if (kpiItems) {
      kpiItems.textContent = telemetry.totalItemsSorted;
    }

    renderTelemetryFeed(telemetry.recentFacilityLogs);
  });
}
