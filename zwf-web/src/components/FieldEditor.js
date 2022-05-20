import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Button, Select, Checkbox, Table, Space, Typography, AutoComplete } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { BuiltInFieldLabelValuePairs, BuiltInFieldType, getBuiltInFieldByLabelName, getBuiltInFieldByVarName } from 'components/FieldDef';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { labelNameToVarName } from 'util/labelNameToVarName';
import { v4 as uuidv4 } from 'uuid';

const { Text } = Typography;

const EMPTY_ROW = {
  name: '',
  required: true,
  type: 'text'
}


const FieldEditor = (props) => {

  const { value, onChange, loading } = props;

  const [fields, setFields] = React.useState(value);

  React.useEffect(() => {
    if (value === fields) return;
    setFields(value);
  }, [value]);

  // React.useEffect(() => {
  //   if (value === fields) return;
  //   const newValue = fields.map(f => {
  //     const varName = labelNameToVarName(f.name);
  //     const builtInField = getBuiltInFieldByVarName(varName);
  //     const type = builtInField?.inputType || f.type;
  //     return {
  //       ...f,
  //       name: varName,
  //       type
  //     };
  //   });

  //   onChange(newValue);
  // }, [fields]); 

  const handleSave = () => {
    const newValue = fields.map(f => {
      const varName = labelNameToVarName(f.name);
      const builtInField = getBuiltInFieldByVarName(varName);
      const type = builtInField?.inputType || f.type;
      return {
        ...f,
        name: varName,
        type
      };
    });

    onChange(newValue);
  }

  const addNewRow = () => {
    fields.push({ 
      id: uuidv4(),
      ...EMPTY_ROW
     });
    setFields([...fields]);
    handleSave();
  }

  const moveUp = (index) => {
    if (index <= 0) return;
    const current = fields[index];
    fields[index] = fields[index - 1];
    fields[index - 1] = current;
    setFields([...fields]);
    handleSave();
  }

  const moveDown = (index) => {
    if (index >= fields.length - 1) return;
    const current = fields[index];
    fields[index] = fields[index + 1];
    fields[index + 1] = current;
    setFields([...fields]);
    handleSave();
  }

  const deleteRow = (index) => {
    fields.splice(index, 1);
    setFields([...fields]);
    handleSave();
  }

  const changeValue = (index, name, v) => {
    fields[index][name] = v;
    setFields([...fields]);
    handleSave();
  }

  const nameOptions = BuiltInFieldLabelValuePairs;

  const columns = [
    {
      title: 'No',
      render: (text, record, index) => <>{index + 1}</>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, record, index) => {
        return <AutoComplete
          placeholder="Name"
          options={nameOptions.filter(x => !fields.some(f => f.name === x.value))}
          allowClear={true}
          maxLength={50}
          defaultValue={varNameToLabelName(text)}
          // defaultValue={getDisplayNameFromVarName(text)}
          style={{ width: 200 }}
          autoComplete="off"
          onSearch={v => changeValue(index, 'name', v)}
          onBlur={e => changeValue(index, 'name', e.target.value)}
          disabled={record.value}
        />
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value, record, index) => {
        const fieldName = record.name;
        const builtInField = getBuiltInFieldByLabelName(fieldName);
        const inputType = builtInField?.inputType || (record.value ? value : null);
        return !fieldName ? null :
          inputType ? <Text disabled>{varNameToLabelName(inputType)}</Text> :
            <Select value={value} style={{ width: '200px' }} onChange={(v) => changeValue(index, 'type', v)}>
              {BuiltInFieldType.map((f, i) => <Select.Option key={i} value={f}>{varNameToLabelName(f)}</Select.Option>)}
            </Select>
      }
    },
    {
      title: 'Required ?',
      dataIndex: 'required',
      render: (value, record, index) => <Checkbox
        checked={value}
        onChange={(e) => changeValue(index, 'required', e.target.checked)}
        disabled={record.value}
      />
    },
    {
      title: 'Official Only ?',
      dataIndex: 'official',
      render: (value, record, index) => <Checkbox
        checked={value}
        onChange={(e) => changeValue(index, 'official', e.target.checked)}
        disabled={record.value}
      />
    },
    {
      // title: 'Action',
      render: (text, record, index) => (
        <Space size="small">
          <Button type="link" icon={<UpOutlined />} onClick={() => moveUp(index)} />
          <Button type="link" icon={<DownOutlined />} onClick={() => moveDown(index)} />
          {!record.value && <Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteRow(index)} />}
        </Space>
      ),
    },
  ];

  const canAddNewField = true || fields.every(f => !!f.name);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Table
        style={{ width: '100%' }}
        size="small"
        columns={columns}
        dataSource={fields}
        pagination={false}
        loading={loading}
        rowKey={record => record.name || record.id}
        footer={null}
      />
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button icon={<PlusOutlined />} onClick={addNewRow} disabled={!canAddNewField}>Add New Field</Button>
        {/* {hasOkCancelButtons && <Space>
          <Button key="cancel" onClick={() => onCancel()}>Cancel</Button>
          <Button key="save" type="primary" onClick={() => handleSave()}>Save</Button>
        </Space>} */}
      </Space>

    </Space>
  );
};

FieldEditor.propTypes = {
  value: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};

FieldEditor.defaultProps = {
  value: [],
  loading: false,
};

export default withRouter(FieldEditor);
