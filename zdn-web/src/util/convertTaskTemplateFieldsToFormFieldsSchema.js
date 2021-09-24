import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';

export function convertTaskTemplateFieldsToFormFieldsSchema(fields, official) {
  return fields
    .map((t, i) => {
      if (!!t.official !== official)
        return null;
      const widgetDef = TaskTemplateWidgetDef.find(x => x.type === t.type);
      const name = t.name || `Unnamed (field ${i + 1})`;
      return {
        key: name,
        label: name,
        name: ['fields', name],
        required: t.required,
        extra: t.description,
        options: t.options,
        forwardRef: t.forwardRef,
        widget: widgetDef.widget,
        widgetProps: widgetDef.widgetPorps
      };
    })
    .filter(t => t);

}
