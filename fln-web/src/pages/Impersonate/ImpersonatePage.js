import { AutoComplete, Button, Form, Space } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { reactLocalStorage } from 'reactjs-localstorage';
import { impersonate } from 'services/authService';
import { listAllUsers } from 'services/userService';

const ImpersonatePage = () => {
  const context = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(false);
  const [userOptions, setUserOptions] = React.useState([]);

  const load = async () => {
    setLoading(true);
    const list = await listAllUsers();
    const options = list.filter(x => x.email !== context.user.email).map(x => ({ value: x.email }));
    setUserOptions(options);
    setLoading(false);
  }

  React.useEffect(load, []);

  const handleSubmit = async values => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const { email } = values;

      await impersonate(email);
      reactLocalStorage.clear();

      window.location = '/';
    } catch (e) {
      setLoading(false);
    }
  }

  return (
    <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="User email" name="email" rules={[{ type: 'email', required: true, message: ' ' }]}>
          <AutoComplete placeholder="User email" maxLength="100" disabled={loading} autoFocus={true}
            options={userOptions}
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
            }
          />
        </Form.Item>
        <Form.Item>
          <Button block type="primary" htmlType="submit" disabled={loading}>Impersonate</Button>
        </Form.Item>
      </Space>
    </Form>
  )
}

ImpersonatePage.propTypes = {};

ImpersonatePage.defaultProps = {};

export default ImpersonatePage;
