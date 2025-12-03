/* =========================================
   1. ANIMACIÓN DE FONDO (SYNTHWAVE)
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

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0d0221");
    grad.addColorStop(0.5, "#3a0ca3");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    const symbols = "01XY"; 
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
drawBackground();

/* =========================================
   2. TU LÓGICA ORIGINAL (ADAPTADA AL UI)
   ========================================= */

class NumeroComplejo {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    sumar(otro) {
        return new NumeroComplejo(
            this.real + otro.real,
            this.imag + otro.imag
        );
    }

    multiplicar(otro) {
        return new NumeroComplejo(
            this.real * otro.real - this.imag * otro.imag,
            this.real * otro.imag + this.imag * otro.real
        );
    }

    toString() {
        if (this.imag === 0) {
            return parseFloat(this.real.toFixed(4));
        }
        
        const realStr = parseFloat(this.real.toFixed(4));
        const imagStr = parseFloat(Math.abs(this.imag).toFixed(4));
        
        if (Math.abs(this.real) < 1e-10) {
            return `${this.imag < 0 ? '-' : ''}${imagStr}i`;
        }
        
        const signo = this.imag >= 0 ? '+' : '-';
        return `${realStr} ${signo} ${imagStr}i`;
    }

    esReal() {
        return Math.abs(this.imag) < 1e-10;
    }
}

function parsearPolinomio(str) {
    str = str.trim().replace(/\s/g, '');
    const gradoMatch = str.match(/x\^(\d+)/g);
    let gradoMax = 1;
    
    if (gradoMatch) {
        gradoMax = Math.max(...gradoMatch.map(m => parseInt(m.match(/\d+/)[0])));
    } else if (str.includes('x')) {
        gradoMax = 1;
    } else {
        gradoMax = 0;
    }
    
    const coeficientes = new Array(gradoMax + 1).fill(null).map(() => new NumeroComplejo(0));
    str = str.replace(/([+-])\s*x/g, '$1 1x');
    if(str.startsWith('x')) str = '1' + str; // Ajuste para x inicial
    
    const terminos = str.match(/[+-]?[^+-]+/g) || [];
    
    for (let termino of terminos) {
        termino = termino.trim();
        if (!termino) continue;
        
        let coef, grado;
        if (!termino.includes('x')) {
            coef = parsearComplejo(termino);
            grado = 0;
        } else if (termino.includes('x^')) {
            const partes = termino.split('x^');
            coef = obtenerCoeficiente(partes[0]);
            grado = parseInt(partes[1]);
        } else {
            const partes = termino.split('x');
            coef = obtenerCoeficiente(partes[0]);
            grado = 1;
        }
        const indice = gradoMax - grado;
        if(coeficientes[indice]) coeficientes[indice] = coeficientes[indice].sumar(coef);
    }
    return coeficientes;
}

// Helper para obtener coeficientes (1, -1 o numero)
function obtenerCoeficiente(parte) {
    if (parte === '' || parte === '+') return new NumeroComplejo(1);
    if (parte === '-') return new NumeroComplejo(-1);
    return parsearComplejo(parte);
}

function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '');
    if (!str.includes('i')) return new NumeroComplejo(parseFloat(str) || 0);

    str = str.replace(/i/g, '');
    let real = 0, imag = 0;
    const regex = /([+-]?\d*\.?\d+)([+-]\d*\.?\d+)?/;
    const match = str.match(regex);

    if (match) {
        if (str.indexOf('+') > 0 || (str.lastIndexOf('-') > 0)) {
            const partes = str.split(/(?=[+-])/);
            real = parseFloat(partes[0]) || 0;
            imag = parseFloat(partes[1]) || 1;
        } else {
            imag = parseFloat(str) || 1;
        }
    } else {
        // Caso solo "i" o "-i"
        if(str === '' || str === '+') imag = 1;
        else if(str === '-') imag = -1;
        else imag = parseFloat(str) || 1;
    }
    return new NumeroComplejo(real, imag);
}

function divisionSintetica(coeficientes, raiz) {
    const n = coeficientes.length;
    const proceso = [];
    const resultado = [];

    // Fila 1: Coeficientes
    // Fila 2: Multiplicaciones
    // La estructura de tu script original guardaba esto diferente, lo adapto a la visualización
    // proceso[0] -> Coeficientes (ya los tenemos)
    // proceso[1] -> Multiplicaciones
    
    const multiplicaciones = [new NumeroComplejo(0)]; // El primero baja directo
    resultado.push(coeficientes[0]);
    
    for (let i = 1; i < n; i++) {
        const producto = resultado[i - 1].multiplicar(raiz);
        multiplicaciones.push(producto);
        resultado.push(coeficientes[i].sumar(producto));
    }

    return {
        coefs: coeficientes,
        mults: multiplicaciones,
        res: resultado,
        raiz: raiz,
        cociente: resultado.slice(0, -1),
        residuo: resultado[resultado.length - 1]
    };
}

