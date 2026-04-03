// AeroForge - UI Rendering & Interaction

const UI = {
  // DOM references
  els: {},

  init(state) {
    this.els = {
      companyName: document.getElementById('company-name'),
      levelBadge: document.getElementById('level-badge'),
      cashDisplay: document.getElementById('cash-display'),
      xpBar: document.getElementById('xp-bar'),
      xpText: document.getElementById('xp-text'),
      dateDisplay: document.getElementById('date-display'),
      reputationStars: document.getElementById('reputation-stars'),
      grid: document.getElementById('factory-grid'),
      contractsActive: document.getElementById('contracts-active'),
      contractsAvailable: document.getElementById('contracts-available'),
      eventFeed: document.getElementById('event-feed'),
      buildMenu: document.getElementById('build-menu'),
      statsBar: document.getElementById('stats-bar'),
      modal: document.getElementById('building-modal'),
      modalContent: document.getElementById('modal-content'),
      modalClose: document.getElementById('modal-close'),
      techPanel: document.getElementById('tech-panel'),
      activeEventsBanner: document.getElementById('active-events-banner'),
      toastContainer: document.getElementById('toast-container'),
      newGameBtn: document.getElementById('new-game-btn'),
      renameBtn: document.getElementById('rename-btn'),
      saveBtn: document.getElementById('save-btn'),
      researchPoints: document.getElementById('research-points'),
      bankModal: document.getElementById('bank-modal'),
      bankModalContent: document.getElementById('bank-modal-content'),
      bankModalClose: document.getElementById('bank-modal-close'),
      bankBtn: document.getElementById('bank-btn'),
      creditScoreDisplay: document.getElementById('credit-score-display'),
      bankPanel: document.getElementById('bank-panel'),
    };

    // Bind persistent events
    this.els.modalClose.addEventListener('click', () => this.closeModal());
    this.els.modal.addEventListener('click', (e) => {
      if (e.target === this.els.modal) this.closeModal();
    });
    this.els.bankModalClose.addEventListener('click', () => this.closeBankModal());
    this.els.bankModal.addEventListener('click', (e) => {
      if (e.target === this.els.bankModal) this.closeBankModal();
    });
    this.els.bankBtn.addEventListener('click', () => this.openBankModal());
    this.els.newGameBtn.addEventListener('click', () => {
      if (confirm('Start a new game? All progress will be lost!')) {
        Game.deleteSave();
      }
    });
    this.els.saveBtn.addEventListener('click', () => {
      Game.save();
      this.showToast('💾 Game saved!', 'success');
    });
    this.els.renameBtn.addEventListener('click', () => {
      const name = prompt('Enter company name:', Game.state.companyName);
      if (name) Game.renameCompany(name);
    });

    this.buildGrid(state);
    this.buildBuildMenu(state);
  },

  buildGrid(state) {
    const grid = this.els.grid;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${GAME_DATA.GRID_COLS}, ${GAME_DATA.CELL_SIZE}px)`;
    grid.style.gridTemplateRows = `repeat(${GAME_DATA.GRID_ROWS}, ${GAME_DATA.CELL_SIZE}px)`;

    for (let r = 0; r < GAME_DATA.GRID_ROWS; r++) {
      for (let c = 0; c < GAME_DATA.GRID_COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', () => this.onCellClick(r, c));
        cell.addEventListener('mouseenter', () => this.onCellHover(r, c, cell));
        cell.addEventListener('mouseleave', () => this.onCellHoverEnd(cell));
        grid.appendChild(cell);
      }
    }
  },

  buildBuildMenu(state) {
    const menu = this.els.buildMenu;
    menu.innerHTML = '';

    const buildings = Buildings.getAll();
    for (const [id, def] of Object.entries(buildings)) {
      const btn = document.createElement('button');
      btn.className = 'build-btn';
      btn.dataset.buildingId = id;
      btn.innerHTML = `
        <span class="build-emoji">${def.emoji}</span>
        <span class="build-name">${def.name}</span>
        <span class="build-cost">$${Utils.formatMoney(def.cost)}</span>
      `;
      btn.title = `${def.name}\n${def.description}\nUpkeep: $${Utils.formatMoney(def.upkeep)}/mo\nWorkers: ${def.workers}`;
      btn.addEventListener('click', () => this.selectBuilding(id, btn));
      menu.appendChild(btn);
    }
  },

  selectBuilding(buildingId, btnEl) {
    const state = Game.state;

    // Deselect if already selected
    if (state.ui.selectedBuildingId === buildingId) {
      state.ui.selectedBuildingId = null;
      document.querySelectorAll('.build-btn').forEach(b => b.classList.remove('selected'));
      return;
    }

    // Check if can place
    const check = Buildings.canPlace(state, buildingId);
    if (!check.ok) {
      this.showToast(`⛔ Cannot build: ${check.reason}`, 'danger');
      return;
    }

    state.ui.selectedBuildingId = buildingId;
    document.querySelectorAll('.build-btn').forEach(b => b.classList.remove('selected'));
    if (btnEl) btnEl.classList.add('selected');

    const def = Buildings.getById(buildingId);
    this.showToast(`${def.emoji} Click a grid cell to place ${def.name}`, 'info');
  },

  onCellClick(row, col) {
    const state = Game.state;
    const { gridW, gridH } = Game.getGridSize(state);

    if (row >= gridH || col >= gridW) {
      this.showToast('🔒 Expand your company to unlock this area!', 'info');
      return;
    }

    const cell = state.grid[row][col];

    if (state.ui.selectedBuildingId && !cell) {
      // Place building
      const result = Buildings.place(state, state.ui.selectedBuildingId, row, col);
      if (result.ok) {
        state.ui.selectedBuildingId = null;
        document.querySelectorAll('.build-btn').forEach(b => b.classList.remove('selected'));
        this.render(state);
        this.showToast('🏗️ Building placed!', 'success');
      } else {
        this.showToast(`⛔ ${result.reason}`, 'danger');
      }
    } else if (cell) {
      // Open building modal
      this.openBuildingModal(state, row, col);
    } else {
      // No building selected, prompt
      if (!state.ui.selectedBuildingId) {
        this.showToast('👆 Select a building from the bottom bar first', 'info');
      }
    }
  },

  onCellHover(row, col, cellEl) {
    const state = Game.state;
    const cell = state.grid[row][col];
    if (!cell) return;

    const def = Buildings.getById(cell.id);
    if (!def) return;

    const adj = Buildings.getAdjacencyBonus(state, row, col);
    cellEl.title = `${def.name} (Lv.${cell.level})\nCapacity: ${def.capacity}${adj > 0 ? ' +'+adj+' adj bonus' : ''}\nUpkeep: $${Utils.formatMoney(def.upkeep)}/mo`;
  },

  onCellHoverEnd(cellEl) {
    // nothing
  },

  openBuildingModal(state, row, col) {
    const cell = state.grid[row][col];
    if (!cell) return;

    const def = Buildings.getById(cell.id);
    state.ui.modalOpen = true;
    state.ui.modalRow = row;
    state.ui.modalCol = col;

    const adj = Buildings.getAdjacencyBonus(state, row, col);
    const upkeepPerMonth = def.upkeep * (cell.level === 2 ? 1.5 : cell.level === 3 ? 2.2 : 1);
    const canUpgrade = cell.level < def.maxLevel;
    const upgradeCost = canUpgrade ? def.upgradeCost[cell.level - 1] : 0;

    let upgradeSection = '';
    if (canUpgrade) {
      const canAfford = state.cash >= upgradeCost;
      upgradeSection = `
        <div class="modal-upgrade">
          <h4>Upgrade to Level ${cell.level + 1}</h4>
          <p class="upgrade-effect">${def.upgradeEffect[cell.level - 1]}</p>
          <p class="upgrade-cost">Cost: $${Utils.formatMoney(upgradeCost)}</p>
          <button class="btn btn-upgrade ${!canAfford ? 'btn-disabled' : ''}"
            onclick="UI.doUpgrade(${row}, ${col})"
            ${!canAfford ? 'disabled' : ''}>
            Upgrade ($${Utils.formatMoney(upgradeCost)})
          </button>
        </div>
      `;
    } else {
      upgradeSection = `<div class="modal-upgrade"><p class="max-level-badge">⭐ MAX LEVEL</p></div>`;
    }

    const scrapImpact = typeof Scrap !== 'undefined'
      ? `−${((Scrap.BASE_SCRAP_RATE - Scrap.getScrapRate(state)) * 100).toFixed(1)}% scrap with this building`
      : '';

    this.els.modalContent.innerHTML = `
      <div class="modal-header">
        <span class="modal-emoji">${def.emoji}</span>
        <div>
          <h2 class="modal-title">${def.name}</h2>
          <span class="modal-level">Level ${cell.level} / ${def.maxLevel}</span>
        </div>
      </div>
      <p class="modal-desc">${def.description}</p>
      <div class="modal-stats">
        <div class="modal-stat"><label>Capacity</label><value>${def.capacity}${adj > 0 ? ' +'+adj+' adj' : ''}</value></div>
        <div class="modal-stat"><label>Workers</label><value>${def.workers}</value></div>
        <div class="modal-stat"><label>Upkeep/mo</label><value>$${Utils.formatMoney(upkeepPerMonth)}</value></div>
        <div class="modal-stat"><label>Effect</label><value class="effect-text">${def.effect}</value></div>
      </div>
      ${upgradeSection}
      ${def.learnMore ? `<div class="modal-learn"><div class="learn-label">Industry Context</div><div class="learn-text">${def.learnMore}</div></div>` : ''}
      <div class="modal-actions">
        <button class="btn btn-danger" onclick="UI.doDemolish(${row}, ${col})">🔨 Demolish (35% refund)</button>
      </div>
    `;

    this.els.modal.classList.add('open');
  },

  closeModal() {
    Game.state.ui.modalOpen = false;
    this.els.modal.classList.remove('open');
  },

  doUpgrade(row, col) {
    const result = Buildings.upgrade(Game.state, row, col);
    if (result.ok) {
      this.closeModal();
      this.render(Game.state);
      this.showToast('⬆️ Building upgraded!', 'success');
    } else {
      this.showToast(`⛔ ${result.reason}`, 'danger');
    }
  },

  doDemolish(row, col) {
    if (!confirm('Demolish this building? You will receive 35% refund.')) return;
    const result = Buildings.demolish(Game.state, row, col);
    if (result.ok) {
      this.closeModal();
      this.render(Game.state);
      this.showToast(`💥 Demolished! Refund: $${Utils.formatMoney(result.refund)}`, 'neutral');
    }
  },

  acceptContract(contractId) {
    const result = Contracts.accept(Game.state, contractId);
    if (result.ok) {
      this.render(Game.state);
      this.showToast('📋 Contract accepted!', 'success');
    } else {
      this.showToast(`⛔ ${result.reason}`, 'danger');
    }
  },

  researchTech(techId) {
    const result = Game.researchTech(techId);
    if (result.ok) {
      this.render(Game.state);
      this.showToast('🔬 Technology researched!', 'success');
    } else {
      this.showToast(`⛔ ${result.reason}`, 'danger');
    }
  },

  render(state) {
    this.renderHeader(state);
    this.renderGrid(state);
    this.renderContracts(state);
    this.renderEventFeed(state);
    this.renderBuildMenu(state);
    this.renderStats(state);
    this.renderActiveEvents(state);
    this.renderResearchPanel(state);
    this.renderBankPanel(state);
  },

  renderHeader(state) {
    const date = Game.getDate(state);
    const level = state.level;
    const title = GAME_DATA.LEVEL_TITLES[level];
    const currentLevelXP = GAME_DATA.LEVEL_XP[level - 1] || 0;
    const nextLevelXP = GAME_DATA.LEVEL_XP[level] || GAME_DATA.LEVEL_XP[level - 1];
    const xpProgress = level >= 15 ? 100 : Math.min(100, ((state.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

    this.els.companyName.textContent = state.companyName;
    this.els.levelBadge.textContent = `Lv.${level} ${title}`;
    this.els.levelBadge.className = `level-badge level-${Math.min(level, 4)}`;

    const cashColor = state.cash < 50000 ? '#d63031' : state.cash < 150000 ? '#f0a500' : '#00b894';
    this.els.cashDisplay.style.color = cashColor;
    this.els.cashDisplay.textContent = `$${Utils.formatMoney(state.cash)}`;

    this.els.xpBar.style.width = `${xpProgress}%`;
    this.els.xpText.textContent = level >= 15 ? 'MAX' : `${Math.floor(state.xp)} / ${nextLevelXP} XP`;
    this.els.dateDisplay.textContent = `${date.monthName} ${date.year} Q${date.quarter}`;

    // Reputation stars
    const stars = Math.round(state.reputation);
    this.els.reputationStars.textContent = '★'.repeat(Math.min(5, stars)) + '☆'.repeat(Math.max(0, 5 - stars));

    if (this.els.researchPoints) {
      this.els.researchPoints.textContent = `⚗️ ${Math.floor(state.researchPoints)} RP`;
    }

    // Credit score in header
    if (this.els.creditScoreDisplay && state.banking) {
      const tier = Banking.creditTier(state.banking.creditScore);
      this.els.creditScoreDisplay.textContent = `🏦 ${state.banking.creditScore}`;
      this.els.creditScoreDisplay.style.color = tier.color;
      this.els.creditScoreDisplay.title = `Credit Score: ${state.banking.creditScore} — ${tier.label}\n${tier.desc}`;
    }
  },

  renderGrid(state) {
    const { gridW, gridH } = Game.getGridSize(state);
    const cells = document.querySelectorAll('.grid-cell');

    cells.forEach(cell => {
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const building = state.grid[r][c];
      const inBounds = r < gridH && c < gridW;

      cell.className = 'grid-cell';

      if (!inBounds) {
        cell.classList.add('locked');
        cell.innerHTML = '<span class="cell-lock">🔒</span>';
        return;
      }

      cell.classList.add('active');

      if (building) {
        const def = Buildings.getById(building.id);
        if (!def) return;
        cell.classList.add('has-building');
        cell.style.setProperty('--building-color', def.color);
        cell.innerHTML = `
          <div class="building-tile" style="background-color: ${def.color}">
            <span class="building-emoji">${def.emoji}</span>
            <span class="building-level">Lv.${building.level}</span>
            <span class="building-name">${def.name}</span>
          </div>
        `;
      } else {
        // Highlight if building selected
        if (state.ui.selectedBuildingId) {
          cell.classList.add('placeable');
        }
        cell.innerHTML = '<div class="empty-cell-inner"></div>';
      }
    });
  },

  renderContracts(state) {
    // Active contracts
    const activeEl = this.els.contractsActive;
    if (state.activeContracts.length === 0) {
      activeEl.innerHTML = '<div class="no-contracts">No active contracts. Bid on one!</div>';
    } else {
      activeEl.innerHTML = state.activeContracts.map(c => {
        const pct = Math.floor(c.progress);
        const tierColor = Contracts.getTierColor(c.tier);
        const riskColor = Contracts.getRiskColor(c.risk);
        const weeksLeft = c.ticksRemaining;
        const urgentClass = weeksLeft < 5 ? 'urgent' : '';
        return `
          <div class="contract-card active-contract ${urgentClass}">
            <div class="contract-header">
              <span class="contract-name">${c.name}</span>
              <span class="contract-pay" style="color:#00b894">$${Utils.formatMoney(c.payment)}</span>
            </div>
            <div class="contract-client">${c.client}</div>
            <div class="contract-progress-wrap">
              <div class="contract-progress-bar">
                <div class="contract-progress-fill" style="width:${pct}%; background:${tierColor}"></div>
              </div>
              <span class="contract-pct">${pct}%</span>
            </div>
            <div class="contract-footer">
              <span class="contract-weeks ${urgentClass}">${weeksLeft}w left</span>
              <span class="contract-risk" style="color:${riskColor}">${c.risk.toUpperCase()}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Available contracts
    const availEl = this.els.contractsAvailable;
    const maxContracts = GAME_DATA.MAX_CONTRACTS_BY_LEVEL[state.level] || 1;
    const canBid = state.activeContracts.length < maxContracts;

    if (state.availableContracts.length === 0) {
      availEl.innerHTML = '<div class="no-contracts">No contracts available. Grow your company!</div>';
    } else {
      availEl.innerHTML = state.availableContracts.map(c => {
        const tierColor = Contracts.getTierColor(c.tier);
        const riskColor = Contracts.getRiskColor(c.risk);
        const tierName = Contracts.getTierName(c.tier);
        return `
          <div class="contract-card available-contract">
            <div class="contract-header">
              <span class="contract-name">${c.name}</span>
              <span class="contract-tier" style="color:${tierColor}">${tierName}</span>
            </div>
            <div class="contract-client">${c.client}</div>
            <div class="contract-desc">${c.description}</div>
            <div class="contract-meta">
              <span class="contract-pay-big" style="color:#00b894">$${Utils.formatMoney(c.payment)}</span>
              <span class="contract-duration">${c.duration}w</span>
              <span class="contract-risk" style="color:${riskColor}">${c.risk.toUpperCase()}</span>
              <span class="contract-penalty" style="color:#d63031">-$${Utils.formatMoney(c.penalty)}</span>
            </div>
            <button class="btn btn-bid ${!canBid ? 'btn-disabled' : ''}"
              onclick="UI.acceptContract('${c.id}')"
              ${!canBid ? 'disabled title="Max contracts active"' : ''}>
              ${canBid ? '📋 BID' : '🔒 FULL'}
            </button>
          </div>
        `;
      }).join('');
    }
  },

  renderEventFeed(state) {
    const feedEl = this.els.eventFeed;
    if (state.eventLog.length === 0) {
      feedEl.innerHTML = '<div class="event-item neutral">No events yet...</div>';
      return;
    }

    feedEl.innerHTML = state.eventLog.slice(0, 20).map(ev => {
      const typeClass = ev.type || 'neutral';
      const icon = typeClass === 'success' ? '✅' : typeClass === 'danger' ? '⚠️' : '📌';
      const ageText = ev.tick !== undefined ? `Wk ${ev.tick}` : '';
      return `
        <div class="event-item ${typeClass}">
          <span class="event-msg">${ev.message}</span>
          <span class="event-tick">${ageText}</span>
        </div>
      `;
    }).join('');
  },

  renderBuildMenu(state) {
    const buttons = document.querySelectorAll('.build-btn');
    buttons.forEach(btn => {
      const id = btn.dataset.buildingId;
      const check = Buildings.canPlace(state, id);
      const def = Buildings.getById(id);
      const count = Buildings.countOnGrid(state, id);

      btn.classList.toggle('cannot-build', !check.ok);
      btn.classList.toggle('selected', state.ui.selectedBuildingId === id);

      if (!check.ok) {
        btn.title = `${def.name}\n⛔ ${check.reason}\n${def.description}`;
      } else {
        btn.title = `${def.name}\n${def.description}\nCost: $${Utils.formatMoney(def.cost)}\nUpkeep: $${Utils.formatMoney(def.upkeep)}/mo\nWorkers: ${def.workers}\nBuilt: ${count}/${def.maxCount}`;
      }

      // Update cost in button
      const costEl = btn.querySelector('.build-cost');
      if (costEl) {
        costEl.style.color = state.cash < def.cost ? '#d63031' : '#00b894';
      }
    });
  },

  renderStats(state) {
    const cap = Buildings.getTotalCapacity(state);
    const upkeep = Buildings.getTotalUpkeep(state);
    const workers = Buildings.getTotalWorkers(state);
    const maxContracts = GAME_DATA.MAX_CONTRACTS_BY_LEVEL[state.level] || 1;
    const researchRate = Buildings.getResearchRate(state);
    const scrapRate = typeof Scrap !== 'undefined' ? Scrap.getScrapRate(state) : 0.08;
    const totalDebt = typeof Banking !== 'undefined' ? Banking.totalDebt(state) : 0;
    const monthlyLoanPayments = typeof Banking !== 'undefined' ? Banking.totalMonthlyPayments(state) : 0;
    const scrapColor = scrapRate < 0.04 ? '#00b894' : scrapRate < 0.07 ? '#f0a500' : '#d63031';

    this.els.statsBar.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Total Revenue</span>
        <span class="stat-value green">$${Utils.formatMoney(state.stats.totalRevenue)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Upkeep/mo</span>
        <span class="stat-value red">$${Utils.formatMoney(upkeep)}</span>
      </div>
      <div class="stat-item" title="Monthly loan payments across all active loans">
        <span class="stat-label">Debt Pmts/mo</span>
        <span class="stat-value ${monthlyLoanPayments > 0 ? 'red' : 'muted'}">$${Utils.formatMoney(monthlyLoanPayments)}</span>
      </div>
      <div class="stat-item" title="Total outstanding debt. High debt = higher bankruptcy risk.">
        <span class="stat-label">Total Debt</span>
        <span class="stat-value ${totalDebt > 0 ? 'orange' : 'muted'}">$${Utils.formatMoney(totalDebt)}</span>
      </div>
      <div class="stat-item" title="Scrap rate: % of material cost wasted. Lower is better. Build Quality Labs to reduce.">
        <span class="stat-label">Scrap Rate</span>
        <span class="stat-value" style="color:${scrapColor}">${(scrapRate * 100).toFixed(1)}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Capacity</span>
        <span class="stat-value">${cap}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Workers</span>
        <span class="stat-value">${workers}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Contracts</span>
        <span class="stat-value">${state.activeContracts.length}/${maxContracts}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Completed</span>
        <span class="stat-value green">${state.stats.contractsCompleted}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">NCRs Issued</span>
        <span class="stat-value orange">${state.scrap ? state.scrap.ncrCount : 0}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Research/wk</span>
        <span class="stat-value purple">${researchRate > 0 ? '+'+researchRate+' RP' : '0 RP'}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Peak Cash</span>
        <span class="stat-value gold">$${Utils.formatMoney(state.stats.peakCash)}</span>
      </div>
    `;
  },

  renderActiveEvents(state) {
    const banner = this.els.activeEventsBanner;
    if (!state.activeEvents || state.activeEvents.length === 0) {
      banner.innerHTML = '';
      banner.style.display = 'none';
      return;
    }

    banner.style.display = 'flex';
    banner.innerHTML = state.activeEvents.map(ev => {
      const icon = ev.type === 'positive' ? '🟢' : ev.type === 'negative' ? '🔴' : '🟡';
      return `<span class="active-event-chip ${ev.type}">${icon} ${ev.title} (${ev.ticksRemaining}w)</span>`;
    }).join('');
  },

  renderResearchPanel(state) {
    const panel = this.els.techPanel;
    if (!panel) return;

    const techs = GAME_DATA.TECHS;
    const hasRD = Buildings.hasBuilding(state, 'rd_center');

    panel.innerHTML = `
      <div class="tech-header">
        <span>🧪 Research Lab</span>
        <span class="rp-count">${Math.floor(state.researchPoints)} RP</span>
      </div>
      ${!hasRD ? '<div class="no-contracts">Build an R&D Center to research technologies.</div>' : ''}
      ${hasRD ? Object.values(techs).map(tech => {
        const unlocked = state.unlockedTechs.includes(tech.id);
        const canAfford = state.researchPoints >= tech.cost;
        return `
          <div class="tech-card ${unlocked ? 'unlocked' : ''} ${!canAfford && !unlocked ? 'unaffordable' : ''}">
            <div class="tech-name">${unlocked ? '✅ ' : ''}${tech.name}</div>
            <div class="tech-desc">${tech.description}</div>
            ${!unlocked ? `
              <button class="btn btn-research ${!canAfford ? 'btn-disabled' : ''}"
                onclick="UI.researchTech('${tech.id}')"
                ${!canAfford ? 'disabled' : ''}>
                Research (${tech.cost} RP)
              </button>
            ` : '<div class="tech-unlocked-badge">UNLOCKED</div>'}
          </div>
        `;
      }).join('') : ''}
    `;
  },

  // ===== BANKING PANEL (sidebar section) =====
  renderBankPanel(state) {
    const panel = this.els.bankPanel;
    if (!panel || !state.banking) return;

    const tier = Banking.creditTier(state.banking.creditScore);
    const totalDebt = Banking.totalDebt(state);
    const monthlyPayments = Banking.totalMonthlyPayments(state);
    const activeLoans = state.banking.loans.filter(l => l.status === 'active');

    panel.innerHTML = `
      <div class="bank-summary">
        <div class="bank-score-row">
          <span class="bank-score-label">Credit Score</span>
          <span class="bank-score-val" style="color:${tier.color}">${state.banking.creditScore} — ${tier.label}</span>
        </div>
        <div class="bank-score-row">
          <span class="bank-score-label">Total Debt</span>
          <span class="bank-score-val ${totalDebt > 0 ? 'orange' : 'muted'}">$${Utils.formatMoney(totalDebt)}</span>
        </div>
        <div class="bank-score-row">
          <span class="bank-score-label">Monthly Payments</span>
          <span class="bank-score-val ${monthlyPayments > 0 ? 'red' : 'muted'}">$${Utils.formatMoney(monthlyPayments)}/mo</span>
        </div>
      </div>
      ${activeLoans.length > 0 ? `
        <div class="bank-loans-list">
          ${activeLoans.map(loan => {
            const pctPaid = Math.round((1 - loan.remainingBalance / loan.principal) * 100);
            const missedClass = loan.missedPayments > 0 ? 'loan-overdue' : '';
            return `
              <div class="loan-card ${missedClass}">
                <div class="loan-header">
                  <span>${loan.emoji} ${loan.name}</span>
                  <span class="loan-bal">$${Utils.formatMoney(loan.remainingBalance)} left</span>
                </div>
                <div class="loan-progress-wrap">
                  <div class="loan-progress-bar"><div class="loan-progress-fill" style="width:${pctPaid}%"></div></div>
                  <span class="loan-pct">${pctPaid}% paid</span>
                </div>
                <div class="loan-meta">
                  <span>${(loan.annualRate * 100).toFixed(1)}% APR</span>
                  <span>$${Utils.formatMoney(loan.monthlyPayment)}/mo</span>
                  <span>${loan.monthsRemaining}mo left</span>
                  ${loan.missedPayments > 0 ? `<span class="overdue-flag">⚠️ ${loan.missedPayments} missed</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `<div class="no-contracts">No active loans. Click 🏦 Bank to borrow.</div>`}
    `;
  },

  // ===== BANKING MODAL (full loan interface) =====
  openBankModal() {
    const state = Game.state;
    this._renderBankModalContent(state);
    this.els.bankModal.classList.add('open');
  },

  closeBankModal() {
    this.els.bankModal.classList.remove('open');
  },

  _renderBankModalContent(state) {
    const tier = Banking.creditTier(state.banking.creditScore);
    const totalDebt = Banking.totalDebt(state);
    const dtr = Banking.debtToRevenue(state);
    const activeLoans = state.banking.loans.filter(l => l.status === 'active');

    const loanTypesHtml = Banking.LOAN_TYPES.map(lt => {
      const check = Banking.canTakeLoan(state, lt.id);
      const effRate = Banking.effectiveRate(lt.baseRate, state.banking.creditScore);
      const samplePayment = Banking.monthlyPayment(lt.maxAmount, effRate, lt.revolving ? 12 : lt.termMonths);
      const canUse = check.ok;
      return `
        <div class="loan-type-card ${!canUse ? 'loan-locked' : ''}">
          <div class="loan-type-header">
            <span class="loan-type-emoji">${lt.emoji}</span>
            <div>
              <div class="loan-type-name">${lt.name}</div>
              <div class="loan-type-meta">
                Up to $${Utils.formatMoney(lt.maxAmount)} · ${(effRate * 100).toFixed(1)}% APR · ${lt.revolving ? 'Revolving/12mo' : lt.termMonths + ' months'}
              </div>
            </div>
          </div>
          <div class="loan-type-desc">${lt.description}</div>
          <div class="loan-educational">${lt.educational}</div>
          <div class="loan-collateral">🔐 Collateral: ${lt.collateral}</div>
          ${canUse ? `
            <div class="loan-type-action">
              <span style="color:var(--text-secondary);font-size:0.8em">Max payment at full amount: $${Utils.formatMoney(samplePayment)}/mo</span>
              <div class="loan-input-row">
                <input type="number" id="loan-amount-${lt.id}" class="loan-amount-input"
                  min="10000" max="${lt.maxAmount}" step="10000" value="${Math.min(lt.maxAmount, Math.floor(lt.maxAmount * 0.5))}"
                  placeholder="Amount" />
                <button class="btn btn-bid" onclick="UI.doTakeLoan('${lt.id}')">Borrow</button>
              </div>
            </div>
          ` : `<div class="loan-locked-reason">🔒 ${check.reason}</div>`}
        </div>
      `;
    }).join('');

    this.els.bankModalContent.innerHTML = `
      <div class="bank-modal-header">
        <h2>🏦 AeroForge Finance Center</h2>
        <p class="bank-modal-sub">Manage your debt, credit, and financing strategy</p>
      </div>

      <div class="bank-modal-scores">
        <div class="bank-score-card">
          <div class="bsc-label">Credit Score</div>
          <div class="bsc-value" style="color:${tier.color}">${state.banking.creditScore}</div>
          <div class="bsc-tier" style="color:${tier.color}">${tier.label}</div>
          <div class="bsc-desc">${tier.desc}</div>
        </div>
        <div class="bank-score-card">
          <div class="bsc-label">Total Debt</div>
          <div class="bsc-value orange">$${Utils.formatMoney(totalDebt)}</div>
          <div class="bsc-desc">Debt-to-Revenue: ${(dtr * 100).toFixed(0)}%</div>
        </div>
        <div class="bank-score-card">
          <div class="bsc-label">Interest Paid</div>
          <div class="bsc-value red">$${Utils.formatMoney(state.banking.interestPaid)}</div>
          <div class="bsc-desc">Total borrowed: $${Utils.formatMoney(state.banking.totalBorrowed)}</div>
        </div>
        <div class="bank-score-card">
          <div class="bsc-label">Scrap Costs</div>
          <div class="bsc-value orange">$${Utils.formatMoney(state.scrap ? state.scrap.totalScrapCost : 0)}</div>
          <div class="bsc-desc">NCRs issued: ${state.scrap ? state.scrap.ncrCount : 0} · Rework: $${Utils.formatMoney(state.scrap ? state.scrap.totalReworkCost : 0)}</div>
        </div>
      </div>

      <div class="bank-modal-section-title">📋 Available Loan Products</div>
      <div class="loan-types-list">${loanTypesHtml}</div>

      ${activeLoans.length > 0 ? `
        <div class="bank-modal-section-title">💳 Active Loans</div>
        <div class="active-loans-list">
          ${activeLoans.map(loan => `
            <div class="loan-active-row">
              <span>${loan.emoji} ${loan.name}</span>
              <span>Balance: $${Utils.formatMoney(loan.remainingBalance)}</span>
              <span>${(loan.annualRate * 100).toFixed(1)}% APR</span>
              <span>$${Utils.formatMoney(loan.monthlyPayment)}/mo</span>
              <span>${loan.monthsRemaining} months left</span>
              ${loan.missedPayments > 0 ? `<span style="color:var(--red)">⚠️ ${loan.missedPayments} missed</span>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  doTakeLoan(loanTypeId) {
    const state = Game.state;
    const inputEl = document.getElementById(`loan-amount-${loanTypeId}`);
    if (!inputEl) return;
    const amount = parseInt(inputEl.value, 10);
    if (isNaN(amount) || amount <= 0) {
      this.showToast('Enter a valid loan amount', 'danger');
      return;
    }
    const result = Banking.takeLoan(state, loanTypeId, amount);
    if (result.ok) {
      this._renderBankModalContent(state);
      this.render(state);
      this.showToast(`🏦 Loan approved! $${Utils.formatMoney(amount)} added to your account`, 'success');
    } else {
      this.showToast(`⛔ ${result.reason}`, 'danger');
    }
  },

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    this.els.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });

    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },

  showGameOver(state, won) {
    const overlay = document.getElementById('gameover-overlay');
    const title = document.getElementById('gameover-title');
    const msg = document.getElementById('gameover-message');
    const stats = document.getElementById('gameover-stats');

    if (won) {
      title.textContent = '🏆 VICTORY!';
      title.style.color = '#f0a500';
      msg.textContent = 'You built your startup into a full OEM. The aerospace world bows to AeroForge!';
    } else {
      title.textContent = '💸 BANKRUPTCY';
      title.style.color = '#d63031';
      msg.textContent = 'Your company ran out of cash. The banks have foreclosed on your facilities.';
    }

    stats.innerHTML = `
      <div class="go-stat">Contracts Completed: <b>${state.stats.contractsCompleted}</b></div>
      <div class="go-stat">Total Revenue: <b>$${Utils.formatMoney(state.stats.totalRevenue)}</b></div>
      <div class="go-stat">Peak Cash: <b>$${Utils.formatMoney(state.stats.peakCash)}</b></div>
      <div class="go-stat">Final Level: <b>${state.level} - ${GAME_DATA.LEVEL_TITLES[state.level]}</b></div>
      <div class="go-stat">Weeks Played: <b>${state.stats.weeksPlayed}</b></div>
    `;

    overlay.style.display = 'flex';
    document.getElementById('gameover-restart').addEventListener('click', () => {
      overlay.style.display = 'none';
      Game.deleteSave();
    });
  },
};
