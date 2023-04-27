import React from 'react';
import styled from 'styled-components';

import { Steps, Button, Form, Input, Typography } from 'antd';
import { isValidABN } from "abnacn-validator";
import { createMyOrg$, getMyOrgProfile$, saveMyOrgProfile$ } from 'services/orgService';
import PropTypes from 'prop-types';
import { CountrySelector } from 'components/CountrySelector';
import { BetaSchemaForm, ProFormSelect, FooterToolbar, ProFormInstance } from '@ant-design/pro-components';
import { catchError, finalize } from 'rxjs';
import { useNavigate } from 'react-router-dom';

const { Step } = Steps;
const { Text } = Typography;

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  position: relative;
  text-align: left;

  .ant-form-item {
    margin-bottom: 2rem;
  }
`;

const DEFAULT_PROFILE = {
  country: 'AU',
}

const OrgProfileForm = (props) => {

  const [org, setOrg] = React.useState(DEFAULT_PROFILE);
  const [requireAbn, setRequireAbn] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const form = React.useRef();


  React.useEffect(() => {
    getMyOrgProfile$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(org => {
        setOrg({
          ...DEFAULT_PROFILE,
          ...org
        });
      });
  }, []);

  React.useEffect(() => {
    form.current?.resetFields();
  }, [org]);

  const handleSubmitBasic = values => {
    const source$ = props.mode === 'create' ? createMyOrg$(values) : saveMyOrgProfile$(values);
    setLoading(true)
    source$.pipe(
      finalize(() => setLoading(false))
    ).subscribe(() => props.onOk())
  }

  const handleValuesChange = (changedValues, allValues) => {
    const { country } = changedValues;
    if (country) {
      setRequireAbn(country === 'AU');
    }
  }

  const handleSubmittion = () => {
    form.current.submit();
  }

  const columns = [
    {
      title: 'Org name',
      dataIndex: 'name',
      formItemProps: {
        help: <>The name of your organisation in ZeeWorkflow. Not necessarily the same as the legal name. The name will show up on some pages.</>,
        rules: [{ required: true, message: ' ', whitespace: true, max: 50 }]
      },
      fieldProps: {
        allowClear: true,
        placeholder: 'Your org name',
        autoComplete: 'organization'
      }
    },
    {
      title: 'Org legal business name',
      dataIndex: 'businessName',
      formItemProps: {
        help: <>The legal name of your organisation. This name will be used in invoices and as the recipient name of certian notification emails.</>,
        rules: [{ required: true, message: ' ', whitespace: true, max: 100 }]
      },
      fieldProps: {
        allowClear: true,
        placeholder: 'Your org legal business name',
        autoComplete: 'organization'
      }
    },
    {
      title: 'Org registration country',
      dataIndex: 'country',
      formItemProps: {
        rules: [{ required: true, message: ' ', whitespace: true, max: 50 }]
      },
      fieldProps: {
        defaultValue: 'AU'
      },
      renderFormItem: () => <CountrySelector defaultValue="AU" />
    },
    {
      title: 'Address',
      dataIndex: 'address',
      formItemProps: {
        rules: [{ required: false, message: ' ', whitespace: true, max: 100 }]
      },
      fieldProps: {
        allowClear: true,
        placeholder: 'Unit 123, God Avenue, NSW 1234',
        autoComplete: 'street-address'
      }
    },
    {
      title: 'Phone number',
      dataIndex: 'tel',
      formItemProps: {
        rules: [{ required: false, message: ' ', whitespace: true, max: 100 }]
      },
      fieldProps: {
        allowClear: true,
        autoComplete: 'tel'
      }
    },
  ].map((x, i) => ({
    ...x,
    // key: i,
    initialValue: org[x.dataIndex],
  }));

  return <Container>
    {!loading && <BetaSchemaForm
      // trigger={<>Org Profile</>}
      // layoutType={props.mode === 'create' ? 'Form' : "ModalForm"}
      // title="Org Profile"
      // width={400}
      formRef={form}
      submitter={{
        searchConfig: {
          resetText: 'Cancel',
          submitText: 'Save',
        },
        resetButtonProps: {
          type: 'text',
          style: {
            display: 'none',
          }
        },
        submitButtonProps: {
          block: true
        },
        render: () => null
      }}
      shouldUpdate={true}
      columns={columns}
      onValuesChange={handleValuesChange}
      onFinish={handleSubmitBasic}
    />}
    <Button block type="primary" disabled={loading} onClick={handleSubmittion}>Save</Button>
  </Container>

}

OrgProfileForm.propTypes = {
  onOk: PropTypes.func,
  mode: PropTypes.oneOf(['create', 'update'])
};

OrgProfileForm.defaultProps = {
  onOk: () => { },
  mode: 'update'
};

export default OrgProfileForm;
