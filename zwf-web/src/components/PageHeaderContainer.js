import React from 'react';
import { Breadcrumb, Row, Col, Typography } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
`

export const PageHeaderContainer = React.memo((props) => {
  const { breadcrumb, children, icon, title, extra, style, onBack, maxWidth, ...others } = props;


  return <Container style={{ ...style }}>
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
    ><div style={{ maxWidth, margin: '0 auto' }}>{children}</div></PageContainer>
  </Container>
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
};

PageHeaderContainer.defaultProps = {
  maxWidth: '100%',
};

