import { CheckOutlined } from '@ant-design/icons';
import React from 'react';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { FormattedList } from 'react-intl';
import { FormattedMessage } from 'react-intl';
import { Typography, Space } from 'antd';
import styled from 'styled-components';

const FeatureList = styled.div`
margin: 0;
padding: 0;
text-align: left;
display: flex;
flex-direction: column;
`;

const DescriptionContainer = styled.div`
display: flex;
justify-content: center;
`;

const { Text } = Typography;


export const subscriptionDef = [
  {
    key: 'trial',
    title: <FormattedMessage id="text.proMemberFree" />,
    unit: <FormattedMessage id="text.proMemberFreePriceUnit" />,
    price: 0,
    icon: <GiCurvyKnife />,
    description:
      <DescriptionContainer>
        <FeatureList>
          <Space align="start">
            <Text type="success"><CheckOutlined /></Text>
            <FormattedMessage id="text.pricingDescriptionFree" />
          </Space>
        </FeatureList>
      </DescriptionContainer>,
  },
  {
    key: 'monthly',
    title: <FormattedMessage id="text.proMemberMonthly" />,
    unit: <FormattedMessage id="text.proMemberMonthlyPriceUnit" />,
    price: 19,
    icon: <GiSawedOffShotgun />,
    description: 
    <DescriptionContainer>
    <FeatureList>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescriptionCoreData" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescriptionOneMonth" /></Space>
    </FeatureList>
    </DescriptionContainer>,
  }
];