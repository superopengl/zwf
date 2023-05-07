import {FieldControlDef} from 'util/FieldControlDef';

export function generateFormSchemaFromFields(fields, official) {
  const fieldList = fields
    .map((f, i) => {
      if (!!f.official !== official)
        return null;
      let controlDef = FieldControlDef.find(x => x.type === f.type);
      if(!controlDef) {
        console.error(`Unsupported control type (${f.type})`);
        controlDef = FieldControlDef[0]
      }
      const name = f.name || `Unnamed (field ${i + 1})`;
      return {
        title: name,
        dataIndex: f.id,
        initialValue: f.value,
        formItemProps: {
          help: f.description,
          rules: [{ required: f.required, message: ' ', whitespace: true }]
        },
        fieldProps: {
          allowClear: true,
          placeholder: f.name,
          ...controlDef.fieldProps,
        },
        renderFormItem: controlDef.renderFormItem,
        options: f.options,
      };
    })
    .filter(t => t);

  return fieldList;
}