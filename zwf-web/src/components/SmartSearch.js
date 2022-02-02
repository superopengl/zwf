import { AutoComplete, Typography, Input, Select, Space, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { listOrgExistingClients } from 'services/orgService';
import getInnerText from 'react-innertext';
import HighlightingText from './HighlightingText';
import { ClientIcon, DocTemplateIcon, TaskIcon, TaskTemplateIcon } from './entityIcon';
import innerText from 'react-innertext';
import { EnterOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import Tag from './Tag';
import { searchTask$ } from 'services/taskService';
import { withRouter } from 'react-router-dom';
const { Text } = Typography;

const StyledSelect = styled(AutoComplete)`
  .ant-select-selector {
    height: 50px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    // display: flex;
    // align-items: center;
  }

  .ant-select-selection-search {
    display: flex;
    align-items: center;
  }

  .ant-select-selection-placeholder {
    margin-top: 6px;
  }
`;

const getDisplayName = (client) => {
  const { givenName, surname, email } = client;
  const displayName = `${givenName ?? ''} ${surname ?? ''}`.trim();
  return displayName || email;
}

export const SmartSearch = withRouter((props) => {
  const { value, onChange, ...other } = props;

  const [searchText, setSearchText] = React.useState();
  const [optionsWithinDomain, setOptionsWithinDomain] = React.useState([]);
  const [domain, setDomain] = React.useState();
  const ref = React.useRef();

  const handleSearchTask = (text) => {
    searchTask$({ text }).subscribe(resp => {
      const options = resp.data.map(task => ({
        value: task.id,
        label: <>
          <TaskIcon /> <HighlightingText value={task.name} search={searchText} />
        </>
      }));

      setOptionsWithinDomain(options);
    })
  }

  const getOptions = React.useCallback(() => {
    if (!searchText?.trim()) {
      return null;
    }

    const labels = [
      {
        key: 'task',
        label: 'tasks',
        icon: <TaskIcon />
      },
      {
        key: 'taskTemplate',
        label: 'task templates',
        icon: <TaskTemplateIcon />
      },
      {
        key: 'docTemplate',
        label: 'doc templates',
        icon: <DocTemplateIcon />
      },
      {
        key: 'client',
        label: 'clients',
        icon: <ClientIcon />
      }
    ];
    const options = labels.map(item => ({
      value: item.key,
      label: <Row justify="space-between" wrap={false}>
        <Col><SearchOutlined /> {item.icon} <Text ellipsis>{searchText}</Text></Col>
        <Col>
          <Tag>{item.label} <EnterOutlined /></Tag>
        </Col>
      </Row>
    }));

    return options;
  }, [searchText]);

  const handleSearch = text => {
    setSearchText(text);
  }

  const handleSelect = (value, option) => {
    setDomain(value);

    switch (value) {
      case 'task':
        handleSearchTask(searchText);
        break;
      case 'taskTemplate':

        break;
      case 'docTemplate':

        break;
      case 'client':
        break;
      default:
        break;
    }
  }

  const handleSearchWithinDomain = () => {

  }

  const handleSelectWithinDomain = (id) => {
    switch (domain) {
      case 'task':
        props.history.push(`/task/${id}`);
        break;
      case 'taskTemplate':

        break;
      case 'docTemplate':

        break;
      case 'client':
        break;
      default:
        break;
    }

    reset();
  }

  const reset = () => {
    setDomain(null);
    setSearchText('');
  }

  const handleValueChangeWithinDomain = value => {
    setSearchText(value);
    if (!value) {
      reset();
    }
  }

  if (domain && searchText) {
    return <AutoComplete
      ref={ref}
      showSearch
      style={{ minWidth: 300, width: '100%' }}
      options={optionsWithinDomain}
      value={searchText}
      open={true}
      onChange={handleValueChangeWithinDomain}
      onSearch={handleSearchWithinDomain}
      onSelect={handleSelectWithinDomain}
    />
  }

  return <AutoComplete
    showSearch
    placeholder="Search"
    style={{ minWidth: 300, width: '100%' }}
    options={getOptions()}
    autoFocus
    // open={searchText?.trim()}
    // optionFilterProp="children"
    // filterOption={(input, option) => {
    //   return innerText(option.children).toLowerCase().includes(input.toLowerCase())
    // }
    // }
    onSearch={handleSearch}
    onSelect={handleSelect}
  />
});

SmartSearch.propTypes = {
};

SmartSearch.defaultProps = {
};

