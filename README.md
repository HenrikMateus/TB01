# JOGO DE DAMAS - DOCUMENTAÇÃO DO PROJETO

**Autor:**  
MATEUS HENRIQUE SANTOS ALMEIDA

## Instruções de Execução:

1. Certifique-se de ter um navegador moderno instalado (Chrome, Firefox, Edge etc.)
2. Baixe os arquivos do projeto (index.html, style.css e script.js)
3. Salve todos os arquivos na mesma pasta
4. Abra o arquivo `index.html` no navegador
5. A interface do jogo será exibida automaticamente

## Ferramentas Utilizadas:

- **Linguagens:**
  - HTML5
  - CSS3
  - JavaScript (ES6)

- **Tecnologias:**
  - Canvas API para renderização do tabuleiro
  - Flexbox para layout responsivo
  - Media Queries para adaptação a diferentes telas

## Funcionalidades Implementadas:

- Tabuleiro de damas 8x8 com 12 peças para cada jogador
- Sistema de turnos alternados (peças vermelhas começam)
- Movimentação válida de peças comuns e damas
- Captura obrigatória (incluindo capturas múltiplas)
- Promoção a dama ao alcançar a última linha
- Regras oficiais de empate implementadas
- Modo jogador vs IA
- Design responsivo que funciona em dispositivos móveis
- Animações visuais para capturas e promoções
- Sistema de reinício de partida

## Descrição Geral: 

Este projeto consiste em uma implementação fiel do clássico jogo de damas internacional, com todas as regras oficiais. Desenvolvido como parte de estudos em programação web, o jogo demonstra conceitos avançados de:
- Manipulação do DOM
- Renderização com Canvas
- Lógica de jogos de tabuleiro
- Inteligência Artificial básica
- Design responsivo

## Objetivo: 

Criar uma experiência autêntica do jogo de damas que possa ser jogada contra a máquina ou entre dois jogadores humanos, com todas as mecânicas oficiais corretamente implementadas.

## Estrutura do Projeto:

- `index.html`: Estrutura básica da página
- `style.css`: Estilização do jogo e interface
- `script.js`: Lógica principal do jogo, incluindo:
  - Renderização do tabuleiro
  - Sistema de movimentação
  - Regras do jogo
  - IA básica
  - Controles de interface

## Regras Implementadas:

1. Movimento diagonal de peças comuns (apenas para frente)
2. Movimento livre de damas (qualquer direção)
3. Captura obrigatória (incluindo a regra da maioria)
4. Promoção a dama ao alcançar a linha final
5. Empate após 20 lances sem captura
6. Empate em finais com poucas peças

## Personalizações:

- Design moderno do tabuleiro e peças
- Efeitos visuais para movimentos especiais
- Indicador visual de turno atual
- Botão para alternar entre modo humano vs IA