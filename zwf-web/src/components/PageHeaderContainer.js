import React from 'react';
import { Breadcrumb, Row, Col, Typography } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Loading } from './Loading';

const { Title } = Typography;

const Container = styled.div`
margin: 0 auto;
padding-left: 8px;
width: 100%;

.ant-page-header-heading-left, .ant-page-header-heading-title {
  flex: 1 1 auto;
}

.ant-tabs {
  padding-left: 32px;
}

.ant-pro-page-container-children-content {
  padding-left: 0;
  padding-right: 0;
}
`

const Footer = styled.div`
margin: 0 auto;
padding-left: 8px;
width: 100%;
border-top: 1px solid rgba(5, 5, 5, 0.06);
position: fixed;
bottom: 0;
left: 0;
right: 0;
left: 0;
background-color: white;
padding: 16px 24px;
`

export const PageHeaderContainer = React.memo((props) => {
  const { breadcrumb, children, icon, title, extra, style, onBack, maxWidth, footer, loading, ...others } = props;


  return <Container style={{ ...style, maxWidth }}>
    <Breadcrumb style={{ padding: '1rem 40px 0' }}>
      {breadcrumb?.map((item, i) => <Breadcrumb.Item key={i} menu={item.menu ? { items: item.menu.map((m, j) => ({ key: j, label: m })) } : null}>
        {
          i === breadcrumb.length - 1 || !item.path ? item.name :
            <Link to={item.path}>{item.name}</Link>
        }
      </Breadcrumb.Item>)}
    </Breadcrumb>
    <PageContainer
      {...others}
      onBack={onBack}
      header={{
        // backIcon: <LeftOutlined />,
        title: <Row align="middle" wrap={false} style={{ height: 46, paddingLeft: onBack ? 0 : 32, width: '100%' }}>
          {icon && <Col flex="none">{icon}</Col>}
          <Col flex="auto">
            <Title level={3} style={{ margin: 0 }}>{title}</Title>
          </Col>
        </Row>,
        extra: extra?.filter(x => !!x),
        style: {
          paddingTop: 0,
          paddingLeft: 10,
          maxWidth,
          margin: '0 auto',
        }
      }}
    >
      <Loading loading={loading}>
        <div style={{ maxWidth, margin: '0 auto', padding: '0 40px' }}>{children}</div>
      </Loading>
    </PageContainer>
    {footer && <Footer>
      <div style={{ maxWidth, margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'end' }}>
        {footer}
      </div>
    </Footer>}
  </Container >
});

PageHeaderContainer.propTypes = {
  breadcrumb: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string,
    menu: PropTypes.array,
  })),
  icon: PropTypes.object,
  title: PropTypes.any,
  extra: PropTypes.array,
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  footer: PropTypes.object,
  loading: PropTypes.bool,
};

PageHeaderContainer.defaultProps = {
  maxWidth: '100%',
  loading: false,
};

