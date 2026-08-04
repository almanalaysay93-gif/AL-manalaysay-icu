/* ============================================================
   ICU Drip Rate Calculator — Application Logic
   Based on SPMC Drips Computations Reference
   ============================================================ */

// ── Drug Database ──
const DRUGS = {
  dopamine: {
    name: 'Dopamine',
    generic: 'Dopamine HCl',
    category: 'vasopressor',
    categoryLabel: 'Vasopressor',
    icon: '💉',
    formulation: '200 mg / 5 cc vial (40 mg/cc)',
    doseUnit: 'mcg/kg/min',
    weightBased: true,
    formulaType: 'weightPerMin',
    doseRange: { min: 1, max: 20 },
    doseRangeLabels: { low: 'Renal (1–5)', mid: 'Cardiac (5–10)', high: 'Pressor (>10)' },
    concentrations: {
      '250cc': [
        { label: 'Single', drugMg: 200, drugVol: 5, diluent: 245, totalVol: 250, concMcgPerCc: 800 },
        { label: 'Double', drugMg: 400, drugVol: 10, diluent: 240, totalVol: 250, concMcgPerCc: 1600 },
        { label: 'Triple', drugMg: 600, drugVol: 15, diluent: 235, totalVol: 250, concMcgPerCc: 2400 },
        { label: 'Quadro', drugMg: 800, drugVol: 20, diluent: 230, totalVol: 250, concMcgPerCc: 3200 },
        { label: 'Penta', drugMg: 1000, drugVol: 25, diluent: 225, totalVol: 250, concMcgPerCc: 4000 },
      ],
      '100cc': [
        { label: 'Single', drugMg: 80, drugVol: 2, diluent: 98, totalVol: 100, concMcgPerCc: 800 },
        { label: 'Double', drugMg: 160, drugVol: 4, diluent: 96, totalVol: 100, concMcgPerCc: 1600 },
        { label: 'Triple', drugMg: 240, drugVol: 6, diluent: 94, totalVol: 100, concMcgPerCc: 2400 },
        { label: 'Quadro', drugMg: 320, drugVol: 8, diluent: 92, totalVol: 100, concMcgPerCc: 3200 },
        { label: 'Penta', drugMg: 400, drugVol: 10, diluent: 90, totalVol: 100, concMcgPerCc: 4000 },
      ],
      '50cc': [
        { label: 'Single', drugMg: 40, drugVol: 1, diluent: 49, totalVol: 50, concMcgPerCc: 800 },
        { label: 'Double', drugMg: 80, drugVol: 2, diluent: 48, totalVol: 50, concMcgPerCc: 1600 },
        { label: 'Triple', drugMg: 120, drugVol: 3, diluent: 47, totalVol: 50, concMcgPerCc: 2400 },
        { label: 'Quadro', drugMg: 160, drugVol: 4, diluent: 46, totalVol: 50, concMcgPerCc: 3200 },
        { label: 'Penta', drugMg: 200, drugVol: 5, diluent: 45, totalVol: 50, concMcgPerCc: 4000 },
      ],
    },
    notes: 'Low dose (1–5 mcg/kg/min): renal vasodilation. Medium (5–10): increased cardiac output. High (>10): α-adrenergic vasoconstriction.',
  },

  dobutamine: {
    name: 'Dobutamine',
    generic: 'Dobutamine HCl',
    category: 'vasopressor',
    categoryLabel: 'Inotrope',
    icon: '💉',
    formulation: '250 mg / 20 cc vial or 50 mg / 5 cc amp',
    doseUnit: 'mcg/kg/min',
    weightBased: true,
    formulaType: 'weightPerMin',
    doseRange: { min: 2.5, max: 20 },
    concentrations: {
      '250cc': [
        { label: 'Single', drugMg: 250, drugVol: 20, diluent: 230, totalVol: 250, concMcgPerCc: 1000 },
        { label: 'Double', drugMg: 500, drugVol: 40, diluent: 210, totalVol: 250, concMcgPerCc: 2000 },
        { label: 'Triple', drugMg: 750, drugVol: 60, diluent: 190, totalVol: 250, concMcgPerCc: 3000 },
        { label: 'Quadro', drugMg: 1000, drugVol: 80, diluent: 170, totalVol: 250, concMcgPerCc: 4000 },
        { label: 'Penta', drugMg: 1250, drugVol: 100, diluent: 150, totalVol: 250, concMcgPerCc: 5000 },
      ],
      '100cc': [
        { label: 'Single', drugMg: 100, drugVol: 8, diluent: 92, totalVol: 100, concMcgPerCc: 1000 },
        { label: 'Double', drugMg: 200, drugVol: 16, diluent: 84, totalVol: 100, concMcgPerCc: 2000 },
        { label: 'Triple', drugMg: 300, drugVol: 24, diluent: 76, totalVol: 100, concMcgPerCc: 3000 },
        { label: 'Quadro', drugMg: 400, drugVol: 32, diluent: 68, totalVol: 100, concMcgPerCc: 4000 },
        { label: 'Penta', drugMg: 500, drugVol: 40, diluent: 60, totalVol: 100, concMcgPerCc: 5000 },
      ],
      '50cc': [
        { label: 'Single', drugMg: 50, drugVol: 4, diluent: 46, totalVol: 50, concMcgPerCc: 1000 },
        { label: 'Double', drugMg: 100, drugVol: 8, diluent: 42, totalVol: 50, concMcgPerCc: 2000 },
        { label: 'Triple', drugMg: 150, drugVol: 12, diluent: 38, totalVol: 50, concMcgPerCc: 3000 },
        { label: 'Quadro', drugMg: 200, drugVol: 16, diluent: 34, totalVol: 50, concMcgPerCc: 4000 },
        { label: 'Penta', drugMg: 250, drugVol: 20, diluent: 30, totalVol: 50, concMcgPerCc: 5000 },
      ],
    },
    notes: 'Primarily β1-agonist for inotropy. Typical range 2.5–20 mcg/kg/min.',
  },

  levophed: {
    name: 'Levophed',
    generic: 'Norepinephrine',
    category: 'vasopressor',
    categoryLabel: 'Vasopressor',
    icon: '💉',
    formulation: '4 mg / 4 cc or 2 mg / 2 cc per ampule',
    doseUnit: 'mcg/kg/min',
    weightBased: true,
    formulaType: 'weightPerMin',
    doseRange: { min: 0.01, max: 3 },
    bolus: 'Syringe 1: Levo 2 mg + 48 cc PNSS → Syringe 2: 2 cc from S1 + 8 cc PNSS. Bolus conc: 0.0008 mg/cc.',
    concentrations: {
      '50cc': [
        { label: 'Single', drugMg: 4.0, drugVol: 4, diluent: 46, totalVol: 50, concMcgPerCc: 80, concNote: '4 mg (4 cc) + 46 cc PNSS (80 mcg/cc)' },
        { label: 'Double', drugMg: 8.0, drugVol: 8, diluent: 42, totalVol: 50, concMcgPerCc: 160, concNote: '8 mg (8 cc) + 42 cc PNSS (160 mcg/cc)' },
        { label: 'Triple', drugMg: 12.0, drugVol: 12, diluent: 38, totalVol: 50, concMcgPerCc: 240, concNote: '12 mg (12 cc) + 38 cc PNSS (240 mcg/cc)' },
        { label: 'Quadro', drugMg: 16.0, drugVol: 16, diluent: 34, totalVol: 50, concMcgPerCc: 320, concNote: '16 mg (16 cc) + 34 cc PNSS (320 mcg/cc)' },
        { label: 'Penta', drugMg: 20.0, drugVol: 20, diluent: 30, totalVol: 50, concMcgPerCc: 400, concNote: '20 mg (20 cc) + 30 cc PNSS (400 mcg/cc)' },
      ],
      '100cc': [
        { label: 'Single (4mg)', drugMg: 4.0, drugVol: 4, diluent: 96, totalVol: 100, concMcgPerCc: 40, concNote: '4 mg (4 cc) + 96 cc PNSS = 100 cc total (40 mcg/cc)' },
        { label: 'Single (8mg)', drugMg: 8.0, drugVol: 8, diluent: 92, totalVol: 100, concMcgPerCc: 80, concNote: '8 mg (8 cc) + 92 cc PNSS = 100 cc total (80 mcg/cc)' },
        { label: 'Double (16mg)', drugMg: 16.0, drugVol: 16, diluent: 84, totalVol: 100, concMcgPerCc: 160, concNote: '16 mg (16 cc) + 84 cc PNSS = 100 cc total (160 mcg/cc)' },
        { label: 'Triple (24mg)', drugMg: 24.0, drugVol: 24, diluent: 76, totalVol: 100, concMcgPerCc: 240, concNote: '24 mg (24 cc) + 76 cc PNSS = 100 cc total (240 mcg/cc)' },
        { label: 'Quadro (32mg)', drugMg: 32.0, drugVol: 32, diluent: 68, totalVol: 100, concMcgPerCc: 320, concNote: '32 mg (32 cc) + 68 cc PNSS = 100 cc total (320 mcg/cc)' },
        { label: 'Penta (40mg)', drugMg: 40.0, drugVol: 40, diluent: 60, totalVol: 100, concMcgPerCc: 400, concNote: '40 mg (40 cc) + 60 cc PNSS = 100 cc total (400 mcg/cc)' },
      ],
      '250cc': [
        { label: 'Single (4mg)', drugMg: 4.0, drugVol: 4, diluent: 246, totalVol: 250, concMcgPerCc: 16, concNote: '4 mg (4 cc) + 246 cc IVF = 250 cc total (16 mcg/cc)' },
        { label: 'Single (20mg)', drugMg: 20.0, drugVol: 20, diluent: 230, totalVol: 250, concMcgPerCc: 80, concNote: '20 mg (20 cc) + 230 cc IVF = 250 cc total (80 mcg/cc)' },
        { label: 'Double (40mg)', drugMg: 40.0, drugVol: 40, diluent: 210, totalVol: 250, concMcgPerCc: 160, concNote: '40 mg (40 cc) + 210 cc IVF = 250 cc total (160 mcg/cc)' },
        { label: 'Triple (60mg)', drugMg: 60.0, drugVol: 60, diluent: 190, totalVol: 250, concMcgPerCc: 240, concNote: '60 mg (60 cc) + 190 cc IVF = 250 cc total (240 mcg/cc)' },
        { label: 'Quadro (80mg)', drugMg: 80.0, drugVol: 80, diluent: 170, totalVol: 250, concMcgPerCc: 320, concNote: '80 mg (80 cc) + 170 cc IVF = 250 cc total (320 mcg/cc)' },
        { label: 'Penta (100mg)', drugMg: 100.0, drugVol: 100, diluent: 150, totalVol: 250, concMcgPerCc: 400, concNote: '100 mg (100 cc) + 150 cc IVF = 250 cc total (400 mcg/cc)' },
      ],
    },
    notes: 'First-line vasopressor in septic shock. Dose range 0.01–3 mcg/kg/min.',
  },

  epinephrine: {
    name: 'Epinephrine',
    generic: 'Adrenaline',
    category: 'vasopressor',
    categoryLabel: 'Vasopressor',
    icon: '💉',
    formulation: '1 mg in 1 cc ampule',
    doseUnit: 'mcg/kg/min',
    weightBased: true,
    formulaType: 'weightPerMin',
    doseRange: { min: 0.1, max: 0.9 },
    bolus: 'Bolus: 1 amp = 1,000 units.\nSyringe 1: 1 amp + 10 cc PNSS (1:10,000)\nSyringe 2: 1 cc from S1 + 10 cc PNSS (1:100,000)\nSyringe 3: 5 cc from S2 + 5 cc PNSS (1:200,000)',
    concentrations: {
      '250cc': [
        { label: 'Single', drugMg: 5, drugVol: 5, diluent: 245, totalVol: 250, concMcgPerCc: 20 },
        { label: 'Double', drugMg: 10, drugVol: 10, diluent: 240, totalVol: 250, concMcgPerCc: 40 },
        { label: 'Triple', drugMg: 15, drugVol: 15, diluent: 235, totalVol: 250, concMcgPerCc: 60 },
        { label: 'Quadro', drugMg: 20, drugVol: 20, diluent: 230, totalVol: 250, concMcgPerCc: 80 },
        { label: 'Penta', drugMg: 25, drugVol: 25, diluent: 225, totalVol: 250, concMcgPerCc: 100 },
      ],
      '100cc': [
        { label: 'Single', drugMg: 2, drugVol: 2, diluent: 98, totalVol: 100, concMcgPerCc: 20 },
        { label: 'Double', drugMg: 4, drugVol: 4, diluent: 96, totalVol: 100, concMcgPerCc: 40 },
        { label: 'Triple', drugMg: 6, drugVol: 6, diluent: 94, totalVol: 100, concMcgPerCc: 60 },
        { label: 'Quadro', drugMg: 8, drugVol: 8, diluent: 92, totalVol: 100, concMcgPerCc: 80 },
        { label: 'Penta', drugMg: 10, drugVol: 10, diluent: 90, totalVol: 100, concMcgPerCc: 100 },
      ],
      '50cc': [
        { label: 'Single', drugMg: 1, drugVol: 1, diluent: 49, totalVol: 50, concMcgPerCc: 20 },
        { label: 'Double', drugMg: 2, drugVol: 2, diluent: 48, totalVol: 50, concMcgPerCc: 40 },
        { label: 'Triple', drugMg: 3, drugVol: 3, diluent: 47, totalVol: 50, concMcgPerCc: 60 },
        { label: 'Quadro', drugMg: 4, drugVol: 4, diluent: 46, totalVol: 50, concMcgPerCc: 80 },
        { label: 'Penta', drugMg: 5, drugVol: 5, diluent: 45, totalVol: 50, concMcgPerCc: 100 },
      ],
    },
    notes: 'Maintenance infusion: 0.1–0.9 mcg/kg/min. Both α and β agonist.',
  },

  isoket: {
    name: 'Isoket',
    generic: 'Isosorbide Dinitrate',
    category: 'vasodilator',
    categoryLabel: 'Vasodilator',
    icon: '🫀',
    formulation: '10 mg / 10 cc amp',
    doseUnit: 'mg/hr',
    weightBased: false,
    formulaType: 'dosePerHour',
    doseRange: { min: 1, max: 10 },
    concentrations: {
      '100cc': [
        { label: 'Single', drugMg: 10, drugVol: 10, diluent: 90, totalVol: 100, concMgPerCc: 0.1 },
        { label: 'Double', drugMg: 20, drugVol: 20, diluent: 80, totalVol: 100, concMgPerCc: 0.2 },
        { label: 'Triple', drugMg: 30, drugVol: 30, diluent: 70, totalVol: 100, concMgPerCc: 0.3 },
        { label: 'Quadro', drugMg: 40, drugVol: 40, diluent: 60, totalVol: 100, concMgPerCc: 0.4 },
        { label: 'Penta', drugMg: 50, drugVol: 50, diluent: 50, totalVol: 100, concMgPerCc: 0.5 },
      ],
      '50cc': [
        { label: 'Single', drugMg: 5, drugVol: 5, diluent: 45, totalVol: 50, concMgPerCc: 0.1 },
        { label: 'Double', drugMg: 10, drugVol: 10, diluent: 40, totalVol: 50, concMgPerCc: 0.2 },
        { label: 'Triple', drugMg: 15, drugVol: 15, diluent: 35, totalVol: 50, concMgPerCc: 0.3 },
        { label: 'Quadro', drugMg: 20, drugVol: 20, diluent: 30, totalVol: 50, concMgPerCc: 0.4 },
        { label: 'Penta', drugMg: 25, drugVol: 25, diluent: 25, totalVol: 50, concMgPerCc: 0.5 },
      ],
    },
    notes: 'Nitrate vasodilator for angina/heart failure.',
  },

  ntg: {
    name: 'NTG',
    generic: 'Glyceryl Trinitrate (Nitroglycerin)',
    category: 'vasodilator',
    categoryLabel: 'Vasodilator',
    icon: '🫀',
    formulation: '10 mg / 10 cc amp',
    doseUnit: 'mg/hr',
    weightBased: false,
    formulaType: 'dosePerHour',
    doseRange: { min: 0.5, max: 10 },
    bolus: 'Bolus: 0.1 mg/cc IV push (1 mg + 9 cc PNSS)',
    concentrations: {
      '250cc': [
        { label: 'Single', drugMg: 25, drugVol: 25, diluent: 225, totalVol: 250, concMgPerCc: 0.1 },
        { label: 'Double', drugMg: 50, drugVol: 50, diluent: 200, totalVol: 250, concMgPerCc: 0.2 },
        { label: 'Triple', drugMg: 75, drugVol: 75, diluent: 175, totalVol: 250, concMgPerCc: 0.3 },
        { label: 'Quadro', drugMg: 100, drugVol: 100, diluent: 150, totalVol: 250, concMgPerCc: 0.4 },
        { label: 'Penta', drugMg: 125, drugVol: 125, diluent: 125, totalVol: 250, concMgPerCc: 0.5 },
      ],
      '100cc': [
        { label: 'Single', drugMg: 10, drugVol: 10, diluent: 90, totalVol: 100, concMgPerCc: 0.1 },
        { label: 'Double', drugMg: 20, drugVol: 20, diluent: 80, totalVol: 100, concMgPerCc: 0.2 },
        { label: 'Triple', drugMg: 30, drugVol: 30, diluent: 70, totalVol: 100, concMgPerCc: 0.3 },
        { label: 'Quadro', drugMg: 40, drugVol: 40, diluent: 60, totalVol: 100, concMgPerCc: 0.4 },
        { label: 'Penta', drugMg: 50, drugVol: 50, diluent: 50, totalVol: 100, concMgPerCc: 0.5 },
      ],
      '50cc': [
        { label: 'Single', drugMg: 5, drugVol: 5, diluent: 45, totalVol: 50, concMgPerCc: 0.1 },
        { label: 'Double', drugMg: 10, drugVol: 10, diluent: 40, totalVol: 50, concMgPerCc: 0.2 },
        { label: 'Triple', drugMg: 15, drugVol: 15, diluent: 35, totalVol: 50, concMgPerCc: 0.3 },
        { label: 'Quadro', drugMg: 20, drugVol: 20, diluent: 30, totalVol: 50, concMgPerCc: 0.4 },
        { label: 'Penta', drugMg: 25, drugVol: 25, diluent: 25, totalVol: 50, concMgPerCc: 0.5 },
      ],
    },
    notes: 'Nitrate vasodilator. Use non-PVC tubing.',
  },

  nicardipine: {
    name: 'Nicardipine',
    generic: 'Nicardipine HCl',
    category: 'vasodilator',
    categoryLabel: 'Vasodilator',
    icon: '🫀',
    formulation: '10 mg / 10 cc or 2 mg / 2 cc ampule',
    doseUnit: 'mg/hr',
    weightBased: false,
    formulaType: 'dosePerHour',
    doseRange: { min: 1, max: 15 },
    concentrations: {
      '100cc': [
        { label: 'Single', drugMg: 10, drugVol: 10, diluent: 90, totalVol: 100, concMgPerCc: 0.1 },
        { label: 'Double', drugMg: 20, drugVol: 20, diluent: 80, totalVol: 100, concMgPerCc: 0.2 },
        { label: 'Triple', drugMg: 30, drugVol: 30, diluent: 70, totalVol: 100, concMgPerCc: 0.3 },
        { label: 'Quadro', drugMg: 40, drugVol: 40, diluent: 60, totalVol: 100, concMgPerCc: 0.4 },
        { label: 'Penta', drugMg: 50, drugVol: 50, diluent: 50, totalVol: 100, concMgPerCc: 0.5 },
      ],
      '50cc': [
        { label: 'Single', drugMg: 5, drugVol: 5, diluent: 45, totalVol: 50, concMgPerCc: 0.1 },
        { label: 'Double', drugMg: 10, drugVol: 10, diluent: 40, totalVol: 50, concMgPerCc: 0.2 },
        { label: 'Triple', drugMg: 15, drugVol: 15, diluent: 35, totalVol: 50, concMgPerCc: 0.3 },
        { label: 'Quadro', drugMg: 20, drugVol: 20, diluent: 30, totalVol: 50, concMgPerCc: 0.4 },
        { label: 'Penta', drugMg: 25, drugVol: 25, diluent: 25, totalVol: 50, concMgPerCc: 0.5 },
      ],
    },
    notes: 'Calcium channel blocker for hypertensive emergencies. Typical 5–15 mg/hr.',
  },

  cordarone: {
    name: 'Cordarone',
    generic: 'Amiodarone',
    category: 'antiarrhythmic',
    categoryLabel: 'Antiarrhythmic',
    icon: '⚡',
    formulation: '150 mg / 3 cc per ampule',
    doseUnit: 'mg/hr',
    weightBased: false,
    formulaType: 'dosePerHour',
    doseRange: { min: 0.5, max: 50 },
    bolus: 'IVTT bolus: 150 mg slow IV push',
    concentrations: {
      '250cc': [
        { label: 'Standard', drugMg: 600, drugVol: 12, diluent: 238, totalVol: 250, concMgPerCc: 2.4, concMcgPerCc: 2400, concNote: '600 mg + D5W 238 cc, run over 24 hrs (25 mg/hr)' },
        { label: 'High', drugMg: 1000, drugVol: 50, diluent: 200, totalVol: 250, concMgPerCc: 4.0, concMcgPerCc: 4000 },
        { label: 'Double', drugMg: 2000, drugVol: 100, diluent: 150, totalVol: 250, concMgPerCc: 8.0, concMcgPerCc: 8000 },
      ],
      '100cc': [
        { label: 'Standard', drugMg: 400, drugVol: 8, diluent: 92, totalVol: 100, concMgPerCc: 4.0, concMcgPerCc: 4000 },
        { label: 'Double', drugMg: 800, drugVol: 16, diluent: 84, totalVol: 100, concMgPerCc: 8.0, concMcgPerCc: 8000 },
      ],
      '50cc': [
        { label: 'Standard', drugMg: 200, drugVol: 10, diluent: 40, totalVol: 50, concMgPerCc: 4.0, concMcgPerCc: 4000 },
        { label: 'Double', drugMg: 400, drugVol: 20, diluent: 30, totalVol: 50, concMgPerCc: 8.0, concMcgPerCc: 8000 },
      ],
    },
    notes: 'Standard protocol: 150 mg bolus → 1 mg/min × 6 hrs → 0.5 mg/min × 18 hrs.',
  },

  esmolol: {
    name: 'Esmolol',
    generic: 'Esmolol HCl',
    category: 'antiarrhythmic',
    categoryLabel: 'Antiarrhythmic',
    icon: '⚡',
    formulation: '100 mg / 10 ml per ampule',
    doseUnit: 'mcg/kg/min',
    weightBased: true,
    formulaType: 'weightPerMin',
    doseRange: { min: 25, max: 200 },
    bolus: 'IV loading dose: 0.5 mg/kg over 1 min. Starting maintenance: 50 mcg/kg/min.',
    concentrations: {
      '80cc': [
        { label: 'Standard', drugMg: 600, drugVol: 60, diluent: 20, totalVol: 80, concMcgPerCc: 7500, concNote: 'D5W 20 cc + 6 amps' },
      ],
    },
    notes: 'Ultra-short-acting β-blocker. Loading 0.5 mg/kg, maintenance 25–200 mcg/kg/min.',
  },

  precedex: {
    name: 'Precedex',
    generic: 'Dexmedetomidine',
    category: 'sedative',
    categoryLabel: 'Sedative',
    icon: '😴',
    formulation: '100 mcg / ml (2 cc)',
    doseUnit: 'mcg/kg/hr',
    weightBased: true,
    formulaType: 'weightPerHour',
    doseRange: { min: 0.1, max: 0.8 },
    concentrations: {
      '100cc': [
        { label: 'Standard', drugMg: 0.2, drugVol: 2, diluent: 98, totalVol: 100, concMcgPerCc: 2, concNote: '200 mcg in 100 cc PNSS (Soluset)' },
        { label: 'Double', drugMg: 0.4, drugVol: 4, diluent: 96, totalVol: 100, concMcgPerCc: 4, concNote: '400 mcg in 100 cc PNSS (Soluset)' },
      ],
      '50cc': [
        { label: 'Standard', drugMg: 0.2, drugVol: 2, diluent: 48, totalVol: 50, concMcgPerCc: 4, concNote: '200 mcg in 50 cc PNSS' },
      ],
    },
    notes: 'α2-agonist sedative. Dose: 0.1–0.8 mcg/kg/hr. No respiratory depression at standard doses.',
  },

  heparin: {
    name: 'Heparin',
    generic: 'Unfractionated Heparin',
    category: 'anticoagulant',
    categoryLabel: 'Anticoagulant',
    icon: '🩸',
    formulation: '1000 IU/ml or 5000 IU/ml',
    doseUnit: 'units/hr',
    weightBased: false,
    formulaType: 'heparin',
    doseRange: { min: 500, max: 2500 },
    bolus: 'Loading dose: 3,000–5,000 IU slow IV push',
    concentrations: {
      '250cc': [
        { label: 'Standard', drugUnits: 10000, totalVol: 250, concUnitsPerCc: 40, concNote: '10,000 IU in D5W 250 cc' },
        { label: 'Double', drugUnits: 20000, totalVol: 250, concUnitsPerCc: 80, concNote: '20,000 IU in D5W 250 cc' },
        { label: 'High', drugUnits: 25000, totalVol: 250, concUnitsPerCc: 100, concNote: '25,000 IU in D5W 250 cc' },
      ],
      '100cc': [
        { label: 'Standard', drugUnits: 4000, totalVol: 100, concUnitsPerCc: 40, concNote: '4,000 IU in D5W 100 cc (Soluset)' },
        { label: 'Double', drugUnits: 8000, totalVol: 100, concUnitsPerCc: 80, concNote: '8,000 IU in D5W 100 cc (Soluset)' },
        { label: 'High', drugUnits: 10000, totalVol: 100, concUnitsPerCc: 100, concNote: '10,000 IU in D5W 100 cc (Soluset)' },
      ],
    },
    weightBasedOption: true,
    notes: 'Can dose as units/hr or units/kg/hr (typically 18 units/kg/hr). Monitor aPTT.',
  },

  streptokinase: {
    name: 'Streptokinase',
    generic: 'Streptokinase',
    category: 'thrombolytic',
    categoryLabel: 'Thrombolytic',
    icon: '🫁',
    formulation: '1,500,000 IU per vial',
    doseUnit: 'protocol',
    weightBased: false,
    formulaType: 'protocol',
    protocols: [
      { name: 'Acute MI', dose: '1,500,000 IU', diluent: 'PNSS 100 cc', duration: '30–60 min' },
      { name: 'Intracoronary', dose: '250,000–500,000 IU', diluent: 'PNSS 100 cc', duration: '30–60 min' },
      { name: 'Acute DVT / PE / Arterial Occlusion', dose: '250,000 IU', diluent: 'PNSS 100 cc', duration: '30 min' },
      { name: 'Maintenance', dose: '1,200,000 IU', diluent: 'PNSS 500 cc', duration: '100,000 IU/hr × 12 hr/day × 3 days' },
    ],
    notes: 'Thrombolytic agent. Monitor for bleeding. Contraindicated with recent surgery.',
  },

  magnesium: {
    name: 'MgSO₄',
    generic: 'Magnesium Sulfate',
    category: 'electrolyte',
    categoryLabel: 'Electrolyte',
    icon: '⚗️',
    formulation: '2500 mg / 10 cc amp or 5000 mg / 20 cc polyamp',
    doseUnit: 'mg/hr',
    weightBased: false,
    formulaType: 'dosePerHour',
    doseRange: { min: 500, max: 3000 },
    concentrations: {
      '250cc': [
        { label: 'Single', drugMg: 1000, drugVol: 4, diluent: 246, totalVol: 250, concMgPerCc: 4 },
        { label: 'Double', drugMg: 2000, drugVol: 8, diluent: 242, totalVol: 250, concMgPerCc: 8 },
        { label: 'Triple', drugMg: 3000, drugVol: 12, diluent: 238, totalVol: 250, concMgPerCc: 12 },
        { label: 'Quadro', drugMg: 4000, drugVol: 16, diluent: 234, totalVol: 250, concMgPerCc: 16 },
        { label: 'Penta', drugMg: 5000, drugVol: 20, diluent: 230, totalVol: 250, concMgPerCc: 20 },
      ],
      '100cc': [
        { label: 'Single', drugMg: 400, drugVol: 1.6, diluent: 98.4, totalVol: 100, concMgPerCc: 4 },
        { label: 'Double', drugMg: 800, drugVol: 3.2, diluent: 96.8, totalVol: 100, concMgPerCc: 8 },
        { label: 'Triple', drugMg: 1200, drugVol: 4.8, diluent: 95.2, totalVol: 100, concMgPerCc: 12 },
        { label: 'Quadro', drugMg: 1600, drugVol: 6.4, diluent: 93.6, totalVol: 100, concMgPerCc: 16 },
        { label: 'Penta', drugMg: 2000, drugVol: 8, diluent: 92, totalVol: 100, concMgPerCc: 20 },
      ],
      '50cc': [
        { label: 'Single', drugMg: 200, drugVol: 0.8, diluent: 49.2, totalVol: 50, concMgPerCc: 4 },
        { label: 'Double', drugMg: 400, drugVol: 1.6, diluent: 48.4, totalVol: 50, concMgPerCc: 8 },
        { label: 'Triple', drugMg: 600, drugVol: 2.4, diluent: 47.6, totalVol: 50, concMgPerCc: 12 },
        { label: 'Quadro', drugMg: 800, drugVol: 3.2, diluent: 46.8, totalVol: 50, concMgPerCc: 16 },
        { label: 'Penta', drugMg: 1000, drugVol: 4, diluent: 46, totalVol: 50, concMgPerCc: 20 },
      ],
    },
    notes: 'Can also be given slow IVTT bolus with 1:1 dilution. Monitor for respiratory depression.',
  },

  potassium: {
    name: 'K⁺ Replacement',
    generic: 'Potassium Chloride (KCL)',
    category: 'electrolyte',
    categoryLabel: 'Electrolyte',
    icon: '⚗️',
    formulation: 'KCL stock: 40 mEq / 20 cc',
    doseUnit: 'mEq',
    weightBased: true,
    formulaType: 'electrolyteDeficit',
    normalValue: 4.0,
    adultFactor: 0.3,
    pedsFactor: 0.6,
    stockConc: 40, // mEq per vial
    stockVol: 20,  // cc per vial
    notes: 'K⁺ deficit: Adult = (4 – pt value) × kg × 0.3; Pedia = (4 – pt value) × kg × 0.6. Max IV rate: 10–20 mEq/hr via central line.',
  },

  sodium: {
    name: 'Na⁺ Replacement',
    generic: 'Sodium Chloride',
    category: 'electrolyte',
    categoryLabel: 'Electrolyte',
    icon: '⚗️',
    formulation: 'Hypertonic saline',
    doseUnit: 'mEq',
    weightBased: true,
    formulaType: 'electrolyteDeficitNa',
    normalValue: 140,
    adultFactor: 0.3,
    pedsFactor: 0.6,
    notes: 'Na⁺ deficit = (normal – pt value) × kg × factor. Maintenance = kg × 2 mEq. Total = deficit + maintenance.',
  },

  bicarb: {
    name: 'NaHCO₃',
    generic: 'Sodium Bicarbonate',
    category: 'electrolyte',
    categoryLabel: 'Electrolyte',
    icon: '⚗️',
    formulation: 'Sodium Bicarbonate amp',
    doseUnit: 'mEq',
    weightBased: true,
    formulaType: 'bicarbDeficit',
    notes: 'Full correction = base deficit × kg × 0.3. Half correction = base deficit × kg × 0.3 ÷ 2.',
  },

  lidocaine: {
    name: 'Lidocaine',
    generic: 'Lidocaine HCl',
    category: 'antiarrhythmic',
    categoryLabel: 'Antiarrhythmic',
    icon: '⚡',
    formulation: '1000 mg / 50 cc vial or 100 mg / 5 cc respule',
    doseUnit: 'mg/min',
    weightBased: false,
    formulaType: 'dosePerMin',
    doseRange: { min: 1, max: 4 },
    concentrations: {
      '250cc': [
        { label: 'Standard', drugMg: 1000, drugVol: 50, diluent: 200, totalVol: 250, concMgPerCc: 4 },
        { label: 'Double', drugMg: 2000, drugVol: 100, diluent: 150, totalVol: 250, concMgPerCc: 8 },
      ],
      '100cc': [
        { label: 'Standard', drugMg: 400, drugVol: 20, diluent: 80, totalVol: 100, concMgPerCc: 4 },
        { label: 'Double', drugMg: 800, drugVol: 40, diluent: 60, totalVol: 100, concMgPerCc: 8 },
      ],
    },
    notes: 'Antiarrhythmic for ventricular arrhythmias. Loading 1–1.5 mg/kg, maintenance 1–4 mg/min.',
  },

  customDrip: {
    name: 'Custom Drip Calculator',
    generic: 'Universal / Any Drug Drip Rate',
    category: 'other',
    categoryLabel: 'Calculator',
    icon: '🧮',
    formulation: 'Custom Concentration & Dilution',
    doseUnit: 'custom',
    weightBased: true,
    formulaType: 'customDrip',
    notes: 'Use this universal calculator for any custom drug dose, weight, or container volume not in preset tables.',
  },
};