/* =========================================
   3. INTERFAZ DE USUARIO (VISUALIZACIÓN VAPORWAVE)
   ========================================= */

function calcularDivision() {
    try {
        const polinomioStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!polinomioStr || !raizStr) throw new Error('Faltan datos');

        const coeficientes = parsearPolinomio(polinomioStr);
        const raiz = parsearComplejo(raizStr);

        const data = divisionSintetica(coeficientes, raiz);
        mostrarResultadoAdaptado(data);

    } catch (error) {
        const resDiv = document.getElementById('resultado');
        resDiv.innerHTML = `<div style="padding:15px; border:1px solid red; color:red;">Error: ${error.message}</div>`;
        resDiv.classList.add('show');
        resDiv.style.display = 'block';
    }
}

// Esta función adapta tus datos originales a la tabla bonita del Index
function mostrarResultadoAdaptado(data) {
    let html = `
        <h3 class="result-title" style="margin-top:0;">Tabla de Resultados</h3>
        
        <div style="overflow-x:auto;">
            <table class="synth-table">
                <tr>
                    <td class="residuo-cell" style="border-right:3px solid var(--neon-pink);">
                        <strong>r = ${data.raiz.toString()}</strong>
                    </td>
                    ${data.coefs.map(c => `<td>${c.toString()}</td>`).join('')}
                </tr>
                
                <tr>
                    <td style="border-right:3px solid var(--neon-pink);">↓</td>
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
            <p><strong>Residuo:</strong> 
               <span style="color:var(--neon-pink); font-size:1.2em;">${data.residuo.toString()}</span>
            </p>
            <p style="font-size:0.9rem; color:#fff;">
               <strong>Cociente:</strong> ${generarPolinomioString(data.cociente)}
            </p>
        </div>
    `;

    const resDiv = document.getElementById('resultado');
    resDiv.innerHTML = html;
    resDiv.style.display = 'block';
    resDiv.classList.add('show');
}

function generarPolinomioString(cociente) {
    if(cociente.length === 0) return "0";
    let poli = "";
    for(let i=0; i<cociente.length; i++) {
        const grado = cociente.length - 1 - i;
        let val = cociente[i].toString();
        if(val === "0") continue;
        
        // Paréntesis si es complejo para claridad
        if(val.includes('i') || val.includes('+') || (val.includes('-') && i>0)) val = `(${val})`;
        
        if(i > 0) poli += " + ";
        poli += val;
        if(grado > 0) poli += "x";
        if(grado > 1) poli += `^${grado}`;
    }
    return poli || "0";
}

// Vinculamos el botón del HTML (id="btn-calcular")
document.getElementById('btn-calcular').addEventListener('click', calcularDivision);/* =========================================
   1. ANIMACIÓN DE FONDO (SYNTHWAVE)
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

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0d0221");
    grad.addColorStop(0.5, "#3a0ca3");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    const symbols = "01XY"; 
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
drawBackground();

/* =========================================
   2. TU LÓGICA ORIGINAL (ADAPTADA AL UI)
   ========================================= */

class NumeroComplejo {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    sumar(otro) {
        return new NumeroComplejo(
            this.real + otro.real,
            this.imag + otro.imag
        );
    }

    multiplicar(otro) {
        return new NumeroComplejo(
            this.real * otro.real - this.imag * otro.imag,
            this.real * otro.imag + this.imag * otro.real
        );
    }

    toString() {
        if (this.imag === 0) {
            return parseFloat(this.real.toFixed(4));
        }
        
        const realStr = parseFloat(this.real.toFixed(4));
        const imagStr = parseFloat(Math.abs(this.imag).toFixed(4));
        
        if (Math.abs(this.real) < 1e-10) {
            return `${this.imag < 0 ? '-' : ''}${imagStr}i`;
        }
        
        const signo = this.imag >= 0 ? '+' : '-';
        return `${realStr} ${signo} ${imagStr}i`;
    }

    esReal() {
        return Math.abs(this.imag) < 1e-10;
    }
}

