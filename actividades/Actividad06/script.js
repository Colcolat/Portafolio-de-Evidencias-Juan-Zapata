/* =========================================
   LÓGICA DE CONVERSIÓN DE EXPRESIONES
   ========================================= */

let patternsData = null;
let conversionHistory = [];
let stats = {
    totalConversions: 0,
    satisfactoryConversions: 0,
    totalPatterns: 0,
    fileSize: 0,
    lastUpdate: null
};

// Patrones por defecto
const defaultPatterns = {
    "patterns": [
        { "id": 1, "natural": "La suma de {var1} y {var2}", "algebraic": "{var1} + {var2}", "category": "basico" },
        { "id": 2, "natural": "La resta de {var1} y {var2}", "algebraic": "{var1} - {var2}", "category": "basico" },
        { "id": 3, "natural": "El producto de {var1} por {var2}", "algebraic": "{var1} * {var2}", "category": "basico" },
        { "id": 4, "natural": "El cociente de {var1} sobre {var2}", "algebraic": "{var1} / {var2}", "category": "basico" },
        { "id": 5, "natural": "El cuadrado de {var1}", "algebraic": "{var1}^2", "category": "potencia" },
        { "id": 6, "natural": "La raiz cuadrada de {var1}", "algebraic": "sqrt({var1})", "category": "raiz" }
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    loadPatterns(defaultPatterns);
    setupEventListeners();
    updateMetrics();
    initMatrixRain(); // Iniciar animación
});

function setupEventListeners() {
    // Conversión
    document.getElementById('btn-natural-to-alg').addEventListener('click', convertNaturalToAlgebraic);
    document.getElementById('btn-alg-to-natural').addEventListener('click', convertAlgebraicToNatural);

    // Evaluación
    document.getElementById('natural-satisfactory').addEventListener('click', () => markAsSatisfactory('natural'));
    document.getElementById('natural-improve').addEventListener('click', () => markForImprovement());
    
    document.getElementById('alg-satisfactory').addEventListener('click', () => markAsSatisfactory('algebraic'));
    document.getElementById('alg-improve').addEventListener('click', () => markForImprovement());

    // Archivos
    document.getElementById('json-file-input').addEventListener('change', handleFileSelection);
    document.getElementById('load-json-btn').addEventListener('click', loadJSONFile);
    document.getElementById('reset-json-btn').addEventListener('click', resetToDefault);

    // Historial
    document.getElementById('clear-history').addEventListener('click', clearHistory);
}

// --- LÓGICA DE CONVERSIÓN ---

function convertNaturalToAlgebraic() {
    const input = document.getElementById('natural-input').value.trim();
    if (!input) return alert('Escribe algo primero.');
    
    const result = processNaturalToAlgebraic(input);
    displayResult('natural', result);
    
    stats.totalConversions++;
    addToHistory('Natural -> Alg', input, result);
    updateMetrics();
}

function convertAlgebraicToNatural() {
    const input = document.getElementById('algebraic-input').value.trim();
    if (!input) return alert('Escribe una expresión algebraica.');
    
    const result = processAlgebraicToNatural(input);
    displayResult('algebraic', result);
    
    stats.totalConversions++;
    addToHistory('Alg -> Natural', input, result);
    updateMetrics();
}

function processNaturalToAlgebraic(input) {
    if (!patternsData) return "Error: Sin patrones.";
    const normalizedInput = input.toLowerCase();
    
    for (let pattern of patternsData.patterns) {
        const match = matchNaturalPattern(normalizedInput, pattern.natural.toLowerCase());
        if (match.isMatch) return substituteVariables(pattern.algebraic, match.variables);
    }
    return "No encontré coincidencia. Intenta simplificar.";
}

function processAlgebraicToNatural(input) {
    if (!patternsData) return "Error: Sin patrones.";
    const normalizedInput = normalizeAlgebraicExpression(input);
    
    for (let pattern of patternsData.patterns) {
        const match = matchAlgebraicPattern(normalizedInput, normalizeAlgebraicExpression(pattern.algebraic));
        if (match.isMatch) return substituteVariables(pattern.natural, match.variables);
    }
    return "No encontré coincidencia.";
}

// --- MATCHING ENGINES ---

function matchNaturalPattern(input, pattern) {
    let regex = pattern.replace(/\{(\w+)\}/g, '(?<$1>[a-zA-Z0-9_]+)');
    regex = `^\\s*${regex}\\s*$`;
    try {
        const match = input.match(new RegExp(regex, 'i')); // Case insensitive
        return match ? { isMatch: true, variables: match.groups } : { isMatch: false };
    } catch (e) { return { isMatch: false }; }
}

