# BOREAL-7 — O Sinal Aprende

Um jogo de **terror psicológico 3D em primeira pessoa**, feito para rodar direto no navegador com **Three.js (via CDN)** e publicado sem build no **GitHub Pages**.

> Você acorda trancado no subsolo da **Estação Boreal-7**, uma antiga estação de pesquisas meteorológicas e transmissões de rádio abandonada nos anos 80.
> A equipe científica captou um sinal anômalo — e algo entrou na estação junto com ele.
> Encontre os **4 registros** da equipe, descubra os quatro dígitos do código de emergência e escape **antes que o Sinal alcance você**.

**Jogue em:** `https://sitesforschoolfr.github.io/A/`

---

## Conteúdo

- [Como executar](#como-executar)
- [Controles](#controles)
- [Mecânicas](#mecânicas)
- [A Estação](#a-estação)
- [Recursos técnicos](#recursos-técnicos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Deploy no GitHub Pages](#deploy-no-github-pages)
- [Avisos e solução de problemas](#avisos-e-solução-de-problemas)

---

## Como executar

O jogo é 100% estático (HTML + CSS + JavaScript) e não exige `npm`, build ou servidor de aplicação — mas **precisa ser servido por HTTP**, pois usa módulos ES e import maps.

```bash
# na raiz do repositório
python3 -m http.server 8000
# abra http://localhost:8000
```

Alternativas: `npx serve .`, a extensão Live Server do VS Code, ou qualquer hospedagem estática (GitHub Pages, Netlify, Vercel).

> Abrir `index.html` diretamente com `file://` não funciona: o navegador bloqueia o carregamento dos módulos ES e da CDN.

Requisitos: navegador moderno com **WebGL 2** (Chrome/Edge, Firefox, Safari recentes) e teclado + mouse. Recomenda-se fone de ouvido.

---

## Controles

| Tecla / ação | Função |
| --- | --- |
| `W` `A` `S` `D` | Mover |
| `Mouse` | Olhar ao redor (Pointer Lock) |
| `Shift` | Correr |
| `E` / clique | Interagir, ler registros, usar painel |
| `F` | Ligar/desligar a lanterna (recarrega com ela desligada) |
| `Tab` | Abrir/fechar o arquivo de registros |
| `Esc` | Pausar / fechar painéis |

Em pré-visualizações embutidas em iframe, onde o navegador pode bloquear a captura do mouse, o jogo ativa automaticamente um **modo de mouse livre** (mova o cursor para olhar, `E`/clique para interagir).

---

## Mecânicas

### Registros e o código
- Há **4 registros** espalhados pela estação: duas fitas cassete e dois diários.
- Basta aproximar-se e pressionar `E` (ou clicar) para pausar o jogo e ler a transcrição datilografada.
- Cada registro revela **um dígito** do código de evacuação, na ordem do arquivo (1 a 4).
- Consulte o **Arquivo (`Tab`)** a qualquer momento: ele lista os registros recuperados, seus dígitos e o último local conhecido dos que faltam.
- Com os quatro dígitos em mãos, use o **painel ao lado da porta de emergência** para abrir a saída.

### Bateria da lanterna
- A lanterna drena a bateria enquanto está ligada e a **recarrega lentamente quando desligada** (`F`).
- A luz é a sua única defesa: o Sinal **congela** quando está sob o facho, mas isso consome bateria mais rápido.
- Com a bateria vazia, o corredor fica realmente escuro — e o Sinal fica mais rápido.
- Errar o código no painel também **atrai** a entidade.

### O Sinal
- Acorda após o primeiro registro recuperado e passa a caçar o jogador pelo **grafo de caminhos** da estação.
- Move-se mais rápido quando **não é observado**; desacelera quando está no seu campo de visão e quase para sob a luz da lanterna.
- Fica mais agressivo a cada registro recuperado. A sala de emergência é um abrigo temporário apenas no começo.
- Encostar nele é fatal.

---

## A Estação

O subsolo foi construído com geometria 3D e texturas procedurais:

- Corredor central com tubulações, vigas, poças e placas de sinalização;
- **Sala de Controle** — consoles, monitores de fósforo verde, mapa da estação, arquivos;
- **Sala de Rádio** — racks de transmissão, gravadores, antenas;
- **Dormitório** — beliches, armários, mesa de anotações;
- **Depósito** — estantes, caixas, riscos na parede;
- **Geradores** — máquinas mortas, painel elétrico derretido, tambores;
- **Sala de Emergência** — ponto de partida, com a porta trancada e o painel de código.

Atmosfera: `FogExp2` densa, lanternas de emergência vermelhas pulsando, lâmpadas fluorescentes falhando, partículas de poeira, granulação de filme, vinheta e estática que aumenta perto do Sinal. O áudio (drone, zumbido, passos, batimentos, chiado, sussurros) é **inteiramente sintetizado com WebAudio** — nenhum arquivo de som externo.

---

## Recursos técnicos

- **Three.js r160** via CDN com `importmap` (`three` + `three/addons/`).
- **PointerLockControls** para a câmera em primeira pessoa, com fallback de mouse livre.
- Lanterna = `SpotLight` presa à câmera, com sombras (shadow map) e flicker dinâmico.
- **Texturas 100% procedurais** desenhadas em `<canvas>` (concreto, piso, metal, madeira, placas, telas CRT, mapa, cartazes).
- Colisão por **AABB** com resolução por eixo e raio do jogador.
- IA da entidade com **BFS em grafo de waypoints**, linha de visão por raycast contra as paredes e estados de perseguição/frenagem.
- **Áudio procedural** com WebAudio (osciladores, ruído, filtros e envelopes).
- Interface em HTML/CSS puro, com HUD, leitor de documentos, teclado, arquivo, pausa, game over e final.
- Sem dependências de build, sem bundler, sem assets binários obrigatórios.

---

## Estrutura do projeto

```
.
├── index.html              # estrutura, telas, HUD e importmap da CDN
├── style.css               # direção de arte da interface e efeitos de tela
├── script.js               # motor do jogo, mundo 3D, IA, áudio e narrativa
├── assets/
│   └── title-bg.jpg        # arte atmosférica da tela inicial
├── .nojekyll               # impede o processamento Jekyll no GitHub Pages
└── README.md
```

Todo o jogo está concentrado em `script.js`, organizado em seções numeradas (dados, áudio, texturas, mundo, entidade, jogador/UI, loop).

---

## Deploy no GitHub Pages

1. Envie os arquivos para a branch `main`.
2. No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Selecione **`main`** e a pasta **`/ (root)`**; salve.
4. Aguarde a publicação e acesse `https://<usuario>.github.io/<repositorio>/`.

Ou via GitHub CLI:

```bash
gh api -X POST repos/{owner}/{repo}/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

O projeto não precisa de workflow de CI: é estático. Como o Three.js vem de CDN, a página exige conexão com a internet.

---

## Avisos e solução de problemas

- **Luzes piscando e sons intensos**: o jogo contém flashes vermelhos, estática e áudio abrupto. Se necessário, desative o som do sistema.
- **Tela preta / "Falha de sinal"**: a CDN do Three.js não carregou. Verifique a conexão, bloqueadores de script ou tente recarregar.
- **O mouse não é capturado**: alguns iframes e políticas de navegador bloqueiam o Pointer Lock. O jogo ativa o modo de mouse livre automaticamente. Em página própria, clique na cena para tentar novamente.
- **Sem áudio**: navegadores só liberam áudio após uma interação — o som inicia ao clicar em **Iniciar Investigação**.
- **Desempenho**: o jogo limita o pixel ratio e usa sombras apenas na lanterna. Em máquinas modestas, reduza o zoom da janela ou feche outras abas com WebGL.

---

## Créditos

- Narrativa, level design, código e trilha sonora procedural: projeto original deste repositório.
- [Three.js](https://threejs.org/) — MIT License.
- Fontes do sistema (Courier New / monoespaçadas) — sem dependências externas de tipografia.

**Boa sorte no subsolo. Não responda ao rádio.**