function parsearPolinomio(str) {
    str = str.trim().replace(/\s/g, '');
    const gradoMatch = str.match(/x\^(\d+)/g);
    let gradoMax = 1;
    
    if (gradoMatch) {
        gradoMax = Math.max(...gradoMatch.map(m => parseInt(m.match(/\d+/)[0])));
    } else if (str.includes('x')) {
        gradoMax = 1;
    } else {
        gradoMax = 0;
    }
    
    const coeficientes = new Array(gradoMax + 1).fill(null).map(() => new NumeroComplejo(0));
    str = str.replace(/([+-])\s*x/g, '$1 1x');
    if(str.startsWith('x')) str = '1' + str; // Ajuste para x inicial
    
    const terminos = str.match(/[+-]?[^+-]+/g) || [];
    
    for (let termino of terminos) {
        termino = termino.trim();
        if (!termino) continue;
        
        let coef, grado;
        if (!termino.includes('x')) {
            coef = parsearComplejo(termino);
            grado = 0;
        } else if (termino.includes('x^')) {
            const partes = termino.split('x^');
            coef = obtenerCoeficiente(partes[0]);
            grado = parseInt(partes[1]);
        } else {
            const partes = termino.split('x');
            coef = obtenerCoeficiente(partes[0]);
            grado = 1;
        }
        const indice = gradoMax - grado;
        if(coeficientes[indice]) coeficientes[indice] = coeficientes[indice].sumar(coef);
    }
    return coeficientes;
}

// Helper para obtener coeficientes (1, -1 o numero)
function obtenerCoeficiente(parte) {
    if (parte === '' || parte === '+') return new NumeroComplejo(1);
    if (parte === '-') return new NumeroComplejo(-1);
    return parsearComplejo(parte);
}

function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '');
    if (!str.includes('i')) return new NumeroComplejo(parseFloat(str) || 0);

    str = str.replace(/i/g, '');
    let real = 0, imag = 0;
    const regex = /([+-]?\d*\.?\d+)([+-]\d*\.?\d+)?/;
    const match = str.match(regex);

    if (match) {
        if (str.indexOf('+') > 0 || (str.lastIndexOf('-') > 0)) {
            const partes = str.split(/(?=[+-])/);
            real = parseFloat(partes[0]) || 0;
            imag = parseFloat(partes[1]) || 1;
        } else {
            imag = parseFloat(str) || 1;
        }
    } else {
        // Caso solo "i" o "-i"
        if(str === '' || str === '+') imag = 1;
        else if(str === '-') imag = -1;
        else imag = parseFloat(str) || 1;
    }
    return new NumeroComplejo(real, imag);
}

function divisionSintetica(coeficientes, raiz) {
    const n = coeficientes.length;
    const proceso = [];
    const resultado = [];

    // Fila 1: Coeficientes
    // Fila 2: Multiplicaciones
    // La estructura de tu script original guardaba esto diferente, lo adapto a la visualización
    // proceso[0] -> Coeficientes (ya los tenemos)
    // proceso[1] -> Multiplicaciones
    
    const multiplicaciones = [new NumeroComplejo(0)]; // El primero baja directo
    resultado.push(coeficientes[0]);
    
    for (let i = 1; i < n; i++) {
        const producto = resultado[i - 1].multiplicar(raiz);
        multiplicaciones.push(producto);
        resultado.push(coeficientes[i].sumar(producto));
    }

    return {
        coefs: coeficientes,
        mults: multiplicaciones,
        res: resultado,
        raiz: raiz,
        cociente: resultado.slice(0, -1),
        residuo: resultado[resultado.length - 1]
    };
}

/* =========================================
   3. INTERFAZ DE USUARIO (VISUALIZACIÓN VAPORWAVE)
   ========================================= */

function calcularDivision() {
    try {
        const polinomioStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!polinomioStr || !raizStr) throw new Error('Faltan datos');

        const coeficientes = parsearPolinomio(polinomioStr);
        const raiz = parsearComplejo(raizStr);

        const data = divisionSintetica(coeficientes, raiz);
        mostrarResultadoAdaptado(data);

    } catch (error) {
        const resDiv = document.getElementById('resultado');
        resDiv.innerHTML = `<div style="padding:15px; border:1px solid red; color:red;">Error: ${error.message}</div>`;
        resDiv.classList.add('show');
        resDiv.style.display = 'block';
    }
}

// Esta función adapta tus datos originales a la tabla bonita del Index
function mostrarResultadoAdaptado(data) {
    let html = `
        <h3 class="result-title" style="margin-top:0;">Tabla de Resultados</h3>
        
        <div style="overflow-x:auto;">
            <table class="synth-table">
                <tr>
                    <td class="residuo-cell" style="border-right:3px solid var(--neon-pink);">
                        <strong>r = ${data.raiz.toString()}</strong>
                    </td>
                    ${data.coefs.map(c => `<td>${c.toString()}</td>`).join('')}
                </tr>
                
                <tr>
                    <td style="border-right:3px solid var(--neon-pink);">↓</td>
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
            <p><strong>Residuo:</strong> 
               <span style="color:var(--neon-pink); font-size:1.2em;">${data.residuo.toString()}</span>
            </p>
            <p style="font-size:0.9rem; color:#fff;">
               <strong>Cociente:</strong> ${generarPolinomioString(data.cociente)}
            </p>
        </div>
    `;

    const resDiv = document.getElementById('resultado');
    resDiv.innerHTML = html;
    resDiv.style.display = 'block';
    resDiv.classList.add('show');
}

