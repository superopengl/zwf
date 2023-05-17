import React from 'react';
import { Breadcrumb, Row, Col, Typography, Grid } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Loading } from './Loading';
import { DebugJsonPanel } from './DebugJsonPanel';

const { Title } = Typography;

const Container = styled.div`
margin: 0 auto;
// padding-left: 8px;
width: 100%;

.ant-page-header-heading-left, .ant-page-header-heading-title {
  flex: 1 1 auto;
}

// .page-header {
//   .ant-tabs {
//     padding-left: 32px;
//   }
// }

.ant-pro-page-container-children-content {
  padding-left: 0;
  padding-right: 0;
}
`

const Footer = styled.div`
margin: 0 auto;
// padding-left: 8px;
width: 100%;
border-top: 1px solid rgba(5, 5, 5, 0.06);
position: fixed;
bottom: 0;
left: 0;
right: 0;
left: 0;
background-color: #FFFFFF;
padding: 8px 1rem;
`

export const PageHeaderContainer = React.memo((props) => {
  const { breadcrumb, children, icon, title, extra, style, onBack, maxWidth, footer, loading, ...others } = props;

  const screens = Grid.useBreakpoint();
  const narrowScreen = (screens.xs || screens.sm) && !screens.md;

  // console.log(screens)

  return <Container style={{ ...style }}>
    <Breadcrumb style={{ padding: '1rem 40px 0' }}
      items={breadcrumb?.map((item, i) => ({
        title: i === breadcrumb.length - 1 || !item.path ? item.name :
          <Link to={item.path}>{item.name}</Link>
      }))}
    >
    </Breadcrumb>
    <PageContainer
      {...others}
      onBack={onBack}
      className="page-header"
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
      // footer={footer}
    >
      <Loading loading={loading}>
        <div style={{
          maxWidth,
          margin: '0 auto',
          padding: `0 ${narrowScreen ? 14 : 40}px`,
          paddingBottom: footer ? 80 : 40,
        }}>{children}</div>
      </Loading>
    </PageContainer>
    {/* <DebugJsonPanel value={narrowScreen} /> */}
    {footer && <Footer>
      <div style={{ maxWidth, margin: '0 auto', width: '100%', padding: `0 ${narrowScreen ? 4 : 40}px`}}>
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

