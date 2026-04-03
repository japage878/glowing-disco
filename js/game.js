// AeroForge - Core Game Engine

const Utils = {
  formatMoney(n) {
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toFixed(0);
  },

  formatMoneyFull(n) {
    return '$' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  }
};

const Game = {
  state: null,
  tickTimer: null,
  saveTimer: null,
  isRunning: false,

  createNewState() {
    const grid = [];
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      grid.push(new Array(GAME_DATA.GRID_COLS).fill(null));
    }

    return {
      version: 4,
      tick: 0,
      cash: GAME_DATA.START_CASH,
      xp: 0,
      level: 1,
      reputation: 1.0,
      companyName: 'AeroForge Industries',
      grid: grid,
      activeContracts: [],
      availableContracts: [],
      completedContracts: [],
      activeEvents: [],
      eventLog: [],
      recentEventCategories: [],
      unlockedTechs: [],
      researchPoints: 0,
      nextEventTick: GAME_DATA.EVENT_MIN_TICKS + Math.floor(Math.random() * (GAME_DATA.EVENT_MAX_TICKS - GAME_DATA.EVENT_MIN_TICKS)),
      nextContractRefresh: 0,
      modifiers: {
        revenueMult: 1.0,
        upkeepMult: 1.0,
        productionMult: 1.0,
        researchMult: 1.0,
        contractPoolMult: 1.0,
      },
      banking: {
        loans: [],
        creditScore: 680,
        totalBorrowed: 0,
        interestPaid: 0,
      },
      scrap: {
        scrapRateMult: 1.0,
        totalScrapCost: 0,
        ncrCount: 0,
        totalReworkCost: 0,
        completedFAI: [],
      },
      stats: {
        totalRevenue: 0,
        totalSpent: 0,
        contractsCompleted: 0,
        contractsFailed: 0,
        totalUpkeepPaid: 0,
        peakCash: GAME_DATA.START_CASH,
        weeksPlayed: 0,
      },
      ui: {
        selectedBuildingId: null,
        modalOpen: false,
        modalRow: -1,
        modalCol: -1,
      },
      gameOver: false,
      won: false,
    };
  },

  init() {
    const saved = this.load();
    if (saved) {
      this.state = saved;
      // Migrate old saves
      if (!this.state.version || this.state.version < 4) {
        this.state = this.createNewState();
        this.addEvent(this.state, { type: 'neutral', message: '🔄 Save updated to v4 (banking + scrap systems added) — new game started.' });
      }
    } else {
      this.state = this.createNewState();
      this.addEvent(this.state, { type: 'neutral', message: '🚀 Welcome to AeroForge! Build your Admin HQ to get started.' });
    }

    // Ensure contract pool is populated
    if (this.state.availableContracts.length === 0) {
      this.refreshContractPool();
    }

    UI.init(this.state);
    UI.render(this.state);
    this.start();
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.tickTimer = setInterval(() => {
      if (!this.state.gameOver) {
        this.tick();
      }
    }, GAME_DATA.TICK_INTERVAL_MS);

    this.saveTimer = setInterval(() => {
      this.save();
    }, 30000);
  },

  stop() {
    clearInterval(this.tickTimer);
    clearInterval(this.saveTimer);
    this.isRunning = false;
  },

  tick() {
    const state = this.state;
    state.tick++;
    state.stats.weeksPlayed++;

    // Research points
    const researchRate = Buildings.getResearchRate(state);
    if (researchRate > 0) {
      state.researchPoints += researchRate * (state.modifiers.researchMult || 1);
    }

    // Pay upkeep + loan payments every month (4 ticks)
    if (state.tick % GAME_DATA.TICKS_PER_MONTH === 0) {
      const upkeep = Buildings.getTotalUpkeep(state);
      if (upkeep > 0) {
        state.cash -= upkeep;
        state.stats.totalUpkeepPaid += upkeep;
      }
      Banking.processPayments(state);
    }

    // Contract progress
    Contracts.tickContracts(state);

    // Event tick
    Events.tickEvents(state);

    // Roll for new event
    if (state.tick >= state.nextEventTick) {
      const event = Events.rollEvent(state);
      if (event) {
        Events.applyEvent(state, event);
      }
      state.nextEventTick = state.tick + GAME_DATA.EVENT_MIN_TICKS + Math.floor(Math.random() * (GAME_DATA.EVENT_MAX_TICKS - GAME_DATA.EVENT_MIN_TICKS));
    }

    // Refresh contract pool
    if (state.tick >= state.nextContractRefresh) {
      this.refreshContractPool();
      state.nextContractRefresh = state.tick + GAME_DATA.CONTRACT_REFRESH_TICKS;
    }

    // Level up check
    this.checkLevelUp(state);

    // Update peak cash
    if (state.cash > state.stats.peakCash) {
      state.stats.peakCash = state.cash;
    }

    // Bankruptcy check
    if (state.cash < 0) {
      this.gameOver(false);
      return;
    }

    // Win check
    if (state.level >= 15 && state.cash >= 50000000) {
      this.gameOver(true);
      return;
    }

    UI.render(state);
  },

  refreshContractPool() {
    const state = this.state;
    const poolSize = Math.floor(GAME_DATA.CONTRACT_POOL_SIZE * (state.modifiers.contractPoolMult || 1));
    state.availableContracts = Contracts.generatePool(state, Math.max(2, poolSize));
  },

  checkLevelUp(state) {
    const currentLevel = state.level;
    if (currentLevel >= 15) return;

    const nextLevelXP = GAME_DATA.LEVEL_XP[currentLevel]; // index = level requirement
    if (state.xp >= nextLevelXP) {
      state.level++;
      const title = GAME_DATA.LEVEL_TITLES[state.level];
      this.addEvent(state, {
        type: 'success',
        message: `🎉 LEVEL UP! Level ${state.level} - ${title}! New contracts and grid space unlocked.`,
      });
      // Refresh contracts immediately on level up
      this.refreshContractPool();
    }
  },

  getGridSize(state) {
    // Grid grows with level
    const level = state.level;
    let gridW, gridH;
    if (level <= 2) { gridW = 6; gridH = 4; }
    else if (level <= 4) { gridW = 8; gridH = 5; }
    else if (level <= 6) { gridW = 10; gridH = 6; }
    else if (level <= 8) { gridW = 12; gridH = 7; }
    else { gridW = 12; gridH = 8; }
    return { gridW, gridH };
  },

  addEvent(state, event) {
    const log = state.eventLog;
    log.unshift({
      ...event,
      tick: state.tick,
      timestamp: Date.now(),
    });
    // Keep last 50 events
    if (log.length > 50) log.pop();
  },

  getDate(state) {
    const weeksElapsed = state.tick;
    const totalDays = weeksElapsed * 7;
    const year = GAME_DATA.START_YEAR + Math.floor(totalDays / 365);
    const dayOfYear = totalDays % 365;
    const month = Math.floor(dayOfYear / 30) + 1;
    const quarter = Math.ceil(Math.min(month, 12) / 3);
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return {
      year,
      month: Math.min(month, 12),
      monthName: monthNames[Math.min(month, 12) - 1],
      quarter,
    };
  },

  researchTech(techId) {
    const state = this.state;
    const tech = GAME_DATA.TECHS[techId];
    if (!tech) return { ok: false, reason: 'Unknown tech' };
    if (state.unlockedTechs.includes(techId)) return { ok: false, reason: 'Already researched' };
    if (state.researchPoints < tech.cost) return { ok: false, reason: `Need ${tech.cost} research points` };

    state.researchPoints -= tech.cost;
    state.unlockedTechs.push(techId);
    state.xp += 50;

    this.addEvent(state, {
      type: 'success',
      message: `🧪 Technology unlocked: ${tech.name}`,
    });

    return { ok: true };
  },

  renameCompany(newName) {
    if (!newName || newName.trim().length === 0) return;
    this.state.companyName = newName.trim().substring(0, 40);
    UI.render(this.state);
  },

  gameOver(won) {
    const state = this.state;
    state.gameOver = true;
    state.won = won;
    this.stop();
    this.save();
    UI.showGameOver(state, won);
  },

  save() {
    try {
      const saveData = JSON.stringify(this.state);
      localStorage.setItem('aeroforge_save', saveData);
    } catch (e) {
      console.warn('Save failed:', e);
    }
  },

  load() {
    try {
      const data = localStorage.getItem('aeroforge_save');
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  },

  deleteSave() {
    localStorage.removeItem('aeroforge_save');
    this.stop();
    this.state = this.createNewState();
    Events.firedOneTimeEvents = [];
    this.addEvent(this.state, { type: 'neutral', message: '🚀 New game started! Build your Admin HQ first.' });
    this.refreshContractPool();
    UI.init(this.state);
    UI.render(this.state);
    this.start();
  },
};

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
