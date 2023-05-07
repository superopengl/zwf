import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Select, Row, Space } from 'antd';
import { Loading } from './Loading';
import * as _ from 'lodash';
import { listDocTemplate$ } from 'services/docTemplateService';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import { VarTag } from './VarTag';
import { finalize } from 'rxjs/operators';

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
  const { value, onChange, onVariableChange, placeholder, showVariables, isMultiple } = props;
  const [loading, setLoading] = React.useState(true);
  const [docTemplateOptions, setDocTemplateOptions] = React.useState([]);
  const [allRefFields, setAllRefFields] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    const $sub = listDocTemplate$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(allDocTemps => {
      setDocTemplateOptions(_.sortBy(allDocTemps, ['name']));
    });

    return () => $sub.unsubscribe();
  }, []);

  React.useEffect(() => {
    const allRefFields = _.chain(docTemplateOptions)
      .filter(x => Array.isArray(value) ? value.includes(x.id) : value === x.id)
      .map(x => x.refFieldNames || [])
      .flatten()
      .uniq()
      .value();

    setAllRefFields(allRefFields);
    onVariableChange(allRefFields);
  }, [value, docTemplateOptions]);

  const handleChange = (selectedValue, options) => {
    onChange(selectedValue);
  }

  return <Loading loading={loading}>
    <StyledSelect
      mode={isMultiple ? "multiple" : null}
      allowClear
      style={{ width: '100%' }}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      options={docTemplateOptions.map(x => ({ label: <Space><DocTemplateIcon />{x.name}</Space>, value: x.id }))}
    />
    {showVariables && allRefFields.length > 0 && <Paragraph type="secondary" style={{ marginTop: 8 }}>
      This doc template references fields {allRefFields.map(v => <VarTag key={v}>{v}</VarTag>)}.
    </Paragraph>}
  </Loading>
}

DocTemplateSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]).isRequired,
  onChange: PropTypes.func.isRequired,
  onVariableChange: PropTypes.func,
  placeholder: PropTypes.string,
  showVariables: PropTypes.bool,
  isMultiple: PropTypes.bool,
};

DocTemplateSelect.defaultProps = {
  value: [],
  onChange: () => { },
  onVariableChange: () => { },
  placeholder: 'Doc templates to apply',
  showVariables: false,
  isMultiple: true,
};

export default DocTemplateSelect
