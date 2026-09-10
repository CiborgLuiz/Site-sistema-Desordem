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
| Simulação | Acesso superior ao lado de Fichas/Wiki; dois times, múltiplos combatentes, fichas repetidas, aleatórios por nível e relatório detalhado |
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

## 10. Revisão completa de coerência e escopo

Esta revisão considera o sistema como ele funciona hoje: ficha operacional, 4 classes, 16 subclasses, 30 perícias, 17 posturas, 292 equipamentos, 66 condições, 26 magias arcanas, 29 técnicas de Ki e 55 poderes especiais.

### Regras que precisam ser criadas

1. **Ordem de resolução de um turno.** Escrever uma sequência única: início do turno → iniciativa → manutenção → ação principal → ação secundária → movimento → fim do turno. A simulação já usa iniciativa, mas a mesa precisa saber quando postura, condição, AM/Refino e recuperação acontecem.
2. **Contrato de ataque.** Declarar qual perícia cada ataque usa, como alcance/linha de visão/cobertura funcionam, quando uma Defesa é estática ou uma CD, e como ataques contra múltiplos alvos dividem dano.
3. **Economia de ação dos poderes.** Toda magia, técnica, postura e poder deve ser Principal, Secundária, Movimento, Reação, Livre ou manutenção. Sem isso, um poder de controle pode ser mais forte que seu dano sem custo comparável.
4. **Alvos e áreas.** Criar termos padronizados: um alvo, cone, linha, raio, zona, aliado, inimigo, si mesmo. Definir como AM/Refino ampliam cada área e qual é o limite de segurança.
5. **Resistências e testes.** Cada efeito precisa declarar atributo/perícia de resistência, CD, sucesso, falha, imunidade e repetição de teste. “Falha em resistência” não pode ficar sem tipo de resistência.
6. **Recuperação e manutenção.** AM/Refino têm consequência narrativa, mas a mesa precisa de uma regra mínima de quando o recurso volta e o que significa “recuperação drasticamente reduzida”.
7. **Subclasses por marco.** Para cada uma das 16 subclasses, listar poderes nos níveis 1, 5, 10, 15, 20 e 25, dizendo se são passivos, ativáveis ou narrativos. O limite de um nível por nível de personagem já existe e deve ser exposto na ficha.
8. **Inimigos de referência.** Criar blocos oficiais de minion, padrão, elite e chefe em níveis 1, 10, 25 e 50. Sem alvos padronizados, o balanceamento entre classes e poderes não é comparável.
9. **Falha e sucesso fora de combate.** Perícias precisam de uma escala de dificuldade e consequências graduais: sucesso, sucesso parcial, falha com custo e falha crítica. Isso dá utilidade a exploração, social e investigação.

### Perícias que devem ser reorganizadas

As 23 perícias são válidas como repertório, mas há sobreposição. Recomendo manter os nomes usados pelos jogadores e reorganizar em seis famílias para evitar que o mestre crie uma CD diferente para cada sinônimo:

| Família | Perícias atuais |
|---|---|
| Física | Luta, Atletismo, Vigor, Fortitude |
| Mobilidade | Reflexos, Furtividade, Acrobacia, Iniciativa, Pontaria, Ladinagem |
| Intelecto | Misticismo, Investigação, Conhecimento |
| Instinto | Vontade, Intuição, Percepção, Sobrevivência, Tática de Sobrevivência, Cura |
| Social | Jogatina, Persuasão, Enganação, Diplomacia |
| Ofício | espaço reservado para perícias de profissão/campanha, se necessário |

Não recomendo remover perícias imediatamente. Primeiro registrar frequência de uso por sessão. Se duas perícias sempre recebem a mesma ação, atributo e CD, fundi-las ou tornar uma especialização da outra. Iniciativa, Cura e Misticismo devem permanecer separadas porque têm funções mecânicas claras; Conhecimento/Investigação e Persuasão/Enganação são os pares com maior chance de sobreposição narrativa.

### Elementos que devem ser simplificados ou removidos

* **Remover do cálculo automático qualquer efeito textual não estruturado.** O parser deve sinalizar “não resolvido”, não conceder bônus aproximado. Isso evita que palavras como “controle” e “cura” criem poder oculto.
* **Remover posturas duplicadas da lista padrão.** Neutra, Ofensiva e Defensiva são o núcleo. Guardião, Berserker, Arcana, Vampírica, Dimensional e outras devem ser desbloqueios explícitos de lore/treino, não escolhas disponíveis por acidente na ficha.
* **Separar origens narrativas de poderes acionáveis.** Demônio Selado, Liberdade de Destino e Poder Anômalo Flagelado não devem ocupar o mesmo seletor de uma magia com custo e dano.
* **Não transformar Sanidade, Energia ou duração narrativa em uma segunda economia rígida.** Manter os campos na ficha e os modificadores manuais, mas evitar mais fórmulas automáticas.
* **Remover colunas vazias dos catálogos somente depois da migração.** Antes, preencher o contrato mínimo; depois, esconder campos que não fazem sentido para aquele tipo de poder.
* **Evitar poder especial “genérico” sem risco mensurável.** Se continuar narrativo, marcar como Origem/Arco e impedir que entre no ranking de combate.

### O que não deve ser removido

* A distinção Mana/Ki/Híbrido/Restrição Celestial, porque cria identidades de jogo diferentes.
* A Restrição Celestial com pontos extras, desde que o custo seja a ausência de Mana/Ki e isso seja testado contra subclasses equivalentes.
* Postura livre no início do turno, porque cria decisão tática sem adicionar contabilidade pesada.
* Equipamentos e peso, porque dão contexto de exploração; apenas itens inválidos devem ser bloqueados.
* Condições narrativas, desde que cada condição tenha uma frase de efeito, contra-jogo e indicação de quem decide sua duração.

