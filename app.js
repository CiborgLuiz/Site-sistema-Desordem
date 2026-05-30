"use strict";

const STORAGE_KEY = "desordem.fichas.v1";
const API_BASE = "/api";
const SAVE_DELAY = 350;
const MAX_LEVEL = 50;
const MAX_SUBCLASS_LEVEL = 25;
const INITIAL_ATTRIBUTE_POINTS = 70;

const ATTRIBUTES = [
  { key: "strength", short: "FOR", label: "Força" },
  { key: "dexterity", short: "DES", label: "Destreza" },
  { key: "constitution", short: "CON", label: "Constituição" },
  { key: "charisma", short: "CAR", label: "Carisma" },
  { key: "intelligence", short: "INT", label: "Inteligência" },
  { key: "wisdom", short: "SAB", label: "Sabedoria" },
];

const ATTRIBUTE_BY_KEY = Object.fromEntries(ATTRIBUTES.map((attr) => [attr.key, attr]));

const CLASS_RULES = {
  Mago: {
    lifeBase: 12,
    lifePerLevel: 2.5,
    usesMana: true,
    usesKi: false,
    color: "#ff1742",
    profile: { strength: 8, dexterity: 10, constitution: 10, charisma: 12, intelligence: 18, wisdom: 12 },
  },
  Ki: {
    lifeBase: 16,
    lifePerLevel: 3,
    usesMana: false,
    usesKi: true,
    color: "#7ef0a4",
    profile: { strength: 15, dexterity: 15, constitution: 16, charisma: 8, intelligence: 9, wisdom: 15 },
  },
  Híbrido: {
    lifeBase: 10,
    lifePerLevel: 2,
    usesMana: true,
    usesKi: true,
    color: "#68d8ff",
    profile: { strength: 12, dexterity: 13, constitution: 12, charisma: 10, intelligence: 15, wisdom: 15 },
  },
  "Restrição Celestial": {
    lifeBase: 18,
    lifePerLevel: 3,
    usesMana: false,
    usesKi: false,
    color: "#f2c14e",
    profile: { strength: 18, dexterity: 16, constitution: 18, charisma: 8, intelligence: 8, wisdom: 10 },
  },
};

const SKILLS = [
  { key: "luta", label: "Luta", attr: "strength" },
  { key: "atletismo", label: "Atletismo", attr: "strength" },
  { key: "reflexos", label: "Reflexos", attr: "dexterity" },
  { key: "furtividade", label: "Furtividade", attr: "dexterity" },
  { key: "acrobacia", label: "Acrobacia", attr: "dexterity" },
  { key: "iniciativa", label: "Iniciativa", attr: "dexterity" },
  { key: "pontaria", label: "Pontaria", attr: "dexterity" },
  { key: "ladinagem", label: "Ladinagem", attr: "dexterity" },
  { key: "vigor", label: "Vigor", attr: "constitution" },
  { key: "fortitude", label: "Fortitude", attr: "constitution" },
  { key: "misticismo", label: "Misticismo", attr: "intelligence" },
  { key: "investigacao", label: "Investigação", attr: "intelligence" },
  { key: "conhecimento", label: "Conhecimento", attr: "intelligence" },
  { key: "vontade", label: "Vontade", attr: "wisdom" },
  { key: "intuicao", label: "Intuição", attr: "wisdom" },
  { key: "percepcao", label: "Percepção", attr: "wisdom" },
  { key: "sobrevivencia", label: "Sobrevivência", attr: "wisdom" },
  { key: "taticaSobrevivencia", label: "Tática de Sobrevivência", attr: "wisdom" },
  { key: "cura", label: "Cura", attr: "wisdom" },
  { key: "jogatina", label: "Jogatina", attr: "charisma" },
  { key: "persuasao", label: "Persuasão", attr: "charisma" },
  { key: "enganacao", label: "Enganação", attr: "charisma" },
  { key: "diplomacia", label: "Diplomacia", attr: "charisma" },
];

const RESOURCES = [
  { key: "hp", label: "Vida", formula: "Base da classe + (CON mod + vida por nível) x nível" },
  { key: "sanity", label: "Sanidade", formula: "20 + CAR mod + metade do nível" },
  { key: "mana", label: "Mana", formula: "10 + nível x (3 + INT mod)" },
  { key: "ki", label: "Ki", formula: "10 + nível x (3 + SAB mod)" },
  { key: "energy", label: "Energia física", formula: "Constituição total x nível" },
  { key: "defense", label: "Defesa", formula: "10 + metade do nível + DES mod + equipamento" },
  { key: "magicAmp", label: "Ampliação Mágica", formula: "INT mod + piso(nível / 10)" },
];

const DATA_SOURCES = {
  items: {
    label: "Itens",
    path: "Sistema/DESORDEM/Itens/Equipamentos d7ca8178912546b9a539ec5e7682bae5.csv",
  },
  arcane: {
    label: "Magias Arcanas",
    path: "Sistema/DESORDEM/Magias/Magias Arcanas af6b2c2026e34411a9c658fcb07d0e52.csv",
  },
  ki: {
    label: "Técnicas de Ki",
    path: "Sistema/DESORDEM/Magias/Técnicas de Ki 697b3b0ced9944c5ac27df54e855b67e.csv",
  },
  powers: {
    label: "Poderes Especiais",
    path: "Sistema/DESORDEM/Magias/Poderes Especiais 26d6446d688f44e7af5c7669b7b93d6a.csv",
  },
  subclasses: {
    label: "Subclasses",
    path: "Sistema/DESORDEM/Criar Personagem/Subclasses 4ff6f2db938a46e09513497027fc1d23.csv",
  },
  postures: {
    label: "Posturas",
    path: "Sistema/DESORDEM/Mecânicas/Posturas 0f28ef55604447adbda13a03dee93d95.csv",
  },
};

const WIKI_ROOT_PATH = "Sistema/DESORDEM fd4ed0eed7ae4bc689533916b2dfa43a.html";
const WIKI_QUICK_LINKS = [
  { label: "Hub", path: WIKI_ROOT_PATH },
  { label: "Começar", path: "Sistema/DESORDEM/Começar fc6cc0c0e2b547ab802d44dce7870a88.html" },
  { label: "Criar Personagem", path: "Sistema/DESORDEM/Criar Personagem 361ca02c8953494c8b86c001cc507fca.html" },
  { label: "Classes", path: "Sistema/DESORDEM/Classes 23e4e788e48041e6be8524abbb45c54f.html" },
  { label: "Subclasses", path: "Sistema/DESORDEM/Subclasses fa23d144257d4e36a3e22bb34cd621e0.html" },
  { label: "Conceitos", path: "Sistema/DESORDEM/Conceitos Fundamentais f2b590ffb37b4ab2b1abd437018029f3.html" },
  { label: "Mecânicas", path: "Sistema/DESORDEM/Mecânicas eb90fea1e320443ca853723f58156cea.html" },
  { label: "Condições", path: "Sistema/DESORDEM/Mecânicas/Condições dcae7e0593924273908258460c655bef.csv" },
  { label: "Itens", path: "Sistema/DESORDEM/Itens 5fe4a784ad90408a9827f8decc6b0763.html" },
  { label: "Magias", path: "Sistema/DESORDEM/Magias 8f527363583d4c40bd712b49b4f86f2c.html" },
  { label: "Magias Arcanas", path: "Sistema/DESORDEM/Magias/Magias Arcanas af6b2c2026e34411a9c658fcb07d0e52.csv" },
  { label: "Técnicas de Ki", path: "Sistema/DESORDEM/Magias/Técnicas de Ki 697b3b0ced9944c5ac27df54e855b67e.csv" },
  { label: "Poderes Especiais", path: "Sistema/DESORDEM/Magias/Poderes Especiais 26d6446d688f44e7af5c7669b7b93d6a.csv" },
  { label: "Mundo / Lore", path: "Sistema/DESORDEM/Mundo Lore 99e0dc6437e545d7bfed5a78cc9b6bcb.html" },
];

const EDITOR_TABS = [
  { key: "ficha", label: "Ficha" },
  { key: "pericias", label: "Perícias" },
  { key: "inventario", label: "Equipamentos" },
  { key: "biblioteca", label: "Biblioteca" },
  { key: "poderes", label: "Poderes" },
  { key: "modificadores", label: "Modificadores" },
  { key: "estatisticas", label: "Estatística" },
];

const LIBRARY_TABS = [
  { key: "items", label: "Itens" },
  { key: "arcane", label: "Magias" },
  { key: "ki", label: "Ki" },
];

const ALLOWED_LIBRARY_CATEGORIES = new Set([
  "arma",
  "armadura",
  "artefato",
  "consumivel",
  "consumível",
  "catalisador",
  "ferramenta",
  "utilitario",
  "utilitário",
  "acessorio",
  "acessório",
]);

const ALLOWED_TIER_CATEGORIES = new Set(["básico", "basico", "intermediário", "intermediario", "avançado", "avancado", "supremo"]);

const POSTURE_RULES = {
  Neutra: { label: "Neutra" },
  "Postura Ofensiva": { attrPct: { strength: 20, dexterity: 20 }, defensePct: -15 },
  "Postura Defensiva": { defensePct: 20, attrPct: { strength: -15 } },
  "Postura de Caçador": { conditionalDamagePct: 15, survivalSkillPct: 20 },
  "Postura Estratégica": { mentalSkillPct: 20, damagePct: -10 },
  "Postura Impulsiva": { damagePct: 15, critPct: 15 },
  "Postura Zen": { sanityPct: 15, mentalSkillPct: 15, damagePct: -15, regenPct: 20 },
  "Postura Guardião": { defensePct: 25 },
  "Postura Precisa": { skillPct: { pontaria: 25 }, critPct: 20 },
  "Postura Ágil": { skillPct: { reflexos: 25, acrobacia: 20, iniciativa: 20 }, defensePct: -15 },
  "Postura Berserker": { damagePct: 25, defensePct: -20 },
  "Postura Arcana": { magicAmpPct: 30, manaCostPct: 20 },
  "Postura Analítica": { attrPct: { intelligence: 25 }, damagePct: -10 },
  "Postura Sombria": { skillPct: { furtividade: 15 }, conditionalDamagePct: 20 },
  "Postura Instável": {
    attrPct: {
      strength: 30,
      dexterity: 30,
      constitution: 30,
      charisma: 30,
      intelligence: 30,
      wisdom: 30,
    },
  },
  "Postura Sincronizada": {
    attrPct: {
      strength: 15,
      dexterity: 15,
      constitution: 15,
      charisma: 15,
      intelligence: 15,
      wisdom: 15,
    },
  },
  "Postura Vampírica": { lifestealPct: 20 },
  "Postura Dimensional": { dodgePct: 15, mobilityPct: 20 },
};

const app = document.getElementById("app");
const library = {
  status: "loading",
  error: "",
  data: { items: [], arcane: [], ki: [], powers: [], subclasses: [], postures: [], enchantments: [] },
};
const wiki = {
  status: "idle",
  error: "",
  path: "",
  title: "",
  html: "",
};

let state = getInitialState();
let saveTimer = 0;
let serverOnline = false;
let lastSyncError = "";

initializeApp();

window.addEventListener("resize", () => {
  window.requestAnimationFrame(drawRadar);
});

async function initializeApp() {
  renderApp();
  loadLibrary();
  const persisted = await loadState();
  state = { ...getInitialState(), ...persisted };
  renderApp();
}

