/* =========================================
   LÓGICA DE PRODUCTOS NOTABLES (VAPORWAVE EDITION)
   ========================================= */

// Elementos del DOM
const btnCalcular = document.getElementById('calcular');
const selectTipo = document.getElementById('tipo');
const selectModo = document.getElementById('modo');
const inputA = document.getElementById('valor-a');
const inputB = document.getElementById('valor-b');
const btnLimpiarHistorial = document.getElementById('limpiar-historial');
const canvas = document.getElementById('canvas-geometrico');

// Elementos de resultados
const expresionOriginal = document.getElementById('expresion-original');
const formula = document.getElementById('formula');
const desarrollo = document.getElementById('desarrollo');
const expandida = document.getElementById('expandida');
const resultadoNumerico = document.getElementById('resultado-numerico');
const verificacion = document.getElementById('verificacion');
const descripcionGeometrica = document.getElementById('descripcion-geometrica');
const historialDiv = document.getElementById('historial');

// Variables globales
let historialCalculos = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarHistorial();
    mostrarHistorial();
    
    btnCalcular.addEventListener('click', calcular);
    btnLimpiarHistorial.addEventListener('click', limpiarHistorial);
    selectModo.addEventListener('change', actualizarPlaceholders);
    
    actualizarPlaceholders(); // Set inicial
});

function actualizarPlaceholders() {
    const modo = selectModo.value;
    if (modo === 'numerico') {
        inputA.placeholder = 'Ej: 3';
        inputB.placeholder = 'Ej: 2';
        inputA.value = '3'; // Valor por defecto para demo
        inputB.value = '2';
    } else {
        inputA.placeholder = 'Ej: 3x';
        inputB.placeholder = 'Ej: 5y';
        inputA.value = '3x';
        inputB.value = '5y';
    }
}

// --- LÓGICA PRINCIPAL ---

function calcular() {
    const tipo = selectTipo.value;
    const modo = selectModo.value;
    const aVal = inputA.value.trim();
    const bVal = inputB.value.trim();

    if (!aVal || !bVal) {
        return alert('⚠️ Por favor ingresa valores en ambos campos');
    }

    try {
        let resultado;

        if (modo === 'numerico') {
            resultado = calcularNumerico(tipo, aVal, bVal);
        } else {
            resultado = calcularAlgebraico(tipo, aVal, bVal);
        }

        mostrarResultados(resultado);
        
        // Manejo del Canvas
        if (modo === 'numerico') {
            dibujarGeometria(tipo, parseFloat(aVal), parseFloat(bVal), resultado);
        } else {
            limpiarCanvas(true); // Mostrar mensaje de "Solo numérico"
        }
        
        agregarAlHistorial(resultado);
        
    } catch (error) {
        alert('❌ Error en el cálculo: ' + error.message);
        console.error(error);
    }
}

// --- CÁLCULOS NUMÉRICOS (Lógica Original) ---

