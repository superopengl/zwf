import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';

export function convertTaskTemplateFieldsToFormFieldsSchema(fields, official) {
  const fieldList = fields
    .map((f, i) => {
      if (!!f.official !== official)
        return null;
      const widgetDef = TaskTemplateWidgetDef.find(x => x.type === f.type);
      const name = f.name || `Unnamed (field ${i + 1})`;
      return {
        key: name,
        label: name,
        name: [name],
        initialValue: f.value,
        required: f.required,
        extra: f.description,
        options: f.options,
        forwardRef: f.forwardRef,
        widget: widgetDef.widget,
        widgetProps: widgetDef.widgetPorps
      };
    })
    .filter(t => t);

  return {
    // formItemLayout: [12,12],
    columns: 1,
    fields: fieldList
  }
}
