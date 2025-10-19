# 🚀 Projeto: Jogo 2D de Naves — Comparativo entre IAs

## 🧩 Descrição Geral
Este projeto apresenta **duas versões de um jogo 2D de naves espaciais**, desenvolvidas por **duas Inteligências Artificiais diferentes**, com o objetivo de comparar a qualidade, a estrutura e o estilo de implementação de cada uma.

Cada versão possui seus próprios arquivos `index.html`, `main.js` e eventuais pastas de recursos (`assets/`), organizadas em diretórios separados.

O jogo consiste em controlar uma nave espacial para **destruir inimigos** e **acumular pontuação**, com movimentação livre dentro da tela e um sistema simples de **Game Over** ao colidir com inimigos.

---

## 🕹️ Estrutura do Projeto
```
/assets/
│
├── /CHATGPT/
│   ├── index.html
│   ├── main.js
│   ├── style.css
│   └── assets/
│
├── /GEMINI/
│   ├── index.html
│   ├── main.js
│   ├── style.css
│   └── assets/
│
└── README.md
```

---

## 🌌 Versão 1 — *Void Squadron*
**Arquivos:** `index.html` e `main.js` correspondentes à primeira IA.

### 🎮 Descrição
Esta versão, chamada **Void Squadron**, apresenta uma implementação **mais simples e direta**, com:
- Movimentação via **WASD** ou **setas**;
- Sistema de **disparo com espaço**;
- Fundo com **camadas de estrelas em parallax**;
- **Game Over** automático com reinício após alguns segundos;
- Sprites fixos para jogador, inimigos e projéteis.

### 🧠 Destaques Técnicos
- Estrutura baseada em **objetos simples** (`player`, `enemies`, `bullets`);
- Loop de jogo contínuo via `requestAnimationFrame`;
- Controle de animação básico nos motores da nave e projéteis;
- Função `triggerGameOver()` com temporizador automático para reiniciar.

---

## 🌠 Versão 2 — *Galactic Defender*
**Arquivos:** `index.html` e `main.js` correspondentes à segunda IA.

### 🎮 Descrição
A segunda IA desenvolveu uma versão mais elaborada chamada **Galactic Defender**, com:
- Sistema de **entidades com classes** (`Player`, `Enemy`, `Projectile`);
- **Carregamento dinâmico de ativos** (imagens e sons);
- Parallax com múltiplas camadas animadas;
- Sistema de **spawn progressivo de inimigos**;
- HUD com **pontuação e estado do jogo**;
- Mensagem de **"FIM DE JOGO"** e controle de estados (`LOADING`, `PLAYING`, `GAME_OVER`).

### 🧠 Destaques Técnicos
- Uso de **orientação a objetos** e herança (`Entity` como base);
- **Controle adaptativo de spawn** de inimigos;
- Sistema de colisão **AABB (Axis-Aligned Bounding Box)**;
- Modularização mais robusta e escalável.

---

## ⚙️ Como Executar
1. Baixe o repositório ou clone-o:
   ```bash
   git clone https://github.com/seuusuario/projeto-naves.git
   ```
2. Abra o diretório do projeto e escolha qual IA testar:
   - `CHATGPT/index.html` → Void Squadron  
   - `GEMINI/index.html` → Galactic Defender
3. Clique duas vezes no arquivo `index.html` ou sirva o diretório com um servidor local:
   ```bash
   npx serve
   ```
4. Jogue diretamente no navegador! 🌠

---

## 🎯 Controles
| Ação | Tecla |
|------|--------|
| Mover para cima | **W** ou **↑** |
| Mover para baixo | **S** ou **↓** |
| Mover para esquerda | **A** ou **←** |
| Mover para direita | **D** ou **→** |
| Atirar | **Espaço** |

---

## 🧪 Comparativo entre IAs

| Critério | Void Squadron (ChatGPT) | Galactic Defender (Gemini) |
|-----------|----------------------|---------------------------|
| Estrutura de Código | Simples e direta | Orientada a objetos |
| Efeitos Visuais | Fundo com parallax | Fundo com partículas e camadas |
| Sons | Não possui | Possui som de tiro |
| Dificuldade Progressiva | Constante | Spawn acelerado de inimigos |
| Sistema de Pontuação | Simples | Com HUD e estados de jogo |
| Complexidade Geral | Média | Alta |

---

## 💬 Conclusão
Ambas as versões cumprem o objetivo de criar um **jogo funcional de nave 2D**, mas demonstram **abordagens distintas de desenvolvimento**:

- A **ChatGPT (Void Squadron)** prioriza **simplicidade, fluidez e clareza**;
- A **Gemini (Galactic Defender)** entrega uma **estrutura mais robusta, modular e expansível**, com melhor organização de código.

---

## 🧑‍💻 Autores do Projeto
**Allan de Loreto Chang, Renzo Faedda Panza**
Trabalho acadêmico comparativo sobre o uso de **Inteligências Artificiais na geração de código de jogos 2D**.
