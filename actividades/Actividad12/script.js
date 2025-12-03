// === Fondo synthwave con olas ===
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

// === LÓGICA MATEMÁTICA ORIGINAL ===

// Clase para manejar números complejos
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
            return this.real.toFixed(4).replace(/\.?0+$/, '');
        }
        
        const realStr = this.real.toFixed(4).replace(/\.?0+$/, '');
        const imagStr = Math.abs(this.imag).toFixed(4).replace(/\.?0+$/, '');
        
        if (this.real === 0) {
            return `${imagStr}i`;
        }
        
        const signo = this.imag >= 0 ? '+' : '-';
        return `${realStr}${signo}${imagStr}i`;
    }

    esReal() {
        return Math.abs(this.imag) < 1e-10;
    }
}

// Función para parsear un polinomio en formato algebraico
function parsearPolinomio(str) {
    str = str.trim().replace(/\s/g, '');
    
    // Encontrar el grado máximo
    const gradoMatch = str.match(/x\^(\d+)/g);
    let gradoMax = 1;
    
    if (gradoMatch) {
        gradoMax = Math.max(...gradoMatch.map(m => parseInt(m.match(/\d+/)[0])));
    } else if (str.includes('x')) {
        gradoMax = 1;
    } else {
        gradoMax = 0;
    }
    
    // Inicializar array de coeficientes con ceros
    const coeficientes = new Array(gradoMax + 1).fill(null).map(() => new NumeroComplejo(0));
    
    // Reemplazar términos implícitos
    str = str.replace(/([+-])\s*x/g, '$1 1x');
    str = str.replace(/^x/, '1x');
    
    // Extraer términos
    const terminos = str.match(/[+-]?[^+-]+/g) || [];
    
    for (let termino of terminos) {
        termino = termino.trim();
        
        if (!termino) continue;
        
        let coef, grado;
        
        if (!termino.includes('x')) {
            // Término independiente
            coef = parsearComplejo(termino);
            grado = 0;
        } else if (termino.includes('x^')) {
            // Término con exponente explícito
            const partes = termino.split('x^');
            coef = partes[0] === '' || partes[0] === '+' ? new NumeroComplejo(1) : 
                   partes[0] === '-' ? new NumeroComplejo(-1) : 
                   parsearComplejo(partes[0]);
            grado = parseInt(partes[1]);
        } else {
            // Término con x (grado 1)
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

// Función para parsear números complejos
function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '');
    
    if (!str.includes('i')) {
        return new NumeroComplejo(parseFloat(str));
    }

    str = str.replace(/i/g, '');
    
    let real = 0;
    let imag = 0;

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

// Función principal para calcular la división
function calcularDivision() {
    try {
        const polinomioStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!polinomioStr || !raizStr) {
            throw new Error('Por favor ingresa todos los datos');
        }

        const coeficientes = parsearPolinomio(polinomioStr);
        const raiz = parsearComplejo(raizStr);

        const resultado = divisionSintetica(coeficientes, raiz);
        mostrarResultado(resultado, coeficientes, raiz, polinomioStr);

    } catch (error) {
        document.getElementById('resultado').innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
        document.getElementById('resultado').classList.add('show');
    }
}

// Algoritmo de división sintética
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

// Función para mostrar el resultado en HTML
function mostrarResultado(resultado, coeficientes, raiz, polinomioOriginal) {
    let html = '<div class="result-title">Polinomio Original</div>';
    html += '<div style="text-align: center; font-size: 1.2em; margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.1); border: 1px solid #00ffe7; border-radius: 4px; color: #00ffe7;">';
    html += '<strong>' + polinomioOriginal + '</strong>';
    html += '</div>';

    html += '<div class="result-title">Coeficientes Extraídos</div>';
    html += '<table class="process-table" style="margin-bottom: 30px;">';
    html += '<tr>';
    for (let i = 0; i < coeficientes.length; i++) {
        const exp = coeficientes.length - 1 - i;
        html += '<td><strong>';
        if (exp === 0) {
            html += 'Término independiente';
        } else if (exp === 1) {
            html += 'x';
        } else {
            html += 'x<sup>' + exp + '</sup>';
        }
        html += '</strong></td>';
    }
    html += '</tr>';
    html += '<tr>';
    coeficientes.forEach(c => {
        html += '<td>' + c.toString() + '</td>';
    });
    html += '</tr>';
    html += '</table>';

    html += '<div class="result-title">Proceso de División Sintética</div>';

    html += '<table class="process-table">';
    
    html += '<tr><td class="divisor-cell">Divisor: ' + raiz.toString() + '</td>';
    coeficientes.forEach(c => {
        html += '<td>' + c.toString() + '</td>';
    });
    html += '</tr>';

    html += '<tr><td class="divisor-cell">Multiplicar y bajar</td>';
    resultado.proceso[1].forEach(p => {
        html += '<td>' + p.toString() + '</td>';
    });
    html += '</tr>';

    html += '<tr><td class="divisor-cell">Resultado (sumar)</td>';
    resultado.resultado.forEach(r => {
        html += '<td>' + r.toString() + '</td>';
    });
    html += '</tr>';

    html += '</table>';

    html += '<div class="final-result">';
    html += '<p><strong>Cociente:</strong> ';
    
    let cocienteStr = '';
    for (let i = 0; i < resultado.cociente.length; i++) {
        const exp = resultado.cociente.length - 1 - i;
        const coef = resultado.cociente[i];
        
        if (coef.real !== 0 || coef.imag !== 0) {
            if (cocienteStr && (coef.real > 0 || (coef.real === 0 && coef.imag > 0))) {
                cocienteStr += ' + ';
            }
            
            cocienteStr += '(' + coef.toString() + ')';
            
            if (exp > 0) {
                cocienteStr += 'x';
                if (exp > 1) {
                    cocienteStr += '<sup>' + exp + '</sup>';
                }
            }
        }
    }
    
    html += cocienteStr || '0';
    html += '</p>';
    
    html += '<p><strong>Residuo:</strong> ' + resultado.residuo.toString() + '</p>';
    
    if (resultado.residuo.esReal() && Math.abs(resultado.residuo.real) < 1e-10) {
        html += '<p style="color: #333; font-weight: 600;">✓ La división es exacta (residuo = 0)</p>';
    }
    
    html += '</div>';

    document.getElementById('resultado').innerHTML = html;
    document.getElementById('resultado').classList.add('show');
}