### Ordem recomendada de trabalho

**P0 — coerência:** contrato de turno, ataque, ação, alvo, resistência, CD e inimigos de referência.

**P1 — conteúdo:** preencher os campos dos poderes P0, mapear os marcos das subclasses e testar os 17 arquétipos de postura.

**P2 — redução de complexidade:** medir uso das 23 perícias, fundir sinônimos, separar origens narrativas e esconder campos não aplicáveis.

**P3 — balanceamento:** executar lotes de 1.000 combates por nível, composição e subclasse usando os mesmos inimigos de referência; comparar taxa de vitória, duração, dano, controle, cura, recursos e ações negadas.

### Critério de sistema “coerente”

O sistema estará coerente quando um mestre diferente conseguir responder, sem improvisar uma regra nova: “o que faço neste turno?”, “qual perícia rolo?”, “qual CD uso?”, “quanto custa?”, “quanto dura?”, “qual é o contra-jogo?” e “como comparo este poder com outro do mesmo tier?”. A ficha e a simulação devem então consumir os mesmos campos, enquanto decisões de lore continuam explicitamente narrativas.

## 11. Decisões incorporadas nesta versão

* Toda magia e técnica de Ki adicionada à ficha recebe **Ação Principal** como termo padronizado.
* O turno passa a ser apresentado na ficha como 1 Ação Principal, 1 Ação Secundária e 1 Ação de Movimento; o jogador pode agir em qualquer ordem, não precisa gastar tudo e pode trocar a Principal por outra ação.
* A postura é uma **Ação Livre no início do turno** e só pode ser trocada uma vez nesse início. A ficha continua oferecendo apenas Neutra, Ofensiva e Defensiva; as demais permanecem conteúdo do livro/desbloqueios do mestre.
* Tática de Sobrevivência foi removida da lista de perícias. As outras perícias continuam servindo para qualquer teste que o mestre determinar, sempre usando o atributo associado.
* Poderes Especiais não entram na ficha dos jogadores, na simulação nem no balanceamento; continuam conteúdo de uso exclusivo do mestre.
* Campanhas foram adicionadas à área de Fichas. É possível criar uma campanha, abrir sua visão, mover fichas para ela e manter fichas sem campanha separadas.

### Economia de ações vigente

Cada personagem tem uma Ação Principal, uma Ação Secundária e uma Ação de Movimento. A ordem é escolhida pelo jogador; nenhuma ação é obrigatória; a Principal pode ser convertida em outra ação quando a ficção exigir (por exemplo, usar Principal + Movimento para correr). Magias e técnicas de Ki são Principal. Postura é Livre no início do turno e só pode mudar uma vez nesse momento.

As campanhas são organização de dados, não uma nova regra de personagem: uma ficha pode pertencer a uma campanha ou ficar independente, e a mesma ficha continua podendo ser usada na simulação como membro repetido de um time.

## 12. Auditoria atual das condições

O catálogo continha 66 registros e uma duplicata literal de **Silenciado**; a duplicata foi removida, deixando 65 condições. O restante não é automaticamente “excesso”: condições de controle, percepção, dano, movimento, recursos e narrativa cumprem funções diferentes, mas algumas precisam de hierarquia para não disputarem o mesmo espaço.

### Redundâncias e decisão recomendada

| Grupo | Condições | Decisão |
|---|---|---|
| Visão | Cego, Visão Dupla | Manter as duas apenas como pesada versus leve |
| Perda de agência | Atordoado, Colapsado, Quebrado Mentalmente | Escalonar; não permitir que todas removam o turno inteiro |
| Controle mental | Dominado, Hipnotizado | Hipnotizado = comando limitado; Dominado = controle total raro |
| Exaustão | Esgotado, Exausto | Moderado versus grave; evitar penalidades duplicadas |
| Fome/recurso | Fome, Fome de Mana, Fome de Ki | Manter família com o mesmo modelo de drenagem |
| Percepção/mente | Confuso, Paranoico, Alucinado | Diferenciar alvo, cooperação e percepção |
| Sangramento | Sangramento, Sangramento Interno | Visível leve versus grave com cura reduzida |

Condições adicionais só são necessárias quando um poder real precisar delas. As quatro lacunas mais úteis são Amedrontado, Abençoado/Protegido, Amaldiçoado e Concentrando. Não vale aumentar o catálogo sem uma habilidade que use cada estado.

Sanidade, Energia Física e duração continuam narrativas: o mestre define perda, duração e remoção; a ficha apenas registra modificadores e valores atuais.

## 13. Nota do sistema atual — hierarquia de condições

Esta revisão transforma a organização das condições em uma ferramenta de leitura da wiki, não em uma nova camada obrigatória de regras. A ordem exibida agora prioriza os estados mais comuns e agrupa os demais por função; a coluna **Hierarquia** identifica a intensidade esperada do efeito e a coluna **Família** indica com quais estados ele deve ser comparado.

O uso recomendado é aplicar um único estágio por função: um alvo pode subir de Hipnotizado para Dominado, mas não deve receber os dois controles simultaneamente só para somar penalidades. O mesmo vale para Cego/Visão Dupla, Esgotado/Exausto, Sangramento/Sangramento Interno e Fome/Fome de Mana/Fome de Ki. Isso reduz combinações acidentais sem tirar do mestre a decisão narrativa de duração, remoção e agravamento.

As etiquetas Comum, Leve, Média, Pesada, Extrema e Especial são referências de impacto para criação e revisão de poderes. Elas não substituem resistência, imunidade, testes, custos ou contra-jogo. Toda nova condição deve entrar na wiki somente quando existir um poder, item ou cena que realmente a utilize, com efeito, remoção, duração narrativa e família definidos.
