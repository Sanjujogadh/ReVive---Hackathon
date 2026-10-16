#!/usr/bin/env python3
"""
ReVive — Give Waste a Second Life
Local development server with static file serving, verified SSL HTTPS proxy,
and secure Gemini Vision API integration.
Zero external pip dependencies required.
"""

import http.server
import socketserver
import os
import json
import urllib.request
import urllib.error
import ssl
import subprocess
import sys
import socket

PORT = int(os.environ.get("PORT", 8001))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def create_strictly_verified_ssl_context():
    """
    Creates an SSL context with mandatory certificate and hostname verification.
    Uses macOS System Root Certificates keychain to ensure SSL verification remains strictly enabled.
    """
    ctx = ssl.create_default_context()
    ctx.verify_mode = ssl.CERT_REQUIRED
    ctx.check_hostname = True

    # Load system root certificates from macOS Keychain
    try:
        p = subprocess.run(
            ['security', 'find-certificate', '-a', '-p', '/System/Library/Keychains/SystemRootCertificates.keychain'],
            capture_output=True,
            check=True
        )
        if p.stdout:
            ctx.load_verify_locations(cadata=p.stdout.decode('utf-8'))
            print("🔒 Loaded macOS System Root Keychain CA certificates into verified SSL context.")
    except Exception as e:
        print(f"⚠️ Could not load macOS system keychain certs: {e}")

    return ctx

VERIFIED_SSL_CONTEXT = create_strictly_verified_ssl_context()

def load_env_file():
    """Load key-value pairs from .env or .env.local without external libraries."""
    for filename in ['.env.local', '.env']:
        env_path = os.path.join(DIRECTORY, filename)
        if os.path.isfile(env_path):
            try:
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            # Always update environment if key is in .env
                            os.environ[k] = v
                print(f"📄 Loaded environment configuration from {filename}")
            except Exception as e:
                print(f"⚠️ Could not read {filename}: {e}")

load_env_file()

def get_gemini_api_key():
    """Retrieve Gemini API key from environment, checking standard variable names."""
    return os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY') or ''

def mask_key(key):
    """Safely mask API key for logging or status without ever exposing secret material."""
    if not key or len(key) < 8:
        return 'configured' if key else None
    return key[:4] + '••••••••' + key[-4:]