// ── Category Config ──
const CATEGORIES = [
  { key: 'all', label: 'All Drugs', icon: '💊' },
  { key: 'other', label: 'Custom Calc', icon: '🧮' },
  { key: 'vasopressor', label: 'Vasopressors', icon: '💉' },
  { key: 'vasodilator', label: 'Vasodilators', icon: '🫀' },
  { key: 'antiarrhythmic', label: 'Antiarrhythmics', icon: '⚡' },
  { key: 'sedative', label: 'Sedatives', icon: '😴' },
  { key: 'anticoagulant', label: 'Anticoagulants', icon: '🩸' },
  { key: 'thrombolytic', label: 'Thrombolytics', icon: '🫁' },
  { key: 'electrolyte', label: 'Electrolytes', icon: '⚗️' },
];

// ── State ──
const state = {
  selectedDrug: null,
  selectedCategory: 'all',
  searchQuery: '',
  calcMode: 'doseToRate', // or 'rateToDose'
  selectedVolume: '250cc', // default IVF volume key
  selectedConc: 0,        // index into concentration array
  weight: '',
  dose: '',
  rate: '',
  heparinMode: 'unitsPerHr', // or 'unitsPerKgPerHr'
  patientType: 'adult',      // or 'pedia'
  labValue: '',
  baseDeficit: '',
};

