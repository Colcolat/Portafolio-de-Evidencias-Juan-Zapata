/* =========================================
   LÓGICA DE CALCULADORA ALGEBRAICA
   ========================================= */

class Calculator {
    constructor() {
        this.variablesInput = document.getElementById('variables');
        this.equationsInput = document.getElementById('equations');
        this.calculateButton = document.getElementById('calculate-btn');
        this.resultDiv = document.getElementById('result');
        
        this.init();
    }
    
    // Inicializar eventos
    init() {
        this.calculateButton.addEventListener('click', () => this.calculate());
        
        // Calcular con Ctrl+Enter
        [this.variablesInput, this.equationsInput].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) this.calculate();
            });
        });
    }
    
    // Parsear las variables: "x = 10, y = 5"
    parseVariables(variablesText) {
        const variables = {};
        const lines = variablesText.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            const parts = line.split(',');
            for (const part of parts) {
                const trimmedPart = part.trim();
                if (!trimmedPart) continue;
                
                // Buscar asignaciones "var = val"
                const assignmentMatch = trimmedPart.match(/^(\w+)\s*=\s*(.+)$/);
                if (assignmentMatch) {
                    const [, varName, value] = assignmentMatch;
                    try {
                        variables[varName.trim()] = this.evaluateExpression(value.trim(), variables);
                    } catch (error) {
                        throw new Error(`Error en variable "${varName}": ${error.message}`);
                    }
                }
            }
        }
        return variables;
    }
    
    // Evaluar expresiones matemáticas de forma segura
    evaluateExpression(expression, variables) {
        // Validación de seguridad (solo permite matemáticas)
        if (!/^[a-zA-Z0-9+\-*/().\s^]+$/.test(expression)) {
            throw new Error(`Caracteres inválidos en: ${expression}`);
        }
        
        // Convertir ^ a ** para JS
        let processed = expression.replace(/\^/g, '**');
        
        // Reemplazar variables por sus valores
        for (const [varName, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            processed = processed.replace(regex, value);
        }
        
        // Verificar si quedan letras (variables no definidas)
        if (/[a-zA-Z]/.test(processed)) {
            const undefinedVars = processed.match(/[a-zA-Z]+/g);
            throw new Error(`Variables no definidas: ${undefinedVars.join(', ')}`);
        }
        
        try {
            return Function(`"use strict"; return (${processed})`)();
        } catch (error) {
            throw new Error(`Error matemático: ${processed}`);
        }
    }
    
    // Función principal
    calculate() {
        try {
            const variablesText = this.variablesInput.value.trim();
            const equationsText = this.equationsInput.value.trim();
            
            if (!variablesText && !equationsText) {
                return this.showResult('⚠️ Ingresa variables o ecuaciones.', 'warning');
            }
            
            // 1. Procesar variables
            const variables = this.parseVariables(variablesText);
            
            // 2. Procesar ecuaciones
            const equations = equationsText.split('\n').filter(line => line.trim());
            const results = [];
            
            for (const equation of equations) {
                const trimmedEq = equation.trim();
                if (!trimmedEq) continue;
                
                const eqMatch = trimmedEq.match(/^(\w+)\s*=\s*(.+)$/);
                
                if (eqMatch) {
                    // Es una asignación (ej: costo = precio * cantidad)
                    const [, resVar, expr] = eqMatch;
                    const res = this.evaluateExpression(expr, variables);
                    variables[resVar] = res; // Guardar para uso futuro
                    results.push(`<span style="color:var(--neon-pink)">${resVar}</span> = <strong>${res}</strong>`);
                } else {
                    // Es una expresión directa (ej: 5 + 5)
                    const res = this.evaluateExpression(trimmedEq, variables);
                    results.push(`${trimmedEq} = <strong>${res}</strong>`);
                }
            }
            
            if (results.length === 0) {
                this.showResult('Variables guardadas. Escribe una ecuación para ver resultados.', 'info');
            } else {
                this.showResult(results.join('<br>'), 'success');
            }
            
        } catch (error) {
            this.showResult(`❌ ${error.message}`, 'error');
        }
    }
    
    showResult(message, type) {
        this.resultDiv.innerHTML = message;
        this.resultDiv.style.borderLeft = type === 'error' ? '4px solid red' : '4px solid var(--neon-blue)';
        this.resultDiv.style.color = type === 'error' ? '#ff6b6b' : '#fff';
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});