function calcularNumerico(tipo, aStr, bStr) {
    const a = parseFloat(aStr);
    const b = parseFloat(bStr);

    if (isNaN(a) || isNaN(b)) throw new Error('Los valores deben ser numéricos');

    // Cálculos auxiliares comunes
    const a2 = a * a;
    const b2 = b * b;
    const ab2 = 2 * a * b; // 2ab
    
    let res = {};

    switch(tipo) {
        case 'binomio-cuadrado-suma':
            res.final = a2 + ab2 + b2;
            res.directo = Math.pow(a + b, 2);
            res.expresion = `(${a} + ${b})²`;
            res.formula = '(a + b)² = a² + 2ab + b²';
            res.expandida = `${a2} + ${ab2} + ${b2}`;
            res.pasos = [
                `Identificar a=${a}, b=${b}`,
                `a² = ${a}² = ${a2}`,
                `2ab = 2(${a})(${b}) = ${ab2}`,
                `b² = ${b}² = ${b2}`,
                `Suma: ${a2} + ${ab2} + ${b2} = ${res.final}`
            ];
            break;

        case 'binomio-cuadrado-resta':
            res.final = a2 - ab2 + b2;
            res.directo = Math.pow(a - b, 2);
            res.expresion = `(${a} - ${b})²`;
            res.formula = '(a - b)² = a² - 2ab + b²';
            res.expandida = `${a2} - ${ab2} + ${b2}`;
            res.pasos = [
                `Identificar a=${a}, b=${b}`,
                `a² = ${a}² = ${a2}`,
                `2ab = 2(${a})(${b}) = ${ab2}`,
                `b² = ${b}² = ${b2}`,
                `Resta y suma: ${a2} - ${ab2} + ${b2} = ${res.final}`
            ];
            break;

        case 'binomio-cubo-suma':
            const a3 = Math.pow(a, 3);
            const b3 = Math.pow(b, 3);
            const a2b3 = 3 * a2 * b;
            const ab23 = 3 * a * b2;
            res.final = a3 + a2b3 + ab23 + b3;
            res.directo = Math.pow(a + b, 3);
            res.expresion = `(${a} + ${b})³`;
            res.formula = '(a + b)³ = a³ + 3a²b + 3ab² + b³';
            res.expandida = `${a3} + ${a2b3} + ${ab23} + ${b3}`;
            res.pasos = [`a³=${a3}`, `3a²b=${a2b3}`, `3ab²=${ab23}`, `b³=${b3}`, `Suma total: ${res.final}`];
            break;

        case 'binomio-cubo-resta':
            const ac3 = Math.pow(a, 3);
            const bc3 = Math.pow(b, 3);
            const ac2b3 = 3 * a2 * b;
            const abc23 = 3 * a * b2;
            res.final = ac3 - ac2b3 + abc23 - bc3;
            res.directo = Math.pow(a - b, 3);
            res.expresion = `(${a} - ${b})³`;
            res.formula = '(a - b)³ = a³ - 3a²b + 3ab² - b³';
            res.expandida = `${ac3} - ${ac2b3} + ${abc23} - ${bc3}`;
            res.pasos = [`a³=${ac3}`, `3a²b=${ac2b3}`, `3ab²=${abc23}`, `b³=${bc3}`, `Alternar signos: ${res.final}`];
            break;

        case 'termino-comun': // (x+a)(x+b) -> asumimos x=1 para ejemplo numérico base
            const suma = a + b;
            const prod = a * b;
            // Para visualización numérica simple usamos x=10 por convención para que sea visible
            const x = 10; 
            res.final = (x+a)*(x+b);
            res.directo = (x+a)*(x+b);
            res.expresion = `(${x} + ${a})(${x} + ${b})`;
            res.formula = '(x + a)(x + b) = x² + (a+b)x + ab';
            res.expandida = `${x*x} + ${suma*x} + ${prod}`;
            res.pasos = [`Asumiendo x=${x}`, `x² = 100`, `Suma (a+b) = ${suma}`, `Producto ab = ${prod}`, `Resultado: ${res.final}`];
            break;

        case 'conjugados':
            res.final = a2 - b2;
            res.directo = (a+b)*(a-b);
            res.expresion = `(${a} + ${b})(${a} - ${b})`;
            res.formula = '(a + b)(a - b) = a² - b²';
            res.expandida = `${a2} - ${b2}`;
            res.pasos = [`a² = ${a2}`, `b² = ${b2}`, `Diferencia: ${res.final}`];
            break;
    }

    res.tipo = tipo;
    res.numerico = res.final.toFixed(4);
    res.verificacion = Math.abs(res.final - res.directo) < 0.0001;
    res.resultadoDirecto = res.directo.toFixed(4);
    
    return res;
}

// --- CÁLCULOS ALGEBRAICOS (Math.js) ---