function generarPolinomioString(cociente) {
    if(cociente.length === 0) return "0";
    let poli = "";
    for(let i=0; i<cociente.length; i++) {
        const grado = cociente.length - 1 - i;
        let val = cociente[i].toString();
        if(val === "0") continue;
        
        // Paréntesis si es complejo para claridad
        if(val.includes('i') || val.includes('+') || (val.includes('-') && i>0)) val = `(${val})`;
        
        if(i > 0) poli += " + ";
        poli += val;
        if(grado > 0) poli += "x";
        if(grado > 1) poli += `^${grado}`;
    }
    return poli || "0";
}

// Vinculamos el botón del HTML (id="btn-calcular")
document.getElementById('btn-calcular').addEventListener('click', calcularDivision);/* =========================================
   1. ANIMACIÓN DE FONDO (SYNTHWAVE)
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

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0d0221");
    grad.addColorStop(0.5, "#3a0ca3");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    const symbols = "01XY"; 
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
drawBackground();

/* =========================================
   2. TU LÓGICA ORIGINAL (ADAPTADA AL UI)
   ========================================= */

class NumeroComplejo {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    sumar(otro) {
        return new NumeroComplejo(
            this.real + otro.real,
            this.imag + otro.imag
        );
    }

    multiplicar(otro) {
        return new NumeroComplejo(
            this.real * otro.real - this.imag * otro.imag,
            this.real * otro.imag + this.imag * otro.real
        );
    }

    toString() {
        if (this.imag === 0) {
            return parseFloat(this.real.toFixed(4));
        }
        
        const realStr = parseFloat(this.real.toFixed(4));
        const imagStr = parseFloat(Math.abs(this.imag).toFixed(4));
        
        if (Math.abs(this.real) < 1e-10) {
            return `${this.imag < 0 ? '-' : ''}${imagStr}i`;
        }
        
        const signo = this.imag >= 0 ? '+' : '-';
        return `${realStr} ${signo} ${imagStr}i`;
    }

    esReal() {
        return Math.abs(this.imag) < 1e-10;
    }
}

function parsearPolinomio(str) {
    str = str.trim().replace(/\s/g, '');
    const gradoMatch = str.match(/x\^(\d+)/g);
    let gradoMax = 1;
    
    if (gradoMatch) {
        gradoMax = Math.max(...gradoMatch.map(m => parseInt(m.match(/\d+/)[0])));
    } else if (str.includes('x')) {
        gradoMax = 1;
    } else {
        gradoMax = 0;
    }
    
    const coeficientes = new Array(gradoMax + 1).fill(null).map(() => new NumeroComplejo(0));
    str = str.replace(/([+-])\s*x/g, '$1 1x');
    if(str.startsWith('x')) str = '1' + str; // Ajuste para x inicial
    
    const terminos = str.match(/[+-]?[^+-]+/g) || [];
    
    for (let termino of terminos) {
        termino = termino.trim();
        if (!termino) continue;
        
        let coef, grado;
        if (!termino.includes('x')) {
            coef = parsearComplejo(termino);
            grado = 0;
        } else if (termino.includes('x^')) {
            const partes = termino.split('x^');
            coef = obtenerCoeficiente(partes[0]);
            grado = parseInt(partes[1]);
        } else {
            const partes = termino.split('x');
            coef = obtenerCoeficiente(partes[0]);
            grado = 1;
        }
        const indice = gradoMax - grado;
        if(coeficientes[indice]) coeficientes[indice] = coeficientes[indice].sumar(coef);
    }
    return coeficientes;
}

// Helper para obtener coeficientes (1, -1 o numero)
function obtenerCoeficiente(parte) {
    if (parte === '' || parte === '+') return new NumeroComplejo(1);
    if (parte === '-') return new NumeroComplejo(-1);
    return parsearComplejo(parte);
}

function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '');
    if (!str.includes('i')) return new NumeroComplejo(parseFloat(str) || 0);

    str = str.replace(/i/g, '');
    let real = 0, imag = 0;
    const regex = /([+-]?\d*\.?\d+)([+-]\d*\.?\d+)?/;
    const match = str.match(regex);

    if (match) {
        if (str.indexOf('+') > 0 || (str.lastIndexOf('-') > 0)) {
            const partes = str.split(/(?=[+-])/);
            real = parseFloat(partes[0]) || 0;
            imag = parseFloat(partes[1]) || 1;
        } else {
            imag = parseFloat(str) || 1;
        }
    } else {
        // Caso solo "i" o "-i"
        if(str === '' || str === '+') imag = 1;
        else if(str === '-') imag = -1;
        else imag = parseFloat(str) || 1;
    }
    return new NumeroComplejo(real, imag);
}

