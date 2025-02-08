import * as _ from 'lodash';

export const extractVarsFromDocTemplateBody = (html) => {
  if (!html) {
    return {
      vars: [],
      invalidVars: []
    };
  }
  const regex = /\{\{([^\}]+)\}\}/ig;
  const varNameValidator = /^[a-z][a-z0-9_\-\. ]*$/i;

  const vars = new Set();
  const invalidVars = new Set();

  let match;
  while ((match = regex.exec(html))) {
    const name = match[1];
    if (true || varNameValidator.test(name)) {
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


