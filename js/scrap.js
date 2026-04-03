// AeroForge - Scrap, Quality & Non-Conformance System
// Educational: In aerospace manufacturing, scrap and rework are major cost drivers.
// Industry average scrap rates run 5–15% of material cost. Boeing's 787 program
// famously struggled with composite scrap rates exceeding 30% early in production.
// AS9100 and NADCAP certifications exist specifically to drive these rates down.

const Scrap = {

  // Base scrap rate (fraction of material wasted) — 8% is realistic for a new shop
  BASE_SCRAP_RATE: 0.08,

  // Material cost as a fraction of contract payment (what you actually spend on raw materials)
  // Higher tiers use more exotic/expensive materials (titanium, composites, Inconel)
  MATERIAL_COST_RATIO: { 1: 0.28, 2: 0.33, 3: 0.38, 4: 0.44 },

  // NCR (Non-Conformance Report) base probability per tick per active contract
  BASE_NCR_PROB: 0.04,

  // --- SCRAP RATE CALCULATION ---

  getScrapRate(state) {
    let rate = this.BASE_SCRAP_RATE;

    // Quality buildings reduce scrap rate
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (!cell) continue;
        if (cell.id === 'quality_lab')   rate -= [0, 0.020, 0.032, 0.046][cell.level] || 0.020;
        if (cell.id === 'test_facility') rate -= [0, 0.012, 0.020, 0.030][cell.level] || 0.012;
        if (cell.id === 'clean_room')    rate -= [0, 0.006, 0.010, 0.016][cell.level] || 0.006;
        if (cell.id === 'machine_shop')  rate -= [0, 0.004, 0.007, 0.012][cell.level] || 0.004;
      }
    }

    // Tech unlocks
    if (state.unlockedTechs.includes('lean_manufacturing'))  rate -= 0.015;
    if (state.unlockedTechs.includes('advanced_machining'))  rate -= 0.018;
    if (state.unlockedTechs.includes('quality_control'))     rate -= 0.012;
    if (state.unlockedTechs.includes('as9100'))              rate -= 0.010;
    if (state.unlockedTechs.includes('digital_twin'))        rate -= 0.008;

    // Event modifier (scrap rate can spike from material or process events)
    rate *= (state.scrap ? state.scrap.scrapRateMult : 1.0);

    // Reputation factor: higher reputation = stricter processes = lower scrap
    const repBonus = (state.reputation - 1) * 0.004;
    rate -= repBonus;

    return Math.max(0.005, Math.min(0.25, rate)); // clamp 0.5% – 25%
  },

  // NCR probability per contract per tick
  getNcrProbability(state) {
    const scrapRate = this.getScrapRate(state);
    // Higher scrap rate correlates with more process escapes
    return Math.max(0.005, scrapRate * 0.4);
  },

  // --- SCRAP COST AT CONTRACT COMPLETION ---

  // Scrap cost deducted from contract revenue when work completes
  calculateScrapCost(state, contract) {
    const materialRatio = this.MATERIAL_COST_RATIO[contract.tier] || 0.33;
    const materialCost = contract.payment * materialRatio;
    const scrapRate = this.getScrapRate(state);
    return Math.floor(materialCost * scrapRate);
  },

  // Net revenue after scrap — what you actually pocket
  netRevenue(state, contract, grossPayment) {
    const scrapCost = this.calculateScrapCost(state, contract);
    return { net: Math.max(0, grossPayment - scrapCost), scrapCost };
  },

  // --- NON-CONFORMANCE REPORTS (NCRs) ---
  // NCRs represent quality escapes: out-of-spec dimensions, wrong material certs,
  // weld porosity, failed inspections — anything requiring a formal corrective action.

  rollNCR(state, contract) {
    const prob = this.getNcrProbability(state);
    if (Math.random() < prob) {
      return this.generateNCR(state, contract);
    }
    return null;
  },

  generateNCR(state, contract) {
    const tier = contract.tier;

    // NCR costs scale with contract tier — a bad weld on a fighter fuselage
    // costs FAR more to fix than a bad fastener
    const baseCosts = { 1: 4000, 2: 18000, 3: 55000, 4: 140000 };
    const baseCost = baseCosts[tier] || 4000;
    const cost = Math.floor(baseCost * (0.4 + Math.random() * 1.2));

    // Delay = ticks added to contract duration (rework takes time)
    const delayTicks = Math.floor(1 + Math.random() * Math.ceil(tier * 1.5));

    const { title, description, educational } = this._getNCRContent(tier);

    return {
      type: 'ncr',
      contractId: contract.id,
      contractName: contract.name,
      title,
      description,
      educational,
      cost,
      delayTicks,
      tier,
    };
  },

  applyNCR(state, contract, ncr) {
    state.cash -= ncr.cost;
    state.scrap.totalReworkCost += ncr.cost;
    state.scrap.ncrCount++;

    // Add delay to contract
    contract.ticksRemaining += ncr.delayTicks;
    contract.duration += ncr.delayTicks;

    Game.addEvent(state, {
      type: 'danger',
      message: `📋 NCR on "${ncr.contractName}": ${ncr.title} — Rework cost: $${Utils.formatMoney(ncr.cost)}, +${ncr.delayTicks} week delay. ${ncr.educational}`,
    });
  },

  _getNCRContent(tier) {
    const content = {
      1: [
        {
          title: 'Thread Gauge Rejection',
          description: 'Fastener threads fail Go/No-Go gauge check.',
          educational: '📚 Go/No-Go gauges verify thread tolerance to MIL-SPEC. Out-of-spec threads can cause assembly failures under vibration.',
        },
        {
          title: 'Missing Material Certifications',
          description: 'Raw material certs not traceable to heat/lot number.',
          educational: '📚 AS9100 requires full material traceability. Every piece of metal must trace back to a mill certificate showing chemical composition and mechanical properties.',
        },
        {
          title: 'Surface Finish Non-Conformance',
          description: 'Surface roughness Ra value out of engineering drawing spec.',
          educational: '📚 Surface finish (measured in Ra microinches) affects fatigue life and sealing. Aerospace drawings specify finish tightly because rough surfaces create stress concentrations.',
        },
        {
          title: 'Torque Record Missing',
          description: 'Fastener torque values not recorded per work order traveler.',
          educational: '📚 In aerospace, every torque wrench application is recorded on a "traveler" (job card). Missing records mean the work can\'t be proven to have been done correctly — it all gets redone.',
        },
      ],
      2: [
        {
          title: 'Weld Porosity Found — NDT Required',
          description: 'X-ray or ultrasonic inspection reveals subsurface porosity in structural weld.',
          educational: '📚 Non-Destructive Testing (NDT) — X-ray, ultrasonic, dye penetrant — is mandatory for structural welds. Porosity (gas pockets) reduces fatigue life. NADCAP-accredited NDT labs must perform the inspection.',
        },
        {
          title: 'Heat Treat Certificate Missing',
          description: 'Batch 7B lacks furnace chart proving correct temperature/time cycle.',
          educational: '📚 Heat treatment alters metal microstructure for strength. Each furnace run needs a time-temperature chart. Without it, you can\'t prove the part has correct properties — it must be re-processed or scrapped.',
        },
        {
          title: 'First Article Inspection Failure',
          description: 'FAI dimensional report shows 3 characteristics outside engineering tolerance.',
          educational: '📚 First Article Inspection (FAI) per AS9102 is a full dimensional, material, and process verification of the first part off a new setup. FAI failure means your process is not producing to print — stop, fix, re-inspect.',
        },
        {
          title: 'Deviation Request Submitted',
          description: 'Hole pattern 0.004" off nominal — customer engineering reviewing.',
          educational: '📚 A Deviation allows shipping a non-conforming part with customer approval when the discrepancy won\'t affect form/fit/function. Getting a Deviation approved takes time and costs goodwill with the customer.',
        },
      ],
      3: [
        {
          title: 'EMI Shielding Test Failure',
          description: 'Avionics enclosure fails electromagnetic interference shielding specification.',
          educational: '📚 DO-160 (Environmental Conditions for Airborne Equipment) specifies EMI shielding. Avionics must not radiate or be susceptible to interference — a failure can affect flight safety systems.',
        },
        {
          title: 'FOD Prevention Stop-Work',
          description: 'Customer source inspection found Foreign Object Debris risk — work stopped.',
          educational: '📚 FOD (Foreign Object Damage/Debris) can destroy jet engines and crash aircraft. AS9100 mandates FOD prevention programs — tool accountability, counters, covered receptacles. A single bolt left in an engine can cost millions.',
        },
        {
          title: 'Out-of-Sequence Fasteners',
          description: 'Wing assembly audit shows 14 fasteners installed before sealant — structural integrity review required.',
          educational: '📚 Aerospace assemblies have strict installation sequences defined in work orders (traveler cards). Fasteners installed before sealant can create corrosion paths and fatigue cracks. The assembly may have to be partially disassembled.',
        },
        {
          title: 'NDT Subsurface Indication',
          description: 'Ultrasonic test shows subsurface crack indication in engine case forging.',
          educational: '📚 Forging indications (cracks, inclusions, laps) found by UT (Ultrasonic Testing) require material review board (MRB) disposition. Options: accept with engineering justification, rework, or scrap. Engine cases are life-limited parts — no shortcuts.',
        },
      ],
      4: [
        {
          title: 'Fuselage Shimming Variance',
          description: 'Fuselage section shimming exceeds engineering tolerance by 0.012" — MRB disposition required.',
          educational: '📚 Shimming fills gaps between mating structural components. Aerospace structures allow only thousandths of an inch. A Material Review Board (MRB) decides if the part can fly as-is, needs rework, or must be scrapped. On a fuselage barrel, this is a very expensive decision.',
        },
        {
          title: 'Acceptance Test Procedure Failure',
          description: 'Wing box ATP failure on static load test — design engineering engaged.',
          educational: '📚 ATPs (Acceptance Test Procedures) prove every deliverable unit meets spec before it ships. A structural ATP failure on a wing box may mean redesign — potentially costing months and triggering customer penalties across the entire program.',
        },
        {
          title: 'DCMA Corrective Action Required',
          description: 'Defense Contract Management Agency audit found systemic quality escapes. 30-day CAR issued.',
          educational: '📚 DCMA (Defense Contract Management Agency) resides in your facility on major defense programs. They can issue a Corrective Action Request (CAR) that stops deliveries until root cause is fixed. A systemic CAR can threaten your entire contract.',
        },
        {
          title: 'Part Marking Non-Conformance',
          description: 'Military part marking (MIL-STD-130) missing on 40% of deliverables — hold on shipment.',
          educational: '📚 MIL-STD-130 requires permanent, machine-readable part marking for asset tracking and counterfeit prevention. Missing marking on a defense shipment triggers a hold and sometimes a DCMA visit. Every fastener on a fighter jet must be traceable.',
        },
      ],
    };

    const opts = content[tier] || content[1];
    return opts[Math.floor(Math.random() * opts.length)];
  },

  // --- FIRST ARTICLE INSPECTION (FAI) ---
  // Required the first time you produce a new contract type. One-time cost per tier unlock.

  FAI_COSTS: { 1: 8000, 2: 25000, 3: 75000, 4: 200000 },

  rollFAI(state, contract) {
    // FAI only fires if this is the first contract of this tier
    const tierKey = `fai_tier_${contract.tier}`;
    if (state.scrap.completedFAI && state.scrap.completedFAI.includes(tierKey)) return null;

    const cost = this.FAI_COSTS[contract.tier] || 8000;
    // FAI pass rate improves with quality buildings
    const qualityBonus = Buildings.getQualityBonus(state);
    const passRate = Math.min(0.95, 0.55 + qualityBonus * 0.6);
    const passed = Math.random() < passRate;

    if (!state.scrap.completedFAI) state.scrap.completedFAI = [];
    state.scrap.completedFAI.push(tierKey);

    const faiCost = passed ? cost : Math.floor(cost * 1.8); // failure costs more (re-inspection, rework)
    state.cash -= faiCost;
    state.scrap.totalReworkCost += faiCost;

    if (passed) {
      Game.addEvent(state, {
        type: 'success',
        message: `📐 FAI PASSED for Tier ${contract.tier} contracts! Cost: $${Utils.formatMoney(faiCost)}. 📚 First Article Inspection (AS9102) certifies your process is qualified to produce this part family.`,
      });
    } else {
      const delayTicks = Math.floor(4 + contract.tier * 2);
      contract.ticksRemaining += delayTicks;
      Game.addEvent(state, {
        type: 'danger',
        message: `📐 FAI FAILED — Tier ${contract.tier} first article rejected. Cost: $${Utils.formatMoney(faiCost)}, +${delayTicks} weeks. 📚 FAI failure means your tooling or process doesn't match engineering drawings. Common causes: wrong tool offsets, material substitution, or datum misalignment.`,
      });
    }
    return { passed, cost: faiCost };
  },
};
