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

    // Matrix Rain Effect (Sutil)
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
   2. LÓGICA MATEMÁTICA (TU CÓDIGO ORIGINAL)
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
        // Formateo limpio para la tabla
        if (Math.abs(this.imag) < 1e-10) return Number(this.real.toFixed(4)).toString();
        
        const r = Number(this.real.toFixed(4));
        const i = Math.abs(this.imag).toFixed(4);
        
        if (Math.abs(this.real) < 1e-10) {
            return `${this.imag < 0 ? '-' : ''}${Number(i)}i`;
        }
        
        const signo = this.imag >= 0 ? '+' : '-';
        return `${r}${signo}${Number(i)}i`;
    }

    esReal() {
        return Math.abs(this.imag) < 1e-10;
    }
}

// --- PARSERS ORIGINALES ROBUSTOS ---

function parsearPolinomio(str) {
    str = str.trim().replace(/\s/g, '');
    
    // Encontrar grado máximo
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
    
    // Normalizar
    str = str.replace(/([+-])\s*x/g, '$1 1x');
    if (str.startsWith('x')) str = '1' + str;
    
    // Regex para extraer términos (incluso complejos entre paréntesis)
    // Simplificación: Asumimos formato estándar o usamos split inteligente
    // Tu lógica original usaba split por +-, aquí la adapto para ser más resiliente
    
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
        if(coeficientes[indice]) {
            coeficientes[indice] = coeficientes[indice].sumar(coef);
        }
    }
    return coeficientes;
}

function obtenerCoeficiente(parte) {
    if (parte === '' || parte === '+') return new NumeroComplejo(1);
    if (parte === '-') return new NumeroComplejo(-1);
    return parsearComplejo(parte);
}

function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '').replace(/^\+/, ''); // Limpieza
    
    if (!str.includes('i')) {
        return new NumeroComplejo(parseFloat(str) || 0);
    }

    str = str.replace(/i/g, '');
    if (str === '') return new NumeroComplejo(0, 1);
    if (str === '-') return new NumeroComplejo(0, -1);
    
    // Regex para separar real e imaginaria (ej: 3+2i, -5-4i)
    // Busca el último signo + o - que no esté al inicio
    let splitIdx = Math.max(str.lastIndexOf('+'), str.lastIndexOf('-'));
    
    let real = 0, imag = 0;
    
    if (splitIdx <= 0) { // Solo imaginario (ej: "2", "-2", "2.5")
        imag = parseFloat(str) || 1;
    } else {
        real = parseFloat(str.substring(0, splitIdx));
        imag = parseFloat(str.substring(splitIdx));
    }
    
    return new NumeroComplejo(real, imag);
}

// --- ALGORITMO DE DIVISIÓN ---

function divisionSintetica(coeficientes, raiz) {
    const n = coeficientes.length;
    const proceso = []; // Para guardar multiplicaciones
    const resultado = []; // Renglón final

    // Fila de multiplicaciones (el primero siempre es "vacío" o 0)
    proceso.push(new NumeroComplejo(0));
    
    // El primer coeficiente baja directo
    resultado.push(coeficientes[0]);
    
    for (let i = 1; i < n; i++) {
        const anterior = resultado[i - 1];
        const multiplicacion = anterior.multiplicar(raiz);
        
        proceso.push(multiplicacion); // Guardamos para mostrar en la tabla
        
        const suma = coeficientes[i].sumar(multiplicacion);
        resultado.push(suma);
    }

    return {
        coefs: coeficientes,
        mults: proceso,
        res: resultado,
        raiz: raiz
    };
}

/* =========================================
   3. INTERFAZ DE USUARIO (ESTILO VAPORWAVE)
   ========================================= */

function calcularDivision() {
    try {
        const poliStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!poliStr || !raizStr) throw new Error("Faltan datos");

        // Usar tus parsers manuales
        const coeficientes = parsearPolinomio(poliStr);
        const raiz = parsearComplejo(raizStr);

        // Ejecutar algoritmo
        const data = divisionSintetica(coeficientes, raiz);

        // Mostrar tabla bonita
        renderTablaVaporwave(data);

    } catch (e) {
        const resDiv = document.getElementById('resultado');
        resDiv.innerHTML = `<div style="padding:15px; border:1px solid red; color:red; background:rgba(255,0,0,0.1);">Error: ${e.message}</div>`;
        resDiv.classList.add('show');
    }
}

function renderTablaVaporwave(data) {
    // Construir la tabla HTML con las clases de estilo
    let html = `
        <h3 class="result-title" style="margin-top:0;">Tabla de División Sintética</h3>
        
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
                        // Si es el último, usamos clase residuo, si no, normal
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
               <strong>Cociente:</strong> ${generarPolinomioResultante(data.res)}
            </p>
        </div>
    `;

    const resDiv = document.getElementById('resultado');
    resDiv.innerHTML = html;
    resDiv.style.display = 'block'; // Asegurar que se vea
    resDiv.classList.add('show');
}

function generarPolinomioResultante(resultados) {
    // Quitamos el residuo
    const coefs = resultados.slice(0, -1);
    if(coefs.length === 0) return "0";

    let poli = "";
    for(let i=0; i<coefs.length; i++) {
        const grado = coefs.length - 1 - i;
        const val = coefs[i].toString();
        
        if(val === "0") continue; // Saltar ceros
        
        let termino = val;
        // Poner paréntesis si es complejo para claridad
        if(val.includes('i') || val.includes('+') || (val.includes('-') && i>0)) {
            termino = `(${val})`;
        }
        
        if(i > 0) poli += " + ";
        
        poli += termino;
        if(grado > 0) poli += "x";
        if(grado > 1) poli += `^${grado}`;
    }
    return poli || "0";
}

// Vinculación del botón 
document.getElementById('btn-calcular').addEventListener('click', calcularDivision);

// Helper para construir el string del cociente bonito
function generarTextoCociente(cociente) {
    let cocienteStr = '';
    for (let i = 0; i < cociente.length; i++) {
        const exp = cociente.length - 1 - i;
        const coef = cociente[i];
        
        if (coef.real !== 0 || coef.imag !== 0) {
            // Poner + si no es el primero
            if (cocienteStr && (coef.real > 0 || (coef.real === 0 && coef.imag > 0))) {
                cocienteStr += ' + ';
            }
            
            cocienteStr += '(' + coef.toString() + ')';
            
            if (exp > 0) {
                cocienteStr += 'x';
                if (exp > 1) cocienteStr += `<sup>${exp}</sup>`;
            }
        }
    }
    return cocienteStr || '0';
}

// IMPORTANTE: Asegurar que el botón llame a calcularDivision
document.addEventListener('DOMContentLoaded', () => {
    // Si el botón tiene onclick en el HTML, esto es redundante pero seguro
    const btn = document.querySelector('button'); 
    if(btn) btn.onclick = calcularDivision;
});
