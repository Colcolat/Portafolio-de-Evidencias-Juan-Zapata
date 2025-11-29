/* ==================== VARIABLES GLOBALES ==================== */
let points = [];
let currentRange = 10;

/* ==================== CONSTANTES MATEMÁTICAS ==================== */
const CONSTANTS = {
    'π': Math.PI, 'pi': Math.PI,
    'e': Math.E,
    'φ': (1 + Math.sqrt(5)) / 2, 'phi': (1 + Math.sqrt(5)) / 2,
    'τ': 2 * Math.PI, 'tau': 2 * Math.PI,
    'ln2': Math.LN2, 'ln10': Math.LN10,
    '√2': Math.sqrt(2), '√3': Math.sqrt(3), '√5': Math.sqrt(5),
    '-√2': -Math.sqrt(2), '-√3': -Math.sqrt(3), '-√5': -Math.sqrt(5)
};

// ========== FUNCIONES DE PARSING Y LÓGICA ==========

function parseNumber(input) {
    input = input.trim().replace(/\s+/g, '');
    if (CONSTANTS.hasOwnProperty(input)) return CONSTANTS[input];

    let processedInput = input;
    for (const [symbol, value] of Object.entries(CONSTANTS)) {
        const regex = new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        processedInput = processedInput.replace(regex, value.toString());
    }

    try {
        // Manejo básico de sqrt() y fracciones
        if (input.includes('sqrt(')) {
             // Lógica simplificada para el ejemplo, manteniendo tu estructura robusta
             const inner = input.match(/sqrt\(([^)]+)\)/)[1];
             return Math.sqrt(eval(inner)); // Nota: eval es peligroso en prod, pero ok para tarea escolar
        }
        
        processedInput = processedInput.replace(/\^/g, '**');
        const safeChars = /^[0-9+\-*/.() ]+$/;
        if (safeChars.test(processedInput)) {
            return Function('"use strict"; return (' + processedInput + ')')();
        }
    } catch (e) { console.error(e); }

    const num = parseFloat(processedInput);
    return !isNaN(num) ? num : null;
}

function classifyNumber(num, originalInput) {
    // Lógica de clasificación (Simplificada para mantener el script limpio, usa tu lógica original si prefieres)
    if (num > 0 && Number.isInteger(num)) return 'naturals';
    if (Number.isInteger(num)) return 'integers';
    
    // Lista de irracionales conocidos
    const irrationals = ['π', 'pi', 'e', 'φ', 'phi', '√2', '√3', '√5'];
    if (irrationals.some(i => originalInput.includes(i)) || originalInput.includes('sqrt')) return 'irrationals';
    
    return 'rationals';
}

function getClassificationName(classification) {
    const names = {
        'naturals': 'ℕ (Naturales)',
        'integers': 'ℤ (Enteros)',
        'rationals': 'ℚ (Racionales)',
        'irrationals': 'ℝ-ℚ (Irracionales)'
    };
    return names[classification] || 'Desconocido';
}

// ========== INTERFAZ DE USUARIO ==========

function addNumber() {
    const input = document.getElementById('numberInput').value;
    if (!input) return alert('Ingresa un número');
    
    const value = parseNumber(input);
    if (value === null) return alert('Formato inválido');
    
    if (Math.abs(value) > currentRange) return alert('Fuera de rango (-10 a 10)');
    
    const classification = classifyNumber(value, input);
    
    points.push({ value, originalInput: input, classification });
    document.getElementById('numberInput').value = '';
    updateDisplay();
}

function addPresetNumber(input) {
    document.getElementById('numberInput').value = input;
    addNumber();
}

function clearAll() {
    points = [];
    updateDisplay();
}

function updateDisplay() {
    drawNumberLine();
    updatePointsList();
    updateDistanceSelectors();
}

// ========== DIBUJADO (VISUALIZACIÓN) ==========

