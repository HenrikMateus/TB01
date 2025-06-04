const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const tileSize = 80;
const rows = 8;
const cols = 8;

const gameState = {
    board: [],
    currentPlayer: 'r',
    selected: null,
    validMoves: [],
    vsAI: false,
    consecutiveNonCaptureMoves: 0,
    consecutiveDamaMoves: 0,
    mustContinueCapture: null
};

function initBoard() {
    gameState.board = [];
    gameState.consecutiveNonCaptureMoves = 0;
    gameState.consecutiveDamaMoves = 0;
    gameState.mustContinueCapture = null;
    
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            if ((r + c) % 2 === 1) {
                if (r < 3) row.push('b');
                else if (r > 4) row.push('r');
                else row.push(0);
            } else {
                row.push(0);
            }
        }
        gameState.board.push(row);
    }
    updateTurnIndicator();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * tileSize;
            const y = r * tileSize;

            ctx.fillStyle = (r + c) % 2 === 0 ? '#efebe9' : '#5d4037';
            ctx.fillRect(x, y, tileSize, tileSize);

            const piece = gameState.board[r][c];
            if (piece) {
                ctx.beginPath();
                ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2.5, 0, Math.PI * 2);
                
                const gradient = ctx.createRadialGradient(
                    x + tileSize / 2, y + tileSize / 2, tileSize / 8,
                    x + tileSize / 2, y + tileSize / 2, tileSize / 2.5
                );
                
                if (piece.toLowerCase() === 'r') {
                    gradient.addColorStop(0, '#ff5252');
                    gradient.addColorStop(1, '#c62828');
                } else {
                    gradient.addColorStop(0, '#42a5f5');
                    gradient.addColorStop(1, '#1565c0');
                }
                
                ctx.fillStyle = gradient;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fill();
                ctx.shadowColor = 'transparent';

                if (piece === 'R' || piece === 'B') {
                    // Coroa estilizada para damas
                    ctx.fillStyle = 'gold';
                    ctx.beginPath();
                    ctx.moveTo(x + tileSize / 2 - 20, y + tileSize / 2 - 5);
                    ctx.lineTo(x + tileSize / 2 + 20, y + tileSize / 2 - 5);
                    ctx.lineTo(x + tileSize / 2 + 15, y + tileSize / 2 + 10);
                    ctx.lineTo(x + tileSize / 2 - 15, y + tileSize / 2 + 10);
                    ctx.closePath();
                    ctx.fill();
                    
                    for (let i = 0; i < 5; i++) {
                        const angle = Math.PI / 2 + (i * Math.PI * 2) / 5;
                        const spikeX = x + tileSize / 2 + Math.cos(angle) * 15;
                        const spikeY = y + tileSize / 2 - 10 + Math.sin(angle) * 10;
                        
                        ctx.beginPath();
                        ctx.moveTo(x + tileSize / 2 - 20 + (i * 10), y + tileSize / 2 - 5);
                        ctx.lineTo(spikeX, spikeY);
                        ctx.lineTo(x + tileSize / 2 - 20 + ((i + 1) * 10), y + tileSize / 2 - 5);
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    ctx.fillStyle = '#daa520';
                    ctx.beginPath();
                    ctx.arc(x + tileSize / 2, y + tileSize / 2, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (gameState.selected && gameState.selected[0] === r && gameState.selected[1] === c) {
                ctx.strokeStyle = 'gold';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2.5 + 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    gameState.validMoves.forEach(([r, c]) => {
        const x = c * tileSize;
        const y = r * tileSize;
        ctx.beginPath();
        ctx.arc(x + tileSize / 2, y + tileSize / 2, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 235, 59, 0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 193, 7, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function updateTurnIndicator() {
    const turnElement = document.getElementById('current-turn');
    const colorName = gameState.currentPlayer === 'r' ? 'Vermelhas' : 'Azuis';
    turnElement.textContent = `Vez das Peças ${colorName}`;
    turnElement.style.color = gameState.currentPlayer === 'r' ? '#ff5252' : '#42a5f5';
}

function isValidPos(r, c) {
    return r >= 0 && r < rows && c >= 0 && c < cols;
}

function isOpponentPiece(piece) {
    if (!piece) return false;
    if (gameState.currentPlayer === 'r') return piece.toLowerCase() === 'b';
    return piece.toLowerCase() === 'r';
}

function isKing(piece) {
    return piece === 'R' || piece === 'B';
}

function getAllPossibleCaptures() {
    const captures = [];
    const currentPlayer = gameState.currentPlayer;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.toLowerCase() === currentPlayer) {
                const pieceCaptures = getCapturesForPiece(r, c);
                if (pieceCaptures.length > 0) {
                    captures.push({
                        from: [r, c],
                        captures: pieceCaptures,
                        isKing: isKing(piece)
                    });
                }
            }
        }
    }
    
    return captures;
}

function getCapturesForPiece(r, c) {
    const piece = gameState.board[r][c];
    const captures = [];
    
    if (!piece) return captures;

    const directions = [];
    if (isKing(piece)) {
        // Dama pode capturar em todas as direções
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    } else if (piece === 'r') {
        // Peça vermelha pode capturar para frente e para trás
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    } else if (piece === 'b') {
        // Peça preta pode capturar para frente e para trás
        directions.push([1, -1], [1, 1], [-1, -1], [-1, 1]);
    }

    // Verifica capturas simples em todas as direções
    for (const [dr, dc] of directions) {
        const capR = r + dr;
        const capC = c + dc;
        const landingR = r + dr * 2;
        const landingC = c + dc * 2;

        if (isValidPos(capR, capC) && isOpponentPiece(gameState.board[capR][capC])) {
            if (isValidPos(landingR, landingC) && gameState.board[landingR][landingC] === 0) {
                captures.push([landingR, landingC]);
            }
        }
    }

    // Para damas, verifica capturas múltiplas em todas as direções
    if (isKing(piece)) {
        for (const [dr, dc] of directions) {
            let nr = r + dr;
            let nc = c + dc;
            let foundOpponent = false;
            let opponentPos = null;

            while (isValidPos(nr, nc)) {
                if (gameState.board[nr][nc] === 0) {
                    if (foundOpponent) {
                        captures.push([nr, nc]);
                    }
                } else if (isOpponentPiece(gameState.board[nr][nc])) {
                    if (foundOpponent) break;
                    foundOpponent = true;
                    opponentPos = [nr, nc];
                } else {
                    break;
                }
                nr += dr;
                nc += dc;
            }

            // Se encontrou um oponente e há espaço após ele
            if (foundOpponent && isValidPos(nr, nc) && gameState.board[nr][nc] === 0) {
                captures.push([nr, nc]);
            }
        }
    }

    return captures;
}

function getValidMoves(r, c) {
    const piece = gameState.board[r][c];
    if (!piece) return [];

    // Se houver uma captura obrigatória em andamento, só mostra movimentos para essa peça
    if (gameState.mustContinueCapture && (gameState.mustContinueCapture[0] !== r || gameState.mustContinueCapture[1] !== c)) {
        return [];
    }

    // Verifica se há capturas obrigatórias
    const allCaptures = getAllPossibleCaptures();
    if (allCaptures.length > 0) {
        // Retorna apenas capturas para esta peça, se houver
        const pieceCaptures = allCaptures.find(item => 
            item.from[0] === r && item.from[1] === c
        );
        return pieceCaptures ? pieceCaptures.captures : [];
    }

    // Se não houver capturas obrigatórias, retorna movimentos normais
    const moves = [];
    const directions = [];

    if (piece === 'r') {
        directions.push([-1, -1], [-1, 1]); // Movimento para frente
    } else if (piece === 'b') {
        directions.push([1, -1], [1, 1]); // Movimento para frente
    } else if (isKing(piece)) {
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]); // Todas as direções
    }

    for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (isValidPos(nr, nc) && gameState.board[nr][nc] === 0) {
            moves.push([nr, nc]);
        }
    }

    return moves;
}

function animateCapture(r, c) {
    const x = c * tileSize + tileSize / 2;
    const y = r * tileSize + tileSize / 2;
    
    let radius = tileSize / 2.5;
    const shrink = () => {
        ctx.clearRect(x - radius - 2, y - radius - 2, radius * 2 + 4, radius * 2 + 4);
        radius -= 2;
        if (radius > 0) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fill();
            requestAnimationFrame(shrink);
        } else {
            drawBoard();
        }
    };
    shrink();
}

