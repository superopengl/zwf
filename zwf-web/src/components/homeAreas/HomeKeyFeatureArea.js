import React from 'react';
import { Typography, Col, Row, Image } from 'antd';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;

const Container = styled.div`
justify-content: center;
margin-bottom: 6rem;
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
max-width: 800px;
// background-color:  #F1F2F5;
// background-image: linear-gradient(5deg, #F1F2F5, #F1F2F5 50%, #ffffff 50%, #ffffff 100%);
padding: 3rem 1rem 1rem;
margin: 0 auto;

h2 {
  font-size:24px;
  font-weight:700;
}

.ant-row {
  margin: 5rem auto;
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
  max-width: 600px;
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
  return (
    <Container>
      <InnerContainer>
        <Title style={{ textAlign: 'center' }}>Key Features</Title>
        <Row gutter={[48, 24]} justify='center'>
          <Col {...span}>
            <Title level={2}><Text style={{ color: '#0FBFC4' }}>Task</Text> Template</Title>
            <Paragraph>Task management description. Task management description. Task management description. Task management description. </Paragraph>
          </Col>
          <Col {...span} >
            <Image src="/images/feature-task-template.svg" preview={false} />
          </Col>
        </Row>
        <Row gutter={[24, 24]} justify='center'>
          <Col span={24}>
            <Title level={2}><Text style={{ color: '#0051D9' }}>Doc</Text> Template</Title>
            <Paragraph>Task management description. Task management description. Task management description. Task management description. </Paragraph>
          </Col>
          <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/images/feature-doc-template.svg" preview={false} />
          </Col>
        </Row>
        <Row gutter={[48, 24]} justify='center'>
          <Col {...span}>
            <Title level={2}>Doc <Text style={{ color: '#F77234' }}>Sign</Text></Title>
            <Paragraph>Task management description. Task management description. Task management description. Task management description. </Paragraph>
          </Col>
          <Col {...span}>
            <Image src="/images/feature-doc-sign.svg" preview={false} />
          </Col>
        </Row>
        <Row gutter={[48, 24]} justify='center'>
          <Col {...span}>
            <Image src="/images/feature-timeline.svg" preview={false} />
          </Col>
          <Col {...span}>
            <Title level={2}><Text style={{ color: '#0FBFC4' }}>Timeline</Text></Title>
            <Paragraph>Task management description. Task management description. Task management description. Task management description. </Paragraph>
          </Col>
        </Row>
        <Row gutter={[24, 24]} justify='center'>
          <Col span={24}>
            <Title level={2}>Task management</Title>
            <Paragraph>Task management description. Task management description. Task management description. Task management description. </Paragraph>
          </Col>
          <Col span={24}>
            <Image src="/images/feature-task-management.svg" preview={false} />
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
