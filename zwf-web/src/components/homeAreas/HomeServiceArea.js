import React from 'react';
import styled from 'styled-components';
import { Typography, Row, Col, Space } from 'antd';
import { IconContext } from "react-icons";
import { GiGraduateCap } from 'react-icons/gi';
import { BsLightning } from 'react-icons/bs';
import { AiOutlineGlobal } from 'react-icons/ai';
import { BiDollar } from 'react-icons/bi';

const { Title, Paragraph } = Typography;

const InfoCard = styled.div`
box-sizing: border-box;
width: 100%;
// margin-top: 2rem;
padding: 1rem;
// border: 1px solid #eeeeee;


section .ant-typography {
  text-align: left;
}
`;

const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
// text-align: center;
padding: 2rem 0;
// background: #fafafa;
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 1200px;
`;

const FEATURES = [
  {
    icon: <GiGraduateCap />,
    title: 'Professional',
    content: 'Tom and Jerry is an American animated franchise and series of comedy short films created in 1940 by William Hanna and Joseph Barbera. Best known for its 161 theatrical short films by Metro-Goldwyn-Mayer, the series centers on the rivalry between the titular characters of a cat named Tom and a mouse named Jerry.'
  },
  {
    icon: <BsLightning />,
    title: 'Realtime',
    content: 'Tom and Jerry is an American animated franchise and series of comedy short films created in 1940 by William Hanna and Joseph Barbera. Best known for its 161 theatrical short films by Metro-Goldwyn-Mayer, the series centers on the rivalry between the titular characters of a cat named Tom and a mouse named Jerry.'
  },
  {
    icon: <AiOutlineGlobal />,
    title: 'Global',
    content: 'Tom and Jerry is an American animated franchise and series of comedy short films created in 1940 by William Hanna and Joseph Barbera. Best known for its 161 theatrical short films by Metro-Goldwyn-Mayer, the series centers on the rivalry between the titular characters of a cat named Tom and a mouse named Jerry.'
  },
  {
    icon: <BiDollar />,
    title: 'Quality',
    content: 'Tom and Jerry is an American animated franchise and series of comedy short films created in 1940 by William Hanna and Joseph Barbera. Best known for its 161 theatrical short films by Metro-Goldwyn-Mayer, the series centers on the rivalry between the titular characters of a cat named Tom and a mouse named Jerry.'
  }
]


const HomeServiceArea = props => {
  const span = {
    xs: 24,
    sm: 24,
    md: 24,
    lg: 12,
    xl: 12,
    xxl: 12
  };

  return (
    <Container>
      <InnerContainer>
        <Row gutter={20}>
          {FEATURES.map((f, i) => <Col key={i} {...span}>
            <InfoCard >
              <Space size="large">
                <IconContext.Provider value={{ size: '4rem', color: 'rgba(0,0,0,0.45)' }}>
                  {f.icon}
                </IconContext.Provider>
                <Title level={2} type="secondary">{f.title}</Title>
              </Space>
              <section>
                <Paragraph type="secondary">
                  {f.content}
                </Paragraph>
              </section>
            </InfoCard>
          </Col>)}


        </Row>
      </InnerContainer>
    </Container>
  );
}

HomeServiceArea.propTypes = {};

HomeServiceArea.defaultProps = {};

export default HomeServiceArea;
