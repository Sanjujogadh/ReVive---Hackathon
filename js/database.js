/**
 * ReVive — Verified Waste & Materials Knowledge Base
 * 
 * Sources strictly cited:
 * 1. Bruhat Bengaluru Mahanagara Palike (BBMP) Solid Waste Management Bye-Laws 2020 (Schedule-I)
 * 2. MoEFCC Solid Waste Management Rules 2016 (Rule 4 & Schedule II)
 * 3. Central Pollution Control Board (CPCB) Guidelines on Segregation & Plastic Waste Management
 */

export const BBMP_SOURCES = {
  SWM_BYELAWS_2020: "BBMP Solid Waste Management Bye-Laws 2020, Schedule-I (Classification & Handover Protocols)",
  MOEFCC_2016_RULES: "Ministry of Environment, Forest & Climate Change (MoEFCC) Solid Waste Management Rules 2016 (Rules 4, 15)",
  CPCB_COMPOSTING: "Central Pollution Control Board (CPCB) Guidelines on Composting & Processing of Municipal Solid Waste",
  PWM_RULES_2016: "Plastic Waste Management Rules 2016 (Amended 2018/2021) — Section 9 on Multi-Layered Plastics"
};

export const WASTE_DATABASE = [
  {
    id: "pet_water_bottle",
    emoji: "🥤",
    name: "Clear Plastic Water Bottle",
    alias: ["plastic bottle", "water bottle", "water bottles", "plastic water bottle", "soda bottle", "coke bottle", "pet bottle", "drinking bottle", "mineral water bottle"],
    category: "Rigid Recyclable Plastic (PET #1)",
    friendlySummary: "Widely recycled plastic. Easy to turn into new bottles or fabric when clean and crushed.",
    friendlyBinName: "Blue Bin (Clean Dry Recycling)",
    howToPrepare: "Empty any remaining liquid, crush the bottle flat to save space, and leave the cap screwed on so it doesn't get lost during sorting.",
    estimatedComposition: [
      "Polyethylene Terephthalate (PET #1) bottle body (~90%)",
      "High-Density Polyethylene (HDPE #2) cap (~8%)",
      "BOPP printed label sleeve (~2%)"
    ],
    compositionNote: "Standard commercial bottle. The cap floats while PET sinks in water separation tanks at recycling plants.",
    visualContaminationRisk: "Clean stream if emptied of liquid.",
    recyclabilityStatus: "Highly Recyclable",
    difficultyLevel: "Easy / Standard Stream",
    recommendedBin: "dry_recyclables",
    binLabel: "Dry Recyclables Bin",
    binColor: "#2563eb",
    bbmpGuideline: "High-value dry recyclable under BBMP 2020 Bye-laws. Hand over to your local BBMP dry waste collection auto or neighborhood Dry Waste Collection Centre (DWCC).",
    officialSourceCitation: BBMP_SOURCES.SWM_BYELAWS_2020,
    isLocalRuleVerified: true,
    reuseRepairSuggestion: "Avoid repeated reuse of single-use disposable PET bottles for drinking-water storage. Interior micro-abrasions harbor bacterial biofilm, and single-use PET can leach trace chemicals under heat or repeated washing. Switch to food-grade stainless steel, copper, or glass bottles for daily hydration, and place this bottle in the Blue Bin for recycling.",
    sustainableAlternative: "Carry a refillable stainless steel or copper bottle for daily commutes.",
    simulationProperties: {
      conveyorSpeed: 1.1,
      sensorDetection: "Optical Transmittance: Clear PET Rigid Plastic Detected",
      airJetDivert: "Sorted to Clean Plastic Recycling Bin",
      contaminationWarning: null
    }
  },
  {
    id: "chip_packet_mlp",
    emoji: "🍟",
    name: "Potato Chips / Snack Wrapper",
    alias: ["chips packet", "chips bag", "plastic wrapper", "chips wrapper", "snack wrapper", "snack packet", "plastic packet", "crisps packet", "lays bag", "kurkure wrapper", "biscuit wrapper", "snack pouch", "silver packet", "chips", "crisps", "snack"],
    category: "Multi-Layer Plastic Foil (MLP)",
    friendlySummary: "Tricky mixed packaging with shiny foil bonded inside plastic. Cannot be melted down with normal plastic.",
    friendlyBinName: "Grey / Non-Recyclable (Cement Kiln Fuel)",
    howToPrepare: "Ensure it is empty. Because the foil is glued to the plastic, local centers bundle them for high-heat cement kilns (RDF) instead of melting.",
    estimatedComposition: [
      "Biaxially Oriented Polypropylene (BOPP) outer printed film (~60%)",
      "Vacuum-deposited aluminum vapor barrier layer (~5%)",
      "Low-Density Polyethylene (LDPE) heat-seal layer (~35%)"
    ],
    compositionNote: "Multi-layer laminate. The microscopic aluminum layer cannot be mechanically peeled off by local recyclers.",
    visualContaminationRisk: "Warning: Residual salt and cooking oils on inner surface spoil clean plastic recycling batches.",
    recyclabilityStatus: "Non-Recyclable Mechanically (Energy Recovery / RDF)",
    difficultyLevel: "Complex / Multi-Layer Foil",
    recommendedBin: "landfill_rdf",
    binLabel: "Landfill / RDF Co-Processing",
    binColor: "#64748b",
    bbmpGuideline: "Under BBMP SWM Bye-laws & Plastic Waste Rules, clean multi-layer pouches are baled at DWCCs and sent to cement factories for Refuse-Derived Fuel (RDF).",
    officialSourceCitation: BBMP_SOURCES.PWM_RULES_2016 + " & " + BBMP_SOURCES.SWM_BYELAWS_2020,
    isLocalRuleVerified: true,
    reuseRepairSuggestion: "No suitable reuse recommendation available.",
    sustainableAlternative: "Buy favorite snacks in larger bulk packs or choose brands experimenting with certified recyclable paper/mono-plastic pouches.",
    simulationProperties: {
      conveyorSpeed: 1.0,
      sensorDetection: "NIR Optical: Metallized Multi-Layer Plastic Detected",
      airJetDivert: "Diverted to RDF / Energy Recovery Chute",
      contaminationWarning: "Notice: Multi-layer packaging diverted away from clean plastic line to protect melting batch."
    }
  },
  {
    id: "greasy_pizza_box",
    emoji: "🍕",
    name: "Greasy Takeaway Pizza Box",
    alias: ["pizza box", "pizza boxes", "takeaway pizza box", "takeout box", "cardboard food packaging", "cardboard box greasy", "food stained box", "greasy box", "delivery pizza box"],
    category: "Soiled Cardboard Packaging",
    friendlySummary: "Cardboard with food grease. Oil permanently damages paper recycling, so soiled parts must be separated.",
    friendlyBinName: "Green Bin (Compost / Wet)",
    howToPrepare: "Tear the box in half! Put the clean, dry top lid into your Blue Recycling bin. Put the greasy, cheese-stained bottom into your Green Wet/Compost bin.",
    estimatedComposition: [
      "Unbleached corrugated Kraft paperboard (~98%)",
      "Absorbed cooking oil and melted cheese fats (~2%)"
    ],
    compositionNote: "Paper recycling mixes fibers with water. Food oil repels water, causing grease spots that weaken new recycled cardboard.",
    visualContaminationRisk: "Severe: Cooking grease and residual food fats ruin water-based paper pulping vats.",
    recyclabilityStatus: "Cannot be pulped with clean paper",
    difficultyLevel: "Food Soiled — Compost Bottom Half",
    recommendedBin: "wet_organics",
    binLabel: "Wet / Organic Waste Bin",
    binColor: "#15803d",
    bbmpGuideline: "BBMP strictly prohibits food-stained cardboard in the dry recyclables stream. Clean cardboard goes to dry waste; oil-soaked portions go to wet waste for decentralized composting.",
    officialSourceCitation: BBMP_SOURCES.CPCB_COMPOSTING + " & " + BBMP_SOURCES.SWM_BYELAWS_2020,
    isLocalRuleVerified: true,
    contaminationSensitive: true,
    reuseRepairSuggestion: "Food-soiled sections cannot be reused or mechanically pulped. Clean upper lids may be reused for parcel padding; greasy lower boxes should be composted in the Green Bin.",
    sustainableAlternative: "Ask pizzerias to place a parchment grease-liner beneath the pizza so the outer cardboard box stays 100% clean and dry.",
    simulationProperties: {
      conveyorSpeed: 0.9,
      sensorDetection: "Optical Moisture Sensor: Grease-Soiled Paperboard Detected",
      airJetDivert: "Ejected from Paper Line ➔ Diverted to Organic Compost",
      contaminationWarning: "Alert: Food grease detected. Ejected to protect clean paper pulp vats."
    }
  },
  {
    id: "tetra_pak_carton",
    emoji: "🧃",
    name: "Juice / Milk Drink Carton",
    alias: ["juice carton", "juice cartons", "beverage carton", "beverage cartons", "drink carton", "juice box", "milk carton", "tetra pak", "tetrapak", "soya milk pack", "aseptic carton"],
    category: "Aseptic Composite Drink Carton",
    friendlySummary: "Multi-layer carton made mostly of strong paperboard with micro foil and plastic linings.",
    friendlyBinName: "Blue Bin (Clean Dry Recycling)",
    howToPrepare: "Rinse out any leftover juice or milk, flatten the carton completely, and replace the plastic straw/cap inside.",
    estimatedComposition: [
      "Virgin Wood Paperboard (~75%)",
      "Polyethylene plastic barrier (~20%)",
      "Protective aluminum foil (~5%)"
    ],
    compositionNote: "Specialized mills use giant water blenders (hydrapulpers) to spin the paper fibers away from the foil/plastic layers.",
    visualContaminationRisk: "Moderate: Milk or sweet juice left inside will sour and attract pests if unrinsed.",
    recyclabilityStatus: "Specialized Recyclable (Hydrapulper)",
    difficultyLevel: "Specialized Paper Stream",
    recommendedBin: "dry_recyclables",
    binLabel: "Dry Recyclables Bin",
    binColor: "#2563eb",
    bbmpGuideline: "BBMP classifies rinsed, flattened beverage cartons as Dry Recyclable Waste. Local DWCCs bundle them for specialized paper recyclers who recover the fibers for cardboard and press the foil into roofing tiles.",
    officialSourceCitation: BBMP_SOURCES.SWM_BYELAWS_2020,
    isLocalRuleVerified: true,
    contaminationSensitive: true,
    reuseRepairSuggestion: "Single-use aseptic cartons are not suitable for repeated food or beverage storage once opened, as interior folded seams harbor bacterial growth. Rinse thoroughly, flatten, and deposit into the Blue Bin for specialized hydrapulping fiber recovery.",
    sustainableAlternative: "Choose dairy milk in glass deposit bottles or local fresh milk delivery.",
    simulationProperties: {
      conveyorSpeed: 1.0,
      sensorDetection: "NIR Optical: Liquid Packaging Board Detected",
      airJetDivert: "Sorted to Specialized Composite Paper Line",
      contaminationWarning: null
    }
  },
  {
    id: "takeaway_coffee_cup",
    emoji: "☕",
    name: "Paper Takeaway Coffee Cup",
    alias: ["coffee cup", "paper cup", "chai cup", "tea cup", "hot drink cup", "paper coffee cup"],
    category: "Plastic-Coated Paper Cup",
    friendlySummary: "Looks like plain paper on the outside, but has an invisible plastic coating inside so hot liquids don't leak.",
    friendlyBinName: "Grey / Non-Recyclable Residue",
    howToPrepare: "Empty leftover liquids. Standard city paper mills cannot dissolve the plastic coating, so it goes to general non-recyclable residue.",
    estimatedComposition: [
      "Bleached chemical paperboard (~95%)",
      "Extruded Polyethylene (PE) waterproof plastic lining (~5%)"
    ],
    compositionNote: "The tightly bonded plastic liner clogs standard paper pulping machines unless processed in rare specialized delamination mills.",
    visualContaminationRisk: "Moderate: Residual coffee/tea sugars and dairy proteins.",
    recyclabilityStatus: "Non-Recyclable in Standard Paper Stream",
    difficultyLevel: "Plastic Lined / Non-Standard",
    recommendedBin: "landfill_rdf",
    binLabel: "Landfill / RDF Co-Processing",
    binColor: "#64748b",
    bbmpGuideline: "BBMP guidelines classify single-use paper cups with plastic linings as non-recyclable dry waste residue. Hand over for energy recovery (RDF).",
    officialSourceCitation: BBMP_SOURCES.SWM_BYELAWS_2020,
    isLocalRuleVerified: true,
    contaminationSensitive: true,
    reuseRepairSuggestion: "No suitable reuse recommendation available.",
    sustainableAlternative: "Carry a lightweight reusable travel mug or collapsible silicone cup to your neighborhood cafe.",
    simulationProperties: {
      conveyorSpeed: 1.1,
      sensorDetection: "NIR Optical: Poly-Coated Paper Cup Detected",
      airJetDivert: "Diverted to Non-Recyclable Chute",
      contaminationWarning: "Notice: Hidden plastic liner prevents conventional paper mill pulping."
    }
  },
  {
    id: "aluminum_beverage_can",
    emoji: "🥫",
    name: "Aluminum Soda / Cold Drink Can",
    alias: ["soda can", "coke can", "aluminum can", "beer can", "cold drink can", "can", "cans", "tin can", "tin", "metal can", "beverage can"],
    category: "Non-Ferrous Metal",
    friendlySummary: "The recycling superstar! Aluminum can be melted and remade infinitely without losing quality.",
    friendlyBinName: "Blue Bin (Clean Dry Recycling)",
    howToPrepare: "Rinse lightly and crush flat. Melting a recycled can uses 95% less energy than mining raw bauxite ore.",
    estimatedComposition: [
      "Aluminum Alloy 3104 (Can Body) & 5182 (Lid) (~99%)",
      "Microscopic internal protective coating (~1%)"
    ],
    compositionNote: "100% infinitely recyclable metal. Can be turned back into a new store shelf can in under 60 days.",
    visualContaminationRisk: "Low if rinsed clean of sticky syrup.",
    recyclabilityStatus: "Infinitely Recyclable (Highest Value)",
    difficultyLevel: "Easy / High Value",
    recommendedBin: "dry_recyclables",
    binLabel: "Dry Recyclables Bin",
    binColor: "#2563eb",
    bbmpGuideline: "High-value dry waste under BBMP Bye-laws. Waste pickers and DWCC operators prioritize aluminum for local smelting facilities.",
    officialSourceCitation: BBMP_SOURCES.SWM_BYELAWS_2020,
    isLocalRuleVerified: true,
    reuseRepairSuggestion: "No suitable reuse recommendation available.",
    sustainableAlternative: "Cans already have one of the highest recovery rates; refill stations are the best zero-packaging alternative.",
    simulationProperties: {
      conveyorSpeed: 1.2,
      sensorDetection: "Eddy Current Sensor: High-Purity Aluminum Detected",
      airJetDivert: "High-Speed Magnetic Ejection to Metals Bin",
      contaminationWarning: null
    }
  },
  {
    id: "clean_corrugated_box",
    emoji: "📦",
    name: "Clean Cardboard Shipping Box",
    alias: ["amazon box", "shipping box", "brown box", "carton box", "delivery box", "cardboard box", "corrugated box", "clean box"],
    category: "Clean Corrugated Paperboard",
    friendlySummary: "Clean, dry cardboard from deliveries. Excellent for recycling into new boxes 5 to 7 times.",
    friendlyBinName: "Blue Bin (Clean Dry Recycling)",
    howToPrepare: "Remove plastic packaging tape, flatten the box flat to save collection space, and keep it dry.",
    estimatedComposition: [
      "Recycled and virgin unbleached Kraft paper fibers (~99%)",
      "Starch-based plant adhesive glue (~1%)"
    ],
    compositionNote: "High quality wood pulp fibers that readily repulp in water without chemical harshness.",
    visualContaminationRisk: "Low if dry and clean of kitchen liquids.",
    recyclabilityStatus: "Highly Recyclable",
    difficultyLevel: "Easy / Standard Dry Stream",
    recommendedBin: "dry_recyclables",
    binLabel: "Dry Recyclables Bin",
    binColor: "#2563eb",
    bbmpGuideline: "Valuable dry waste under BBMP 2020 Bye-laws. Flatten and bundle for collection by the BBMP dry waste team or neighborhood DWCC.",
    officialSourceCitation: BBMP_SOURCES.SWM_BYELAWS_2020,
    isLocalRuleVerified: true,
    contaminationSensitive: true,
    reuseRepairSuggestion: "Reuse sturdy, clean cardboard boxes for household storage, organizing, moving, or parcel shipping before sending to recycling.",
    sustainableAlternative: "Reuse sturdy delivery boxes for home storage or gift mailing.",
    simulationProperties: {
      conveyorSpeed: 1.1,
      sensorDetection: "Optical Sensor: Clean Corrugated Fiber Detected",
      airJetDivert: "Sorted to Bulk Cardboard Baling Station",
      contaminationWarning: null
    }
  },
  {
    id: "brown_paper_bag",
    emoji: "🛍️",
    name: "Brown Paper Bag",
    alias: ["paper bag", "kraft bag", "grocery bag", "shopping bag", "brown bag", "takeout paper bag"],
    category: "Paper Packaging",
    friendlySummary: "Recyclable kraft paper packaging. Clean and dry bags are sent for paper pulping; food-soiled portions must be composted.",
    friendlyBinName: "Blue Bin (Clean Dry Recycling)",
    howToPrepare: "Check cleanliness: if clean and dry, flatten for Blue Bin dry recycling. If stained with food oils, cooking grease, or gravies, tear off soiled portions for composting (Green Bin).",
    estimatedComposition: [
      "Unbleached Kraft Paper (Long Cellulose Fibers) (~98%)",
      "Twisted Paper Cord / Handles (~2%)"
    ],
    compositionNote: "Strong cellulose fibers that can be repulped into paper towels and corrugated packaging when free of grease.",
    visualContaminationRisk: "Severe: Cooking grease and oily food stains prevent paper fiber pulping in water.",
    recyclabilityStatus: "Recyclable If Clean & Dry",
    difficultyLevel: "Easy / Standard Dry Stream",
    recommendedBin: "dry_recyclables",
    binLabel: "Dry Recyclables Bin",
    binColor: "#2563eb",
    bbmpGuideline: "Under BBMP Solid Waste Management Bye-Laws 2020 (Schedule-I, Category B: Dry Waste), clean and dry paper bags must be segregated into the Blue Bin. Food-soiled or greasy paper cannot be pulped with water and must be composted (Green Bin) or diverted to RDF.",
    officialSourceCitation: BBMP_SOURCES.SWM_BYELAWS_2020,
    isLocalRuleVerified: true,
    contaminationSensitive: true,
    reuseRepairSuggestion: "Reuse for carrying dry goods, groceries, or packaging ONLY when clean, dry, and structurally sound (tear-free with intact handles). Do not reuse if weakened by moisture, oil, or grease.",
    cautiousDisposalNote: "Paper recycling requires clean cellulose fibers. Food oil and grease permanently ruin paper pulping vats; plain unlaminated soiled paper must be composted in the Green Bin (Wet/Compost) or torn away from clean sections.",
    sustainableAlternative: "Carry a washable cloth tote bag or jute shopping bag for grocery errands.",
    simulationProperties: {
      conveyorSpeed: 1.1,
      sensorDetection: "Optical Sensor: Unbleached Kraft Paper Fiber Detected",
      airJetDivert: "Sorted to Clean Paper Recycling Chute",
      contaminationWarning: null
    }
  },
  {
    id: "fruit_vegetable_peels",
    emoji: "🍌",
    name: "Fruit & Vegetable Kitchen Peels",
    alias: ["banana peel", "vegetable peels", "kitchen scraps", "food waste", "apple core", "fruit scraps", "fruit peel", "peel", "peels"],
    category: "Natural Organic Compostable",
    friendlySummary: "100% natural organic food scraps. Turns into rich soil compost or biogas energy for cooking.",
    friendlyBinName: "Green Bin (Compost / Wet Waste)",
    howToPrepare: "Keep unbagged in your kitchen wet waste bin (no plastic liners allowed). Hand over to daily morning collection.",
    estimatedComposition: [
      "Water content (~80-90%)",
      "Natural plant cellulose and organic nutrients (~10-20%)"
    ],
    compositionNote: "Decomposes cleanly in aerobic composters. If trapped in plastic in landfills, it releases harmful methane gas.",
    visualContaminationRisk: "Moisture hazard if mixed with dry paper; keep strictly segregated in Green Bin.",
    recyclabilityStatus: "100% Compostable / Bio-Methanation",
    difficultyLevel: "Daily Kitchen Composting",
    recommendedBin: "wet_organics",
    binLabel: "Wet / Organic Waste Bin",
    binColor: "#15803d",
    bbmpGuideline: "BBMP mandates 100% daily wet waste segregation. Must be handed over unbagged to BBMP auto tippers every morning between 6:30 AM and 10:30 AM.",
    officialSourceCitation: BBMP_SOURCES.SWM_BYELAWS_2020 + " (Schedule-I, Category A: Wet Waste)",
    isLocalRuleVerified: true,
    sustainableAlternative: "Start a simple balcony compost pot (Kamba) to turn food scraps directly into fertilizer for plants.",
    simulationProperties: {
      conveyorSpeed: 1.0,
      sensorDetection: "Infrared Moisture Sensor: Organic Biodegradable Biomass",
      airJetDivert: "Sorted to City Composting & Biogas Digester",
      contaminationWarning: null
    }
  },
  {
    id: "household_battery",
    emoji: "🔋",
    name: "Household AA / AAA Battery",
    alias: ["battery", "batteries", "aa battery", "aaa battery", "alkaline battery", "remote battery", "cell", "torch battery"],
    category: "Domestic Hazardous Waste",
    friendlySummary: "Contains heavy metals and corrosive chemical paste. Must NEVER be thrown in wet or dry bins.",
    friendlyBinName: "Red / Hazardous Waste (Special Collection)",
    howToPrepare: "Store safely in a small cardboard box. Wrap in newspaper marked with a red cross or drop off at an authorized e-waste collection center.",
    estimatedComposition: [
      "Steel outer casing (~25%)",
      "Zinc anode & Manganese cathode (~50%)",
      "Alkaline potassium hydroxide electrolyte (~25%)"
    ],
    compositionNote: "Heavy metals can leach into city groundwater if sent to general landfills.",
    visualContaminationRisk: "Chemical Hazard: Potential corrosive chemical leakage.",
    recyclabilityStatus: "Hazardous — Requires Specialized Metallurgical Recycling",
    difficultyLevel: "Specialized Hazardous Stream",
    recommendedBin: "hazardous_sanitary",
    binLabel: "Domestic Hazardous & Sanitary Bin",
    binColor: "#dc2626",
    bbmpGuideline: "BBMP SWM Bye-Laws 2020 strictly categorizes batteries under Domestic Hazardous Waste (Category C). Must be handed over separately on designated hazardous collection days.",
    officialSourceCitation: BBMP_SOURCES.SWM_BYELAWS_2020 + " (Schedule-I, Category C: Domestic Hazardous)",
    isLocalRuleVerified: true,
    sustainableAlternative: "Switch to USB-rechargeable or NiMH rechargeable batteries that can be reused hundreds of times.",
    simulationProperties: {
      conveyorSpeed: 0.8,
      sensorDetection: "Inductive Metal & Density: Heavy Metal Chemical Cell Detected",
      airJetDivert: "Emergency Trapdoor Divert to Hazardous Waste Vault",
      contaminationWarning: "Critical: Heavy metal item detected. Safely routed to hazardous containment."
    }
  },
  {
    id: "smartphone_ewaste",
    emoji: "📱",
    name: "Apple iPhone / Smartphone",
    alias: ["iphone", "apple iphone", "smartphone", "smartphones", "mobile phone", "mobile phones", "mobile", "cell phone", "phone", "android", "cellphone", "electronics", "electronic waste"],
    category: "Electronic Waste",
    itemType: "household_object",
    friendlySummary: "High-value electronic device with lithium battery and precious metals. Prioritize reuse or repair first; if discarded, route to Separate E-Waste Collection.",
    friendlyBinName: "Separate E-Waste Collection",
    howToPrepare: "Back up personal data, factory reset the device, and remove SIM/microSD cards. Do not throw into household garbage or ordinary Blue, Green, Grey, or Red bins.",
    estimatedComposition: [
      "Aluminosilicate Display Glass (~25%)",
      "Rechargeable Lithium-Ion Battery (~25%)",
      "Multilayer Printed Circuit Board (Gold, Copper, Silicon) (~20%)",
      "Aluminum / Stainless Steel Enclosure (~25%)",
      "Rare Earth Magnets & Taptic Engine (~5%)"
    ],
    compositionNote: "Contains valuable recoverable materials (gold, copper, silver) and hazardous components that must not be compacted in municipal waste trucks.",
    visualContaminationRisk: "Fire & Chemical Risk: Punctured lithium batteries can ignite spontaneously.",
    recyclabilityStatus: "Specialized E-Waste Dismantling & Refurbishing",
    difficultyLevel: "Specialized E-Waste Stream",
    recommendedBin: "separate_ewaste",
    binLabel: "Separate E-Waste Collection",
    binColor: "#7c3aed",
    bbmpGuideline: "Under the E-Waste (Management) Rules and BBMP SWM guidelines, electronic devices must NOT be mixed with ordinary Blue, Green, Grey, or Red bins. Hand over at designated BBMP Dry Waste Collection Centres (DWCCs) with authorized e-waste tie-ups, KSPCB-registered e-waste recyclers, or manufacturer take-back drop-off points.",
    officialSourceCitation: "Central E-Waste (Management) Rules & BBMP SWM Bye-Laws 2020",
    isLocalRuleVerified: true,
    reuseRepairSuggestion: "If in working order, prioritize continued use, battery replacement, screen repair, resale (via Apple Trade-In, Cashify), or donation before considering disposal.",
    cautiousDisposalNote: "Smartphones must never be discarded in ordinary municipal dustbins. Certified e-waste recyclers recover precious metals safely while preventing toxic lead and battery fires.",
    simulationProperties: {
      conveyorSpeed: 0.9,
      sensorDetection: "Optical & RF Signature: Electronic Device (Smartphone) Detected",
      airJetDivert: "Diverted to Certified E-Waste Specialized Vault",
      contaminationWarning: "Notice: Electronic item detected. Routed to Separate E-Waste Collection."
    }
  }
];