# Expanded Knowledge Mapping for Bengaluru BBMP Solid Waste Management Bye-Laws 2020
WASTE_KNOWLEDGE_BASE = [
    # Electronics / E-Waste
    {
        "keywords": ["smartphone", "mobile phone", "cell phone", "phone", "iphone", "apple iphone", "apple", "android"],
        "item_name": "Apple iPhone / Smartphone",
        "category": "Electronic Waste",
        "item_type": "household_object",
        "is_waste": True,
        "recommended_bin": "separate_ewaste",
        "bin_label": "Separate E-Waste Collection",
        "likely_materials": [
            "Aluminosilicate Display Glass",
            "Lithium-Ion / Lithium-Polymer Battery Cell",
            "Multilayer PCB (Copper, Gold, Silicon, Solder)",
            "Anodized Aluminum / Titanium / Stainless Steel Enclosure",
            "Rare Earth Elements (Neodymium Magnets in Speaker & Taptic Engine)"
        ],
        "how_to_prepare": "Back up personal data, perform a factory reset, and remove SIM/microSD cards. Do not throw into ordinary Blue, Green, Grey, or Red household bins.",
        "bbmp_guideline": "Under the E-Waste (Management) Rules and BBMP SWM guidelines, electronic devices must NOT be disposed of in ordinary Blue, Green, Grey, or Red household bins. Hand over at designated BBMP Dry Waste Collection Centres (DWCCs) with authorized e-waste tie-ups, producer take-back drop-off points, or KSPCB-registered e-waste recycling facilities.",
        "reuse_repair_suggestion": "If the phone is still functioning, recommend continued use, battery replacement, screen repair, resale (via authorized buyback platforms like Cashify or Apple Trade-In), or donation before considering disposal.",
        "cautious_disposal_note": "Smartphones must never be discarded in ordinary municipal dustbins. Volatile lithium batteries pose severe fire hazards if crushed in garbage compactors, while authorized e-waste recyclers safely recover precious gold, silver, and copper."
    },
    {
        "keywords": ["laptop", "tablet", "computer", "ipad"],
        "item_name": "Laptop / Tablet Computer",
        "category": "Electronic Waste",
        "item_type": "household_object",
        "is_waste": True,
        "recommended_bin": "separate_ewaste",
        "bin_label": "Separate E-Waste Collection",
        "likely_materials": ["Lithium-Polymer Battery", "Multilayer PCB with Gold/Copper Contacts", "LCD/OLED Display Panel", "Aluminum / Magnesium Alloy Casing"],
        "how_to_prepare": "Wipe storage drives and deposit at an authorized e-waste recycler or municipal DWCC e-waste drop-off.",
        "bbmp_guideline": "Under Central E-Waste (Management) Rules & BBMP SWM Bye-Laws 2020, computer equipment requires Separate E-Waste Collection and must be routed to authorized dismantlers.",
        "reuse_repair_suggestion": "Upgrade RAM/SSD or install lightweight Linux OS to extend lifespan before recycling.",
        "cautious_disposal_note": "Never incinerate or discard in landfill streams due to toxic brominated flame retardants."
    },
    {
        "keywords": ["battery", "batteries", "aa battery", "aaa battery"],
        "item_name": "Household AA / AAA Battery",
        "category": "Hazardous Waste",
        "item_type": "household_object",
        "is_waste": True,
        "recommended_bin": "hazardous_sanitary",
        "bin_label": "Red Bag (Sanitary & Hazardous)",
        "likely_materials": ["Zinc-Carbon / Alkaline (Manganese Dioxide)", "Steel Canister", "Potassium Hydroxide Electrolyte"],
        "how_to_prepare": "Tape terminal ends with electrical tape to prevent short-circuit sparks; wrap in a newspaper or red bag.",
        "bbmp_guideline": "BBMP SWM Bye-Laws 2020 (Schedule-I, Category C: Domestic Hazardous Waste). Segregate strictly from dry and wet waste; hand over to Pourakarmikas on designated hazardous collection days.",
        "reuse_repair_suggestion": "Switch to rechargeable NiMH or USB-C lithium batteries for household devices.",
        "cautious_disposal_note": "Heavy metal leakage can contaminate groundwater if landfilled."
    },
    # Paper & Cardboard Packaging
    {
        "keywords": ["brown paper bag", "paper bag", "kraft bag", "grocery bag", "shopping bag"],
        "item_name": "Brown Paper Bag",
        "category": "Paper Packaging",
        "item_type": "packaging_waste",
        "is_waste": True,
        "contamination_sensitive": True,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Unbleached Kraft Paper (Long Cellulose Fibers)", "Twisted Paper Cord / Handles"],
        "how_to_prepare": "Check cleanliness: if clean and dry, flatten for Blue Bin dry recycling. If stained with food oils, cooking grease, or gravies, tear off soiled portions for composting (Green Bin).",
        "bbmp_guideline": "Under BBMP Solid Waste Management Bye-Laws 2020 (Schedule-I, Category B: Dry Waste), clean and dry paper bags must be segregated into the Blue Bin. Food-soiled or greasy paper cannot be pulped with water and must be composted (Green Bin) or diverted to RDF.",
        "reuse_repair_suggestion": "Reuse for carrying dry goods, groceries, or packaging ONLY when clean, dry, and structurally sound (tear-free with intact handles). Do not reuse if weakened by moisture, oil, or grease.",
        "cautious_disposal_note": "Paper recycling requires clean cellulose fibers. Food oil and grease permanently ruin paper pulping vats; plain unlaminated soiled paper must be composted in the Green Bin (Wet/Compost) or torn away from clean sections."
    },
    {
        "keywords": ["cardboard box", "pizza box", "shipping box", "box", "carton box"],
        "item_name": "Cardboard Packaging Box",
        "category": "Cardboard Packaging",
        "item_type": "packaging_waste",
        "is_waste": True,
        "contamination_sensitive": True,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Corrugated Kraft Paperboard (Fluted Cellulose Pulp)"],
        "how_to_prepare": "Flatten box completely; remove plastic packing tape. If stained with pizza grease or food oils, segregate greasy sections to Green Bin (Compost).",
        "bbmp_guideline": "Classified under BBMP SWM Bye-Laws 2020 (Schedule-I, Category B: Dry Waste). Clean dry cardboard is pulped into new corrugated sheets. Food-soiled portions must be diverted to wet waste composting.",
        "reuse_repair_suggestion": "Reuse sturdy, clean cardboard boxes for household storage, organizing, moving, or parcel shipping before sending to recycling.",
        "cautious_disposal_note": "Food oil and melted cheese permanently ruin paper pulping vats. Clean dry sections go to Blue Bin (Dry Recycling); food-soiled or greasy sections must be segregated to Green Bin (Compost)."
    },
    # Beverage Cartons / Tetra Pak
    {
        "keywords": ["beverage carton", "tetra pak", "tetrapak", "juice carton", "milk carton"],
        "item_name": "Beverage Carton / Tetra Pak",
        "category": "Beverage Packaging",
        "item_type": "packaging_waste",
        "is_waste": True,
        "contamination_sensitive": True,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Multi-layer Composite Paperboard (~75%)", "Low-Density Polyethylene Film (~20%)", "Aluminum Barrier Foil (~5%)"],
        "how_to_prepare": "Empty liquids, rinse with water, unfold flaps, and flatten completely before placing into Blue Bin dry recycling.",
        "bbmp_guideline": "Under BBMP SWM Bye-Laws 2020 (Schedule-I, Category B: Dry Waste), clean rinsed cartons are sent to specialized hydrapulping mills to extract paper fibers and poly-aluminum boards.",
        "reuse_repair_suggestion": "Single-use aseptic cartons are not suitable for repeated food or beverage storage once opened, as interior folded seams harbor bacterial growth. Rinse thoroughly, flatten, and deposit into the Blue Bin for specialized hydrapulping fiber recovery.",
        "cautious_disposal_note": "Unrinsed milk or juice cartons rot quickly and spoil adjacent recyclable dry paper in the collection stream. Always rinse with a little water and flatten before disposal."
    },
    # Plastic Bottles & Containers
    {
        "keywords": ["water bottle", "plastic bottle", "beverage bottle", "pet bottle"],
        "item_name": "Clear Plastic Water Bottle",
        "category": "Plastic Packaging",
        "item_type": "packaging_waste",
        "is_waste": True,
        "contamination_sensitive": False,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Polyethylene Terephthalate (PET #1 Bottle Body)", "High-Density Polyethylene (HDPE #2 Cap)"],
        "how_to_prepare": "Empty all liquids completely, crush the bottle flat to save volume, and screw the plastic cap back on.",
        "bbmp_guideline": "Classified under BBMP SWM Bye-Laws 2020 (Schedule-I, Category B: Dry Waste). PET bottles are high-value recyclables converted into rPET flakes and polyester yarn at DWCCs.",
        "reuse_repair_suggestion": "Avoid repeated reuse of single-use disposable PET bottles for drinking-water storage. Interior micro-abrasions harbor bacterial biofilm, and single-use PET can leach trace chemicals under heat or repeated washing. Switch to food-grade stainless steel, copper, or glass bottles for daily hydration, and place this bottle in the Blue Bin for recycling.",
        "cautious_disposal_note": "Ensure bottle is completely empty of liquids before crushing flat. Residual liquids contaminate dry waste paper batches during transit."
    },
    # Metal Cans & Tins
    {
        "keywords": ["aluminum can", "soda can", "beverage can", "tin can", "metal can", "can"],
        "item_name": "Aluminum Beverage Can",
        "category": "Metal Packaging",
        "item_type": "packaging_waste",
        "is_waste": True,
        "contamination_sensitive": False,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Aluminum Alloy (Al 3004 / 5182)", "Interior Protective Epoxy Resin Liner"],
        "how_to_prepare": "Empty contents, rinse lightly with water, and place in dry recyclables.",
        "bbmp_guideline": "BBMP SWM Bye-Laws 2020 Category B Dry Waste (High-Value Metal Stream). 100% infinitely recyclable without quality loss.",
        "reuse_repair_suggestion": "No suitable reuse recommendation available.",
        "cautious_disposal_note": "Single-use pull-tab cans have sharp edges once opened and cannot be resealed for food storage. High-value 100% infinitely recyclable metal; rinse lightly and crush into Blue Bin."
    },
    # Multi-Layer Plastics & Snack Packets
    {
        "keywords": ["chips", "potato chips", "snack packet", "sachet", "wrapper", "biscuit wrapper"],
        "item_name": "Potato Chips / Snack Sachet",
        "category": "Multi-Layer Plastic (MLP)",
        "item_type": "packaging_waste",
        "is_waste": True,
        "contamination_sensitive": False,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Biaxially Oriented Polypropylene (BOPP)", "Vacuum Metallized Aluminum Vapor Layer", "Polyethylene Heat-Seal Layer"],
        "how_to_prepare": "Empty loose food crumbs, keep dry, and store with dry waste.",
        "bbmp_guideline": "Under BBMP SWM Bye-Laws 2020, clean dry MLP sachets are collected at DWCCs and baled for RDF (Refuse Derived Fuel) co-processing in cement kilns.",
        "reuse_repair_suggestion": "No suitable reuse recommendation available.",
        "cautious_disposal_note": "Multi-layer laminate (BOPP plastic bonded with aluminum vapor) cannot be mechanically remelted into recycled plastic. BBMP DWCCs bundle them as Refuse-Derived Fuel (RDF) for high-heat cement kilns."
    },
    # Household Objects (Accessories, Toys, Toiletries)
    {
        "keywords": ["claw clip", "hair clip", "hair accessory"],
        "item_name": "Plastic Hair Claw Clip",
        "category": "Household Object",
        "item_type": "household_object",
        "is_waste": True,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Molded Rigid Polystyrene / Polypropylene", "Tempered Steel Tension Spring"],
        "how_to_prepare": "Remove any entangled hair strands and place into dry waste for DWCC sorting.",
        "bbmp_guideline": "BBMP SWM Bye-Laws 2020: Rigid plastic household accessories are segregated as dry waste for secondary sorting at DWCCs.",
        "reuse_repair_suggestion": "If intact, continue using or donate before discarding.",
        "cautious_disposal_note": "Rigid household molded plastics cannot be remelted with PET bottles; segregated for RDF if non-recyclable."
    },
    {
        "keywords": ["toothbrush", "manual toothbrush"],
        "item_name": "Manual Toothbrush",
        "category": "Household Object",
        "item_type": "household_object",
        "is_waste": True,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Polypropylene Handle (PP #5)", "Elastomer Grip (TPE)", "Nylon Bristles (Nylon-6,12)"],
        "how_to_prepare": "Rinse clean and place with dry waste.",
        "bbmp_guideline": "BBMP SWM Bye-Laws 2020 Dry Waste (DWCC collection). Segregated for secondary sorting or RDF.",
        "reuse_repair_suggestion": "Repurpose as a detailed household cleaning brush for faucets, tile grout, or sneakers before discarding.",
        "cautious_disposal_note": "Multi-material fused construction prevents bottle-grade recycling; diverted to RDF."
    },
    {
        "keywords": ["pen", "ballpoint pen", "pencil", "marker"],
        "item_name": "Ballpoint Pen",
        "category": "Household Object",
        "item_type": "household_object",
        "is_waste": True,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Polystyrene / SAN Plastic Barrel", "Brass / Stainless Steel Tip", "Tungsten Carbide Ball"],
        "how_to_prepare": "Ensure ink is exhausted; keep dry.",
        "bbmp_guideline": "BBMP SWM Bye-Laws 2020 Dry Waste. Hand over to DWCC.",
        "reuse_repair_suggestion": "Use refillable fountain pens or refill cartridges instead of single-use disposable pen bodies.",
        "cautious_disposal_note": "Composite plastic bodies are routed to RDF co-processing."
    },
    {
        "keywords": ["toy", "plastic toy", "doll", "action figure"],
        "item_name": "Plastic Toy / Household Good",
        "category": "Household Object",
        "item_type": "household_object",
        "is_waste": True,
        "recommended_bin": "dry_recyclables",
        "bin_label": "Blue Bin (Clean Dry Recycling)",
        "likely_materials": ["Molded ABS / Polyethylene Thermoplastic", "Metal Screws / Fasteners"],
        "how_to_prepare": "Remove batteries if motorized; keep clean and dry.",
        "bbmp_guideline": "BBMP SWM Bye-Laws 2020 Dry Waste. Non-toxic toys are segregated for material recovery.",
        "reuse_repair_suggestion": "Donate intact toys to community daycares, shelters, or toy libraries before discarding.",
        "cautious_disposal_note": "Always remove batteries first and segregate batteries separately into domestic hazardous waste."
    },
    # Organic Waste
    {
        "keywords": ["apple", "banana", "fruit", "peel", "food", "vegetable", "scrap"],
        "item_name": "Organic Food / Fruit Waste",
        "category": "Organic Waste",
        "item_type": "household_object",
        "is_waste": True,
        "recommended_bin": "wet_organics",
        "bin_label": "Green Bin (Compost / Wet)",
        "likely_materials": ["Biodegradable Organic Cellulose", "Plant Sugars & Water Content"],
        "how_to_prepare": "Drain excess liquids; do not wrap in plastic bags; place directly into the Green Bin.",
        "bbmp_guideline": "BBMP SWM Bye-Laws 2020 (Schedule-I, Category A: Wet Waste). Daily door-to-door collection by BBMP Pourakarmikas for municipal biomethanation or composting.",
        "reuse_repair_suggestion": "Compost at home in an earthen pot (khamba) to produce rich organic plant manure.",
        "cautious_disposal_note": "Never mix organic wet waste with dry recyclables, as moisture contaminates paper and cardboard."
    }
]

def find_knowledge_match(text):
    text_lower = text.lower()
    for item in WASTE_KNOWLEDGE_BASE:
        for kw in item["keywords"]:
            if kw in text_lower:
                return item
    return None

def enrich_and_normalize_items(gemini_data):
    raw_detected = gemini_data.get('detected_items') or []
    
    # If detected_items was not provided or empty, use top-level fields
    if not raw_detected and gemini_data.get('item_name'):
        raw_detected = [{
            "item_name": gemini_data.get('item_name'),
            "category": gemini_data.get('category'),
            "item_type": gemini_data.get('item_type'),
            "is_waste": gemini_data.get('is_waste'),
            "recommended_bin": gemini_data.get('recommended_bin'),
            "friendly_summary": gemini_data.get('friendly_summary'),
            "likely_materials": gemini_data.get('likely_materials'),
            "how_to_prepare": gemini_data.get('how_to_prepare'),
            "bbmp_guideline": gemini_data.get('bbmp_guideline'),
            "reuse_repair_suggestion": gemini_data.get('reuse_repair_suggestion'),
            "cautious_disposal_note": gemini_data.get('cautious_disposal_note')
        }]

    # Check if a person or face is in the scene
    has_person = any(
        any(p in (item.get('item_name', '') + ' ' + item.get('category', '') + ' ' + item.get('friendly_summary', '')).lower() 
            for p in ['person', 'people', 'portrait', 'selfie', 'face', 'human'])
        for item in raw_detected
    ) or any(p in (gemini_data.get('item_name', '') + ' ' + gemini_data.get('friendly_summary', '')).lower()
            for p in ['person', 'people', 'portrait', 'selfie', 'face', 'human'])

    person_already_in_list = any(
        (item.get('item_type') == 'non_waste' or any(p in (item.get('item_name', '')).lower() for p in ['person', 'selfie', 'portrait']))
        for item in raw_detected
    )
    
    if has_person and not person_already_in_list:
        raw_detected.append({
            "item_name": "Person / Portrait",
            "category": "Person / Portrait",
            "item_type": "non_waste",
            "is_waste": False,
            "recommended_bin": None,
            "friendly_summary": "Photograph or selfie of person(s). Not a discardable waste or packaging item."
        })

    # Deduplicate items by normalized name
    deduped = []
    seen_keys = set()
    for item in raw_detected:
        name = (item.get('item_name') or item.get('name') or '').strip()
        if not name:
            continue
        norm_key = name.lower().rstrip('.!,')
        if norm_key in seen_keys:
            continue
        seen_keys.add(norm_key)
        deduped.append(item)

    if not deduped and raw_detected:
        deduped = raw_detected

    normalized_list = []
    for item in deduped:
        name = (item.get('item_name') or item.get('name') or 'Identified Item').strip()
        cat = (item.get('category') or '').strip()
        itype = item.get('item_type')
        is_waste = item.get('is_waste')
        
        name_cat_lower = f"{name} {cat}".lower()
        is_ewaste = any(k in name_cat_lower for k in [
            'phone', 'iphone', 'smartphone', 'mobile', 'cellphone', 'cell phone',
            'laptop', 'tablet', 'ipad', 'computer', 'electronic', 'e-waste', 'gadget',
            'charger', 'battery', 'batteries', 'cable', 'headphone', 'earphone'
        ])
        is_object_or_packaging = is_ewaste or any(k in name_cat_lower for k in [
            'bottle', 'carton', 'bag', 'can', 'packet', 'sachet', 'clip', 'toothbrush',
            'pen', 'toy', 'box', 'packaging', 'cup', 'wrapper', 'food', 'waste',
            'plastic', 'glass', 'paper', 'cardboard', 'metal'
        ])
        
        is_person = any(p in name_cat_lower for p in ['person', 'selfie', 'portrait', 'human', 'face']) and not is_object_or_packaging
        is_landscape = any(p in name_cat_lower for p in ['landscape', 'city', 'skyline', 'mountain', 'nature']) and not is_object_or_packaging
        is_animal = any(p in name_cat_lower for p in ['dog', 'cat', 'animal', 'pet', 'bird']) and not is_object_or_packaging
        
        is_true_non_waste = (is_person or is_landscape or is_animal) or (
            (itype == 'non_waste' or is_waste is False) and not is_object_or_packaging
        )
        
        if is_true_non_waste:
            normalized_list.append({
                "name": name if name else ("Person / Portrait" if is_person else "Non-Waste Subject"),
                "item_name": name if name else ("Person / Portrait" if is_person else "Non-Waste Subject"),
                "category": cat or ("Person / Portrait" if is_person else "Non-Waste"),
                "item_type": "non_waste",
                "is_waste": False,
                "recommended_bin": None,
                "bin_label": None,
                "friendly_summary": item.get('friendly_summary') or ("Photograph or selfie of person(s). Not a discardable waste or packaging item." if is_person else "This subject is not a discardable packaging or household waste item."),
                "likely_materials": [],
                "how_to_prepare": None,
                "bbmp_guideline": None,
                "reuse_repair_suggestion": None,
                "cautious_disposal_note": None
            })
            continue

        knowledge = find_knowledge_match(f"{name} {cat}")
        
        rbin = item.get('recommended_bin')
        if is_ewaste and (not rbin or rbin in ('not_waste', 'none', 'null', None, 'hazardous_sanitary', 'dry_recyclables', 'wet_organics', 'landfill_rdf')):
            rbin = "separate_ewaste"
        elif not rbin or rbin in ('not_waste', 'none', 'null', None):
            rbin = knowledge["recommended_bin"] if knowledge else "dry_recyclables"
            
        bin_label = item.get('bin_label')
        if not bin_label or is_ewaste:
            if is_ewaste or rbin == 'separate_ewaste':
                bin_label = 'Separate E-Waste Collection'
            elif knowledge:
                bin_label = knowledge["bin_label"]
            elif rbin == 'dry_recyclables':
                bin_label = 'Blue Bin (Clean Dry Recycling)'
            elif rbin == 'wet_organics':
                bin_label = 'Green Bin (Compost / Wet)'
            elif rbin == 'hazardous_sanitary':
                bin_label = 'Red Bag (Sanitary & Hazardous)'
            else:
                bin_label = 'Grey Bin (Landfill / Cement Fuel)'
                
        is_contam_sensitive = bool(knowledge.get('contamination_sensitive', False) if knowledge else (
            any(k in (name + " " + cat).lower() for k in ['paper', 'cardboard', 'carton', 'box', 'kraft', 'takeout', 'pizza']) and
            not any(k in (name + " " + cat).lower() for k in ['plastic bottle', 'can'])
        ))

        final_cat = "Electronic Waste" if is_ewaste else (cat or (knowledge["category"] if knowledge else ("Packaging Waste" if "packaging" in (name+cat).lower() else "Household Object")))
        final_type = "household_object" if is_ewaste else (itype or (knowledge["item_type"] if knowledge else ("packaging_waste" if "packaging" in (name+cat).lower() else "household_object")))
        final_mats = item.get('likely_materials') or (knowledge["likely_materials"] if knowledge else [])
        final_prep = (knowledge["how_to_prepare"] if (knowledge and is_ewaste) else (item.get('how_to_prepare') or (knowledge["how_to_prepare"] if knowledge else "Ensure clean and dry before placing in the appropriate municipal segregation stream.")))
        final_bbmp = (knowledge["bbmp_guideline"] if (knowledge and is_ewaste) else (item.get('bbmp_guideline') or (knowledge["bbmp_guideline"] if knowledge else "Classified under BBMP Solid Waste Management Bye-Laws 2020. Follow municipal segregation guidelines.")))
        
        if knowledge and "reuse_repair_suggestion" in knowledge:
            final_reuse = knowledge["reuse_repair_suggestion"]
        else:
            final_reuse = item.get('reuse_repair_suggestion')
            if not final_reuse or "before discarding, consider whether" in (final_reuse or "").lower():
                final_reuse = "No suitable reuse recommendation available."
                
        final_caution = (knowledge["cautious_disposal_note"] if (knowledge and is_ewaste) else (item.get('cautious_disposal_note') or (knowledge["cautious_disposal_note"] if knowledge else None)))
        final_summary = item.get('friendly_summary') or (f"Identified {name}. If functioning, prioritize reuse or repair; if discarded, segregate for Separate E-Waste Collection." if is_ewaste else f"Identified {name}. Follow Bengaluru BBMP segregation guidelines.")

        normalized_list.append({
            "name": name,
            "item_name": name,
            "category": final_cat,
            "item_type": final_type,
            "is_waste": True,
            "contamination_sensitive": is_contam_sensitive,
            "recommended_bin": rbin,
            "bin_label": bin_label,
            "friendly_summary": final_summary,
            "likely_materials": final_mats,
            "how_to_prepare": final_prep,
            "bbmp_guideline": final_bbmp,
            "reuse_repair_suggestion": final_reuse,
            "cautious_disposal_note": final_caution
        })

    waste_items = [i for i in normalized_list if i["is_waste"]]
    non_waste_items = [i for i in normalized_list if not i["is_waste"]]
    
    if waste_items:
        primary = waste_items[0]
        gemini_data["is_waste"] = True
        gemini_data["is_non_waste"] = False
        gemini_data["item_name"] = primary["name"]
        gemini_data["category"] = primary["category"]
        gemini_data["item_type"] = primary["item_type"]
        gemini_data["contamination_sensitive"] = primary.get("contamination_sensitive", False)
        gemini_data["recommended_bin"] = primary["recommended_bin"]
        gemini_data["bin_label"] = primary["bin_label"]
        gemini_data["likely_materials"] = primary["likely_materials"]
        gemini_data["how_to_prepare"] = primary["how_to_prepare"]
        gemini_data["bbmp_guideline"] = primary["bbmp_guideline"]
        gemini_data["bbmp_applicable"] = True
        gemini_data["reuse_repair_suggestion"] = primary["reuse_repair_suggestion"]
        gemini_data["cautious_disposal_note"] = primary["cautious_disposal_note"]
        
        if len(normalized_list) > 1:
            names_str = ", ".join([i["name"] for i in normalized_list])
            gemini_data["friendly_summary"] = f"Detected {len(normalized_list)} objects: {names_str}. Select any item below to view specific municipal disposal guidance."
        else:
            gemini_data["friendly_summary"] = primary["friendly_summary"]
    else:
        primary = non_waste_items[0] if non_waste_items else {
            "name": "Person / Portrait",
            "category": "Non-Waste",
            "item_type": "non_waste",
            "is_waste": False,
            "friendly_summary": "This image does not appear to be waste or recyclable packaging."
        }
        gemini_data["is_waste"] = False
        gemini_data["is_non_waste"] = True
        gemini_data["item_name"] = primary["name"]
        gemini_data["category"] = primary["category"]
        gemini_data["item_type"] = "non_waste"
        gemini_data["recommended_bin"] = None
        gemini_data["bbmp_applicable"] = False
        gemini_data["bbmp_guideline"] = None
        gemini_data["likely_materials"] = []
        gemini_data["how_to_prepare"] = None
        gemini_data["reuse_repair_suggestion"] = None
        gemini_data["cautious_disposal_note"] = None
        gemini_data["friendly_summary"] = primary["friendly_summary"]
        
    gemini_data["has_multiple_items"] = len(normalized_list) > 1
    gemini_data["detected_items"] = normalized_list
    return gemini_data

class ReViveHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Health check endpoint
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            api_key = get_gemini_api_key()
            has_gemini_key = bool(api_key)
            payload = {
                "status": "healthy",
                "app": "ReVive Smart Recycling Assistant",
                "gemini_api_configured": has_gemini_key,
                "gemini_key_hint": mask_key(api_key),
                "ssl_verification": "STRICT_CERT_REQUIRED",
                "locality": "Bengaluru (BBMP Solid Waste Management Bye-Laws 2020)"
            }
            self.wfile.write(json.dumps(payload).encode('utf-8'))
            return

        # Default static file handling
        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'

        # Endpoint 1: In-App Secure API Key Configuration
        if self.path == '/api/set-key':
            try:
                data = json.loads(post_data.decode('utf-8'))
                new_key = data.get('apiKey', '').strip()
                if not new_key:
                    raise ValueError("API key cannot be empty")

                # Verify key against Google Generative Language endpoint with strict SSL verification
                verify_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={new_key}"
                req = urllib.request.Request(verify_url, headers={'Content-Type': 'application/json'})

                with urllib.request.urlopen(req, timeout=12, context=VERIFIED_SSL_CONTEXT) as resp:
                    pass

                # Key verified! Save securely
                os.environ['GEMINI_API_KEY'] = new_key
                env_path = os.path.join(DIRECTORY, '.env')
                lines = []
                key_found = False
                if os.path.isfile(env_path):
                    with open(env_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            if line.strip().startswith('GEMINI_API_KEY='):
                                lines.append(f'GEMINI_API_KEY="{new_key}"\n')
                                key_found = True
                            else:
                                lines.append(line)
                if not key_found:
                    lines.append(f'GEMINI_API_KEY="{new_key}"\n')
                with open(env_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "Google Gemini API key successfully verified with SSL and activated!",
                    "keyHint": mask_key(new_key)
                }).encode('utf-8'))
                return

            except urllib.error.HTTPError as http_err:
                err_body = http_err.read().decode('utf-8', errors='ignore')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": f"Google rejected the API key (HTTP {http_err.code}). Please verify your key permissions."
                }).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": str(e)
                }).encode('utf-8'))
                return

        # Endpoint 2: AI Vision Scan
        if self.path == '/api/scan':
            api_key = get_gemini_api_key()
            if not api_key:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {
                    "success": False,
                    "status": "API_KEY_NOT_CONFIGURED",
                    "error": "GEMINI_API_KEY is not configured on the backend server.",
                    "message": "AI Vision requires a Google Gemini API key. Please add your key or pick from our verified guide."
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return

            try:
                data = json.loads(post_data.decode('utf-8'))
                image_base64 = data.get('image')
                mime_type = data.get('mimeType', 'image/jpeg')

                if not image_base64:
                    raise ValueError("No image data provided in scan request")

                if ',' in image_base64:
                    image_base64 = image_base64.split(',', 1)[1]

                system_instruction = (
                    "You are a friendly, highly knowledgeable environmental analyst helping everyday citizens in Bengaluru, India properly manage and recycle household waste, household objects, packaging, and electronics. "
                    "Analyze the provided photograph or collage carefully. "
                    "\n"
                    "CRITICAL REQUIREMENT: RELIABLE MULTI-OBJECT RECOGNITION "
                    "1. SYSTEMATIC FULL-IMAGE ANALYSIS: "
                    "   - Analyze the ENTIRE image across all quadrants and regions. Detect ALL clearly identifiable items: packaging waste, household items, containers, electronic devices, personal accessories, and people. "
                    "   - Support normal multi-item photos (e.g. items placed together on a table, floor, or held by people). "
                    "   - Support multi-panel collages (e.g. 2x2, 2x3, 3x2, or irregular photo grids with separate sub-photos). For collages, inspect each panel or sub-frame independently and identify the object shown in each panel. "
                    "\n"
                    "2. RETURN ALL DETECTED OBJECTS IN detected_items: "
                    "   - Return a structured array `detected_items` listing EVERY clearly visible object as a separate, distinct item. "
                    "   - If there is 1 object (e.g. a plastic bottle), detected_items has 1 entry. "
                    "   - If there are 4 objects (e.g. bottle, carton, paper bag, smartphone), detected_items MUST have 4 separate entries. "
                    "   - If there are 6 objects in a collage, detected_items MUST have 6 separate entries. "
                    "   - If multiple objects are found, set `has_multiple_items = true`. "
                    "\n"
                    "3. DO NOT MERGE DIFFERENT ITEMS: "
                    "   - Never merge distinct items into a single combined item (e.g. do not combine bottle, carton, and bag into 'Assorted Waste' or 'Recyclables'). Each physical item must be its own distinct entry with its own specific materials and bin recommendation. "
                    "\n"
                    "4. NO DUPLICATE DETECTIONS: "
                    "   - Do not generate duplicate entries for the exact same physical object instance. "
                    "\n"
                    "5. STRICT ANTI-HALLUCINATION & UNCERTAINTY HANDLING: "
                    "   - Only include objects that are clearly and visibly present. Do not guess or invent items that are not in the photo. "
                    "   - If an item is occluded, distant, or blurry, mark `is_unclear: true` or note the uncertainty in `cautious_disposal_note`. "
                    "\n"
                    "6. PEOPLE AND NON-WASTE OBJECTS: "
                    "   - If a person, face, portrait, or selfie is visible: "
                    "     * Include them in `detected_items` with `item_name: 'Person / Portrait'`, `category: 'Person / Portrait'`, `item_type: 'non_waste'`, `is_waste: false`, `recommended_bin: null`. "
                    "     * NEVER allow the presence of a person to hide, suppress, or override visible waste items or packaging! "
                    "     * If both waste items and a person are present, set top-level `item_name` and fields to one of the detected waste items (so the user gets immediate recycling guidance), and ensure the person is also present in `detected_items`. "
                    "   - If the photo is PURELY a selfie, portrait, landscape, or animal with NO visible packaging, disposable objects, or discardable items: "
                    "     * Set top-level `item_type = 'non_waste'`, `is_waste = false`, `recommended_bin = null`, `has_multiple_items = false`. "
                    "\n"
                    "7. BENGALURU BBMP & E-WASTE SEGREGATION CATEGORIES: "
                    "   - 'dry_recyclables' (Blue Bin): Clean paper, cardboard, plastic bottles (PET #1, HDPE #2), metal cans, Tetra Paks, dry packaging. "
                    "   - 'wet_organics' (Green Bin): Food scraps, fruit peels, compostable organic waste. "
                    "   - 'hazardous_sanitary' (Red Bag / Hazardous): Sanitary waste, toxic chemicals, household hazardous cleaners, medical blister packs. "
                    "   - 'separate_ewaste' (Separate E-Waste Collection): Smartphones, iPhones, laptops, tablets, computers, electronic gadgets. Do NOT assign smartphones to ordinary Blue, Green, Grey, or Red bins without verified justification. For functioning phones, recommend continued use, repair, resale, or donation first; if discarded, recommend authorized Separate E-Waste Collection. "
                    "   - 'landfill_rdf' (Grey Bin): Non-recyclable composite packaging, multi-layer plastics (MLP) for cement kiln RDF co-processing. "
                    "\n"
                    "8. DISTINGUISH PEOPLE FROM ELECTRONICS & HOUSEHOLD OBJECTS: "
                    "   - People, selfies, portraits, landscapes, and pets are non-waste (item_type: 'non_waste', is_waste: false, recommended_bin: null). "
                    "   - Electronic items (smartphones, Apple iPhones, laptops, gadgets) and household items (hair clips, toothbrushes, pens, toys) must NEVER be classified as a non-waste subject like a person, even if someone is holding them! "
                    "   - For an iPhone or smartphone: set item_type: 'household_object', is_waste: true, category: 'Electronic Waste', recommended_bin: 'separate_ewaste'. "
                    "\n"
                    "9. ITEM-SPECIFIC REUSE RULES (NEVER INVENT GENERIC ADVICE): "
                    "   - For smartphones/electronics: Suggest continued use, battery replacement, screen repair, resale (Cashify, Apple Trade-In), or donation before considering e-waste disposal. "
                    "   - For paper bags: Suggest reuse for carrying items ONLY when clean, dry, and structurally sound (tear-free with intact handles). "
                    "   - For PET plastic bottles: Avoid blanket recommendations to reuse disposable bottles for drinking water (warn that single-use PET develops bacterial biofilm and leaches trace chemicals; recommend durable stainless steel/copper/glass bottles); recommend Blue Bin recycling. "
                    "   - For beverage cartons / Tetra Paks: Explain that single-use aseptic cartons cannot be safely reused for repeated food/drink storage once unsealed; rinse, flatten, and deposit in Blue Bin. "
                    "   - For single-use items with no sensible reuse (e.g. snack packets/MLP film, pull-tab cans, disposable coffee cups): set reuse_repair_suggestion to 'No suitable reuse recommendation available'. Do NOT invent generic storage, craft, or grocery advice! "
                    "\n"
                    "10. CONTAMINATION-AWARE PACKAGING DISPOSAL: "
                    "   - For paper bags, cardboard boxes, cartons, and paper packaging: Food oil and grease cannot be dissolved in water-based paper pulping vats. "
                    "   - Clean/dry paper packaging belongs in the Blue Bin (Clean Dry Recycling). "
                    "   - Food-soiled or greasy paper must NOT be classified as clean dry recyclable; plain soiled paper goes to Green Bin (Wet/Compost) or has soiled sections torn off for composting, while plastic-lined soiled paper goes to Grey Bin (RDF). "
                    "   - When cleanliness cannot be determined from the photograph, note uncertainty and instruct the user to verify if food oil or grease is present. "
                    "\n"
                    "Return ONLY valid JSON matching this schema: "
                    "{"
                    "  \"item_type\": \"packaging_waste\" | \"household_object\" | \"non_waste\","
                    "  \"is_waste\": boolean,"
                    "  \"item_name\": string,"
                    "  \"category\": string,"
                    "  \"friendly_summary\": string,"
                    "  \"likely_materials\": [string],"
                    "  \"is_composite\": boolean,"
                    "  \"reuse_repair_suggestion\": string | null,"
                    "  \"recycling_certainty\": \"verified_stream\" | \"conditional_or_uncertain\" | \"not_applicable\","
                    "  \"cautious_disposal_note\": string | null,"
                    "  \"recommended_bin\": \"dry_recyclables\" | \"wet_organics\" | \"hazardous_sanitary\" | \"separate_ewaste\" | \"landfill_rdf\" | null,"
                    "  \"bbmp_applicable\": boolean,"
                    "  \"bbmp_guideline\": string | null,"
                    "  \"how_to_prepare\": string | null,"
                    "  \"has_multiple_items\": boolean,"
                    "  \"detected_items\": ["
                    "    {"
                    "      \"item_name\": string,"
                    "      \"category\": string,"
                    "      \"item_type\": \"packaging_waste\" | \"household_object\" | \"non_waste\","
                    "      \"is_waste\": boolean,"
                    "      \"recommended_bin\": \"dry_recyclables\" | \"wet_organics\" | \"hazardous_sanitary\" | \"landfill_rdf\" | null,"
                    "      \"bin_label\": string | null,"
                    "      \"friendly_summary\": string,"
                    "      \"likely_materials\": [string],"
                    "      \"how_to_prepare\": string | null,"
                    "      \"bbmp_guideline\": string | null,"
                    "      \"reuse_repair_suggestion\": string | null,"
                    "      \"cautious_disposal_note\": string | null"
                    "    }"
                    "  ],"
                    "  \"is_unclear\": boolean,"
                    "  \"needs_closer_photo\": boolean,"
                    "  \"unclear_reason\": string | null"
                    "}"
                )

                payload = {
                    "contents": [{
                        "parts": [
                            {"text": system_instruction},
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": image_base64
                                }
                            }
                        ]
                    }],
                    "generationConfig": {
                        "response_mime_type": "application/json",
                        "temperature": 0.2,
                        "maxOutputTokens": 4096
                    }
                }

                models_to_try = [
                    "gemini-3.5-flash",
                    "gemini-flash-lite-latest",
                    "gemini-3.1-flash-lite",
                    "gemini-3.5-flash-lite"
                ]
                last_error = None
                gemini_data = None
                successful_model = None

                for model in models_to_try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode('utf-8'),
                        headers={'Content-Type': 'application/json'},
                        method='POST'
                    )

                    try:
                        # Strictly verified SSL context
                        with urllib.request.urlopen(req, timeout=25, context=VERIFIED_SSL_CONTEXT) as resp:
                            gemini_result = json.loads(resp.read().decode('utf-8'))
                            text_content = gemini_result['candidates'][0]['content']['parts'][0]['text'].strip()
                            if text_content.startswith('```'):
                                lines = text_content.split('\n')
                                if lines[0].startswith('```'):
                                    lines = lines[1:]
                                if lines and lines[-1].startswith('```'):
                                    lines = lines[:-1]
                                text_content = '\n'.join(lines).strip()
                            raw_parsed = json.loads(text_content)

                            # Normalize, deduplicate, and enrich all detected items
                            gemini_data = enrich_and_normalize_items(raw_parsed)

                            successful_model = model
                            break
                    except urllib.error.HTTPError as http_err:
                        err_body = http_err.read().decode('utf-8', errors='ignore')
                        last_error = f"HTTP {http_err.code} on {model}: {err_body}"
                        if http_err.code in (404, 429, 500, 502, 503, 504):
                            continue
                        else:
                            break
                    except Exception as ex:
                        last_error = f"{type(ex).__name__} on {model}: {ex}"
                        continue

                if gemini_data:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "success": True,
                        "status": "OK",
                        "model": successful_model,
                        "source": f"Google Gemini ({successful_model})",
                        "data": gemini_data
                    }).encode('utf-8'))
                    return
                else:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "success": False,
                        "status": "API_ERROR",
                        "error": last_error or "Could not parse response from Gemini Vision API.",
                        "message": "AI Vision encountered an error connecting to Google Gemini API."
                    }).encode('utf-8'))
                    return

            except Exception as e:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "status": "REQUEST_ERROR",
                    "error": str(e),
                    "message": "Failed to process image analysis request."
                }).encode('utf-8'))
                return

        self.send_response(404)
        self.end_headers()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


