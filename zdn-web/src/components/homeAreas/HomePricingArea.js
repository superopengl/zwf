import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Typography, Col, Row } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { VscRocket } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import { subscriptionDef } from 'def/subscriptionDef';

const { Title, Paragraph } = Typography;

const StyledRow = styled(Row)`
`;

const StyledCol = styled(Col)`
display: flex;
justify-content: center;
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 8,
  xl: 8,
  xxl: 8
};

const Container = styled.div`
justify-content: center;
margin-bottom: 6rem;
width: 100%;
text-align: center;
padding: 4rem 1rem;
// background: #fafafa;
// background: rgb(240, 242, 245);
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 900px;
`;



export const HomePricingArea = props => {
  return (
    <Container>
      <InnerContainer>
        <Title>Choose the plan that's right for you</Title>
        <Paragraph type="secondary">
        Membership plans start at USD $29.00 / month
        </Paragraph>
        <StyledRow gutter={[40, 40]}>
          {subscriptionDef.map(s => <StyledCol key={s.key} {...span}>
            <SubscriptionCard
              title={s.title}
              icon={s.icon}
              description={s.description}
              price={s.price}
              interactive={false}
              unit={s.unit} />
          </StyledCol>)}
        </StyledRow>
      </InnerContainer>
    </Container>
  )
}

HomePricingArea.propTypes = {
};

HomePricingArea.defaultProps = {
};