// ── Utility Functions ──
function formatNumber(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (Number.isInteger(n) && decimals <= 2) return n.toString();
  return parseFloat(n.toFixed(decimals)).toString();
}

function getConcentration(drug, volKey, concIndex) {
  const volKeys = Object.keys(drug.concentrations);
  const vk = volKey || volKeys[0];
  const concs = drug.concentrations[vk];
  if (!concs || !concs[concIndex]) return null;
  return concs[concIndex];
}

function getAvailableVolumes(drug) {
  if (!drug || !drug.concentrations) return [];
  return Object.keys(drug.concentrations);
}

// ── Calculation Engine ──
function calculateDoseToRate(drug, dose, weight, concentration) {
  if (!dose || !concentration) return null;

  switch (drug.formulaType) {
    case 'weightPerMin': {
      // FR (cc/hr) = dose(mcg/kg/min) × wt × 60 / concentration(mcg/cc)
      if (!weight) return null;
      const conc = concentration.concMcgPerCc;
      const rate = (dose * weight * 60) / conc;
      return { rate, unit: 'cc/hr', conc, concUnit: 'mcg/cc' };
    }
    case 'weightPerHour': {
      // FR (cc/hr) = dose(mcg/kg/hr) × wt / concentration(mcg/cc)
      if (!weight) return null;
      const conc = concentration.concMcgPerCc;
      const rate = (dose * weight) / conc;
      return { rate, unit: 'cc/hr', conc, concUnit: 'mcg/cc' };
    }
    case 'dosePerHour': {
      // FR (cc/hr) = dose(mg/hr) / concentration(mg/cc)
      const conc = concentration.concMgPerCc || (concentration.concMcgPerCc ? concentration.concMcgPerCc / 1000 : null);
      if (!conc) return null;
      const rate = dose / conc;
      return { rate, unit: 'cc/hr', conc, concUnit: 'mg/cc' };
    }
    case 'dosePerMin': {
      // FR (cc/hr) = dose(mg/min) × 60 / concentration(mg/cc)
      const conc = concentration.concMgPerCc || (concentration.concMcgPerCc ? concentration.concMcgPerCc / 1000 : null);
      if (!conc) return null;
      const rate = (dose * 60) / conc;
      return { rate, unit: 'cc/hr', conc, concUnit: 'mg/cc' };
    }
    case 'heparin': {
      const conc = concentration.concUnitsPerCc;
      let rate;
      if (state.heparinMode === 'unitsPerKgPerHr') {
        if (!weight) return null;
        rate = (dose * weight) / conc;
      } else {
        rate = dose / conc;
      }
      return { rate, unit: 'cc/hr', conc, concUnit: 'units/cc' };
    }
    default:
      return null;
  }
}

function calculateRateToDose(drug, rate, weight, concentration) {
  if (!rate || !concentration) return null;

  switch (drug.formulaType) {
    case 'weightPerMin': {
      if (!weight) return null;
      const conc = concentration.concMcgPerCc;
      const dose = (rate * conc) / (weight * 60);
      return { dose, unit: drug.doseUnit, conc, concUnit: 'mcg/cc' };
    }
    case 'weightPerHour': {
      if (!weight) return null;
      const conc = concentration.concMcgPerCc;
      const dose = (rate * conc) / weight;
      return { dose, unit: drug.doseUnit, conc, concUnit: 'mcg/cc' };
    }
    case 'dosePerHour': {
      const conc = concentration.concMgPerCc || (concentration.concMcgPerCc ? concentration.concMcgPerCc / 1000 : null);
      if (!conc) return null;
      const dose = rate * conc;
      return { dose, unit: drug.doseUnit, conc, concUnit: 'mg/cc' };
    }
    case 'dosePerMin': {
      const conc = concentration.concMgPerCc || (concentration.concMcgPerCc ? concentration.concMcgPerCc / 1000 : null);
      if (!conc) return null;
      const dose = (rate * conc) / 60;
      return { dose, unit: drug.doseUnit, conc, concUnit: 'mg/cc' };
    }
    case 'heparin': {
      const conc = concentration.concUnitsPerCc;
      let dose;
      if (state.heparinMode === 'unitsPerKgPerHr') {
        if (!weight) return null;
        dose = (rate * conc) / weight;
      } else {
        dose = rate * conc;
      }
      return { dose, unit: state.heparinMode === 'unitsPerKgPerHr' ? 'units/kg/hr' : 'units/hr', conc, concUnit: 'units/cc' };
    }
    default:
      return null;
  }
}

function calculateElectrolyteDeficit(drug, labValue, weight, patientType) {
  if (!labValue || !weight || labValue === '' || weight === '') return null;

  const factor = patientType === 'pedia' ? drug.pedsFactor : drug.adultFactor;
  const deficit = (drug.normalValue - parseFloat(labValue)) * parseFloat(weight) * factor;

  if (drug.formulaType === 'electrolyteDeficit') {
    // K+ replacement
    const stockCc = (deficit / drug.stockConc) * drug.stockVol;
    return {
      deficit: Math.max(0, deficit),
      stockCc: Math.max(0, stockCc),
      unit: 'mEq',
    };
  }

  if (drug.formulaType === 'electrolyteDeficitNa') {
    // Na replacement
    const maintenance = parseFloat(weight) * 2;
    const total = Math.max(0, deficit) + maintenance;
    return {
      deficit: Math.max(0, deficit),
      maintenance,
      total,
      unit: 'mEq',
    };
  }

  return null;
}

function calculateBicarbDeficit(baseDeficit, weight) {
  if (!baseDeficit || !weight) return null;
  const bd = parseFloat(baseDeficit);
  const wt = parseFloat(weight);
  const full = bd * wt * 0.3;
  const half = full / 2;
  return { full, half, unit: 'mEq' };
}

function getDoseWarning(drug, dose) {
  if (!drug.doseRange || !dose) return null;
  const d = parseFloat(dose);
  if (isNaN(d)) return null;

  if (d < drug.doseRange.min) {
    return { type: 'info', message: `Below typical range (${drug.doseRange.min}–${drug.doseRange.max} ${drug.doseUnit})` };
  }
  if (d > drug.doseRange.max * 1.5) {
    return { type: 'danger', message: `⚠ Significantly exceeds max dose (${drug.doseRange.max} ${drug.doseUnit})!` };
  }
  if (d > drug.doseRange.max) {
    return { type: 'warning', message: `Exceeds typical max (${drug.doseRange.max} ${drug.doseUnit})` };
  }
  return { type: 'success', message: `Within range (${drug.doseRange.min}–${drug.doseRange.max} ${drug.doseUnit})` };
}

function getDoseRangePercent(drug, dose) {
  if (!drug.doseRange || !dose) return 0;
  const d = parseFloat(dose);
  if (isNaN(d)) return 0;
  const range = drug.doseRange.max - drug.doseRange.min;
  const pct = ((d - drug.doseRange.min) / range) * 100;
  return Math.min(100, Math.max(0, pct));
}