function divisionSintetica(coeficientes, raiz) {
    const n = coeficientes.length;
    const proceso = [];
    const resultado = [];

    // Fila 1: Coeficientes
    // Fila 2: Multiplicaciones
    // La estructura de tu script original guardaba esto diferente, lo adapto a la visualización
    // proceso[0] -> Coeficientes (ya los tenemos)
    // proceso[1] -> Multiplicaciones
    
    const multiplicaciones = [new NumeroComplejo(0)]; // El primero baja directo
    resultado.push(coeficientes[0]);
    
    for (let i = 1; i < n; i++) {
        const producto = resultado[i - 1].multiplicar(raiz);
        multiplicaciones.push(producto);
        resultado.push(coeficientes[i].sumar(producto));
    }

    return {
        coefs: coeficientes,
        mults: multiplicaciones,
        res: resultado,
        raiz: raiz,
        cociente: resultado.slice(0, -1),
        residuo: resultado[resultado.length - 1]
    };
}

/* =========================================
   3. INTERFAZ DE USUARIO (VISUALIZACIÓN VAPORWAVE)
   ========================================= */

function calcularDivision() {
    try {
        const polinomioStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!polinomioStr || !raizStr) throw new Error('Faltan datos');

        const coeficientes = parsearPolinomio(polinomioStr);
        const raiz = parsearComplejo(raizStr);

        const data = divisionSintetica(coeficientes, raiz);
        mostrarResultadoAdaptado(data);

    } catch (error) {
        const resDiv = document.getElementById('resultado');
        resDiv.innerHTML = `<div style="padding:15px; border:1px solid red; color:red;">Error: ${error.message}</div>`;
        resDiv.classList.add('show');
        resDiv.style.display = 'block';
    }
}

// Esta función adapta tus datos originales a la tabla bonita del Index
function mostrarResultadoAdaptado(data) {
    let html = `
        <h3 class="result-title" style="margin-top:0;">Tabla de Resultados</h3>
        
        <div style="overflow-x:auto;">
            <table class="synth-table">
                <tr>
                    <td class="residuo-cell" style="border-right:3px solid var(--neon-pink);">
                        <strong>r = ${data.raiz.toString()}</strong>
                    </td>
                    ${data.coefs.map(c => `<td>${c.toString()}</td>`).join('')}
                </tr>
                
                <tr>
                    <td style="border-right:3px solid var(--neon-pink);">↓</td>
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
            <p><strong>Residuo:</strong> 
               <span style="color:var(--neon-pink); font-size:1.2em;">${data.residuo.toString()}</span>
            </p>
            <p style="font-size:0.9rem; color:#fff;">
               <strong>Cociente:</strong> ${generarPolinomioString(data.cociente)}
            </p>
        </div>
    `;

    const resDiv = document.getElementById('resultado');
    resDiv.innerHTML = html;
    resDiv.style.display = 'block';
    resDiv.classList.add('show');
}

function generarPolinomioString(cociente) {
    if(cociente.length === 0) return "0";
    let poli = "";
    for(let i=0; i<cociente.length; i++) {
        const grado = cociente.length - 1 - i;
        let val = cociente[i].toString();
        if(val === "0") continue;
        
        // Paréntesis si es complejo para claridad
        if(val.includes('i') || val.includes('+') || (val.includes('-') && i>0)) val = `(${val})`;
        
        if(i > 0) poli += " + ";
        poli += val;
        if(grado > 0) poli += "x";
        if(grado > 1) poli += `^${grado}`;
    }
    return poli || "0";
}

// Vinculamos el botón del HTML (id="btn-calcular")
document.getElementById('btn-calcular').addEventListener('click', calcularDivision);/* =========================================
   1. ANIMACIÓN DE FONDO (SYNTHWAVE)
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

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0d0221");
    grad.addColorStop(0.5, "#3a0ca3");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    const symbols = "01XY"; 
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
drawBackground();

/* =========================================
   2. TU LÓGICA ORIGINAL (ADAPTADA AL UI)
   ========================================= */

class NumeroComplejo {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    sumar(otro) {
        return new NumeroComplejo(
            this.real + otro.real,
            this.imag + otro.imag
        );
    }

    multiplicar(otro) {
        return new NumeroComplejo(
            this.real * otro.real - this.imag * otro.imag,
            this.real * otro.imag + this.imag * otro.real
        );
    }

    toString() {
        if (this.imag === 0) {
            return parseFloat(this.real.toFixed(4));
        }
        
        const realStr = parseFloat(this.real.toFixed(4));
        const imagStr = parseFloat(Math.abs(this.imag).toFixed(4));
        
        if (Math.abs(this.real) < 1e-10) {
            return `${this.imag < 0 ? '-' : ''}${imagStr}i`;
        }
        
        const signo = this.imag >= 0 ? '+' : '-';
        return `${realStr} ${signo} ${imagStr}i`;
    }