function animatePromotion(r, c) {
    const x = c * tileSize + tileSize / 2;
    const y = r * tileSize + tileSize / 2;
    
    let size = 0;
    const grow = () => {
        ctx.clearRect(x - size - 2, y - size - 2, size * 2 + 4, size * 2 + 4);
        size += 2;
        if (size < tileSize / 2) {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fill();
            requestAnimationFrame(grow);
        } else {
            drawBoard();
        }
    };
    grow();
}

async function makeMove(from, to) {
    const [fr, fc] = from;
    const [tr, tc] = to;
    const piece = gameState.board[fr][fc];

    const dr = tr - fr;
    const dc = tc - fc;

    const isCapture = Math.abs(dr) > 1 || Math.abs(dc) > 1;

    // Realiza o movimento
    gameState.board[tr][tc] = piece;
    gameState.board[fr][fc] = 0;

    if (isCapture) {
        gameState.consecutiveNonCaptureMoves = 0;
        
        if (isKing(piece)) {
            // Captura para damas (pode ser em diagonal longa)
            const stepR = dr > 0 ? 1 : -1;
            const stepC = dc > 0 ? 1 : -1;
            let rCheck = fr + stepR;
            let cCheck = fc + stepC;
            let captured = false;
            
            while (isValidPos(rCheck, cCheck) && (rCheck !== tr || cCheck !== tc)) {
                if (gameState.board[rCheck][cCheck] !== 0 && !captured) {
                    animateCapture(rCheck, cCheck);
                    gameState.board[rCheck][cCheck] = 0;
                    captured = true;
                }
                rCheck += stepR;
                cCheck += stepC;
            }
        } else {
            // Captura para pedras normais
            const capR = fr + dr / 2;
            const capC = fc + dc / 2;
            animateCapture(capR, capC);
            gameState.board[capR][capC] = 0;
        }

        // Verifica se há mais capturas disponíveis para a mesma peça
        const moreCaptures = getCapturesForPiece(tr, tc);
        if (moreCaptures.length > 0) {
            gameState.mustContinueCapture = [tr, tc];
            gameState.selected = [tr, tc];
            gameState.validMoves = moreCaptures;
            drawBoard();
            return;
        }
    } else {
        gameState.consecutiveNonCaptureMoves++;
    }

    // Reseta a captura múltipla se não houver mais capturas
    gameState.mustContinueCapture = null;

    // Promoção a dama (só se parar na linha de coroação)
    if (piece === 'r' && tr === 0) {
        gameState.board[tr][tc] = 'R';
        animatePromotion(tr, tc);
    }
    if (piece === 'b' && tr === rows - 1) {
        gameState.board[tr][tc] = 'B';
        animatePromotion(tr, tc);
    }

    // Verifica empate
    if (isKing(piece)) {
        gameState.consecutiveDamaMoves++;
    } else {
        gameState.consecutiveDamaMoves = 0;
    }

    checkForDraw();

    gameState.selected = null;
    gameState.validMoves = [];

    // Muda o jogador só se não houver captura múltipla
    if (!gameState.mustContinueCapture) {
        gameState.currentPlayer = gameState.currentPlayer === 'r' ? 'b' : 'r';
        updateTurnIndicator();
    }

    drawBoard();

    if (gameState.vsAI && gameState.currentPlayer === 'b' && !gameState.mustContinueCapture) {
        await new Promise(resolve => setTimeout(resolve, 500));
        aiMove();
    }
}

