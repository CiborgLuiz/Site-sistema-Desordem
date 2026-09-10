"use strict";

// Simulador de regressão: usa as fórmulas operacionais da ficha e as regras
// de mesa esclarecidas. Habilidades especiais são deliberadamente excluídas.
// Não pretende substituir um motor de regras; mede a estabilidade relativa
// das quatro classes em duelos reproduzíveis.

const classes = {
  Mago: { hp: 12, growth: 2.5, mana: true, ki: false, main: "intelligence", attack: "misticismo" },
  Ki: { hp: 16, growth: 3, mana: false, ki: true, main: "wisdom", attack: "luta" },
  Híbrido: { hp: 10, growth: 2, mana: true, ki: true, main: "intelligence", attack: "misticismo" },
  "Restrição Celestial": { hp: 18, growth: 3, mana: false, ki: false, main: "strength", attack: "luta" },
};
const builds = ["ofensiva", "defensiva", "equilibrada", "controle", "recurso"];
const levels = [1, 10, 25, 40, 50];
const postures = { neutra: { hit: 0, damage: 0, defense: 0 }, ofensiva: { hit: 1, damage: .15, defense: -.15 }, defensiva: { hit: 0, damage: -.15, defense: .20 } };

function floor(n) { return Math.floor(n); }
function mod(n) { return floor((n - 10) / 2); }
function d20(seed) { seed.value = (seed.value * 1664525 + 1013904223) >>> 0; return (seed.value % 20) + 1; }
function d6(seed) { seed.value = (seed.value * 1664525 + 1013904223) >>> 0; return (seed.value % 6) + 1; }
function attrs(cls, build, level) {
  const a = { strength: 10, dexterity: 10, constitution: 10, charisma: 10, intelligence: 10, wisdom: 10 };
  const main = classes[cls].main;
  a[main] += 30;
  if (build === "ofensiva") a[main] += 20;
  if (build === "defensiva") { a.constitution += 20; a.dexterity += 10; }
  if (build === "controle") { a.wisdom += 20; a.charisma += 10; }
  if (build === "recurso") { a[classes[cls].mana ? "intelligence" : "wisdom"] += 20; }
  if (build === "equilibrada") { a.strength += 8; a.dexterity += 8; a.constitution += 8; }
  a[main] += floor(level / 2);
  return a;
}
function fighter(cls, build, level, posture) {
  const a = attrs(cls, build, level); const m = Object.fromEntries(Object.entries(a).map(([k, v]) => [k, mod(v)]));
  const c = classes[cls]; const p = postures[posture];
  const hp = floor(c.hp + Math.max(1, m.constitution + c.growth) * level);
  const defense = floor((10 + floor(level / 2) + m.dexterity) * (1 + p.defense));
  const skill = m[c.main] + floor(level / 2) + 5;
  const resource = c.mana ? 10 + level * (3 + m.intelligence) : c.ki ? 10 + level * (3 + m.wisdom) : 0;
  const refine = c.mana ? m.intelligence + floor(level / 10) : c.ki ? m.wisdom + floor(level / 10) : 0;
  const damage = 4 + Math.max(0, m[c.main]) + (build === "ofensiva" ? 4 : 0);
  return { cls, build, level, posture, hp, defense, skill: floor(skill + p.hit), resource, refine, damage: floor(damage * (1 + p.damage)), maxRounds: 30 };
}
function duel(left, right, seed) {
  let hpL = left.hp, hpR = right.hp, crits = 0, rounds = 0, hits = 0, damage = 0;
  while (hpL > 0 && hpR > 0 && rounds < 30) {
    rounds++;
    for (const [attacker, target] of [[left, right], [right, left]]) {
      if ((attacker === left ? hpL : hpR) <= 0) break;
      const roll = d20(seed); const crit = roll === 20; const total = roll + attacker.skill;
      if (crit || total >= target.defense) {
        hits++; const amount = attacker.damage + d6(seed) + (crit ? d6(seed) : 0); damage += amount; if (crit) crits++;
        if (target === left) hpL -= amount; else hpR -= amount;
      }
    }
  }
  const winner = hpL <= 0 && hpR <= 0 ? "empate" : hpL <= 0 ? right.cls : hpR <= 0 ? left.cls : "limite";
  return { winner, rounds, hits, crits, damage, draw: winner === "empate" || winner === "limite" };
}

const result = { total: 0, wins: {}, draws: 0, rounds: 0, damage: 0, crits: 0, hits: 0, byClass: {}, byBuild: {}, byLevel: {}, byPosture: {}, flags: [] };
for (const cls of Object.keys(classes)) for (const build of builds) for (const level of levels) for (let matchup = 0; matchup < 10; matchup++) {
  const enemyClass = Object.keys(classes)[(Object.keys(classes).indexOf(cls) + matchup + 1) % 4];
  const enemyBuild = builds[(builds.indexOf(build) + matchup) % builds.length];
  const posture = matchup % 3 === 0 ? "ofensiva" : matchup % 3 === 1 ? "defensiva" : "neutra";
  const enemyPosture = matchup % 2 ? "defensiva" : "neutra";
  const a = fighter(cls, build, level, posture), b = fighter(enemyClass, enemyBuild, level, enemyPosture);
  const r = duel(a, b, { value: 0xdecafbad + result.total }); result.total++;
  result.wins[r.winner] = (result.wins[r.winner] || 0) + 1; result.draws += r.draw ? 1 : 0;
  result.rounds += r.rounds; result.damage += r.damage; result.crits += r.crits; result.hits += r.hits;
  for (const key of [["byClass", cls], ["byBuild", build], ["byLevel", level], ["byPosture", posture]]) {
    const bucket = result[key[0]][key[1]] ||= { n: 0, wins: 0, draws: 0, rounds: 0, damage: 0 };
    bucket.n++; bucket.wins += r.winner === cls ? 1 : 0; bucket.draws += r.draw ? 1 : 0; bucket.rounds += r.rounds; bucket.damage += r.damage;
  }
}
result.avgRounds = result.rounds / result.total; result.avgDamage = result.damage / result.total; result.hitRate = result.hits / (result.total * 2 * result.avgRounds); result.critRate = result.crits / Math.max(1, result.hits);
for (const [k, v] of Object.entries(result.byClass)) { v.winRate = v.wins / v.n; v.avgRounds = v.rounds / v.n; }
for (const [k, v] of Object.entries(result.byBuild)) { v.winRate = v.wins / v.n; v.avgRounds = v.rounds / v.n; }
result.flags.push("Modelo deliberadamente exclui habilidades especiais e usa dano básico abstrato; resultados são comparativos, não previsão de campanha.");
result.flags.push("Limite de 30 rodadas marca empates por sustentabilidade/defesa, não vitória automática.");
console.log(JSON.stringify(result, null, 2));
