// AeroForge - Banking & Finance System
// Educational: Real aerospace companies rely heavily on debt financing, lines of credit,
// and government-backed loans to fund capital-intensive operations.

const Banking = {

  LOAN_TYPES: [
    {
      id: 'sba_startup',
      name: 'SBA 7(a) Startup Loan',
      emoji: '🏦',
      maxAmount: 250000,
      baseRate: 0.065,
      termMonths: 60,
      minLevel: 1,
      minCreditScore: 620,
      collateral: 'Personal guarantee',
      description: 'SBA-backed loan for small manufacturers. Low rate, government guarantee.',
      educational: 'The SBA 7(a) program is the most common small business loan in aerospace. The government guarantees 75–85% of the loan, so banks lend to startups who otherwise lack collateral. Most small aerospace shops get their first machine tools this way.',
    },
    {
      id: 'equipment_loan',
      name: 'Equipment Financing',
      emoji: '⚙️',
      maxAmount: 500000,
      baseRate: 0.055,
      termMonths: 48,
      minLevel: 2,
      minCreditScore: 640,
      collateral: 'Machinery & equipment (lender repossesses on default)',
      description: 'Secured loan for CNC machines, CMMs, and shop equipment.',
      educational: 'Equipment loans are collateralized by the machinery itself. Because the asset secures the loan, rates are lower than unsecured debt. Aerospace shops finance 5-axis CNC mills, coordinate measuring machines (CMMs), and heat treat furnaces this way. If you default, the bank takes your machines.',
    },
    {
      id: 'working_capital',
      name: 'Working Capital Line',
      emoji: '💳',
      maxAmount: 300000,
      baseRate: 0.088,
      termMonths: 12,
      minLevel: 2,
      minCreditScore: 650,
      revolving: true,
      collateral: 'Accounts receivable',
      description: 'Revolving credit line for cash flow gaps between contract payments.',
      educational: 'Cash flow is the #1 killer of aerospace startups. Contracts pay net-30 to net-90, but you pay workers weekly. A revolving line of credit bridges this gap. You draw what you need, pay interest only on what\'s drawn, then repay when the contract pays. Think of it as a business credit card secured by your invoices.',
    },
    {
      id: 'term_loan',
      name: 'Commercial Term Loan',
      emoji: '🏢',
      maxAmount: 1000000,
      baseRate: 0.072,
      termMonths: 84,
      minLevel: 4,
      minCreditScore: 680,
      collateral: 'Business assets & cash flow',
      description: 'Standard commercial loan for facility expansion and major investments.',
      educational: 'Commercial term loans fund capital expenditures that payoff over years — building expansions, new production lines, ERP systems. Banks underwrite based on EBITDA (Earnings Before Interest, Taxes, Depreciation, Amortization). For aerospace, lenders look at your backlog of signed contracts as evidence of future cash flow.',
    },
    {
      id: 'exim_loan',
      name: 'EXIM Bank Export Loan',
      emoji: '🌐',
      maxAmount: 2000000,
      baseRate: 0.045,
      termMonths: 120,
      minLevel: 7,
      minCreditScore: 700,
      collateral: 'Export contracts & receivables',
      description: 'Export-Import Bank financing for aerospace exporters. Best rate available.',
      educational: 'The U.S. Export-Import Bank is a federal agency that finances American exports. Aerospace is EXIM\'s #1 sector — Boeing alone has used billions in EXIM guarantees. For manufacturers, EXIM provides working capital guarantees and direct loans at rates near Treasury yields. You must show export revenue. Politically controversial but financially powerful.',
    },
    {
      id: 'dod_progress',
      name: 'DoD Progress Payments',
      emoji: '🎖️',
      maxAmount: 5000000,
      baseRate: 0.040,
      termMonths: 60,
      minLevel: 10,
      minCreditScore: 720,
      collateral: 'DoD contract value',
      description: 'Defense Department progress payments backed by military contracts.',
      educational: 'The DoD\'s Progress Payment Program (FAR 52.232-16) lets defense contractors bill the government for 80% of allowable costs as work progresses — before delivery. Banks lend against these receivables. This is how Lockheed, Northrop, and Tier 1/2 suppliers finance multi-year programs worth billions. Without this, no one could fund a 5-year fighter jet contract.',
    },
  ],

  // Standard amortization: monthly payment for a fixed-rate loan
  monthlyPayment(principal, annualRate, termMonths) {
    if (termMonths <= 0) return principal;
    const r = annualRate / 12;
    if (r < 0.0001) return Math.ceil(principal / termMonths);
    return Math.ceil(principal * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1));
  },

  // Credit score adjusts effective interest rate
  effectiveRate(baseRate, creditScore) {
    if (creditScore >= 750) return Math.max(0.025, baseRate - 0.010);
    if (creditScore >= 700) return baseRate;
    if (creditScore >= 650) return baseRate + 0.012;
    if (creditScore >= 620) return baseRate + 0.028;
    return baseRate + 0.050;
  },

  // Credit score tier info
  creditTier(score) {
    if (score >= 750) return { label: 'Excellent', color: '#00b894', desc: 'Best rates, all loans available' };
    if (score >= 700) return { label: 'Good', color: '#74b9ff', desc: 'Standard rates, most loans available' };
    if (score >= 650) return { label: 'Fair', color: '#f0a500', desc: 'Above-market rates, limited options' };
    if (score >= 620) return { label: 'Poor', color: '#fd79a8', desc: 'High rates, SBA only' };
    return { label: 'Very Poor', color: '#d63031', desc: 'No lender will touch you' };
  },

  // Total monthly debt payments across all active loans
  totalMonthlyPayments(state) {
    if (!state.banking) return 0;
    return state.banking.loans
      .filter(l => l.status === 'active')
      .reduce((sum, l) => sum + l.monthlyPayment, 0);
  },

  // Total outstanding debt
  totalDebt(state) {
    if (!state.banking) return 0;
    return state.banking.loans
      .filter(l => l.status === 'active')
      .reduce((sum, l) => sum + l.remainingBalance, 0);
  },

  // Debt-to-revenue ratio (key metric lenders use)
  debtToRevenue(state) {
    const debt = this.totalDebt(state);
    const revenue = state.stats.totalRevenue || 1;
    return debt / revenue;
  },

  // Check if a loan is available
  canTakeLoan(state, loanTypeId) {
    const type = this.LOAN_TYPES.find(t => t.id === loanTypeId);
    if (!type) return { ok: false, reason: 'Unknown loan type' };

    if (state.level < type.minLevel) {
      return { ok: false, reason: `Requires company Level ${type.minLevel}` };
    }

    const score = state.banking.creditScore;
    if (score < type.minCreditScore) {
      const tier = this.creditTier(score);
      return { ok: false, reason: `Credit score too low: ${score} (${tier.label}) — need ${type.minCreditScore}` };
    }

    // Non-revolving: only one active at a time per type
    if (!type.revolving) {
      const existing = state.banking.loans.find(l => l.typeId === loanTypeId && l.status === 'active');
      if (existing) return { ok: false, reason: 'Already have an active loan of this type' };
    }

    // Debt load check: banks won't lend if debt > 60% of total revenue earned
    const currentDebt = this.totalDebt(state);
    const maxDebt = Math.max(750000, state.stats.totalRevenue * 0.6 + 500000);
    if (currentDebt + type.maxAmount > maxDebt * 2.5) {
      return { ok: false, reason: 'Debt-to-revenue ratio too high — pay down existing loans first' };
    }

    return { ok: true };
  },

  // Take out a new loan
  takeLoan(state, loanTypeId, amount) {
    const check = this.canTakeLoan(state, loanTypeId);
    if (!check.ok) return { ok: false, reason: check.reason };

    const type = this.LOAN_TYPES.find(t => t.id === loanTypeId);
    if (amount <= 0 || amount > type.maxAmount) {
      return { ok: false, reason: `Amount must be $1 – $${Utils.formatMoney(type.maxAmount)}` };
    }

    const rate = this.effectiveRate(type.baseRate, state.banking.creditScore);
    const term = type.revolving ? 12 : type.termMonths;
    const payment = this.monthlyPayment(amount, rate, term);

    const loan = {
      id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      typeId: loanTypeId,
      name: type.name,
      emoji: type.emoji,
      principal: amount,
      annualRate: rate,
      termMonths: term,
      monthlyPayment: payment,
      remainingBalance: amount,
      monthsRemaining: term,
      status: 'active',
      takenAtTick: state.tick,
      missedPayments: 0,
      totalInterestPaid: 0,
    };

    state.banking.loans.push(loan);
    state.banking.totalBorrowed += amount;
    state.cash += amount;

    // New debt slightly dips credit score
    state.banking.creditScore = Math.max(300, state.banking.creditScore - 4);

    Game.addEvent(state, {
      type: 'success',
      message: `🏦 Loan approved: ${type.name} — $${Utils.formatMoney(amount)} at ${(rate * 100).toFixed(1)}% APR. Monthly payment: $${Utils.formatMoney(payment)}`,
    });

    return { ok: true, loan };
  },

  // Called every 4 ticks (monthly) to deduct loan payments
  processPayments(state) {
    if (!state.banking || !state.banking.loans.length) return;

    let anyPayment = false;
    for (const loan of state.banking.loans) {
      if (loan.status !== 'active') continue;

      const payment = Math.min(loan.monthlyPayment, loan.remainingBalance);

      if (state.cash >= payment) {
        state.cash -= payment;

        // Split payment into principal vs interest (approximate)
        const monthlyRate = loan.annualRate / 12;
        const interestPortion = Math.floor(loan.remainingBalance * monthlyRate);
        const principalPortion = payment - interestPortion;

        loan.remainingBalance = Math.max(0, loan.remainingBalance - principalPortion);
        loan.monthsRemaining = Math.max(0, loan.monthsRemaining - 1);
        loan.totalInterestPaid += interestPortion;
        loan.missedPayments = 0;
        state.banking.interestPaid += interestPortion;
        anyPayment = true;

        // On-time payment improves credit
        state.banking.creditScore = Math.min(850, state.banking.creditScore + 1);

        if (loan.remainingBalance <= 100 || loan.monthsRemaining <= 0) {
          loan.status = 'paid';
          loan.remainingBalance = 0;
          state.banking.creditScore = Math.min(850, state.banking.creditScore + 12);
          Game.addEvent(state, {
            type: 'success',
            message: `🏦 ✅ Loan fully repaid: "${loan.name}"! Credit score +12. Total interest paid: $${Utils.formatMoney(loan.totalInterestPaid)}`,
          });
        }
      } else {
        // Missed payment
        loan.missedPayments++;
        state.banking.creditScore = Math.max(300, state.banking.creditScore - 22);

        if (loan.missedPayments === 1) {
          Game.addEvent(state, {
            type: 'danger',
            message: `⚠️ MISSED LOAN PAYMENT: "${loan.name}" — need $${Utils.formatMoney(payment)}. Credit score -22. Fix your cash flow!`,
          });
        } else if (loan.missedPayments >= 3) {
          this._defaultLoan(state, loan);
        } else {
          Game.addEvent(state, {
            type: 'danger',
            message: `🚨 OVERDUE: "${loan.name}" — ${loan.missedPayments} missed payments. Default in ${3 - loan.missedPayments} month(s)!`,
          });
        }
      }
    }

    // Clean up paid/defaulted loans
    state.banking.loans = state.banking.loans.filter(l => l.status === 'active');
  },

  _defaultLoan(state, loan) {
    loan.status = 'defaulted';
    const penalty = Math.floor(loan.remainingBalance * 0.15);
    state.cash -= penalty;
    state.banking.creditScore = Math.max(300, state.banking.creditScore - 60);
    state.reputation = Math.max(0, state.reputation - 0.75);

    Game.addEvent(state, {
      type: 'danger',
      message: `💀 LOAN DEFAULT: "${loan.name}"! Penalty: $${Utils.formatMoney(penalty)}. Credit score -60. Reputation damaged. Lenders are calling your clients!`,
    });
  },

  // Called when interest rate events fire (modifies active loans' effective rate slightly)
  applyRateChange(state, deltaRate) {
    // Only variable-rate loans (working capital, revolving) are affected
    for (const loan of state.banking.loans) {
      if (loan.typeId === 'working_capital') {
        loan.annualRate = Math.max(0.02, loan.annualRate + deltaRate);
        loan.monthlyPayment = this.monthlyPayment(loan.remainingBalance, loan.annualRate, loan.monthsRemaining);
      }
    }
  },
};