    esReal() {
        return Math.abs(this.imag) < 1e-10;
    }
}

function parsearPolinomio(str) {
    str = str.trim().replace(/\s/g, '');
    const gradoMatch = str.match(/x\^(\d+)/g);
    let gradoMax = 1;
    
    if (gradoMatch) {
        gradoMax = Math.max(...gradoMatch.map(m => parseInt(m.match(/\d+/)[0])));
    } else if (str.includes('x')) {
        gradoMax = 1;
    } else {
        gradoMax = 0;
    }
    
    const coeficientes = new Array(gradoMax + 1).fill(null).map(() => new NumeroComplejo(0));
    str = str.replace(/([+-])\s*x/g, '$1 1x');
    if(str.startsWith('x')) str = '1' + str; // Ajuste para x inicial
    
    const terminos = str.match(/[+-]?[^+-]+/g) || [];
    
    for (let termino of terminos) {
        termino = termino.trim();
        if (!termino) continue;
        
        let coef, grado;
        if (!termino.includes('x')) {
            coef = parsearComplejo(termino);
            grado = 0;
        } else if (termino.includes('x^')) {
            const partes = termino.split('x^');
            coef = obtenerCoeficiente(partes[0]);
            grado = parseInt(partes[1]);
        } else {
            const partes = termino.split('x');
            coef = obtenerCoeficiente(partes[0]);
            grado = 1;
        }
        const indice = gradoMax - grado;
        if(coeficientes[indice]) coeficientes[indice] = coeficientes[indice].sumar(coef);
    }
    return coeficientes;
}

// Helper para obtener coeficientes (1, -1 o numero)
function obtenerCoeficiente(parte) {
    if (parte === '' || parte === '+') return new NumeroComplejo(1);
    if (parte === '-') return new NumeroComplejo(-1);
    return parsearComplejo(parte);
}

function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '');
    if (!str.includes('i')) return new NumeroComplejo(parseFloat(str) || 0);

    str = str.replace(/i/g, '');
    let real = 0, imag = 0;
    const regex = /([+-]?\d*\.?\d+)([+-]\d*\.?\d+)?/;
    const match = str.match(regex);

    if (match) {
        if (str.indexOf('+') > 0 || (str.lastIndexOf('-') > 0)) {
            const partes = str.split(/(?=[+-])/);
            real = parseFloat(partes[0]) || 0;
            imag = parseFloat(partes[1]) || 1;
        } else {
            imag = parseFloat(str) || 1;
        }
    } else {
        // Caso solo "i" o "-i"
        if(str === '' || str === '+') imag = 1;
        else if(str === '-') imag = -1;
        else imag = parseFloat(str) || 1;
    }
    return new NumeroComplejo(real, imag);
}

function divisionSintetica(coeficientes, raiz) {
    const n = coeficientes.length;
    const proceso = [];
    const resultado = [];

    // Fila 1: Coeficientes
    // Fila 2: Multiplicaciones
    // La estructura de tu script original guardaba esto diferente, lo adapto a la visualización
    // proceso[0] -> Coeficientes (ya los tenemos)
    // proceso[1] -> Multiplicaciones
    
    const multiplicaciones = [new NumeroComplejo(0)]; // El primero baja directo
    resultado.push(coeficientes[0]);
    
    for (let i = 1; i < n; i++) {
        const producto = resultado[i - 1].multiplicar(raiz);
        multiplicaciones.push(producto);
        resultado.push(coeficientes[i].sumar(producto));
    }

    return {
        coefs: coeficientes,
        mults: multiplicaciones,
        res: resultado,
        raiz: raiz,
        cociente: resultado.slice(0, -1),
        residuo: resultado[resultado.length - 1]
    };
}

/* =========================================
   3. INTERFAZ DE USUARIO (VISUALIZACIÓN VAPORWAVE)
   ========================================= */

function calcularDivision() {
    try {
        const polinomioStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!polinomioStr || !raizStr) throw new Error('Faltan datos');

        const coeficientes = parsearPolinomio(polinomioStr);
        const raiz = parsearComplejo(raizStr);

        const data = divisionSintetica(coeficientes, raiz);
        mostrarResultadoAdaptado(data);

    } catch (error) {
        const resDiv = document.getElementById('resultado');
        resDiv.innerHTML = `<div style="padding:15px; border:1px solid red; color:red;">Error: ${error.message}</div>`;
        resDiv.classList.add('show');
        resDiv.style.display = 'block';
    }
}

