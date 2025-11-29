/* =========================================
   ANIMACIÓN DE FONDO (SYNTHWAVE)
   ========================================= */
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let time = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cielo degradado
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0d0221");
    grad.addColorStop(0.5, "#3a0ca3");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sol Retro
    const sunX = canvas.width / 2;
    const sunY = canvas.height * 0.4;
    const sunR = Math.min(canvas.height, canvas.width) * 0.25;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 50, sunX, sunY, sunR);
    sunGrad.addColorStop(0, "#ff00ff");
    sunGrad.addColorStop(0.5, "#ff0080");
    sunGrad.addColorStop(1, "transparent");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Grid (Ola Matrix)
    const symbols = "01XY"; // Simplificado para rendimiento
    const rows = 8;
    const baseFontSize = 16;
    const waveHeight = 30;
    const waveLength = 300;

    for (let r = 0; r < rows; r++) {
        let yBase = canvas.height * (0.7 + (r / rows) * 0.3);
        let alpha = 0.4;
        let fontSize = baseFontSize + (rows - r) * 2;
        ctx.font = fontSize + "px monospace";
        ctx.fillStyle = `rgba(${r % 2 === 0 ? "0,255,255" : "255,0,255"}, ${alpha})`;

        for (let x = 0; x < canvas.width; x += fontSize * 1.5) {
            let yOffset = Math.sin((x * 2 + time + r * 100) / waveLength) * waveHeight;
            let y = yBase + yOffset;
            const text = symbols[Math.floor(Math.random() * symbols.length)];
            ctx.fillText(text, x, y);
        }
    }

    time += 0.02 * waveLength;
    requestAnimationFrame(drawBackground);
}
// Iniciar animación
drawBackground();


/* =========================================
   LÓGICA MATEMÁTICA (COMPLEJOS & POLINOMIOS)
   ========================================= */

class NumeroComplejo {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    sumar(otro) {
        return new NumeroComplejo(this.real + otro.real, this.imag + otro.imag);
    }

    multiplicar(otro) {
        return new NumeroComplejo(
            this.real * otro.real - this.imag * otro.imag,
            this.real * otro.imag + this.imag * otro.real
        );
    }

    toString() {
        // Formato bonito para imprimir
        if (Math.abs(this.imag) < 1e-10) return Number(this.real.toFixed(4)).toString();
        
        const r = Number(this.real.toFixed(4));
        const i = Math.abs(this.imag).toFixed(4);
        const signo = this.imag >= 0 ? '+' : '-';
        
        if (Math.abs(this.real) < 1e-10) return `${this.imag < 0 ? '-' : ''}${Number(i)}i`;
        
        return `${r} ${signo} ${Number(i)}i`;
    }
}

// --- PARSERS ---

function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '');
    if (!str.includes('i')) return new NumeroComplejo(parseFloat(str));

    str = str.replace(/i/g, '');
    if (str === '') return new NumeroComplejo(0, 1); // Caso "i"
    if (str === '-') return new NumeroComplejo(0, -1); // Caso "-i"
    if (str === '+') return new NumeroComplejo(0, 1); // Caso "+i"

    // Regex para separar parte real e imaginaria
    // Soporta formatos: 3+2i, -3-2.5i, 5i, etc.
    const regex = /([+-]?\d*\.?\d+)?([+-]?\d*\.?\d+)?/;
    // Nota: El parseo robusto de complejos es complicado, esta es una versión simplificada
    // Para producción se recomienda math.js
    
    // Fallback simple usando math.js si está cargado, sino lógica básica
    if(window.math) {
        const c = math.complex(str.includes('i') ? str : str);
        return new NumeroComplejo(c.re, c.im);
    }
    return new NumeroComplejo(0,0); // Fallback error
}

function parsearPolinomio(str) {
    // Limpieza básica
    str = str.replace(/\s+/g, '').replace(/-/g, '+-');
    if(str.startsWith('+-')) str = str.substring(1); // Ajuste inicio
    
    const terminos = str.split('+');
    let coeficientesMap = {};
    let gradoMax = 0;

    terminos.forEach(term => {
        if(!term) return;
        let coef = 1, exp = 0;
        
        if(term.includes('x')) {
            const parts = term.split('x');
            // Coeficiente
            if(parts[0] === '' || parts[0] === '+') coef = 1;
            else if(parts[0] === '-') coef = -1;
            else coef = parseFloat(parts[0]);

            // Exponente
            if(parts[1].includes('^')) exp = parseInt(parts[1].replace('^', ''));
            else exp = 1;
        } else {
            coef = parseFloat(term);
            exp = 0;
        }

        if(exp > gradoMax) gradoMax = exp;
        coeficientesMap[exp] = new NumeroComplejo(coef);
    });

    // Llenar huecos con ceros
    let coefsArr = [];
    for(let i = gradoMax; i >= 0; i--) {
        coefsArr.push(coeficientesMap[i] || new NumeroComplejo(0));
    }
    
    return coefsArr;
}

