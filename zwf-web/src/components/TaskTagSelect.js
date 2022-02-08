import React from 'react';
import PropTypes from 'prop-types';
import { Select, Tag } from 'antd';
import styled from 'styled-components';
import isString from 'lodash/isString';
import { forEach } from 'lodash';
import { concat, EMPTY, of } from 'rxjs';
import { switchMap, switchMapTo, tap } from 'rxjs/operators';
import { saveTaskTag$ } from 'services/taskTagService';
import { v4 as uuidv4 } from 'uuid';
import { GlobalContext } from 'contexts/GlobalContext';

const StyledSelect = styled(Select)`
font-size: 11px;
border-radius: 999px;
text-transform: lowercase;
`;

export const TaskTagSelect = React.memo((props) => {

  const { value, onChange, ...others } = props;

  const context = React.useContext(GlobalContext);
  const {taskTags, reloadTaskTags} = context;

  const options = React.useMemo(() => {
    return taskTags.map(item => ({
      value: item.id,
      label: <Tag color={item.colorHex}>{item.name}</Tag>,
    }))
  }, [taskTags]);

  const handleChange = (selectedValues, selectedOptions) => {
    // if (isString(value)
    const soruce = of(null);
    const args = [];
    let createdNew = false;
    for (let i = 0; i < selectedOptions.length; i++) {
      if (!selectedOptions[i].value) {
        const id = uuidv4();
        const name = selectedValues[i];
        selectedValues[i] = id;
        args.push(switchMapTo(saveTaskTag$({ id, name })));
        createdNew = true;
      }
    }
    
    soruce.pipe(...args).subscribe(() => {
      if(createdNew) {
        reloadTaskTags();
      }
      onChange(selectedValues)
    });
  }

  // const handleSearch = (value) => {
  //   debugger;
  // }



  return (
    <StyledSelect
      {...others}
      style={{ minWidth: 30, width: '100%' }}
      value={value}
      mode="tags"
      options={options}
      // tagRender={item => {
      //   return <Tag key={item.id} color={item.colorHex}>{item.name}</Tag>
      // }}
      // dropdownRender={item => <Tag key={item.id} color={item.colorHex}>{item.name}</Tag>}
      onChange={handleChange}
    // onSearch={handleSearch}
    >
      {/* {allTags.map(item => <Select.Option key={item.id} value={item.id}>
        <Tag color={item.colorHex}>{item.name}</Tag>
      </Select.Option>)} */}
    </StyledSelect>
  );
});

TaskTagSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
};

TaskTagSelect.defaultProps = {
  onChange: () => { }
};

