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
   2. LÓGICA MATEMÁTICA ROBUSTA
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
        // Formateo inteligente
        const r = parseFloat(this.real.toFixed(4));
        const i = parseFloat(Math.abs(this.imag).toFixed(4));
        
        if (Math.abs(this.imag) < 0.0001) return r.toString();
        if (Math.abs(this.real) < 0.0001) return `${this.imag < 0 ? '-' : ''}${i}i`;
        
        return `${r} ${this.imag >= 0 ? '+' : '-'} ${i}i`;
    }
}

// --- PARSERS MEJORADOS ---

function parsearInputSeguro(str) {
    // Usa math.js para evaluar expresiones como "1+i", "sqrt(2)", "3/2"
    try {
        // Si el usuario mete 'x' en la raíz, lanzamos error manual
        if (str.includes('x')) throw new Error("En 'Raíz' solo van números, no variables.");
        
        const val = math.evaluate(str);
        if (typeof val === 'number') return new NumeroComplejo(val, 0);
        if (val && typeof val.re === 'number') return new NumeroComplejo(val.re, val.im);
        return new NumeroComplejo(0, 0);
    } catch (e) {
        throw new Error("Formato numérico inválido: " + str);
    }
}

function parsearPolinomio(polyStr) {
    // Limpieza inicial
    let s = polyStr.replace(/\s+/g, '');
    
    // Algoritmo de Splitting Inteligente:
    // Corta por '+' o '-' PERO NO si están dentro de paréntesis ( )
    let terminos = [];
    let parentesis = 0;
    let buffer = "";
    
    // Normalizar signos al inicio
    if (s[0] !== '+' && s[0] !== '-') s = '+' + s;

    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        if (char === '(') parentesis++;
        if (char === ')') parentesis--;

        // Si encontramos signo y no estamos dentro de paréntesis, cortamos
        if ((char === '+' || char === '-') && parentesis === 0 && i > 0) {
            terminos.push(buffer);
            buffer = char; // El signo es parte del siguiente término
        } else {
            buffer += char;
        }
    }
    terminos.push(buffer); // Agregar último término

    // Procesar términos para extraer grado y coeficiente
    let coeficientesMap = {};
    let gradoMax = 0;

    terminos.forEach(term => {
        if (!term) return;
        
        let coefStr = "", grado = 0;
        
        if (term.includes('x')) {
            const parts = term.split('x');
            coefStr = parts[0];
            
            // Determinar grado
            if (parts[1] && parts[1].startsWith('^')) {
                grado = parseInt(parts[1].substring(1));
            } else {
                grado = 1;
            }
        } else {
            coefStr = term; // Término independiente
            grado = 0;
        }

        // Limpiar coeficiente (ej: "+", "-", "+(1+i)")
        if (coefStr === '+' || coefStr === '') coefStr = "1";
        else if (coefStr === '-') coefStr = "-1";
        else if (coefStr.endsWith('*')) coefStr = coefStr.slice(0, -1); // Caso 2*x

        const val = math.evaluate(coefStr);
        const complejo = (typeof val === 'number') ? new NumeroComplejo(val) : new NumeroComplejo(val.re, val.im);

        if (grado > gradoMax) gradoMax = grado;
        
        // Sumar si hay múltiples términos del mismo grado
        if (!coeficientesMap[grado]) coeficientesMap[grado] = new NumeroComplejo(0,0);
        coeficientesMap[grado] = coeficientesMap[grado].sumar(complejo);
    });

    // Convertir map a array ordenado
    let coefsArr = [];
    for (let i = gradoMax; i >= 0; i--) {
        coefsArr.push(coeficientesMap[i] || new NumeroComplejo(0));
    }
    
    return coefsArr;
}

// --- CORE: DIVISIÓN SINTÉTICA ---

function divisionSintetica(coeficientes, raiz) {
    let resultado = [];
    let procesoMultiplicacion = []; 
    
    let actual = coeficientes[0];
    resultado.push(actual);
    procesoMultiplicacion.push(new NumeroComplejo(0)); 

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

/* =========================================
   3. INTERFAZ DE USUARIO
   ========================================= */

function calcularDivision() {
    try {
        const poliStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!poliStr || !raizStr) throw new Error("Faltan datos");

        // 1. Parsear Raíz (Soporta 'i', '1+i', 'sqrt(2)')
        const raiz = parsearInputSeguro(raizStr);

        // 2. Parsear Polinomio (Soporta paréntesis en coeficientes)
        const coeficientes = parsearPolinomio(poliStr);

        // 3. Calcular
        const data = divisionSintetica(coeficientes, raiz);

        // 4. Renderizar
        renderTablaVaporwave(data);

    } catch (e) {
        const resDiv = document.getElementById('resultado');
        resDiv.innerHTML = `
            <div style="padding:15px; border:1px solid #ff3333; color:#ff3333; background:rgba(255,0,0,0.1); border-radius:8px; text-align:center;">
                <h4 style="margin:0">⚠️ ERROR</h4>
                <p>${e.message}</p>
            </div>
        `;
        resDiv.classList.add('show');
        resDiv.style.display = 'block';
    }
}

function renderTablaVaporwave(data) {
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
               <span style="color:var(--neon-pink); font-size:1.2em;">${data.res[data.res.length-1].toString()}</span>
            </p>
            <p style="font-size:0.9rem; color:#fff;">
               <strong>Polinomio Resultante:</strong> ${generarPolinomioResultante(data.res)}
            </p>
        </div>
    `;

    const resDiv = document.getElementById('resultado');
    resDiv.innerHTML = html;
    resDiv.style.display = 'block';
    resDiv.classList.add('show');
}

function generarPolinomioResultante(resultados) {
    const coefs = resultados.slice(0, -1);
    if(coefs.length === 0) return "0";

    let poli = "";
    for(let i=0; i<coefs.length; i++) {
        const grado = coefs.length - 1 - i;
        let val = coefs[i].toString();
        
        if(val === "0" && coefs.length > 1) continue; 
        
        // Poner paréntesis si es complejo para que se vea claro (a+bi)x
        if(val.includes('i') || val.includes('+') || (val.includes('-') && val.length > 2)) {
            val = `(${val})`;
        }
        
        if(i > 0 && !val.startsWith('-')) poli += " + ";
        
        poli += val;
        if(grado > 0) poli += "x";
        if(grado > 1) poli += `^${grado}`;
    }
    return poli || "0";
}

// Inicializar botón
document.getElementById('btn-calcular').addEventListener('click', calcularDivision);
