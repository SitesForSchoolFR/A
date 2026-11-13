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
- [Modo leve e Xbox](#modo-leve-e-xbox)
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
- **Sem dependências de build para jogar**: o site usa `script.min.js` + `style.min.css`; os fontes `script.js`/`style.css` ficam no repositório para manutenção.
- **Orçamento de qualidade** (`QUALITY`): modo alto e modo leve compartilham a mesma lógica de jogo, mudando apenas o custo gráfico (resolução, texturas, luzes, partículas e sombras).

---

## Modo leve e Xbox

O jogo foi endurecido para rodar em **Edge no Xbox Series S** e em máquinas com pouca memória de vídeo, onde o navegador pode encerrar a página com erros como `SBOX_MEMORY_EXCEEDED`. O modo leve é ativado sozinho quando detecta **Xbox**, celular/tablet, `deviceMemory <= 4 GB` ou `hardwareConcurrency <= 4`.

O que muda no modo leve:

| Recurso | Qualidade alta | Modo leve |
| --- | --- | --- |
| Framebuffer / pixel ratio | até 1.35, máx. 2560 px | **1.0, máx. 1920 px** |
| Antialias / contexto | ligado / `high-performance` | desligado / `low-power` |
| Texturas procedurais | 100% | **50%** (metade de cada eixo) |
| Mipmaps / anisotropia | sim / 4× | não / 2× |
| Luzes pontuais | 9 | **5** (as distantes continuam acesas em emissivo + sprite) |
| Poeira / aura | 800 / 220 partículas | **260 / 90** |
| Sombras da lanterna | 1024 px, todo frame | **512 px, a cada 2 frames** |
| Ruído SVG, estática e desfoques de CSS | ligados | **desligados** |
| Fundo animado das telas | ligado | **desligado** |

O cenário, a história, a HUD, a IA, o áudio e o final **não mudam**. Para alternar manualmente, use o botão da tela inicial ou acrescente à URL:

```
?quality=low    # força o modo leve
?quality=high   # força a qualidade alta
```

A escolha é aplicada ao recarregar a página. Se o jogo ainda ficar pesado no Xbox, tente fechar outras abas/streaming em segundo plano, usar a janela inteira (não o modo Snap) e manter `?quality=low`.

---

## Estrutura do projeto

```
.
├── index.html              # estrutura, telas, HUD, importmap e detecção do modo leve
├── style.min.css           # CSS minificado usado pelo site
├── script.min.js           # JS minificado usado pelo site
├── style.css               # fonte comentada da interface
├── script.js               # fonte comentada do motor, mundo 3D, IA, áudio e narrativa
├── build.sh                # regenera os .min (terser + csso)
├── assets/
│   └── title-bg.webp       # arte atmosférica da tela inicial (66 KB)
├── .nojekyll               # impede o processamento Jekyll no GitHub Pages
└── README.md
```

Todo o jogo está concentrado em `script.js`, organizado em seções numeradas (dados, áudio, texturas, mundo, entidade, jogador/UI, loop). Depois de editar os fontes, rode `./build.sh` para atualizar `script.min.js` e `style.min.css`; sem isso, o site continua servindo a versão minificada antiga.

Tamanhos atuais (aprox.): `script.min.js` 77 KB, `style.min.css` 25 KB, `index.html` 16 KB, `assets/title-bg.webp` 66 KB — **~186 KB no total**, contra ~400 KB da versão anterior.

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
- **Desempenho / Xbox / `SBOX_MEMORY_EXCEEDED`**: o jogo detecta Xbox e ativa o modo leve automaticamente. Se ainda aparecer erro de memória, abra `?quality=low`, feche outras abas com WebGL e evite janelas muito grandes. Detalhes na seção [Modo leve e Xbox](#modo-leve-e-xbox).

---

## Créditos

- Narrativa, level design, código e trilha sonora procedural: projeto original deste repositório.
- [Three.js](https://threejs.org/) — MIT License.
- Fontes do sistema (Courier New / monoespaçadas) — sem dependências externas de tipografia.

**Boa sorte no subsolo. Não responda ao rádio.**
