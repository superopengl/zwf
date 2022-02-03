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
import { smartSearchTask$, smartSearchTaskTemplate$, smartSearchDocTemplate$, smartSearchClient$ } from 'services/smartSearchService';
import { withRouter } from 'react-router-dom';
import { UserDisplayName } from 'components/UserDisplayName';
import { UserAvatar } from './UserAvatar';
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


const DOMAIN_CONFIG = {
  'task': {
    searchHandler: smartSearchTask$,
    pathHandler: id => `/task/${id}`,
    renderHandler: (item, searchText) => <>
      <TaskIcon />
      <HighlightingText value={item.name} search={searchText} />
    </>,
    noFoundContent: <>No task is found.</>
  },
  'task_template': {
    searchHandler: smartSearchTaskTemplate$,
    pathHandler: id => `/task_template/${id}`,
    renderHandler: (item, searchText) => <>
      <TaskTemplateIcon />
      <HighlightingText value={item.name} search={searchText} />
    </>,
    noFoundContent: <>No task template is found.</>
  },
  'doc_template': {
    searchHandler: smartSearchDocTemplate$,
    pathHandler: id => `/doc_template/${id}`,
    renderHandler: (item, searchText) => <>
      <DocTemplateIcon />
      <HighlightingText value={item.name} search={searchText} />
    </>,
    noFoundContent: <>No doc template is found.</>
  },
  'client': {
    searchHandler: smartSearchClient$,
    pathHandler: id => `/client/${id}`,
    renderHandler: (item, searchText) => <Space size="small">
      <UserAvatar value={item.avatarFileId} color={item.avatarColorHex} size={32} />
      <UserDisplayName
        email={item.email}
        surname={item.surname}
        givenName={item.givenName}
        searchText={searchText}
      />
    </Space>,
    noFoundContent: <>No client is found.</>
  },
}

export const SmartSearch = withRouter((props) => {
  const { value, onChange, ...other } = props;

  const [searchText, setSearchText] = React.useState();
  const [optionsWithinDomain, setOptionsWithinDomain] = React.useState([]);
  const [domain, setDomain] = React.useState();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const ref = React.useRef();

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
        key: 'task_template',
        label: 'task templates',
        icon: <TaskTemplateIcon />
      },
      {
        key: 'doc_template',
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
      label: <Row gutter={10} justify="space-between" wrap={false}>
        <Col><SearchOutlined /> {item.icon}<Text ellipsis>{searchText}</Text></Col>
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

  React.useEffect(() => {
    if (!domain || !searchText?.trim()) {
      setOptionsWithinDomain(null)
      return;
    }

    const config = DOMAIN_CONFIG[domain];

    if (!config) {
      throw new Error(`Unsupported domain '${domain}'`)
    }

    config.searchHandler(searchText).subscribe(list => {
      const options = list.map(item => ({
        value: item.id,
        label: config.renderHandler(item, searchText)
      }));

      setOptionsWithinDomain(options);
      setDropdownOpen(true);
    })
  }, [domain, searchText])

  const handleDomainSelected = (domain) => {
    setDomain(domain);
  }

  const handleSearchWithinDomain = () => {

  }

  const handleSelectWithinDomain = (id) => {
    const config = DOMAIN_CONFIG[domain];
    if (!config) {
      throw new Error(`Unsupported domain '${domain}'`)
    }

    const path = config.pathHandler(id);
    props.history.push(path);

    reset();
  }

  const reset = () => {
    setDomain(null);
    setSearchText('');
    setOptionsWithinDomain(null);
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
      allowClear
      style={{ minWidth: 300, width: '100%' }}
      options={optionsWithinDomain}
      value={searchText}
      open={dropdownOpen}
      dropdownMatchSelectWidth={false}
      onFocus={() => setDropdownOpen(true)}
      onBlur={() => setDropdownOpen(false)}
      onChange={handleValueChangeWithinDomain}
      onSearch={handleSearchWithinDomain}
      onSelect={handleSelectWithinDomain}
      notFoundContent={DOMAIN_CONFIG[domain]?.noFoundContent}
    />
  }

  return <AutoComplete
    showSearch
    allowClear
    placeholder="Search"
    style={{ minWidth: 300, width: '100%' }}
    options={getOptions()}
    dropdownMatchSelectWidth={false}
    onSearch={handleSearch}
    onSelect={handleDomainSelected}
  />
});

SmartSearch.propTypes = {
};

SmartSearch.defaultProps = {
};