function calcularAlgebraico(tipo, a, b) {
    let expr, formula, pasos = [];
    
    try {
        switch(tipo) {
            case 'binomio-cuadrado-suma':
                expr = `(${a} + ${b})^2`;
                formula = '(a + b)² = a² + 2ab + b²';
                pasos.push(`Cuadrado del primero: (${a})^2`);
                pasos.push(`Doble del primero por el segundo: 2(${a})(${b})`);
                pasos.push(`Cuadrado del segundo: (${b})^2`);
                break;
            case 'binomio-cuadrado-resta':
                expr = `(${a} - ${b})^2`;
                formula = '(a - b)² = a² - 2ab + b²';
                pasos.push(`Cuadrado del primero: (${a})^2`);
                pasos.push(`Menos doble del primero por el segundo: -2(${a})(${b})`);
                pasos.push(`Cuadrado del segundo: (${b})^2`);
                break;
            case 'binomio-cubo-suma':
                expr = `(${a} + ${b})^3`;
                formula = '(a+b)³ = a³ + 3a²b + 3ab² + b³';
                pasos.push("Desarrollo cúbico estándar");
                break;
            case 'binomio-cubo-resta':
                expr = `(${a} - ${b})^3`;
                formula = '(a-b)³ = a³ - 3a²b + 3ab² - b³';
                pasos.push("Desarrollo cúbico con signos alternos");
                break;
            case 'termino-comun':
                expr = `(x + ${a}) * (x + ${b})`;
                formula = '(x+a)(x+b) = x² + (a+b)x + ab';
                pasos.push(`Suma de no comunes: ${a} + ${b}`);
                pasos.push(`Producto de no comunes: (${a})(${b})`);
                break;
            case 'conjugados':
                expr = `(${a} + ${b}) * (${a} - ${b})`;
                formula = '(a+b)(a-b) = a² - b²';
                pasos.push(`Cuadrado del primero menos cuadrado del segundo`);
                break;
        }

        const expandido = math.simplify(expr).toString();
        
        return {
            tipo: tipo,
            expresion: expr.replace('*', ''),
            formula: formula,
            pasos: pasos,
            expandida: expandido,
            numerico: 'N/A (Modo Algebraico)',
            verificacion: true,
            resultadoDirecto: expandido
        };
    } catch (e) {
        throw new Error("Expresión algebraica inválida. Revisa la sintaxis.");
    }
}

// --- VISUALIZACIÓN Y DOM ---

function mostrarResultados(res) {
    // 1. Mostrar paneles
    document.querySelector('.results-grid').style.display = 'grid';
    
    // 2. Llenar datos
    expresionOriginal.textContent = res.expresion;
    formula.textContent = res.formula;
    expandida.textContent = res.expandida;
    resultadoNumerico.textContent = res.numerico;

    // 3. Pasos
    desarrollo.innerHTML = '';
    res.pasos.forEach(paso => {
        const p = document.createElement('div');
        p.className = 'step-item';
        p.textContent = `> ${paso}`;
        desarrollo.appendChild(p);
    });

    // 4. Verificación
    if (res.verificacion) {
        verificacion.innerHTML = `✓ CORRECTO: ${res.resultadoDirecto}`;
        verificacion.className = 'verificacion-box success';
    } else {
        verificacion.innerHTML = `✗ ERROR DE CÁLCULO`;
        verificacion.className = 'verificacion-box error';
    }
}

// --- DIBUJO GEOMÉTRICO NEÓN ---

function limpiarCanvas(mostrarMensaje = false) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    descripcionGeometrica.textContent = '';
    
    if (mostrarMensaje) {
        ctx.fillStyle = '#666';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Visualización disponible', canvas.width/2, canvas.height/2 - 10);
        ctx.fillText('solo en modo numérico', canvas.width/2, canvas.height/2 + 10);
    }
}

