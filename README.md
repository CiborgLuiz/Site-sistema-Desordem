# DESORDEM — fichas, campanhas e laboratório de combate

Aplicação web do sistema de RPG Desordem. A ficha calcula atributos, perícias, recursos, posturas, subclasses, equipamentos, magias e técnicas de Ki. O projeto também organiza fichas em campanhas compartilhadas e oferece simulações em dois times.

## O que existe hoje

- Fichas sincronizadas pelo Supabase, com fallback local.
- 4 classes, subclasses por nível e Restrição Celestial com pontos extras de atributo.
- 30 perícias: qualquer teste usa `1d20 + perícia` contra a Defesa/CD definida pelo mestre.
- Biblioteca de 292 equipamentos, 26 magias arcanas e 29 técnicas de Ki.
- Poderes especiais mantidos como conteúdo do mestre, fora das fichas dos jogadores e da simulação.
- Posturas jogáveis na ficha: Neutra, Ofensiva e Defensiva. Postura é ação Livre no início do turno e só pode mudar uma vez.
- Economia de turno: 1 Ação Principal, 1 Secundária e 1 de Movimento. O jogador pode agir em qualquer ordem, não precisa gastar tudo e pode trocar a Principal por outra ação.
- Campanhas: criar, abrir, mover fichas e excluir campanha; ao excluir, as fichas voltam para “sem campanha”.
- Simulação no topo do site: Time 1 contra Time 2, qualquer quantidade de combatentes, fichas repetidas, fichas existentes ou aleatórias por nível.
- Relatório da simulação com vitórias, derrotas, empates, iniciativa, acertos, críticos, dano, rodadas, sobreviventes e combinações vencedoras.

## Regras operacionais resumidas

Magias e técnicas de Ki são Ação Principal. Posturas são Livre no início do turno. 20 natural dobra os dados de dano; empate favorece jogadores em PvE e o atacante em PvP; resistência reduz 50% e imunidade anula o tipo de dano. Sanidade, Energia Física e duração de condições são administradas narrativamente pelo mestre.

## Perícias

As perícias são ferramentas gerais de teste, não apenas ações de combate. O atributo associado define o modificador.

| Atributo | Perícias |
|---|---|
| Força | Luta, Atletismo |
| Destreza | Reflexos, Furtividade, Acrobacia, Iniciativa, Pontaria, Ladinagem |
| Constituição | Vigor, Fortitude |
| Inteligência | Misticismo, Investigação, Conhecimento, Natureza, Ofício |
| Sabedoria | Vontade, Intuição, Percepção, Sobrevivência, Cura, Religião, Medicina, Navegação |
| Carisma | Jogatina, Persuasão, Enganação, Diplomacia, Intimidação, Adestramento de animais, Etiqueta |

Tática de Sobrevivência foi removida por sobreposição com Sobrevivência, Percepção e Navegação. Cura é voltada a primeiros socorros/ferimentos; Medicina identifica e trata doenças, condições e contaminações.

## Condições: análise, hierarquia e política atual

O catálogo possui 65 registros após a remoção da duplicata literal de **Silenciado**.

Na wiki, a lista é apresentada em ordem de consulta: condições comuns aparecem primeiro; em seguida, as demais são agrupadas por família (controle de ação, dano contínuo, posição/movimento, percepção/mente, recursos, físicas/campanha, narrativas/poder, extrema e especial). A coluna **Hierarquia** é um identificador visual de severidade — Comum, Leve, Média, Pesada, Extrema ou Especial — e não altera a regra por si só.

As condições não precisam ser todas removidas: muitas representam fontes diferentes de decisão. Porém, devem ser organizadas em famílias para reduzir confusão:

