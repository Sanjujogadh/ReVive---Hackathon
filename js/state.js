/**
 * ReVive — Global Reactive State Bus
 * Connects Scanner -> Recycling Assistant -> Digital Twin -> Analytics Dashboard
 * All simulated metrics are strictly identified and labeled.
 */

class StateBus {
  constructor() {
    this.listeners = {};
    
    // Core Application State
    this.state = {
      // Active item currently under inspection
      currentItem: null,
      itemSource: "initial_demo", // 'database_selection' | 'search_match' | 'camera_capture' | 'file_upload' | 'ai_vision' | 'user_correction'
      itemImagePreview: null, // User uploaded image thumbnail (if any)
      
      // Analysis Loading & Error State
      analysis: {
        isLoading: false,
        imagePreview: null,
        error: null // null or { status, message, error }
      },

      // Digital Twin State (Simulated)
      twin: {
        isSimulating: false,
        activeItem: null,
        stage: "idle", // 'idle' | 'infeed' | 'optical_sensor' | 'diverting' | 'deposited'
        sensorReadout: "Sensor array ready. Standby for item infeed.",
        contaminationAlert: null,
        targetBinId: null
      },
      
      // Virtual Facility Bins (Simulated Capacities)
      bins: {
        dry_recyclables: {
          id: "dry_recyclables",
          name: "Dry Recyclables",
          fillCount: 18,
          capacity: 40,
          color: "#2563eb",
          bgLight: "#eff6ff",
          borderColor: "#bfdbfe",
          acceptedTypes: "Clean paperboard, PET bottles, HDPE jugs, metals, clean cartons"
        },
        wet_organics: {
          id: "wet_organics",
          name: "Wet / Organics",
          fillCount: 27,
          capacity: 50,
          color: "#15803d",
          bgLight: "#f0fdf4",
          borderColor: "#bbf7d0",
          acceptedTypes: "Kitchen food scraps, unlaminated soiled paper, fruit peels"
        },
        hazardous_sanitary: {
          id: "hazardous_sanitary",
          name: "Domestic Hazardous & Sanitary",
          fillCount: 4,
          capacity: 20,
          color: "#dc2626",
          bgLight: "#fef2f2",
          borderColor: "#fecaca",
          acceptedTypes: "Batteries, toxic e-waste, expired medicines, blister foils"
        },
        landfill_rdf: {
          id: "landfill_rdf",
          name: "Landfill / RDF Co-Processing",
          fillCount: 22,
          capacity: 45,
          color: "#64748b",
          bgLight: "#f8fafc",
          borderColor: "#e2e8f0",
          acceptedTypes: "Multi-layer plastic sachets (MLP), contaminated plastics, non-recyclables"
        },
        separate_ewaste: {
          id: "separate_ewaste",
          name: "Separate E-Waste Collection",
          fillCount: 3,
          capacity: 15,
          color: "#7c3aed",
          bgLight: "#faf5ff",
          borderColor: "#e9d5ff",
          acceptedTypes: "Smartphones, circuit boards, rechargeable lithium electronics, certified take-back items"
        }
      },
      
      // Analytics Dashboard Telemetry (Clearly Labeled as Simulated)
      telemetry: {
        isSimulated: true,
        divertedKgSimulated: 146.4,
        contaminationPreventedCount: 31,
        totalItemsSorted: 71,
        facilityUptimeHours: 18.5,
        recentFacilityLogs: [
          { time: "2m ago", item: "Tetra Pak Beverage Carton", bin: "Dry Recyclables", status: "Clean sort" },
          { time: "7m ago", item: "Potato Chips Snack Sachet", bin: "Landfill / RDF", status: "Multi-layer flagged" },
          { time: "14m ago", item: "Greasy Takeaway Pizza Box", bin: "Wet / Organics", status: "Oil contamination intercepted" }
        ]
      }
    };
  }

