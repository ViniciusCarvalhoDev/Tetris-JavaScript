document.addEventListener("DOMContentLoaded", () => {

    const grid = document.querySelector('.grid');
    let quadrados = Array.from(document.querySelectorAll('.grid div'));
    const pontuacaoDisplay = document.querySelector('#pontuacao');
    const startBtn = document.querySelector('#play-pause');
    const largura = 10;
    let proximoAleatorio = 0
    let timerId
    let pontuacao = 0

    const imgs = [
        "url('bgimg.PNG')",
        "url('bgimg1.PNG')",
        "url('bgimg2.PNG')",
        "url('bgimg3.PNG')",
        "url('bgimg5.PNG')"
    ]

    /* Lógica por trás das peças: Cada peça é um array de quatro posições com os indices a serem coloridas 
     * considerando uma matriz 3X3 (exceto a peça em formato de I que tem 4 posições). 
     * 
     *  |00|01|02|  
     *  |10|11|12|
     *  |20|21|22|
     * 
     * Exemplo: Quero colorir a peça L o array resultante é = [02,11,21,22]
     * 
     * |00|X|02|
     * |10|X|12|
     * |20|X|X|
     * 
     * */

    const lTetromino = [
        [1, largura + 1, largura * 2 + 1, 2],
        [largura, largura + 1, largura + 2, largura * 2 + 2],
        [1, largura + 1, largura * 2 + 1, largura * 2],
        [largura, largura * 2, largura * 2 + 1, largura * 2 + 2]
    ]

    const zTetromino = [
        [0, largura, largura + 1, largura * 2 + 1],
        [largura + 1, largura + 2, largura * 2, largura * 2 + 1],
        [0, largura, largura + 1, largura * 2 + 1],
        [largura + 1, largura + 2, largura * 2, largura * 2 + 1]
    ]

    const tTetromino = [
        [1, largura, largura + 1, largura + 2],
        [1, largura + 1, largura + 2, largura * 2 + 1],
        [largura, largura + 1, largura + 2, largura * 2 + 1],
        [1, largura, largura + 1, largura * 2 + 1]
    ]

    const oTetromino = [
        [0, 1, largura, largura + 1],
        [0, 1, largura, largura + 1],
        [0, 1, largura, largura + 1],
        [0, 1, largura, largura + 1]
    ]

    const iTetromino = [
        [1, largura + 1, largura * 2 + 1, largura * 3 + 1],
        [largura, largura + 1, largura + 2, largura + 3],
        [1, largura + 1, largura * 2 + 1, largura * 3 + 1],
        [largura, largura + 1, largura + 2, largura + 3]
    ]

    const pecas = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

    let prosicaoAtual = 4
    let rotacaoAtual = 0

  

    let random = Math.floor(Math.random() * pecas.length)
    let current = pecas[random][rotacaoAtual]

    function control(e) {
        if (e.keyCode === 37) {
            moverParaAEsquerda();
        } else if (e.keyCode === 38) {
            rotacionar()
        } else if (e.keyCode === 39) {
            moverParaADireita();
        } else if (e.keyCode === 40) {
            //baixo
        }
    }

    document.addEventListener('keyup', control)

    function desenhar() {
        current.forEach(index => {
            quadrados[prosicaoAtual + index].classList.add('tetromino')
            quadrados[prosicaoAtual + index].style.backgroundImage = imgs[random]
        })
    }

    function apagar() {
        current.forEach(index => {
            quadrados[prosicaoAtual + index].classList.remove('tetromino')
            quadrados[prosicaoAtual + index].style.backgroundImage = ''
        })
    }

    function moveDown() {

        apagar()
        prosicaoAtual += largura;
        desenhar()
        congelar()
    }

    function congelar() {
        if (current.some(index => quadrados[prosicaoAtual + index + largura].classList.contains('taken'))) {
            current.forEach(index => quadrados[prosicaoAtual + index].classList.add('taken'));
            random = proximoAleatorio
            proximoAleatorio = Math.floor(Math.random() * pecas.length);
            current = pecas[random][rotacaoAtual];
            prosicaoAtual = 4;
            desenhar();
            mostrarPeca();
            adicionarPontuacao();
            gameOver();
        }
    }

    function moverParaAEsquerda() {
        apagar()
        const estaNaEsquerdaEdge = current.some(index => (prosicaoAtual + index) % largura === 0);

        if (!estaNaEsquerdaEdge) {
            prosicaoAtual -=1
        }

        if (current.some(index => quadrados[prosicaoAtual + index].classList.contains('taken'))) {
            prosicaoAtual += 1
        }

        desenhar()
    }

    function moverParaADireita() {
        apagar()
        const estaNaDireitaEdge = current.some(index => (prosicaoAtual + index) % largura === largura -1);

        if (!estaNaDireitaEdge) {
            prosicaoAtual += 1
        }

        if (current.some(index => quadrados[prosicaoAtual + index].classList.contains('taken'))) {
            prosicaoAtual -= 1
        }
        desenhar()
    }

    function estaNaDireita() {
        return current.some(index => (prosicaoAtual + index + 1) % largura === 0)
    }

    function estaNaEsquerda() {
        return current.some(index => (prosicaoAtual + index) % largura === 0)
    }

    function checarPosicaoDeRotacao(P) {
        P = P || prosicaoAtual       //get current position.  Then, check if the piece is near the left side.
        if ((P + 1) % largura < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
            if (estaNaDireita()) {            //use actual position to check if it's flipped over to right side
                prosicaoAtual += 1    //if so, add one to wrap it back around
                checarPosicaoDeRotacao(P) //check again.  Pass position from start, since long block might need to move more.
            }
        }
        else if (P % largura > 5) {
            if (estaNaEsquerda()) {
                prosicaoAtual -= 1
                checarPosicaoDeRotacao(P)
            }
        }
    }
    function rotacionar() {
        apagar()

        rotacaoAtual++;

        if (rotacaoAtual === current.length) {
            rotacaoAtual = 0
        }

        current = pecas[random][rotacaoAtual];
        checarPosicaoDeRotacao();
        desenhar()
    }

    const miniGrid = document.querySelectorAll('.mini-grid div');
    const larguraMiniGrid = 4
    let displayIndex = 0
    

    const proximosTetrominoes = [
        [1, larguraMiniGrid + 1, larguraMiniGrid * 2 + 1, 2], 
        [0, larguraMiniGrid, larguraMiniGrid + 1, larguraMiniGrid * 2 + 1], 
        [1, larguraMiniGrid, larguraMiniGrid + 1, larguraMiniGrid + 2], 
        [0, 1, larguraMiniGrid, larguraMiniGrid + 1], 
        [1, larguraMiniGrid + 1, larguraMiniGrid * 2 + 1, larguraMiniGrid * 3 + 1] 
    ]

    function mostrarPeca() {
      
        miniGrid.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundImage = ''
        })
        proximosTetrominoes[proximoAleatorio].forEach(index => {
            miniGrid[displayIndex + index].classList.add('tetromino')
            miniGrid[displayIndex + index].style.backgroundImage = imgs[proximoAleatorio]
        })
    }

    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
        } else {
            desenhar()
            timerId = setInterval(moveDown, 200)
            proximoAleatorio = Math.floor(Math.random() * pecas.length)
            mostrarPeca()
        }
    });

    function adicionarPontuacao() {
        for (let i = 0; i < 199; i += largura) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

            if (row.every(index => quadrados[index].classList.contains('taken'))) {
                pontuacao += 10
                pontuacaoDisplay.innerHTML = pontuacao
                row.forEach(index => {
                    quadrados[index].classList.remove('taken')
                    quadrados[index].classList.remove('tetromino')
                    quadrados[index].style.backgroundImage = ''
                })
                const quadradosRemoved = quadrados.splice(i, largura)
                quadrados = quadradosRemoved.concat(quadrados)
                quadrados.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    function gameOver() {
        if (current.some(index => quadrados[prosicaoAtual + index].classList.contains('taken'))) {
            pontuacaoDisplay.innerHTML = 'end'
            clearInterval(timerId)
        }
    }
});