function drawNumberLine() {
    const numberLine = document.getElementById('numberLine');
    numberLine.innerHTML = '';
    
    // Línea base
    const line = document.createElement('div');
    line.className = 'line';
    numberLine.appendChild(line);
    
    // Tics
    const tickCount = currentRange * 2 + 1;
    for (let i = 0; i < tickCount; i++) {
        const value = -currentRange + i;
        const percentage = (i / (tickCount - 1)) * 90 + 5;
        
        const tick = document.createElement('div');
        tick.className = 'tick';
        tick.style.left = percentage + '%';
        
        const label = document.createElement('div');
        label.className = 'tick-label';
        label.style.left = percentage + '%';
        label.textContent = value;
        
        numberLine.appendChild(tick);
        numberLine.appendChild(label);
    }
    
    // Puntos
    points.forEach((point, index) => {
        const percentage = ((point.value + currentRange) / (2 * currentRange)) * 90 + 5;
        
        const pointElement = document.createElement('div');
        pointElement.className = `number-point ${point.classification}`;
        pointElement.style.left = percentage + '%';
        pointElement.onclick = () => removePoint(index);
        
        // Tooltip simple
        pointElement.title = `${point.originalInput} (${point.value.toFixed(2)})`;
        
        const label = document.createElement('div');
        label.className = 'point-label';
        label.textContent = point.originalInput;
        pointElement.appendChild(label);
        
        numberLine.appendChild(pointElement);
    });
}

function removePoint(index) {
    if(confirm('¿Eliminar punto?')) {
        points.splice(index, 1);
        updateDisplay();
    }
}

function updatePointsList() {
    const list = document.getElementById('pointsList');
    if (points.length === 0) {
        list.innerHTML = '<p style="text-align:center; color: var(--text-dim)">Lista vacía</p>';
        return;
    }
    
    const sorted = [...points].sort((a, b) => a.value - b.value);
    list.innerHTML = sorted.map(p => `
        <div class="point-item" style="border-left: 3px solid var(--neon-${getColorName(p.classification)})">
            <strong>${p.originalInput}</strong> <small>(${getClassificationName(p.classification)})</small>
            <span style="float:right">${p.value.toFixed(3)}</span>
        </div>
    `).join('');
}

// Helper para mapear tus clases a mis colores variables en CSS
function getColorName(classification) {
    const map = { 'naturals': 'pink', 'integers': 'blue', 'rationals': 'purple', 'irrationals': 'green' };
    return map[classification] || 'blue';
}

// ========== CALCULADORA DISTANCIAS ==========
// (He simplificado la lógica de selectores nativos para que sea más robusta y fácil de mantener con CSS puro,
// pero manteniendo tu funcionalidad)

function updateDistanceSelectors() {
    const selA = document.getElementById('selectPointA');
    const selB = document.getElementById('selectPointB');
    
    const options = '<option value="">Selecciona...</option>' + 
        points.map((p, i) => `<option value="${i}">${p.originalInput} (${p.value.toFixed(2)})</option>`).join('');
        
    selA.innerHTML = options;
    selB.innerHTML = options;
}

function calculateDistance() {
    const idxA = document.getElementById('selectPointA').value;
    const idxB = document.getElementById('selectPointB').value;
    
    if(!idxA || !idxB || idxA === idxB) {
        document.getElementById('distanceResult').innerHTML = '<span class="error">Selecciona dos puntos distintos.</span>';
        return;
    }
    
    const valA = points[idxA].value;
    const valB = points[idxB].value;
    const dist = Math.abs(valA - valB);
    
    document.getElementById('distanceResult').innerHTML = `
        <div class="result-box">
            | ${valA.toFixed(3)} - ${valB.toFixed(3)} | = <strong>${dist.toFixed(4)}</strong> u
        </div>
    `;
}

// Init
window.onload = function() {
    drawNumberLine();
    document.getElementById('numberInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNumber();
    });
};