import * as _ from 'lodash';

const varNameValidator = /^[a-z][a-z0-9_\-\. ]*$/i;

function validateVarName(name) {
  return true || varNameValidator.test(name)
}

export const extractVarsFromDocTemplateBody = (html) => {
  if (!html) {
    return {
      vars: [],
      invalidVars: []
    };
  }
  const regex = /\{\{([^\}]+)\}\}/ig;

  const vars = new Set();
  const invalidVars = new Set();

  let match;
  while ((match = regex.exec(html))) {
    const name = match[1]?.replace(/&nbsp;/g, ' ')?.trim();
    if (name && validateVarName(name)) {
      vars.add(name);
    } else {
      invalidVars.add(name);
    }
  }

  return {
    vars: Array.from(vars),
    invalidVars: Array.from(invalidVars)
  };
}