function getInitialState() {
  return {
    sheets: [],
    activeId: null,
    view: "home",
    activeTab: "ficha",
    libraryTab: "items",
    librarySearch: "",
    libraryCategory: "",
    onlyCompatible: true,
    wikiPath: WIKI_ROOT_PATH,
    wikiHistory: [],
  };
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const sheet = getActiveSheet();

  if (action === "go-home") {
    state.view = "home";
    persistNow();
    renderApp();
    return;
  }

  if (action === "open-wiki") {
    openWikiPage(state.wikiPath || WIKI_ROOT_PATH, false);
    return;
  }

  if (action === "wiki-home") {
    openWikiPage(WIKI_ROOT_PATH, true);
    return;
  }

  if (action === "wiki-back") {
    const previous = state.wikiHistory.pop() || WIKI_ROOT_PATH;
    openWikiPage(previous, false);
    return;
  }

  if (action === "wiki-open") {
    openWikiPage(button.dataset.path || WIKI_ROOT_PATH, true);
    return;
  }

  if (action === "new-sheet") {
    createSheetFromForm();
    return;
  }

  if (action === "refresh-sheets") {
    refreshSheetsFromServer();
    return;
  }

  if (action === "open-sheet") {
    state.activeId = button.dataset.id;
    state.view = "editor";
    state.activeTab = "ficha";
    persistNow();
    renderApp();
    return;
  }

  if (action === "delete-sheet") {
    deleteSheet(button.dataset.id);
    return;
  }

  if (action === "duplicate-sheet") {
    duplicateSheet(button.dataset.id);
    return;
  }

  if (!sheet) return;

  if (action === "switch-tab") {
    state.activeTab = button.dataset.tab;
    persistNow();
    renderApp();
    return;
  }

  if (action === "switch-library-tab") {
    state.libraryTab = button.dataset.libraryTab;
    state.libraryCategory = "";
    persistNow();
    renderApp();
    return;
  }

  if (action === "add-subclass") {
    const first = getCompatibleSubclasses(sheet.className)[0]?.Nome || "";
    sheet.subclasses.push({ name: cleanWikiText(first), level: 1 });
    clampSubclasses(sheet, sheet.subclasses.length - 1);
    touchAndRender(sheet);
    return;
  }

  if (action === "remove-subclass") {
    sheet.subclasses.splice(Number(button.dataset.index), 1);
    touchAndRender(sheet);
    return;
  }

  if (action === "add-inventory") {
    addInventoryFromLibrary(sheet, button.dataset.sourceKey, Number(button.dataset.sourceIndex));
    return;
  }

  if (action === "add-inventory-custom") {
    sheet.inventory.push(normalizeInventoryItem({ name: "Item customizado", quantity: 1 }));
    touchAndRender(sheet);
    return;
  }

  if (action === "remove-inventory") {
    sheet.inventory.splice(Number(button.dataset.index), 1);
    touchAndRender(sheet);
    return;
  }

  if (action === "add-enchantment") {
    const itemIndex = Number(button.dataset.index);
    const picker = document.querySelector(`[data-enchantment-picker="${itemIndex}"]`);
    addEnchantmentFromLibrary(sheet, itemIndex, Number(picker?.value || 0));
    return;
  }

  if (action === "add-custom-enchantment") {
    const item = sheet.inventory[Number(button.dataset.index)];
    if (!item) return;
    item.enchantments.push(normalizeEnchantment({ name: "Encantamento customizado" }));
    touchAndRender(sheet);
    return;
  }

  if (action === "remove-enchantment") {
    const item = sheet.inventory[Number(button.dataset.index)];
    if (!item) return;
    item.enchantments.splice(Number(button.dataset.enchantmentIndex), 1);
    touchAndRender(sheet);
    return;
  }

  if (action === "add-ability") {
    addAbilityFromLibrary(sheet, button.dataset.sourceKey, Number(button.dataset.sourceIndex));
    return;
  }

  if (action === "add-custom-ability") {
    sheet.abilities.push({ id: uid(), name: "", type: "Poder", cost: "", damage: "", note: "", source: "Manual" });
    touchAndRender(sheet);
    return;
  }

  if (action === "remove-ability") {
    sheet.abilities.splice(Number(button.dataset.index), 1);
    touchAndRender(sheet);
    return;
  }

  if (action === "add-modifier") {
    sheet.modifiers.push({
      id: uid(),
      name: "",
      kind: "Buff",
      target: "",
      value: 0,
      active: true,
      note: "",
    });
    touchAndRender(sheet);
    return;
  }

  if (action === "remove-modifier") {
    sheet.modifiers.splice(Number(button.dataset.index), 1);
    touchAndRender(sheet);
    return;
  }

  if (action === "export-pdf") {
    window.print();
  }
});

document.addEventListener("click", (event) => {
  if (state.view !== "wiki") return;
  const link = event.target.closest(".wiki-article a");
  if (!link) return;

  const nextPath = resolveWikiPath(link.getAttribute("href"), state.wikiPath || WIKI_ROOT_PATH);
  if (!nextPath) return;

  event.preventDefault();
  openWikiPage(nextPath, true);
});

document.addEventListener("input", (event) => {
  const target = event.target;
  const sheet = getActiveSheet();

  if (target.matches("[data-home-field]")) return;

  if (target.matches("[data-library-search]")) {
    state.librarySearch = target.value;
    renderLibraryListOnly();
    return;
  }

  if (target.matches("[data-library-category]")) {
    state.libraryCategory = target.value;
    renderLibraryListOnly();
    persistSoon();
    return;
  }

  if (!sheet) return;

  if (target.matches("[data-bind]")) {
    setByPath(sheet, target.dataset.bind, target.value);
    if (target.dataset.bind === "name") updateActiveTitle(sheet);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-number-bind]")) {
    const path = target.dataset.numberBind;
    const value = path === "level" ? clamp(parseNumber(target.value, 1), 1, MAX_LEVEL) : parseNumber(target.value);
    setByPath(sheet, path, value);
    if (path === "level") {
      target.value = value;
      clampSubclasses(sheet);
    }
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-attr-field]")) {
    const attr = target.dataset.attr;
    const field = target.dataset.attrField;
    const value = field === "base" ? Math.max(0, parseNumber(target.value)) : parseNumber(target.value);
    sheet.attributes[attr][field] = value;
    if (field === "base") enforceAttributeBudget(sheet, attr, target);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-resource-mod]")) {
    sheet.resourceMods[target.dataset.resourceMod] = parseNumber(target.value);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-current]")) {
    sheet.current[target.dataset.current] = target.value === "" ? "" : parseNumber(target.value);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-equipment-defense]")) {
    sheet.equipmentDefense = parseNumber(target.value);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-subclass-field]")) {
    const row = sheet.subclasses[Number(target.dataset.index)];
    if (!row) return;
    row[target.dataset.subclassField] =
      target.dataset.subclassField === "level" ? clamp(parseNumber(target.value), 0, MAX_SUBCLASS_LEVEL) : target.value;
    clampSubclasses(sheet, Number(target.dataset.index));
    if (target.dataset.subclassField === "level") target.value = row.level;
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-skill-mod]")) {
    sheet.skillMods[target.dataset.skillMod] = parseNumber(target.value);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-inventory-field]")) {
    updateCollectionField(sheet.inventory, target);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-enchantment-field]")) {
    updateEnchantmentField(sheet, target);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-ability-field]")) {
    updateCollectionField(sheet.abilities, target);
    touchSheet(sheet);
    return;
  }

  if (target.matches("[data-modifier-field]")) {
    updateCollectionField(sheet.modifiers, target);
    touchSheet(sheet);
    refreshCalculations();
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  const sheet = getActiveSheet();

  if (target.matches("[data-library-compatible]")) {
    state.onlyCompatible = target.checked;
    renderLibraryListOnly();
    persistSoon();
    return;
  }

  if (target.matches("[data-library-category]")) {
    state.libraryCategory = target.value;
    renderLibraryListOnly();
    persistSoon();
    return;
  }

  if (!sheet) return;

  if (target.matches("[data-class-select]")) {
    sheet.className = target.value;
    clampSubclasses(sheet);
    touchAndRender(sheet);
    return;
  }

  if (target.matches("[data-posture-select]")) {
    sheet.posture = target.value;
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-skill-trained]")) {
    sheet.trained[target.dataset.skillTrained] = target.checked;
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-inventory-field]")) {
    updateCollectionField(sheet.inventory, target);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-enchantment-field]")) {
    updateEnchantmentField(sheet, target);
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

  if (target.matches("[data-modifier-field]")) {
    updateCollectionField(sheet.modifiers, target);
    touchSheet(sheet);
    refreshCalculations();
  }
});

function renderApp() {
  app.innerHTML = `
    <div class="app-frame">
      ${renderHeader()}
      <main class="shell">
        ${renderMainContent()}
      </main>
    </div>
  `;

  refreshCalculations();
  renderLibraryListOnly();
  if (state.view === "wiki") ensureWikiPage(state.wikiPath || WIKI_ROOT_PATH);
}

function renderMainContent() {
  if (state.view === "wiki") return renderWiki();
  if (state.view === "editor" && getActiveSheet()) return renderEditor(getActiveSheet());
  return renderHome();
}

function renderHeader() {
  const sheet = getActiveSheet();
  const isEditing = state.view === "editor" && sheet;
  const title = state.view === "wiki" ? "Wiki" : isEditing ? escapeHtml(sheet.name || "Ficha sem nome") : "Fichas";
  return `
    <header class="topbar">
      <div class="brand">
        <img class="brand-logo" src="logo.png" alt="DESORDEM" />
        <div>
          <h1 class="brand-title">DESORDEM</h1>
          <p class="brand-subtitle" id="activeTitle">${title}</p>
        </div>
      </div>
      <div class="topbar-actions">
        <span class="save-status" data-save-status>Auto salvo</span>
        <button type="button" class="ghost-button" data-action="go-home">Fichas</button>
        <button type="button" class="ghost-button" data-action="open-wiki">Wiki</button>
        ${
          isEditing
            ? `<button type="button" class="primary-button" data-action="export-pdf">Exportar PDF</button>`
            : ""
        }
      </div>
    </header>
  `;
}

function renderHome() {
  const sheets = state.sheets.map(renderSheetCard).join("");
  return `
    <section class="home-grid">
      <form class="panel home-form" onsubmit="return false">
        <div class="panel-title">
          <h2>Nova ficha</h2>
        </div>
        <label class="field">
          <span>Nome</span>
          <input data-home-field="name" autocomplete="off" placeholder="Nome do personagem" />
        </label>
        <label class="field">
          <span>Classe</span>
          <select data-home-field="className">
            ${classOptions("Mago")}
          </select>
        </label>
        <label class="field">
          <span>Descrição</span>
          <textarea data-home-field="description" placeholder="Conceito, origem, campanha"></textarea>
        </label>
        <button type="button" class="primary-button" data-action="new-sheet">Criar ficha</button>
        <button type="button" class="ghost-button" data-action="open-wiki">Abrir wiki do sistema</button>
      </form>
      <section class="panel">
        <div class="panel-title">
          <h2>Personagens</h2>
          <div class="card-actions">
            <span class="badge ${serverOnline ? "hot" : ""}">${databaseStatusText()}</span>
            <span class="badge hot">${state.sheets.length} fichas</span>
            <button type="button" class="ghost-button" data-action="refresh-sheets">Atualizar</button>
          </div>
        </div>
        <div class="sheets-grid">
          ${sheets || `<div class="empty-state">Nenhuma ficha criada.</div>`}
        </div>
      </section>
    </section>
  `;
}

function renderWiki() {
  const currentPath = state.wikiPath || WIKI_ROOT_PATH;
  const quickLinks = WIKI_QUICK_LINKS.map(
    (link) => `
      <button type="button" class="wiki-nav-button ${link.path === currentPath ? "active" : ""}" data-action="wiki-open" data-path="${escapeAttr(link.path)}">
        ${escapeHtml(link.label)}
      </button>
    `,
  ).join("");

  return `
    <section class="wiki-layout">
      <aside class="panel wiki-sidebar">
        <div class="panel-title">
          <h2>Wiki</h2>
        </div>
        <div class="wiki-sidebar-actions">
          <button type="button" class="primary-button" data-action="wiki-home">Hub</button>
          <button type="button" class="ghost-button" data-action="wiki-back" ${state.wikiHistory.length ? "" : "disabled"}>Voltar</button>
        </div>
        <nav class="wiki-nav" aria-label="Seções da wiki">
          ${quickLinks}
        </nav>
      </aside>
      <section class="panel wiki-panel">
        <div class="panel-title">
          <h2>${escapeHtml(wiki.path === currentPath ? wiki.title || "Wiki" : "Wiki")}</h2>
          <span class="badge">${escapeHtml(wikiStatusText(currentPath))}</span>
        </div>
        <article class="wiki-article">
          ${renderWikiArticle(currentPath)}
        </article>
      </section>
    </section>
  `;
}

function renderWikiArticle(currentPath) {
  if (wiki.path !== currentPath || wiki.status === "loading" || wiki.status === "idle") {
    return `<div class="empty-state">Carregando wiki.</div>`;
  }
  if (wiki.status === "error") {
    return `<div class="empty-state">${escapeHtml(wiki.error || "Não foi possível carregar esta página da wiki.")}</div>`;
  }
  return wiki.html || `<div class="empty-state">Página vazia.</div>`;
}

function wikiStatusText(currentPath) {
  if (wiki.path !== currentPath || wiki.status === "loading") return "Carregando";
  if (wiki.status === "error") return "Erro";
  return currentPath.endsWith(".csv") ? "Tabela" : "Página";
}