// Recognized packaging and waste terms vocabulary for detecting recognized vs unrecognized concepts
export const WASTE_VOCABULARY = new Set([
  'plastic', 'wrapper', 'wrappers', 'foil', 'mlp', 'chips', 'crisps', 'snack', 'snacks',
  'packet', 'packets', 'pouch', 'pouches', 'sachet', 'sachets', 'bag', 'bags', 'paper',
  'bottle', 'bottles', 'water', 'pet', 'soda', 'coke', 'drink', 'drinks', 'beverage',
  'carton', 'cartons', 'juice', 'milk', 'tetra', 'pak', 'pack', 'tetrapak', 'box', 'boxes',
  'phone', 'phones', 'mobile', 'cellphone', 'cell', 'smartphone', 'smartphones', 'iphone',
  'electronics', 'electronic', 'ewaste', 'device', 'gadget', 'computer', 'laptop', 'tablet',
  'pizza', 'greasy', 'cardboard', 'kraft', 'corrugated', 'takeaway', 'takeout', 'food',
  'can', 'cans', 'tin', 'tins', 'aluminum', 'metal', 'aluminium', 'cup', 'cups', 'coffee',
  'tea', 'chai', 'peel', 'peels', 'banana', 'vegetable', 'fruit', 'scraps', 'compost',
  'organic', 'wet', 'dry', 'waste', 'battery', 'batteries', 'aa', 'aaa', 'alkaline',
  'hazardous', 'chemical', 'sanitary', 'packaging', 'container', 'clean', 'soiled',
  'shipping', 'amazon', 'delivery', 'biscuit', 'lays', 'kurkure', 'glass'
]);

