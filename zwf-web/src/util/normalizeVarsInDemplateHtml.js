
const regex = /\{\{([^\}]+)\}\}/ig;

export function normalizeVarsInDemplateHtml(html) {
  const map = new Map();
  let output = html;

  let match;
  while ((match = regex.exec(html))) {
    const originalText = match[1];
    const varName = originalText.replace(/&nbsp;/g, ' ')?.trim()
    const replacement = `{{${varName}}}`
    map.set(match[0], replacement);
  }

  for (let [target, replacement] of map) {
    output = output.replace(target, replacement);
  }

  return output;
}
