# Auditoria atualizada e playtest do sistema DESORDEM

## Veredito

**Prontidão atual: 6,8/10.** O projeto já possui ficha funcional, criação com derivados calculados, biblioteca de itens/magias/técnicas, subclasses, posturas e aba de simulação reproduzível. A ficha é a autoridade operacional: distribui atributos, calcula Defesa e recursos e registra modificadores.

As regras de mesa consideradas são: `1d20 + perícia` contra Defesa/CD; empate favorece jogadores em PvE e o atacante em PvP; 20 natural dobra os dados de dano; resistência reduz 50%; imunidade anula o tipo; condições, Sanidade e Energia Física são narrativas; AM e Refino multiplicam dano/área/custo até o valor disponível, com recuperação narrativa após abuso.

O risco atual é estrutural: muitos poderes existem apenas em texto, sem CD, alvo, área, ação, manutenção ou contra-jogo em campos próprios. A simulação compara fichas, dano e alguns efeitos reconhecíveis, mas ainda não resolve fielmente todo controle, cura, mobilidade e narrativa.

## 1. Estado auditado

Foram verificados `app.js`, `styles.css`, `tools/playtest-1000.js`, `test-selfcheck.js` e os catálogos locais em `Sistema/DESORD...`.

| Componente | Estado atual |
|---|---|
| Criação | 70 pontos base; Restrição Celestial recebe +1 por nível |
| Derivados | Calculados pela ficha; arredondamento para baixo |
| Postura Defensiva | Somente +20% Defesa |
| Posturas padrão | Neutra, Ofensiva e Defensiva; troca no início do turno |
| Subclasses | Até 1 nível por nível de personagem; total validado |
| Recursos | Vida, Mana, Ki, Energia, Sanidade, Defesa, AM e Refino |
| Biblioteca | Itens, magias, técnicas de Ki, subclasses e encantamentos |
| Poderes adicionados | Preservam ação, duração, efeito, escalonamento, limite, risco e categoria |
| Simulação | Acesso superior ao lado de Fichas/Wiki; 1–10.000 testes, ficha existente ou inimigo hipotético |
| Teste automatizado | `node test-selfcheck.js` aprovado |

## 2. Regras normativas usadas

1. Teste geral: `1d20 + perícia` contra Defesa/CD; magia usa Misticismo.
2. Empate favorece o jogador em PvE e o atacante em PvP.
3. 20 natural é crítico e dobra os dados de dano, não o modificador.
4. Resistência reduz 50%; imunidade zera o tipo correspondente.
5. Peso pertence aos itens; itens mágicos podem alterar massa/levitação.
6. Sanidade, Energia Física e duração de condições são narrativas.
7. AM/Refino são multiplicadores escolhidos pelo jogador e limitados pela ficha.
8. Habilidades especiais são auditadas como dados, mas não entram no balanceamento automático.
9. A ficha é a autoridade de cálculo durante o jogo.

## 3. Fórmulas executadas pela ficha

`app.js` usa `floor((atributo - 10) / 2)` e limita nível entre 1 e 50.

| Derivado | Implementação |
|---|---|
| Vida | Base da classe + crescimento por nível, crescimento mínimo 1 |
| Mana | `10 + nível × (3 + Mod INT)` |
| Ki | `10 + nível × (3 + Mod SAB)` |
| Energia | Constituição total × nível; uso narrativo |
| Sanidade | `20 + Mod CAR + floor(nível/2)`; uso narrativo |
| Defesa | `10 + floor(nível/2) + Mod DES + equipamento` + modificadores |
| AM | `Mod INT + floor(nível/10)` |
| Refino | `Mod SAB + floor(nível/10)` |
| Perícia | Mod. atributo + `floor(nível/2)` +5 se treinada |
| Carga | `25 + (Mod FOR + 5) × (nível/2)` |
| Restrição Celestial | orçamento `70 + nível` |

## 4. Playtest reproduzível de 1.000 lutas

`tools/playtest-1000.js` executa 1.000 duelos determinísticos: 4 classes × 5 builds × 5 níveis × 10 confrontos. Usa dano básico abstrato, pois inimigos e todos os poderes ainda não têm schema completo. Habilidades especiais ficam fora.

| Métrica | Resultado |
|---|---:|
| Duelos | 1.000 |
| Rodadas totais/média | 3.513 / 3,51 |
| Dano total/média | 212.305 / 212,3 |
| Acertos | 6.334 |
| Críticos | 195 (3,08% dos acertos) |
| Empates por limite | 0 |

### Por classe

| Classe | Casos | Vitórias | Taxa |
|---|---:|---:|---:|
| Ki | 250 | 212 | 84,8% |
| Restrição Celestial | 250 | 200 | 80,0% |
| Mago | 250 | 180 | 72,0% |
| Híbrido | 250 | 173 | 69,2% |

A ordem é plausível: Ki tem eficiência marcial direta, Restrição Celestial tem poder bruto e mais atributos, Mago depende de Mana/AM e Híbrido troca especialização por flexibilidade. Não é prova final porque área, alcance, controle, poderes e resistências ainda são abstraídos.

### Por build

| Build | Casos | Vitórias | Taxa |
|---|---:|---:|---:|
| Defensiva | 200 | 197 | 98,5% |
| Equilibrada | 200 | 161 | 80,5% |
| Recurso | 200 | 145 | 72,5% |
| Ofensiva | 200 | 141 | 70,5% |
| Controle | 200 | 121 | 60,5% |