class DualStackThreadingServer(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6
    daemon_threads = True

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        super().server_bind()


def run_server():
    port = PORT
    for attempt in range(5):
        try:
            # Try dual-stack IPv6 (binds both ::1 and 127.0.0.1 on macOS)
            try:
                httpd = DualStackThreadingServer(("::", port), ReViveHandler)
            except Exception:
                # Fallback to standard IPv4 ThreadingHTTPServer
                httpd = http.server.ThreadingHTTPServer(("", port), ReViveHandler)

            with httpd:
                print(f"🌿 ReVive Server running at:")
                print(f"   👉 http://localhost:{port}")
                print(f"   👉 http://127.0.0.1:{port}")
                print(f"📁 Serving directory: {DIRECTORY}")
                key_configured = bool(get_gemini_api_key())
                masked = mask_key(get_gemini_api_key())
                print(f"🔒 SSL Verification: STRICT_CERT_REQUIRED (Active)")
                print(f"🔑 Gemini API Status: {'CONFIGURED (' + masked + ')' if key_configured else 'NOT CONFIGURED'}")
                print("Press Ctrl+C to stop.")
                httpd.serve_forever()
        except OSError as e:
            if "Address already in use" in str(e):
                port += 1
            else:
                raise e


if __name__ == '__main__':
    run_server()
