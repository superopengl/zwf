
import React from 'react';
import styled from 'styled-components';
import { Typography, List, Drawer } from 'antd';
import PropTypes from 'prop-types';
import MoneyAmount from 'components/MoneyAmount';
import { TimeAgo } from 'components/TimeAgo';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { sumBy } from 'lodash';
import { from } from 'rxjs';

const { Text } = Typography;

const StyledDrawer = styled(Drawer)`
  .ant-list-item {
    padding: 8px 0;
  }
`

const CreditHistoryListDrawer = (props) => {

  const { visible: propVisible, onFetch, onOk } = props;
  const [visible, setVisible] = React.useState(propVisible);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState();

  const loadList = async (visible) => {
    setVisible(visible);
    if (visible) {
      try {
        setLoading(true);
        setData(await onFetch());
      } finally {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    const load$ = from(loadList(propVisible)).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, [propVisible]);

  const total = sumBy(data, x => (+x.amount) || 0);

  return (
    <StyledDrawer
      title="Credit History"
      visible={visible}
      closable={true}
      maskClosable={true}
      destroyOnClose={false}
      onClose={() => onOk()}
      width={400}
      footer={
        <>
          <Text strong>Sub Total</Text>
          <MoneyAmount style={{ fontSize: '1.5rem', marginLeft: '1rem' }} type="success" strong value={total} />
        </>

      }
      footerStyle={{ textAlign: 'right' }}
    >
      <List
        loading={loading}
        dataSource={data}
        size="small"
        renderItem={item => {
          return <List.Item>
            <List.Item.Meta
              description={<TimeAgo value={item.createdAt} />}
              title={item.referredUserEmail || getSubscriptionName(item.type)}
            />
            <MoneyAmount type={item.amount < 0 ? 'danger' : 'success'} value={item.amount} />
          </List.Item>
        }}
      />
    </StyledDrawer>
  )
};



CreditHistoryListDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onFetch: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

CreditHistoryListDrawer.defaultProps = {
  visible: false
};

export default CreditHistoryListDrawer;
