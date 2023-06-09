import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Checkbox, Typography, Radio } from 'antd';
import { BuiltInFieldDef } from "components/FieldDef";
import { varNameToLabelName } from 'util/varNameToLabelName';
import { getPortfolio } from 'services/portfolioService';
import { DateInput } from 'components/DateInput';
import { Loading } from 'components/Loading';
import * as moment from 'moment';
import { isValidABN, isValidACN } from "abnacn-validator";
import * as tfn from 'tfn';

const { Text } = Typography;

const isValidTfn = (text) => tfn(text).valid;


const IndividualPortfolioForm = (props) => {
  const { id, type: portfolioType, onOk, onCancel } = props;
  const isNew = !id;

  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();
  const [portfolio, setPortfolio] = React.useState();
  const [initialValues, setInitialValues] = React.useState();
  const type = portfolio?.type || portfolioType;

  const loadEntity = async () => {
    if (!isNew) {
      setLoading(true);
      const entity = await getPortfolio(id);
      setPortfolio(entity);

      const initialValues = getFormInitialValues(entity);
      setInitialValues(initialValues);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity()
  }, []);

  const getFormInitialValues = (portfolio) => {
    if (!portfolio) return undefined;
    const name = portfolio.name || '';
    const fields = portfolio.fields || [];
    const formInitValues = {
      id,
      name,
    };
    for (const f of fields) {
      formInitValues[f.name] = f.value;
    }

    return formInitValues;
  }

  const handleSubmit = async values => {
    const portfolio = {
      id,
      type,
      fields: Object.entries(values).map(([name, value]) => ({ name, value }))
    }

    onOk(portfolio);
  }

  const handleCancel = () => {
    onCancel();
  }

  if (loading) {
    return <Loading />
  }

  const fieldDefs = BuiltInFieldDef.filter(x => x.portfolioType?.includes(type));

  // console.log('value', initialValues);

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }} initialValues={initialValues}>
      {fieldDefs.map((fieldDef, i) => {
        const { name, description, rules, inputType, inputProps } = fieldDef;
        const formItemProps = {
          key: i,
          label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
          name,
          rules
        }
        return (
          <Form.Item {...formItemProps}>
            {inputType === 'text' ? <Input {...inputProps} disabled={loading} /> :
              inputType === 'paragraph' ? <Input.TextArea {...inputProps} disabled={loading} /> :
                inputType === 'date' ? <DateInput placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="DD/MM/YYYY" {...inputProps} /> :
                  inputType === 'select' ? <Radio.Group buttonStyle="solid">
                    {fieldDef.options.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                  </Radio.Group> :
                    null}
          </Form.Item>
        );
      })}
      <Form.Item label="Given name" name="givenName" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input autoComplete="given-name" maxLength={100} allowClear />
      </Form.Item>
      <Form.Item label="Surname" name="surname" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input autoComplete="family-name" maxLength={100} allowClear />
      </Form.Item>
      <Form.Item label="Phone" name="phone" rules={[{ required: true, whitespace: true, max: 30, message: ' ' }]}>
        <Input autoComplete="tel" maxLength={30} allowClear type="tel" />
      </Form.Item>
      <Form.Item label="Wechat" name="wechat" rules={[{ required: false, whitespace: true, max: 50, message: ' ' }]}>
        <Input maxLength={50} allowClear />
      </Form.Item>
      <Form.Item label="Address" name="address" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input maxLength={100} allowClear />
      </Form.Item>
      <Form.Item label="Post address" name="postAddress" rules={[{ required: false, whitespace: true, max: 100, message: ' ' }]}>
        <Input maxLength={100} allowClear placeholder="If different from above address" />
      </Form.Item>
      <Form.Item label="Date of birth" name="dateOfBirth" rules={[{
        required: true,
        validator: async (rule, value) => {
          if (!value) return;
          if (moment(value).isAfter()) {
            throw new Error();
          }
        },
        message: 'Invalid date or not a past date'
      }]}>
        <DateInput autoComplete="bday" maxLength={100} allowClear placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item label="Gender" name="gender" rules={[{ required: false, message: 'Please choose a gender' }]}>
        <Radio.Group buttonStyle="solid" options={[
          {
            label: 'Male',
            value: 'male',
          },
          {
            label: 'Female',
            value: 'female',
          },
          {
            label: 'Other',
            value: 'other',
          }
        ]} />
      </Form.Item>
      <Form.Item label="TFN" name="tfn" rules={[{ required: true, validator: (rule, value) => isValidTfn(value) ? Promise.resolve() : Promise.reject('Invalid TFN') }]}>
        <Input maxLength={100} allowClear />
      </Form.Item>
      {isNew && <Form.Item name="" valuePropName="checked" rules={[{
        validator: (_, value) =>
          value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
      }]}>
        <Checkbox>I have read and agree on the <a href="/declaration" target="_blank">declaration</a></Checkbox>
      </Form.Item>}
      <Form.Item>
        <Button block type="primary" htmlType="submit" disabled={loading}>Save</Button>
      </Form.Item>
      <Form.Item>
        <Button block type="link" onClick={handleCancel}>Cancel</Button>
      </Form.Item>
    </Form>
  );
};

IndividualPortfolioForm.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  loading: PropTypes.bool.isRequired,
};

IndividualPortfolioForm.defaultProps = {
  loading: false
};

export default withRouter(IndividualPortfolioForm);
