const fs = require('fs');
let code = fs.readFileSync('E:/ai/claude/ALAi/Drips App/app.js', 'utf8');

code = code.replace('const DRUGS =', 'global.DRUGS =');
code = code.replace('const state =', 'global.state =');

global.document = {
  getElementById: () => ({ innerHTML: '', classList: { add: () => {}, remove: () => {} } }),
  addEventListener: () => {}
};
global.window = global;

eval(code);

// Inject enhanced generateDosingTableData handler
global.generateDosingTableData = function(drug) {
  if (!drug) return null;

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
    return { drug, concLabel: 'Electrolyte Replacement Protocol', weight: state.weight, rows };
  }

  if (drug.formulaType === 'customDrip') {
    const vol = parseFloat(state.presetCustomVol) || 250;
    const amt = parseFloat(state.presetCustomAmt) || 100;
    const concMcg = (amt * 1000) / vol;
    const isWeight = state.customIsWeightBased !== false;
    const weight = parseFloat(state.weight) || 70;
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

  const weight = parseFloat(state.weight) || (drug.weightBased ? 70 : null);
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

  const doseList = [];
  if (minDose >= 1 && maxDose <= 50 && Number.isInteger(minDose) && Number.isInteger(maxDose)) {
    for (let d = minDose; d <= maxDose; d++) doseList.push(d);
  } else if (maxDose <= 3) {
    const presets = [0.01, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];
    presets.forEach(p => { if (p >= minDose && p <= maxDose) doseList.push(p); });
  } else {
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
};

const results = {};
Object.keys(DRUGS).forEach(k => {
  const drug = DRUGS[k];
  state.selectedDrug = k;
  state.selectedVolume = drug.concentrations ? Object.keys(drug.concentrations)[0] : '250cc';
  state.selectedConc = 0;
  state.weight = '70';

  const res = generateDosingTableData(drug);
  results[k] = {
    name: drug.name,
    formulaType: drug.formulaType,
    rowsCount: res && res.rows ? res.rows.length : 0,
    hasRes: !!res
  };
});

console.log(JSON.stringify(results, null, 2));