function dibujarGeometria(tipo, a, b, res) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Colores Vaporwave
    const c1 = '#01cdfe'; // Cian
    const c2 = '#ff71ce'; // Rosa
    const c3 = '#b967ff'; // Morado
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 30; // Escala de píxeles

    ctx.lineWidth = 2;
    ctx.font = '14px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (tipo.includes('cuadrado')) {
        // Lógica para Binomio al Cuadrado (el cuadrado grande subdividido)
        // Usamos Math.abs para b en caso de resta para dibujar las áreas positivas
        const bAbs = Math.abs(b);
        const totalSize = (a + bAbs) * scale;
        const sa = a * scale;
        const sb = bAbs * scale;
        
        // Centrar
        const startX = cx - totalSize/2;
        const startY = cy - totalSize/2;

        // Cuadrado A (a^2)
        ctx.strokeStyle = c1;
        ctx.fillStyle = 'rgba(1, 205, 254, 0.1)';
        ctx.fillRect(startX, startY, sa, sa);
        ctx.strokeRect(startX, startY, sa, sa);
        ctx.fillStyle = c1; 
        ctx.fillText('a²', startX + sa/2, startY + sa/2);

        // Rectángulo AB 1
        ctx.strokeStyle = c3;
        ctx.fillStyle = 'rgba(185, 103, 255, 0.1)';
        ctx.fillRect(startX + sa, startY, sb, sa);
        ctx.strokeRect(startX + sa, startY, sb, sa);
        ctx.fillStyle = c3;
        ctx.fillText('ab', startX + sa + sb/2, startY + sa/2);

        // Rectángulo AB 2
        ctx.fillRect(startX, startY + sa, sa, sb);
        ctx.strokeRect(startX, startY + sa, sa, sb);
        ctx.fillText('ab', startX + sa/2, startY + sa + sb/2);

        // Cuadrado B (b^2)
        ctx.strokeStyle = c2;
        ctx.fillStyle = 'rgba(255, 113, 206, 0.1)';
        ctx.fillRect(startX + sa, startY + sa, sb, sb);
        ctx.strokeRect(startX + sa, startY + sa, sb, sb);
        ctx.fillStyle = c2;
        ctx.fillText('b²', startX + sa + sb/2, startY + sa + sb/2);

        descripcionGeometrica.textContent = `Área Total = (${a} + ${b})² = ${res.numerico}`;

    } else if (tipo === 'conjugados') {
        // Diferencia de cuadrados
        const sa = a * scale;
        const sb = b * scale;
        
        // Cuadrado A
        ctx.strokeStyle = c1;
        ctx.fillStyle = 'rgba(1, 205, 254, 0.1)';
        ctx.fillRect(cx - sa/2, cy - sa/2, sa, sa);
        ctx.strokeRect(cx - sa/2, cy - sa/2, sa, sa);
        ctx.fillStyle = c1;
        ctx.fillText('a²', cx - sa/2 + 20, cy - sa/2 + 20);

        // Cuadrado B (restado - línea punteada roja/rosa)
        ctx.strokeStyle = '#ff3333';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(cx + sa/2 - sb, cy + sa/2 - sb, sb, sb);
        ctx.setLineDash([]);
        ctx.fillStyle = '#ff3333';
        ctx.fillText('-b²', cx + sa/2 - sb/2, cy + sa/2 - sb/2);
        
        descripcionGeometrica.textContent = `Área Azul - Área Roja = ${res.numerico}`;

    } else {
        // Para cubos o términos complejos no graficamos 2D simple
        limpiarCanvas();
        const ctx2 = canvas.getContext('2d');
        ctx2.fillStyle = '#888';
        ctx2.fillText('Geometría 3D/Compleja', cx, cy);
        ctx2.fillText('no disponible en 2D', cx, cy+20);
    }
}

// --- HISTORIAL ---

function agregarAlHistorial(item) {
    const log = {
        fecha: new Date().toLocaleTimeString(),
        tipo: item.tipo,
        entrada: item.expresion,
        salida: item.expandida || item.numerico
    };
    
    historialCalculos.unshift(log);
    if(historialCalculos.length > 10) historialCalculos.pop();
    
    localStorage.setItem('historialProductosNotables', JSON.stringify(historialCalculos));
    mostrarHistorial();
}

function mostrarHistorial() {
    historialDiv.innerHTML = '';
    if (historialCalculos.length === 0) {
        historialDiv.innerHTML = '<div style="text-align:center; color:gray; padding:10px;">[LOG VACÍO]</div>';
        return;
    }

    historialCalculos.forEach(log => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `
            <span class="log-time">[${log.fecha}]</span> 
            <span style="color:var(--neon-blue)">${log.tipo}</span><br>
            REQ: ${log.entrada}<br>
            RES: <span style="color:var(--neon-pink)">${log.salida}</span>
        `;
        historialDiv.appendChild(div);
    });
}

function cargarHistorial() {
    const guardado = localStorage.getItem('historialProductosNotables');
    if (guardado) historialCalculos = JSON.parse(guardado);
}

function limpiarHistorial() {
    if(confirm('¿Borrar logs del sistema?')) {
        historialCalculos = [];
        localStorage.removeItem('historialProductosNotables');
        mostrarHistorial();
    }
}