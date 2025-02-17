import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button , Space, Alert} from 'antd';
import { Logo } from 'components/Logo';
import OrgProfileForm from './OrgProfileForm';
import { getAuthUser$, logout$ } from 'services/authService';
import { SupportAffix } from 'components/SupportAffix';
import HomeFooter from 'components/HomeFooter';
import { useAuthUser } from 'hooks/useAuthUser';
import { useNavigate } from 'react-router-dom';
import { useAssertRole } from 'hooks/useAssertRole';
import { useAssertUser } from 'hooks/useAssertUser';
import { ProCard } from '@ant-design/pro-components';
import { catchError } from 'rxjs';

const { Title } = Typography;

const Container = styled(Layout)`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: #ffffff;
`;

const InnerContainer = styled.div`
  margin: 2rem auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
  height: 100%;
  // background-color: #f3f3f3;
`;



const OrgOnBoardPage = (props) => {
  useAssertRole(['admin']);
  useAssertUser(user => !user.orgId);

  const [user, setAuthUser] = useAuthUser();

  const handleAfterOrgCreated = () => {
    getAuthUser$().subscribe((user) => {
      setAuthUser(user, '/task');
    });
  }

  const handleLogout = () => {
    logout$().pipe(
      catchError(err => {}),
    ).subscribe(() => {
      setAuthUser(null, '/');
    });
  }

  return <Container>
    <Layout.Content>
      <InnerContainer>
        <Logo />
        <Title level={2} style={{ margin: '2rem auto' }}>
          Setup Organization
        </Title>
        <Space direction="vertical" size="large">
          <Alert 
          style={{textAlign: 'left'}}
          type="warning" message="Organization Initial Setup"
          description="It appears that your organization needs to be set up before you can begin."
          showIcon
          />
        <ProCard bordered>
          <OrgProfileForm onOk={handleAfterOrgCreated} mode="create" />
        </ProCard>
        <Button type="link" block onClick={handleLogout}>Logout</Button>
        </Space>
      </InnerContainer>
    </Layout.Content>
    <HomeFooter />
    <SupportAffix />
  </Container>
}

OrgOnBoardPage.propTypes = {};

OrgOnBoardPage.defaultProps = {};

export default OrgOnBoardPage;