function checkForDraw() {
    if (gameState.consecutiveNonCaptureMoves >= 20) {
        alert("Empate! 20 lances sem captura ou movimento de pedra.");
        restartGame();
        return;
    }

    const pieces = countPieces();
    
    if ((pieces.rDamas === 2 && pieces.bDamas === 2) ||
        (pieces.rDamas === 2 && pieces.bDamas === 1) ||
        (pieces.rDamas === 2 && pieces.bDamas === 1 && pieces.bPedras === 1) ||
        (pieces.rDamas === 1 && pieces.bDamas === 1) ||
        (pieces.rDamas === 1 && pieces.bDamas === 1 && pieces.bPedras === 1)) {
        
        if (gameState.consecutiveDamaMoves >= 5) {
            alert("Empate! 5 lances em posição de final de damas.");
            restartGame();
        }
    }
}

function countPieces() {
    let rPedras = 0, rDamas = 0, bPedras = 0, bDamas = 0;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const piece = gameState.board[r][c];
            if (piece === 'r') rPedras++;
            else if (piece === 'R') rDamas++;
            else if (piece === 'b') bPedras++;
            else if (piece === 'B') bDamas++;
        }
    }
    
    return { rPedras, rDamas, bPedras, bDamas };
}

function aiMove() {
    // Primeiro verifica por capturas obrigatórias
    const allCaptures = getAllPossibleCaptures();
    
    if (allCaptures.length > 0) {
        // Escolhe a captura com maior número de peças (Lei da Maioria)
        let maxCaptures = 0;
        let bestCapture = null;
        
        allCaptures.forEach(captureGroup => {
            if (captureGroup.captures.length > maxCaptures) {
                maxCaptures = captureGroup.captures.length;
                bestCapture = captureGroup;
            }
        });
        
        if (bestCapture) {
            const randomCapture = bestCapture.captures[Math.floor(Math.random() * bestCapture.captures.length)];
            makeMove(bestCapture.from, randomCapture);
            return;
        }
    }
    
    // Se não houver capturas, faz um movimento normal
    const moves = [];
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.toLowerCase() === 'b') {
                const valid = getValidMoves(r, c);
                valid.forEach(move => {
                    moves.push({ from: [r, c], to: move });
                });
            }
        }
    }
    
    if (moves.length === 0) return;
    
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    makeMove(randomMove.from, randomMove.to);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const r = Math.floor(y / tileSize);
    const c = Math.floor(x / tileSize);

    const piece = gameState.board[r][c];

    if (gameState.selected) {
        const to = [r, c];
        if (gameState.validMoves.some(m => m[0] === to[0] && m[1] === to[1])) {
            makeMove(gameState.selected, to);
        } else {
            // Se o jogador clicou em outra peça sua, seleciona essa peça (se não houver captura obrigatória)
            if (!gameState.mustContinueCapture && piece && piece.toLowerCase() === gameState.currentPlayer) {
                gameState.selected = [r, c];
                gameState.validMoves = getValidMoves(r, c);
                drawBoard();
            }
        }
    } else if (piece && piece.toLowerCase() === gameState.currentPlayer) {
        gameState.selected = [r, c];
        gameState.validMoves = getValidMoves(r, c);
        drawBoard();
    }
});

function restartGame() {
    initBoard();
    gameState.currentPlayer = 'r';
    gameState.selected = null;
    gameState.validMoves = [];
    gameState.mustContinueCapture = null;
    updateTurnIndicator();
    drawBoard();
}

function toggleAI() {
    gameState.vsAI = !gameState.vsAI;
    alert('Modo IA: ' + (gameState.vsAI ? 'Ativado' : 'Desativado'));
}

initBoard();
drawBoard(); 