export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'in', 'on', 'for', 'with', 'and', 'or', 'to', 'from', 'at',
  'by', 'my', 'is', 'it', 'this', 'that', 'item', 'items', 'waste', 'disposal', 'recycle'
]);

export const SYNONYMS = {
  'wrapper': ['wrapper', 'packet', 'sachet', 'pouch', 'foil', 'mlp', 'chips', 'packaging'],
  'wrappers': ['wrapper', 'packet', 'sachet', 'pouch', 'foil', 'mlp', 'chips', 'packaging'],
  'packet': ['packet', 'wrapper', 'sachet', 'pouch', 'bag', 'chips'],
  'packets': ['packet', 'wrapper', 'sachet', 'pouch', 'bag', 'chips'],
  'chips': ['chips', 'potato', 'snack', 'wrapper', 'packet', 'crisps'],
  'crisps': ['chips', 'potato', 'snack', 'wrapper', 'packet'],
  'snack': ['snack', 'chips', 'wrapper', 'packet', 'biscuit'],
  'bottle': ['bottle', 'water', 'pet', 'plastic', 'drink'],
  'bottles': ['bottle', 'water', 'pet', 'plastic', 'drink'],
  'carton': ['carton', 'juice', 'milk', 'tetra', 'pak', 'drink', 'box'],
  'cartons': ['carton', 'juice', 'milk', 'tetra', 'pak', 'drink', 'box'],
  'tetrapak': ['tetra', 'pak', 'carton', 'juice', 'milk'],
  'phone': ['phone', 'iphone', 'smartphone', 'mobile', 'electronic'],
  'phones': ['phone', 'iphone', 'smartphone', 'mobile', 'electronic'],
  'mobile': ['mobile', 'phone', 'smartphone', 'iphone', 'electronic'],
  'cellphone': ['phone', 'mobile', 'smartphone', 'cell'],
  'smartphone': ['smartphone', 'phone', 'mobile', 'iphone'],
  'smartphones': ['smartphone', 'phone', 'mobile', 'iphone'],
  'pizza': ['pizza', 'box', 'cardboard', 'takeaway', 'takeout', 'greasy'],
  'box': ['box', 'carton', 'cardboard', 'shipping', 'pizza'],
  'boxes': ['box', 'carton', 'cardboard', 'shipping', 'pizza'],
  'cardboard': ['cardboard', 'box', 'shipping', 'pizza', 'kraft', 'paper'],
  'can': ['can', 'tin', 'aluminum', 'beverage', 'soda'],
  'cans': ['can', 'tin', 'aluminum', 'beverage', 'soda'],
  'battery': ['battery', 'cell', 'alkaline', 'aa', 'aaa', 'hazardous'],
  'batteries': ['battery', 'cell', 'alkaline', 'aa', 'aaa', 'hazardous'],
  'bag': ['bag', 'paper', 'kraft', 'grocery'],
  'bags': ['bag', 'paper', 'kraft', 'grocery'],
  'peel': ['peel', 'peels', 'banana', 'vegetable', 'fruit', 'food', 'compost'],
  'peels': ['peel', 'peels', 'banana', 'vegetable', 'fruit', 'food', 'compost'],
  'cup': ['cup', 'coffee', 'chai', 'tea', 'paper'],
  'cups': ['cup', 'coffee', 'chai', 'tea', 'paper'],
  'plastic': ['plastic', 'pet', 'bottle', 'wrapper', 'packet', 'mlp', 'foil', 'packaging']
};

