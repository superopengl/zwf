import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Select, Row, Tag } from 'antd';
import { Loading } from './Loading';
import * as _ from 'lodash';
import { listDocTemplate } from 'services/docTemplateService';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import {VarTag} from './VarTag';

const { Paragraph } = Typography;

const StyledSelect = styled(Select)`
  // .ant-select-selector {
  //   padding-top: 4px !important;
  //   padding-bottom: 4px !important;
  // }

  .ant-select-selection-item {
    display: flex;
    align-items: center;
    height: 34px;
    padding-top: 2px;
    padding-bottom: 2px;
  }

  .ant-select-selection-item-content {
    display: flex;
    align-items: center;
  }
`;

const DocTemplateSelect = props => {
  const { value, onChange, onVariableChange, placeholder, showVariables } = props;
  const [loading, setLoading] = React.useState(true);
  const [docTemplateOptions, setDocTemplateOptions] = React.useState([]);
  const [allVars, setAllVars] = React.useState([]);

  const load = async () => {
    setLoading(true);
    const allDocTemps = await listDocTemplate();
    setDocTemplateOptions(_.sortBy(allDocTemps, ['name']));
    setLoading(false);
  }

  React.useEffect(() => {
    load();
  }, []);

  React.useEffect(() => {
    const allVariables = _.chain(docTemplateOptions)
    .filter(x => value.includes(x.id))
    .map(x => x.variables || [])
    .flatten()
    .uniq()
    .value();

    setAllVars(allVariables);
    onVariableChange(allVariables);
  }, [value, docTemplateOptions]);

  const handleChange = (selectedIds, options) => {
    onChange(selectedIds);
  }

  return <Loading loading={loading}>
    <StyledSelect
      mode="multiple"
      allowClear
      style={{ width: '100%' }}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    >
      {docTemplateOptions.map((x, i) => (<Select.Option key={i} value={x.id}>
        <DocTemplateIcon />
        {x.name}
      </Select.Option>))}
    </StyledSelect>
    {showVariables && <Paragraph style={{marginTop: 10}}>
      Required fields are{' '}
      {allVars.map(v => <VarTag key={v}>{v}</VarTag>)}
      </Paragraph>}
  </Loading>
}

DocTemplateSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onVariableChange: PropTypes.func,
  placeholder: PropTypes.string,
  showVariables: PropTypes.bool,
};

DocTemplateSelect.defaultProps = {
  value: [],
  onChange: () => { },
  onVariableChange: () => { },
  placeholder: 'Doc templates to apply',
  showVariables: false
};

export default DocTemplateSelect
