// AeroForge - Building Logic

const Buildings = {
  getAll() {
    return GAME_DATA.BUILDINGS;
  },

  getById(id) {
    return GAME_DATA.BUILDINGS[id] || null;
  },

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

  hasBuilding(state, buildingId) {
    return this.countOnGrid(state, buildingId) > 0;
  },

  canPlace(state, buildingId) {
    const def = this.getById(buildingId);
    if (!def) return { ok: false, reason: 'Unknown building' };

    // Must build Admin HQ first
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

  place(state, buildingId, row, col) {
    const check = this.canPlace(state, buildingId);
    if (!check.ok) return { ok: false, reason: check.reason };

    const cell = state.grid[row][col];
    if (cell !== null) return { ok: false, reason: 'Cell occupied' };

    // Check grid bounds for current level
    const { gridW, gridH } = Game.getGridSize(state);
    if (row >= gridH || col >= gridW) {
      return { ok: false, reason: 'Outside current grid bounds' };
    }

    const def = this.getById(buildingId);
    state.grid[row][col] = {
      id: buildingId,
      level: 1,
      placedAt: state.tick,
    };
    state.cash -= def.cost;
    state.stats.totalSpent += def.cost;
    state.xp += buildingId === 'admin_hq' ? 30 : 15;

    Game.addEvent(state, {
      type: 'success',
      message: `${def.emoji} ${def.name} built for $${Utils.formatMoney(def.cost)}`,
    });

    return { ok: true };
  },

  demolish(state, row, col) {
    const cell = state.grid[row][col];
    if (!cell) return { ok: false, reason: 'No building here' };

    const def = this.getById(cell.id);
    const refund = Math.floor(def.cost * 0.35);

    state.grid[row][col] = null;
    state.cash += refund;

    Game.addEvent(state, {
      type: 'neutral',
      message: `${def.name} demolished. Refund: $${Utils.formatMoney(refund)}`,
    });

    return { ok: true, refund };
  },

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
    state.xp += 25;

    Game.addEvent(state, {
      type: 'success',
      message: `${def.emoji} ${def.name} upgraded to Level ${cell.level}!`,
    });

    return { ok: true };
  },

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
        if (cell.level === 2) cap = Math.floor(cap * 1.6);
        if (cell.level === 3) cap = Math.floor(cap * 2.5);

        // Machine shop tech bonus
        if (cell.id === 'machine_shop' && techs.includes('advanced_machining')) {
          cap = Math.floor(cap * 1.5);
        }

        // Automation tech
        if (techs.includes('automation')) {
          cap = Math.floor(cap * 1.25);
        }

        // Adjacency bonus
        cap += this.getAdjacencyBonus(state, r, c);

        capacity += cap;
      }
    }

    // Production event modifier
    capacity = Math.floor(capacity * (state.modifiers.productionMult || 1));

    return capacity;
  },

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
        if (cell.level === 2) cost = Math.floor(cost * 1.5);
        if (cell.level === 3) cost = Math.floor(cost * 2.2);

        upkeep += cost;
      }
    }

    // HR Office efficiency
    if (this.hasBuilding(state, 'hr_office')) {
      let hrLevel = 1;
      outer: for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
        for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
          const cell = state.grid[r][c];
          if (cell && cell.id === 'hr_office') { hrLevel = cell.level; break outer; }
        }
      }
      const efficiencyBonus = [0, 0.15, 0.28, 0.42][hrLevel] || 0.15;
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

  getTotalWorkers(state) {
    let workers = 0;
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (!cell) continue;
        const def = this.getById(cell.id);
        if (def) {
          let w = def.workers;
          if (cell.level === 2) w = Math.floor(w * 1.4);
          if (cell.level === 3) w = Math.floor(w * 1.9);
          workers += w;
        }
      }
    }
    return workers;
  },

  getQualityBonus(state) {
    let bonus = 0;
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (cell && cell.id === 'quality_lab') bonus += [0, 0.20, 0.38, 0.58][cell.level] || 0.20;
        if (cell && cell.id === 'test_facility') bonus += [0, 0.10, 0.18, 0.28][cell.level] || 0.10;
        if (cell && cell.id === 'clean_room') bonus += [0, 0.05, 0.10, 0.18][cell.level] || 0.05;
      }
    }
    if (state.unlockedTechs.includes('quality_control')) bonus += 0.10;
    if (state.unlockedTechs.includes('as9100')) bonus += 0.15;
    return Math.min(bonus, 0.85);
  },

  getResearchRate(state) {
    let rate = 0;
    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = state.grid[r][c];
        if (cell && cell.id === 'rd_center') {
          rate += [0, 3, 7, 14][cell.level] || 3;
        }
      }
    }
    return rate;
  },

  getAdjacencyBonus(state, row, col) {
    const adjacencies = {
      assembly_bay: ['machine_shop', 'warehouse'],
      machine_shop: ['assembly_bay', 'quality_lab'],
      quality_lab: ['clean_room', 'test_facility'],
      clean_room: ['quality_lab', 'rd_center'],
      test_facility: ['quality_lab', 'clean_room'],
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
        bonus += 4;
      }
    }
    return bonus;
  },

  // Returns list of buildings that can be built in current state
  getAvailableBuildings(state) {
    const all = this.getAll();
    const result = [];
    for (const [id, def] of Object.entries(all)) {
      const check = this.canPlace(state, id);
      result.push({ ...def, canBuild: check.ok, reason: check.reason });
    }
    return result;
  },
};
