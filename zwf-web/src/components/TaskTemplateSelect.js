import { AutoComplete, Select } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { listTaskTemplate } from 'services/taskTemplateService';
import ReactDOM from 'react-dom';
import { TaskTemplateIcon } from './entityIcon';


const TaskTemplateSelect = (props) => {
  const { value, onChange, ...other } = props;

  const [loading, setLoading] = React.useState(true);
  const [options, setOptions] = React.useState([]);

  const loadEntity = async () => {
    const taskTemplateList = await listTaskTemplate();
    ReactDOM.unstable_batchedUpdates(() => {
      // setTaskTemplateList(taskTemplateList);
      setOptions(convertToOptions(taskTemplateList));
    });
  }

  
  React.useEffect(() => {
    loadEntity();
  }, []);
  
  const convertToOptions = (taskTemplateList) => {
    return taskTemplateList.map(x => ({
       label: <><TaskTemplateIcon/> {x.name}</>,
       value: x.id,
       key: x.id
    }))
  }

  return (<Select 
    options={options} 
    placeholder={<><TaskTemplateIcon/>Select a task template</>}
    allowClear 
    value={value} 
    onChange={onChange} 
    {...other} />
  )
};

TaskTemplateSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

TaskTemplateSelect.defaultProps = {
};

export default TaskTemplateSelect;