function matchAlgebraicPattern(input, pattern) {
    // Escapar operadores matemáticos para regex
    let regexStr = pattern.replace(/[\+\-\*\/\^\(\)]/g, '\\$&');
    // Reemplazar variables {x} por captura
    regexStr = regexStr.replace(/\{(\w+)\}/g, '(?<$1>[a-zA-Z0-9_]+)');
    regexStr = `^\\s*${regexStr}\\s*$`;
    
    try {
        const match = input.match(new RegExp(regexStr));
        return match ? { isMatch: true, variables: match.groups } : { isMatch: false };
    } catch (e) { return { isMatch: false }; }
}

function normalizeAlgebraicExpression(expr) {
    return expr.replace(/\s+/g, '')
               .replace(/²/g, '^2').replace(/³/g, '^3')
               .replace(/×/g, '*').replace(/÷/g, '/')
               .toLowerCase();
}

function substituteVariables(template, variables) {
    let result = template;
    for (let [key, val] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
    }
    return result;
}

// --- UI HELPERS ---

function displayResult(type, text) {
    const divId = type === 'natural' ? 'natural-result-box' : 'algebraic-result-box';
    const containerId = type === 'natural' ? 'natural-result-container' : 'algebraic-result-container';
    
    document.getElementById(divId).textContent = text;
    document.getElementById(containerId).style.display = 'block';
}

function markAsSatisfactory(type) {
    stats.satisfactoryConversions++;
    updateMetrics();
    const containerId = type === 'natural' ? 'natural-result-container' : 'algebraic-result-container';
    document.getElementById(containerId).style.display = 'none';
    alert("¡Gracias por el feedback!");
}

function markForImprovement() {
    alert("Tomado en cuenta para futuras actualizaciones.");
}

function loadPatterns(data) {
    patternsData = data;
    stats.totalPatterns = data.patterns.length;
    stats.lastUpdate = new Date().toLocaleTimeString();
    updateMetrics();
}

// --- FILE HANDLING ---

function handleFileSelection() {
    const input = document.getElementById('json-file-input');
    if (input.files.length > 0) {
        document.getElementById('file-name').textContent = input.files[0].name;
        stats.fileSize = (input.files[0].size / 1024).toFixed(2);
        document.getElementById('load-json-btn').disabled = false;
        updateMetrics();
    }
}

function loadJSONFile() {
    const file = document.getElementById('json-file-input').files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            if(json.patterns) {
                loadPatterns(json);
                alert("Patrones cargados correctamente.");
            } else throw new Error("Formato inválido");
        } catch(err) { alert("Error al leer JSON"); }
    };
    reader.readAsText(file);
}

function resetToDefault() {
    loadPatterns(defaultPatterns);
    alert("Restaurado a patrones por defecto.");
}

// --- HISTORY & METRICS ---

function addToHistory(type, input, output) {
    conversionHistory.unshift({ type, input, output, time: new Date().toLocaleTimeString() });
    if(conversionHistory.length > 10) conversionHistory.pop();
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if(conversionHistory.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.6">Sin historial reciente</p>';
        return;
    }
    container.innerHTML = conversionHistory.map(h => `
        <div style="border-bottom: 1px solid var(--grid-line); padding: 5px; margin-bottom: 5px;">
            <div style="font-size:0.8em; color:var(--neon-blue)">${h.type} - ${h.time}</div>
            <div>In: <strong>${h.input}</strong></div>
            <div style="color:var(--neon-pink)">Out: <strong>${h.output}</strong></div>
        </div>
    `).join('');
}

function clearHistory() {
    conversionHistory = [];
    renderHistory();
}

function updateMetrics() {
    document.getElementById('stat-total').textContent = stats.totalPatterns;
    document.getElementById('stat-conv').textContent = stats.totalConversions;
    document.getElementById('stat-sat').textContent = stats.satisfactoryConversions;
    document.getElementById('stat-size').textContent = stats.fileSize + ' KB';
}

// --- ANIMACIÓN MATRIX (VAPORWAVE EDITION) ---
function initMatrixRain() {
    const canvas = document.getElementById('matrixRain');
    const ctx = canvas.getContext('2d');

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const chars = '01アイウエオカキクケコサシスセソタチツテトABCDEF';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        // Fondo semi-transparente para efecto estela
        ctx.fillStyle = 'rgba(5, 5, 16, 0.05)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Color del texto: Alternamos entre Cian y Rosa para Vaporwave
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            
            // Randomizar colores para efecto Cyberpunk
            ctx.fillStyle = Math.random() > 0.5 ? '#01cdfe' : '#b967ff'; 
            
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        requestAnimationFrame(draw);
    }
    draw();
}