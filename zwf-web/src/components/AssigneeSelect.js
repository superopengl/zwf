import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { searchAssigneeList$ } from 'services/userService';
import { GlobalContext } from 'contexts/GlobalContext';


export const AssigneeSelect = React.memo(props => {
  const { placeholder, onChange, value } = props;
  const [list, setList] = React.useState([]);
  const [text, setText] = React.useState('');
  const { user } = React.useContext(GlobalContext);

  const myUserId = user.id;

  React.useEffect(() => {
    const sub$ = searchAssigneeList$(0, text)
      .subscribe(respData => {
        setList(respData.data);
      });

    return () => {
      sub$?.unsubscribe();
    }
  }, [text]);

  const handleSearch = (input) => {
    setText(input?.trim());
  }

  const handleSelectChange = (assigneeId) => {
    onChange(assigneeId);
  }

  const options = React.useMemo(() => {
    if (!list) return null;
    const opts = list.map(x => ({
      value: x._id,
      label: `${x.givenName || 'Unset'} ${x.surname || 'Unset'}` + (myUserId === x.id ? ' (Me)' : '')
    }));
    // Insert an empty option on top for unselect operation
    opts.unshift({
      value: null,
      label: ' '
    });
    return opts;
  }, [list]);

  return <Select
    placeholder={placeholder}
    showSearch
    showArrow
    style={{ width: '100%', minWidth: 140 }}
    onSearch={handleSearch}
    onSelect={handleSelectChange}
    value={value}
    options={options}
  />
});

AssigneeSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    givenName: PropTypes.string,
    surname: PropTypes.string,
  })).isRequired,
  onChange: PropTypes.func,
  value: PropTypes.string,
  placeholder: PropTypes.string,
};

AssigneeSelect.defaultProps = {
  options: [],
  onSelect: () => { },
  placeholder: ""
};

