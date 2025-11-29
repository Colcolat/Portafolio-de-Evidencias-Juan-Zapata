/**
 * CALCULADORA DE CONVERSIONES DE NÚMEROS COMPLEJOS
 * Lógica para conversión entre formas Cartesiana, Polar y Exponencial.
 */

let isUpdating = false; // Previene bucles infinitos

// ==================== PARSING ====================

function parseNumber(input) {
    if (!input && input !== 0) return 0;
    const inputStr = input.toString().trim();
    if (!inputStr) return 0;

    let expression = inputStr
        .replace(/sqrt\s*\(/gi, 'Math.sqrt(')
        .replace(/pi\b/gi, 'Math.PI');

    try {
        const result = Function('"use strict"; return (' + expression + ')')();
        return (isNaN(result) || !isFinite(result)) ? 0 : result;
    } catch (error) {
        return 0;
    }
}

function parseAngle(input) {
    return parseNumber(input);
}

// ==================== FORMATO ====================

function angleToPI(angle) {
    if (Math.abs(angle) < 1e-8) return "0";
    
    // Lista reducida de múltiplos comunes para optimizar
    const piMultiples = [
        { v: Math.PI, t: "pi" }, { v: Math.PI/2, t: "pi/2" },
        { v: Math.PI/3, t: "pi/3" }, { v: Math.PI/4, t: "pi/4" },
        { v: Math.PI/6, t: "pi/6" }, { v: 2*Math.PI, t: "2*pi" }
    ];

    // Buscar coincidencia exacta
    for (let pm of piMultiples) {
        if (Math.abs(angle - pm.v) < 1e-8) return pm.t;
        if (Math.abs(angle + pm.v) < 1e-8) return "-" + pm.t;
    }

    // Intentar fracción
    const ratio = angle / Math.PI;
    const den = [2, 3, 4, 6];
    
    if (Math.abs(ratio - Math.round(ratio)) < 1e-8) {
        return Math.round(ratio) === 1 ? "pi" : Math.round(ratio) + "*pi";
    }

    for (let d of den) {
        const num = ratio * d;
        if (Math.abs(num - Math.round(num)) < 1e-8) {
            return Math.round(num) + "*pi/" + d;
        }
    }

    return angle.toFixed(4);
}

function formatNumber(num) {
    if (Math.abs(num) < 1e-10) return "0";
    
    // Revisar raíces comunes
    const sqrts = [2, 3, 5, 7];
    for(let s of sqrts) {
        if(Math.abs(Math.abs(num) - Math.sqrt(s)) < 1e-8) 
            return (num < 0 ? "-" : "") + "√" + s;
    }

    if (Math.abs(num - Math.round(num)) < 1e-8) return Math.round(num).toString();
    return parseFloat(num.toFixed(4)).toString();
}

// ==================== LÓGICA MATEMÁTICA ====================

function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle <= -Math.PI) angle += 2 * Math.PI;
    return angle;
}

// ==================== ACTUALIZACIONES ====================

function updateFromCartesian() {
    if (isUpdating) return;
    isUpdating = true;

    const real = parseNumber(document.getElementById('real').value) || 0;
    const imag = parseNumber(document.getElementById('imag').value) || 0;

    const modulus = Math.sqrt(real * real + imag * imag);
    let angle = Math.atan2(imag, real);
    // angle = normalizeAngle(angle); // Opcional: normalizar siempre

    updateUI(real, imag, modulus, angle);
    isUpdating = false;
}

function updateFromPolar() {
    if (isUpdating) return;
    isUpdating = true;

    const modulus = parseNumber(document.getElementById('modulus').value) || 0;
    const angle = parseAngle(document.getElementById('angle').value) || 0;

    const real = modulus * Math.cos(angle);
    const imag = modulus * Math.sin(angle);

    updateUI(real, imag, modulus, angle);
    isUpdating = false;
}

function updateFromExponential() {
    if (isUpdating) return;
    isUpdating = true;

    const modulus = parseNumber(document.getElementById('exp-modulus').value) || 0;
    const angle = parseAngle(document.getElementById('exp-angle').value) || 0;

    const real = modulus * Math.cos(angle);
    const imag = modulus * Math.sin(angle);

    updateUI(real, imag, modulus, angle);
    isUpdating = false;
}

// Función centralizada para actualizar todos los campos y resultados
function updateUI(real, imag, modulus, angle) {
    const angleFmt = angleToPI(angle);
    const modFmt = formatNumber(modulus);
    const realFmt = formatNumber(real);
    const imagFmt = formatNumber(imag);

    // Actualizar inputs (solo los que no tienen foco idealmente, pero simplificado aquí)
    if(document.activeElement.id !== 'real' && document.activeElement.id !== 'imag') {
        document.getElementById('real').value = realFmt;
        document.getElementById('imag').value = imagFmt;
    }
    
    if(document.activeElement.id !== 'modulus' && document.activeElement.id !== 'angle') {
        document.getElementById('modulus').value = modFmt;
        document.getElementById('angle').value = angleFmt;
        document.getElementById('angle2').value = angleFmt;
    }

    if(document.activeElement.id !== 'exp-modulus' && document.activeElement.id !== 'exp-angle') {
        document.getElementById('exp-modulus').value = modFmt;
        document.getElementById('exp-angle').value = angleFmt;
    }

    // Actualizar Textos de Resultado
    // Cartesiano
    let cartText = realFmt;
    if(imag >= 0) cartText += " + " + imagFmt + "i";
    else cartText += " - " + formatNumber(Math.abs(imag)) + "i";
    document.getElementById('cartesian-result').innerHTML = `z = <span style="color:var(--neon-pink)">${cartText}</span>`;

    // Polar
    document.getElementById('polar-result').innerHTML = `z = <span style="color:var(--neon-blue)">${modFmt}(cos(${angleFmt}) + i sen(${angleFmt}))</span>`;

    // Exponencial
    document.getElementById('exponential-result').innerHTML = `z = <span style="color:var(--neon-purple)">${modFmt} e<sup>i(${angleFmt})</sup></span>`;
}

function clearAll() {
    document.querySelectorAll('input').forEach(input => input.value = '');
    document.querySelectorAll('.result-box').forEach(div => div.innerHTML = 'Esperando datos...');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('real').addEventListener('input', updateFromCartesian);
    document.getElementById('imag').addEventListener('input', updateFromCartesian);
    
    document.getElementById('modulus').addEventListener('input', updateFromPolar);
    document.getElementById('angle').addEventListener('input', function() {
        document.getElementById('angle2').value = this.value;
        updateFromPolar();
    });

    document.getElementById('exp-modulus').addEventListener('input', updateFromExponential);
    document.getElementById('exp-angle').addEventListener('input', updateFromExponential);
});