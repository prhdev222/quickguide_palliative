const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadMeta(file, name) {
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\n\\};`));
  assert.ok(match, `Could not find ${name} in ${file}`);

  const context = {};
  vm.createContext(context);
  vm.runInContext(`${name} = {${match[1]}\n}`, context);
  return context[name];
}

function checkConverter(meta, toMorphine, fromMorphine) {
  const equivalents = {
    codeine_po: 600,
    tramadol_po: 300,
    tramadol_iv: 200,
    morphine_po: 60,
    morphine_iv: 20,
    fentanyl_iv: 600,
    fentanyl_patch: 25,
  };

  for (const [drug, dose] of Object.entries(equivalents)) {
    assert.equal(meta[drug][toMorphine](dose), 60, `${drug} should equal Morphine PO 60 mg/day`);
    assert.equal(meta[drug][fromMorphine](60), dose, `Morphine PO 60 mg/day should equal ${drug}`);
  }
}

checkConverter(loadMeta('index.html', 'CONV_META'), 'toMo', 'fromMo');
checkConverter(loadMeta('Palliative_Drug_Search.html', 'DRUG_META'), 'toMoPo', 'fromMoPo');

console.log('Converter calculation tests passed');