O resultado defensivo é um alerta de modelo, mas a postura agora só dá +20% Defesa, sem redução de dano. A vantagem vem da Defesa multiplicativa e de duelos de dano básico; deve ser reavaliada com poderes ofensivos, controle, área e múltiplos inimigos antes de qualquer nerf.

## 5. Subclasses e progressão

Cada personagem pode adquirir até um nível de subclasse por nível de personagem, e a ficha impede o total de níveis de subclasse de ultrapassar o nível do personagem. A simulação lê o total registrado e o transforma em contribuição de poder abstrata.

Isso testa a curva de investimento, mas não interpreta automaticamente cada habilidade textual. Um poder que nega ações, dá ação extra, cura, ignora Defesa ou altera resistência tem impacto maior que um bônus de dano equivalente e precisa de contrato mecânico.

Para cada subclasse, comparar níveis 0, 1, 5, 10, 25 e o máximo permitido contra o mesmo alvo e ficha-base. Registrar dano, Defesa, recursos, ações negadas, cura, mobilidade e taxa de sucesso.

## 6. Auditoria dos catálogos de poderes

| Catálogo | Registros | Cobertura atual | Lacunas principais |
|---|---:|---|---|
| Magias Arcanas | 26 | Alcance, custo, dano, duração e escalonamento | CD, teste/resistência, área, ação e contra-jogo não normalizados |
| Técnicas de Ki | 29 | Ação, custo, efeito e bônus | 15 sem alcance; 18 sem duração; 15 sem limite; 23 sem escalonamento de custo; 22 sem penalidade/risco |
| Poderes Especiais | 55 | 50 têm custo, alcance, dano, duração, efeito e escalonamento | 5 são origens narrativas sem contrato acionável; CD não é padrão |

Contrato mínimo para simulação:

`nome | fonte | tier | ação | alcance | alvo/área | custo | duração | teste/CD | sucesso | falha | dano/tipo | resistência/imunidade | limite/recarga | escalonamento | risco | contra-jogo`.

Prioridade: P0 para ação extra, negação de turno, controle mental, cura, teletransporte, ignorar Defesa, imunidade ou redução de dano; P1 para Defesa, resistência, alcance, área, custo e recuperação; P2 para dano direto e condições simples.

## 7. Poderes incorporados à ficha e à simulação

Ao adicionar um poder pela Biblioteca, a ficha preserva ação, duração, efeito mecânico, escalonamento, limite de uso, risco/penalidade e categoria, além de dano, custo, alcance e bônus.

A simulação considera poderes ativos, calcula a média dos dados e reconhece conservadoramente efeitos de defesa, cura e controle. Resistências/imunidades são aplicadas internamente sem serem reveladas ao jogador. Frases como “empurra 2 m”, “perde reação” ou “se falhar em resistência” ainda precisam de campos estruturados para serem resolvidas sem interpretação.

## 8. Melhorias práticas

### Sistema

1. Publicar uma página curta de resolução de combate.
2. Criar blocos de inimigo por nível com PV, Defesa, ataque, dano, resistências, imunidades e poderes ocultos.
3. Preencher o contrato mínimo dos poderes P0 antes de qualquer novo balanceamento.
4. Testar a postura Defensiva em lotes com controle, área, múltiplos inimigos e poderes ofensivos antes de alterar o +20%.
5. Avaliar cada subclasse nos marcos 0/1/5/10/25.
6. Separar benefício passivo, ação, reação, manutenção e consequência narrativa.

### Site

1. Mostrar campos mecânicos ausentes com o selo “incompleto para simulação”.
2. Permitir selecionar classe, subclasse, nível de subclasse e conjunto de poderes.
3. Salvar perfis de inimigos hipotéticos mantendo resistências/imunidades ocultas.
4. Exibir gráficos por lado, classe, subclasse, nível, poder, dano, cura, ações negadas e recursos.
5. Listar poderes abstraídos e o motivo.
6. Exportar configuração, semente e resultado em JSON.

### Ficha

1. Mostrar poder bruto e efetivo separadamente quando resistência/imunidade forem descobertas.
2. Registrar tipo de ação, custo, duração, CD, alvo e contra-jogo.
3. Exibir níveis de subclasse e benefícios desbloqueados por marco.
4. Manter Sanidade, Energia e condições como modificadores controlados pelo mestre.
5. Mostrar a origem de cada derivado: atributo, item, postura, subclasse, AM/Refino ou modificador manual.

## 9. Conclusão

O sistema atual já pode ser jogado e comparado com a ficha. A ordem Ki → Restrição Celestial → Mago → Híbrido é coerente como hipótese de papéis, e a Restrição Celestial agora tem sua vantagem de atributos representada na criação.

O próximo salto não é adicionar mais dano: é estruturar poderes não-danosos. Quando CD, alvo, área, ação, duração, resistência, limite e contra-jogo estiverem preenchidos, a aba de simulação poderá fazer playtests completos de magias, técnicas e subclasses.

## Fontes locais

* `app.js` — fórmulas, classes, posturas, ficha, subclasses, poderes e simulação.
* `styles.css` — apresentação da aba de simulação.
* `tools/playtest-1000.js` — bateria determinística de 1.000 duelos.
* `test-selfcheck.js` — invariantes automatizados.
* `Sistema/DESORD.../Magias/Magias Arcanas ...csv` — 26 magias.
* `Sistema/DESORD.../Magias/Técnicas de Ki ...csv` — 29 técnicas.
* `Sistema/DESORD.../Magias/Poderes Especiais ...csv` — 55 registros.
* `Sistema/DESORD.../Mecânicas/Posturas ...csv` e páginas de postura.
* `Sistema/DESORD.../Mecânicas/Recursos ...csv/html` — recursos e fórmulas.
