import { Select } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { listTaskTemplate } from 'services/taskTemplateService';
import ReactDOM from 'react-dom';


const TaskTemplateSelect = (props) => {
  const { value, onChange, ...other } = props;

  const [, setLoading] = React.useState(true);
  const [taskTemplateList, setTaskTemplateList] = React.useState([]);

  const loadEntity = async () => {
    const taskTemplateList = await listTaskTemplate();
    ReactDOM.unstable_batchedUpdates(() => {
      setTaskTemplateList(taskTemplateList);
      setLoading(false);
    });
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  return (<Select allowClear value={value} onChange={onChange} {...other}>
    {taskTemplateList.map((t, i) => (<Select.Option key={i} value={t.id}>
      {t.name}
    </Select.Option>))}
  </Select>
  )
};

TaskTemplateSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

TaskTemplateSelect.defaultProps = {
};

export default TaskTemplateSelect;
