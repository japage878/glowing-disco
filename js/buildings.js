// AeroForge - Building Logic

const Buildings = {
  // Get all building definitions
  getAll() {
    return GAME_DATA.BUILDINGS;
  },

  getById(id) {
    return GAME_DATA.BUILDINGS[id] || null;
  },

  // Count buildings of a specific type on the grid
  countOnGrid(state, buildingId) {
    let count = 0;
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (cell && cell.id === buildingId) count++;
      }
    }
    return count;
  },

  // Check if a building can be placed
  canPlace(state, buildingId) {
    const def = this.getById(buildingId);
    if (!def) return { ok: false, reason: 'Unknown building' };

    // Check admin HQ first
    if (buildingId !== 'admin_hq' && !this.hasBuilding(state, 'admin_hq')) {
      return { ok: false, reason: 'Admin HQ required first' };
    }

    // Check requirements
    for (const req of def.requires) {
      if (!this.hasBuilding(state, req)) {
        const reqDef = this.getById(req);
        return { ok: false, reason: `Requires ${reqDef ? reqDef.name : req}` };
      }
    }

    // Check max count
    const current = this.countOnGrid(state, buildingId);
    if (current >= def.maxCount) {
      return { ok: false, reason: `Max ${def.maxCount} allowed` };
    }

    // Check cash
    if (state.cash < def.cost) {
      return { ok: false, reason: `Need $${Utils.formatMoney(def.cost)}` };
    }

    return { ok: true };
  },

  hasBuilding(state, buildingId) {
    return this.countOnGrid(state, buildingId) > 0;
  },

  // Place a building on the grid
  place(state, buildingId, row, col) {
    const check = this.canPlace(state, buildingId);
    if (!check.ok) return { ok: false, reason: check.reason };

    const cell = state.grid[row][col];
    if (cell !== null) return { ok: false, reason: 'Cell occupied' };

    const def = this.getById(buildingId);
    state.grid[row][col] = {
      id: buildingId,
      level: 1,
      placedAt: state.tick,
    };
    state.cash -= def.cost;
    state.stats.totalSpent += def.cost;

    // First admin HQ gives XP
    if (buildingId === 'admin_hq') {
      state.xp += 20;
    } else {
      state.xp += 10;
    }

    Game.addEvent(state, {
      type: 'success',
      message: `${def.name} built for $${Utils.formatMoney(def.cost)}`,
    });

    return { ok: true };
  },

  // Demolish a building
  demolish(state, row, col) {
    const cell = state.grid[row][col];
    if (!cell) return { ok: false, reason: 'No building here' };

    const def = this.getById(cell.id);
    const refund = Math.floor(def.cost * 0.3); // 30% refund

    // Check if removing breaks requirements for other buildings
    // (simplified: just warn but allow)
    state.grid[row][col] = null;
    state.cash += refund;

    Game.addEvent(state, {
      type: 'neutral',
      message: `${def.name} demolished. Refund: $${Utils.formatMoney(refund)}`,
    });

    return { ok: true, refund };
  },

  // Upgrade a building
  upgrade(state, row, col) {
    const cell = state.grid[row][col];
    if (!cell) return { ok: false, reason: 'No building here' };

    const def = this.getById(cell.id);
    if (cell.level >= def.maxLevel) return { ok: false, reason: 'Already at max level' };

    const cost = def.upgradeCost[cell.level - 1];
    if (state.cash < cost) return { ok: false, reason: `Need $${Utils.formatMoney(cost)}` };

    state.cash -= cost;
    state.stats.totalSpent += cost;
    cell.level++;
    state.xp += 15;

    Game.addEvent(state, {
      type: 'success',
      message: `${def.name} upgraded to Level ${cell.level}!`,
    });

    return { ok: true };
  },

  // Calculate total production capacity from all buildings
  getTotalCapacity(state) {
    let capacity = 0;
    const techs = state.unlockedTechs;

    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (!cell) continue;
        const def = this.getById(cell.id);
        if (!def) continue;

        let cap = def.capacity;

        // Level bonuses
        if (cell.level >= 2) cap = Math.floor(cap * 1.5);
        if (cell.level >= 3) cap = Math.floor(cap * 2.0);

        // Machine shop tech bonus
        if (cell.id === 'machine_shop' && techs.includes('advanced_machining')) {
          cap = Math.floor(cap * 1.5);
        }

        // Automation tech
        if (techs.includes('automation')) {
          cap = Math.floor(cap * 1.25);
        }

        capacity += cap;
      }
    }

    // Supply chain event modifier
    capacity = Math.floor(capacity * (state.modifiers.productionMult || 1));

    return capacity;
  },

  // Calculate total monthly upkeep
  getTotalUpkeep(state) {
    let upkeep = 0;
    const techs = state.unlockedTechs;

    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (!cell) continue;
        const def = this.getById(cell.id);
        if (!def) continue;

        let cost = def.upkeep;
        if (cell.level >= 2) cost = Math.floor(cost * 1.4);
        if (cell.level >= 3) cost = Math.floor(cost * 2.0);

        upkeep += cost;
      }
    }

    // HR Office efficiency bonus
    if (this.hasBuilding(state, 'hr_office')) {
      let hrLevel = 1;
      outer: for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
        for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
          const cell = state.grid[r][c];
          if (cell && cell.id === 'hr_office') { hrLevel = cell.level; break outer; }
        }
      }
      const efficiencyBonus = 0.15 * hrLevel;
      upkeep = Math.floor(upkeep * (1 - efficiencyBonus));
    }

    // Lean manufacturing tech
    if (techs.includes('lean_manufacturing')) {
      upkeep = Math.floor(upkeep * 0.90);
    }

    // Event modifier
    upkeep = Math.floor(upkeep * (state.modifiers.upkeepMult || 1));

    return upkeep;
  },

  // Calculate total worker count
  getTotalWorkers(state) {
    let workers = 0;
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (!cell) continue;
        const def = this.getById(cell.id);
        if (def) {
          let w = def.workers;
          if (cell.level >= 2) w = Math.floor(w * 1.3);
          if (cell.level >= 3) w = Math.floor(w * 1.7);
          workers += w;
        }
      }
    }
    return workers;
  },

  // Get quality bonus (0-1 multiplier)
  getQualityBonus(state) {
    let bonus = 0;
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (cell && cell.id === 'quality_lab') {
          bonus += 0.20 * cell.level;
        }
        if (cell && cell.id === 'test_facility') {
          bonus += 0.10 * cell.level;
        }
      }
    }

    if (state.unlockedTechs.includes('quality_control')) bonus += 0.10;
    if (state.unlockedTechs.includes('as9100')) bonus += 0.15;

    return Math.min(bonus, 0.80); // cap at 80% bonus
  },

  // Get research points per tick
  getResearchRate(state) {
    let rate = 0;
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (cell && cell.id === 'rd_center') {
          rate += 3 * cell.level;
        }
      }
    }
    return rate;
  },

  // Get adjacency bonus for a cell (checks if adjacent to complementary buildings)
  getAdjacencyBonus(state, row, col) {
    const adjacencies = {
      assembly_bay: ['machine_shop', 'warehouse'],
      machine_shop: ['assembly_bay', 'quality_lab'],
      quality_lab: ['clean_room', 'test_facility'],
      clean_room: ['quality_lab', 'rd_center'],
    };

    const cell = state.grid[row][col];
    if (!cell) return 0;

    const neighbors = adjacencies[cell.id];
    if (!neighbors) return 0;

    let bonus = 0;
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= GAME_DATA.GRID_ROWS || nc < 0 || nc >= GAME_DATA.GRID_COLS) continue;
      const neighbor = state.grid[nr][nc];
      if (neighbor && neighbors.includes(neighbor.id)) {
        bonus += 5; // +5 capacity per adjacent synergy building
      }
    }
    return bonus;
  },
};
