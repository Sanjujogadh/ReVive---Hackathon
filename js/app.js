/**
 * ReVive — Main Application Entry Point
 * Initializes all connected components and coordinates lifecycle.
 */

import { initScanner } from './scanner.js?v=17';
import { initAssistant } from './assistant.js?v=17';
import { initDigitalTwin } from './twin.js?v=17';
import { initDashboard } from './dashboard.js?v=17';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌿 ReVive — Initializing Smart Recycling Assistant...');

  // Initialize connected modules
  initScanner();
  initAssistant();
  initDigitalTwin();
  initDashboard();

  // Check backend server health and Gemini configuration status
  checkBackendHealth();

  // Setup smooth scroll navigation
  setupNavigation();

  // Setup API Key Configuration Modal
  setupModalHandlers();
});

export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      const statusPill = document.getElementById('backend-status-pill');
      const scannerBadge = document.getElementById('scanner-ai-badge');

      if (statusPill) {
        if (data.gemini_api_configured) {
          statusPill.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-emerald-950 font-bold">AI Vision Active • BBMP Guidelines</span>
          `;
          statusPill.className = 'flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-semibold text-emerald-950 shadow-sm';
          
          if (scannerBadge) {
            scannerBadge.innerHTML = `AI Vision: <strong class="text-emerald-800">Google Gemini (Active)</strong>`;
          }
        } else {
          statusPill.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span class="text-amber-950 font-semibold">Bengaluru Segregation Guide</span>
          `;
          statusPill.className = 'flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-950 shadow-sm';

          if (scannerBadge) {
            scannerBadge.innerHTML = `AI Vision: <span class="text-amber-800 font-medium">Setup API Key to Enable</span>`;
          }
        }
      }
    }
  } catch (e) {
    console.log('Running in static mode / offline fallback ready.');
  }
}

function setupModalHandlers() {
  const modal = document.getElementById('key-config-modal');
  const openBtns = [
    document.getElementById('nav-btn-key-setup'),
    document.getElementById('btn-open-key-modal')
  ];
  const closeBtn = document.getElementById('btn-close-modal');
  const cancelBtn = document.getElementById('btn-cancel-modal');
  const saveBtn = document.getElementById('btn-save-modal-key');
  const inputKey = document.getElementById('modal-input-key');
  const feedback = document.getElementById('modal-feedback');

  if (!modal) return;

  openBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        if (feedback) feedback.classList.add('hidden');
        if (inputKey) inputKey.focus();
      });
    }
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    if (feedback) feedback.classList.add('hidden');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (saveBtn && inputKey) {
    saveBtn.addEventListener('click', async () => {
      const keyVal = inputKey.value.trim();
      if (!keyVal) {
        alert('Please enter your Google Gemini API key.');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Verifying with Google...';

      try {
        const res = await fetch('/api/set-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: keyVal })
        });
        const data = await res.json();

        if (data.success) {
          feedback.className = 'text-xs font-semibold p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 block';
          feedback.textContent = '✓ ' + data.message;
          saveBtn.innerHTML = 'Verified & Saved!';
          
          await checkBackendHealth();

          setTimeout(() => {
            closeModal();
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Verify & Save Key';
            inputKey.value = '';
          }, 1500);
        } else {
          feedback.className = 'text-xs font-semibold p-3 rounded-xl bg-red-100 text-red-900 border border-red-300 block';
          feedback.textContent = '❌ ' + (data.error || 'Verification failed. Please check key.');
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Verify & Save Key';
        }
      } catch (err) {
        feedback.className = 'text-xs font-semibold p-3 rounded-xl bg-red-100 text-red-900 border border-red-300 block';
        feedback.textContent = '❌ Server connection error.';
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Verify & Save Key';
      }
    });
  }
}

function setupNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
