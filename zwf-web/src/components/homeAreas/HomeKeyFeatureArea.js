import React from 'react';
import { Typography, Col, Row, Image, Grid } from 'antd';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;

const Container = styled.div`
justify-content: center;
margin: 5rem 0 0;
width: 100%;

// text-align: center;
// background: #fafafa;
// background: rgb(240, 242, 245);

.ant-table {
  font-size: 14px;
}
`;

const InnerContainer = styled.div`
width: 100%;
// max-width: 800px;
// background-color:  #F1F2F5;
// background-image: linear-gradient(5deg, #F1F2F5, #F1F2F5 50%, #ffffff 50%, #ffffff 100%);
padding: 0;
margin: 0 auto;
display: flex;
flex-direction: column;
align-items: center;

h2 {
  font-size:24px;
  font-weight:700;
}

.ant-row {
  margin: 0 auto;
  padding: 3rem 0;
}

.ant-col {
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  align-items: center;
}

div.ant-typography {
  font-size: 16px;
  max-width: 100vw;
  width: 400px;
}
`;


const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}



export const HomeKeyFeatureArea = () => {
  const screens = Grid.useBreakpoint();

  const isWide = screens.md;

  return (
    <Container>
      <InnerContainer>
        <Title style={{ textAlign: 'center' }}>Key Features</Title>
        <Row gutter={[48, 24]} justify='center' style={{ maxWidth: 800 }}>
          <Col {...span}>
            <Title level={2}><span style={{ color: '#0FBFC4' }}>Form</span> Template</Title>
            <Paragraph>Create custom forms based on your specific needs and reuse them as necessary. Our platform offers a variety of controls to customize forms that meet your business requirements.</Paragraph>
          </Col>
          <Col {...span} >
            <Image src="/images/feature-femplate.svg" preview={false} style={{ padding: '0 1rem' }} />
          </Col>
        </Row>
        <Row gutter={[24, 24]} justify='center'>
          <Col span={24}>
            <Title level={2}><span style={{ color: '#0051D9' }}>Doc</span> Template</Title>
            <Paragraph style={{ width: 600 }}>
              Doc Template allows you to create text by leaving placeholders for variables, which can be replaced later with each client's specific information.</Paragraph>
          </Col>
          {isWide && <Col span={24} style={{ display: 'flex', justifyContent: 'center', maxWidth: 1000 }}>
            <Image src="/images/feature-demplate.svg" preview={false} />
          </Col>}
          {!isWide && <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/images/feature-demplate-narrow.svg" preview={false} style={{ padding: '0 1rem' }} />
          </Col>}
        </Row>
        <Row gutter={[48, 24]} justify='center' style={{ maxWidth: 800 }}>
          <Col {...span}>
            <Title level={2}>Doc <span style={{ color: '#F77234' }}>Sign</span></Title>
            <Paragraph>With our one-click online e-sign feature, you can easily request signatures from your clients without the hassle of repeatedly attaching PDF files in emails.</Paragraph>
          </Col>
          <Col {...span}>
            <Image src="/images/feature-doc-sign.svg" preview={false} style={{ padding: '0 1rem' }} />
          </Col>
        </Row>
        <Row gutter={[48, 24]} justify='center' style={{ maxWidth: 800, flexDirection: screens.lg ? 'row' : 'column-reverse' }}>
          <Col {...span}>
            <Image src="/images/feature-timeline.svg" preview={false} style={{ padding: '0 1rem' }} />
          </Col>
          <Col {...span}>
            <Title level={2}><span style={{ color: '#0FBFC4' }}>Timeline</span> & <span style={{ color: '#0FBFC4' }}>Realtime Communication</span></Title>
            <Paragraph>Keep track of task timelines and important events with our task tracking feature. Communicate with your clients in real-time, focusing on individual tasks.</Paragraph>
          </Col>
        </Row>
        <Row gutter={[48, 24]} justify='center' style={{ maxWidth: 800 }}>
          <Col {...span}>
            <Title level={2}><span style={{ color: '#0051D9' }}>Client</span> Portal</Title>
            <Paragraph>Our design is compact and user-friendly for your clients. They can easily browse and check associated tasks on any device, including mobile phones, iPads, and desktop computers.</Paragraph>
          </Col>
          <Col {...span}>
            <Image src="/images/feature-client-portal.svg" preview={false} style={{ padding: '0 1rem' }} />
          </Col>
        </Row>
        <div justify='center' style={{ width: '100%', height: 'clamp(3rem, 7vw, 8rem)', backgroundImage: 'linear-gradient(to top left, #F6F7F9, #F6F7F9 50%, #ffffff 50%, #ffffff 100%)' }} />
        <Row gutter={[24, 24]} justify='center' style={{ width: '100%', backgroundColor: '#F6F7F9' }}>
          <Col span={24}>
            <Title level={2}>Task management</Title>
            <Paragraph style={{ width: 600 }}>We believe that a simple task workflow board with four columns based on task status can make task management easy for you by providing a clear visual representation of your ongoing business activities.</Paragraph>
          </Col>
          <Col flex="auto" style={{
            alignItems: 'center',
            backgroundImage: 'url("/images/feature-task-management.svg")',
            backgroundPosition: screens.md ? 'center' : 'right bottom',
            backgroundRepeat: 'no-repeat',
            backgroundSize: screens.md ? 'contain' : 'cover',
            height: 450,
          }}>
            {/* <Image src="/images/feature-task-management.svg" preview={false} style={{minWidth: 800, maxWidth: 1000 }} /> */}
            <div style={{display: 'flex', alignItems: 'start', width: '100%', maxWidth: 1000, margin: '0 auto'}}>
              <Image src="/images/feature-task-management-overflow.svg" preview={false} width={460} style={{ position: 'relative', top: 120 }} />
            </div>
          </Col>
        </Row>
      </InnerContainer>
    </Container>
  )
}

HomeKeyFeatureArea.propTypes = {
};

HomeKeyFeatureArea.defaultProps = {
};
