import React from 'react';
import { Col, Typography } from 'antd';
import styled from 'styled-components';
import { createFieldItemSchema, FieldControlDef, FemplateFieldControlDefMap } from 'util/FieldControlDef';
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
  const {fields, setFields, setDragging} = React.useContext(EditFieldsContext);

  const handleAddControl = (controlType, newFieldId) => {
    setFields(preFields => {
      
      const name = getUniqueNewFieldName(preFields, controlType);
      const newField = createFieldItemSchema(controlType, name);
      newField.id = newFieldId;
  
      return [...preFields, newField]
    });
    setDragging(true);
  }

  const getUniqueNewFieldName = (allFields, newControlType) => {
    const existingNames = new Set(allFields.map(f => f.name));
    const controlDef = FemplateFieldControlDefMap.get(newControlType);
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
      <DndProvider backend={HTML5Backend}>
        <ProCard gutter={[20, 20]} ghost className="field-control-column">
          <ProCard colSpan={"200px"} direction="column" layout="center" ghost >
            {FieldControlDef.map(c => <FieldControlItem
              key={c.type}
              icon={c.icon}
              label={c.label}
              type={c.type}
              onDropStart={(newFieldId) => handleAddControl(c.type, newFieldId)}
              onClick={(newFieldId) => handleAddControl(c.type, newFieldId)}
              onDropDone={() => setDragging(false)}
              index={fields.length}
            />)}
            <Col span={24}>
              <Paragraph type="secondary" style={{ textAlign: 'center', margin: '1rem auto' }}>
                Drag or click a control to add fields to the form.
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
  </Container>
  );
};

TaskFieldEditorPanel.propTypes = {
};

TaskFieldEditorPanel.defaultProps = {
};

export default TaskFieldEditorPanel;