// Esta función adapta tus datos originales a la tabla bonita del Index
function mostrarResultadoAdaptado(data) {
    let html = `
        <h3 class="result-title" style="margin-top:0;">Tabla de Resultados</h3>
        
        <div style="overflow-x:auto;">
            <table class="synth-table">
                <tr>
                    <td class="residuo-cell" style="border-right:3px solid var(--neon-pink);">
                        <strong>r = ${data.raiz.toString()}</strong>
                    </td>
                    ${data.coefs.map(c => `<td>${c.toString()}</td>`).join('')}
                </tr>
                
                <tr>
                    <td style="border-right:3px solid var(--neon-pink);">↓</td>
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
            <p><strong>Residuo:</strong> 
               <span style="color:var(--neon-pink); font-size:1.2em;">${data.residuo.toString()}</span>
            </p>
            <p style="font-size:0.9rem; color:#fff;">
               <strong>Cociente:</strong> ${generarPolinomioString(data.cociente)}
            </p>
        </div>
    `;

    const resDiv = document.getElementById('resultado');
    resDiv.innerHTML = html;
    resDiv.style.display = 'block';
    resDiv.classList.add('show');
}

function generarPolinomioString(cociente) {
    if(cociente.length === 0) return "0";
    let poli = "";
    for(let i=0; i<cociente.length; i++) {
        const grado = cociente.length - 1 - i;
        let val = cociente[i].toString();
        if(val === "0") continue;
        
        // Paréntesis si es complejo para claridad
        if(val.includes('i') || val.includes('+') || (val.includes('-') && i>0)) val = `(${val})`;
        
        if(i > 0) poli += " + ";
        poli += val;
        if(grado > 0) poli += "x";
        if(grado > 1) poli += `^${grado}`;
    }
    return poli || "0";
}

// Vinculamos el botón del HTML (id="btn-calcular")
document.getElementById('btn-calcular').addEventListener('click', calcularDivision);/* =========================================
   1. ANIMACIÓN DE FONDO (SYNTHWAVE)
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

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0d0221");
    grad.addColorStop(0.5, "#3a0ca3");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    const symbols = "01XY"; 
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
drawBackground();

/* =========================================
   2. TU LÓGICA ORIGINAL (ADAPTADA AL UI)
   ========================================= */

class NumeroComplejo {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    sumar(otro) {
        return new NumeroComplejo(
            this.real + otro.real,
            this.imag + otro.imag
        );
    }

    multiplicar(otro) {
        return new NumeroComplejo(
            this.real * otro.real - this.imag * otro.imag,
            this.real * otro.imag + this.imag * otro.real
        );
    }

    toString() {
        if (this.imag === 0) {
            return parseFloat(this.real.toFixed(4));
        }
        
        const realStr = parseFloat(this.real.toFixed(4));
        const imagStr = parseFloat(Math.abs(this.imag).toFixed(4));
        
        if (Math.abs(this.real) < 1e-10) {
            return `${this.imag < 0 ? '-' : ''}${imagStr}i`;
        }
        
        const signo = this.imag >= 0 ? '+' : '-';
        return `${realStr} ${signo} ${imagStr}i`;
    }

    esReal() {
        return Math.abs(this.imag) < 1e-10;
    }
}

function parsearPolinomio(str) {
    str = str.trim().replace(/\s/g, '');
    const gradoMatch = str.match(/x\^(\d+)/g);
    let gradoMax = 1;
    
    if (gradoMatch) {
        gradoMax = Math.max(...gradoMatch.map(m => parseInt(m.match(/\d+/)[0])));
    } else if (str.includes('x')) {
        gradoMax = 1;
    } else {
        gradoMax = 0;
    }
    
    const coeficientes = new Array(gradoMax + 1).fill(null).map(() => new NumeroComplejo(0));
    str = str.replace(/([+-])\s*x/g, '$1 1x');
    if(str.startsWith('x')) str = '1' + str; // Ajuste para x inicial
    
    const terminos = str.match(/[+-]?[^+-]+/g) || [];
    
    for (let termino of terminos) {
        termino = termino.trim();
        if (!termino) continue;
        
        let coef, grado;
        if (!termino.includes('x')) {
            coef = parsearComplejo(termino);
            grado = 0;
        } else if (termino.includes('x^')) {
            const partes = termino.split('x^');
            coef = obtenerCoeficiente(partes[0]);
            grado = parseInt(partes[1]);
        } else {
            const partes = termino.split('x');
            coef = obtenerCoeficiente(partes[0]);
            grado = 1;
        }
        const indice = gradoMax - grado;
        if(coeficientes[indice]) coeficientes[indice] = coeficientes[indice].sumar(coef);
    }
    return coeficientes;
}

// Helper para obtener coeficientes (1, -1 o numero)
function obtenerCoeficiente(parte) {
    if (parte === '' || parte === '+') return new NumeroComplejo(1);
    if (parte === '-') return new NumeroComplejo(-1);
    return parsearComplejo(parte);
}

