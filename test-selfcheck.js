// ponytail: self-check para a lógica pura do app.js (sem DOM).
// Extrai as funções reais do fonte e testa os casos que quebram com mais facilidade.
const fs = require("fs");

const src = fs.readFileSync(__dirname + "/app.js", "utf8");
const lines = src.split("\n");

function extract(name) {
  const start = lines.findIndex((line) => line.startsWith(`function ${name}(`));
  if (start === -1) throw new Error(`função ${name} não encontrada`);
  let end = start + 1;
  while (end < lines.length && lines[end] !== "}") end += 1;
  return lines.slice(start, end + 1).join("\n");
}

const FUNCS = [
  "parseNumber",
  "weightDamageDice",
  "throwDistance",
  "modifierAppliesTo",
  "applyModifierTo",
  "extractDamageFromRow",
  "escapeHtml",
  "escapeAttr",
  "option",
  "optionWithLabel",
  "renderModifierRow",
];

const sandbox = {};
for (const name of FUNCS) sandbox[name] = eval(`(${extract(name)})`);

function extractConst(name) {
  const start = lines.findIndex((line) => line.startsWith(`const ${name} = [`));
  if (start === -1) throw new Error(`const ${name} não encontrada`);
  let end = start + 1;
  while (end < lines.length && lines[end] !== "];") end += 1;
  const slice = lines.slice(start, end + 1).join("\n").replace(`const ${name} = `, "");
  return eval(`(${slice.slice(0, -1)})`);
}

for (const name of FUNCS) eval(`var ${name} = ${extract(name)}`);

eval(`var ATTRIBUTES = ${JSON.stringify(extractConst("ATTRIBUTES"))}`);
eval(`var RESOURCES = ${JSON.stringify(extractConst("RESOURCES"))}`);
eval(`var SKILLS = ${JSON.stringify(extractConst("SKILLS"))}`);

const assert = require("assert");

// parseNumber: negativos e decimais
assert.strictEqual(parseNumber("-3"), -3);
assert.strictEqual(parseNumber("-2,5"), -2.5);
assert.strictEqual(parseNumber(""), 0);
assert.strictEqual(parseNumber("abc", 7), 7);

// dano por peso: 50kg = 1d6, 120kg = 2d6, 30kg = 0d6 (sem dano)
assert.strictEqual(weightDamageDice(50), 1);
assert.strictEqual(weightDamageDice(120), 2);
assert.strictEqual(weightDamageDice(30), 0);

// distância de arremesso: cargaMax / raiz(peso)
assert.strictEqual(throwDistance(100, 200), 20);
assert.strictEqual(throwDistance(0, 200), 0);
assert.strictEqual(throwDistance(400, 200), 10);

// modifierAppliesTo: legacy (target único) e novo (targets[])
assert.strictEqual(modifierAppliesTo({ target: "attr:strength" }, "attr:strength"), true);
assert.strictEqual(modifierAppliesTo({ targets: ["attr:strength", "attr:dexterity"] }, "attr:dexterity"), true);
assert.strictEqual(modifierAppliesTo({ targets: ["attr:strength"] }, "attr:dexterity"), false);

// applyModifierTo: flat + %, arredonda para baixo
assert.strictEqual(applyModifierTo(10, { flat: -2, pct: 0 }), 8);          // debuff fixo
assert.strictEqual(applyModifierTo(10, { flat: 0, pct: 50 }), 15);         // 50%
assert.strictEqual(applyModifierTo(10, { flat: 2, pct: 10 }), 13);         // 12 + 10% de 12 = 13.2 -> 13
assert.strictEqual(applyModifierTo(7, { flat: 0, pct: -20 }), 5);          // debuff %
assert.strictEqual(applyModifierTo(0, { flat: 0, pct: -50 }), 0);          // não deixa negativo além do 0

// extractDamageFromRow: Ki powers usam Bônus como dano
assert.strictEqual(extractDamageFromRow({ Bônus: "1d12 + Mod. Sabedoria." }), "1d12 + Mod. Sabedoria.");
assert.strictEqual(extractDamageFromRow({ Bônus: "+5 de dano." }), "+5 de dano.");
assert.strictEqual(extractDamageFromRow({ Dano: "1d8" }), "1d8");
assert.strictEqual(extractDamageFromRow({ Bônus: "+3 ataque, +3 Defesa" }), ""); // transformação não é dano
assert.strictEqual(extractDamageFromRow({}), "");

// renderModifierRow: campos novo (tipo %, alvos múltiplos, valor negativo)
const html = renderModifierRow({ id: "m1", name: "Debuff", kind: "Debuff", unit: "pct", targets: ["attr:strength", "skill:luta"], value: -20, active: true, note: "teste" }, 0);
for (const needle of [
  'data-modifier-field="unit"',
  "Valor fixo",
  "Porcentagem %",
  'data-modifier-target="attr:strength"',
  'data-modifier-target="skill:luta"',
  'data-modifier-field="value" data-index="0" value="-20"',
  "Atributos",
  "Recursos",
  "Perícias",
]) {
  assert.ok(html.includes(needle), `renderModifierRow sem "${needle}"`);
}

console.log("OK: todos os asserts passaram");