// --- CORE: DIVISIÓN SINTÉTICA ---

function divisionSintetica(coeficientes, raiz) {
    let resultado = [];
    let procesoMultiplicacion = []; // Fila intermedia
    
    // El primer coeficiente baja directo
    let actual = coeficientes[0];
    resultado.push(actual);
    procesoMultiplicacion.push(new NumeroComplejo(0)); // Placeholder visual

    for (let i = 1; i < coeficientes.length; i++) {
        let mult = resultado[i-1].multiplicar(raiz);
        procesoMultiplicacion.push(mult);
        
        let suma = coeficientes[i].sumar(mult);
        resultado.push(suma);
    }

    return {
        coefs: coeficientes,
        mults: procesoMultiplicacion,
        res: resultado,
        raiz: raiz
    };
}

// --- INTERFAZ ---

function calcularDivision() {
    const poliStr = document.getElementById('polinomio').value;
    const raizStr = document.getElementById('raiz').value;

    if (!poliStr || !raizStr) return alert("Faltan datos");

    try {
        // Usamos Math.js para parsear inputs complejos de forma segura si está disponible
        // Si no, usamos la lógica manual. Aquí asumo que el input es amigable.
        
        // 1. Parsear Raíz
        let raiz;
        try {
            const c = math.evaluate(raizStr); // Soporta '1+i', 'sqrt(2)', etc
            raiz = typeof c === 'number' ? new NumeroComplejo(c) : new NumeroComplejo(c.re, c.im);
        } catch(e) { throw new Error("Formato de raíz inválido"); }

        // 2. Parsear Polinomio (Simplificado: asume coeficientes reales para este ejemplo,
        // o usa la función manual parsearPolinomio definida arriba)
        const coeficientes = parsearPolinomio(poliStr);

        // 3. Calcular
        const data = divisionSintetica(coeficientes, raiz);

        // 4. Renderizar
        renderTabla(data);

    } catch (e) {
        document.getElementById('resultado').innerHTML = `<div class="error-box">Error: ${e.message}</div>`;
        document.getElementById('resultado').classList.add('show');
    }
}

function renderTabla(data) {
    let html = `
        <h3 class="result-title">Tabla de División Sintética</h3>
        <div style="overflow-x:auto;">
            <table class="synth-table">
                <tr>
                    <td class="divisor-cell" rowspan="2" style="vertical-align:middle; border-right:3px solid var(--neon-pink);">
                        <strong>r = ${data.raiz.toString()}</strong>
                    </td>
                    ${data.coefs.map(c => `<td>${c.toString()}</td>`).join('')}
                </tr>
                
                <tr>
                    ${data.mults.map((m, i) => i === 0 ? `<td>↓</td>` : `<td style="color:var(--text-dim)">${m.toString()}</td>`).join('')}
                </tr>

                <tr style="border-top: 2px solid var(--neon-blue);">
                    <td style="border-right:3px solid var(--neon-pink); color:var(--text-dim);">Cocientes</td>
                    ${data.res.map((r, i) => {
                        const esUltimo = i === data.res.length - 1;
                        return `<td class="${esUltimo ? 'residuo-cell' : 'result-cell'}">
                                    ${r.toString()}
                                </td>`;
                    }).join('')}
                </tr>
            </table>
        </div>

        <div class="final-result-box">
            <p><strong>Residuo:</strong> <span style="color: ${Math.abs(data.res[data.res.length-1].real) < 0.001 ? '#00ff00' : 'var(--neon-pink)'}">${data.res[data.res.length-1].toString()}</span></p>
            <p style="font-size:0.8em; color:var(--text-dim)">
                Grado resultante: ${data.coefs.length - 2}
            </p>
        </div>
    `;

    const resDiv = document.getElementById('resultado');
    resDiv.innerHTML = html;
    resDiv.classList.add('show');
}

// Event Listeners
document.getElementById('btn-calcular').addEventListener('click', calcularDivision);