function renderSheetCard(sheet) {
  const rules = getClassRules(sheet.className);
  const updated = sheet.updatedAt ? new Date(sheet.updatedAt).toLocaleString("pt-BR") : "";
  return `
    <article class="sheet-card">
      <div>
        <h3>${escapeHtml(sheet.name || "Ficha sem nome")}</h3>
        <p class="tiny">${escapeHtml(sheet.description || "Sem descrição")}</p>
      </div>
      <div class="sheet-meta">
        <span class="badge hot">${escapeHtml(sheet.className)}</span>
        <span class="badge">Nível ${formatNumber(sheet.level || 1)}</span>
        <span class="badge">PV base ${formatNumber(rules.lifeBase)}</span>
      </div>
      <span class="tiny">Atualizada: ${escapeHtml(updated)}</span>
      <div class="card-actions">
        <button type="button" class="primary-button" data-action="open-sheet" data-id="${sheet.id}">Abrir</button>
        <button type="button" class="ghost-button" data-action="duplicate-sheet" data-id="${sheet.id}">Duplicar</button>
        <button type="button" class="danger-button" data-action="delete-sheet" data-id="${sheet.id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderEditor(sheet) {
  const posture = sheet.posture || "Neutra";
  return `
    <section class="editor-layout">
      <div class="editor-head">
        <div class="editor-title">
          <h2>${escapeHtml(sheet.name || "Ficha sem nome")}</h2>
          <div class="sheet-meta">
            <span class="badge hot">${escapeHtml(sheet.className)}</span>
            <span class="badge">Nível ${formatNumber(sheet.level || 1)}</span>
            <span class="badge" data-calc="trained-summary">Treinadas 0/0</span>
          </div>
        </div>
        <div class="combat-stance">
          <label class="field">
            <span>Postura de combate</span>
            <select data-posture-select>
              ${postureOptions(posture)}
            </select>
          </label>
          <span class="tiny" data-calc="posture-summary">Sem alteração de postura.</span>
        </div>
      </div>
      <nav class="tabbar" aria-label="Abas da ficha">
        ${EDITOR_TABS.map(
          (tab) => `
            <button type="button" class="tab-button ${state.activeTab === tab.key ? "active" : ""}" data-action="switch-tab" data-tab="${tab.key}">
              ${tab.label}
            </button>
          `,
        ).join("")}
      </nav>
      ${renderSheetTab(sheet)}
      ${renderSkillsTab(sheet)}
      ${renderInventoryTab(sheet)}
      ${renderLibraryTab(sheet)}
      ${renderAbilitiesTab(sheet)}
      ${renderModifiersTab(sheet)}
      ${renderStatsTab(sheet)}
    </section>
  `;
}

function renderSheetTab(sheet) {
  return `
    <section class="tab-panel ${state.activeTab === "ficha" ? "active" : ""}" data-panel="ficha">
      <div class="two-col">
        <div class="panel">
          <div class="panel-title">
            <h3>Identidade</h3>
          </div>
          <div class="form-grid">
            <label class="field span-2">
              <span>Nome do personagem</span>
              <input data-bind="name" value="${escapeAttr(sheet.name)}" autocomplete="off" />
            </label>
            <label class="field span-2">
              <span>Player</span>
              <input data-bind="playerName" value="${escapeAttr(sheet.playerName)}" autocomplete="off" />
            </label>
            <label class="field">
              <span>Idade</span>
              <input data-bind="age" value="${escapeAttr(sheet.age)}" autocomplete="off" />
            </label>
            <label class="field">
              <span>Altura</span>
              <input data-bind="height" value="${escapeAttr(sheet.height)}" autocomplete="off" />
            </label>
            <label class="field">
              <span>Level</span>
              <input type="number" min="1" max="${MAX_LEVEL}" step="1" data-number-bind="level" value="${escapeAttr(sheet.level)}" />
            </label>
            <label class="field">
              <span>Classe</span>
              <select data-class-select>
                ${classOptions(sheet.className)}
              </select>
            </label>
            <label class="field span-4">
              <span>Descrição</span>
              <textarea data-bind="description">${escapeHtml(sheet.description)}</textarea>
            </label>
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">
            <h3>Subclasses</h3>
            <span class="badge" data-calc="subclass-summary">0/${formatNumber(sheet.level || 1)}</span>
            <button type="button" class="ghost-button" data-action="add-subclass">Adicionar</button>
          </div>
          <div class="subclass-list">
            ${
              sheet.subclasses.length
                ? sheet.subclasses.map(renderSubclassRow).join("")
                : `<div class="empty-state">Sem subclasses.</div>`
            }
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">
          <h3>Atributos</h3>
          <div class="skill-summary" data-attribute-summary>
            <span class="badge hot" data-calc="attribute-budget">0/${INITIAL_ATTRIBUTE_POINTS}</span>
            <span class="tiny">Base padrão 0. Modificador = piso((valor - 10) / 2)</span>
          </div>
        </div>
        <div class="attr-grid">
          ${ATTRIBUTES.map((attr) => renderAttributeCard(sheet, attr)).join("")}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">
          <h3>Recursos e defesa</h3>
        </div>
        <div class="metrics-grid">
          ${RESOURCES.map((resource) => renderResourceCard(sheet, resource)).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderSubclassRow(row, index) {
  return `
    <div class="subclass-row">
      <label class="field">
        <span>Subclasse</span>
        <select data-subclass-field="name" data-index="${index}">
          ${subclassOptions(getActiveSheet(), row.name)}
        </select>
      </label>
      <label class="field">
        <span>Level</span>
        <input type="number" step="1" min="0" max="${MAX_SUBCLASS_LEVEL}" data-subclass-field="level" data-index="${index}" value="${escapeAttr(row.level)}" />
      </label>
      <div class="row-actions">
        <button type="button" class="danger-button" data-action="remove-subclass" data-index="${index}">Remover</button>
      </div>
    </div>
  `;
}

function renderAttributeCard(sheet, attr) {
  const data = sheet.attributes[attr.key];
  return `
    <article class="attr-card">
      <div class="attr-title">
        <strong>${attr.label}</strong>
        <span class="badge">${attr.short}</span>
      </div>
      <div class="attr-fields">
        <label class="field">
          <span>Base</span>
          <input type="number" step="1" data-attr="${attr.key}" data-attr-field="base" value="${escapeAttr(data.base)}" />
        </label>
        <label class="field">
          <span>Extra</span>
          <input type="number" step="1" data-attr="${attr.key}" data-attr-field="manual" value="${escapeAttr(data.manual)}" />
        </label>
      </div>
      <div class="attr-total">
        <div class="stat-box">
          <span>Total</span>
          <strong data-calc="attr-total-${attr.key}">0</strong>
        </div>
        <div class="stat-box">
          <span>Mod</span>
          <strong data-calc="attr-mod-${attr.key}">+0</strong>
        </div>
      </div>
    </article>
  `;
}

function renderResourceCard(sheet, resource) {
  const uses = resource.key === "mana" ? getClassRules(sheet.className).usesMana : resource.key === "ki" ? getClassRules(sheet.className).usesKi : true;
  const currentDisabled = uses ? "" : "disabled";
  const extra = sheet.resourceMods[resource.key] ?? 0;
  const current = sheet.current[resource.key] ?? "";
  const defenseEquip = resource.key === "defense"
    ? `
      <label class="field">
        <span>Equip.</span>
        <input type="number" step="1" data-equipment-defense value="${escapeAttr(sheet.equipmentDefense)}" />
      </label>
    `
    : "";

  return `
    <article class="metric-card ${uses ? "" : "resource-disabled"}" data-resource-name="${resource.key}">
      <div class="metric-main">
        <span class="metric-name">${resource.label}</span>
        <strong class="metric-value" data-calc="resource-${resource.key}">0</strong>
        <div class="metric-formula">${resource.formula}</div>
        ${uses && resource.key !== "defense" && resource.key !== "magicAmp" ? `
        <div class="resource-bar" data-resource-bar="${resource.key}">
          <div class="resource-bar-fill"></div>
          <div class="resource-bar-text"><span class="bar-current">${escapeHtml(String(current || "0"))}</span>/<span class="bar-max">0</span></div>
        </div>
        ` : ""}
      </div>
      ${resource.key !== "defense" && resource.key !== "magicAmp" ? `
      <label class="field">
        <span>Atual</span>
        <input type="number" step="0.5" data-current="${resource.key}" value="${escapeAttr(current)}" ${currentDisabled} />
      </label>
      ` : ""}
      <div class="metric-extra">
        ${defenseEquip}
        <label class="field">
          <span>Extra</span>
          <input type="number" step="0.5" data-resource-mod="${resource.key}" value="${escapeAttr(extra)}" ${currentDisabled && (resource.key === "mana" || resource.key === "ki") ? "disabled" : ""} />
        </label>
      </div>
    </article>
  `;
}

function renderSkillsTab(sheet) {
  const groups = ATTRIBUTES.map((attr) => {
    const skills = SKILLS.filter((skill) => skill.attr === attr.key);
    return `
      <section class="skill-group">
        <h3>${attr.label}</h3>
        ${skills.map((skill) => renderSkillRow(sheet, skill)).join("")}
      </section>
    `;
  }).join("");

  return `
    <section class="tab-panel ${state.activeTab === "pericias" ? "active" : ""}" data-panel="pericias">
      <div class="panel">
        <div class="panel-title">
          <h3>Perícias</h3>
          <div class="skill-summary" data-skill-summary>
            <span class="badge hot" data-calc="trained-summary">Treinadas 0/0</span>
            <span class="tiny">Perícia = atributo-chave mod + metade do nível + 5 se treinado + extras</span>
          </div>
        </div>
        <div class="skills-grid">
          ${groups}
        </div>
      </div>
    </section>
  `;
}

function renderSkillRow(sheet, skill) {
  return `
    <div class="skill-row">
      <label class="skill-check">
        <input type="checkbox" data-skill-trained="${skill.key}" ${sheet.trained[skill.key] ? "checked" : ""} />
        <span>${skill.label}</span>
      </label>
      <output class="skill-total" data-calc="skill-${skill.key}">+0</output>
      <label class="field">
        <span>Extra</span>
        <input type="number" step="1" data-skill-mod="${skill.key}" value="${escapeAttr(sheet.skillMods[skill.key] ?? 0)}" />
      </label>
    </div>
  `;
}

function renderInventoryTab(sheet) {
  return `
    <section class="tab-panel ${state.activeTab === "inventario" ? "active" : ""}" data-panel="inventario">
      <div class="panel">
        <div class="panel-title">
          <h3>Equipamentos e inventário</h3>
          <div class="skill-summary">
            <span class="badge">${sheet.inventory.length} itens</span>
            <span class="badge hot" data-calc="equipped-defense">Defesa equipada +0</span>
            <button type="button" class="ghost-button" data-action="add-inventory-custom">Adicionar manual</button>
          </div>
        </div>
        <div class="inventory-list">
          ${
            sheet.inventory.length
              ? sheet.inventory.map((item, index) => renderInventoryRow(item, index)).join("")
              : `<div class="empty-state">Sem itens no inventário.</div>`
          }
        </div>
      </div>
    </section>
  `;
}

function renderInventoryRow(item, index) {
  const enchantments = item.enchantments || [];
  return `
    <div class="inventory-row">
      <label class="field">
        <span>Item</span>
        <input data-inventory-field="name" data-index="${index}" value="${escapeAttr(item.name)}" />
      </label>
      <label class="field">
        <span>Qtd.</span>
        <input type="number" step="1" min="0" data-inventory-field="quantity" data-index="${index}" value="${escapeAttr(item.quantity)}" />
      </label>
      <label class="inline-field">
        <input type="checkbox" data-inventory-field="equipped" data-index="${index}" ${item.equipped ? "checked" : ""} />
        Equipado
      </label>
      <label class="field">
        <span>Alvo</span>
        <select data-inventory-field="target" data-index="${index}">
          ${targetOptions(item.target)}
        </select>
      </label>
      <label class="field">
        <span>Bônus</span>
        <input type="number" step="0.5" data-inventory-field="value" data-index="${index}" value="${escapeAttr(item.value)}" />
      </label>
      <label class="field">
        <span>Dano base</span>
        <input data-inventory-field="damage" data-index="${index}" value="${escapeAttr(item.damage)}" placeholder="1d8" />
      </label>
      <label class="field">
        <span>Atributo no dano</span>
        <select data-inventory-field="damageAttr" data-index="${index}">
          ${damageAttrOptions(item.damageAttr)}
        </select>
      </label>
      <div class="stat-box compact-stat">
        <span>Dano total</span>
        <strong data-calc="inventory-damage-${item.id}">-</strong>
      </div>
      <label class="field">
        <span>Nota</span>
        <input data-inventory-field="note" data-index="${index}" value="${escapeAttr(item.note)}" />
      </label>
      <div class="row-actions">
        <button type="button" class="danger-button" data-action="remove-inventory" data-index="${index}">Remover</button>
      </div>
      <div class="enchantment-box">
        <div class="panel-title">
          <h4>Encantamentos</h4>
          <div class="row-actions">
            <select data-enchantment-picker="${index}">
              ${enchantmentPickerOptions()}
            </select>
            <button type="button" class="ghost-button" data-action="add-enchantment" data-index="${index}" data-enchantment-index="0">Adicionar selecionado</button>
            <button type="button" class="ghost-button" data-action="add-custom-enchantment" data-index="${index}">Custom</button>
          </div>
        </div>
        <div class="enchantment-list">
          ${
            enchantments.length
              ? enchantments.map((enchantment, enchantmentIndex) => renderEnchantmentRow(enchantment, index, enchantmentIndex)).join("")
              : `<div class="empty-state">Sem encantamentos nesse item.</div>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderEnchantmentRow(enchantment, itemIndex, enchantmentIndex) {
  return `
    <div class="enchantment-row">
      <label class="field">
        <span>Encantamento</span>
        <input data-enchantment-field="name" data-index="${itemIndex}" data-enchantment-index="${enchantmentIndex}" value="${escapeAttr(enchantment.name)}" />
      </label>
      <label class="field">
        <span>Alvo</span>
        <select data-enchantment-field="target" data-index="${itemIndex}" data-enchantment-index="${enchantmentIndex}">
          ${targetOptions(enchantment.target)}
        </select>
      </label>
      <label class="field">
        <span>Bônus</span>
        <input type="number" step="0.5" data-enchantment-field="value" data-index="${itemIndex}" data-enchantment-index="${enchantmentIndex}" value="${escapeAttr(enchantment.value)}" />
      </label>
      <label class="field">
        <span>Dano extra</span>
        <input data-enchantment-field="damageExtra" data-index="${itemIndex}" data-enchantment-index="${enchantmentIndex}" value="${escapeAttr(enchantment.damageExtra)}" placeholder="+1d6 fogo" />
      </label>
      <label class="field">
        <span>Nota</span>
        <input data-enchantment-field="note" data-index="${itemIndex}" data-enchantment-index="${enchantmentIndex}" value="${escapeAttr(enchantment.note)}" />
      </label>
      <div class="row-actions">
        <button type="button" class="danger-button" data-action="remove-enchantment" data-index="${itemIndex}" data-enchantment-index="${enchantmentIndex}">Remover</button>
      </div>
    </div>
  `;
}

function renderLibraryTab(sheet) {
  return `
    <section class="tab-panel ${state.activeTab === "biblioteca" ? "active" : ""}" data-panel="biblioteca">
      <div class="library-layout">
        <aside class="panel library-controls">
          <div class="panel-title">
            <h3>Biblioteca</h3>
          </div>
          <nav class="subtabbar" aria-label="Biblioteca">
            ${LIBRARY_TABS.map(
              (tab) => `
                <button type="button" class="subtab-button ${state.libraryTab === tab.key ? "active" : ""}" data-action="switch-library-tab" data-library-tab="${tab.key}">
                  ${tab.label}
                </button>
              `,
            ).join("")}
          </nav>
          <label class="field">
            <span>Busca</span>
            <input data-library-search value="${escapeAttr(state.librarySearch)}" placeholder="Nome, tipo, efeito" />
          </label>
          <label class="field">
            <span>Categoria</span>
            <select data-library-category>
              ${libraryCategoryOptions(state.libraryTab, state.libraryCategory)}
            </select>
          </label>
          <label class="inline-field">
            <input type="checkbox" data-library-compatible ${state.onlyCompatible ? "checked" : ""} />
            Compatível com ${escapeHtml(sheet.className)}
          </label>
          <span class="tiny" data-library-status>${libraryStatusText()}</span>
        </aside>
        <section>
          <div class="library-list" data-library-list></div>
        </section>
      </div>
    </section>
  `;
}

function renderAbilitiesTab(sheet) {
  return `
    <section class="tab-panel ${state.activeTab === "poderes" ? "active" : ""}" data-panel="poderes">
      <div class="panel">
        <div class="panel-title">
          <h3>Poderes, magias e técnicas</h3>
          <button type="button" class="ghost-button" data-action="add-custom-ability">Adicionar manual</button>
        </div>
        <div class="ability-list">
          ${
            sheet.abilities.length
              ? sheet.abilities.map((ability, index) => renderAbilityRow(ability, index)).join("")
              : `<div class="empty-state">Sem poderes selecionados.</div>`
          }
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">
          <h3>Poderes básicos da wiki</h3>
          <span class="badge">${library.data.powers.length} poderes</span>
        </div>
        <div class="library-list">
          ${
            library.data.powers.length
              ? library.data.powers.slice(0, 24).map((row, index) => renderPowerPickCard(row, index)).join("")
              : `<div class="empty-state">Carregando poderes básicos.</div>`
          }
        </div>
      </div>
    </section>
  `;
}

function renderPowerPickCard(row, sourceIndex) {
  const requirement = getPowerRequirement(row);
  return `
    <article class="library-card">
      <div>
        <h3>${escapeHtml(row.Nome)}</h3>
      </div>
      <p>${escapeHtml(row.Descrição || row["Efeito mecânico"] || row.Observações || "Poder sem descrição.")}</p>
      <div class="library-fields">
        ${libraryField("Dano", row.Dano)}
        ${libraryField("Custo", row.Custo)}
        ${libraryField("Duração", row.Duração)}
        ${libraryField("Requisitos", requirement)}
      </div>
      <button type="button" class="primary-button" data-action="add-ability" data-source-key="powers" data-source-index="${sourceIndex}">Adicionar à ficha</button>
    </article>
  `;
}

function getPowerRequirement(row) {
  const resource = normalizeText(row.Recurso || "");
  const category = normalizeText(row.Categoria || row.Sistema || "");
  const requiresArcane = resource.includes("magia") || category.includes("magia") || category.includes("arcana") || resource.includes("arcan") || category.includes("arcan");
  if (requiresArcane) {
    return "Requer 1 nível livre de Arcanismo";
  }
  return row.Requisitos || "-";
}

function renderAbilityRow(ability, index) {
  return `
    <div class="ability-row">
      <label class="field">
        <span>Nome</span>
        <input data-ability-field="name" data-index="${index}" value="${escapeAttr(ability.name)}" />
      </label>
      <label class="field">
        <span>Tipo</span>
        <input data-ability-field="type" data-index="${index}" value="${escapeAttr(ability.type)}" />
      </label>
      <label class="field">
        <span>Custo</span>
        <input data-ability-field="cost" data-index="${index}" value="${escapeAttr(ability.cost)}" />
      </label>
      <label class="field">
        <span>Dano</span>
        <input data-ability-field="damage" data-index="${index}" value="${escapeAttr(ability.damage)}" />
      </label>
      <label class="field">
        <span>Nota</span>
        <input data-ability-field="note" data-index="${index}" value="${escapeAttr(ability.note)}" />
      </label>
      <div class="row-actions">
        <button type="button" class="danger-button" data-action="remove-ability" data-index="${index}">Remover</button>
      </div>
    </div>
  `;
}

function renderModifiersTab(sheet) {
  return `
    <section class="tab-panel ${state.activeTab === "modificadores" ? "active" : ""}" data-panel="modificadores">
      <div class="panel">
        <div class="panel-title">
          <h3>Modificadores externos</h3>
          <button type="button" class="ghost-button" data-action="add-modifier">Adicionar</button>
        </div>
        <div class="modifier-list">
          ${
            sheet.modifiers.length
              ? sheet.modifiers.map((modifier, index) => renderModifierRow(modifier, index)).join("")
              : `<div class="empty-state">Sem modificadores ativos.</div>`
          }
        </div>
      </div>
    </section>
  `;
}

function renderModifierRow(modifier, index) {
  return `
    <div class="modifier-row">
      <label class="field">
        <span>Nome</span>
        <input data-modifier-field="name" data-index="${index}" value="${escapeAttr(modifier.name)}" />
      </label>
      <label class="field">
        <span>Origem</span>
        <select data-modifier-field="kind" data-index="${index}">
          ${["Buff", "Equipamento", "Artefato", "Condição", "Outro"].map((kind) => option(kind, modifier.kind)).join("")}
        </select>
      </label>
      <label class="field">
        <span>Alvo</span>
        <select data-modifier-field="target" data-index="${index}">
          ${targetOptions(modifier.target)}
        </select>
      </label>
      <label class="field">
        <span>Valor</span>
        <input type="number" step="0.5" data-modifier-field="value" data-index="${index}" value="${escapeAttr(modifier.value)}" />
      </label>
      <label class="inline-field">
        <input type="checkbox" data-modifier-field="active" data-index="${index}" ${modifier.active ? "checked" : ""} />
        Ativo
      </label>
      <label class="field">
        <span>Nota</span>
        <input data-modifier-field="note" data-index="${index}" value="${escapeAttr(modifier.note)}" />
      </label>
      <div class="row-actions">
        <button type="button" class="danger-button" data-action="remove-modifier" data-index="${index}">Remover</button>
      </div>
    </div>
  `;
}

function renderStatsTab(sheet) {
  const rules = getClassRules(sheet.className);
  return `
    <section class="tab-panel ${state.activeTab === "estatisticas" ? "active" : ""}" data-panel="estatisticas">
      <div class="panel radar-panel">
        <div class="radar-wrap">
          <canvas id="radarCanvas" aria-label="Estatística de atributos"></canvas>
        </div>
        <aside>
          <div class="panel-title">
            <h3>Estatística</h3>
          </div>
          <ul class="formula-list">
            <li><strong>${escapeHtml(sheet.className)}</strong>: PV base ${formatNumber(rules.lifeBase)}, PV por nível ${formatNumber(rules.lifePerLevel)}</li>
            <li>Mana: ${rules.usesMana ? "sim" : "não"}; Ki: ${rules.usesKi ? "sim" : "não"}</li>
            <li>Perfil da classe fica na cor da classe; atributos finais ficam em linha clara.</li>
            <li data-calc="subclass-summary">Subclasses 0/0</li>
            <li data-calc="attribute-budget">0/${INITIAL_ATTRIBUTE_POINTS}</li>
          </ul>
          <div class="stats-grid">
            <div class="stat-box"><span>Bônus de dano</span><strong data-calc="damage-bonus">0%</strong></div>
            <div class="stat-box"><span>Crítico/precisão</span><strong data-calc="crit-bonus">0%</strong></div>
            <div class="stat-box"><span>Mobilidade/esquiva</span><strong data-calc="mobility-bonus">0%</strong></div>
            <div class="stat-box"><span>Custo de Mana</span><strong data-calc="mana-cost">0%</strong></div>
          </div>
        </aside>
      </div>
    </section>
  `;
}

function renderLibraryListOnly() {
  const container = document.querySelector("[data-library-list]");
  const status = document.querySelector("[data-library-status]");
  const category = document.querySelector("[data-library-category]");
  if (status) status.textContent = libraryStatusText();
  if (category) category.innerHTML = libraryCategoryOptions(state.libraryTab, state.libraryCategory);
  if (!container) return;

  const sheet = getActiveSheet();
  const key = state.libraryTab;
  const rows = getFilteredLibraryRows(sheet, key);

  if (library.status === "loading") {
    container.innerHTML = `<div class="empty-state">Carregando biblioteca.</div>`;
    return;
  }

  if (library.status === "error" && rows.length === 0) {
    container.innerHTML = `<div class="empty-state">${escapeHtml(library.error || "Falha ao carregar CSVs.")}</div>`;
    return;
  }

  if (!rows.length) {
    container.innerHTML = `<div class="empty-state">Nenhum registro encontrado.</div>`;
    return;
  }

  container.innerHTML = rows.slice(0, 80).map(({ row, sourceIndex }) => renderLibraryCard(row, key, sourceIndex)).join("");
}

function renderLibraryCard(row, key, sourceIndex) {
  const sheet = getActiveSheet();
  if (key === "items") {
    return `
      <article class="library-card">
        <div>
          <h3>${escapeHtml(row.Nome)}</h3>
          <div class="sheet-meta">
            ${badge(row.Categoria)}
            ${badge(row.Raridade)}
            ${badge(row.Subtipo)}
          </div>
        </div>
        <p>${escapeHtml(row.Efeito || row.Bônus || row.Observações || "Item sem descrição.")}</p>
        <div class="library-fields">
          ${libraryField("Defesa", row.Defesa)}
          ${libraryField("Dano", row.Dano)}
          ${libraryField("Peso", row.Peso)}
          ${libraryField("Requisitos", row.Requisitos)}
        </div>
        <button type="button" class="primary-button" data-action="add-inventory" data-source-key="${key}" data-source-index="${sourceIndex}">Adicionar ao inventário</button>
      </article>
    `;
  }

  const sourceLabel = DATA_SOURCES[key].label;
  const cost = row["Custo base"] || row.Custo || "";
  const damage = row["Dano base"] || row.Dano || "";
  const description = row.Descrição || row.Efeito || row["Efeito secundário"] || row.Observações || "Sem descrição.";
  const requirement = getAbilityRequirement(sheet, row, key);
  const tierLabel = normalizeTierCategory(row.Tier || row.Raridade || row.Tipo || row.Categoria || "") || row.Tipo || row.Categoria || "";
  return `
    <article class="library-card">
      <div>
        <h3>${escapeHtml(row.Nome)}</h3>
        <div class="sheet-meta">
          ${badge(sourceLabel)}
          ${badge(tierLabel)}
          ${badge(cost)}
        </div>
      </div>
      <p>${escapeHtml(description)}</p>
      <div class="library-fields">
        ${libraryField("Alcance", row.Alcance)}
        ${libraryField("Dano", damage)}
        ${libraryField("Duração", row.Duração)}
        ${libraryField("Requisitos", key === "arcane" || key === "ki" ? "Requer 1 nível livre de Arcanismo" : (row.Requisitos || "-"))}
      </div>
      ${requirement.ok ? "" : `<p class="requirement-warning">${escapeHtml(requirement.reason)}</p>`}
      <button type="button" class="primary-button" data-action="add-ability" data-source-key="${key}" data-source-index="${sourceIndex}" ${requirement.ok ? "" : "disabled"}>Adicionar à ficha</button>
    </article>
  `;
}

function libraryField(label, value) {
  return `
    <div class="library-field">
      <span>${label}</span>
      <strong title="${escapeAttr(value || "-")}">${escapeHtml(value || "-")}</strong>
    </div>
  `;
}

function badge(value) {
  if (!value) return "";
  return `<span class="badge">${escapeHtml(cleanWikiText(value))}</span>`;
}

function classOptions(selected) {
  return Object.keys(CLASS_RULES).map((className) => option(className, selected)).join("");
}

function option(value, selected) {
  return `<option value="${escapeAttr(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`;
}

function targetOptions(selected) {
  const options = [`<option value="" ${!selected ? "selected" : ""}>Sem alvo</option>`];
  for (const attr of ATTRIBUTES) options.push(optionWithLabel(`attr:${attr.key}`, `Atributo: ${attr.label}`, selected));
  for (const resource of RESOURCES) options.push(optionWithLabel(`res:${resource.key}`, `Recurso: ${resource.label}`, selected));
  for (const skill of SKILLS) options.push(optionWithLabel(`skill:${skill.key}`, `Perícia: ${skill.label}`, selected));
  return options.join("");
}

function optionWithLabel(value, label, selected) {
  return `<option value="${escapeAttr(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function createDefaultSheet(overrides = {}) {
  return normalizeSheet({
    id: uid(),
    name: "Novo Personagem",
    description: "",
    playerName: "",
    age: "",
    height: "",
    level: 1,
    className: "Mago",
    posture: "Neutra",
    subclasses: [],
    attributes: Object.fromEntries(ATTRIBUTES.map((attr) => [attr.key, { base: 0, manual: 0 }])),
    resourceMods: Object.fromEntries(RESOURCES.map((resource) => [resource.key, 0])),
    skillMods: Object.fromEntries(SKILLS.map((skill) => [skill.key, 0])),
    trained: Object.fromEntries(SKILLS.map((skill) => [skill.key, false])),
    current: Object.fromEntries(RESOURCES.map((resource) => [resource.key, ""])),
    equipmentDefense: 0,
    inventory: [],
    abilities: createDefaultAbilities(overrides.className || "Mago"),
    modifiers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });
}

function createDefaultAbilities(className) {
  const normalizedClass = String(className || "").toLocaleLowerCase("pt-BR");
  if (normalizedClass === "mago" || normalizedClass === "híbrido" || normalizedClass === "hibrido") {
    return [
      {
        id: uid(),
        name: "Raio de Mana",
        type: "Magia",
        cost: "0",
        damage: "",
        note: "Equipado por padrão, sem custo de Arcanismo.",
        source: "Padrão",
      },
    ];
  }
  return [];
}

function normalizeSheet(raw) {
  const sheet = { ...raw };
  sheet.id = sheet.id || uid();
  sheet.name = sheet.name ?? "Novo Personagem";
  sheet.description = sheet.description ?? "";
  sheet.playerName = sheet.playerName ?? "";
  sheet.age = sheet.age ?? "";
  sheet.height = sheet.height ?? "";
  sheet.level = clamp(parseNumber(sheet.level, 1), 1, MAX_LEVEL);
  sheet.className = CLASS_RULES[sheet.className] ? sheet.className : "Mago";
  sheet.posture = sheet.posture || "Neutra";
  sheet.subclasses = Array.isArray(sheet.subclasses) ? sheet.subclasses : [];
  sheet.attributes = sheet.attributes || {};
  for (const attr of ATTRIBUTES) {
    sheet.attributes[attr.key] = {
      base: Math.max(0, parseNumber(sheet.attributes[attr.key]?.base, 0)),
      manual: parseNumber(sheet.attributes[attr.key]?.manual, 0),
    };
  }
  sheet.resourceMods = sheet.resourceMods || {};
  for (const resource of RESOURCES) sheet.resourceMods[resource.key] = parseNumber(sheet.resourceMods[resource.key], 0);
  sheet.skillMods = sheet.skillMods || {};
  for (const skill of SKILLS) sheet.skillMods[skill.key] = parseNumber(sheet.skillMods[skill.key], 0);
  sheet.trained = sheet.trained || {};
  for (const skill of SKILLS) sheet.trained[skill.key] = Boolean(sheet.trained[skill.key]);
  sheet.current = sheet.current || {};
  for (const resource of RESOURCES) sheet.current[resource.key] = sheet.current[resource.key] ?? "";
  sheet.equipmentDefense = parseNumber(sheet.equipmentDefense, 0);
  sheet.inventory = Array.isArray(sheet.inventory) ? sheet.inventory.map(normalizeInventoryItem) : [];
  sheet.abilities = Array.isArray(sheet.abilities) ? sheet.abilities.map(normalizeAbility) : [];
  sheet.modifiers = Array.isArray(sheet.modifiers) ? sheet.modifiers.map(normalizeModifier) : [];
  sheet.createdAt = sheet.createdAt || new Date().toISOString();
  sheet.updatedAt = sheet.updatedAt || new Date().toISOString();
  clampSubclasses(sheet);
  return sheet;
}

function normalizeInventoryItem(item) {
  return {
    id: item.id || uid(),
    name: item.name || "",
    quantity: parseNumber(item.quantity, 1),
    equipped: Boolean(item.equipped),
    target: item.target || "",
    value: parseNumber(item.value, 0),
    damage: item.damage || "",
    damageAttr: item.damageAttr || detectDamageAttr(item.damage || item.note || ""),
    note: item.note || "",
    source: item.source || "",
    enchantments: Array.isArray(item.enchantments) ? item.enchantments.map(normalizeEnchantment) : [],
  };
}

function normalizeAbility(ability) {
  return {
    id: ability.id || uid(),
    name: ability.name || "",
    type: ability.type || "",
    cost: ability.cost || "",
    damage: ability.damage || "",
    note: ability.note || "",
    source: ability.source || "",
  };
}

function normalizeEnchantment(enchantment) {
  return {
    id: enchantment.id || uid(),
    name: enchantment.name || "",
    target: enchantment.target || "",
    value: parseNumber(enchantment.value, 0),
    damageExtra: enchantment.damageExtra || "",
    note: enchantment.note || "",
    source: enchantment.source || "",
  };
}

function normalizeModifier(modifier) {
  return {
    id: modifier.id || uid(),
    name: modifier.name || "",
    kind: modifier.kind || "Buff",
    target: modifier.target || "",
    value: parseNumber(modifier.value, 0),
    active: modifier.active !== false,
    note: modifier.note || "",
  };
}

function loadLocalState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const sheets = Array.isArray(raw.sheets) ? raw.sheets.map(normalizeSheet) : [];
    return {
      sheets,
      activeId: raw.activeId || sheets[0]?.id || null,
      view: raw.view || "home",
      activeTab: raw.activeTab === "radar" ? "estatisticas" : raw.activeTab || "ficha",
      libraryTab: raw.libraryTab === "powers" ? "items" : raw.libraryTab || "items",
      librarySearch: raw.librarySearch || "",
      libraryCategory: raw.libraryCategory || "",
      onlyCompatible: raw.onlyCompatible !== false,
    };
  } catch (error) {
    console.error(error);
    return {
      sheets: [],
      activeId: null,
      view: "home",
      activeTab: "ficha",
      libraryTab: "items",
      librarySearch: "",
      libraryCategory: "",
      onlyCompatible: true,
    };
  }
}

function openWikiPage(path, addHistory) {
  const nextPath = path || WIKI_ROOT_PATH;
  if (addHistory && state.wikiPath && state.wikiPath !== nextPath) {
    state.wikiHistory = [...(state.wikiHistory || []), state.wikiPath].slice(-20);
  }
  state.view = "wiki";
  state.wikiPath = nextPath;
  persistLocalOnly();
  renderApp();
}

function ensureWikiPage(path) {
  if (wiki.path === path && (wiki.status === "loading" || wiki.status === "ready")) return;
  loadWikiPage(path);
}

async function loadWikiPage(path) {
  wiki.status = "loading";
  wiki.error = "";
  wiki.path = path;
  wiki.title = wikiTitleFromPath(path);
  wiki.html = "";

  try {
    const response = await fetch(encodeURI(path));
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const text = await response.text();

    if (path.toLocaleLowerCase("pt-BR").endsWith(".csv")) {
      wiki.html = renderWikiCsv(text, path);
      wiki.title = wikiTitleFromPath(path);
    } else {
      const parsed = parseWikiHtml(text, path);
      wiki.html = parsed.html;
      wiki.title = parsed.title || wikiTitleFromPath(path);
    }

    wiki.status = "ready";
  } catch (error) {
    console.error(error);
    wiki.status = "error";
    wiki.error = `Falha ao carregar ${wikiTitleFromPath(path)}.`;
  }

  if (state.view === "wiki" && state.wikiPath === path) renderApp();
}

function parseWikiHtml(text, path) {
  const doc = new DOMParser().parseFromString(text, "text/html");
  const article = doc.querySelector("article") || doc.body;
  article.querySelectorAll("script, style").forEach((node) => node.remove());
  article.querySelectorAll("a").forEach((link) => {
    const nextPath = resolveWikiPath(link.getAttribute("href"), path);
    if (nextPath) link.setAttribute("title", "Abrir dentro da wiki");
  });

  return {
    title: doc.querySelector(".page-title")?.textContent?.trim() || doc.title || "",
    html: article.innerHTML,
  };
}

function renderWikiCsv(text, path) {
  const rows = parseCsv(text);
  if (!rows.length) return `<div class="empty-state">Tabela vazia.</div>`;

  const headers = Object.keys(rows[0]);
  return `
    <div class="wiki-csv-heading">
      <h1>${escapeHtml(wikiTitleFromPath(path))}</h1>
      <span class="badge">${rows.length} registros</span>
    </div>
    <div class="table-wrap wiki-table-wrap">
      <table class="wiki-table">
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              ${headers.map((header) => `<td>${escapeHtml(row[header] || "")}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function resolveWikiPath(href, currentPath) {
  if (!href || href.startsWith("#")) return "";

  try {
    const baseUrl = new URL(encodeURI(currentPath || WIKI_ROOT_PATH), window.location.href);
    const nextUrl = new URL(href, baseUrl);
    if (nextUrl.origin !== window.location.origin) return "";

    const nextPath = decodeURIComponent(nextUrl.pathname.replace(/^\/+/, ""));
    if (!nextPath.startsWith("Sistema/")) return "";
    return nextPath;
  } catch (error) {
    return "";
  }
}

function wikiTitleFromPath(path) {
  const file = decodeURIComponent(String(path || WIKI_ROOT_PATH).split("/").pop() || "Wiki");
  return file
    .replace(/\.(html|csv)$/i, "")
    .replace(/\s+[a-f0-9]{32}$/i, "")
    .replace(/\s+[a-f0-9-]{36}$/i, "")
    .trim() || "Wiki";
}

async function loadState() {
  const local = loadLocalState();
  try {
    const serverSheets = await loadServerSheets();
    serverOnline = true;
    const sheets = mergeSheetLists(local.sheets, serverSheets);
    await uploadLocalSheetsNewerThanServer(local.sheets, serverSheets);
    return {
      ...local,
      sheets,
      activeId: sheets.some((sheet) => sheet.id === local.activeId) ? local.activeId : sheets[0]?.id || null,
    };
  } catch (error) {
    console.warn("Servidor de fichas indisponível, usando armazenamento local.", error);
    serverOnline = false;
    return local;
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response;
}

async function loadServerSheets() {
  const response = await apiRequest("/sheets");
  const sheets = await response.json();
  return Array.isArray(sheets) ? sheets.map(normalizeSheet) : [];
}

function mergeSheetLists(localSheets, serverSheets) {
  const merged = new Map();
  for (const sheet of serverSheets) merged.set(sheet.id, sheet);

  for (const sheet of localSheets) {
    const serverSheet = merged.get(sheet.id);
    if (!serverSheet || isNewerSheet(sheet, serverSheet)) {
      merged.set(sheet.id, sheet);
    }
  }

  return [...merged.values()].sort((a, b) => timestampValue(b.updatedAt) - timestampValue(a.updatedAt));
}

async function uploadLocalSheetsNewerThanServer(localSheets, serverSheets) {
  const serverById = new Map(serverSheets.map((sheet) => [sheet.id, sheet]));
  const pending = localSheets.filter((sheet) => {
    const serverSheet = serverById.get(sheet.id);
    return !serverSheet || isNewerSheet(sheet, serverSheet);
  });

  for (const sheet of pending) {
    await saveSheetOnServer(sheet);
  }
}

function isNewerSheet(left, right) {
  return timestampValue(left?.updatedAt) > timestampValue(right?.updatedAt);
}

function timestampValue(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

async function refreshSheetsFromServer() {
  try {
    setSaveStatus("Atualizando...");
    const localSheets = state.sheets;
    const serverSheets = await loadServerSheets();
    const sheets = mergeSheetLists(localSheets, serverSheets);
    serverOnline = true;
    state.sheets = sheets;
    if (!state.sheets.some((sheet) => sheet.id === state.activeId)) {
      state.activeId = state.sheets[0]?.id || null;
      if (!state.activeId) state.view = "home";
    }
    await uploadLocalSheetsNewerThanServer(localSheets, serverSheets);
    persistLocalOnly();
    renderApp();
    setSaveStatus("Banco atualizado");
  } catch (error) {
    console.warn("Não foi possível atualizar fichas do servidor.", error);
    serverOnline = false;
    renderApp();
    setSaveStatus("Usando local");
  }
}

async function saveSheetOnServer(sheet) {
  if (!sheet?.id) return;
  try {
    await apiRequest(`/sheets/${encodeURIComponent(sheet.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sheet),
    });
    serverOnline = true;
  } catch (error) {
    serverOnline = false;
    throw error;
  }
}

function syncSheetOnServer(sheet) {
  if (!sheet?.id) return;
  setSaveStatus("Salvando no banco...");
  saveSheetOnServer(sheet)
    .then(() => setSaveStatus("Banco salvo"))
    .catch((error) => {
      console.warn("Não foi possível salvar ficha no banco.", error);
      setSaveStatus("Salvo localmente");
    });
}

async function deleteSheetOnServer(id) {
  if (!id) return;
  try {
    await apiRequest(`/sheets/${encodeURIComponent(id)}`, { method: "DELETE" });
    serverOnline = true;
  } catch (error) {
    serverOnline = false;
    throw error;
  }
}

function persistSoon() {
  clearTimeout(saveTimer);
  setSaveStatus("Salvando...");
  saveTimer = window.setTimeout(persistNow, SAVE_DELAY);
}

function persistNow() {
  persistLocalOnly();
  setSaveStatus("Auto salvo");
  const sheet = getActiveSheet();
  if (serverOnline && sheet) {
    saveSheetOnServer(sheet).catch(() => {
      serverOnline = false;
    });
  }
}

function setSaveStatus(text) {
  const status = document.querySelector("[data-save-status]");
  if (status) status.textContent = text;
}

function persistLocalOnly() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function databaseStatusText() {
  return serverOnline ? "Banco compartilhado" : "Armazenamento local";
}

function touchSheet(sheet) {
  sheet.updatedAt = new Date().toISOString();
  persistSoon();
}

function touchAndRender(sheet) {
  touchSheet(sheet);
  persistNow();
  renderApp();
}

function createSheetFromForm() {
  const name = document.querySelector('[data-home-field="name"]')?.value.trim() || "Novo Personagem";
  const className = document.querySelector('[data-home-field="className"]')?.value || "Mago";
  const description = document.querySelector('[data-home-field="description"]')?.value.trim() || "";
  const sheet = createDefaultSheet({ name, className, description });
  state.sheets.unshift(sheet);
  state.activeId = sheet.id;
  state.view = "editor";
  state.activeTab = "ficha";
  persistNow();
  syncSheetOnServer(sheet);
  renderApp();
}

function deleteSheet(id) {
  const sheet = state.sheets.find((entry) => entry.id === id);
  if (!sheet) return;
  if (!window.confirm(`Excluir "${sheet.name || "Ficha sem nome"}"?`)) return;
  state.sheets = state.sheets.filter((entry) => entry.id !== id);
  if (state.activeId === id) state.activeId = state.sheets[0]?.id || null;
  state.view = state.activeId ? state.view : "home";
  persistNow();
  deleteSheetOnServer(id).catch(() => { serverOnline = false; });
  renderApp();
}

function duplicateSheet(id) {
  const source = state.sheets.find((entry) => entry.id === id);
  if (!source) return;
  const copy = normalizeSheet(JSON.parse(JSON.stringify(source)));
  copy.id = uid();
  copy.name = `${copy.name || "Ficha"} (cópia)`;
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();
  state.sheets.unshift(copy);
  state.activeId = copy.id;
  state.view = "editor";
  persistNow();
  syncSheetOnServer(copy);
  renderApp();
}

function getActiveSheet() {
  return state.sheets.find((sheet) => sheet.id === state.activeId) || null;
}

function getClassRules(className) {
  return CLASS_RULES[className] || CLASS_RULES.Mago;
}

function updateActiveTitle(sheet) {
  const title = document.getElementById("activeTitle");
  if (title) title.textContent = sheet.name || "Ficha sem nome";
}

function updateCollectionField(collection, input) {
  const item = collection[Number(input.dataset.index)];
  if (!item) return;
  const field = input.dataset.inventoryField || input.dataset.abilityField || input.dataset.modifierField;
  if (input.type === "checkbox") {
    item[field] = input.checked;
  } else if (["quantity", "value"].includes(field)) {
    item[field] = parseNumber(input.value);
  } else {
    item[field] = input.value;
  }
}

function updateEnchantmentField(sheet, input) {
  const item = sheet.inventory[Number(input.dataset.index)];
  const enchantment = item?.enchantments?.[Number(input.dataset.enchantmentIndex)];
  if (!enchantment) return;
  const field = input.dataset.enchantmentField;
  enchantment[field] = field === "value" ? parseNumber(input.value) : input.value;
}

function getPostureRule(name) {
  return POSTURE_RULES[name] || POSTURE_RULES.Neutra;
}

function postureOptions(selected) {
  const allowed = new Set(["Neutra", "Postura Ofensiva", "Postura Defensiva"]);
  if (selected && !allowed.has(selected)) selected = "Neutra";
  return [...allowed].map((name) => option(name, selected)).join("");
}

function getCompatibleSubclasses(className) {
  const rows = library.data.subclasses || [];
  return rows.filter((row) => {
    const classes = row.Classe || "";
    return classes.toLocaleLowerCase("pt-BR").includes(className.toLocaleLowerCase("pt-BR"));
  });
}

function subclassOptions(sheet, selected) {
  const compatible = getCompatibleSubclasses(sheet?.className || "Mago");
  const names = compatible.map((row) => cleanWikiText(row.Nome)).filter(Boolean);
  if (selected && !names.includes(selected)) names.unshift(selected);
  if (!names.length) return `<option value="${escapeAttr(selected || "")}">${escapeHtml(selected || "Carregando subclasses")}</option>`;
  return names.map((name) => option(name, selected)).join("");
}

function clampSubclasses(sheet, preferredIndex = sheet.subclasses.length - 1) {
  const compatible = getCompatibleSubclasses(sheet.className).map((row) => cleanWikiText(row.Nome));
  for (const row of sheet.subclasses) {
    if (compatible.length && !compatible.includes(row.name)) row.name = compatible[0];
    row.level = clamp(parseNumber(row.level), 0, MAX_SUBCLASS_LEVEL);
  }

  let total = getSubclassTotal(sheet);
  const max = clamp(parseNumber(sheet.level, 1), 1, MAX_LEVEL);
  if (total <= max) return;

  const order = [preferredIndex, ...sheet.subclasses.map((_, index) => index).reverse()].filter(
    (index, position, list) => index >= 0 && list.indexOf(index) === position,
  );
  for (const index of order) {
    const row = sheet.subclasses[index];
    if (!row) continue;
    const excess = total - max;
    const reduction = Math.min(row.level, excess);
    row.level -= reduction;
    total -= reduction;
    if (total <= max) break;
  }
}

function getSubclassTotal(sheet) {
  return sheet.subclasses.reduce((sum, row) => sum + clamp(parseNumber(row.level), 0, MAX_SUBCLASS_LEVEL), 0);
}

function getSubclassLevel(sheet, name) {
  return sheet.subclasses
    .filter((row) => normalizeText(row.name) === normalizeText(name))
    .reduce((sum, row) => sum + clamp(parseNumber(row.level), 0, MAX_SUBCLASS_LEVEL), 0);
}

function getAttributeBaseSpent(sheet) {
  return ATTRIBUTES.reduce((sum, attr) => sum + Math.max(0, parseNumber(sheet.attributes[attr.key]?.base, 0)), 0);
}

function enforceAttributeBudget(sheet, currentAttr, input) {
  const total = getAttributeBaseSpent(sheet);
  if (total <= INITIAL_ATTRIBUTE_POINTS) return;
  const excess = total - INITIAL_ATTRIBUTE_POINTS;
  const current = Math.max(0, parseNumber(sheet.attributes[currentAttr]?.base, 0));
  sheet.attributes[currentAttr].base = Math.max(0, current - excess);
  input.value = sheet.attributes[currentAttr].base;
}

function applyPostureSkillBonus(skills, posture) {
  for (const [key, pct] of Object.entries(posture.skillPct || {})) addPercentToSkill(skills, key, pct);
  if (posture.mentalSkillPct) {
    for (const skill of SKILLS.filter((entry) => ["intelligence", "wisdom", "charisma"].includes(entry.attr))) {
      addPercentToSkill(skills, skill.key, posture.mentalSkillPct);
    }
  }
  if (posture.survivalSkillPct) {
    for (const key of ["sobrevivencia", "percepcao", "taticaSobrevivencia"]) addPercentToSkill(skills, key, posture.survivalSkillPct);
  }
}

function addPercentToSkill(skills, key, pct) {
  if (!(key in skills) || !pct) return;
  const base = Math.max(1, Math.abs(skills[key]));
  skills[key] += Math.floor((base * pct) / 100);
}

function getCombatStats(postureName, posture, level) {
  return {
    damagePct: scaledPosturePercent(postureName, posture.damagePct || 0, level),
    conditionalDamagePct: scaledPosturePercent(postureName, posture.conditionalDamagePct || 0, level),
    critPct: scaledPosturePercent(postureName, posture.critPct || 0, level),
    mobilityPct: posture.mobilityPct || 0,
    dodgePct: posture.dodgePct || 0,
    lifestealPct: posture.lifestealPct || 0,
    regenPct: posture.regenPct || 0,
    manaCostPct: posture.manaCostPct || 0,
  };
}

function scaledPosturePercent(postureName, value, level) {
  if (value <= 0) return value;
  const scalingNames = ["Postura Ofensiva", "Postura Berserker", "Postura Impulsiva", "Postura Arcana"];
  if (!scalingNames.includes(postureName)) return value;
  return value + Math.floor(level / 10) * 5;
}

function compareCalculations(base, final) {
  const changed = {
    attributes: new Set(),
    resources: new Set(),
    skills: new Set(),
    inventoryDamage: new Set(),
  };
  for (const attr of ATTRIBUTES) {
    if (base.attributes[attr.key] !== final.attributes[attr.key]) changed.attributes.add(attr.key);
  }
  for (const resource of RESOURCES) {
    if (base.resources[resource.key] !== final.resources[resource.key]) changed.resources.add(resource.key);
  }
  for (const skill of SKILLS) {
    if (base.skills[skill.key] !== final.skills[skill.key]) changed.skills.add(skill.key);
  }
  for (const [id, value] of Object.entries(final.inventoryDamage)) {
    if (base.inventoryDamage[id] !== value) changed.inventoryDamage.add(id);
  }
  return changed;
}

function getPostureSummary(calc) {
  if (!calc.postureName || calc.postureName === "Neutra") return "Postura neutra: sem alterações automáticas.";
  const stats = calc.combatStats;
  const parts = [];
  if (stats.damagePct) parts.push(`dano ${signed(stats.damagePct)}%`);
  if (stats.damageAttrBonus) parts.push(`dano ${signed(stats.damageAttrBonus)}`);
  if (stats.conditionalDamagePct) parts.push(`dano condicional ${signed(stats.conditionalDamagePct)}%`);
  if (stats.critPct) parts.push(`crítico ${signed(stats.critPct)}%`);
  if (stats.mobilityPct || stats.dodgePct) parts.push(`mobilidade/esquiva ${signed(stats.mobilityPct + stats.dodgePct)}%`);
  if (stats.manaCostPct) parts.push(`custo de Mana ${signed(stats.manaCostPct)}%`);
  return `${calc.postureName}: ${parts.join(", ") || "altera atributos, perícias ou recursos destacados."}`;
}

function damageAttrOptions(selected) {
  const options = [`<option value="" ${!selected ? "selected" : ""}>Sem atributo</option>`];
  for (const attr of ATTRIBUTES) options.push(optionWithLabel(attr.key, attr.label, selected));
  return options.join("");
}

function detectDamageAttr(text) {
  const normalized = normalizeText(text);
  if (normalized.includes("forca")) return "strength";
  if (normalized.includes("destreza")) return "dexterity";
  if (normalized.includes("constituicao")) return "constitution";
  if (normalized.includes("carisma")) return "charisma";
  if (normalized.includes("inteligencia")) return "intelligence";
  if (normalized.includes("sabedoria")) return "wisdom";
  return "";
}

function getInventoryDamage(item, attrMods, damagePct = 0, damageAttrBonus = 0) {
  const base = cleanDamageText(item.damage || "");
  const parts = [];
  if (base) parts.push(base);
  if (item.damageAttr) parts.push(signed(attrMods[item.damageAttr] || 0));
  for (const enchantment of item.enchantments || []) {
    if (enchantment.damageExtra) parts.push(cleanWikiText(enchantment.damageExtra));
  }
  if (damageAttrBonus) parts.push(signed(damageAttrBonus));
  let expression = parts.join(" ");
  if (!expression) return "";
  if (damagePct) expression = applyDamagePercent(expression, damagePct);
  return expression;
}

function cleanDamageText(value) {
  return cleanWikiText(value)
    .replace(/\s*\+\s*Mod\.?\s*de\s*[A-Za-zÀ-ÿ]+/gi, "")
    .replace(/Mod\.?\s*de\s*[A-Za-zÀ-ÿ]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function applyDamagePercent(expression, pct) {
  const numeric = Number.parseFloat(String(expression).replace(",", "."));
  if (Number.isFinite(numeric) && String(expression).trim().match(/^[+-]?\d+(?:[.,]\d+)?$/)) {
    return String(Math.floor((numeric * (100 + pct)) / 100));
  }
  return `${expression} ${signed(pct)}% postura`;
}

function isEnchantment(row) {
  return normalizeText(`${row.Categoria || ""} ${row.Subtipo || ""}`).includes("encantamento");
}

function enchantmentPickerOptions() {
  const rows = library.data.enchantments || [];
  if (!rows.length) return `<option value="0">Carregando encantamentos</option>`;
  return rows.map((row, index) => `<option value="${index}">${escapeHtml(cleanWikiText(row.Nome || "Encantamento"))}</option>`).join("");
}

function addEnchantmentFromLibrary(sheet, itemIndex, enchantmentIndex) {
  const item = sheet.inventory[itemIndex];
  const row = library.data.enchantments?.[enchantmentIndex];
  if (!item || !row) return;
  item.enchantments.push(detectEnchantment(row));
  touchAndRender(sheet);
}

function detectEnchantment(row) {
  const text = `${row.Bônus || ""} ${row.Efeito || ""} ${row.Defesa || ""} ${row["Valor do Modificador"] || ""}`;
  const normalized = normalizeText(text);
  const damageExtra = text.match(/[+-]?\d+d\d+[^,.;]*/i)?.[0] || "";
  let target = "";
  if (normalized.includes("defesa")) target = "res:defense";
  if (normalized.includes("amplificacao")) target = "res:magicAmp";
  return normalizeEnchantment({
    name: cleanWikiText(row.Nome || "Encantamento"),
    target,
    value: target ? extractFirstSignedNumber(text) : 0,
    damageExtra,
    note: cleanWikiText(row.Bônus || row.Efeito || row.Observações || ""),
    source: "Encantamentos",
  });
}

function libraryCategoryOptions(key, selected) {
  const categories = new Set();
  for (const row of library.data[key] || []) {
    if (key === "items" && isEnchantment(row)) continue;
    for (const category of getLibraryCategories(row, key)) categories.add(category);
  }
  return [
    `<option value="" ${!selected ? "selected" : ""}>Todas</option>`,
    ...[...categories].sort((a, b) => a.localeCompare(b, "pt-BR")).map((category) => option(category, selected)),
  ].join("");
}

function normalizeTierCategory(value) {
  const normalized = normalizeText(value || "");
  if (normalized.includes("suprem")) return "Supremo";
  if (normalized.includes("avanc")) return "Avançado";
  if (normalized.includes("interm")) return "Intermediário";
  if (normalized.includes("básic") || normalized.includes("basic")) return "Básico";
  return "";
}

function getLibraryCategories(row, key) {
  if (key === "arcane" || key === "ki") {
    const tier = normalizeTierCategory(row.Tier || row.Raridade || row.Tipo || row.Categoria || row["Base Elemental"] || "");
    return tier ? [tier] : [];
  }

  const values = [row.Categoria, row.Subtipo, row.Raridade, row.Tier, row.Tipo, row["Base Elemental"]]
    .map((value) => cleanWikiText(value || ""))
    .filter(Boolean);
  if (key === "items" && row.Nome) values.push(cleanWikiText(row.Nome).split(/\s+/)[0]);

  if (key !== "items") return [...new Set(values)];

  return [...new Set(values)].filter((category) => {
    const normalized = normalizeText(category);
    if (ALLOWED_LIBRARY_CATEGORIES.has(normalized)) return true;
    return normalizeText(row.Raridade || "") === normalized;
  });
}

function getAbilityRequirement(sheet, row, sourceKey) {
  if (!sheet) return { ok: true, reason: "" };
  if (sourceKey === "arcane") {
    if (!["Mago", "Híbrido"].includes(sheet.className)) return { ok: false, reason: "Apenas Mago ou Híbrido podem aprender magias arcanas." };
    const arcanism = getSubclassLevel(sheet, "Arcanismo");
    if (arcanism < 1) return { ok: false, reason: "Requer pelo menos 1 nível em Arcanismo." };
    const used = sheet.abilities.filter((ability) => ability.type === "Magia").length;
    if (used >= arcanism) return { ok: false, reason: `Limite de magias por Arcanismo atingido: ${used}/${arcanism}.` };
  }
  if (sourceKey === "ki" && !["Ki", "Híbrido"].includes(sheet.className)) {
    return { ok: false, reason: "Apenas Ki ou Híbrido podem aprender técnicas de Ki." };
  }
  return { ok: true, reason: "" };
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function calculateSheet(sheet) {
  const base = calculateCore(sheet, false);
  const final = calculateCore(sheet, true);
  final.baseline = base;
  final.changed = compareCalculations(base, final);
  return final;
}

function calculateCore(sheet, includePosture) {
  const rules = getClassRules(sheet.className);
  const level = clamp(parseNumber(sheet.level, 1), 1, MAX_LEVEL);
  const halfLevel = Math.floor(level / 2);
  const postureName = includePosture ? sheet.posture || "Neutra" : "Neutra";
  const posture = getPostureRule(postureName);
  const attributes = {};
  const attrMods = {};

  for (const attr of ATTRIBUTES) {
    const base = parseNumber(sheet.attributes[attr.key]?.base, 0);
    const manual = parseNumber(sheet.attributes[attr.key]?.manual, 0);
    const external = sumExternalModifiers(sheet, `attr:${attr.key}`);
    let total = base + manual + external;
    if (posture.attrPct?.[attr.key]) total += Math.floor((total * posture.attrPct[attr.key]) / 100);
    attributes[attr.key] = Math.floor(total);
    attrMods[attr.key] = Math.floor((attributes[attr.key] - 10) / 2);
  }

  const resourceExternal = (key) => parseNumber(sheet.resourceMods[key], 0) + sumExternalModifiers(sheet, `res:${key}`);
  const resources = {
    hp: Math.floor(rules.lifeBase + (attrMods.constitution + rules.lifePerLevel) * level + resourceExternal("hp")),
    sanity: Math.floor(20 + attrMods.charisma + halfLevel + resourceExternal("sanity")),
    mana: rules.usesMana ? Math.floor(10 + level * (3 + attrMods.intelligence) + resourceExternal("mana")) : 0,
    ki: rules.usesKi ? Math.floor(10 + level * (3 + attrMods.wisdom) + resourceExternal("ki")) : 0,
    energy: Math.floor(attributes.constitution * level + resourceExternal("energy")),
    defense: Math.floor(10 + halfLevel + attrMods.dexterity + parseNumber(sheet.equipmentDefense, 0) + resourceExternal("defense")),
    magicAmp: Math.floor(attrMods.intelligence + Math.floor(level / 10) + resourceExternal("magicAmp")),
  };

  if (posture.defenseAttr && posture.defenseAttrPct) {
    resources.defense += Math.floor((attributes[posture.defenseAttr] * posture.defenseAttrPct) / 100);
  }
  if (posture.defensePct) resources.defense = Math.floor((resources.defense * (100 + posture.defensePct)) / 100);
  if (posture.sanityPct) resources.sanity += Math.floor((resources.sanity * posture.sanityPct) / 100);
  if (posture.magicAmpPct) resources.magicAmp = Math.floor((resources.magicAmp * (100 + posture.magicAmpPct)) / 100);

  const skills = {};
  for (const skill of SKILLS) {
    skills[skill.key] = Math.floor(
      attrMods[skill.attr] +
        halfLevel +
        (sheet.trained[skill.key] ? 5 : 0) +
        parseNumber(sheet.skillMods[skill.key], 0) +
        sumExternalModifiers(sheet, `skill:${skill.key}`),
    );
  }

  applyPostureSkillBonus(skills, posture);

  const trainedCount = SKILLS.filter((skill) => sheet.trained[skill.key]).length;
  const trainedMax = Math.max(0, 3 + attrMods.intelligence);
  const subclassTotal = getSubclassTotal(sheet);
  const attributeBaseSpent = getAttributeBaseSpent(sheet);
  const combatStats = getCombatStats(postureName, posture, level);
  const inventoryDamage = Object.fromEntries(
    sheet.inventory.map((item) => [item.id, getInventoryDamage(item, attrMods, combatStats.damagePct, combatStats.damageAttrBonus)]),
  );
  const equippedDefense = getInventoryTargetTotal(sheet, "res:defense");

  return {
    level,
    halfLevel,
    postureName,
    attributes,
    attrMods,
    resources,
    skills,
    trainedCount,
    trainedMax,
    subclassTotal,
    subclassMax: level,
    attributeBaseSpent,
    combatStats,
    inventoryDamage,
    equippedDefense,
  };
}

function sumExternalModifiers(sheet, target) {
  if (!target) return 0;
  const inventory = getInventoryTargetTotal(sheet, target);
  const modifiers = sheet.modifiers
    .filter((modifier) => modifier.active && modifier.target === target)
    .reduce((total, modifier) => total + parseNumber(modifier.value, 0), 0);
  return inventory + modifiers;
}

function getInventoryTargetTotal(sheet, target) {
  return sheet.inventory
    .filter((item) => item.equipped && item.target === target)
    .reduce((total, item) => {
      const own = parseNumber(item.value, 0);
      const enchantments = (item.enchantments || [])
        .filter((enchantment) => enchantment.target === target)
        .reduce((sum, enchantment) => sum + parseNumber(enchantment.value, 0), 0);
      return total + own + enchantments;
    }, 0);
}

function refreshCalculations() {
  const sheet = getActiveSheet();
  if (!sheet) return;
  const calc = calculateSheet(sheet);

  for (const attr of ATTRIBUTES) {
    setCalc(`attr-total-${attr.key}`, formatNumber(calc.attributes[attr.key]));
    setCalc(`attr-mod-${attr.key}`, signed(calc.attrMods[attr.key]));
    setAltered(`attr-total-${attr.key}`, calc.changed.attributes.has(attr.key));
    setAltered(`attr-mod-${attr.key}`, calc.changed.attributes.has(attr.key));
  }

  for (const resource of RESOURCES) {
    setCalc(`resource-${resource.key}`, formatNumber(calc.resources[resource.key]));
    setAltered(`resource-${resource.key}`, calc.changed.resources.has(resource.key));
    // update resource bar (current / max)
    try {
      const sheet = getActiveSheet();
      const bar = document.querySelector(`[data-resource-bar="${resource.key}"]`);
      if (bar) {
        const currentVal = Number.parseFloat(String(sheet.current[resource.key] || 0)) || 0;
        const maxVal = Number.parseFloat(String(calc.resources[resource.key] || 0)) || 0;
        const pct = maxVal > 0 ? Math.max(0, Math.min(100, Math.floor((currentVal / maxVal) * 100))) : 0;
        const fill = bar.querySelector(".resource-bar-fill");
        const textCurrent = bar.querySelector(".bar-current");
        const textMax = bar.querySelector(".bar-max");
        if (fill) fill.style.width = `${pct}%`;
        if (textCurrent) textCurrent.textContent = formatNumber(currentVal);
        if (textMax) textMax.textContent = formatNumber(maxVal);
      }
    } catch (e) {
      // silent
    }
  }

  for (const skill of SKILLS) {
    setCalc(`skill-${skill.key}`, signed(calc.skills[skill.key]));
    setAltered(`skill-${skill.key}`, calc.changed.skills.has(skill.key));
  }

  const trainedText = `Treinadas ${calc.trainedCount}/${calc.trainedMax}`;
  setCalc("trained-summary", trainedText);
  setCalc("subclass-summary", `Subclasses ${formatNumber(calc.subclassTotal)}/${formatNumber(calc.subclassMax)}`);
  setCalc("attribute-budget", `Atributos ${formatNumber(calc.attributeBaseSpent)}/${INITIAL_ATTRIBUTE_POINTS}`);
  setCalc("equipped-defense", `Defesa equipada ${signed(calc.equippedDefense)}`);
  setCalc("damage-bonus", `${signed(calc.combatStats.damagePct)}%`);
  setCalc("crit-bonus", `${signed(calc.combatStats.critPct)}%`);
  setCalc("mobility-bonus", `${signed(calc.combatStats.mobilityPct + calc.combatStats.dodgePct)}%`);
  setCalc("mana-cost", `${signed(calc.combatStats.manaCostPct)}%`);
  setCalc("posture-summary", getPostureSummary(calc));
  document.querySelectorAll("[data-skill-summary]").forEach((node) => {
    node.classList.toggle("over-limit", calc.trainedCount > calc.trainedMax);
  });
  document.querySelectorAll("[data-attribute-summary]").forEach((node) => {
    node.classList.toggle("over-limit", calc.attributeBaseSpent > INITIAL_ATTRIBUTE_POINTS);
  });

  for (const [itemId, damage] of Object.entries(calc.inventoryDamage)) {
    setCalc(`inventory-damage-${itemId}`, damage || "-");
    setAltered(`inventory-damage-${itemId}`, calc.changed.inventoryDamage.has(itemId));
  }

  drawRadar(calc);
}

function setCalc(key, value) {
  document.querySelectorAll(`[data-calc="${key}"]`).forEach((node) => {
    node.textContent = value;
  });
}

function setAltered(key, altered) {
  document.querySelectorAll(`[data-calc="${key}"]`).forEach((node) => {
    node.classList.toggle("posture-altered", altered);
  });
}

function drawRadar(existingCalc) {
  const canvas = document.getElementById("radarCanvas");
  const sheet = getActiveSheet();
  if (!canvas || !sheet) return;

  const calc = existingCalc || calculateSheet(sheet);
  const rules = getClassRules(sheet.className);
  const rect = canvas.getBoundingClientRect();
  const size = Math.max(280, Math.floor(rect.width || 520));
  const ratio = window.devicePixelRatio || 1;
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const radius = size * 0.34;
  const values = ATTRIBUTES.map((attr) => calc.attributes[attr.key]);
  const profile = ATTRIBUTES.map((attr) => rules.profile[attr.key]);
  const max = Math.max(20, ...values, ...profile);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let ring = 1; ring <= 5; ring += 1) {
    drawPolygon(ctx, ATTRIBUTES.map(() => (radius * ring) / 5), center, "rgba(255,255,255,0.1)", "transparent");
  }

  ATTRIBUTES.forEach((attr, index) => {
    const angle = angleFor(index);
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(x, y);
    ctx.stroke();

    const labelX = center + Math.cos(angle) * (radius + 32);
    const labelY = center + Math.sin(angle) * (radius + 32);
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText(attr.short, labelX, labelY - 8);
    ctx.fillStyle = "rgba(255,23,66,0.95)";
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.fillText(formatNumber(calc.attributes[attr.key]), labelX, labelY + 8);
  });

  drawValuePolygon(ctx, profile, max, radius, center, rules.color, 0.16);
  drawValuePolygon(ctx, values, max, radius, center, "#f5f7f8", 0.28);

  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "13px Inter, system-ui, sans-serif";
  ctx.fillText(sheet.className, center, size - 24);
}

function drawValuePolygon(ctx, values, max, radius, center, color, alpha) {
  const points = values.map((value, index) => (Math.max(0, value) / max) * radius);
  drawPolygon(ctx, points, center, color, hexToRgba(color, alpha));
}

function drawPolygon(ctx, radii, center, strokeStyle, fillStyle) {
  ctx.beginPath();
  radii.forEach((radius, index) => {
    const angle = angleFor(index);
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}

function angleFor(index) {
  return -Math.PI / 2 + (index * Math.PI * 2) / ATTRIBUTES.length;
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function loadLibrary() {
  try {
    await Promise.all(
      Object.entries(DATA_SOURCES).map(async ([key, source]) => {
        const response = await fetch(encodeURI(source.path));
        if (!response.ok) throw new Error(`${source.label}: ${response.status}`);
        const text = await response.text();
        library.data[key] = parseCsv(text);
      }),
    );
    library.data.enchantments = library.data.items.filter((row) => isEnchantment(row));
    for (const sheet of state.sheets) clampSubclasses(sheet);
    library.status = "ready";
    library.error = "";
  } catch (error) {
    console.error(error);
    library.status = "error";
    library.error = "Abra pelo servidor local para carregar os CSVs da wiki.";
  }
  renderApp();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);

  const headers = rows.shift() || [];
  return rows.map((values) => {
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] ?? "";
    });
    return entry;
  });
}

function normalizeRarityOrder(value) {
  const tier = normalizeTierCategory(value);
  if (tier) return tier;
  const normalized = normalizeText(value || "");
  if (normalized.includes("comum") || normalized.includes("normal")) return "Básico";
  if (normalized.includes("raro")) return "Intermediário";
  if (normalized.includes("epico") || normalized.includes("épico")) return "Avançado";
  if (normalized.includes("lendario") || normalized.includes("lendário")) return "Supremo";
  return "";
}

function compareLibraryRows(a, b) {
  const rarityOrder = ["Básico", "Intermediário", "Avançado", "Supremo"];
  const rarityA = normalizeRarityOrder(a.row.Raridade || a.row.Tier || a.row.Tipo || a.row.Categoria || "");
  const rarityB = normalizeRarityOrder(b.row.Raridade || b.row.Tier || b.row.Tipo || b.row.Categoria || "");
  const rankA = rarityOrder.indexOf(rarityA);
  const rankB = rarityOrder.indexOf(rarityB);
  if (rankA !== rankB) return (rankA === -1 ? 99 : rankA) - (rankB === -1 ? 99 : rankB);

  const typeA = cleanWikiText(a.row.Tipo || a.row.Categoria || "").toLocaleLowerCase("pt-BR");
  const typeB = cleanWikiText(b.row.Tipo || b.row.Categoria || "").toLocaleLowerCase("pt-BR");
  if (typeA !== typeB) return typeA.localeCompare(typeB, "pt-BR");

  return cleanWikiText(a.row.Nome || "").localeCompare(cleanWikiText(b.row.Nome || ""), "pt-BR");
}

function getFilteredLibraryRows(sheet, key) {
  const search = state.librarySearch.trim().toLocaleLowerCase("pt-BR");
  const category = state.libraryCategory || "";
  return library.data[key]
    .map((row, sourceIndex) => ({ row, sourceIndex }))
    .filter(({ row }) => {
      if (key === "items" && isEnchantment(row)) return false;
      if (category && !getLibraryCategories(row, key).includes(category)) return false;
      if (state.onlyCompatible && sheet && !isCompatible(row, key, sheet.className)) return false;
      if (!search) return true;
      return Object.values(row).join(" ").toLocaleLowerCase("pt-BR").includes(search);
    })
    .sort(compareLibraryRows);
}

function isCompatible(row, key, className) {
  if (key === "items") {
    const classes = row.Classes || "";
    return !classes || classes.toLocaleLowerCase("pt-BR").includes(className.toLocaleLowerCase("pt-BR"));
  }
  if (key === "arcane") return className === "Mago" || className === "Híbrido";
  if (key === "ki") return className === "Ki" || className === "Híbrido";
  return true;
}

function addInventoryFromLibrary(sheet, sourceKey, sourceIndex) {
  const row = library.data[sourceKey]?.[sourceIndex];
  if (!row) return;
  const detected = detectItemModifier(row);
  const damage = cleanWikiText(row.Dano || "");
  sheet.inventory.push({
    id: uid(),
    name: cleanWikiText(row.Nome || "Item"),
    quantity: 1,
    equipped: Boolean(detected.target),
    target: detected.target,
    value: detected.value,
    damage,
    damageAttr: detectDamageAttr(`${damage} ${row["Escala com"] || ""}`),
    note: cleanWikiText(row.Bônus || row.Efeito || row.Observações || ""),
    source: DATA_SOURCES[sourceKey]?.label || "Wiki",
    enchantments: [],
  });
  touchAndRender(sheet);
}

function addAbilityFromLibrary(sheet, sourceKey, sourceIndex) {
  const row = library.data[sourceKey]?.[sourceIndex];
  if (!row) return;
  const requirement = getAbilityRequirement(sheet, row, sourceKey);
  if (!requirement.ok) {
    window.alert(requirement.reason);
    return;
  }
  const type = sourceKey === "arcane" ? "Magia" : sourceKey === "ki" ? "Técnica de Ki" : "Poder";
  sheet.abilities.push({
    id: uid(),
    name: cleanWikiText(row.Nome || type),
    type,
    cost: row["Custo base"] || row.Custo || "",
    damage: row["Dano base"] || row.Dano || "",
    note: cleanWikiText(row.Descrição || row.Efeito || row["Efeito secundário"] || row.Observações || ""),
    source: DATA_SOURCES[sourceKey]?.label || "Wiki",
  });
  touchAndRender(sheet);
}

function detectItemModifier(row) {
  const text = `${row.Defesa || ""} ${row.Bônus || ""} ${row["Amplificação Mágica Extra"] || ""} ${row["Valor do Modificador"] || ""}`;
  const firstNumber = extractFirstSignedNumber(text);
  const category = (row.Categoria || "").toLocaleLowerCase("pt-BR");
  const bonus = (row.Bônus || "").toLocaleLowerCase("pt-BR");
  const defense = (row.Defesa || "").toLocaleLowerCase("pt-BR");
  const affected = (row["Atributo Afetado"] || "").toLocaleLowerCase("pt-BR");
  const modifierValue = extractFirstSignedNumber(row["Valor do Modificador"] || "");

  if (category.includes("armadura") || bonus.includes("defesa") || defense) {
    return { target: "res:defense", value: firstNumber || 0 };
  }

  if (row["Amplificação Mágica Extra"]) {
    return { target: "res:magicAmp", value: extractFirstSignedNumber(row["Amplificação Mágica Extra"]) || firstNumber || 0 };
  }

  const attr = ATTRIBUTES.find((entry) => affected.includes(entry.label.toLocaleLowerCase("pt-BR")));
  if (attr) {
    return { target: `attr:${attr.key}`, value: modifierValue || firstNumber || 0 };
  }

  return { target: "", value: 0 };
}

function extractFirstSignedNumber(text) {
  const match = String(text).match(/[+-]?\d+(?:[.,]\d+)?/);
  return match ? parseNumber(match[0]) : 0;
}

function libraryStatusText() {
  if (library.status === "loading") return "Carregando CSVs da wiki";
  if (library.status === "error") return library.error;
  const total = Object.values(library.data).reduce((sum, rows) => sum + rows.length, 0);
  return `${total} registros carregados`;
}

function cleanWikiText(value) {
  return String(value || "")
    .replace(/\s*\([^)]*\.html\)/g, "")
    .replace(/\s*Sem título\s*\([^)]*\)/g, "")
    .trim();
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  while (parts.length > 1) {
    const key = parts.shift();
    cursor[key] = cursor[key] || {};
    cursor = cursor[key];
  }
  cursor[parts[0]] = value;
}

function parseNumber(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback;
  const normalized = String(value).replace(",", ".");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Math.floor(parseNumber(value, min))));
}

function formatNumber(value) {
  const number = parseNumber(value);
  if (Math.abs(number - Math.round(number)) < 0.001) return String(Math.round(number));
  return number.toFixed(1).replace(".", ",");
}

function signed(value) {
  const number = parseNumber(value);
  return `${number >= 0 ? "+" : ""}${formatNumber(number)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value ?? "");
}

function uid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