// ── UI Rendering ──
function renderDrugGrid() {
  const grid = document.getElementById('drugGrid');
  const drugs = getFilteredDrugs();

  if (drugs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No drugs found</h3>
        <p>Try adjusting your search or category filter</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = drugs.map(([key, drug]) => `
    <div class="drug-card cat-${drug.category}" data-drug="${key}" onclick="openCalculator('${key}')">
      <div class="drug-card-banner">
        <img src="assets/meds/${key}.png" alt="${drug.name}" class="drug-card-banner-img" onerror="this.style.display='none';"/>
        <span class="drug-card-badge">${drug.categoryLabel}</span>
      </div>
      <div class="drug-card-body">
        <div class="drug-card-name">${drug.name}</div>
        <div class="drug-card-generic">${drug.generic}</div>
        <div class="drug-card-info">
          <div class="drug-card-tag">
            <span>📐</span> ${drug.doseUnit}
          </div>
          ${drug.weightBased ? '<div class="drug-card-tag"><span>⚖️</span> Weight-based</div>' : ''}
          ${drug.doseRange ? `<div class="drug-card-tag"><span>📊</span> ${drug.doseRange.min}–${drug.doseRange.max}</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function getFilteredDrugs() {
  return Object.entries(DRUGS).filter(([key, drug]) => {
    const matchesCategory = state.selectedCategory === 'all' || drug.category === state.selectedCategory;
    const q = state.searchQuery.toLowerCase();
    const matchesSearch = !q ||
      drug.name.toLowerCase().includes(q) ||
      drug.generic.toLowerCase().includes(q) ||
      drug.categoryLabel.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });
}

function renderCategoryPills() {
  const container = document.getElementById('categoryPills');
  container.innerHTML = CATEGORIES.map(cat => `
    <button class="category-pill ${state.selectedCategory === cat.key ? 'active' : ''}"
            onclick="selectCategory('${cat.key}')">
      ${cat.icon} ${cat.label}
    </button>
  `).join('');
}

function selectCategory(key) {
  state.selectedCategory = key;
  renderCategoryPills();
  renderDrugGrid();
}

// ── Calculator Panel ──
function openCalculator(drugKey) {
  const drug = DRUGS[drugKey];
  if (!drug) return;

  state.selectedDrug = drugKey;
  state.calcMode = 'doseToRate';
  state.dose = '';
  state.rate = '';

  // Set default volume
  const volumes = getAvailableVolumes(drug);
  state.selectedVolume = volumes.length > 0 ? volumes[0] : '250cc';
  state.selectedConc = 0;

  renderCalculatorPanel(drug);
  recalculate(drug);

  document.getElementById('calcOverlay').classList.add('open');
  document.getElementById('calcPanel').classList.add('open');
}

function closeCalculator() {
  closeDosingTable();
  if (typeof closeMathCalc === 'function') closeMathCalc();
  if (typeof closeQuickRef === 'function') closeQuickRef();
  document.getElementById('calcOverlay').classList.remove('open');
  document.getElementById('calcPanel').classList.remove('open');
  state.selectedDrug = null;
}

function renderCalculatorPanel(drug) {
  const panel = document.getElementById('calcPanelContent');

  // Header content and background image
  const key = state.selectedDrug;
  const header = document.querySelector('.calc-panel-header');
  if (header && key) {
    header.style.backgroundImage = `linear-gradient(180deg, rgba(2, 59, 114, 0.55) 0%, rgba(15, 23, 42, 0.88) 100%), url('assets/meds/${key}.png')`;
    header.style.backgroundSize = 'cover';
    header.style.backgroundPosition = 'center';
  }

  document.getElementById('calcDrugName').textContent = drug.name;
  document.getElementById('calcDrugGeneric').textContent = drug.generic;
  document.getElementById('calcDrugFormulation').textContent = drug.formulation;

  // Build panel content based on drug type
  let html = '';

  // Special: custom universal drip calculator
  if (drug.formulaType === 'customDrip') {
    html = renderCustomDripPanel(drug);
  }
  // Special: protocol-based drugs (streptokinase)
  else if (drug.formulaType === 'protocol') {
    html = renderProtocolPanel(drug);
  }
  // Special: electrolyte deficit calculators
  else if (drug.formulaType === 'electrolyteDeficit' || drug.formulaType === 'electrolyteDeficitNa') {
    html = renderElectrolytePanel(drug);
  }
  // Special: bicarb deficit
  else if (drug.formulaType === 'bicarbDeficit') {
    html = renderBicarbPanel(drug);
  }
  // Standard drip calculators
  else {
    html = renderStandardPanel(drug);
  }

  panel.innerHTML = html;
  attachCalcListeners(drug);
}

function renderStandardPanel(drug) {
  const volumes = getAvailableVolumes(drug);
  const concs = drug.concentrations[state.selectedVolume] || [];

  let html = '';

  // Mode Switcher
  html += `
    <div class="mode-switcher">
      <button class="mode-btn ${state.calcMode === 'doseToRate' ? 'active' : ''}" onclick="setCalcMode('doseToRate')">
        Dose → Rate
      </button>
      <button class="mode-btn ${state.calcMode === 'rateToDose' ? 'active' : ''}" onclick="setCalcMode('rateToDose')">
        Rate → Dose
      </button>
    </div>

    <!-- Prominent Full Dosing Table Button at Top -->
    <div style="padding: 0 16px; margin-bottom: 12px;">
      <button class="formula-toggle-btn" style="background: linear-gradient(135deg, var(--orange-500), var(--orange-600)); color: var(--white); border: none; font-size: 0.88rem; padding: 12px; box-shadow: var(--shadow-orange);" onclick="openDosingTable()">
        📊 View Full Bedside Dosing Table (Min → Max Dose)
      </button>
    </div>
  `;

  // Bolus info
  if (drug.bolus) {
    html += `
      <div class="calc-section" style="padding: 0 0;">
        <div class="bolus-card">
          <div class="bolus-title">💉 Bolus / Loading Dose</div>
          <div class="bolus-text">${drug.bolus.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
    `;
  }

  // Weight input (if weight-based)
  if (drug.weightBased) {
    html += `
      <div class="calc-section">
        <div class="calc-section-title">Patient Weight</div>
        <div class="input-group">
          <div class="input-wrapper">
            <input type="number" class="input-field" id="calcWeight" placeholder="Enter weight"
                   value="${state.weight}" step="0.1" min="0" inputmode="decimal">
            <span class="input-suffix">kg</span>
          </div>
        </div>
      </div>
    `;
  }

  // Heparin mode toggle
  if (drug.formulaType === 'heparin') {
    html += `
      <div class="calc-section">
        <div class="calc-section-title">Dosing Mode</div>
        <div class="vol-toggle">
          <button class="vol-btn ${state.heparinMode === 'unitsPerHr' ? 'active' : ''}" onclick="setHeparinMode('unitsPerHr')">
            <div class="vol-btn-label">units/hr</div>
            <div class="vol-btn-desc">Fixed rate</div>
          </button>
          <button class="vol-btn ${state.heparinMode === 'unitsPerKgPerHr' ? 'active' : ''}" onclick="setHeparinMode('unitsPerKgPerHr')">
            <div class="vol-btn-label">units/kg/hr</div>
            <div class="vol-btn-desc">Weight-based</div>
          </button>
        </div>
      </div>
    `;
  }

  // Volume selector
  if (volumes.length > 1) {
    html += `
      <div class="calc-section">
        <div class="calc-section-title">IVF / Solution Volume</div>
        <div class="vol-toggle">
          ${volumes.map(v => `
            <button class="vol-btn ${state.selectedVolume === v ? 'active' : ''}" onclick="setVolume('${v}')">
              <div class="vol-btn-label">${v}</div>
              <div class="vol-btn-desc">${v === '50cc' ? 'Syringe Pump' : v === '100cc' ? 'Soluset' : v === '80cc' ? 'Custom Mix' : 'IVF Bag'}</div>
            </button>
          `).join('')}
          <button class="vol-btn ${state.selectedVolume === 'custom' ? 'active' : ''}" onclick="setVolume('custom')">
            <div class="vol-btn-label">Custom</div>
            <div class="vol-btn-desc">Custom Vol</div>
          </button>
        </div>
        ${state.selectedVolume === 'custom' ? `
          <div class="input-group" style="margin-top: 10px;">
            <div class="input-label"><span class="input-label-text">Custom Container Solution Volume</span></div>
            <div class="input-wrapper">
              <input type="number" class="input-field" id="presetCustomVol" placeholder="e.g. 150" value="${state.presetCustomVol || ''}" step="any" min="1" inputmode="decimal">
              <span class="input-suffix">mL (cc)</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Concentration selector
  if (concs.length > 0 || state.selectedVolume === 'custom') {
    html += `
      <div class="calc-section">
        <div class="calc-section-title">Concentration</div>
        <div class="conc-grid">
          ${concs.map((c, i) => {
            const concVal = c.concMcgPerCc ? `${formatNumber(c.concMcgPerCc)} mcg/cc` :
                           c.concMgPerCc ? `${formatNumber(c.concMgPerCc)} mg/cc` :
                           c.concUnitsPerCc ? `${formatNumber(c.concUnitsPerCc)} U/cc` : '';
            const mixInfo = c.drugUnits
              ? `${c.drugUnits.toLocaleString()} IU in ${c.totalVol} cc`
              : `${c.drugVol} cc + ${c.diluent} cc IVF`;
            return `
              <div class="conc-option ${state.selectedConc === i ? 'active' : ''}" onclick="setConc(${i})">
                <div class="conc-option-label">${c.label}</div>
                <div class="conc-option-value">${concVal}</div>
                <div class="conc-option-mix">${mixInfo}</div>
              </div>
            `;
          }).join('')}
          <div class="conc-option ${state.selectedConc === 'custom' ? 'active' : ''}" onclick="setConc('custom')">
            <div class="conc-option-label">Custom</div>
            <div class="conc-option-value">Custom Mix</div>
            <div class="conc-option-mix">Enter Drug Amount</div>
          </div>
        </div>

        ${(state.selectedConc === 'custom' || state.selectedVolume === 'custom') ? `
          <div class="mixing-card" style="margin-top: 12px; background: var(--orange-50); border-color: var(--orange-200);">
            <div class="mixing-title">🧪 Custom Drug Incorporation</div>
            <div class="input-group" style="margin-bottom: 8px;">
              <div class="input-label"><span class="input-label-text">Total Drug Amount Added</span></div>
              <div class="input-wrapper">
                <input type="number" class="input-field" id="presetCustomAmt" placeholder="e.g. 200" value="${state.presetCustomAmt || ''}" step="any" min="0" inputmode="decimal">
                <span class="input-suffix">${drug.formulaType === 'heparin' ? 'IU' : drug.doseUnit.startsWith('mcg') ? 'mg' : 'mg'}</span>
              </div>
            </div>
            <div id="presetCustomConcSummary" style="font-size: 0.8rem; font-weight: 700; color: var(--orange-700); margin-top: 4px;"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Dose / Rate input
  if (state.calcMode === 'doseToRate') {
    const doseUnit = drug.formulaType === 'heparin'
      ? (state.heparinMode === 'unitsPerKgPerHr' ? 'units/kg/hr' : 'units/hr')
      : drug.doseUnit;
    html += `
      <div class="calc-section">
        <div class="calc-section-title">Desired Dose</div>
        <div class="input-group">
          <div class="input-wrapper">
            <input type="number" class="input-field" id="calcDose" placeholder="Enter dose"
                   value="${state.dose}" step="any" min="0" inputmode="decimal">
            <span class="input-suffix">${doseUnit}</span>
          </div>
        </div>
        <div id="doseWarning"></div>
        ${drug.doseRange ? `
          <div class="dose-range-bar" id="doseRangeBar">
            <div class="dose-range-track">
              <div class="dose-range-fill"></div>
              <div class="dose-range-marker" id="doseMarker" style="left: 0%"></div>
            </div>
            <div class="dose-range-labels">
              <span>${drug.doseRange.min} ${doseUnit}</span>
              <span>${drug.doseRange.max} ${doseUnit}</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    html += `
      <div class="calc-section">
        <div class="calc-section-title">Current Flow Rate</div>
        <div class="input-group">
          <div class="input-wrapper">
            <input type="number" class="input-field" id="calcRate" placeholder="Enter rate"
                   value="${state.rate}" step="any" min="0" inputmode="decimal">
            <span class="input-suffix">cc/hr</span>
          </div>
        </div>
      </div>
    `;
  }

  // Result area
  html += '<div id="calcResult"></div>';

  // Mixing instructions
  if (concs.length > 0) {
    const c = concs[state.selectedConc];
    if (c) {
      html += `
        <div class="mixing-card">
          <div class="mixing-title">🧪 Mixing Instructions — ${c.label}</div>
          ${c.concNote ? `<div class="mixing-row"><span class="mixing-label">Note</span><span class="mixing-value">${c.concNote}</span></div>` : ''}
          ${c.drugMg !== undefined ? `<div class="mixing-row"><span class="mixing-label">Drug</span><span class="mixing-value">${c.drugMg} mg (${c.drugVol} cc)</span></div>` : ''}
          ${c.drugUnits !== undefined ? `<div class="mixing-row"><span class="mixing-label">Drug</span><span class="mixing-value">${c.drugUnits.toLocaleString()} IU</span></div>` : ''}
          <div class="mixing-row"><span class="mixing-label">Diluent</span><span class="mixing-value">${c.diluent !== undefined ? c.diluent + ' cc IVF' : c.totalVol + ' cc total'}</span></div>
          <div class="mixing-row"><span class="mixing-label">Total Volume</span><span class="mixing-value">${c.totalVol} cc</span></div>
          <div class="mixing-row"><span class="mixing-label">Concentration</span><span class="mixing-value">${c.concMcgPerCc ? formatNumber(c.concMcgPerCc) + ' mcg/cc' : c.concMgPerCc ? formatNumber(c.concMgPerCc) + ' mg/cc' : c.concUnitsPerCc ? formatNumber(c.concUnitsPerCc) + ' U/cc' : ''}</span></div>
        </div>
      `;
    }
  }

  // Notes
  if (drug.notes) {
    html += `
      <div class="calc-section" style="margin-top: 16px;">
        <div class="dose-warning info">
          <span class="dose-warning-icon">ℹ️</span>
          <span>${drug.notes}</span>
        </div>
      </div>
    `;
  }

  return html;
}

function renderProtocolPanel(drug) {
  let html = '<div class="calc-section" style="margin-top: 16px;">';
  html += '<div class="calc-section-title">Protocols</div>';

  drug.protocols.forEach(p => {
    html += `
      <div class="mixing-card" style="margin-bottom: 10px;">
        <div class="mixing-title">📋 ${p.name}</div>
        <div class="mixing-row"><span class="mixing-label">Dose</span><span class="mixing-value">${p.dose}</span></div>
        <div class="mixing-row"><span class="mixing-label">Diluent</span><span class="mixing-value">${p.diluent}</span></div>
        <div class="mixing-row"><span class="mixing-label">Duration</span><span class="mixing-value">${p.duration}</span></div>
      </div>
    `;
  });

  if (drug.notes) {
    html += `
      <div class="dose-warning info" style="margin-top: 12px;">
        <span class="dose-warning-icon">ℹ️</span>
        <span>${drug.notes}</span>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

function renderElectrolytePanel(drug) {
  let html = '';

  // Patient type toggle
  html += `
    <div class="calc-section" style="margin-top: 16px;">
      <div class="calc-section-title">Patient Type</div>
      <div class="vol-toggle">
        <button class="vol-btn ${state.patientType === 'adult' ? 'active' : ''}" onclick="setPatientType('adult')">
          <div class="vol-btn-label">Adult</div>
          <div class="vol-btn-desc">Factor: ${drug.adultFactor}</div>
        </button>
        <button class="vol-btn ${state.patientType === 'pedia' ? 'active' : ''}" onclick="setPatientType('pedia')">
          <div class="vol-btn-label">Pediatric</div>
          <div class="vol-btn-desc">Factor: ${drug.pedsFactor}</div>
        </button>
      </div>
    </div>
  `;

  // Weight
  html += `
    <div class="calc-section">
      <div class="calc-section-title">Patient Weight</div>
      <div class="input-group">
        <div class="input-wrapper">
          <input type="number" class="input-field" id="calcWeight" placeholder="Enter weight"
                 value="${state.weight}" step="0.1" min="0" inputmode="decimal">
          <span class="input-suffix">kg</span>
        </div>
      </div>
    </div>
  `;

  // Lab value
  const labLabel = drug.formulaType === 'electrolyteDeficit' ? "Patient's K⁺ Level" : "Patient's Na⁺ Level";
  html += `
    <div class="calc-section">
      <div class="calc-section-title">${labLabel}</div>
      <div class="input-group">
        <div class="input-wrapper">
          <input type="number" class="input-field" id="calcLabValue" placeholder="Enter value"
                 value="${state.labValue}" step="0.1" min="0" inputmode="decimal">
          <span class="input-suffix">mEq/L</span>
        </div>
      </div>
    </div>
  `;

  // IVF volume for K+ (optional)
  if (drug.formulaType === 'electrolyteDeficit') {
    html += `
      <div class="calc-section">
        <div class="calc-section-title">IVF Volume (for mixing)</div>
        <div class="input-group">
          <div class="input-wrapper">
            <input type="number" class="input-field" id="calcIvfVol" placeholder="e.g. 250" value="250"
                   step="1" min="0" inputmode="numeric">
            <span class="input-suffix">cc</span>
          </div>
        </div>
      </div>
    `;
  }

  html += '<div id="calcResult"></div>';

  if (drug.notes) {
    html += `
      <div class="calc-section" style="margin-top: 12px;">
        <div class="dose-warning info">
          <span class="dose-warning-icon">ℹ️</span>
          <span>${drug.notes}</span>
        </div>
      </div>
    `;
  }

  return html;
}

function renderBicarbPanel(drug) {
  let html = '';

  html += `
    <div class="calc-section" style="margin-top: 16px;">
      <div class="calc-section-title">Patient Weight</div>
      <div class="input-group">
        <div class="input-wrapper">
          <input type="number" class="input-field" id="calcWeight" placeholder="Enter weight"
                 value="${state.weight}" step="0.1" min="0" inputmode="decimal">
          <span class="input-suffix">kg</span>
        </div>
      </div>
    </div>
    <div class="calc-section">
      <div class="calc-section-title">Base Deficit</div>
      <div class="input-group">
        <div class="input-wrapper">
          <input type="number" class="input-field" id="calcBaseDeficit" placeholder="Enter base deficit"
                 value="${state.baseDeficit}" step="0.1" min="0" inputmode="decimal">
          <span class="input-suffix">mEq/L</span>
        </div>
      </div>
    </div>
    <div id="calcResult"></div>
  `;

  if (drug.notes) {
    html += `
      <div class="calc-section" style="margin-top: 12px;">
        <div class="dose-warning info">
          <span class="dose-warning-icon">ℹ️</span>
          <span>${drug.notes}</span>
        </div>
      </div>
    `;
  }

  return html;
}

function renderCustomDripPanel(drug) {
  if (!state.customDrugUnit) state.customDrugUnit = 'mg';
  if (!state.customDoseUnit) state.customDoseUnit = 'mcg/kg/min';

  let html = `
    <div class="mode-switcher">
      <button class="mode-btn ${state.calcMode === 'doseToRate' ? 'active' : ''}" onclick="setCalcMode('doseToRate')">
        Dose → Rate
      </button>
      <button class="mode-btn ${state.calcMode === 'rateToDose' ? 'active' : ''}" onclick="setCalcMode('rateToDose')">
        Rate → Dose
      </button>
    </div>

    <!-- Drug Concentration Setup -->
    <div class="calc-section">
      <div class="calc-section-title">1. Solution Concentration</div>
      <div class="input-group">
        <div class="input-label"><span class="input-label-text">Drug Amount & Unit</span></div>
        <div class="input-wrapper" style="gap: 8px;">
          <input type="number" class="input-field" id="customDrugAmount" placeholder="e.g. 200"
                 value="${state.customDrugAmount || ''}" step="any" min="0" inputmode="decimal">
          <select class="input-field" id="customDrugUnit" style="width: 110px; flex-shrink: 0; padding: 0 8px;">
            <option value="mg" ${state.customDrugUnit === 'mg' ? 'selected' : ''}>mg</option>
            <option value="mcg" ${state.customDrugUnit === 'mcg' ? 'selected' : ''}>mcg</option>
            <option value="g" ${state.customDrugUnit === 'g' ? 'selected' : ''}>grams</option>
            <option value="units" ${state.customDrugUnit === 'units' ? 'selected' : ''}>units</option>
          </select>
        </div>
      </div>

      <div class="input-group">
        <div class="input-label"><span class="input-label-text">Total Diluent / Solution Volume</span></div>
        <div class="input-wrapper">
          <input type="number" class="input-field" id="customTotalVol" placeholder="e.g. 250"
                 value="${state.customTotalVol || ''}" step="any" min="0" inputmode="decimal">
          <span class="input-suffix">mL (cc)</span>
        </div>
      </div>

      <div id="customConcDisplay" style="font-size: 0.82rem; font-weight: 700; color: var(--orange-600); margin-top: 4px; min-height: 20px;"></div>
    </div>

    <!-- Dosing Setup -->
    <div class="calc-section">
      <div class="calc-section-title">2. Dose Unit & Patient Weight</div>
      <div class="input-group">
        <div class="input-label"><span class="input-label-text">Dose Unit</span></div>
        <select class="input-field" id="customDoseUnit" style="padding: 0 12px;">
          <option value="mcg/kg/min" ${state.customDoseUnit === 'mcg/kg/min' ? 'selected' : ''}>mcg / kg / min</option>
          <option value="mcg/kg/hr" ${state.customDoseUnit === 'mcg/kg/hr' ? 'selected' : ''}>mcg / kg / hr</option>
          <option value="mg/kg/min" ${state.customDoseUnit === 'mg/kg/min' ? 'selected' : ''}>mg / kg / min</option>
          <option value="mg/kg/hr" ${state.customDoseUnit === 'mg/kg/hr' ? 'selected' : ''}>mg / kg / hr</option>
          <option value="mcg/min" ${state.customDoseUnit === 'mcg/min' ? 'selected' : ''}>mcg / min</option>
          <option value="mcg/hr" ${state.customDoseUnit === 'mcg/hr' ? 'selected' : ''}>mcg / hr</option>
          <option value="mg/min" ${state.customDoseUnit === 'mg/min' ? 'selected' : ''}>mg / min</option>
          <option value="mg/hr" ${state.customDoseUnit === 'mg/hr' ? 'selected' : ''}>mg / hr</option>
          <option value="units/hr" ${state.customDoseUnit === 'units/hr' ? 'selected' : ''}>units / hr</option>
          <option value="units/kg/hr" ${state.customDoseUnit === 'units/kg/hr' ? 'selected' : ''}>units / kg / hr</option>
        </select>
      </div>

      <div class="input-group" id="customWeightGroup">
        <div class="input-label"><span class="input-label-text">Patient Weight</span></div>
        <div class="input-wrapper">
          <input type="number" class="input-field" id="calcWeight" placeholder="Enter weight"
                 value="${state.weight || ''}" step="0.1" min="0" inputmode="decimal">
          <span class="input-suffix">kg</span>
        </div>
      </div>
    </div>

    <!-- Mode Specific Computation -->
    <div class="calc-section">
      <div class="calc-section-title">3. Computation</div>
      ${state.calcMode === 'doseToRate' ? `
        <div class="input-group">
          <div class="input-label"><span class="input-label-text">Desired Dose</span></div>
          <div class="input-wrapper">
            <input type="number" class="input-field" id="calcDose" placeholder="Enter dose"
                   value="${state.dose || ''}" step="any" min="0" inputmode="decimal">
            <span class="input-suffix" id="customDoseUnitSuffix">${state.customDoseUnit}</span>
          </div>
        </div>
      ` : `
        <div class="input-group">
          <div class="input-label"><span class="input-label-text">Current Flow Rate</span></div>
          <div class="input-wrapper">
            <input type="number" class="input-field" id="calcRate" placeholder="Enter rate"
                   value="${state.rate || ''}" step="any" min="0" inputmode="decimal">
            <span class="input-suffix">cc/hr</span>
          </div>
        </div>
      `}
    </div>

    <div id="calcResult"></div>
  `;

  return html;
}

function attachCalcListeners(drug) {
  const weightEl = document.getElementById('calcWeight');
  const doseEl = document.getElementById('calcDose');
  const rateEl = document.getElementById('calcRate');
  const labValueEl = document.getElementById('calcLabValue');
  const baseDeficitEl = document.getElementById('calcBaseDeficit');
  const ivfVolEl = document.getElementById('calcIvfVol');

  // Custom drip elements
  const customAmountEl = document.getElementById('customDrugAmount');
  const customUnitEl = document.getElementById('customDrugUnit');
  const customTotalVolEl = document.getElementById('customTotalVol');
  const customDoseUnitEl = document.getElementById('customDoseUnit');

  const recalc = () => recalculate(drug);

  if (weightEl) {
    weightEl.addEventListener('input', (e) => { state.weight = e.target.value; recalc(); });
  }
  if (doseEl) {
    doseEl.addEventListener('input', (e) => { state.dose = e.target.value; recalc(); });
  }
  if (rateEl) {
    rateEl.addEventListener('input', (e) => { state.rate = e.target.value; recalc(); });
  }
  if (labValueEl) {
    labValueEl.addEventListener('input', (e) => { state.labValue = e.target.value; recalc(); });
  }
  if (baseDeficitEl) {
    baseDeficitEl.addEventListener('input', (e) => { state.baseDeficit = e.target.value; recalc(); });
  }
  if (ivfVolEl) {
    ivfVolEl.addEventListener('input', recalc);
  }

  if (customAmountEl) {
    customAmountEl.addEventListener('input', (e) => { state.customDrugAmount = e.target.value; recalc(); });
  }
  if (customUnitEl) {
    customUnitEl.addEventListener('change', (e) => { state.customDrugUnit = e.target.value; recalc(); });
  }
  if (customTotalVolEl) {
    customTotalVolEl.addEventListener('input', (e) => { state.customTotalVol = e.target.value; recalc(); });
  }
  if (customDoseUnitEl) {
    customDoseUnitEl.addEventListener('change', (e) => {
      state.customDoseUnit = e.target.value;
      const suf = document.getElementById('customDoseUnitSuffix');
      if (suf) suf.textContent = e.target.value;
      recalc();
    });
  }

  const presetCustomVolEl = document.getElementById('presetCustomVol');
  const presetCustomAmtEl = document.getElementById('presetCustomAmt');

  if (presetCustomVolEl) {
    presetCustomVolEl.addEventListener('input', (e) => { state.presetCustomVol = e.target.value; recalc(); });
  }
  if (presetCustomAmtEl) {
    presetCustomAmtEl.addEventListener('input', (e) => { state.presetCustomAmt = e.target.value; recalc(); });
  }
}

function recalculate(drug) {
  const resultEl = document.getElementById('calcResult');
  if (!resultEl) return;

  // Custom drip calculator
  if (drug.formulaType === 'customDrip') {
    recalculateCustomDrip();
    return;
  }

  // Electrolyte deficit calculators
  if (drug.formulaType === 'electrolyteDeficit' || drug.formulaType === 'electrolyteDeficitNa') {
    const result = calculateElectrolyteDeficit(drug, state.labValue, state.weight, state.patientType);
    if (!result || result.deficit === undefined) {
      resultEl.innerHTML = '';
      return;
    }

    if (drug.formulaType === 'electrolyteDeficit') {
      const ivfVol = parseFloat(document.getElementById('calcIvfVol')?.value || 250);
      const totalVol = result.stockCc + ivfVol;
      resultEl.innerHTML = `
        <div class="result-card">
          <div class="result-label">K⁺ Deficit</div>
          <div class="result-value">${formatNumber(result.deficit)}</div>
          <div class="result-unit">mEq</div>
          <div class="result-details">
            <div class="result-detail">
              <div class="result-detail-label">KCL Volume</div>
              <div class="result-detail-value">${formatNumber(result.stockCc)} cc</div>
            </div>
            <div class="result-detail">
              <div class="result-detail-label">Total Vol</div>
              <div class="result-detail-value">${formatNumber(totalVol)} cc</div>
            </div>
          </div>
        </div>
        <div class="mixing-card" style="margin-top: 12px;">
          <div class="mixing-title">🧪 Mixing</div>
          <div class="mixing-row"><span class="mixing-label">KCL</span><span class="mixing-value">${formatNumber(result.stockCc)} cc (from ${drug.stockConc} mEq/${drug.stockVol} cc stock)</span></div>
          <div class="mixing-row"><span class="mixing-label">IVF</span><span class="mixing-value">${ivfVol} cc</span></div>
          <div class="mixing-row"><span class="mixing-label">Total</span><span class="mixing-value">${formatNumber(totalVol)} cc</span></div>
        </div>
      `;
    } else {
      resultEl.innerHTML = `
        <div class="electrolyte-result">
          <div class="electrolyte-row"><span>Na⁺ Deficit</span><span>${formatNumber(result.deficit)} mEq</span></div>
          <div class="electrolyte-row"><span>Maintenance (wt × 2)</span><span>${formatNumber(result.maintenance)} mEq</span></div>
          <div class="electrolyte-row"><span>Total Replacement</span><span>${formatNumber(result.total)} mEq</span></div>
        </div>
      `;
    }
    return;
  }

  // Bicarb deficit
  if (drug.formulaType === 'bicarbDeficit') {
    const result = calculateBicarbDeficit(state.baseDeficit, state.weight);
    if (!result) {
      resultEl.innerHTML = '';
      return;
    }
    resultEl.innerHTML = `
      <div class="electrolyte-result">
        <div class="electrolyte-row"><span>Full Correction</span><span>${formatNumber(result.full)} mEq</span></div>
        <div class="electrolyte-row"><span>Half Correction</span><span>${formatNumber(result.half)} mEq</span></div>
      </div>
    `;
    return;
  }

  // Standard or Custom drip concentration resolution
  let conc = null;
  if (state.selectedVolume === 'custom' || state.selectedConc === 'custom') {
    const vol = parseFloat(state.presetCustomVol || (drug.concentrations[state.selectedVolume]?.[0]?.totalVol) || 250);
    const amt = parseFloat(state.presetCustomAmt);

    if (!isNaN(vol) && vol > 0 && !isNaN(amt) && amt > 0) {
      let concMcg = 0;
      let concMg = 0;
      let concUnits = 0;

      if (['weightPerMin', 'weightPerHour'].includes(drug.formulaType)) {
        concMcg = (amt * 1000) / vol;
        concMg = amt / vol;
      } else if (['dosePerHour', 'dosePerMin'].includes(drug.formulaType)) {
        concMg = amt / vol;
        concMcg = (amt * 1000) / vol;
      } else if (drug.formulaType === 'heparin') {
        concUnits = amt / vol;
      }

      const concText = drug.formulaType === 'heparin'
        ? `${formatNumber(concUnits)} U/cc`
        : ['weightPerMin', 'weightPerHour'].includes(drug.formulaType)
          ? `${formatNumber(concMcg)} mcg/cc (${formatNumber(concMg, 3)} mg/cc)`
          : `${formatNumber(concMg, 3)} mg/cc`;

      conc = {
        label: 'Custom',
        concMcgPerCc: concMcg,
        concMgPerCc: concMg,
        concUnitsPerCc: concUnits,
        totalVol: vol,
        drugMg: amt,
        concNote: `Custom Mix (${concText})`
      };

      const summaryEl = document.getElementById('presetCustomConcSummary');
      if (summaryEl) {
        summaryEl.textContent = `Calculated Concentration: ${concText}`;
      }
    } else {
      const summaryEl = document.getElementById('presetCustomConcSummary');
      if (summaryEl) summaryEl.textContent = 'Please enter drug amount and solution volume above.';
    }
  } else {
    const concs = (drug.concentrations[state.selectedVolume])
      ? drug.concentrations[state.selectedVolume]
      : (drug.concentrations ? Object.values(drug.concentrations)[0] : []);
    const concIdx = (concs[state.selectedConc]) ? state.selectedConc : 0;
    conc = concs[concIdx];
  }

  if (!conc) { resultEl.innerHTML = ''; return; }

  if (state.calcMode === 'doseToRate') {
    const dose = parseFloat(state.dose);
    const weight = parseFloat(state.weight);

    // Update dose warning
    const warningEl = document.getElementById('doseWarning');
    const warning = getDoseWarning(drug, state.dose);
    if (warningEl && warning) {
      warningEl.innerHTML = `
        <div class="dose-warning ${warning.type}">
          <span class="dose-warning-icon">${warning.type === 'success' ? '✅' : warning.type === 'danger' ? '🚨' : warning.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
          <span>${warning.message}</span>
        </div>
      `;
    } else if (warningEl) {
      warningEl.innerHTML = '';
    }

    // Update dose range marker
    const markerEl = document.getElementById('doseMarker');
    if (markerEl && drug.doseRange) {
      const pct = getDoseRangePercent(drug, state.dose);
      markerEl.style.left = `${pct}%`;
    }

    const result = calculateDoseToRate(drug, dose, weight, conc);
    if (!result) {
      resultEl.innerHTML = '';
      return;
    }

    // Calculate gtts/min (macro drip: 15 gtts = 1 ml)
    const gttsPerMin = (result.rate * 15) / 60;

    resultEl.innerHTML = `
      <div class="result-card">
        <div class="result-label">Flow Rate</div>
        <div class="result-value">${formatNumber(result.rate)}</div>
        <div class="result-unit">${result.unit}</div>
        <div class="result-details">
          <div class="result-detail">
            <div class="result-detail-label">Macro Drip</div>
            <div class="result-detail-value">${formatNumber(gttsPerMin)} gtts/min</div>
          </div>
          <div class="result-detail">
            <div class="result-detail-label">Concentration</div>
            <div class="result-detail-value">${formatNumber(result.conc)} ${result.concUnit}</div>
          </div>
        </div>
      </div>

      <button class="formula-toggle-btn" onclick="toggleFormulaBreakdown()">
        📐 ${state.showFormulaBreakdown ? 'Hide Computation Formula' : 'Show Computation Formula & Steps'}
      </button>

      <button class="formula-toggle-btn" style="background: var(--white); border-color: var(--orange-500); color: var(--orange-700);" onclick="openDosingTable()">
        📊 Generate Dosing Table & Export to Excel / Google Sheets
      </button>
    `;

    if (state.showFormulaBreakdown) {
      resultEl.innerHTML += generateFormulaBreakdownHTML(drug, state.calcMode, conc, weight, dose, null, result);
    }
  } else {
    const rate = parseFloat(state.rate);
    const weight = parseFloat(state.weight);
    const result = calculateRateToDose(drug, rate, weight, conc);
    if (!result) {
      resultEl.innerHTML = '';
      return;
    }

    resultEl.innerHTML = `
      <div class="result-card">
        <div class="result-label">Current Dose</div>
        <div class="result-value">${formatNumber(result.dose, 4)}</div>
        <div class="result-unit">${result.unit}</div>
        <div class="result-details">
          <div class="result-detail">
            <div class="result-detail-label">Flow Rate</div>
            <div class="result-detail-value">${formatNumber(rate)} cc/hr</div>
          </div>
          <div class="result-detail">
            <div class="result-detail-label">Concentration</div>
            <div class="result-detail-value">${formatNumber(result.conc)} ${result.concUnit}</div>
          </div>
        </div>
      </div>

      <button class="formula-toggle-btn" onclick="toggleFormulaBreakdown()">
        📐 ${state.showFormulaBreakdown ? 'Hide Computation Formula' : 'Show Computation Formula & Steps'}
      </button>

      <button class="formula-toggle-btn" style="background: var(--white); border-color: var(--orange-500); color: var(--orange-700);" onclick="openDosingTable()">
        📊 Generate Dosing Table & Export to Excel / Google Sheets
      </button>
    `;

    // Show dose warning for reverse calc
    const warning = getDoseWarning(drug, result.dose);
    if (warning) {
      resultEl.innerHTML += `
        <div class="dose-warning ${warning.type}" style="margin-top: 12px;">
          <span class="dose-warning-icon">${warning.type === 'success' ? '✅' : warning.type === 'danger' ? '🚨' : warning.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
          <span>${warning.message}</span>
        </div>
      `;
    }

    if (state.showFormulaBreakdown) {
      resultEl.innerHTML += generateFormulaBreakdownHTML(drug, state.calcMode, conc, weight, null, rate, result);
    }
  }
}

function openDosingTable(drugKey) {
  const targetKey = (typeof drugKey === 'string' && DRUGS[drugKey]) ? drugKey : (state.selectedDrug || 'dopamine');
  const drug = DRUGS[targetKey];
  if (!drug) return;

  state.selectedDrug = targetKey;
  const data = generateDosingTableData(drug);
  if (!data || !data.rows || data.rows.length === 0) return;

  const overlay = document.getElementById('dosingTableOverlay');
  const sub = document.getElementById('dosingTableSub');
  const body = document.getElementById('dosingTableBody');

  if (sub) {
    sub.textContent = `${drug.name} (${drug.generic}) — ${data.concLabel} | Weight: ${data.weight ? data.weight + ' kg' : 'Standard'}`;
  }

  let html = `
    <div class="dosing-info-strip">
      <div class="dosing-info-box">
        <div class="dosing-info-label">Medication</div>
        <div class="dosing-info-val">${drug.name} (${drug.generic})</div>
      </div>
      <div class="dosing-info-box">
        <div class="dosing-info-label">Concentration</div>
        <div class="dosing-info-val">${data.concLabel}</div>
      </div>
      <div class="dosing-info-box">
        <div class="dosing-info-label">Patient Weight</div>
        <div class="dosing-info-val">${data.weight ? data.weight + ' kg' : 'N/A'}</div>
      </div>
      <div class="dosing-info-box">
        <div class="dosing-info-label">Dose Range</div>
        <div class="dosing-info-val">${drug.doseRange ? drug.doseRange.min + ' – ' + drug.doseRange.max + ' ' + drug.doseUnit : 'Full Range'}</div>
      </div>
    </div>

    <!-- ── Primary Vertical Column Table ── -->
    <div>
      <h4 style="font-size: 0.95rem; color: var(--orange-700); font-weight: 800; margin-bottom: 12px;">
        📋 Complete Bedside Dosing Column Table (Lowest → Highest Dose)
      </h4>
      <div style="overflow-x: auto; border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
        <table class="dosing-table">
          <thead>
            <tr>
              <th style="background: var(--orange-500); color: var(--white);">Column 1: Dose (${drug.doseUnit})</th>
              <th style="background: var(--gray-800); color: var(--white);">Column 2: Flow Rate (cc/hr)</th>
              <th>Column 3: Macro Drip (15 gtts/min)</th>
              <th>Column 4: Micro Drip (60 gtts/min)</th>
              <th>Column 5: Hourly Infused Drug</th>
              <th>Column 6: Computation Formula Proof</th>
            </tr>
          </thead>
          <tbody>
            ${data.rows.map(r => `
              <tr>
                <td class="dosing-table-highlight" style="font-weight: 800; color: var(--orange-800);">${r.doseFormatted}</td>
                <td style="font-weight: 800; color: var(--orange-600); font-size: 0.95rem;">${r.rateFormatted} cc/hr</td>
                <td>${r.macroGttsFormatted} gtts/min</td>
                <td>${r.microGttsFormatted} gtts/min</td>
                <td>${r.hourlyDrugFormatted}</td>
                <td class="dosing-table-math">${r.formulaProof}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  body.innerHTML = html;
  overlay.classList.add('open');
}

function closeDosingTable() {
  const overlay = document.getElementById('dosingTableOverlay');
  if (overlay) overlay.classList.remove('open');
}

function generateDosingTableData(drug) {
  if (!drug) return null;

  const weight = parseFloat(state.weight) || (drug.weightBased ? 70 : 70);

  if (drug.formulaType === 'protocol') {
    const rows = (drug.protocols || []).map((p, idx) => ({
      dose: idx + 1,
      doseFormatted: p.name,
      rate: parseFloat(p.dose) || 100,
      rateFormatted: `${p.dose}`,
      macroGttsFormatted: 'N/A',
      microGttsFormatted: 'N/A',
      hourlyDrugFormatted: `Diluent: ${p.diluent}`,
      formulaProof: `Duration: ${p.duration}`
    }));
    return { drug, concLabel: 'Protocol Guidelines', weight: null, rows };
  }

  if (['electrolyteDeficit', 'electrolyteDeficitNa', 'bicarbDeficit'].includes(drug.formulaType)) {
    const rates = [10, 20, 30, 40, 50, 60, 80, 100];
    const rows = rates.map(r => ({
      dose: r,
      doseFormatted: `${r} mEq/hr`,
      rate: r,
      rateFormatted: `${r} cc/hr`,
      macroGttsFormatted: formatNumber((r * 15) / 60, 2),
      microGttsFormatted: formatNumber(r, 2),
      hourlyDrugFormatted: `${r} mEq/hr`,
      formulaProof: `Infusion at ${r} cc/hr (max 20 mEq/hr peripheral)`
    }));
    return { drug, concLabel: 'Electrolyte Replacement Protocol', weight, rows };
  }

  if (drug.formulaType === 'customDrip') {
    const vol = parseFloat(state.presetCustomVol) || 250;
    const amt = parseFloat(state.presetCustomAmt) || 100;
    const concMcg = (amt * 1000) / vol;
    const isWeight = state.customIsWeightBased !== false;
    const doseUnit = state.customDoseUnit || (isWeight ? 'mcg/kg/min' : 'mg/hr');

    const rows = [];
    for (let d = 1; d <= 15; d++) {
      const rateVal = isWeight ? (d * weight * 60) / concMcg : d / (amt / vol);
      rows.push({
        dose: d,
        doseFormatted: `${d} ${doseUnit}`,
        rate: rateVal,
        rateFormatted: formatNumber(rateVal, 2),
        macroGttsFormatted: formatNumber((rateVal * 15) / 60, 2),
        microGttsFormatted: formatNumber(rateVal, 2),
        hourlyDrugFormatted: isWeight ? `${formatNumber(d * weight * 60)} mcg/hr` : `${d} mg/hr`,
        formulaProof: isWeight
          ? `(${d} × ${weight} × 60) ÷ ${formatNumber(concMcg)} = ${formatNumber(rateVal, 2)} cc/hr`
          : `${d} ÷ ${formatNumber(amt / vol, 2)} = ${formatNumber(rateVal, 2)} cc/hr`
      });
    }
    return { drug, concLabel: `Custom (${amt} in ${vol} cc)`, weight, rows };
  }

  let conc = null;
  if (state.selectedVolume === 'custom' || state.selectedConc === 'custom') {
    const vol = parseFloat(state.presetCustomVol || 250);
    const amt = parseFloat(state.presetCustomAmt);
    if (!isNaN(vol) && vol > 0 && !isNaN(amt) && amt > 0) {
      const concMcg = (amt * 1000) / vol;
      const concMg = amt / vol;
      conc = { label: 'Custom', concMcgPerCc: concMcg, concMgPerCc: concMg, totalVol: vol, drugMg: amt, concNote: `Custom Mix (${formatNumber(concMcg)} mcg/cc)` };
    }
  }

  if (!conc && drug.concentrations) {
    const availableVols = Object.keys(drug.concentrations);
    const volKey = (drug.concentrations[state.selectedVolume]) ? state.selectedVolume : availableVols[0];
    const concs = drug.concentrations[volKey] || Object.values(drug.concentrations)[0] || [];
    let idx = typeof state.selectedConc === 'number' ? state.selectedConc : parseInt(state.selectedConc, 10);
    if (isNaN(idx) || idx < 0 || idx >= concs.length) idx = 0;
    conc = concs[idx];
  }

  if (!conc) {
    conc = { label: 'Standard Mix', concMcgPerCc: 1000, concMgPerCc: 1, totalVol: 250, concNote: 'Standard Concentration' };
  }

  const concVal = conc.concMcgPerCc || (conc.concMgPerCc ? conc.concMgPerCc * 1000 : 1000) || (conc.concUnitsPerCc || 1);
  const concLabel = conc.concNote || `${conc.label || 'Standard'} (${formatNumber(concVal)} ${conc.concUnitsPerCc ? 'U/cc' : 'mcg/cc'})`;

  let minDose = drug.doseRange?.min || 0.01;
  let maxDose = drug.doseRange?.max || 3.0;

  if (drug.formulaType === 'dosePerHour') {
    minDose = drug.doseRange?.min || 1;
    maxDose = drug.doseRange?.max || 50;
  } else if (drug.formulaType === 'heparin') {
    minDose = drug.doseRange?.min || 10;
    maxDose = drug.doseRange?.max || 25;
  }

  // Generate complete dose array without skipping any numbers
  const doseList = [];
  if (minDose >= 1 && maxDose <= 50 && Number.isInteger(minDose) && Number.isInteger(maxDose)) {
    // Integer sequence 1, 2, 3, ..., 20 (no numbers skipped!)
    for (let d = minDose; d <= maxDose; d++) {
      doseList.push(d);
    }
  } else if (maxDose <= 3) {
    // Fine-grained decimal steps for Levophed / Epinephrine
    const presets = [0.01, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];
    presets.forEach(p => {
      if (p >= minDose && p <= maxDose) doseList.push(p);
    });
  } else {
    // 15 linear steps
    const stepsCount = 15;
    const stepSize = (maxDose - minDose) / (stepsCount - 1);
    for (let i = 0; i < stepsCount; i++) {
      let d = minDose + (i * stepSize);
      d = Math.round(d * 10) / 10;
      doseList.push(d);
    }
  }

  const rows = [];
  doseList.forEach(d => {
    const calcResult = calculateDoseToRate(drug, d, weight, conc);
    if (!calcResult) return;

    const rateVal = calcResult.rate;
    const macroGtts = (rateVal * 15) / 60;
    const microGtts = rateVal;

    let hourlyDrugText = '';
    let proofText = '';

    if (drug.formulaType === 'weightPerMin') {
      const num = d * weight * 60;
      hourlyDrugText = `${formatNumber(num)} mcg/hr (${formatNumber(num / 1000, 2)} mg/hr)`;
      proofText = `(${d} × ${weight} × 60) ÷ ${formatNumber(concVal)} = ${formatNumber(rateVal, 2)} cc/hr`;
    } else if (drug.formulaType === 'weightPerHour') {
      const num = d * weight;
      hourlyDrugText = `${formatNumber(num)} mcg/hr`;
      proofText = `(${d} × ${weight}) ÷ ${formatNumber(concVal)} = ${formatNumber(rateVal, 2)} cc/hr`;
    } else if (['dosePerHour', 'dosePerMin'].includes(drug.formulaType)) {
      const mgPerCc = conc.concMgPerCc || (concVal / 1000);
      const isMin = drug.formulaType === 'dosePerMin';
      const hourlyMg = isMin ? d * 60 : d;
      hourlyDrugText = `${formatNumber(hourlyMg)} mg/hr`;
      proofText = isMin
        ? `(${d} × 60) ÷ ${formatNumber(mgPerCc, 3)} = ${formatNumber(rateVal, 2)} cc/hr`
        : `${d} ÷ ${formatNumber(mgPerCc, 3)} = ${formatNumber(rateVal, 2)} cc/hr`;
    } else if (drug.formulaType === 'heparin') {
      const isWeight = state.heparinMode === 'unitsPerKgPerHr';
      const hourlyUnits = isWeight ? d * weight : d;
      hourlyDrugText = `${formatNumber(hourlyUnits)} Units/hr`;
      proofText = isWeight
        ? `(${d} × ${weight}) ÷ ${formatNumber(concVal)} = ${formatNumber(rateVal, 2)} cc/hr`
        : `${d} ÷ ${formatNumber(concVal)} = ${formatNumber(rateVal, 2)} cc/hr`;
    }

    rows.push({
      dose: d,
      doseFormatted: `${d} ${drug.doseUnit}`,
      rate: rateVal,
      rateFormatted: formatNumber(rateVal, 2),
      macroGttsFormatted: formatNumber(macroGtts, 2),
      microGttsFormatted: formatNumber(microGtts, 2),
      hourlyDrugFormatted: hourlyDrugText,
      formulaProof: proofText
    });
  });

  return { drug, concLabel, weight, rows };
}

function exportDosingTableCSV() {
  const drug = DRUGS[state.selectedDrug];
  if (!drug) return;

  const data = generateDosingTableData(drug);
  if (!data || !data.rows) return;

  // UTF-8 BOM so Excel opens special characters (* and /) cleanly
  let csv = "\uFEFF";
  csv += `AL Manalaysay ICU Drip Calculator — Bedside Dosing Table\n`;
  csv += `Medication: ${drug.name} (${drug.generic})\n`;
  csv += `Concentration: ${data.concLabel}\n`;
  csv += `Patient Weight: ${data.weight ? data.weight + ' kg' : 'Standard'}\n\n`;

  csv += `"Dose (${drug.doseUnit})","Flow Rate (cc/hr)","Macro Drip (15 gtts/min)","Micro Drip (60 gtts/min)","Hourly Infused Drug","Computation Formula Proof"\n`;

  data.rows.forEach(r => {
    const proofClean = r.formulaProof.replace(/×/g, '*').replace(/÷/g, '/');
    csv += `"${r.doseFormatted}","${r.rateFormatted}","${r.macroGttsFormatted}","${r.microGttsFormatted}","${r.hourlyDrugFormatted}","${proofClean}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${drug.name.replace(/\s+/g, '_')}_Dosing_Table_${data.weight || 'std'}kg.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function copyDosingTableTSV() {
  const drug = DRUGS[state.selectedDrug];
  if (!drug) return;

  const data = generateDosingTableData(drug);
  if (!data || !data.rows) return;

  let tsv = `Dose (${drug.doseUnit})\tFlow Rate (cc/hr)\tMacro Drip (15 gtts/min)\tMicro Drip (60 gtts/min)\tHourly Infused Drug\tComputation Formula Proof\n`;

  data.rows.forEach(r => {
    tsv += `${r.doseFormatted}\t${r.rateFormatted}\t${r.macroGttsFormatted}\t${r.microGttsFormatted}\t${r.hourlyDrugFormatted}\t${r.formulaProof}\n`;
  });

  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(tsv).then(() => {
      alert('✅ Dosing Table copied to clipboard! You can now paste directly into Google Sheets or Microsoft Excel.');
    }).catch(err => {
      alert('Failed to copy to clipboard: ' + err);
    });
  } else {
    alert('✅ Dosing Table TSV data ready for spreadsheet paste.');
  }
}

function toggleFormulaBreakdown() {
  state.showFormulaBreakdown = !state.showFormulaBreakdown;
  const drug = DRUGS[state.selectedDrug];
  if (drug) recalculate(drug);
}

function generateFormulaBreakdownHTML(drug, calcMode, conc, weight, dose, rate, result) {
  let html = '';
  const isDoseToRate = calcMode === 'doseToRate';

  let equationText = '';
  let steps = [];
  let finalValText = '';

  if (['weightPerMin', 'weightPerHour'].includes(drug.formulaType)) {
    const isMin = drug.formulaType === 'weightPerMin';
    const timeFactor = isMin ? 60 : 1;
    const concVal = conc.concMcgPerCc || (conc.concMgPerCc * 1000);
    const drugMcg = conc.drugMg ? conc.drugMg * 1000 : null;

    if (isDoseToRate) {
      equationText = isMin
        ? `Rate (cc/hr) = (Dose × Weight × 60) ÷ Concentration (mcg/cc)`
        : `Rate (cc/hr) = (Dose × Weight) ÷ Concentration (mcg/cc)`;

      steps.push({
        num: 'Step 1: Concentration Resolution',
        desc: conc.concNote || `Solution Mixture: ${conc.drugMg || 'Custom'} mg in ${conc.totalVol} cc`,
        math: conc.totalVol && drugMcg
          ? `Conc = ${formatNumber(drugMcg)} mcg ÷ ${conc.totalVol} cc = ${formatNumber(concVal)} mcg/cc`
          : `Conc = ${formatNumber(concVal)} mcg/cc`
      });

      const numVal = dose * weight * timeFactor;
      steps.push({
        num: 'Step 2: Substitute Clinical Values',
        desc: `Dose = ${dose} ${drug.doseUnit}, Weight = ${weight} kg${isMin ? ', Time Factor = 60' : ''}`,
        math: isMin
          ? `Numerator = ${dose} × ${weight} × 60 = ${formatNumber(numVal)} mcg/hr`
          : `Numerator = ${dose} × ${weight} = ${formatNumber(numVal)} mcg/hr`
      });

      const rateVal = numVal / concVal;
      steps.push({
        num: 'Step 3: Solve Flow Rate',
        desc: `Divide hourly dose by concentration`,
        math: `${formatNumber(numVal)} ÷ ${formatNumber(concVal)} = ${formatNumber(rateVal, 2)} cc/hr`
      });

      const gttsVal = (rateVal * 15) / 60;
      steps.push({
        num: 'Step 4: Macro Drip Conversion (15 gtts/mL)',
        desc: `gtts/min = (cc/hr × 15) ÷ 60`,
        math: `(${formatNumber(rateVal, 2)} × 15) ÷ 60 = ${formatNumber(gttsVal, 2)} gtts/min`
      });

      finalValText = `${formatNumber(rateVal, 2)} cc/hr (${formatNumber(gttsVal, 2)} gtts/min)`;
    } else {
      equationText = isMin
        ? `Dose (mcg/kg/min) = (Rate × Concentration) ÷ (Weight × 60)`
        : `Dose (mcg/kg/hr) = (Rate × Concentration) ÷ Weight`;

      steps.push({
        num: 'Step 1: Concentration Resolution',
        desc: conc.concNote || `Concentration = ${formatNumber(concVal)} mcg/cc`,
        math: `Conc = ${formatNumber(concVal)} mcg/cc`
      });

      const totalMcgPerHr = rate * concVal;
      steps.push({
        num: 'Step 2: Hourly Infused Drug',
        desc: `Rate = ${rate} cc/hr × ${formatNumber(concVal)} mcg/cc`,
        math: `${rate} × ${formatNumber(concVal)} = ${formatNumber(totalMcgPerHr)} mcg/hr`
      });

      const denVal = weight * timeFactor;
      const doseVal = totalMcgPerHr / denVal;
      steps.push({
        num: 'Step 3: Divide by Body Weight & Time',
        desc: isMin ? `Denominator = ${weight} kg × 60 min = ${denVal}` : `Denominator = ${weight} kg`,
        math: `${formatNumber(totalMcgPerHr)} ÷ ${denVal} = ${formatNumber(doseVal, 4)} ${drug.doseUnit}`
      });

      finalValText = `${formatNumber(doseVal, 4)} ${drug.doseUnit}`;
    }
  } else if (['dosePerHour', 'dosePerMin'].includes(drug.formulaType)) {
    const isMin = drug.formulaType === 'dosePerMin';
    const concVal = conc.concMgPerCc || (conc.concMcgPerCc / 1000);

    if (isDoseToRate) {
      equationText = isMin
        ? `Rate (cc/hr) = (Dose (mg/min) × 60) ÷ Concentration (mg/cc)`
        : `Rate (cc/hr) = Dose (mg/hr) ÷ Concentration (mg/cc)`;

      steps.push({
        num: 'Step 1: Concentration Resolution',
        desc: conc.concNote || `Concentration in mg/cc`,
        math: `Conc = ${formatNumber(concVal, 3)} mg/cc`
      });

      const mgPerHr = isMin ? dose * 60 : dose;
      steps.push({
        num: 'Step 2: Calculate Hourly Dose',
        desc: isMin ? `Dose = ${dose} mg/min × 60 min = ${mgPerHr} mg/hr` : `Hourly Dose = ${dose} mg/hr`,
        math: `${mgPerHr} mg/hr`
      });

      const rateVal = mgPerHr / concVal;
      steps.push({
        num: 'Step 3: Solve Flow Rate',
        desc: `Rate = Hourly Dose ÷ Concentration`,
        math: `${mgPerHr} ÷ ${formatNumber(concVal, 3)} = ${formatNumber(rateVal, 2)} cc/hr`
      });

      finalValText = `${formatNumber(rateVal, 2)} cc/hr`;
    } else {
      equationText = isMin
        ? `Dose (mg/min) = (Rate (cc/hr) × Concentration (mg/cc)) ÷ 60`
        : `Dose (mg/hr) = Rate (cc/hr) × Concentration (mg/cc)`;

      steps.push({
        num: 'Step 1: Concentration Resolution',
        desc: `Concentration = ${formatNumber(concVal, 3)} mg/cc`,
        math: `Conc = ${formatNumber(concVal, 3)} mg/cc`
      });

      const totalMgPerHr = rate * concVal;
      const doseVal = isMin ? totalMgPerHr / 60 : totalMgPerHr;

      steps.push({
        num: 'Step 2: Solve Delivered Dose',
        desc: isMin ? `(${rate} × ${formatNumber(concVal, 3)}) ÷ 60` : `${rate} × ${formatNumber(concVal, 3)}`,
        math: `${formatNumber(doseVal, 3)} ${drug.doseUnit}`
      });

      finalValText = `${formatNumber(doseVal, 3)} ${drug.doseUnit}`;
    }
  } else if (drug.formulaType === 'heparin') {
    const isWeightBased = state.heparinMode === 'unitsPerKgPerHr';
    const concVal = conc.concUnitsPerCc || (conc.drugMg ? (conc.drugMg * 1000) / conc.totalVol : 100);

    if (isDoseToRate) {
      equationText = isWeightBased
        ? `Rate (cc/hr) = (Dose (U/kg/hr) × Weight (kg)) ÷ Concentration (U/cc)`
        : `Rate (cc/hr) = Dose (U/hr) ÷ Concentration (U/cc)`;

      steps.push({
        num: 'Step 1: Concentration Resolution',
        desc: conc.concNote || `Heparin Concentration`,
        math: `Conc = ${formatNumber(concVal)} Units/cc`
      });

      const totalUnitsPerHr = isWeightBased ? dose * weight : dose;
      steps.push({
        num: 'Step 2: Total Hourly Units',
        desc: isWeightBased ? `${dose} U/kg/hr × ${weight} kg = ${totalUnitsPerHr} U/hr` : `Hourly Units = ${dose} U/hr`,
        math: `${totalUnitsPerHr} Units/hr`
      });

      const rateVal = totalUnitsPerHr / concVal;
      steps.push({
        num: 'Step 3: Solve Flow Rate',
        desc: `Rate = Hourly Units ÷ Concentration`,
        math: `${totalUnitsPerHr} ÷ ${formatNumber(concVal)} = ${formatNumber(rateVal, 2)} cc/hr`
      });

      finalValText = `${formatNumber(rateVal, 2)} cc/hr`;
    } else {
      equationText = isWeightBased
        ? `Dose (U/kg/hr) = (Rate (cc/hr) × Conc (U/cc)) ÷ Weight (kg)`
        : `Dose (U/hr) = Rate (cc/hr) × Conc (U/cc)`;

      const totalUnitsPerHr = rate * concVal;
      const doseVal = isWeightBased ? totalUnitsPerHr / weight : totalUnitsPerHr;

      steps.push({
        num: 'Step 1: Hourly Infused Units',
        desc: `${rate} cc/hr × ${formatNumber(concVal)} U/cc`,
        math: `${totalUnitsPerHr} Units/hr`
      });

      steps.push({
        num: 'Step 2: Solve Delivered Dose',
        desc: isWeightBased ? `${totalUnitsPerHr} ÷ ${weight} kg` : `Total Units`,
        math: `${formatNumber(doseVal, 2)} ${isWeightBased ? 'Units/kg/hr' : 'Units/hr'}`
      });

      finalValText = `${formatNumber(doseVal, 2)} ${isWeightBased ? 'Units/kg/hr' : 'Units/hr'}`;
    }
  }

  html += `
    <div class="formula-card">
      <div class="formula-card-header">
        <div class="formula-card-title">📐 Step-by-Step Computation Formula</div>
        <button type="button" class="search-clear visible" onclick="toggleFormulaBreakdown()" title="Close breakdown" style="position:static;">✕</button>
      </div>

      <div class="formula-equation-box">
        ${equationText}
      </div>

      <div class="formula-step-list">
        ${steps.map(s => `
          <div class="formula-step-item">
            <div class="formula-step-num">${s.num}</div>
            <div class="formula-step-desc">${s.desc}</div>
            <div class="formula-step-math">${s.math}</div>
          </div>
        `).join('')}
      </div>

      <div class="formula-final-box">
        <span>Calculated Result:</span>
        <span class="formula-final-val">${finalValText}</span>
      </div>
    </div>
  `;

  return html;
}

function setCalcMode(mode) {
  state.calcMode = mode;
  state.dose = '';
  state.rate = '';
  const drug = DRUGS[state.selectedDrug];
  if (drug) renderCalculatorPanel(drug);
}

function setVolume(vol) {
  state.selectedVolume = vol;
  state.selectedConc = 0;
  const drug = DRUGS[state.selectedDrug];
  if (drug) renderCalculatorPanel(drug);
}

function setConc(idx) {
  state.selectedConc = idx;
  const drug = DRUGS[state.selectedDrug];
  if (drug) renderCalculatorPanel(drug);
}

function setHeparinMode(mode) {
  state.heparinMode = mode;
  const drug = DRUGS[state.selectedDrug];
  if (drug) renderCalculatorPanel(drug);
}

function setPatientType(type) {
  state.patientType = type;
  const drug = DRUGS[state.selectedDrug];
  if (drug) renderCalculatorPanel(drug);
}

// ── Quick Reference Panel ──
function openQuickRef() {
  document.getElementById('quickRefOverlay').classList.add('open');
  document.getElementById('quickRefPanel').classList.add('open');
}

function closeQuickRef() {
  document.getElementById('quickRefOverlay').classList.remove('open');
  document.getElementById('quickRefPanel').classList.remove('open');
}

function renderQuickRef() {
  const body = document.getElementById('quickRefBody');
  body.innerHTML = `
    <!-- Volume Conversions -->
    <div class="ref-section">
      <div class="ref-section-title">Volume Conversions</div>
      <table class="ref-table">
        <tr><th>From</th><th>To</th></tr>
        <tr><td>1 gtt</td><td>0.06 ml</td></tr>
        <tr><td>15 gtts</td><td>1 ml</td></tr>
        <tr><td>1 tsp</td><td>5 ml</td></tr>
        <tr><td>1 tbsp</td><td>15 ml</td></tr>
        <tr><td>1 oz</td><td>30 ml</td></tr>
        <tr><td>1 cup</td><td>240 ml</td></tr>
        <tr><td>1 pint</td><td>500 ml</td></tr>
        <tr><td>1 dr</td><td>0.125 oz</td></tr>
        <tr><td>1000 ml</td><td>1 quart</td></tr>
      </table>
    </div>

    <!-- Weight Converter -->
    <div class="ref-section">
      <div class="ref-section-title">Weight Conversion</div>
      <div class="converter-widget">
        <div class="converter-row">
          <input type="number" class="converter-input" id="convKg" placeholder="0" inputmode="decimal">
          <span class="converter-label">kg</span>
        </div>
        <div style="text-align:center;"><span class="converter-arrow">⇅</span></div>
        <div class="converter-row">
          <input type="number" class="converter-input" id="convLb" placeholder="0" inputmode="decimal">
          <span class="converter-label">lb</span>
        </div>
      </div>
      <div style="font-size:0.75rem; color:var(--gray-400); text-align:center;">1 kg = 2.2 lb</div>
    </div>

    <!-- Temperature Converter -->
    <div class="ref-section">
      <div class="ref-section-title">Temperature Conversion</div>
      <div class="converter-widget">
        <div class="converter-row">
          <input type="number" class="converter-input" id="convC" placeholder="0" inputmode="decimal">
          <span class="converter-label">°C</span>
        </div>
        <div style="text-align:center;"><span class="converter-arrow">⇅</span></div>
        <div class="converter-row">
          <input type="number" class="converter-input" id="convF" placeholder="0" inputmode="decimal">
          <span class="converter-label">°F</span>
        </div>
      </div>
      <div style="font-size:0.75rem; color:var(--gray-400); text-align:center;">°C = (°F − 32) × 5/9</div>
    </div>

    <!-- CBG Converter -->
    <div class="ref-section">
      <div class="ref-section-title">Blood Glucose Conversion</div>
      <div class="converter-widget">
        <div class="converter-row">
          <input type="number" class="converter-input" id="convMgdl" placeholder="0" inputmode="decimal">
          <span class="converter-label">mg/dL</span>
        </div>
        <div style="text-align:center;"><span class="converter-arrow">⇅</span></div>
        <div class="converter-row">
          <input type="number" class="converter-input" id="convMmol" placeholder="0" inputmode="decimal">
          <span class="converter-label">mmol/L</span>
        </div>
      </div>
      <div style="font-size:0.75rem; color:var(--gray-400); text-align:center;">mmol/L = mg/dL × 0.0555</div>
    </div>

    <!-- CVP Converter -->
    <div class="ref-section">
      <div class="ref-section-title">CVP Conversion</div>
      <div class="converter-widget">
        <div class="converter-row">
          <input type="number" class="converter-input" id="convMmhg" placeholder="0" inputmode="decimal">
          <span class="converter-label">mmHg</span>
        </div>
        <div style="text-align:center;"><span class="converter-arrow">⇅</span></div>
        <div class="converter-row">
          <input type="number" class="converter-input" id="convCmh2o" placeholder="0" inputmode="decimal">
          <span class="converter-label">cmH₂O</span>
        </div>
      </div>
      <div style="font-size:0.75rem; color:var(--gray-400); text-align:center;">Normal CVP: 6–12 cmH₂O. cmH₂O = mmHg ÷ 1.5</div>
    </div>

    <!-- MAP Calculator -->
    <div class="ref-section">
      <div class="ref-section-title">MAP Calculator</div>
      <div class="converter-widget">
        <div class="converter-row">
          <input type="number" class="converter-input" id="mapSys" placeholder="Systolic" inputmode="numeric">
          <span class="converter-label">sys</span>
        </div>
        <div class="converter-row">
          <input type="number" class="converter-input" id="mapDia" placeholder="Diastolic" inputmode="numeric">
          <span class="converter-label">dia</span>
        </div>
        <div class="converter-row" style="background: var(--orange-50); border-radius: var(--radius-sm); padding: 8px 12px;">
          <span id="mapResult" style="font-size:1.1rem; font-weight:700; color:var(--orange-600);">— mmHg</span>
          <span class="converter-label">MAP</span>
        </div>
      </div>
      <div style="font-size:0.75rem; color:var(--gray-400); text-align:center;">MAP = (2 × Diastolic + Systolic) ÷ 3. Normal: 70–100 mmHg</div>
    </div>

    <!-- Pedia BP -->
    <div class="ref-section">
      <div class="ref-section-title">Pediatric Normal Systolic BP</div>
      <div class="converter-widget">
        <div class="converter-row">
          <input type="number" class="converter-input" id="pediaAge" placeholder="Age" inputmode="numeric">
          <span class="converter-label">years</span>
        </div>
        <div class="converter-row" style="background: var(--orange-50); border-radius: var(--radius-sm); padding: 8px 12px;">
          <span id="pediaBpResult" style="font-size:1.1rem; font-weight:700; color:var(--orange-600);">— mmHg</span>
          <span class="converter-label">SBP</span>
        </div>
      </div>
      <div style="font-size:0.75rem; color:var(--gray-400); text-align:center;">Normal SBP = Age × 2 + 70</div>
    </div>

    <!-- Metric System -->
    <div class="ref-section">
      <div class="ref-section-title">Metric System</div>
      <table class="ref-table">
        <tr><td>1 gram</td><td>1,000 mg</td></tr>
        <tr><td>1,000 g</td><td>1 kg</td></tr>
        <tr><td>1 mg</td><td>1,000 mcg</td></tr>
        <tr><td>0.001 mg</td><td>1 mcg</td></tr>
        <tr><td>1 Liter</td><td>1,000 mL</td></tr>
        <tr><td>1 meter</td><td>100 cm = 1,000 mm</td></tr>
        <tr><td>2.5 cm</td><td>1 inch</td></tr>
      </table>
    </div>

    <!-- Weight Table -->
    <div class="ref-section">
      <div class="ref-section-title">Weight / Grain Conversion</div>
      <table class="ref-table">
        <tr><th>Grams</th><th>mg</th><th>Grains</th></tr>
        <tr><td>1 g</td><td>1000 mg</td><td>15 gr</td></tr>
        <tr><td>0.6 g</td><td>600 mg</td><td>10 gr</td></tr>
        <tr><td>0.5 g</td><td>500 mg</td><td>7.5 gr</td></tr>
        <tr><td>0.3 g</td><td>300 mg</td><td>5 gr</td></tr>
        <tr><td>0.06 g</td><td>60 mg</td><td>1 gr</td></tr>
      </table>
    </div>

    <!-- Swan-Ganz -->
    <div class="ref-section">
      <div class="ref-section-title">Swan-Ganz Normal Values</div>
      <table class="swan-ganz-table">
        <tr><th>Chamber</th><th>Systolic</th><th>Diastolic</th></tr>
        <tr><td>RA</td><td>2–6</td><td>2–8</td></tr>
        <tr><td>RV</td><td>20–30</td><td>0–8</td></tr>
        <tr><td>PA</td><td>20–30</td><td>8–15</td></tr>
        <tr><td colspan="2">PCWP</td><td>6–12</td></tr>
      </table>
    </div>

    <!-- Pupil Scale -->
    <div class="ref-section">
      <div class="ref-section-title">Pupil Scale (mm)</div>
      <div class="pupil-scale">
        ${[1,2,3,4,5,6,7,8].map(s => `
          <div class="pupil-item">
            <div class="pupil-dot" style="width:${s * 4}px; height:${s * 4}px;"></div>
            <span class="pupil-label">${s}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Attach converter listeners
  setTimeout(attachConverterListeners, 50);
}

function attachConverterListeners() {
  // Weight: kg ↔ lb
  const convKg = document.getElementById('convKg');
  const convLb = document.getElementById('convLb');
  if (convKg && convLb) {
    convKg.addEventListener('input', () => {
      const v = parseFloat(convKg.value);
      convLb.value = isNaN(v) ? '' : formatNumber(v * 2.2);
    });
    convLb.addEventListener('input', () => {
      const v = parseFloat(convLb.value);
      convKg.value = isNaN(v) ? '' : formatNumber(v / 2.2);
    });
  }

  // Temperature: °C ↔ °F
  const convC = document.getElementById('convC');
  const convF = document.getElementById('convF');
  if (convC && convF) {
    convC.addEventListener('input', () => {
      const v = parseFloat(convC.value);
      convF.value = isNaN(v) ? '' : formatNumber(v * 9/5 + 32, 1);
    });
    convF.addEventListener('input', () => {
      const v = parseFloat(convF.value);
      convC.value = isNaN(v) ? '' : formatNumber((v - 32) * 5/9, 1);
    });
  }

  // CBG: mg/dL ↔ mmol/L
  const convMgdl = document.getElementById('convMgdl');
  const convMmol = document.getElementById('convMmol');
  if (convMgdl && convMmol) {
    convMgdl.addEventListener('input', () => {
      const v = parseFloat(convMgdl.value);
      convMmol.value = isNaN(v) ? '' : formatNumber(v * 0.0555);
    });
    convMmol.addEventListener('input', () => {
      const v = parseFloat(convMmol.value);
      convMgdl.value = isNaN(v) ? '' : formatNumber(v / 0.0555);
    });
  }

  // CVP: mmHg ↔ cmH2O
  const convMmhg = document.getElementById('convMmhg');
  const convCmh2o = document.getElementById('convCmh2o');
  if (convMmhg && convCmh2o) {
    convMmhg.addEventListener('input', () => {
      const v = parseFloat(convMmhg.value);
      convCmh2o.value = isNaN(v) ? '' : formatNumber(v / 1.5);
    });
    convCmh2o.addEventListener('input', () => {
      const v = parseFloat(convCmh2o.value);
      convMmhg.value = isNaN(v) ? '' : formatNumber(v * 1.5);
    });
  }

  // MAP Calculator
  const mapSys = document.getElementById('mapSys');
  const mapDia = document.getElementById('mapDia');
  const mapResult = document.getElementById('mapResult');
  if (mapSys && mapDia && mapResult) {
    const calcMap = () => {
      const s = parseFloat(mapSys.value);
      const d = parseFloat(mapDia.value);
      if (isNaN(s) || isNaN(d)) { mapResult.textContent = '— mmHg'; return; }
      const map = (2 * d + s) / 3;
      mapResult.textContent = `${formatNumber(map, 0)} mmHg`;
    };
    mapSys.addEventListener('input', calcMap);
    mapDia.addEventListener('input', calcMap);
  }

  // Pedia BP
  const pediaAge = document.getElementById('pediaAge');
  const pediaBpResult = document.getElementById('pediaBpResult');
  if (pediaAge && pediaBpResult) {
    pediaAge.addEventListener('input', () => {
      const age = parseFloat(pediaAge.value);
      if (isNaN(age)) { pediaBpResult.textContent = '— mmHg'; return; }
      const sbp = age * 2 + 70;
      pediaBpResult.textContent = `${formatNumber(sbp, 0)} mmHg`;
    });
  }
}

// ── Custom Drip Calculation ──
function recalculateCustomDrip() {
  const amount = parseFloat(state.customDrugAmount);
  const vol = parseFloat(state.customTotalVol);
  const unit = state.customDrugUnit || 'mg';
  const doseUnit = state.customDoseUnit || 'mcg/kg/min';
  const weight = parseFloat(state.weight);
  const dose = parseFloat(state.dose);
  const rate = parseFloat(state.rate);
  const isWeightBased = doseUnit.includes('/kg/');

  const resultEl = document.getElementById('calcResult');
  const concDisp = document.getElementById('customConcDisplay');

  // Show/hide weight input depending on doseUnit
  const weightGrp = document.getElementById('customWeightGroup');
  if (weightGrp) weightGrp.style.display = isWeightBased ? 'block' : 'none';

  if (isNaN(amount) || isNaN(vol) || amount <= 0 || vol <= 0) {
    if (concDisp) concDisp.textContent = '';
    if (resultEl) resultEl.innerHTML = '';
    return;
  }

  // Convert amount to mcg for internal calculation if mass, or keep units if units
  let totalMcg;
  if (unit === 'g') totalMcg = amount * 1000000;
  else if (unit === 'mg') totalMcg = amount * 1000;
  else if (unit === 'mcg') totalMcg = amount;
  else if (unit === 'units') totalMcg = amount;

  const concPerCc = totalMcg / vol; // mcg/mL or units/mL

  if (concDisp) {
    if (unit === 'units') {
      concDisp.textContent = `Concentration: ${formatNumber(concPerCc)} units/mL`;
    } else {
      const concMg = (totalMcg / 1000) / vol;
      concDisp.textContent = `Concentration: ${formatNumber(concPerCc)} mcg/mL (${formatNumber(concMg, 3)} mg/mL)`;
    }
  }

  if (state.calcMode === 'doseToRate') {
    if (isNaN(dose) || dose <= 0) { if (resultEl) resultEl.innerHTML = ''; return; }
    if (isWeightBased && (isNaN(weight) || weight <= 0)) { if (resultEl) resultEl.innerHTML = ''; return; }

    let requiredMcgPerHr = 0;
    if (doseUnit === 'mcg/kg/min') requiredMcgPerHr = dose * weight * 60;
    else if (doseUnit === 'mcg/kg/hr') requiredMcgPerHr = dose * weight;
    else if (doseUnit === 'mg/kg/min') requiredMcgPerHr = dose * 1000 * weight * 60;
    else if (doseUnit === 'mg/kg/hr') requiredMcgPerHr = dose * 1000 * weight;
    else if (doseUnit === 'mcg/min') requiredMcgPerHr = dose * 60;
    else if (doseUnit === 'mcg/hr') requiredMcgPerHr = dose;
    else if (doseUnit === 'mg/min') requiredMcgPerHr = dose * 1000 * 60;
    else if (doseUnit === 'mg/hr') requiredMcgPerHr = dose * 1000;
    else if (doseUnit === 'units/hr') requiredMcgPerHr = dose;
    else if (doseUnit === 'units/kg/hr') requiredMcgPerHr = dose * weight;

    const calcRate = requiredMcgPerHr / concPerCc;
    const gtts15 = (calcRate * 15) / 60;
    const gtts20 = (calcRate * 20) / 60;

    resultEl.innerHTML = `
      <div class="result-card">
        <div class="result-label">Calculated Flow Rate</div>
        <div class="result-value">${formatNumber(calcRate)}</div>
        <div class="result-unit">cc/hr (mL/hr)</div>
        <div class="result-details">
          <div class="result-detail">
            <div class="result-detail-label">Macro (15gtt)</div>
            <div class="result-detail-value">${formatNumber(gtts15)} gtts/min</div>
          </div>
          <div class="result-detail">
            <div class="result-detail-label">Macro (20gtt)</div>
            <div class="result-detail-value">${formatNumber(gtts20)} gtts/min</div>
          </div>
          <div class="result-detail">
            <div class="result-detail-label">Micro (60gtt)</div>
            <div class="result-detail-value">${formatNumber(calcRate)} ugtts/min</div>
          </div>
        </div>
      </div>
    `;
  } else {
    if (isNaN(rate) || rate <= 0) { if (resultEl) resultEl.innerHTML = ''; return; }
    if (isWeightBased && (isNaN(weight) || weight <= 0)) { if (resultEl) resultEl.innerHTML = ''; return; }

    const deliveredMcgPerHr = rate * concPerCc;
    let deliveredDose = 0;

    if (doseUnit === 'mcg/kg/min') deliveredDose = deliveredMcgPerHr / (weight * 60);
    else if (doseUnit === 'mcg/kg/hr') deliveredDose = deliveredMcgPerHr / weight;
    else if (doseUnit === 'mg/kg/min') deliveredDose = (deliveredMcgPerHr / 1000) / (weight * 60);
    else if (doseUnit === 'mg/kg/hr') deliveredDose = (deliveredMcgPerHr / 1000) / weight;
    else if (doseUnit === 'mcg/min') deliveredDose = deliveredMcgPerHr / 60;
    else if (doseUnit === 'mcg/hr') deliveredDose = deliveredMcgPerHr;
    else if (doseUnit === 'mg/min') deliveredDose = (deliveredMcgPerHr / 1000) / 60;
    else if (doseUnit === 'mg/hr') deliveredDose = deliveredMcgPerHr / 1000;
    else if (doseUnit === 'units/hr') deliveredDose = deliveredMcgPerHr;
    else if (doseUnit === 'units/kg/hr') deliveredDose = deliveredMcgPerHr / weight;

    resultEl.innerHTML = `
      <div class="result-card">
        <div class="result-label">Delivered Dose</div>
        <div class="result-value">${formatNumber(deliveredDose, 4)}</div>
        <div class="result-unit">${doseUnit}</div>
        <div class="result-details">
          <div class="result-detail">
            <div class="result-detail-label">Flow Rate</div>
            <div class="result-detail-value">${formatNumber(rate)} cc/hr</div>
          </div>
          <div class="result-detail">
            <div class="result-detail-label">Concentration</div>
            <div class="result-detail-value">${formatNumber(concPerCc)} ${unit === 'units' ? 'U' : 'mcg'}/cc</div>
          </div>
        </div>
      </div>
    `;
  }
}

// ── Handheld Math Calculator Logic ──
const mathCalcState = {
  display: '0',
  history: '',
  prevVal: null,
  op: null,
  newInput: true,
};

function openMathCalc() {
  document.getElementById('mathCalcOverlay').classList.add('open');
}

function closeMathCalc() {
  document.getElementById('mathCalcOverlay').classList.remove('open');
}

function mathCalcInput(val) {
  const outputEl = document.getElementById('mathCalcOutput');
  const historyEl = document.getElementById('mathCalcHistory');

  if (val >= '0' && val <= '9') {
    if (mathCalcState.newInput || mathCalcState.display === '0') {
      mathCalcState.display = val;
      mathCalcState.newInput = false;
    } else {
      mathCalcState.display += val;
    }
  } else if (val === '.') {
    if (mathCalcState.newInput) {
      mathCalcState.display = '0.';
      mathCalcState.newInput = false;
    } else if (!mathCalcState.display.includes('.')) {
      mathCalcState.display += '.';
    }
  } else if (val === 'C') {
    mathCalcState.display = '0';
    mathCalcState.history = '';
    mathCalcState.prevVal = null;
    mathCalcState.op = null;
    mathCalcState.newInput = true;
  } else if (val === 'back') {
    if (!mathCalcState.newInput && mathCalcState.display.length > 0) {
      mathCalcState.display = mathCalcState.display.slice(0, -1);
      if (mathCalcState.display === '' || mathCalcState.display === '-') {
        mathCalcState.display = '0';
        mathCalcState.newInput = true;
      }
    }
  } else if (val === 'pm') {
    if (mathCalcState.display !== '0') {
      if (mathCalcState.display.startsWith('-')) {
        mathCalcState.display = mathCalcState.display.substring(1);
      } else {
        mathCalcState.display = '-' + mathCalcState.display;
      }
    }
  } else if (val === '%') {
    const cur = parseFloat(mathCalcState.display);
    if (!isNaN(cur)) {
      mathCalcState.display = (cur / 100).toString();
      mathCalcState.newInput = true;
    }
  } else if (['+', '-', '*', '/'].includes(val)) {
    const cur = parseFloat(mathCalcState.display);
    if (mathCalcState.prevVal !== null && mathCalcState.op && !mathCalcState.newInput) {
      const res = evalMathOp(mathCalcState.prevVal, cur, mathCalcState.op);
      mathCalcState.display = res.toString();
      mathCalcState.prevVal = res;
    } else {
      mathCalcState.prevVal = cur;
    }
    mathCalcState.op = val;
    const symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    mathCalcState.history = `${mathCalcState.prevVal} ${symbolMap[val]}`;
    mathCalcState.newInput = true;
  } else if (val === '=') {
    if (mathCalcState.prevVal !== null && mathCalcState.op) {
      const cur = parseFloat(mathCalcState.display);
      const symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
      mathCalcState.history = `${mathCalcState.prevVal} ${symbolMap[mathCalcState.op]} ${cur} =`;
      const res = evalMathOp(mathCalcState.prevVal, cur, mathCalcState.op);
      mathCalcState.display = res.toString();
      mathCalcState.prevVal = null;
      mathCalcState.op = null;
      mathCalcState.newInput = true;
    }
  }

  if (outputEl) outputEl.textContent = mathCalcState.display;
  if (historyEl) historyEl.textContent = mathCalcState.history;
}

function evalMathOp(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 'Error';
    default: return b;
  }
}

// ── Search ──
function handleSearch(e) {
  state.searchQuery = e.target.value;
  const clearBtn = document.querySelector('.search-clear');
  if (clearBtn) clearBtn.classList.toggle('visible', state.searchQuery.length > 0);
  renderDrugGrid();
}

function clearSearch() {
  state.searchQuery = '';
  document.getElementById('searchInput').value = '';
  document.querySelector('.search-clear').classList.remove('visible');
  renderDrugGrid();
}

// ── Initialization ──
function init() {
  renderCategoryPills();
  renderDrugGrid();
  renderQuickRef();

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', handleSearch);

  // Close overlays on backdrop click
  document.getElementById('calcOverlay').addEventListener('click', closeCalculator);
  document.getElementById('quickRefOverlay').addEventListener('click', closeQuickRef);
  const mathOverlay = document.getElementById('mathCalcOverlay');
  if (mathOverlay) {
    mathOverlay.addEventListener('click', (e) => {
      if (e.target === mathOverlay) closeMathCalc();
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const isMathOpen = document.getElementById('mathCalcOverlay')?.classList.contains('open');

    if (e.key === 'Escape') {
      closeCalculator();
      closeQuickRef();
      closeMathCalc();
    } else if (isMathOpen) {
      if (e.key >= '0' && e.key <= '9') mathCalcInput(e.key);
      else if (e.key === '.' || e.key === ',') mathCalcInput('.');
      else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') mathCalcInput(e.key);
      else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); mathCalcInput('='); }
      else if (e.key === 'Backspace') mathCalcInput('back');
      else if (e.key === 'c' || e.key === 'C') mathCalcInput('C');
      else if (e.key === '%') mathCalcInput('%');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
