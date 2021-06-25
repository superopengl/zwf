import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Form, Layout, Modal } from 'antd';
import { Logo } from 'components/Logo';
import { GlobalContext } from '../contexts/GlobalContext';
import { getUserAuthOrg, approveAuthOrg, rejectAuthOrg } from 'services/userAuthOrgService';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SmileOutlined,
  SyncOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const { Paragraph, Text, Title } = Typography;

const LayoutStyled = styled(Layout)`
margin: 0 auto 0 auto;
background-color: #ffffff;
height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 360px;
  background-color: #ffffff;
  height: 100%;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const UserAuthOrgPage = props => {
  const { authId } = props.match.params;

  const [loading, setLoading] = React.useState(true);
  const [userAuthOrg, setUserAuthOrg] = React.useState();
  const context = React.useContext(GlobalContext);

  const load = async () => {
    try {
      const entity = await getUserAuthOrg(authId);
      setUserAuthOrg(entity);
    } catch {
      props.history.push('/');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  const handleApprove = async (rule, value) => {
    try {
      setLoading(true);
      await approveAuthOrg(authId);
      Modal.success({
        title: 'Approved!',
        onOk: () =>  props.history.push('/'),
        okButtonProps: {
          block: true
        }
      });
    } finally {
      setLoading(false);
    }
  }

  const handleReject = async (rule, value) => {
    try {
      setLoading(true);
      await rejectAuthOrg(authId);
      Modal.error({
        title: 'Rejected',
        onOk: () =>  props.history.push('/'),
        okButtonProps: {
          block: true
        }
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <LayoutStyled>
      <ContainerStyled>
        <LogoContainer><Logo /></LogoContainer>
        <Title level={3}>Authorize Organization</Title>
        <Form layout="vertical" style={{ textAlign: 'left', marginTop: 30 }}>
          <Form.Item>
            {userAuthOrg && <><Paragraph>
              Dear user of <Text type="success">{userAuthOrg.email}</Text><br/>
              </Paragraph>
              <Paragraph>

              Organization <strong>{userAuthOrg.orgName}</strong> is asking authentication to access your profile and protofolios. Please read our <a href="/terms_and_conditions" target="_blank">Terms & Conditions</a> and <a href="/privacy_policy" target="_blank">Privacy Policy</a> before making an action. Once you choose either approve or reject, it means you have agreed and accepted our policies.
              </Paragraph>
              </>}
          </Form.Item>
          <Form.Item>
            <Button block type="danger" disabled={loading} size="large" onClick={handleReject}>Reject</Button>
          </Form.Item>
          <Form.Item>
            <Button block type="primary" disabled={loading} size="large" onClick={handleApprove}>Authorize</Button>
          </Form.Item>
        </Form>
      </ContainerStyled>
    </LayoutStyled>
  );
}

UserAuthOrgPage.propTypes = {};

UserAuthOrgPage.defaultProps = {};

export default withRouter(UserAuthOrgPage);