  // Subscribe to changes
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  // Notify subscribers
  notify(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // Action: Start AI analysis loading state (clears active item immediately!)
  startAnalysis(imagePreview) {
    this.state.currentItem = null;
    this.state.itemSource = "ai_vision";
    this.state.itemImagePreview = imagePreview;
    this.state.analysis.isLoading = true;
    this.state.analysis.imagePreview = imagePreview;
    this.state.analysis.error = null;
    this.notify("analysisStarted", { imagePreview });
  }

  // Action: Set AI analysis error state (clears active item so previous item is never displayed as the result!)
  setAnalysisError(errorInfo) {
    this.state.currentItem = null;
    this.state.analysis.isLoading = false;
    this.state.analysis.error = errorInfo;
    this.notify("analysisFailed", {
      imagePreview: this.state.analysis.imagePreview,
      errorInfo
    });
  }

  // Action: Clear active item to return to neutral empty state
  clearSelectedItem(reason = "tab_switch") {
    this.state.currentItem = null;
    this.state.itemSource = null;
    this.state.itemImagePreview = null;
    this.state.analysis.isLoading = false;
    this.state.analysis.imagePreview = null;
    this.state.analysis.error = null;
    this.notify("itemCleared", { reason });
  }

  // Action: Clear analysis error
  clearAnalysisError() {
    this.state.analysis.isLoading = false;
    this.state.analysis.error = null;
    this.notify("analysisCleared", {});
  }

  // Action: Select or classify a new item
  setSelectedItem(item, source = "database_selection", imagePreview = null) {
    this.state.currentItem = item;
    this.state.itemSource = source;
    this.state.itemImagePreview = imagePreview;
    this.state.analysis.isLoading = false;
    this.state.analysis.error = null;
    this.notify("itemSelected", { item, source, imagePreview });
  }

  // Action: User manually corrects the identification
  correctItem(correctedItem) {
    this.state.currentItem = correctedItem;
    this.state.itemSource = "user_correction";
    this.state.analysis.isLoading = false;
    this.state.analysis.error = null;
    this.notify("itemCorrected", { item: correctedItem });
  }

  // Action: Dispatch item from Assistant to the 2D Digital Twin
  dispatchItemToFacility(item = null) {
    const targetItem = item || this.state.currentItem;
    if (!targetItem || targetItem.isWaste === false || !targetItem.recommendedBin || !targetItem.simulationProperties) {
      return;
    }

    this.state.twin.isSimulating = true;
    this.state.twin.activeItem = targetItem;
    this.state.twin.stage = "infeed";
    this.state.twin.sensorReadout = `Infeed initiated: ${targetItem.name}. Entering optical scanning chamber.`;
    this.state.twin.contaminationAlert = null;
    this.state.twin.targetBinId = targetItem.recommendedBin;

    this.notify("twinStarted", { item: targetItem });

    // Step 1: Infeed ➔ Optical Sensor Chamber
    setTimeout(() => {
      this.state.twin.stage = "optical_sensor";
      this.state.twin.sensorReadout = targetItem.simulationProperties.sensorDetection;
      
      if (targetItem.simulationProperties.contaminationWarning) {
        this.state.twin.contaminationAlert = targetItem.simulationProperties.contaminationWarning;
      }
      this.notify("twinSensorScanned", { item: targetItem });

      // Step 2: Actuator / Diverter Arm triggers
      setTimeout(() => {
        this.state.twin.stage = "diverting";
        this.state.twin.sensorReadout = targetItem.simulationProperties.airJetDivert;
        this.notify("twinDiverting", { item: targetItem });

        // Step 3: Deposited into bin ➔ update fill levels & dashboard telemetry
        setTimeout(() => {
          this.state.twin.stage = "deposited";
          const binKey = targetItem.recommendedBin;
          if (this.state.bins[binKey]) {
            this.state.bins[binKey].fillCount = Math.min(
              this.state.bins[binKey].fillCount + 1,
              this.state.bins[binKey].capacity
            );
          }

          // Update simulated telemetry
          this.state.telemetry.totalItemsSorted += 1;
          this.state.telemetry.divertedKgSimulated = +(this.state.telemetry.divertedKgSimulated + 0.35).toFixed(1);
          
          if (targetItem.visualContaminationRisk && (targetItem.visualContaminationRisk.toLowerCase().includes("high") || targetItem.visualContaminationRisk.toLowerCase().includes("severe"))) {
            this.state.telemetry.contaminationPreventedCount += 1;
          }

          // Add to recent logs
          const divertStatus = (targetItem.simulationProperties && targetItem.simulationProperties.airJetDivert)
            ? targetItem.simulationProperties.airJetDivert.split("➔")[0].trim()
            : "Air-jet sorted";
          this.state.telemetry.recentFacilityLogs.unshift({
            time: "Just now",
            item: targetItem.name,
            bin: this.state.bins[binKey] ? this.state.bins[binKey].name : "Assigned Bin",
            status: divertStatus
          });
          if (this.state.telemetry.recentFacilityLogs.length > 6) {
            this.state.telemetry.recentFacilityLogs.pop();
          }

          this.state.twin.isSimulating = false;
          this.notify("twinDeposited", {
            item: targetItem,
            bins: this.state.bins,
            telemetry: this.state.telemetry
          });
          this.notify("binsUpdated", this.state.bins);
          this.notify("telemetryUpdated", this.state.telemetry);

          // Simulated Auto-Emptying Schedule: If bin reaches capacity, dispatch municipal truck
          if (this.state.bins[binKey] && this.state.bins[binKey].fillCount >= this.state.bins[binKey].capacity) {
            setTimeout(() => {
              const b = this.state.bins[binKey];
              if (b && b.fillCount >= b.capacity) {
                b.fillCount = Math.max(1, Math.floor(b.capacity * 0.25));
                this.state.telemetry.recentFacilityLogs.unshift({
                  time: "Just now",
                  item: `[AUTO-EMPTY] ${b.name}`,
                  bin: b.name,
                  status: "BBMP Truck Dispatched"
                });
                this.notify("binAutoEmptied", { binId: binKey, bin: b });
                this.notify("binsUpdated", this.state.bins);
                this.notify("telemetryUpdated", this.state.telemetry);
              }
            }, 2500);
          }
        }, 1200);
      }, 1600);
    }, 1000);
  }

  // Action: Manually empty a simulated bin
  emptyBin(binId) {
    if (this.state.bins[binId]) {
      this.state.bins[binId].fillCount = 0;
      this.state.telemetry.recentFacilityLogs.unshift({
        time: "Just now",
        item: `[CLEARED] ${this.state.bins[binId].name}`,
        bin: this.state.bins[binId].name,
        status: "Reset to 0 units"
      });
      this.notify("binAutoEmptied", { binId, bin: this.state.bins[binId] });
      this.notify("binsUpdated", this.state.bins);
      this.notify("telemetryUpdated", this.state.telemetry);
    }
  }

  // Get current state snapshot
  getState() {
    return this.state;
  }
}

export const appState = new StateBus();