export function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getWordRoot(word) {
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && word.length > 3) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) return word.slice(0, -1);
  return word;
}

export function searchWasteDatabase(query) {
  if (!query || typeof query !== "string") return WASTE_DATABASE;
  
  const rawClean = normalizeText(query);
  if (!rawClean) return WASTE_DATABASE;

  const rawTokens = rawClean.split(' ').filter(Boolean);
  const contentTokens = rawTokens.filter(t => !STOP_WORDS.has(t));
  const searchTokens = contentTokens.length > 0 ? contentTokens : rawTokens;

  // Identify recognized vs unrecognized terms
  const unrecognizedTerms = [];
  const recognizedTerms = [];

  for (const token of searchTokens) {
    const root = getWordRoot(token);
    if (WASTE_VOCABULARY.has(token) || WASTE_VOCABULARY.has(root) || SYNONYMS[token] || SYNONYMS[root]) {
      recognizedTerms.push(token);
    } else {
      unrecognizedTerms.push(token);
    }
  }

  // If query is completely composed of unrecognized / nonsense terms, return 0 matches with uncertainty flag
  if (recognizedTerms.length === 0) {
    const emptyMatches = [];
    emptyMatches.hasUnrecognizedTerms = true;
    emptyMatches.unrecognizedTerms = unrecognizedTerms;
    emptyMatches.uncertaintyMessage = `No recognized waste or packaging items match "${query}". Try searching for common items like 'plastic wrapper', 'water bottle', 'juice carton', or 'battery'.`;
    return emptyMatches;
  }

  // Expand tokens with synonyms and roots
  const tokenExpansions = recognizedTerms.map(token => {
    const root = getWordRoot(token);
    const syns = new Set([token, root]);
    if (SYNONYMS[token]) SYNONYMS[token].forEach(s => syns.add(s));
    if (SYNONYMS[root]) SYNONYMS[root].forEach(s => syns.add(s));
    return Array.from(syns);
  });

  const scoredItems = [];

  for (const item of WASTE_DATABASE) {
    const nameNorm = normalizeText(item.name);
    const catNorm = normalizeText(item.category);
    const summaryNorm = normalizeText(item.friendlySummary);
    const aliasesNorm = (item.alias || []).map(a => normalizeText(a));

    let score = 0;

    // 1. Exact match on raw clean query
    if (nameNorm === rawClean) {
      score += 250;
    } else if (aliasesNorm.includes(rawClean)) {
      score += 220;
    }

    // 2. Exact match on recognized terms joined
    const recClean = recognizedTerms.join(' ');
    if (recClean !== rawClean) {
      if (nameNorm === recClean) score += 180;
      else if (aliasesNorm.includes(recClean)) score += 160;
    }

    // 3. Substring match
    if (nameNorm.includes(rawClean)) {
      score += 120;
    } else if (aliasesNorm.some(a => a.includes(rawClean))) {
      score += 100;
    } else if (recClean && (nameNorm.includes(recClean) || aliasesNorm.some(a => a.includes(recClean)))) {
      score += 90;
    }

    // 4. Token-by-token scoring across fields
    let matchedTokenCount = 0;
    for (const tokenGroup of tokenExpansions) {
      let groupMatched = false;
      for (const t of tokenGroup) {
        if (nameNorm.split(' ').includes(t)) {
          score += 45;
          groupMatched = true;
          break;
        } else if (aliasesNorm.some(a => a.split(' ').includes(t))) {
          score += 35;
          groupMatched = true;
          break;
        } else if (nameNorm.includes(t)) {
          score += 25;
          groupMatched = true;
          break;
        } else if (aliasesNorm.some(a => a.includes(t))) {
          score += 20;
          groupMatched = true;
          break;
        } else if (catNorm.includes(t)) {
          score += 15;
          groupMatched = true;
          break;
        } else if (summaryNorm.includes(t)) {
          score += 8;
          groupMatched = true;
          break;
        }
      }
      if (groupMatched) matchedTokenCount++;
    }

    // Bonus if ALL recognized tokens matched
    if (matchedTokenCount === tokenExpansions.length && tokenExpansions.length > 0) {
      score += 80;
    }

    // Filter weak matches
    if (score > 25) {
      scoredItems.push({ item, score });
    }
  }

  // Rank by relevance score descending
  scoredItems.sort((a, b) => b.score - a.score);

  const results = scoredItems.map(si => si.item);

  // Attach uncertainty metadata when query contained unrecognized terms (e.g. "unicorn plastic wrapper")
  if (unrecognizedTerms.length > 0) {
    results.hasUnrecognizedTerms = true;
    results.unrecognizedTerms = unrecognizedTerms;
    results.recognizedTerms = recognizedTerms;
    results.suggestedQuery = recognizedTerms.join(' ');
    results.uncertaintyMessage = `Notice: "${unrecognizedTerms.join(', ')}" is not a recognized packaging material. Showing closest suggestions for "${recognizedTerms.join(' ')}":`;
  }

  return results;
}

export function getWasteItemById(id) {
  return WASTE_DATABASE.find(item => item.id === id) || null;
}
