
export function renderDocTemplateBodyWithVarBag(html, varBag) {
  let rendered = html;
  for (const [key, value] of Object.entries(varBag)) {
    if(value?.trim()) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }
  }
  return rendered;
}