- **Controle de ação:** Atordoado, Colapsado, Dominado, Hipnotizado, Sono, Imobilizado, Silenciado.
- **Percepção/mente:** Cego, Visão Dupla, Desorientado, Alucinado, Confuso, Paranoico, Pânico, Apático, Quebrado Mentalmente.
- **Dano contínuo:** Queimando, Envenenado, Sangramento, Sangramento Interno, Asfixiado, Corpo/fluxo corrompido.
- **Movimento/posição:** Caído, Enraizado, Ancorado, Deslocado, Gravidade Alterada, Flanqueado, Exposto, Guarda Quebrada.
- **Recursos:** Fome, Desidratado, Fome de Mana, Fome de Ki, Drenado, Sobrecarga Mágica, Vazio Arcano, Excesso de Ki.
- **Narrativas/poder:** Instável, Marca do Caos, Eco Temporal, Eco Arcano, Corrompido, Alma Fragmentada, Possuído.

### Redundâncias que devem ser fundidas ou hierarquizadas

- Cego e Visão Dupla: manter ambos apenas se Cego for controle pesado e Visão Dupla for penalidade leve.
- Atordoado, Colapsado e Quebrado Mentalmente: criar uma escala de perda de ação em vez de três efeitos que removem agência de forma parecida.
- Dominado e Hipnotizado: Hipnotizado deve ser comando limitado; Dominado, controle total e raro.
- Esgotado e Exausto: manter um como penalidade moderada e outro como estágio grave acumulável.
- Fome, Fome de Mana e Fome de Ki: manter a família, mas usar o mesmo modelo de drenagem.
- Sangramento e Sangramento Interno: diferenciar dano visível leve de lesão grave com cura reduzida.
- Confuso, Paranoico e Alucinado: diferenciar alvo/decisão, cooperação e percepção; caso contrário, fundir em uma progressão mental.

### Condições que faltam

Não é necessário criar dezenas de novas condições. As lacunas mais úteis são:

- **Amedrontado:** penalidade de aproximação/ataque contra a fonte, sem remover o turno.
- **Abençoado/Protegido:** condição positiva simples para bônus temporário, caso o jogo precise registrar bênçãos.
- **Amaldiçoado:** marcador narrativo/mecânico para efeitos persistentes que não são apenas Corrupção.
- **Concentrando:** condição que identifica manutenção de magia/técnica e o que acontece ao sofrer dano.

Essas quatro só devem ser adicionadas se aparecerem em poderes reais. Não criar condições apenas para aumentar o catálogo.

Quando duas condições cumprem a mesma função, use a hierarquia para escolher um único estágio (por exemplo, Hipnotizado antes de Dominado) em vez de empilhar penalidades equivalentes. A duração, a remoção e a transição entre estágios continuam sob decisão do mestre conforme a cena.

## Campanhas e sincronização

Campanhas e fichas usam a API Express em `/api`, com Supabase como persistência. A aplicação sincroniza periodicamente e também possui botão manual “Atualizar”. O vínculo da campanha fica dentro da ficha, com `campaignId` e `campaignName`, para permitir reconstrução segura em outro dispositivo.

### Supabase

Execute `setup-supabase.sql` no SQL Editor. O script cria `sheets`, `campaigns`, `deleted_sheets`, índices, triggers e políticas RLS. Depois faça redeploy para que os endpoints de campanha estejam disponíveis.

Endpoints de campanha:

- `GET /api/campaigns`
- `POST /api/campaigns/:id`
- `PUT /api/campaigns/:id`
- `DELETE /api/campaigns/:id` — libera automaticamente as fichas associadas.

## Desenvolvimento local

Requer Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm start
```

Variáveis:

```env
DESORDEM_SUPABASE_URL=https://seu-projeto.supabase.co
DESORDEM_SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
DESORDEM_SUPABASE_ANON_KEY=sua-chave-anonima
PORT=3000
```

Os nomes antigos `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_ANON_KEY` continuam aceitos.

## Testes e auditoria

```bash
node --check app.js
node --check server.js
node test-selfcheck.js
node tools/playtest-1000.js
```

## Estrutura

```text
app.js                 # interface, ficha, campanhas e simulação
server.js              # API Express + Supabase
api/[...path].js       # entrada serverless da Vercel
styles.css             # interface
setup-supabase.sql     # schema, RLS e triggers
tools/playtest-1000.js # bateria determinística de duelos
Sistema/               # wiki e catálogos CSV/HTML
```
