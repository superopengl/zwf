import React from 'react';
import { Col, Typography } from 'antd';
import styled from 'styled-components';
import { createFieldItemSchema, TaskTemplateFieldControlDef, TaskTemplateFieldControlDefMap } from 'util/TaskTemplateFieldControlDef';
import { FieldControlItem } from './FieldControlItem';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FieldListEditable } from './FieldListEditable';
import { ProCard } from '@ant-design/pro-components';
import PropTypes from 'prop-types';
import { EditFieldsContext } from 'contexts/EditFieldsContext';
import { DebugJsonPanel } from 'components/DebugJsonPanel';

const Container = styled.div`
// min-width: 800px;
// max-width: 1200px;
width: 100%;
margin: 0 auto;


.field-control-column {
  .ant-pro-card-col:first-child {
    padding-inline: 0 !important;
  }
}
`;

const { Paragraph } = Typography;


export const TaskFieldEditorPanel = (props) => {
  const { fields, onChange: setFields } = props;

  const handleAddControl = (controlType, newFieldId) => {
    const name = getUniqueNewFieldName(fields, controlType);
    const newField = createFieldItemSchema(controlType, name);
    newField.id = newFieldId;

    // console.log('just added', newField);
    setFields([...fields, newField]);
  }

  const getUniqueNewFieldName = (allFields, newControlType) => {
    const existingNames = new Set(allFields.map(f => f.name));
    const controlDef = TaskTemplateFieldControlDefMap.get(newControlType);
    const fieldBaseName = controlDef.label;

    let number = 1;
    let name = null;
    do {
      name = `${fieldBaseName} ${number}`;
      number++;
    } while (existingNames.has(name));
    return name;
  }

  return (<Container>
    <EditFieldsContext.Provider value={{
      fields,
      setFields
    }}>
      <DndProvider backend={HTML5Backend}>
        <ProCard gutter={[20, 20]} ghost className="field-control-column">
          <ProCard colSpan={"200px"} direction="column" layout="center" ghost >
            {TaskTemplateFieldControlDef.map(c => <FieldControlItem
              key={c.type}
              icon={c.icon}
              label={c.label}
              type={c.type}
              // onDropStart={(newFieldId) => handleAddControl(c.type, newFieldId)}
              onClick={(newFieldId) => handleAddControl(c.type, newFieldId)}
              // onDropDone={() => handleAddControl(c.type)}
              index={fields.length}
            />)}
            <Col span={24}>
              <Paragraph type="secondary" style={{ textAlign: 'center', margin: '1rem auto' }}>
                Click controls to add fields to the form.
              </Paragraph>
            </Col>
          </ProCard>
          <ProCard colSpan={"auto"} ghost style={{}} bodyStyle={{ padding: 0 }} layout="center">
            <FieldListEditable />
          </ProCard>
          <ProCard colSpan={"300px"} ghost layout="center" direction='column'>
          </ProCard>
        </ProCard>
      </DndProvider>
    </EditFieldsContext.Provider>
  </Container>
  );
};

TaskFieldEditorPanel.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string.isRequired,
    required: PropTypes.bool,
  })).isRequired,
  onChange: PropTypes.func,
};

TaskFieldEditorPanel.defaultProps = {
  onChange: () => { }
};

export default TaskFieldEditorPanel;
