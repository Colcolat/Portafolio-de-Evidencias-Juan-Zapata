/* =========================================
   LÓGICA SIMBÓLICA (ECUACIONES LINEALES)
   ========================================= */

// Utilidad para limpiar strings
function cleanString(str) {
    return str.replace(/\s+/g, '');
}

// --- PARTE 1: Solución de Ecuaciones de una Variable (x) ---

function resolverEcuacionParseada() {
    const ecuacionStr = document.getElementById('ecuacion').value;
    const resBox = document.getElementById('resDespejeParseado');
    
    // Reset visual
    resBox.innerHTML = 'Calculando...';
    resBox.style.display = 'block';
    resBox.className = 'result-box'; // Reset clases de error

    try {
        const partes = ecuacionStr.split('=');
        if (partes.length !== 2) throw new Error("Debe haber un signo '='");

        const ladoIzq = partes[0].trim();
        const ladoDer = partes[1].trim();

        // Formato para math.js: (izq) - (der)
        const ecuacionFormateada = `(${ladoIzq}) - (${ladoDer})`;

        const nodo = math.parse(ecuacionFormateada);
        const simplificado = math.simplify(nodo);

        // Extraer coeficientes (ax + b = 0)
        const coef = extraerCoeficientes(simplificado.toString());
        
        if (coef.a === 0) {
            throw new Error(coef.b === 0 ? "Infinitas soluciones" : "Sin solución");
        }

        const solucion = -coef.b / coef.a;

        resBox.innerHTML = `
            <div style="margin-bottom:10px; color:var(--text-dim)">Ecuación: ${ecuacionStr}</div>
            <div style="font-size:1.2rem; color:var(--neon-pink)">
                <strong>x = ${Number.isInteger(solucion) ? solucion : solucion.toFixed(4)}</strong>
            </div>
            <div style="margin-top:5px; font-size:0.8rem; color:var(--neon-blue)">
                Simplificada: ${simplificado.toString()} = 0
            </div>
        `;
    } catch (error) {
        resBox.innerHTML = `Error: ${error.message}`;
        resBox.className = 'result-box error';
    }
}

function extraerCoeficientes(ecuacion) {
    ecuacion = ecuacion.replace(/\s+/g, '');
    let a = 0, b = 0;

    // Buscar términos con x
    const regexX = /([+-]?\d*\.?\d*)\*?x/g;
    let match;
    while ((match = regexX.exec(ecuacion)) !== null) {
        let coef = match[1];
        if (coef === '' || coef === '+') coef = '1';
        if (coef === '-') coef = '-1';
        a += parseFloat(coef);
    }

    // Buscar término constante
    const sinX = ecuacion.replace(/[+-]?\d*\.?\d*\*?x/g, '');
    if (sinX) {
        try { b = math.evaluate(sinX); } catch (e) { b = 0; }
    }
    return { a, b };
}

// --- PARTE 2: Despeje Simbólico de Fórmulas ---

function extractVariables(formulaStr) {
    const matches = formulaStr.match(/[a-zA-Z][a-zA-Z0-9]*/g);
    if (!matches) return [];
    return Array.from(new Set(matches));
}

