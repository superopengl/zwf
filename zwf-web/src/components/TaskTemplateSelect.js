import { AutoComplete, Select } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { listTaskTemplate$ } from 'services/taskTemplateService';
import { TaskTemplateIcon } from './entityIcon';
import styled from 'styled-components';

const StyledSelect = styled(Select)`
  .ant-select-selector {
    height: 50px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    // display: flex;
    // align-items: center;
  }

  .ant-select-selection-search,.ant-select-selection-item {
    display: flex;
    align-items: center;
  }

  .ant-select-selection-placeholder {
    margin-top: 6px;
  }
`;

const TaskTemplateSelect = (props) => {
  const { value, onChange, onLoadingChange, showIcon, ...other } = props;

  const [options, setOptions] = React.useState([]);

  React.useEffect(() => {
    onLoadingChange(true);
    const subscription$ = listTaskTemplate$().subscribe(list => {
      setOptions(convertToOptions(list));
      onLoadingChange(false);
    });

    return () => {
      subscription$.unsubscribe();
    }
  }, []);

  const convertToOptions = (taskTemplateList) => {
    return taskTemplateList.map(x => ({
      label: <>{showIcon && <TaskTemplateIcon />}{x.name}</>,
      value: x.id,
      key: x.id
    }))
  }

  return (<StyledSelect
    options={options}
    placeholder={<>{showIcon && <TaskTemplateIcon />}Select a task template</>}
    allowClear
    value={value}
    onChange={onChange}
    {...other} />
  )
};

TaskTemplateSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
  showIcon: PropTypes.bool,
};

TaskTemplateSelect.defaultProps = {
  onLoadingChange: () => { },
  showIcon: true,
};

export default TaskTemplateSelect;
