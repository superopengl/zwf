import { Space, Card, Modal, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import PropTypes from 'prop-types';
import { MailOutlined, MessageOutlined } from '@ant-design/icons';
import { UnreadMessageIcon } from './UnreadMessageIcon';
import { TaskIcon } from './entityIcon';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import { showTaskModal } from 'components/showTaskModal';
import { GlobalContext } from 'contexts/GlobalContext';
import { UserAvatar } from './UserAvatar';

const { Link: TextLink } = Typography;

const StyledCard = styled(Card)`
position: relative;
box-shadow: 0 1px 2px rgba(0,0,0,0.1);
.ant-card-body {
  padding: 16px;
}

&.unread {
  background-color: rgb(255,255,220);
  font-weight: 600;
}
`;

export const TaskCard = withRouter((props) => {

  const { task } = props;
  const { id, name, forWhom, email, lastUnreadMessageAt, taskTemplateName } = task;

  const context = React.useContext(GlobalContext);

  const myUserId = context.user.id;

  const goToTask = (e, id) => {
    e.stopPropagation();
    props.history.push(`/task/${id}`);
  }

  return <StyledCard
    title={<><TaskIcon /> {name}</>}
    extra={<TextLink onClick={e => goToTask(e, id)}><Icon component={() => <MdOpenInNew />} /></TextLink>}
    size="small"
    hoverable
    onClick={() => showTaskModal(id, name, myUserId)}
    className={lastUnreadMessageAt ? 'unread' : ''}
  >
    {lastUnreadMessageAt && <UnreadMessageIcon style={{ position: 'absolute', right: 16, top: 16 }} />}
    <Space direction="vertical" style={{ width: '100%' }}>
      <Text type="secondary"><small>{taskTemplateName}</small></Text>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space style={{ lineHeight: '0.5rem', padding: 0 }}>
          <UserAvatar userId={task.userId} />
          <Space direction="vertical">
            <small>{forWhom}</small>
            <small>{email}</small>
          </Space>
        </Space>
      </Space>
    </Space>
    {/* <pre>{JSON.stringify(task, null, 2)}</pre> */}
  </StyledCard>
});

TaskCard.propTypes = {
  task: PropTypes.any.isRequired
};

TaskCard.defaultProps = {};
