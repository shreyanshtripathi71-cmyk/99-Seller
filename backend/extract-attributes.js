const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const files = fs.readdirSync(modelsDir);

let output = '--- ALL MODELS AND ATTRIBUTES ---\n\n';

files.forEach(file => {
    if (file === 'index.js' || !file.endsWith('.js')) return;

    const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');

    const modelMatch = content.match(/sequelize\.define\(['"]([^'"]+)['"]/);
    const modelName = modelMatch ? modelMatch[1] : path.basename(file, '.js');

    const defineStart = content.indexOf('define(');
    if (defineStart === -1) return;

    const fieldsPart = content.substring(defineStart);
    const fieldsMatch = fieldsPart.match(/\{\s*([\s\S]*?)\s*\}\s*,\s*\{/);

    if (fieldsMatch) {
        const fieldsRaw = fieldsMatch[1];
        const lines = fieldsRaw.split('\n');
        const attributes = [];
        lines.forEach(line => {
            const attrMatch = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
            if (attrMatch) {
                attributes.push(attrMatch[1]);
            }
        });
        output += `Model: ${modelName}\n`;
        output += `Attributes: ${attributes.join(', ')}\n`;
        output += '--------------------\n';
    }
});

fs.writeFileSync(path.join(__dirname, 'all_attributes_utf8.txt'), output, 'utf8');
console.log('Attributes extracted to all_attributes_utf8.txt');
