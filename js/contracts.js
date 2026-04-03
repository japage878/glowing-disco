// AeroForge - Contract System

const Contracts = {
  // All possible contract templates
  TEMPLATES: [
    // === TIER 1: STARTUP ===
    {
      id: 'c_fasteners',
      name: 'Precision Fastener Batch',
      client: 'SkyParts Inc.',
      description: 'Manufacture 50,000 aerospace-grade fasteners to MIL-SPEC tolerances.',
      tier: 1, payment: 18000, duration: 6, risk: 'low',
      penalty: 5000, xpReward: 40,
      requirements: [], capacityRequired: 5,
    },
    {
      id: 'c_brackets',
      name: 'Structural Brackets',
      client: 'Regional Air',
      description: 'Fabricate aluminum structural brackets for regional jet interiors.',
      tier: 1, payment: 32000, duration: 8, risk: 'low',
      penalty: 8000, xpReward: 55,
      requirements: [], capacityRequired: 8,
    },
    {
      id: 'c_sheet_metal',
      name: 'Sheet Metal Skins',
      client: 'HeliBuild LLC',
      description: 'Produce helicopter fuselage skin panels from 2024-T3 aluminum.',
      tier: 1, payment: 45000, duration: 10, risk: 'low',
      penalty: 10000, xpReward: 65,
      requirements: [], capacityRequired: 10,
    },
    {
      id: 'c_interior',
      name: 'Cabin Interior Parts',
      client: 'FlyComfort Co.',
      description: 'Interior trim pieces and overhead bin latches for a startup airline.',
      tier: 1, payment: 28000, duration: 7, risk: 'low',
      penalty: 7000, xpReward: 48,
      requirements: [], capacityRequired: 6,
    },
    {
      id: 'c_small_engine',
      name: 'Engine Bracket Assembly',
      client: 'TurboProp Ltd.',
      description: 'Engine mounting brackets for small turboprop aircraft.',
      tier: 1, payment: 55000, duration: 12, risk: 'medium',
      penalty: 15000, xpReward: 80,
      requirements: ['machine_shop'], capacityRequired: 12,
    },
    {
      id: 'c_cargo_nets',
      name: 'Cargo Restraint Nets',
      client: 'AirFreight Express',
      description: 'Certified cargo restraint net systems for a cargo airline.',
      tier: 1, payment: 22000, duration: 5, risk: 'low',
      penalty: 6000, xpReward: 42,
      requirements: [], capacityRequired: 4,
    },
    {
      id: 'c_seals',
      name: 'Hydraulic Seal Kits',
      client: 'FluidTech Aero',
      description: 'Hydraulic system seal kits for aircraft maintenance.',
      tier: 1, payment: 38000, duration: 9, risk: 'low',
      penalty: 9000, xpReward: 60,
      requirements: [], capacityRequired: 7,
    },
    {
      id: 'c_wire_harness',
      name: 'Wire Harness Bundle',
      client: 'ElectraSky',
      description: 'Basic wire harnesses for light aircraft electrical systems.',
      tier: 1, payment: 48000, duration: 11, risk: 'medium',
      penalty: 12000, xpReward: 72,
      requirements: ['machine_shop'], capacityRequired: 9,
    },

    // === TIER 2: GROWTH ===
    {
      id: 'c_landing_strut',
      name: 'Landing Gear Struts',
      client: 'CommercialJet Corp',
      description: 'Main landing gear struts for a narrow-body jet program.',
      tier: 2, payment: 180000, duration: 20, risk: 'medium',
      penalty: 45000, xpReward: 200,
      requirements: ['machine_shop', 'quality_lab'], capacityRequired: 25,
    },
    {
      id: 'c_engine_nacelle',
      name: 'Engine Nacelle Panels',
      client: 'EngineTech Partners',
      description: 'Composite engine nacelle panels for turbofan engines.',
      tier: 2, payment: 250000, duration: 25, risk: 'medium',
      penalty: 60000, xpReward: 280,
      requirements: ['machine_shop', 'quality_lab'], capacityRequired: 30,
    },
    {
      id: 'c_fuel_system',
      name: 'Fuel System Components',
      client: 'JetFuel Systems',
      description: 'Precision fuel delivery components for commercial aircraft.',
      tier: 2, payment: 195000, duration: 22, risk: 'medium',
      penalty: 50000, xpReward: 220,
      requirements: ['machine_shop', 'quality_lab'], capacityRequired: 28,
    },
    {
      id: 'c_flaps',
      name: 'High-Lift Flap Tracks',
      client: 'WingParts Inc.',
      description: 'Flap track mechanisms for a regional jet family.',
      tier: 2, payment: 320000, duration: 30, risk: 'high',
      penalty: 80000, xpReward: 350,
      requirements: ['machine_shop', 'quality_lab', 'test_facility'], capacityRequired: 35,
    },
    {
      id: 'c_cockpit_frame',
      name: 'Cockpit Frame Subassembly',
      client: 'AviaFrame Ltd.',
      description: 'Structural cockpit frame assembly for a business jet.',
      tier: 2, payment: 420000, duration: 35, risk: 'high',
      penalty: 100000, xpReward: 420,
      requirements: ['machine_shop', 'quality_lab', 'test_facility'], capacityRequired: 40,
    },
    {
      id: 'c_aft_pressure',
      name: 'Aft Pressure Bulkhead',
      client: 'AeroStruct Corp',
      description: 'Aft pressure bulkhead for narrow-body aircraft.',
      tier: 2, payment: 380000, duration: 32, risk: 'medium',
      penalty: 90000, xpReward: 390,
      requirements: ['machine_shop', 'quality_lab'], capacityRequired: 38,
    },

    // === TIER 3: ESTABLISHED ===
    {
      id: 'c_avionics_box',
      name: 'Avionics Enclosures',
      client: 'NavSystems Intl.',
      description: 'Flight avionics enclosure boxes for modern commercial aircraft.',
      tier: 3, payment: 750000, duration: 40, risk: 'medium',
      penalty: 180000, xpReward: 650,
      requirements: ['clean_room', 'quality_lab', 'test_facility'], capacityRequired: 50,
    },
    {
      id: 'c_wing_spar',
      name: 'Wing Spar Assembly',
      client: 'AirFrame One',
      description: 'Primary wing spar box assembly for a narrow-body jet.',
      tier: 3, payment: 1200000, duration: 50, risk: 'high',
      penalty: 300000, xpReward: 900,
      requirements: ['machine_shop', 'quality_lab', 'test_facility', 'rd_center'], capacityRequired: 60,
    },
    {
      id: 'c_engine_case',
      name: 'Turbofan Engine Cases',
      client: 'PowerPlant Co.',
      description: 'Fan and compressor cases for a high-bypass turbofan engine.',
      tier: 3, payment: 980000, duration: 45, risk: 'high',
      penalty: 240000, xpReward: 780,
      requirements: ['machine_shop', 'clean_room', 'test_facility'], capacityRequired: 55,
    },
    {
      id: 'c_radar_dome',
      name: 'Radar Radome',
      client: 'DefenseTech Group',
      description: 'Composite radar radome for military surveillance aircraft.',
      tier: 3, payment: 850000, duration: 42, risk: 'medium',
      penalty: 200000, xpReward: 700,
      requirements: ['clean_room', 'rd_center'], capacityRequired: 52,
    },
    {
      id: 'c_landing_gear_assy',
      name: 'Full Landing Gear System',
      client: 'LandingPro Corp',
      description: 'Complete main and nose landing gear assemblies for a widebody.',
      tier: 3, payment: 1500000, duration: 55, risk: 'high',
      penalty: 375000, xpReward: 1100,
      requirements: ['machine_shop', 'quality_lab', 'test_facility', 'clean_room'], capacityRequired: 65,
    },

    // === TIER 4: OEM ===
    {
      id: 'c_fuselage_section',
      name: 'Forward Fuselage Section',
      client: 'GlobalAir OEM',
      description: 'Complete forward fuselage barrel section for a new wide-body aircraft.',
      tier: 4, payment: 5500000, duration: 80, risk: 'high',
      penalty: 1200000, xpReward: 3000,
      requirements: ['machine_shop', 'quality_lab', 'clean_room', 'test_facility', 'runway'], capacityRequired: 90,
    },
    {
      id: 'c_military_prime',
      name: 'Military Fighter Subcontract',
      client: 'USAF / Prime Defense',
      description: 'Classified: Aft fuselage and empennage for a 5th-gen fighter.',
      tier: 4, payment: 12000000, duration: 100, risk: 'high',
      penalty: 3000000, xpReward: 6000,
      requirements: ['machine_shop', 'quality_lab', 'clean_room', 'test_facility', 'runway', 'rd_center'], capacityRequired: 100,
    },
    {
      id: 'c_commercial_wing',
      name: 'Commercial Aircraft Wing Box',
      client: 'Airbus/Boeing Program',
      description: 'Full wing box assembly for the next-generation commercial jet.',
      tier: 4, payment: 18000000, duration: 110, risk: 'high',
      penalty: 4500000, xpReward: 8000,
      requirements: ['machine_shop', 'quality_lab', 'clean_room', 'test_facility', 'runway', 'rd_center'], capacityRequired: 100,
    },
    {
      id: 'c_full_aircraft',
      name: 'Complete Regional Jet',
      client: 'SkyLink Airlines',
      description: 'You build the whole thing. Full regional jet from nose to tail.',
      tier: 4, payment: 45000000, duration: 140, risk: 'high',
      penalty: 10000000, xpReward: 20000,
      requirements: ['machine_shop', 'quality_lab', 'clean_room', 'test_facility', 'runway', 'rd_center', 'hr_office'], capacityRequired: 100,
    },
  ],

  // Generate contract pool based on company level
  generatePool(state, count) {
    const level = state.level;
    const available = this.TEMPLATES.filter(t => {
      // Tier unlock: tier 1 always, tier 2 at level 4+, tier 3 at level 7+, tier 4 at level 10+
      const tierUnlocks = { 1: 1, 2: 4, 3: 7, 4: 10 };
      if (level < (tierUnlocks[t.tier] || 99)) return false;

      // Check building requirements are met
      for (const req of t.requirements) {
        if (!Buildings.hasBuilding(state, req)) return false;
      }

      // Check capacity
      const cap = Buildings.getTotalCapacity(state);
      if (cap < t.capacityRequired) return false;

      // Don't show if already active
      const alreadyActive = state.activeContracts.some(a => a.templateId === t.id);
      if (alreadyActive) return false;

      return true;
    });

    // Shuffle and pick
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(t => this.instantiate(t, state));
  },

  instantiate(template, state) {
    const revenueBonus = state.unlockedTechs.includes('composite_materials') ? 1.15 : 1.0;
    const durationMult = state.unlockedTechs.includes('digital_twin') ? 0.80 : 1.0;
    const marketMult = state.modifiers.revenueMult || 1.0;

    const payment = Math.floor(template.payment * revenueBonus * marketMult);
    const duration = Math.ceil(template.duration * durationMult);

    return {
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
      templateId: template.id,
      name: template.name,
      client: template.client,
      description: template.description,
      tier: template.tier,
      payment: payment,
      duration: duration,
      ticksRemaining: duration,
      risk: template.risk,
      penalty: Math.floor(template.penalty * marketMult),
      xpReward: template.xpReward,
      requirements: template.requirements,
      capacityRequired: template.capacityRequired,
      progress: 0,
      status: 'available', // available | active | completed | failed
    };
  },

  // Accept a contract
  accept(state, contractId) {
    const maxContracts = GAME_DATA.MAX_CONTRACTS_BY_LEVEL[state.level] || 1;
    if (state.activeContracts.length >= maxContracts) {
      return { ok: false, reason: `Max ${maxContracts} active contracts at your level` };
    }

    const idx = state.availableContracts.findIndex(c => c.id === contractId);
    if (idx === -1) return { ok: false, reason: 'Contract not found' };

    const contract = state.availableContracts.splice(idx, 1)[0];
    contract.status = 'active';
    contract.startTick = state.tick;
    state.activeContracts.push(contract);

    Game.addEvent(state, {
      type: 'success',
      message: `📋 Contract accepted: "${contract.name}" from ${contract.client}`,
    });

    return { ok: true };
  },

  // Progress contracts each tick
  tickContracts(state) {
    const capacity = Buildings.getTotalCapacity(state);
    const qualityBonus = Buildings.getQualityBonus(state);

    // Distribute capacity across active contracts
    const contractCount = state.activeContracts.length;
    if (contractCount === 0) return;

    const capacityPerContract = Math.floor(capacity / contractCount);

    const toComplete = [];
    const toFail = [];

    for (const contract of state.activeContracts) {
      // Progress based on capacity
      const progressGain = Math.max(1, (capacityPerContract / contract.capacityRequired) * 5);
      contract.progress = Math.min(100, contract.progress + progressGain);
      contract.ticksRemaining = Math.max(0, contract.ticksRemaining - 1);

      // Roll for NCR (Non-Conformance Report) — quality escape during production
      if (contract.progress < 95 && typeof Scrap !== 'undefined') {
        const ncr = Scrap.rollNCR(state, contract);
        if (ncr) {
          Scrap.applyNCR(state, contract, ncr);
        }
      }

      if (contract.progress >= 100) {
        toComplete.push(contract);
      } else if (contract.ticksRemaining <= 0 && contract.progress < 100) {
        // Check if quality bonus can save it
        const roll = Math.random();
        if (roll < qualityBonus) {
          contract.progress = 100;
          toComplete.push(contract);
        } else {
          toFail.push(contract);
        }
      }
    }

    for (const contract of toComplete) {
      this.complete(state, contract);
    }
    for (const contract of toFail) {
      this.fail(state, contract);
    }
  },

  complete(state, contract) {
    state.activeContracts = state.activeContracts.filter(c => c.id !== contract.id);
    contract.status = 'completed';

    // Revenue bonus from admin HQ level
    let revenueBonus = 1.0;
    const adminCell = this.findBuilding(state, 'admin_hq');
    if (adminCell) {
      revenueBonus += (adminCell.level - 1) * 0.10;
    }

    const grossPayment = Math.floor(contract.payment * revenueBonus);

    // First Article Inspection check (first time producing this tier)
    if (typeof Scrap !== 'undefined') {
      Scrap.rollFAI(state, contract);
    }

    // Deduct scrap costs — material wasted during production
    let scrapCost = 0;
    if (typeof Scrap !== 'undefined') {
      const result = Scrap.netRevenue(state, contract, grossPayment);
      scrapCost = result.scrapCost;
      state.scrap.totalScrapCost += scrapCost;
    }

    const earned = Math.max(0, grossPayment - scrapCost);
    state.cash += earned;
    state.stats.totalRevenue += earned;
    state.stats.contractsCompleted++;
    state.xp += contract.xpReward;

    // Reputation bump
    const repGain = Math.min(1, contract.tier * 0.25);
    state.reputation = Math.min(5, state.reputation + repGain);

    state.completedContracts.push({ ...contract, completedAt: state.tick, scrapCost, earned });

    const scrapStr = scrapCost > 0 ? ` (−$${Utils.formatMoney(scrapCost)} scrap)` : '';
    Game.addEvent(state, {
      type: 'success',
      message: `✅ "${contract.name}" complete! Earned $${Utils.formatMoney(earned)}${scrapStr}`,
    });
  },

  fail(state, contract) {
    state.activeContracts = state.activeContracts.filter(c => c.id !== contract.id);
    contract.status = 'failed';

    state.cash -= contract.penalty;
    state.stats.contractsFailed++;
    state.reputation = Math.max(0, state.reputation - 0.5);

    Game.addEvent(state, {
      type: 'danger',
      message: `❌ "${contract.name}" FAILED! Penalty: $${Utils.formatMoney(contract.penalty)}`,
    });
  },

  findBuilding(state, buildingId) {
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (cell && cell.id === buildingId) return cell;
      }
    }
    return null;
  },

  getTierName(tier) {
    return ['', 'Startup', 'Growth', 'Established', 'OEM'][tier] || 'Unknown';
  },

  getRiskColor(risk) {
    return { low: '#00b894', medium: '#f0a500', high: '#d63031' }[risk] || '#aaa';
  },

  getTierColor(tier) {
    return { 1: '#74b9ff', 2: '#00cec9', 3: '#a29bfe', 4: '#fd79a8' }[tier] || '#aaa';
  },
};
