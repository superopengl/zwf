

export function renameFieldInDocTemplateBody(html, fieldOldName, fieldNewName) {
  const pattern = new RegExp(`{{${fieldOldName}}}`, 'g');
  const newHtml = html.replace(pattern, fieldNewName ? `{{${fieldNewName}}}`: '');
  debugger;
  return newHtml;
}
