const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const files = fs.readdirSync(modelsDir);

let output = '# Full Model Registry & Attributes\n\n';

files.forEach(file => {
    if (file === 'index.js' || !file.endsWith('.js')) return;

    const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');

    const modelMatch = content.match(/sequelize\.define\(['"]([^'"]+)['"]/);
    const modelName = modelMatch ? modelMatch[1] : path.basename(file, '.js');

    const defineStart = content.indexOf('define(');
    if (defineStart === -1) return;

    let braceCount = 0;
    let started = false;
    let attributesBlock = '';

    for (let i = content.indexOf('{', defineStart); i < content.length; i++) {
        const char = content[i];
        if (char === '{') {
            braceCount++;
            started = true;
        } else if (char === '}') {
            braceCount--;
        }

        if (started) {
            attributesBlock += char;
            if (braceCount === 0) break;
        }
    }

    const columnNames = [];
    const lines = attributesBlock.split('\n');
    lines.forEach(line => {
        // More flexible key matching for Sequelize columns
        const match = line.match(/^\s+([a-zA-Z0-9_]+)\s*:\s*(\{?|DataTypes)/);
        if (match) {
            const key = match[1];
            if (!['type', 'allowNull', 'primaryKey', 'autoIncrement', 'references', 'onDelete', 'onUpdate', 'defaultValue', 'unique', 'validate', 'comment', 'get', 'set', 'field', 'tableName', 'timestamps', 'engine', 'charset'].includes(key)) {
                columnNames.push(key);
            }
        }
    });

    output += `## ${modelName}\n`;
    output += `**Columns:** ${columnNames.length > 0 ? columnNames.join(', ') : '*(No columns found or empty model)*'}\n\n`;
});

fs.writeFileSync(path.join(__dirname, 'complete_model_definition.md'), output, 'utf8');
console.log('Complete model registry generated: complete_model_definition.md');
