import { Divider, Button, Select, Row } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { listFemplate$ } from 'services/femplateService';
import { FemplateIcon } from './entityIcon';
import styled from 'styled-components';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

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

export const FormTemplateSelect = (props) => {
  const { value, onChange, onLoadingChange, showIcon, allowAdd, ...other } = props;

  const [options, setOptions] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    onLoadingChange(true);
    const subscription$ = listFemplate$().subscribe(list => {
      setOptions(convertToOptions(list));
      onLoadingChange(false);
    });

    return () => {
      subscription$.unsubscribe();
    }
  }, []);

  const convertToOptions = (femplateList) => {
    return femplateList.map(x => ({
      label: <>{showIcon && <FemplateIcon />}{x.name}</>,
      value: x.id,
      key: x.id,
      data: x,
    }))
  }

  const handleChange = (id) => {
    onChange(id);
  }

  return (<StyledSelect
    options={options}
    placeholder={<>{showIcon && <FemplateIcon />}Select template</>}
    allowClear
    value={value}
    onChange={handleChange}
    dropdownRender={menu => <>
      {menu}
      {allowAdd && <>
        <Divider
          style={{
            margin: '8px 0',
          }}
        />
        <Row
          style={{
            padding: '0 10px 4px',
            width: '100%',
          }}
        >
          <Button block type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/femplate/new")}
            ghost>Create new template</Button>
        </Row>
      </>}
    </>}
    {...other} />
  )
};

FormTemplateSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
  showIcon: PropTypes.bool,
  allowAdd: PropTypes.bool,
};

FormTemplateSelect.defaultProps = {
  onLoadingChange: () => { },
  showIcon: true,
  allowAdd: false,
};