function procesarFormulaLiteral() {
    const formulaStr = document.getElementById('formulaLiteral').value;
    const resBox = document.getElementById('resFormulaLiteral');
    
    // Limpiar resultados anteriores
    resBox.innerHTML = ''; 

    try {
        const partes = formulaStr.split('=');
        if (partes.length !== 2) throw new Error("Falta el signo '='");

        const ladoIzq = partes[0].trim();
        const ladoDer = partes[1].trim();
        const variables = extractVariables(formulaStr);

        if (variables.length < 2) throw new Error("Se necesitan al menos 2 variables.");

        // --- GENERACIÓN DEL HTML TIPO TABLA ---
        
        let html = `
            <div class="formula-header-box">
                <strong>Fórmula Original:</strong> ${formulaStr}
            </div>
            <div class="vars-detected">
                Variables detectadas: <strong>${variables.join(', ')}</strong>
            </div>
            
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Variable Despejada</th>
                        <th>Fórmula Resultante</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const variable of variables) {
            let despeje;
            if (ladoIzq === variable) {
                despeje = `${variable} = ${ladoDer}`;
            } else {
                const resultado = despejarVariable(ladoDer, variable, ladoIzq);
                despeje = `${variable} = ${resultado}`;
            }

            html += `
                <tr>
                    <td class="var-col">${variable}</td>
                    <td class="formula-col">${despeje}</td>
                </tr>
            `;
        }
        
        html += `
                </tbody>
            </table>
        `;
        
        resBox.innerHTML = html;

    } catch (error) {
        // En caso de error, usamos un div simple de alerta
        resBox.innerHTML = `
            <div style="padding:15px; background:rgba(255,0,0,0.1); border:1px solid #ff3333; color:#ff3333;">
                Error: ${error.message}
            </div>
        `;
    }
}

// --- LÓGICA DE DESPEJE (Tu código original intacto) ---

function despejarVariable(expresionOriginal, variableObjetivo, variableDespejada) {
    try {
        let expresion = expresionOriginal.replace(/\s+/g, '');

        // CASO: coef(var ± const)/div -> 5(F-32)/9
        const patronComplejo = /(\d*\.?\d*)\(([a-zA-Z]+)\s*([+-])\s*(\d+\.?\d*)\)\s*\/\s*(\d+\.?\d*)/;
        const matchComplejo = expresion.match(patronComplejo);

        if (matchComplejo && matchComplejo[2] === variableObjetivo) {
            const coef1 = matchComplejo[1] || '1';
            const operador = matchComplejo[3];
            const constante = matchComplejo[4];
            const divisor = matchComplejo[5];
            const operadorInverso = operador === '-' ? '+' : '-';

            if (coef1 === '1') {
                return `(${variableDespejada}) * (${divisor}) ${operadorInverso} ${constante}`;
            } else {
                return `(${variableDespejada}) * (${divisor}) / (${coef1}) ${operadorInverso} ${constante}`;
            }
        }

        // Suma/Resta
        if (expresion.includes('+') || expresion.includes('-')) {
            const res = despejarSumaResta(expresion, variableObjetivo, variableDespejada);
            if (res !== null) return res;
        }

        // División
        if (expresion.includes('/')) {
            const [num, den] = dividirPorOperadorPrincipal(expresion, '/');
            
            if (num.includes(variableObjetivo)) {
                if (num === variableObjetivo) return `(${variableDespejada}) * (${den})`;
                const fact = extraerFactoresMultiplicacion(num);
                const otros = fact.filter(f => f !== variableObjetivo);
                return otros.length === 0 
                    ? `(${variableDespejada}) * (${den})` 
                    : `(${variableDespejada}) * (${den}) / (${otros.join('*')})`;
            } else if (den.includes(variableObjetivo)) {
                if (den === variableObjetivo) return `(${num}) / (${variableDespejada})`;
                const fact = extraerFactoresMultiplicacion(den);
                const otros = fact.filter(f => f !== variableObjetivo);
                return otros.length === 0
                    ? `(${num}) / (${variableDespejada})`
                    : `(${num}) / ((${variableDespejada}) * (${otros.join('*')}))`;
            }
        }

        // Multiplicación
        if (expresion.includes('*')) {
            const fact = extraerFactoresMultiplicacion(expresion);
            const otros = fact.filter(f => f !== variableObjetivo);
            if (otros.length === 0) return variableDespejada;
            return `(${variableDespejada}) / (${otros.join('*')})`;
        }

        if (expresion === variableObjetivo) return variableDespejada;
        return expresion;

    } catch (e) { return `Error: ${e.message}`; }
}

function despejarSumaResta(expresion, variableObjetivo, variableDespejada) {
    const terminos = parsearTerminos(expresion);
    let terminoConVariable = null;
    let otros = [];

    for (const t of terminos) {
        if (t.texto.includes(variableObjetivo)) terminoConVariable = t;
        else otros.push(t);
    }

    if (!terminoConVariable) return null;

    let resultado = variableDespejada;
    for (const t of otros) {
        const opInv = t.signo === '+' ? '-' : '+';
        resultado += ` ${opInv} ${t.texto}`;
    }

    if (terminoConVariable.texto !== variableObjetivo) {
        if (terminoConVariable.texto.includes('*')) {
            const partes = terminoConVariable.texto.split('*');
            const coef = partes.find(p => p !== variableObjetivo);
            resultado = `(${resultado}) / (${coef})`;
        }
    }

    if (terminoConVariable.signo === '-') resultado = `-(${resultado})`;
    return resultado;
}

// Helpers de Parsing
function parsearTerminos(expresion) {
    const terminos = [];
    let actual = '', signo = '+', nivel = 0;
    
    for (let i = 0; i < expresion.length; i++) {
        const char = expresion[i];
        if (char === '(') nivel++;
        else if (char === ')') nivel--;
        else if ((char === '+' || char === '-') && nivel === 0 && actual !== '') {
            terminos.push({ signo, texto: actual });
            signo = char; actual = '';
        } else if ((char === '+' || char === '-') && nivel === 0 && actual === '') {
            signo = char;
        } else {
            actual += char;
        }
    }
    if (actual) terminos.push({ signo, texto: actual });
    return terminos;
}

function dividirPorOperadorPrincipal(exp, op) {
    let nivel = 0, pos = -1;
    for (let i = exp.length - 1; i >= 0; i--) {
        if (exp[i] === ')') nivel++;
        else if (exp[i] === '(') nivel--;
        else if (exp[i] === op && nivel === 0) { pos = i; break; }
    }
    if (pos === -1) return [exp];
    return [exp.substring(0, pos), exp.substring(pos + 1)];
}

function extraerFactoresMultiplicacion(exp) {
    const fact = [];
    let actual = '', nivel = 0;
    for (let i = 0; i < exp.length; i++) {
        const char = exp[i];
        if (char === '(') nivel++;
        else if (char === ')') nivel--;
        else if (char === '*' && nivel === 0) {
            if (actual) fact.push(actual);
            actual = '';
        } else actual += char;
    }
    if (actual) fact.push(actual);
    return fact;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-resolver').addEventListener('click', resolverEcuacionParseada);
    document.getElementById('btn-formula').addEventListener('click', procesarFormulaLiteral);
});