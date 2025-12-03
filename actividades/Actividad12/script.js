/* =========================================
   FONDO ANIMADO (TU CÓDIGO ORIGINAL)
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
  const sunR = canvas.height * 0.25;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 50, sunX, sunY, sunR);
  sunGrad.addColorStop(0, "#ff00ff");
  sunGrad.addColorStop(0.5, "#ff0080");
  sunGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  const symbols = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rows = 8;
  const baseFontSize = 16;
  const waveHeight = 30;
  const waveLength = 300;

  for (let r = 0; r < rows; r++) {
    let yBase = canvas.height * (0.7 + (r / rows) * 0.3);
    let alpha = 0.4;
    let fontSize = baseFontSize + (rows - r);
    ctx.font = fontSize + "px monospace";
    ctx.fillStyle = `rgba(${r % 2 === 0 ? "0,255,255" : "255,0,255"}, ${alpha})`;

    for (let x = 0; x < canvas.width; x += fontSize * 1.5) {
      let yOffset = Math.sin((x * 2 + time + r * 100) / waveLength) * waveHeight;
      let y = yBase + yOffset;
      const text = symbols[Math.floor(Math.random() * symbols.length)];
      ctx.fillText(text, x, y);
    }
  }

  time += 0.01 * waveLength;
  requestAnimationFrame(drawBackground);
}
drawBackground();

/* =========================================
   LÓGICA MATEMÁTICA (TU CÓDIGO ORIGINAL)
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
        if (this.imag === 0) return this.real.toFixed(4).replace(/\.?0+$/, '');
        
        const realStr = this.real.toFixed(4).replace(/\.?0+$/, '');
        const imagStr = Math.abs(this.imag).toFixed(4).replace(/\.?0+$/, '');
        
        if (this.real === 0) return `${imagStr}i`;
        
        const signo = this.imag >= 0 ? '+' : '-';
        return `${realStr}${signo}${imagStr}i`;
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
    str = str.replace(/^x/, '1x');
    
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
            coef = partes[0] === '' || partes[0] === '+' ? new NumeroComplejo(1) : 
                   partes[0] === '-' ? new NumeroComplejo(-1) : 
                   parsearComplejo(partes[0]);
            grado = parseInt(partes[1]);
        } else {
            const partes = termino.split('x');
            coef = partes[0] === '' || partes[0] === '+' ? new NumeroComplejo(1) : 
                   partes[0] === '-' ? new NumeroComplejo(-1) : 
                   parsearComplejo(partes[0]);
            grado = 1;
        }
        const indice = gradoMax - grado;
        coeficientes[indice] = coeficientes[indice].sumar(coef);
    }
    return coeficientes;
}

function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '');
    if (!str.includes('i')) return new NumeroComplejo(parseFloat(str));

    str = str.replace(/i/g, '');
    let real = 0, imag = 0;
    const regex = /([+-]?\d*\.?\d+)([+-]\d*\.?\d+)?/;
    const match = str.match(regex);

    if (match) {
        if (str.indexOf('+') > 0 || (str.indexOf('-') > 0 && str.indexOf('-') !== 0)) {
            const partes = str.split(/(?=[+-])/);
            real = parseFloat(partes[0]) || 0;
            imag = parseFloat(partes[1]) || 1;
        } else {
            imag = parseFloat(str) || 1;
        }
    }
    return new NumeroComplejo(real, imag);
}

function divisionSintetica(coeficientes, raiz) {
    const n = coeficientes.length;
    const proceso = [];
    const resultado = [];

    proceso.push([...coeficientes]);
    proceso.push([new NumeroComplejo(0)]);
    
    resultado.push(coeficientes[0]);
    
    for (let i = 1; i < n; i++) {
        const producto = resultado[i - 1].multiplicar(raiz);
        proceso[1].push(producto);
        resultado.push(coeficientes[i].sumar(producto));
    }

    const cociente = resultado.slice(0, -1);
    const residuo = resultado[resultado.length - 1];

    return {
        proceso: proceso,
        resultado: resultado,
        cociente: cociente,
        residuo: residuo
    };
}

/* =========================================
   3. ADAPTACIÓN VISUAL (AQUÍ ESTÁ LA MAGIA)
   ========================================= */

function calcularDivision() {
    try {
        const polinomioStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!polinomioStr || !raizStr) throw new Error('Por favor ingresa todos los datos');

        const coeficientes = parsearPolinomio(polinomioStr);
        const raiz = parsearComplejo(raizStr);

        const resultado = divisionSintetica(coeficientes, raiz);
        
        // Llamamos a la función adaptada
        mostrarResultadoAdaptado(resultado, coeficientes, raiz, polinomioStr);

    } catch (error) {
        const resDiv = document.getElementById('resultado');
        resDiv.innerHTML = `
            <div style="padding:15px; border:1px solid #ff3333; color:#ff3333; background:rgba(255,0,0,0.1); border-radius:8px; text-align:center;">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
        resDiv.classList.add('show');
        resDiv.style.display = 'block';
    }
}

// Esta función usa TU lógica de datos, pero genera el HTML con las clases de NUESTRO diseño
function mostrarResultadoAdaptado(resultado, coeficientes, raiz, polinomioOriginal) {
    let html = `
        <h3 class="result-title" style="margin-top:0; text-align:center; color:#00ffe7;">Resultados</h3>
        
        <div style="overflow-x:auto;">
            <table class="synth-table">
                <tr>
                    <td class="residuo-cell" style="border-right:3px solid var(--neon-pink);">
                        <strong>r = ${raiz.toString()}</strong>
                    </td>
                    ${coeficientes.map(c => `<td>${c.toString()}</td>`).join('')}
                </tr>
                
                <tr>
                    <td style="border-right:3px solid var(--neon-pink);">↓</td>
                    ${resultado.proceso[1].map(p => `<td style="color:#aaa;">${p.toString()}</td>`).join('')}
                </tr>

                <tr style="border-top: 2px solid #00ffe7;">
                    <td style="border-right:3px solid var(--neon-pink); color:#aaa;">Cocientes</td>
                    ${resultado.resultado.map((r, i) => {
                        const esUltimo = i === resultado.resultado.length - 1;
                        return `<td class="${esUltimo ? 'residuo-cell' : 'result-cell'}">
                                    ${r.toString()}
                                </td>`;
                    }).join('')}
                </tr>
            </table>
        </div>

        <div class="final-result-box">
            <p><strong>Residuo:</strong> 
               <span style="color:#ff00ff; font-size:1.2em;">${resultado.residuo.toString()}</span>
            </p>
            <p style="font-size:0.9rem; color:#fff;">
               <strong>Cociente:</strong> ${generarTextoCociente(resultado.cociente)}
            </p>
        </div>
    `;

    const resDiv = document.getElementById('resultado');
    resDiv.innerHTML = html;
    resDiv.style.display = 'block';
    resDiv.classList.add('show');
}

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
