// AeroForge - Random Events System

const Events = {
  // Event templates
  TEMPLATES: [
    // === MARKET EVENTS ===
    {
      id: 'boeing_797',
      category: 'market',
      type: 'positive',
      title: 'New Aircraft Program Announced',
      message: '✈️ Boeing announces new 797 program! Aerospace demand surges +30% for 8 weeks.',
      duration: 8,
      effect: { revenueMult: 1.30 },
      minLevel: 1,
    },
    {
      id: 'defense_budget_cut',
      category: 'market',
      type: 'negative',
      title: 'Defense Budget Cuts',
      message: '📉 Congress passes defense budget cuts. Military contract revenue -20% for 10 weeks.',
      duration: 10,
      effect: { revenueMult: 0.80 },
      minLevel: 3,
    },
    {
      id: 'airline_boom',
      category: 'market',
      type: 'positive',
      title: 'Airline Travel Boom',
      message: '🌍 Post-pandemic travel surges. Commercial contracts +25% value for 12 weeks.',
      duration: 12,
      effect: { revenueMult: 1.25 },
      minLevel: 2,
    },
    {
      id: 'recession_fear',
      category: 'market',
      type: 'negative',
      title: 'Economic Uncertainty',
      message: '📊 Markets signal slowdown. Contract payments reduced -15% for 8 weeks.',
      duration: 8,
      effect: { revenueMult: 0.85 },
      minLevel: 1,
    },
    {
      id: 'military_buildup',
      category: 'market',
      type: 'positive',
      title: 'Defense Spending Increase',
      message: '🎖️ NATO allies increase defense spending. Military contracts +35% for 10 weeks.',
      duration: 10,
      effect: { revenueMult: 1.35 },
      minLevel: 5,
    },
    {
      id: 'space_race',
      category: 'market',
      type: 'positive',
      title: 'Private Space Race',
      message: '🚀 SpaceX and Blue Origin push demand for precision aerospace parts. Revenue +20%.',
      duration: 9,
      effect: { revenueMult: 1.20 },
      minLevel: 4,
    },

    // === SUPPLY CHAIN EVENTS ===
    {
      id: 'titanium_shortage',
      category: 'supply_chain',
      type: 'negative',
      title: 'Titanium Shortage',
      message: '⛏️ Global titanium shortage hits aerospace. Upkeep costs +20% for 8 weeks.',
      duration: 8,
      effect: { upkeepMult: 1.20 },
      minLevel: 1,
    },
    {
      id: 'aluminum_deal',
      category: 'supply_chain',
      type: 'positive',
      title: 'New Aluminum Supplier',
      message: '🏗️ Secured new aluminum contract with Canadian supplier. Upkeep costs -15% for 10 weeks.',
      duration: 10,
      effect: { upkeepMult: 0.85 },
      minLevel: 2,
    },
    {
      id: 'supply_disruption',
      category: 'supply_chain',
      type: 'negative',
      title: 'Supply Chain Disruption',
      message: '🚢 Port congestion delays materials. Production capacity -20% for 6 weeks.',
      duration: 6,
      effect: { productionMult: 0.80 },
      minLevel: 1,
    },
    {
      id: 'composite_breakthrough',
      category: 'supply_chain',
      type: 'positive',
      title: 'Composite Material Breakthrough',
      message: '🔬 New composite supplier offers better materials. Production capacity +15% for 10 weeks.',
      duration: 10,
      effect: { productionMult: 1.15 },
      minLevel: 3,
    },
    {
      id: 'fuel_price_spike',
      category: 'supply_chain',
      type: 'negative',
      title: 'Energy Price Spike',
      message: '⚡ Energy costs surge. All facility upkeep +25% for 6 weeks.',
      duration: 6,
      effect: { upkeepMult: 1.25 },
      minLevel: 1,
    },
    {
      id: 'just_in_time',
      category: 'supply_chain',
      type: 'positive',
      title: 'JIT Delivery Contract',
      message: '📦 New JIT logistics partner secured. Upkeep -10%, production +10% for 12 weeks.',
      duration: 12,
      effect: { upkeepMult: 0.90, productionMult: 1.10 },
      minLevel: 4,
    },

    // === WORKFORCE EVENTS ===
    {
      id: 'engineer_pool',
      category: 'workforce',
      type: 'positive',
      title: 'Engineering Graduate Pool',
      message: '🎓 Top aerospace graduates on the market. Production efficiency +15% for 8 weeks.',
      duration: 8,
      effect: { productionMult: 1.15 },
      minLevel: 1,
    },
    {
      id: 'labor_strike',
      category: 'workforce',
      type: 'negative',
      title: 'Labor Strike',
      message: '✊ Workers walk out over wages. Production capacity -35% for 5 weeks.',
      duration: 5,
      effect: { productionMult: 0.65 },
      minLevel: 3,
      oneTime: false,
    },
    {
      id: 'poaching',
      category: 'workforce',
      type: 'negative',
      title: 'Key Engineer Poached',
      message: '😤 RivalCorp poached your senior engineer. Upkeep +10% for 6 weeks.',
      duration: 6,
      effect: { upkeepMult: 1.10 },
      minLevel: 2,
    },
    {
      id: 'veteran_hire',
      category: 'workforce',
      type: 'positive',
      title: 'Veteran Aerospace Expert Joins',
      message: '👨‍✈️ Retired NASA engineer joins your team. Research rate +50% for 10 weeks.',
      duration: 10,
      effect: { researchMult: 1.50 },
      minLevel: 5,
    },

    // === REGULATORY EVENTS ===
    {
      id: 'faa_audit',
      category: 'regulatory',
      type: 'negative',
      title: 'FAA Surprise Audit',
      message: '📋 FAA conducting unannounced audit. One-time compliance cost: $50,000.',
      duration: 1,
      effect: { cashLoss: 50000 },
      minLevel: 2,
    },
    {
      id: 'as9100_cert',
      category: 'regulatory',
      type: 'positive',
      title: 'AS9100 Certification Achieved',
      message: '🏆 Your facility achieved AS9100 Rev D certification! Contract revenue +10% permanently.',
      duration: 9999,
      effect: { revenueMult: 1.10, permanentRevenue: true },
      minLevel: 5,
      oneTime: true,
    },
    {
      id: 'easa_approval',
      category: 'regulatory',
      type: 'positive',
      title: 'EASA Part 21 Approval',
      message: '🌐 European Aviation Safety Agency approval received. Opens EU markets.',
      duration: 9999,
      effect: { revenueMult: 1.08, permanent: true },
      minLevel: 7,
      oneTime: true,
    },
    {
      id: 'safety_violation',
      category: 'regulatory',
      type: 'negative',
      title: 'Safety Violation Fine',
      message: '⚠️ OSHA safety citation issued. One-time fine: $75,000.',
      duration: 1,
      effect: { cashLoss: 75000 },
      minLevel: 3,
    },
    {
      id: 'env_regulation',
      category: 'regulatory',
      type: 'negative',
      title: 'New Environmental Regs',
      message: '🌿 New EPA regulations increase compliance costs. Upkeep +8% ongoing for 15 weeks.',
      duration: 15,
      effect: { upkeepMult: 1.08 },
      minLevel: 4,
    },

    // === COMPETITOR EVENTS ===
    {
      id: 'rival_bankrupt',
      category: 'competitor',
      type: 'positive',
      title: 'Competitor Goes Bankrupt',
      message: '💀 RivalCorp files Chapter 11! Their contracts are up for grabs. +25% revenue for 8 weeks.',
      duration: 8,
      effect: { revenueMult: 1.25 },
      minLevel: 3,
    },
    {
      id: 'rival_wins_bid',
      category: 'competitor',
      type: 'negative',
      title: 'Lost Major Bid',
      message: '😤 AeroCorp underbid you on a major contract. Contract pool reduced for 6 weeks.',
      duration: 6,
      effect: { contractPoolMult: 0.7 },
      minLevel: 2,
    },
    {
      id: 'partnership_offer',
      category: 'competitor',
      type: 'positive',
      title: 'Partnership Opportunity',
      message: '🤝 Boeing Tier 1 supplier offers teaming agreement. Revenue +15% for 10 weeks.',
      duration: 10,
      effect: { revenueMult: 1.15 },
      minLevel: 6,
    },
    {
      id: 'acquisition_attempt',
      category: 'competitor',
      type: 'positive',
      title: 'Acquisition Interest',
      message: '💼 Lockheed Martin expresses acquisition interest. Boosts company valuation and morale.',
      duration: 5,
      effect: { productionMult: 1.10 },
      minLevel: 8,
    },

    // === GEOPOLITICAL EVENTS ===
    {
      id: 'export_restrictions',
      category: 'geopolitical',
      type: 'negative',
      title: 'Export Restrictions',
      message: '🚫 ITAR export restrictions tighten. International contracts -20% for 8 weeks.',
      duration: 8,
      effect: { revenueMult: 0.82 },
      minLevel: 5,
    },
    {
      id: 'trade_deal',
      category: 'geopolitical',
      type: 'positive',
      title: 'New Trade Agreement',
      message: '🌐 US-EU trade deal opens aerospace markets. Revenue +20% for 12 weeks.',
      duration: 12,
      effect: { revenueMult: 1.20 },
      minLevel: 4,
    },
    {
      id: 'tariff_war',
      category: 'geopolitical',
      type: 'negative',
      title: 'Steel Tariff Increase',
      message: '🏗️ 25% steel tariff announced. Material upkeep costs +18% for 10 weeks.',
      duration: 10,
      effect: { upkeepMult: 1.18 },
      minLevel: 2,
    },
    {
      id: 'nasa_contract',
      category: 'geopolitical',
      type: 'positive',
      title: 'NASA Selects Your Facility',
      message: '🚀 NASA selects your facility for government research work. +40% revenue for 6 weeks.',
      duration: 6,
      effect: { revenueMult: 1.40 },
      minLevel: 8,
    },

    // === BANKING & FINANCE EVENTS ===
    {
      id: 'fed_rate_hike',
      category: 'banking',
      type: 'negative',
      title: 'Fed Raises Interest Rates',
      message: '🏛️ Federal Reserve hikes rates +0.5%. Variable loan costs rise. Upkeep +8% for 12 weeks. 📚 The Fed funds rate is the benchmark for all business lending. When it rises, Prime Rate rises with it, increasing costs on revolving credit lines.',
      duration: 12,
      effect: { upkeepMult: 1.08, loanRateDelta: 0.005 },
      minLevel: 1,
    },
    {
      id: 'fed_rate_cut',
      category: 'banking',
      type: 'positive',
      title: 'Fed Cuts Interest Rates',
      message: '🏛️ Federal Reserve cuts rates -0.25%. Borrowing cheaper, upkeep -5% for 16 weeks. 📚 Rate cuts stimulate capital investment. Aerospace manufacturers often time major equipment purchases to coincide with low-rate environments.',
      duration: 16,
      effect: { upkeepMult: 0.95, loanRateDelta: -0.0025 },
      minLevel: 1,
    },
    {
      id: 'credit_crunch',
      category: 'banking',
      type: 'negative',
      title: 'Credit Market Tightening',
      message: '💳 Banks tightening lending standards — loan approvals harder. Upkeep +12% for 8 weeks. 📚 During credit crunches (like 2008-09), even creditworthy manufacturers struggle. Aerospace is particularly vulnerable because capital requirements are enormous.',
      duration: 8,
      effect: { upkeepMult: 1.12 },
      minLevel: 2,
    },
    {
      id: 'bank_line_offered',
      category: 'banking',
      type: 'positive',
      title: 'Bank Offers Credit Line',
      message: '🏦 Your bank proactively increases your credit limit. Revenue +5% for 10 weeks (improved cash flow flexibility). 📚 Banks review commercial accounts quarterly. A company with improving cash flows and a clean payment history often receives unsolicited credit line increases.',
      duration: 10,
      effect: { revenueMult: 1.05 },
      minLevel: 3,
    },
    {
      id: 'inflation_surge',
      category: 'banking',
      type: 'negative',
      title: 'Inflation Spike — Materials Cost More',
      message: '📈 CPI hits 7%. Raw material, energy, and labor costs surge. Upkeep +18% for 14 weeks. 📚 Aerospace contracts often have Price Escalation Clauses (PEC) tied to indices like PPI Metals. Without one, inflation eats directly into your margins.',
      duration: 14,
      effect: { upkeepMult: 1.18 },
      minLevel: 1,
    },
    {
      id: 'bonding_capacity',
      category: 'banking',
      type: 'positive',
      title: 'Surety Bond Capacity Upgraded',
      message: '📜 Surety company increases your bonding capacity — unlocks larger government contracts. Revenue +12% for 10 weeks. 📚 Performance and payment bonds (surety bonds) are required on many government contracts over $150K. Your bonding capacity limits the size of government work you can bid.',
      duration: 10,
      effect: { revenueMult: 1.12 },
      minLevel: 5,
    },

    // === TECHNICAL FAILURE EVENTS ===
    {
      id: 'cmm_breakdown',
      category: 'technical',
      type: 'negative',
      title: 'CMM Machine Breakdown',
      message: '📏 Coordinate Measuring Machine failure — inspection halted! Production -20% for 5 weeks. 📚 CMMs (Coordinate Measuring Machines) measure parts to thousandths of an inch. Without one, you can\'t prove parts meet drawing tolerances. Calibration and maintenance are critical.',
      duration: 5,
      effect: { productionMult: 0.80 },
      minLevel: 2,
    },
    {
      id: 'heat_treat_failure',
      category: 'technical',
      type: 'negative',
      title: 'Heat Treat Furnace Malfunction',
      message: '🔥 Heat treat furnace controller failed mid-cycle — entire batch scrapped! One-time loss: $65,000. 📚 Heat treatment (annealing, quenching, aging) transforms metal microstructure. A runaway furnace can over- or under-temper an entire batch, making all parts non-conforming.',
      duration: 1,
      effect: { cashLoss: 65000 },
      minLevel: 3,
    },
    {
      id: 'cnc_crash',
      category: 'technical',
      type: 'negative',
      title: 'CNC Machine Crash',
      message: '⚙️ Programming error caused tool crash on 5-axis mill — spindle damage. Production -30% for 6 weeks. 📚 CNC crashes happen when tool paths intersect the workpiece or fixture unexpectedly. A spindle rebuild can cost $50K+. Simulation software (CAM verification) prevents most crashes.',
      duration: 6,
      effect: { productionMult: 0.70 },
      minLevel: 2,
    },
    {
      id: 'power_outage',
      category: 'technical',
      type: 'negative',
      title: 'Factory Power Outage',
      message: '⚡ Grid failure knocked out production for 3 days. Production -15% for 3 weeks. 📚 Aerospace facilities often require 99.9% uptime on critical systems. UPS (Uninterruptible Power Supplies) and backup generators protect CNC programs, furnace cycles, and clean room environments.',
      duration: 3,
      effect: { productionMult: 0.85 },
      minLevel: 1,
    },
    {
      id: 'ndt_equipment_upgrade',
      category: 'technical',
      type: 'positive',
      title: 'New NDT Equipment Installed',
      message: '🔍 Phased Array Ultrasonic Testing (PAUT) system installed. Quality bonus +15% for 12 weeks. 📚 PAUT uses multiple ultrasonic beams to image internal defects with far higher resolution than conventional UT. It\'s become the standard for weld inspection on safety-critical aerospace structures.',
      duration: 12,
      effect: { productionMult: 1.08, revenueMult: 1.07 },
      minLevel: 4,
    },

    // === SCRAP & QUALITY EVENTS ===
    {
      id: 'material_batch_rejection',
      category: 'quality',
      type: 'negative',
      title: 'Incoming Material Batch Rejected',
      message: '🚫 Spectrometric analysis of titanium batch shows wrong alloy grade — 2 tons quarantined. One-time loss: $45,000. 📚 Aerospace alloys (Ti-6Al-4V, 7075-T6, Inconel 718) are tightly specified. Receiving inspection with PMI (Positive Material Identification) guns catches substitutions before they become escapes.',
      duration: 1,
      effect: { cashLoss: 45000 },
      minLevel: 2,
    },
    {
      id: 'nadcap_audit',
      category: 'quality',
      type: 'negative',
      title: 'NADCAP Audit Scheduled',
      message: '📋 National Aerospace and Defense Contractors Accreditation Program audit in 4 weeks. Compliance prep cost: $30,000. 📚 NADCAP accreditation is required for special processes: heat treating, NDT, welding, coatings. Boeing and Airbus mandate NADCAP approval for suppliers. Without it, you can\'t win Tier 1 contracts.',
      duration: 1,
      effect: { cashLoss: 30000 },
      minLevel: 4,
    },
    {
      id: 'nadcap_approved',
      category: 'quality',
      type: 'positive',
      title: 'NADCAP Accreditation Achieved!',
      message: '🏆 Your facility earned NADCAP accreditation for Special Processes. Revenue +15% permanently! 📚 NADCAP approval opens Boeing, Airbus, and Lockheed supply chains. It signals your special processes (heat treat, NDT, welding) meet the highest industry standards.',
      duration: 9999,
      effect: { revenueMult: 1.15, permanent: true },
      minLevel: 5,
      oneTime: true,
    },
    {
      id: 'customer_escape',
      category: 'quality',
      type: 'negative',
      title: 'Customer Escape — Defect Found at Assembly',
      message: '😱 Your part caused a line-stoppage at the customer\'s facility. Penalty + containment cost: $80,000. Reputation -0.5. 📚 A "customer escape" is a defect that passes your inspection and reaches the customer. These are the most expensive quality failures — triggering containment actions, 8D corrective actions, and sometimes loss of business.',
      duration: 1,
      effect: { cashLoss: 80000, reputationHit: 0.5 },
      minLevel: 2,
    },
    {
      id: 'quality_award',
      category: 'quality',
      type: 'positive',
      title: 'Supplier Quality Award',
      message: '🥇 Boeing Supplier Excellence Award received! Reputation +1, Revenue +10% for 12 weeks. 📚 OEMs issue annual supplier awards to top-performing companies. These awards are marketing gold — they signal to other OEMs that your quality systems are validated at the highest level.',
      duration: 12,
      effect: { revenueMult: 1.10, reputationGain: 1.0 },
      minLevel: 6,
      oneTime: false,
    },
    {
      id: 'scrap_spike',
      category: 'quality',
      type: 'negative',
      title: 'Scrap Rate Spike — Process Drift',
      message: '⚠️ Machine tool wear causing scrap rate increase. Costs +20% for 6 weeks. 📚 "Process drift" occurs as cutting tools wear, fixtures loosen, or coolant systems degrade. Statistical Process Control (SPC) charts catch drift before it becomes non-conformance — but only if someone reads them.',
      duration: 6,
      effect: { upkeepMult: 1.20, scrapRateMult: 1.35 },
      minLevel: 1,
    },
    {
      id: 'lean_kaizen',
      category: 'quality',
      type: 'positive',
      title: 'Lean Kaizen Event Completed',
      message: '🔄 Week-long Kaizen event reduced cycle time 22%. Production +12% for 10 weeks. 📚 A Kaizen event (from Japanese: "continuous improvement") brings the production team together to eliminate waste (muda). Value stream mapping identifies bottlenecks. LEAN pioneers like Toyota and GE Aviation have cut costs 30–50% this way.',
      duration: 10,
      effect: { productionMult: 1.12 },
      minLevel: 3,
    },

    // === INDUSTRY / CERTIFICATION EVENTS ===
    {
      id: 'airworthiness_directive',
      category: 'regulatory',
      type: 'negative',
      title: 'FAA Airworthiness Directive Issued',
      message: '✈️ FAA AD requires retrofit modification on 200 previously delivered parts. Compliance cost: $55,000. 📚 An Airworthiness Directive (AD) is a mandatory FAA order when an unsafe condition is found. If your parts are affected, you foot the bill for inspections and retrofits — even on parts already delivered and accepted.',
      duration: 1,
      effect: { cashLoss: 55000 },
      minLevel: 3,
    },
    {
      id: 'dfars_compliance',
      category: 'regulatory',
      type: 'negative',
      title: 'DFARS Cybersecurity Requirement',
      message: '🔐 DoD DFARS clause 252.204-7012 (CMMC Level 2) compliance audit required. Cost: $40,000. 📚 DFARS (Defense Federal Acquisition Regulation Supplement) mandates cybersecurity standards for defense suppliers. CMMC (Cybersecurity Maturity Model Certification) is now required to bid on Pentagon contracts — a costly but mandatory investment.',
      duration: 1,
      effect: { cashLoss: 40000 },
      minLevel: 5,
    },
    {
      id: 'production_approval',
      category: 'regulatory',
      type: 'positive',
      title: 'FAA Production Approval Holder Status',
      message: '✅ FAA grants Production Approval Holder (PAH) status. Unlocks certified part manufacturing. Revenue +20% for 15 weeks. 📚 A PAH certificate (Part 21 Subpart G) authorizes manufacture of FAA-approved designs. Without it, you can only produce under a customer\'s approval. With it, you can produce and sell PMA (Parts Manufacturer Approval) parts independently.',
      duration: 15,
      effect: { revenueMult: 1.20 },
      minLevel: 7,
      oneTime: true,
    },
    {
      id: 'itar_violation',
      category: 'regulatory',
      type: 'negative',
      title: 'ITAR Compliance Violation',
      message: '🚫 State Department audit found ITAR (International Traffic in Arms) record-keeping gap. Fine: $120,000. 📚 ITAR controls export of defense articles and technology. Violations carry criminal penalties up to $1M and 20 years per violation. Every foreign national with access to ITAR-controlled drawings must be tracked.',
      duration: 1,
      effect: { cashLoss: 120000 },
      minLevel: 5,
    },

    // === SUPPLY CHAIN (ADDITIONAL) ===
    {
      id: 'nickel_shortage',
      category: 'supply_chain',
      type: 'negative',
      title: 'Nickel Superalloy Shortage',
      message: '⛏️ Inconel 718 and Hastelloy X lead times jumped to 52 weeks. Upkeep +22% for 10 weeks. 📚 Superalloys (Inconel, Waspaloy, Hastelloy) are critical for hot section engine parts. They\'re produced by a handful of mills globally. Supply shocks like Russian sanctions or COVID disrupted these supply chains severely in 2021–22.',
      duration: 10,
      effect: { upkeepMult: 1.22 },
      minLevel: 4,
    },
    {
      id: 'supply_chain_finance',
      category: 'supply_chain',
      type: 'positive',
      title: 'Supply Chain Finance Program',
      message: '💰 Large OEM customer offers supply chain finance — early payment at 0.5% discount. Cash flow +10% for 12 weeks. 📚 SCF (Supply Chain Finance / Reverse Factoring) lets suppliers get paid in days instead of 90 days, at a small discount the OEM subsidizes. Boeing and Airbus run large SCF programs that help Tier 2/3 suppliers survive.',
      duration: 12,
      effect: { revenueMult: 1.10 },
      minLevel: 4,
    },
  ],

  // Tracks which one-time events have fired
  firedOneTimeEvents: [],

  // Roll for a random event
  rollEvent(state) {
    const eligible = this.TEMPLATES.filter(t => {
      if (t.minLevel > state.level) return false;
      if (t.oneTime && this.firedOneTimeEvents.includes(t.id)) return false;
      // Don't fire same category twice in 20 ticks
      const recentCategories = state.recentEventCategories || [];
      if (recentCategories.includes(t.category)) return false;
      return true;
    });

    if (eligible.length === 0) return null;

    const picked = eligible[Math.floor(Math.random() * eligible.length)];
    return this.instantiate(picked, state);
  },

  instantiate(template, state) {
    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
      templateId: template.id,
      category: template.category,
      type: template.type,
      title: template.title,
      message: template.message,
      duration: template.duration,
      ticksRemaining: template.duration,
      effect: { ...template.effect },
      startTick: state.tick,
      oneTime: !!template.oneTime,
    };
  },

  // Apply event effects to modifiers
  applyEvent(state, event) {
    if (event.oneTime) {
      this.firedOneTimeEvents.push(event.templateId);
    }

    // Track recent categories
    if (!state.recentEventCategories) state.recentEventCategories = [];
    state.recentEventCategories.push(event.category);
    if (state.recentEventCategories.length > 3) state.recentEventCategories.shift();

    // Apply immediate cash effects
    if (event.effect.cashLoss) {
      state.cash -= event.effect.cashLoss;
    }

    // Immediate reputation effects
    if (event.effect.reputationHit) {
      state.reputation = Math.max(0, state.reputation - event.effect.reputationHit);
    }
    if (event.effect.reputationGain) {
      state.reputation = Math.min(5, state.reputation + event.effect.reputationGain);
    }

    // Banking: loan rate changes
    if (event.effect.loanRateDelta && typeof Banking !== 'undefined') {
      Banking.applyRateChange(state, event.effect.loanRateDelta);
    }

    // Add to active events (for duration effects)
    if (event.duration > 1) {
      state.activeEvents.push(event);
    }

    // Recalculate modifiers
    this.recalculateModifiers(state);

    // Toast
    Game.addEvent(state, {
      type: event.type === 'positive' ? 'success' : event.type === 'negative' ? 'danger' : 'neutral',
      message: event.message,
      isEvent: true,
    });
  },

  // Tick active events (decrement duration, remove expired)
  tickEvents(state) {
    const expired = [];
    for (const ev of state.activeEvents) {
      ev.ticksRemaining--;
      if (ev.ticksRemaining <= 0) {
        expired.push(ev);
      }
    }
    if (expired.length > 0) {
      state.activeEvents = state.activeEvents.filter(e => e.ticksRemaining > 0);
      this.recalculateModifiers(state);
      for (const ev of expired) {
        Game.addEvent(state, {
          type: 'neutral',
          message: `📋 Event ended: "${ev.title}"`,
        });
      }
    }
  },

  // Recompute modifier stack from active events
  recalculateModifiers(state) {
    let revenueMult = 1.0;
    let upkeepMult = 1.0;
    let productionMult = 1.0;
    let researchMult = 1.0;
    let contractPoolMult = 1.0;
    let scrapRateMult = 1.0;

    for (const ev of state.activeEvents) {
      if (ev.effect.revenueMult)      revenueMult      *= ev.effect.revenueMult;
      if (ev.effect.upkeepMult)       upkeepMult       *= ev.effect.upkeepMult;
      if (ev.effect.productionMult)   productionMult   *= ev.effect.productionMult;
      if (ev.effect.researchMult)     researchMult     *= ev.effect.researchMult;
      if (ev.effect.contractPoolMult) contractPoolMult *= ev.effect.contractPoolMult;
      if (ev.effect.scrapRateMult)    scrapRateMult    *= ev.effect.scrapRateMult;
    }

    state.modifiers = { revenueMult, upkeepMult, productionMult, researchMult, contractPoolMult };

    // Scrap multiplier lives on state.scrap so Scrap module can access it
    if (state.scrap) state.scrap.scrapRateMult = scrapRateMult;
  },
};
