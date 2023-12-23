import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Select } from 'antd';
import { withRouter } from 'react-router-dom';
import Icon, { BorderOutlined, FileOutlined } from '@ant-design/icons';
import { FaTasks } from 'react-icons/fa';
import { ImInsertTemplate } from 'react-icons/im';
import { searchAssigneeList$ } from 'services/userService';
import { GlobalContext } from 'contexts/GlobalContext';

const { Text, Paragraph, Link: TextLink } = Typography;

export const AssigneeSelect = React.memo(props => {
  const { placeholder, onChange, value } = props;
  const [list, setList] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [text, setText] = React.useState('');
  const { user } = React.useContext(GlobalContext);

  const myUserId = user.id;

  React.useEffect(() => {
    const sub$ = searchAssigneeList$(page, text)
      .subscribe(respData => {
        setList(respData.data);
      });

    return () => {
      sub$?.unsubscribe();
    }
  }, [page, text]);

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
    style={{ width: 140 }}
    onSearch={handleSearch}
    onSelect={handleSelectChange}
    value={value}
    options={options}
  />
});

AssigneeSelect.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  placeholder: PropTypes.string,
};

AssigneeSelect.defaultProps = {
  onSelect: () => { },
  placeholder: ""
};