function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '');
    if (!str.includes('i')) return new NumeroComplejo(parseFloat(str) || 0);

    str = str.replace(/i/g, '');
    let real = 0, imag = 0;
    const regex = /([+-]?\d*\.?\d+)([+-]\d*\.?\d+)?/;
    const match = str.match(regex);

    if (match) {
        if (str.indexOf('+') > 0 || (str.lastIndexOf('-') > 0)) {
            const partes = str.split(/(?=[+-])/);
            real = parseFloat(partes[0]) || 0;
            imag = parseFloat(partes[1]) || 1;
        } else {
            imag = parseFloat(str) || 1;
        }
    } else {
        // Caso solo "i" o "-i"
        if(str === '' || str === '+') imag = 1;
        else if(str === '-') imag = -1;
        else imag = parseFloat(str) || 1;
    }
    return new NumeroComplejo(real, imag);
}

function divisionSintetica(coeficientes, raiz) {
    const n = coeficientes.length;
    const proceso = [];
    const resultado = [];

    // Fila 1: Coeficientes
    // Fila 2: Multiplicaciones
    // La estructura de tu script original guardaba esto diferente, lo adapto a la visualización
    // proceso[0] -> Coeficientes (ya los tenemos)
    // proceso[1] -> Multiplicaciones
    
    const multiplicaciones = [new NumeroComplejo(0)]; // El primero baja directo
    resultado.push(coeficientes[0]);
    
    for (let i = 1; i < n; i++) {
        const producto = resultado[i - 1].multiplicar(raiz);
        multiplicaciones.push(producto);
        resultado.push(coeficientes[i].sumar(producto));
    }

    return {
        coefs: coeficientes,
        mults: multiplicaciones,
        res: resultado,
        raiz: raiz,
        cociente: resultado.slice(0, -1),
        residuo: resultado[resultado.length - 1]
    };
}

/* =========================================
   3. INTERFAZ DE USUARIO (VISUALIZACIÓN VAPORWAVE)
   ========================================= */

function calcularDivision() {
    try {
        const polinomioStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!polinomioStr || !raizStr) throw new Error('Faltan datos');

        const coeficientes = parsearPolinomio(polinomioStr);
        const raiz = parsearComplejo(raizStr);

        const data = divisionSintetica(coeficientes, raiz);
        mostrarResultadoAdaptado(data);

    } catch (error) {
        const resDiv = document.getElementById('resultado');
        resDiv.innerHTML = `<div style="padding:15px; border:1px solid red; color:red;">Error: ${error.message}</div>`;
        resDiv.classList.add('show');
        resDiv.style.display = 'block';
    }
}

// Esta función adapta tus datos originales a la tabla bonita del Index
function mostrarResultadoAdaptado(data) {
    let html = `
        <h3 class="result-title" style="margin-top:0;">Tabla de Resultados</h3>
        
        <div style="overflow-x:auto;">
            <table class="synth-table">
                <tr>
                    <td class="residuo-cell" style="border-right:3px solid var(--neon-pink);">
                        <strong>r = ${data.raiz.toString()}</strong>
                    </td>
                    ${data.coefs.map(c => `<td>${c.toString()}</td>`).join('')}
                </tr>
                
                <tr>
                    <td style="border-right:3px solid var(--neon-pink);">↓</td>
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
            <p><strong>Residuo:</strong> 
               <span style="color:var(--neon-pink); font-size:1.2em;">${data.residuo.toString()}</span>
            </p>
            <p style="font-size:0.9rem; color:#fff;">
               <strong>Cociente:</strong> ${generarPolinomioString(data.cociente)}
            </p>
        </div>
    `;

    const resDiv = document.getElementById('resultado');
    resDiv.innerHTML = html;
    resDiv.style.display = 'block';
    resDiv.classList.add('show');
}

function generarPolinomioString(cociente) {
    if(cociente.length === 0) return "0";
    let poli = "";
    for(let i=0; i<cociente.length; i++) {
        const grado = cociente.length - 1 - i;
        let val = cociente[i].toString();
        if(val === "0") continue;
        
        // Paréntesis si es complejo para claridad
        if(val.includes('i') || val.includes('+') || (val.includes('-') && i>0)) val = `(${val})`;
        
        if(i > 0) poli += " + ";
        poli += val;
        if(grado > 0) poli += "x";
        if(grado > 1) poli += `^${grado}`;
    }
    return poli || "0";
}

// Vinculamos el botón del HTML (id="btn-calcular")
document.getElementById('btn-calcular').addEventListener('click', calcularDivision);
    
    html += '</div>';

    document.getElementById('resultado').innerHTML = html;
    document.getElementById('resultado').classList.add('show');
}
