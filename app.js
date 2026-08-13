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
  { key: "hp", label: "Vida", formula: "Base da classe + max(1, CON mod + vida por nível) x nível" },
  { key: "sanity", label: "Sanidade", formula: "20 + CAR mod + metade do nível" },
  { key: "mana", label: "Mana", formula: "10 + nível x (3 + INT mod)" },
  { key: "ki", label: "Ki", formula: "10 + nível x (3 + SAB mod)" },
  { key: "energy", label: "Energia física", formula: "Constituição total x nível" },
  { key: "defense", label: "Defesa", formula: "10 + metade do nível + DES mod + equipamento" },
  { key: "magicAmp", label: "Ampliação Mágica", formula: "INT mod + piso(nível / 10)" },
  { key: "kiRefine", label: "Refino de Ki", formula: "SAB mod + piso(nível / 10)" },
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
const WIKI_NAV_SECTIONS = [
  {
    title: "Criar ficha",
    links: [
      { label: "Começar", path: "Sistema/DESORDEM/Começar fc6cc0c0e2b547ab802d44dce7870a88.html" },
      { label: "Criar Personagem", path: "Sistema/DESORDEM/Criar Personagem 361ca02c8953494c8b86c001cc507fca.html" },
      { label: "Classes", path: "Sistema/DESORDEM/Criar Personagem/Classes 70ddc26d3bde4f13b03e2f01bd35e450.csv" },
      { label: "Subclasses", path: "Sistema/DESORDEM/Criar Personagem/Subclasses 4ff6f2db938a46e09513497027fc1d23.csv" },
      { label: "Progressão", path: "Sistema/DESORDEM/Progressão do Personagem f15ebd73b0e84ab680003ca5cbaee0f6.html" },
      { label: "Perícias", path: "Sistema/DESORDEM/Conceitos Fundamentais/Perícias 5dde8807080143fd8073b4e798207558.csv" },
    ],
  },
  {
    title: "Regras de mesa",
    links: [
      { label: "Hub", path: WIKI_ROOT_PATH },
      { label: "Conceitos", path: "Sistema/DESORDEM/Conceitos Fundamentais f2b590ffb37b4ab2b1abd437018029f3.html" },
      { label: "Mecânicas", path: "Sistema/DESORDEM/Mecânicas eb90fea1e320443ca853723f58156cea.html" },
      { label: "Combate", path: "Sistema/DESORDEM/Mecânicas/Sistema de Combate 710cf59944ff429cab30ed577ad9f649.html" },
      { label: "Recursos", path: "Sistema/DESORDEM/Mecânicas/Sistema de Energia e Recursos 1d2e0ad26aba49ba957c08533e2e5f1b.html" },
      { label: "Condições", path: "Sistema/DESORDEM/Mecânicas/Condições dcae7e0593924273908258460c655bef.csv" },
      { label: "Posturas", path: "Sistema/DESORDEM/Mecânicas/Posturas 0f28ef55604447adbda13a03dee93d95.csv" },
    ],
  },
  {
    title: "Listas de escolha",
    links: [
      { label: "Itens", path: "Sistema/DESORDEM/Itens 5fe4a784ad90408a9827f8decc6b0763.html" },
      { label: "Equipamentos", path: "Sistema/DESORDEM/Itens/Equipamentos d7ca8178912546b9a539ec5e7682bae5.csv" },
      { label: "Magias", path: "Sistema/DESORDEM/Magias 8f527363583d4c40bd712b49b4f86f2c.html" },
      { label: "Magias Arcanas", path: "Sistema/DESORDEM/Magias/Magias Arcanas af6b2c2026e34411a9c658fcb07d0e52.csv" },
      { label: "Técnicas de Ki", path: "Sistema/DESORDEM/Magias/Técnicas de Ki 697b3b0ced9944c5ac27df54e855b67e.csv" },
      { label: "Poderes Especiais", path: "Sistema/DESORDEM/Magias/Poderes Especiais 26d6446d688f44e7af5c7669b7b93d6a.csv" },
    ],
  },
  {
    title: "Campanha",
    links: [
      { label: "Filosofia do Combate", path: "Sistema/DESORDEM/Filosofia do Combate 6317dfe19862449bac72d8462c0e5c83.html" },
      { label: "Mundo e Lore", path: "Sistema/DESORDEM/Mundo Lore 99e0dc6437e545d7bfed5a78cc9b6bcb.html" },
      { label: "Cálculos de Jogo", path: "Sistema/DESORDEM/Guias/Calculos de Jogo 1a2b3c4d5e.html" },
      { label: "Sanidade", path: "Sistema/DESORDEM/Guias/Sanidade 9f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d.html" },
      { label: "Referência Rápida", path: "Sistema/DESORDEM/Referência Rápida 8f2547cd1e894adf9ed9fac6557a16e2.html" },
    ],
  },
];
const EMOJI_PATTERN = /[\u00A9\u00AE\u203C\u2049\u2122\u2139\u2194-\u21AA\u231A-\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA-\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u27BF\u2934-\u2935\u2B05-\u2B55\u3030\u303D\u3297\u3299]|\p{Extended_Pictographic}/gu;
const CONDITION_BALANCE_REFERENCES = {
  Leve: "Leve: -1/-2 ou 1d4 por turno; alinhado a efeitos básicos de 5-8 Mana e bônus comuns de item (+1).",
  Média: "Média: -2/-3, reação perdida ou 1d6 por turno; alinhado a controle básico forte e efeitos intermediários leves.",
  Pesada: "Pesada: -4, perda de Ação Principal, 1d8 por turno ou controle duro; manter curta ou com remoção clara.",
  Extrema: "Extrema: remove autonomia, turno ou ameaça morte; usar como estado raro, com cura, ritual ou estabilização.",
  Mista: "Mista: concede pressão ofensiva em troca de risco defensivo; valor líquido próximo de uma postura forte.",
  Especial: "Especial: vantagem situacional alta; balancear por duração curta, teste de resistência e contra-jogo explícito.",
};
const CONDITION_BALANCE = {
  "Cego (Visão Turva)": ["Média", "Nenhum.", "-3 em Pontaria e Percepção visual; inimigos recebem +2 para flanquear.", "1 a 2 turnos; se bloquear reação visual, trate como Pesada."],
  Atordoado: ["Pesada", "Nenhum.", "Perde a Ação Principal e sofre -2 de Defesa.", "Até o próximo turno; equivalente a controle duro de magia intermediária."],
  Flanqueado: ["Média", "Atacantes posicionados recebem +2 no ataque.", "O alvo recebe +1d6 de dano de quem estiver flanqueando.", "Dura enquanto o posicionamento existir; não acumula com outro Flanqueado."],
  "Guarda Quebrada": ["Pesada", "Quem atacar o alvo recebe janela clara de execução.", "-4 Defesa.", "Até o próximo turno; referência direta de quebra defensiva pesada."],
  Instável: ["Mista", "+1d6 dano ou +1 AM ao aceitar risco antes do teste.", "Teste CD 15 ao usar habilidade forte; falha causa 1d6 de dano/recurso e uma condição leve.", "Bom para poder alto com chance real de colateral."],
  Caído: ["Média", "Atacantes corpo a corpo recebem +2 contra o alvo.", "-2 Defesa contra corpo a corpo; levantar consome Movimento ou Ação Secundária.", "Não deve travar turno inteiro sozinho."],
  Imobilizado: ["Pesada", "Nenhum.", "Deslocamento 0; -2 em Reflexos e Acrobacia.", "Permite ações ofensivas simples para não virar paralisia total."],
  "Possuído (Parcial)": ["Pesada", "A entidade pode forçar 1 impulso simples por turno.", "-3 em Vontade e Intuição; pode perder uma escolha tática.", "Exige teste mental ou purificação para manter agência."],
  Esgotado: ["Média", "Nenhum.", "-2 em testes físicos e -2 m de deslocamento.", "Penalidade ampla, mas moderada, para cenas longas."],
  Silenciado: ["Pesada", "Nenhum.", "Não usa magia verbal, canto ou técnica baseada em voz; -2 em conjuração adaptada.", "Pesada para conjuradores, leve para combatentes sem voz."],
  Confuso: ["Média", "Nenhum.", "Teste mental CD 13 no começo do turno; falha troca alvo, perde foco ou perde Ação Secundária.", "Controle médio com aleatoriedade, sem tirar sempre a Ação Principal."],
  Sangramento: ["Média", "Nenhum.", "Sofre 1d6 de dano físico no fim do turno.", "Referência: maior que queimadura básica (1d4), menor que dano direto 1d8."],
  Fome: ["Leve", "Nenhum.", "-1 em testes prolongados; recuperação de Vida, Mana, Ki e Energia reduzida em 25%.", "Condição de exploração, não punição forte de combate imediato."],
  Sono: ["Pesada", "Atacantes contra alvo dormindo têm +2 no primeiro ataque.", "-4 Iniciativa e Percepção; se dormir, perde turno até dano/estímulo.", "Controle forte compensado por remoções simples."],
  Envenenado: ["Média", "Nenhum.", "1d6 veneno por turno e -2 em testes físicos.", "Dano contínuo médio com penalidade clara."],
  Exausto: ["Pesada", "Nenhum.", "-3 m deslocamento, -2 em testes físicos e dano causado -2.", "Acumular com Esgotado só aumenta duração, não dobra penalidade."],
  Queimando: ["Leve", "Nenhum.", "1d4 fogo por turno; se durar 3+ turnos, teste mental CD 12 contra pânico leve.", "Referência direta de Fogo básico: 1d4 por 1 turno."],
  "Fome de Mana": ["Média", "Nenhum.", "Custo de Mana +2, mínimo +25%; AM -1 enquanto durar.", "Afeta economia de conjurador sem bloquear magia."],
  Congelado: ["Pesada", "Atacantes recebem +2 contra alvo travado.", "Deslocamento -4 m; falha em resistência perde Movimento e sofre -2 Defesa.", "Controle pesado de mobilidade, menor que Imobilizado total."],
  Desesperado: ["Mista", "+2 em ataque agressivo ou +1d6 dano uma vez por turno.", "-3 Defesa e não pode escolher ação defensiva enquanto atacar.", "Explosão ofensiva com preço defensivo claro."],
  Paranoico: ["Média", "Nenhum.", "-2 em ações cooperativas; não recebe Ajuda/Suporte sem teste mental CD 13.", "Quebra sinergia sem impedir ações próprias."],
  Dominado: ["Extrema", "Controlador escolhe as ações do alvo.", "Perde autonomia e usa turno contra os próprios interesses.", "Só use com duração curta, manutenção ou resistência recorrente."],
  Hipnotizado: ["Pesada", "Controlador impõe comando simples.", "-4 Iniciativa/Percepção; não escolhe objetivo livremente.", "Controle direto menor que Dominado."],
  Pânico: ["Pesada", "Nenhum.", "Deve se afastar da ameaça; -2 em ataques e testes enquanto foge.", "Tira posicionamento, mas não deve impedir toda ação útil sempre."],
  Apático: ["Média", "Nenhum.", "-4 Iniciativa, perde Reação e sofre -2 em decisões rápidas.", "Forte contra controle e suporte, moderada contra ações simples."],
  Frenesi: ["Mista", "+2 ataque corpo a corpo e +1d6 dano.", "-2 Defesa; deve focar alvo mais próximo e não usa ações complexas.", "Burst equivalente a postura ofensiva com perda de controle."],
  "Quebrado Mentalmente": ["Extrema", "Nenhum.", "Só executa ação básica se passar em teste mental CD 15; -4 em testes mentais.", "Estado de cena inteira, não deve ser aplicado por golpe comum."],
  Fraturado: ["Pesada", "Nenhum.", "Membro afetado sofre -4 em testes; perna reduz deslocamento em -3 m, braço reduz dano em -1d6.", "Lesão objetiva com impacto por membro."],
  Mutilado: ["Extrema", "Nenhum.", "Perde uso de membro/função; -6 em ações relacionadas.", "Persistente; exige cura superior, prótese ou reconstrução."],
  "Sangramento Interno": ["Pesada", "Nenhum.", "1d8 dano oculto por turno de esforço; cura recebida reduzida em 50%.", "Mais letal que Sangramento por ser difícil de detectar."],
  Asfixiado: ["Extrema", "Nenhum.", "1d8 dano por turno sem ar; após 2 turnos, perde Ação Principal até respirar.", "Letal rápido, precisa contra-jogo imediato."],
  Enraizado: ["Pesada", "Nenhum.", "Deslocamento 0; -2 Reflexos; não pode usar investida ou esquiva longa.", "Controle de chão sem impedir ataques."],
  Desidratado: ["Média", "Nenhum.", "Perde 10 Energia Física por cena ou 1d6 por turno de esforço; -2 foco.", "Drena exploração e combate longo sem matar rápido."],
  Sobrecarregado: ["Média", "Nenhum.", "-2 Reflexos e Iniciativa; deslocamento -2 m.", "Penalidade de carga comparável a armadura pesada ruim."],
  Infectado: ["Média", "Nenhum.", "-1 Vida máxima por descanso sem tratamento; em combate, -2 Fortitude.", "Pressão de campanha progressiva, não dano explosivo."],
  "Fome de Ki": ["Média", "Nenhum.", "Técnicas de Ki causam -1d6 dano e custam +2 PK.", "Equivalente marcial de Fome de Mana."],
  "Excesso de Ki": ["Mista", "+1d6 dano de Ki uma vez por turno se descarregar fluxo.", "Ao usar técnica, sofre 1d6 dano próprio ou perde 2 PK adicionais.", "Transforma recurso alto em risco controlado."],
  "Mana Corrompida": ["Pesada", "Nenhum.", "Magias custam +2 Mana; teste CD 14 ou geram efeito colateral.", "Instabilidade arcana mais forte que Fome de Mana."],
  "Sobrecarga Mágica": ["Pesada", "Nenhum.", "Perde Reação e Ação Secundária; se conjurar pesado de novo, fica Atordoado.", "Freio para explosão arcana repetida."],
  "Vazio Arcano": ["Pesada", "Nenhum.", "AM vira 0 e não conjura magia enquanto durar.", "Extrema para magos se passar de 2 turnos."],
  "Canalização Quebrada": ["Pesada", "Interrompe efeito inimigo sustentado.", "Perde magia/técnica em canalização; próxima tentativa custa +2 recurso.", "Resposta forte contra habilidades longas."],
  Drenado: ["Pesada", "Fonte da drenagem recupera metade do recurso drenado, se aplicável.", "Perde 3 Mana/Ki ou 1d6 Energia/Vida por turno.", "Dano de recurso sustentado exige vínculo quebrável."],
  "Eco Arcano": ["Especial", "Em sucesso, repete efeito arcano leve sem custo adicional.", "Em falha, repete em alvo errado ou causa 1d6 retorno arcano.", "50% benefício/risco, bom para caos controlado."],
  Exposto: ["Média", "Próximo atacante recebe +2 no ataque.", "-2 Defesa; próximo acerto contra o alvo causa +1d6.", "Janela curta de burst tático."],
  Desestabilizado: ["Média", "Nenhum.", "Ações complexas exigem teste CD 13; falha perde Ação Secundária ou paga +1 recurso.", "Reduz confiabilidade sem cancelar tudo."],
  Provocado: ["Média", "Provocador recebe controle de foco do alvo.", "-2 em ataques que não sejam contra o provocador.", "Controle de alvo com contra-jogo mental/linha de visão."],
  Desarmado: ["Média", "Quem desarmou ganha janela de pressão.", "Não usa arma equipada; dano desarmado vira 1d4 até recuperar/sacar.", "Impacto alto para arma, baixo para conjurador."],
  Marcado: ["Média", "Aliados que reconhecem a marca causam +1d6 no primeiro acerto por turno.", "Alvo não se beneficia de ocultação leve contra marcadores.", "Foco coletivo limitado por turno."],
  "Contra-Atacado": ["Média", "O contra-atacante recebe +2 e +1d6 no próximo golpe de reação.", "Alvo fica punido após erro previsível.", "Não acumula com Exposto no mesmo ataque."],
  "Sob Pressão": ["Média", "Nenhum.", "-2 em testes mentais e Reação; múltiplas ações exigem teste CD 13.", "Pressão tática para líderes e controladores."],
  Surdo: ["Leve", "Nenhum.", "-2 Percepção auditiva; não recebe comandos verbais nem gatilhos sonoros.", "Leve em duelo, média em equipe/furtividade."],
  Desorientado: ["Média", "Nenhum.", "-2 ataques, Reflexos e navegação; deslocamento tático reduzido pela metade.", "Controle sensorial moderado."],
  "Visão Dupla": ["Média", "Nenhum.", "-3 Pontaria/Percepção visual; 25% de chance de errar alvo em distância.", "Versão menos total que Cego."],
  Alucinado: ["Pesada", "Nenhum.", "-3 testes mentais/percepção; 50% de chance de gastar Reação com ameaça falsa.", "Controle sensorial forte, mas probabilístico."],
  Rastreado: ["Leve", "Rastreador recebe +2 para perseguir e achar o alvo.", "Alvo não pode se ocultar da fonte sem limpeza do rastro.", "Leve porque não reduz ação diretamente."],
  "À Beira da Morte": ["Extrema", "Nenhum.", "-4 em todos os testes; qualquer dano 1d6+ força estabilização imediata.", "Estado terminal, não condição comum de dano."],
  Colapsado: ["Extrema", "Atacantes têm abertura total se o alvo estiver indefeso.", "Não age, não sustenta habilidade e sofre -4 Defesa.", "Remove do ritmo de combate até recurso/cura."],
  "Alma Fragmentada": ["Extrema", "Nenhum.", "AM -2, recuperação de Sanidade pela metade e -3 testes espirituais/mentais.", "Dano espiritual persistente, exige ritual."],
  Corrompido: ["Extrema", "Pode liberar +1d6 sombrio se aceitar avançar corrupção.", "Cura recebida -50%; a cada cena teste CD 15 ou ganha condição adicional.", "Poder tentador com custo de longo prazo."],
  "Instinto de Sobrevivência": ["Mista", "+4 Defesa/Reflexos e +2 ataque ou +2d6 dano por 1 turno.", "Ao acabar, fica Exausto; se já estava Exausto, fica Colapsado.", "Último recurso explosivo com queda forte."],
  Ancorado: ["Especial", "Imune a empurrão, puxão e teleporte forçado.", "Não pode teleportar, avançar com investida ou ser reposicionado por aliado.", "Defensivo forte contra controle espacial."],
  Deslocado: ["Especial", "Primeiro ataque contra o alvo tem 50% de chance de falhar.", "-2 precisão; 25% de chance de ação complexa sair atrasada.", "Defesa caótica com perda de controle."],
  "Eco Temporal": ["Especial", "Pode repetir uma Ação Secundária simples do turno anterior.", "Se falhar teste CD 14, repete movimento/ação ruim involuntariamente.", "Valor alto limitado a 1-2 turnos."],
  "Gravidade Alterada": ["Especial", "Quem controlar a gravidade recebe +2 contra movimento inimigo.", "Movimento pela metade; saltos impossíveis; -2 corpo a corpo e Reflexos.", "Controle espacial pesado com adaptação possível."],
  "Marca do Caos": ["Especial", "Resultado favorável: +2 em teste ou +1d6 dano no turno.", "Resultado ruim: 1d6 dano, -2 em teste ou condição leve aleatória.", "Alto caos; resolver com rolagem por turno."],
};

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
  data: { items: [], arcane: [], ki: [], subclasses: [], postures: [], enchantments: [] },
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
    wikiSearch: "",
    statObjectWeight: "",
    deletedSheets: [],
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

  if (action === "level-up") {
    sheet.level = clamp(parseNumber(sheet.level, 1) + 1, 1, MAX_LEVEL);
    clampSubclasses(sheet);
    touchAndRender(sheet);
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
    sheet.abilities.push({ id: uid(), name: "", type: "Poder", cost: "", range: "", damage: "", note: "", source: "Manual" });
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
      unit: "flat",
      targets: [],
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

  if (target.matches("[data-wiki-search]")) {
    state.wikiSearch = target.value;
    persistLocalOnly();
    renderApp();
    return;
  }

  if (!sheet) return;

  if (target.matches("[data-stat-weight]")) {
    state.statObjectWeight = target.value;
    persistNow();
    refreshCalculations();
    return;
  }

  if (target.matches("[data-local-only]")) {
    sheet.localOnly = target.checked;
    touchSheet(sheet);
    renderApp();
    return;
  }

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
    refreshCalculations();
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

  if (target.matches("[data-modifier-target]")) {
    const sheet = getActiveSheet();
    if (!sheet) return;
    const modifier = sheet.modifiers[Number(target.dataset.index)];
    if (!modifier) return;
    const value = target.dataset.modifierTarget;
    const selected = new Set(modifier.targets || []);
    if (target.checked) selected.add(value);
    else selected.delete(value);
    modifier.targets = [...selected];
    touchSheet(sheet);
    refreshCalculations();
    return;
  }

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
        <label class="inline-field">
          <input type="checkbox" data-home-field="localOnly" />
          <span>Ficha invisível (somente local)</span>
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
        <label class="field wiki-search">
          <span>Buscar seção</span>
          <input data-wiki-search value="${escapeAttr(state.wikiSearch || "")}" placeholder="Classe, magia, condição" />
        </label>
        ${renderWikiCreationSummary()}
        <nav class="wiki-nav" aria-label="Seções da wiki">
          ${renderWikiNav(currentPath)}
        </nav>
      </aside>
      <section class="panel wiki-panel">
        <div class="panel-title">
          <h2>${escapeHtml(wiki.path === currentPath ? wiki.title || "Wiki" : "Wiki")}</h2>
          <span class="badge">${escapeHtml(wikiStatusText(currentPath))}</span>
        </div>
        ${renderWikiCreationGuide(currentPath)}
        <article class="wiki-article">
          ${renderWikiArticle(currentPath)}
        </article>
      </section>
    </section>
  `;
}

function renderWikiNav(currentPath) {
  const search = normalizeText(state.wikiSearch || "");
  const sections = WIKI_NAV_SECTIONS.map((section) => {
    const links = section.links.filter((link) => {
      if (!search) return true;
      return normalizeText(`${section.title} ${link.label} ${wikiTitleFromPath(link.path)}`).includes(search);
    });
    return { ...section, links };
  }).filter((section) => section.links.length);

  if (!sections.length) return `<div class="empty-state">Nenhuma seção encontrada.</div>`;

  return sections.map((section) => `
    <div class="wiki-nav-section">
      <h3>${escapeHtml(section.title)}</h3>
      <div class="wiki-nav-links">
        ${section.links.map((link) => `
          <button type="button" class="wiki-nav-button ${link.path === currentPath ? "active" : ""}" data-action="wiki-open" data-path="${escapeAttr(link.path)}">
            ${escapeHtml(link.label)}
          </button>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function renderWikiCreationSummary() {
  return `
    <section class="wiki-summary">
      <h3>Criação rápida</h3>
      <dl>
        <div><dt>Nível</dt><dd>1 a ${MAX_LEVEL}</dd></div>
        <div><dt>Atributos</dt><dd>${INITIAL_ATTRIBUTE_POINTS} pontos base</dd></div>
        <div><dt>Subclasse</dt><dd>até ${MAX_SUBCLASS_LEVEL} níveis</dd></div>
        <div><dt>Perícia treinada</dt><dd>+5</dd></div>
      </dl>
    </section>
  `;
}

function renderWikiCreationGuide(currentPath) {
  const title = wikiTitleFromPath(currentPath);
  const shouldShow = currentPath === WIKI_ROOT_PATH || ["Começar", "Criar Personagem"].includes(title);
  if (!shouldShow) return "";

  const classRows = Object.entries(CLASS_RULES).map(([className, rules]) => `
    <tr>
      <th>${escapeHtml(className)}</th>
      <td>PV ${formatNumber(rules.lifeBase)} + ${formatNumber(rules.lifePerLevel)} por nível</td>
      <td>${rules.usesMana ? "Mana" : ""}${rules.usesMana && rules.usesKi ? " e " : ""}${rules.usesKi ? "Ki" : ""}${!rules.usesMana && !rules.usesKi ? "sem Mana/Ki" : ""}</td>
    </tr>
  `).join("");

  return `
    <section class="wiki-guide" aria-label="Guia rápido de criação">
      <div class="wiki-guide-head">
        <h3>Guia rápido para criar ficha</h3>
        <p>Use esta ordem para montar personagem sem procurar regra em várias páginas.</p>
      </div>
      <ol class="wiki-steps">
        <li><strong>Dados básicos:</strong> nome, classe, conceito e nível entre 1 e ${MAX_LEVEL}.</li>
        <li><strong>Atributos:</strong> distribua ${INITIAL_ATTRIBUTE_POINTS} pontos base. O modificador é piso((atributo total - 10) / 2).</li>
        <li><strong>Classe:</strong> define PV base, recurso principal e perfil inicial de jogo.</li>
        <li><strong>Subclasses:</strong> escolha opções compatíveis e limite cada uma a ${MAX_SUBCLASS_LEVEL} níveis.</li>
        <li><strong>Poderes e itens:</strong> use Biblioteca para adicionar equipamentos, magias, técnicas e poderes à ficha.</li>
      </ol>
      <div class="table-wrap wiki-table-wrap">
        <table class="wiki-table compact">
          <thead>
            <tr><th>Classe</th><th>Vida</th><th>Recurso</th></tr>
          </thead>
          <tbody>${classRows}</tbody>
        </table>
      </div>
      <div class="wiki-formula-grid">
        ${RESOURCES.map((resource) => `
          <div class="wiki-formula">
            <span>${escapeHtml(resource.label)}</span>
            <strong>${escapeHtml(resource.formula)}</strong>
          </div>
        `).join("")}
      </div>
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
        ${sheet.localOnly ? `<span class="badge">Invisível</span>` : ``}
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
            ${sheet.localOnly ? `<span class="badge">Invisível</span>` : ``}
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
          <label class="inline-field">
            <input type="checkbox" data-local-only ${sheet.localOnly ? "checked" : ""} />
            <span>Ficha invisível (somente local)</span>
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
              <div class="level-control">
                <input type="number" min="1" max="${MAX_LEVEL}" step="1" data-number-bind="level" value="${escapeAttr(sheet.level)}" />
                <button type="button" class="ghost-button level-up-button" data-action="level-up" title="Subir 1 nível" aria-label="Subir 1 nível">+1</button>
              </div>
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
  const tracksCurrent = !["defense", "magicAmp", "kiRefine"].includes(resource.key);
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
        ${uses && tracksCurrent ? `
        <div class="resource-bar" data-resource-bar="${resource.key}">
          <div class="resource-bar-fill"></div>
          <div class="resource-bar-text"><span class="bar-current">${escapeHtml(String(current || "0"))}</span>/<span class="bar-max">0</span></div>
        </div>
        ` : ""}
      </div>
      ${tracksCurrent ? `
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
      <label class="field">
        <span>Peso</span>
        <input type="number" step="0.5" min="0" data-inventory-field="weight" data-index="${index}" value="${escapeAttr(item.weight)}" />
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
    </section>
  `;
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
        <span>Alcance</span>
        <input data-ability-field="range" data-index="${index}" value="${escapeAttr(ability.range)}" />
      </label>
      <label class="field">
        <span>Dano</span>
        <input data-ability-field="damage" data-index="${index}" value="${escapeAttr(ability.damage)}" />
      </label>
      <label class="field">
        <span>Bônus</span>
        <input data-ability-field="bonus" data-index="${index}" value="${escapeAttr(ability.bonus)}" />
      </label>
      <label class="inline-field">
        <input type="checkbox" data-ability-field="active" data-index="${index}" ${ability.active !== false ? "checked" : ""} />
        Ativo
      </label>
      <label class="field">
        <span>Alvo</span>
        <input data-ability-field="target" data-index="${index}" value="${escapeAttr(ability.target)}" placeholder="res:defense" />
      </label>
      <label class="field">
        <span>Valor</span>
        <input type="number" step="0.5" data-ability-field="value" data-index="${index}" value="${escapeAttr(ability.value)}" />
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
  const selected = new Set(modifier.targets || []);
  const targetGroups = [
    { title: "Atributos", entries: ATTRIBUTES.map((entry) => [`attr:${entry.key}`, entry.label]) },
    { title: "Recursos", entries: RESOURCES.map((entry) => [`res:${entry.key}`, entry.label]) },
    { title: "Perícias", entries: SKILLS.map((entry) => [`skill:${entry.key}`, entry.label]) },
    { title: "Carga", entries: [["misc:cargoMax", "Carga máxima"]] },
  ];
  return `
    <div class="modifier-row">
      <label class="field">
        <span>Nome</span>
        <input data-modifier-field="name" data-index="${index}" value="${escapeAttr(modifier.name)}" />
      </label>
      <label class="field">
        <span>Origem</span>
        <select data-modifier-field="kind" data-index="${index}">
          ${["Buff", "Debuff", "Equipamento", "Artefato", "Condição", "Outro"].map((kind) => option(kind, modifier.kind)).join("")}
        </select>
      </label>
      <label class="field">
        <span>Tipo</span>
        <select data-modifier-field="unit" data-index="${index}">
          ${optionWithLabel("flat", "Valor fixo", modifier.unit)}
          ${optionWithLabel("pct", "Porcentagem %", modifier.unit)}
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
      <details class="modifier-targets">
        <summary>Alvos${selected.size ? ` (${selected.size})` : ""}</summary>
        ${targetGroups.map((group) => `
          <div class="modifier-target-group">
            <span class="modifier-target-title">${group.title}</span>
            <div class="modifier-target-chips">
              ${group.entries.map(([value, label]) => `
                <label class="inline-field">
                  <input type="checkbox" data-modifier-target="${escapeAttr(value)}" data-index="${index}" ${selected.has(value) ? "checked" : ""} />
                  ${escapeHtml(label)}
                </label>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </details>
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
          <div class="stats-grid">
            <div class="stat-box"><span>Carga máxima</span><strong data-calc="cargo-max">-</strong></div>
            <div class="stat-box"><span>Carga atual</span><strong data-calc="cargo-current">-</strong></div>
            <div class="stat-box"><span>Penalidade de carga</span><strong data-calc="overweight-penalty">-</strong></div>
            <div class="stat-box"><span>Deslocamento</span><strong data-calc="displacement">-</strong></div>
            <div class="stat-box"><span>Velocidade máxima</span><strong data-calc="max-speed">-</strong></div>
          </div>
          <div class="panel-title stat-tools-title">
            <h3>Arremesso e queda</h3>
          </div>
          <label class="field">
            <span>Peso do objeto (kg)</span>
            <input type="number" step="0.5" min="0" data-stat-weight value="${escapeAttr(state.statObjectWeight)}" placeholder="ex.: 120" />
          </label>
          <div class="stats-grid">
            <div class="stat-box"><span>Dano por peso</span><strong data-calc="weight-damage">-</strong></div>
            <div class="stat-box"><span>Distância de arremesso</span><strong data-calc="throw-distance">-</strong></div>
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
  const damage = extractDamageFromRow(row);
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
        ${libraryField("Base", row["Base Elemental"])}
        ${libraryField("Requisitos", getLibraryRequirementText(row, key))}
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
  options.push(optionWithLabel("misc:cargoMax", "Carga máxima", selected));
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
        cost: "4 Mana",
        range: "18 m",
        damage: "1d6",
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
  sheet.localOnly = Boolean(sheet.localOnly);
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
  sheet.abilities = Array.isArray(sheet.abilities) ? sheet.abilities.map(normalizeAbility).filter(shouldKeepAbility) : [];
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
    weight: parseNumber(item.weight, 0),
    note: item.note || "",
    source: item.source || "",
    enchantments: Array.isArray(item.enchantments) ? item.enchantments.map(normalizeEnchantment) : [],
  };
}

function normalizeAbility(ability) {
  const normalized = {
    id: ability.id || uid(),
    name: ability.name || "",
    type: ability.type || "",
    cost: ability.cost || "",
    range: ability.range || "",
    damage: ability.damage || "",
    bonus: ability.bonus || "",
    note: ability.note || "",
    target: ability.target || "",
    value: parseNumber(ability.value, 0),
    active: ability.active !== false,
    source: ability.source || "",
  };
  if (normalizeText(normalized.source) === "padrao" && normalizeText(normalized.name) === "raio de mana") {
    normalized.cost = "4 Mana";
    normalized.range = "18 m";
    normalized.damage = "1d6";
  }
  return normalized;
}

function shouldKeepAbility(ability) {
  const type = normalizeText(ability.type);
  const source = normalizeText(ability.source);
  if (type !== "poder") return true;
  return !["wiki", "poderes especiais"].includes(source);
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
  const targets = Array.isArray(modifier.targets) && modifier.targets.length
    ? modifier.targets.filter(Boolean)
    : (modifier.target ? [modifier.target] : []);
  return {
    id: modifier.id || uid(),
    name: modifier.name || "",
    kind: modifier.kind || "Buff",
    unit: modifier.unit === "pct" ? "pct" : "flat",
    targets,
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
      wikiPath: raw.wikiPath || WIKI_ROOT_PATH,
      wikiHistory: Array.isArray(raw.wikiHistory) ? raw.wikiHistory : [],
      wikiSearch: raw.wikiSearch || "",
      statObjectWeight: raw.statObjectWeight || "",
      deletedSheets: Array.isArray(raw.deletedSheets) ? raw.deletedSheets : [],
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
      wikiPath: WIKI_ROOT_PATH,
      wikiHistory: [],
      wikiSearch: "",
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
  sanitizeWikiArticle(article);
  article.querySelectorAll("a").forEach((link) => {
    const nextPath = resolveWikiPath(link.getAttribute("href"), path);
    if (nextPath) link.setAttribute("title", "Abrir dentro da wiki");
  });

  return {
    title: stripEmoji(doc.querySelector(".page-title")?.textContent?.trim() || doc.title || "").trim(),
    html: article.innerHTML,
  };
}

function sanitizeWikiArticle(article) {
  article.querySelectorAll("script, style, .page-header-icon, .icon, .property-icon").forEach((node) => node.remove());
  article.querySelectorAll("img").forEach((image) => {
    if (!image.getAttribute("alt")) image.setAttribute("alt", "");
  });
  article.querySelectorAll("table").forEach((table) => {
    const columns = Math.max(...Array.from(table.rows).map((row) => row.cells.length), 1);
    table.classList.add("wiki-table");
    table.style.setProperty("--wiki-columns", String(columns));
    if (columns > 6) table.classList.add("wide");
    if (table.closest(".wiki-table-wrap")) return;
    const wrapper = article.ownerDocument.createElement("div");
    wrapper.className = "table-wrap wiki-table-wrap";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    node.nodeValue = stripEmoji(node.nodeValue);
  });
}

function renderWikiCsv(text, path) {
  const rows = prepareWikiRows(parseCsv(text), path);
  if (!rows.length) return `<div class="empty-state">Tabela vazia.</div>`;

  const headers = Object.keys(rows[0]);
  const tableClass = headers.length > 6 ? "wiki-table wide" : "wiki-table";
  return `
    <div class="wiki-csv-heading">
      <h1>${escapeHtml(wikiTitleFromPath(path))}</h1>
      <span class="badge">${rows.length} registros</span>
    </div>
    <div class="table-wrap wiki-table-wrap">
      <table class="${tableClass}" style="--wiki-columns: ${headers.length}">
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(cleanWikiText(header))}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              ${headers.map((header) => `<td>${escapeHtml(cleanWikiText(row[header] || ""))}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    ${renderWikiRecordCards(rows, headers)}
  `;
}

function prepareWikiRows(rows, path) {
  if (!isConditionsPath(path)) return rows;

  return rows.map((row) => {
    const balance = CONDITION_BALANCE[cleanWikiText(row.Nome)] || ["Média", "Nenhum.", "Aplicar penalidade conforme descrição.", "Usar por 1-3 turnos com teste de resistência apropriado."];
    const [severity, buff, debuff, value] = balance;
    return {
      ...row,
      Severidade: severity,
      Buff: buff,
      Debuff: debuff,
      "Valor em jogo": value,
      "Referência de balanceamento": CONDITION_BALANCE_REFERENCES[severity] || CONDITION_BALANCE_REFERENCES.Média,
    };
  });
}

function isConditionsPath(path) {
  return normalizeText(path).includes("condicoes") || normalizeText(wikiTitleFromPath(path)) === "condicoes";
}

function renderWikiRecordCards(rows, headers) {
  return `
    <details class="wiki-records" open>
      <summary>Registros legíveis</summary>
      <div class="wiki-record-grid">
        ${rows.map((row) => {
          const title = cleanWikiText(row[headers[0]] || "Registro");
          const fields = headers.slice(1).filter((header) => cleanWikiText(row[header] || "")).map((header) => `
            <div class="wiki-record-field">
              <span>${escapeHtml(cleanWikiText(header))}</span>
              <strong>${escapeHtml(cleanWikiText(row[header] || ""))}</strong>
            </div>
          `).join("");

          return `
            <article class="wiki-record-card">
              <h3>${escapeHtml(title)}</h3>
              <div class="wiki-record-fields">${fields || `<p class="tiny">Sem detalhes.</p>`}</div>
            </article>
          `;
        }).join("")}
      </div>
    </details>
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
    const [serverSheets, deletedIds] = await Promise.all([loadServerSheets(), loadDeletedSheets(local.deletedSheets)]);
    const sheets = mergeSheetLists(local.sheets, serverSheets, deletedIds);
    const uploadResult = await uploadLocalSheetsNewerThanServer(local.sheets, serverSheets);
    serverOnline = true;
    lastSyncError = uploadResult.failed.length ? `${uploadResult.failed.length} ficha(s) pendente(s) de envio` : "";
    return {
      ...local,
      deletedSheets: state.deletedSheets,
      sheets,
      activeId: sheets.some((sheet) => sheet.id === local.activeId) ? local.activeId : sheets[0]?.id || null,
    };
  } catch (error) {
    console.warn("Servidor de fichas indisponível, usando armazenamento local.", error);
    serverOnline = false;
    lastSyncError = "";
    return local;
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new ApiRequestError(response);
  }
  return response;
}

class ApiRequestError extends Error {
  constructor(response) {
    super(`API request failed: ${response.status} ${response.statusText}`);
    this.name = "ApiRequestError";
    this.status = response.status;
    this.statusText = response.statusText;
  }
}

async function loadServerSheets() {
  const response = await apiRequest("/sheets");
  const sheets = await response.json();
  return Array.isArray(sheets) ? sheets.map(normalizeSheet) : [];
}

function isSheetDeleted(id) {
  return state.deletedSheets.includes(id);
}

async function loadDeletedSheets(initial = state.deletedSheets) {
  try {
    const response = await apiRequest("/deleted-sheets");
    const ids = await response.json();
    if (Array.isArray(ids)) {
      state.deletedSheets = [...new Set([...initial, ...ids])];
      persistLocalOnly();
    }
  } catch (error) {
    console.warn("Não foi possível carregar fichas excluídas.", error);
  }
  return new Set(state.deletedSheets);
}

function mergeSheetLists(localSheets, serverSheets, deletedIds = new Set(state.deletedSheets)) {
  const merged = new Map();
  for (const sheet of serverSheets) {
    if (!deletedIds.has(sheet.id)) merged.set(sheet.id, sheet);
  }

  for (const sheet of localSheets) {
    if (deletedIds.has(sheet.id)) continue;
    const serverSheet = merged.get(sheet.id);
    if (sheet.localOnly || !serverSheet || isNewerSheet(sheet, serverSheet)) {
      merged.set(sheet.id, sheet);
    }
  }

  return [...merged.values()].sort((a, b) => timestampValue(b.updatedAt) - timestampValue(a.updatedAt));
}

async function uploadLocalSheetsNewerThanServer(localSheets, serverSheets) {
  const serverById = new Map(serverSheets.map((sheet) => [sheet.id, sheet]));
  const pending = localSheets.filter((sheet) => {
    if (sheet.localOnly || isSheetDeleted(sheet.id)) return false;
    const serverSheet = serverById.get(sheet.id);
    return !serverSheet || isNewerSheet(sheet, serverSheet);
  });

  const result = { attempted: pending.length, uploaded: 0, failed: [] };
  for (const sheet of pending) {
    try {
      await saveSheetOnServer(sheet);
      result.uploaded += 1;
    } catch (error) {
      result.failed.push({ sheet, error });
    }
  }
  return result;
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
    const [serverSheets, deletedIds] = await Promise.all([loadServerSheets(), loadDeletedSheets()]);
    const sheets = mergeSheetLists(localSheets, serverSheets, deletedIds);
    serverOnline = true;
    state.sheets = sheets;
    if (!state.sheets.some((sheet) => sheet.id === state.activeId)) {
      state.activeId = state.sheets[0]?.id || null;
      if (!state.activeId) state.view = "home";
    }
    const uploadResult = await uploadLocalSheetsNewerThanServer(localSheets, serverSheets);
    lastSyncError = uploadResult.failed.length ? `${uploadResult.failed.length} ficha(s) pendente(s) de envio` : "";
    persistLocalOnly();
    renderApp();
    setSaveStatus(uploadResult.failed.length ? "Banco online; envio pendente" : "Banco atualizado");
  } catch (error) {
    console.warn("Não foi possível atualizar fichas do servidor.", error);
    serverOnline = false;
    lastSyncError = "";
    renderApp();
    setSaveStatus("Usando local");
  }
}

async function saveSheetOnServer(sheet) {
  if (!sheet?.id || sheet.localOnly) return;
  try {
    const path = `/sheets/${encodeURIComponent(sheet.id)}`;
    const options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sheet),
    };
    try {
      await apiRequest(path, options);
    } catch (error) {
      if (![404, 405].includes(error.status)) throw error;
      await apiRequest(path, { ...options, method: "POST" });
    }
    serverOnline = true;
    lastSyncError = "";
  } catch (error) {
    if (error.status === 409) {
      console.warn("Ficha excluída no servidor; removendo localmente.", sheet.id);
      markSheetDeletedLocally(sheet.id);
      return;
    }
    serverOnline = Boolean(error.status && error.status < 500 && error.status !== 503);
    lastSyncError = "Envio pendente";
    throw error;
  }
}

function markSheetDeletedLocally(id) {
  if (!state.deletedSheets.includes(id)) state.deletedSheets.push(id);
  state.sheets = state.sheets.filter((entry) => entry.id !== id);
  if (state.activeId === id) {
    state.activeId = state.sheets[0]?.id || null;
    if (!state.activeId) state.view = "home";
  }
  persistLocalOnly();
  renderApp();
}

function syncSheetOnServer(sheet) {
  if (!sheet?.id || sheet.localOnly) {
    setSaveStatus("Salvo localmente");
    return;
  }
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
  if (serverOnline && sheet && !sheet.localOnly) {
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
  if (serverOnline && lastSyncError) return "Banco conectado; envio pendente";
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
  const localOnly = document.querySelector('[data-home-field="localOnly"]')?.checked || false;
  const sheet = createDefaultSheet({ name, className, description, localOnly });
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
  if (!sheet.localOnly && !state.deletedSheets.includes(id)) state.deletedSheets.push(id);
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
  } else if (["quantity", "value", "weight"].includes(field)) {
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
    if (isFreeDefaultMagicName(row.Nome)) return { ok: true, reason: "" };
    const arcanism = getSubclassLevel(sheet, "Arcanismo");
    if (arcanism < 1) return { ok: false, reason: "Requer pelo menos 1 nível em Arcanismo." };
    const used = countArcanismMagicAbilities(sheet);
    if (used >= arcanism) return { ok: false, reason: `Limite de magias por Arcanismo atingido: ${used}/${arcanism}.` };
  }
  if (sourceKey === "ki" && !["Ki", "Híbrido"].includes(sheet.className)) {
    return { ok: false, reason: "Apenas Ki ou Híbrido podem aprender técnicas de Ki." };
  }
  return { ok: true, reason: "" };
}

function getLibraryRequirementText(row, key) {
  const requirements = cleanWikiText(row.Requisitos || "");
  if (key === "arcane" && isFreeDefaultMagicName(row.Nome)) return "Magia padrão de Mago e Híbrido";
  if (key === "arcane") {
    return ["Requer 1 nível livre de Arcanismo", requirements].filter(Boolean).join("; ");
  }
  return requirements || "-";
}

function countArcanismMagicAbilities(sheet) {
  return sheet.abilities.filter((ability) => normalizeText(ability.type) === "magia" && !isFreeDefaultMagicAbility(ability)).length;
}

function isFreeDefaultMagicAbility(ability) {
  return normalizeText(ability.source) === "padrao" || isFreeDefaultMagicName(ability.name);
}

function isFreeDefaultMagicName(name) {
  return normalizeText(name) === "raio de mana";
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
    let total = applyModifierTo(base + manual, external);
    if (posture.attrPct?.[attr.key]) total += Math.floor((total * posture.attrPct[attr.key]) / 100);
    attributes[attr.key] = Math.floor(total);
    attrMods[attr.key] = Math.floor((attributes[attr.key] - 10) / 2);
  }

  const totalWeight = sheet.inventory.reduce((sum, item) => sum + parseNumber(item.weight, 0) * parseNumber(item.quantity, 1), 0);
  const cargoMax = 25 + (attrMods.strength + 5) * (level / 2) + sumExternalModifiers(sheet, "misc:cargoMax").flat;
  const overweightPenalty = calcOverweightPenalty(totalWeight, cargoMax);
  if (overweightPenalty > 0) {
    attributes.dexterity = Math.max(0, attributes.dexterity - overweightPenalty);
    attrMods.dexterity = Math.floor((attributes.dexterity - 10) / 2);
  }

  const resourceExternal = (key) => sumExternalModifiers(sheet, `res:${key}`);
  const resourceFlat = (key, base) => base + parseNumber(sheet.resourceMods[key], 0) + resourceExternal(key).flat;
  const resourcePct = (key, value) => {
    const pct = resourceExternal(key).pct;
    return pct ? Math.floor(value + (value * pct) / 100) : value;
  };
  const lifeGrowth = getLifeGrowthPerLevel(rules, attrMods.constitution);
  const resources = {
    hp: resourcePct("hp", Math.floor(rules.lifeBase + lifeGrowth * level + resourceFlat("hp", 0))),
    sanity: resourcePct("sanity", Math.floor(20 + attrMods.charisma + halfLevel + resourceFlat("sanity", 0))),
    mana: rules.usesMana ? resourcePct("mana", Math.floor(10 + level * (3 + attrMods.intelligence) + resourceFlat("mana", 0))) : 0,
    ki: rules.usesKi ? resourcePct("ki", Math.floor(10 + level * (3 + attrMods.wisdom) + resourceFlat("ki", 0))) : 0,
    energy: resourcePct("energy", Math.floor(attributes.constitution * level + resourceFlat("energy", 0))),
    defense: resourcePct("defense", Math.floor(10 + halfLevel + attrMods.dexterity + parseNumber(sheet.equipmentDefense, 0) + resourceFlat("defense", 0))),
    magicAmp: resourcePct("magicAmp", Math.floor(attrMods.intelligence + Math.floor(level / 10) + resourceFlat("magicAmp", 0))),
    kiRefine: resourcePct("kiRefine", Math.floor(attrMods.wisdom + Math.floor(level / 10) + resourceFlat("kiRefine", 0))),
  };

  if (posture.defenseAttr && posture.defenseAttrPct) {
    resources.defense += Math.floor((attributes[posture.defenseAttr] * posture.defenseAttrPct) / 100);
  }
  if (posture.defensePct) resources.defense = Math.floor((resources.defense * (100 + posture.defensePct)) / 100);
  if (posture.sanityPct) resources.sanity += Math.floor((resources.sanity * posture.sanityPct) / 100);
  if (posture.magicAmpPct) resources.magicAmp = Math.floor((resources.magicAmp * (100 + posture.magicAmpPct)) / 100);

  const skills = {};
  for (const skill of SKILLS) {
    const base =
      attrMods[skill.attr] +
      halfLevel +
      (sheet.trained[skill.key] ? 5 : 0) +
      parseNumber(sheet.skillMods[skill.key], 0);
    skills[skill.key] = Math.floor(applyModifierTo(base, sumExternalModifiers(sheet, `skill:${skill.key}`)));
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

  const displacement = 10 + attrMods.dexterity + sumExternalModifiers(sheet, "misc:displacement").flat;
  const maxSpeed = 20 + 3 * attrMods.dexterity;

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
    totalWeight,
    cargoMax,
    overweightPenalty,
    displacement,
    maxSpeed,
  };
}

function weightDamageDice(peso) {
  return Math.max(0, Math.floor(peso / 50));
}

function calcOverweightPenalty(totalWeight, cargoMax) {
  return Math.floor(Math.max(0, totalWeight - cargoMax) / 5);
}

function throwDistance(peso, cargoMax) {
  if (peso <= 0) return 0;
  return cargoMax / Math.sqrt(peso);
}

function getLifeGrowthPerLevel(rules, constitutionMod) {
  return Math.max(1, constitutionMod + rules.lifePerLevel);
}

function sumExternalModifiers(sheet, target) {
  let flat = getInventoryTargetTotal(sheet, target);
  if (!target) return { flat, pct: 0 };
  let pct = 0;
  for (const modifier of sheet.modifiers) {
    if (!modifier.active || !modifierAppliesTo(modifier, target)) continue;
    if (modifier.unit === "pct") pct += parseNumber(modifier.value, 0);
    else flat += parseNumber(modifier.value, 0);
  }
  for (const ability of sheet.abilities || []) {
    if (ability.active !== false && ability.target && modifierAppliesTo(ability, target)) {
      flat += parseNumber(ability.value, 0);
    }
  }
  return { flat, pct };
}

function modifierAppliesTo(modifier, target) {
  if (!target) return false;
  if (Array.isArray(modifier.targets)) return modifier.targets.includes(target);
  return modifier.target === target;
}

function applyModifierTo(value, external) {
  let total = value + external.flat;
  if (external.pct) total += Math.floor((total * external.pct) / 100);
  return Math.floor(total);
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
  setCalc("cargo-max", `${formatNumber(calc.cargoMax)} kg`);
  setCalc("cargo-current", `${formatNumber(calc.totalWeight)} kg`);
  document.querySelectorAll("[data-calc='cargo-current']").forEach((node) => {
    node.classList.toggle("posture-altered", calc.totalWeight > calc.cargoMax);
  });
  setCalc("overweight-penalty", calc.overweightPenalty > 0 ? `-${calc.overweightPenalty} DES` : "—");
  document.querySelectorAll("[data-calc='overweight-penalty']").forEach((node) => {
    node.classList.toggle("posture-altered", calc.overweightPenalty > 0);
  });
  setCalc("displacement", `${formatNumber(calc.displacement)} m/turno`);
  setCalc("max-speed", `${formatNumber(calc.maxSpeed)} m/s`);
  const objectWeight = parseNumber(state.statObjectWeight, 0);
  setCalc("weight-damage", objectWeight > 0 ? `${weightDamageDice(objectWeight)}d6 + ${signed(calc.attrMods.strength)}` : "—");
  setCalc("throw-distance", objectWeight > 0 ? `${formatNumber(throwDistance(objectWeight, calc.cargoMax))} m` : "—");
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
  const damage = cleanWikiText(extractDamageFromRow(row));
  sheet.inventory.push({
    id: uid(),
    name: cleanWikiText(row.Nome || "Item"),
    quantity: 1,
    equipped: Boolean(detected.target),
    target: detected.target,
    value: detected.value,
    damage,
    damageAttr: detectDamageAttr(`${damage} ${row["Escala com"] || ""}`),
    weight: parseNumber(row.Peso, 0),
    note: cleanWikiText(row.Bônus || row.Efeito || row.Observações || ""),
    source: DATA_SOURCES[sourceKey]?.label || "Wiki",
    enchantments: [],
  });
  touchAndRender(sheet);
}

function extractDamageFromRow(row) {
  const direct = row["Dano base"] || row.Dano || "";
  if (direct) return direct;
  const bonus = (row.Bônus || "").trim();
  return /^(?:\d+d\d+|\+?\d+\s*de\s+dano)/i.test(bonus) ? bonus : "";
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
  const bonus = cleanWikiText(row.Bônus || "");
  const detected = detectAbilityModifier(row);
  sheet.abilities.push({
    id: uid(),
    name: cleanWikiText(row.Nome || type),
    type,
    cost: row["Custo base"] || row.Custo || "",
    range: row.Alcance || "",
    damage: extractDamageFromRow(row),
    bonus,
    note: cleanWikiText(row.Descrição || row.Efeito || row["Efeito secundário"] || row.Observações || ""),
    target: detected.target,
    value: detected.value,
    active: Boolean(detected.target),
    source: DATA_SOURCES[sourceKey]?.label || "Wiki",
  });
  touchAndRender(sheet);
}

function detectAbilityModifier(row) {
  return detectBonusModifier(row.Bônus || "");
}

function detectBonusModifier(text) {
  const normalized = normalizeText(text);
  const valueNear = (keyword) => {
    const index = normalized.indexOf(keyword);
    if (index < 0) return null;
    const window = text.slice(Math.max(0, index - 30), index + 30);
    const numbers = window.match(/[+-]?\d+(?:[.,]\d+)?/g) || [];
    if (!numbers.length) return null;
    const signed = numbers.find((value) => /^[+-]/.test(value)) || numbers[0];
    return parseNumber(signed);
  };
  const attrMatch = String(text).match(/[+-]?\d+(?:[.,]\d+)?\s*(?:de\s*)?(força|destreza|constituição|inteligência|sabedoria|carisma)/i);
  if (attrMatch) {
    const key = { forca: "strength", destreza: "dexterity", constituicao: "constitution", inteligencia: "intelligence", sabedoria: "wisdom", carisma: "charisma" }[normalizeText(attrMatch[1])];
    return { target: `attr:${key}`, value: parseNumber(attrMatch[0]) };
  }
  const match = (keyword, target) => {
    const value = valueNear(keyword);
    return value === null ? null : { target, value };
  };
  return (
    match("percepcao", "skill:percepcao") ||
    match("reflexos", "skill:reflexos") ||
    match("esquiva", "skill:reflexos") ||
    match("iniciativa", "skill:iniciativa") ||
    match("vontade", "skill:vontade") ||
    match("atletismo", "skill:atletismo") ||
    match("escalada", "skill:atletismo") ||
    match("furtividade", "skill:furtividade") ||
    match("defesa", "res:defense") ||
    match("deslocamento", "misc:displacement") ||
    match("pv", "res:hp") ||
    match("vida", "res:hp") ||
    { target: "", value: 0 }
  );
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

  return detectBonusModifier(`${row.Bônus || ""}`);
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
  return stripEmoji(value)
    .replace(/\s*\([^)]*\.html\)/g, "")
    .replace(/\s*Sem título\s*\([^)]*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripEmoji(value) {
  return String(value || "")
    .replace(EMOJI_PATTERN, "")
    .replace(/[\uFE0E\uFE0F\u200D]/g, "")
    .replace(/\s{2,}/g, " ");
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
