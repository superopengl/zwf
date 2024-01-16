import { Space, Card, Typography, Row, Col, Tooltip } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { UnreadMessageIcon } from './UnreadMessageIcon';
import { TaskIcon } from './entityIcon';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import { showTaskModal } from 'components/showTaskModal';
import { GlobalContext } from 'contexts/GlobalContext';
import { UserAvatar } from './UserAvatar';
import { UserDisplayName } from './UserDisplayName';
import { getUserDisplayName } from 'util/getDisplayName';

const { Link: TextLink, Text, Paragraph } = Typography;

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
  const { id, name, givenName, surname, email, lastUnreadMessageAt, taskTemplateName } = task;

  const context = React.useContext(GlobalContext);

  const myUserId = context.user.id;
  const myRole = context.user.role;

  const goToTask = (e, id) => {
    e.stopPropagation();
    props.history.push(`/task/${id}`);
  }

  return <StyledCard
    title={<Tooltip title={name}><TaskIcon /> {name}</Tooltip>}
    extra={<TextLink onClick={e => goToTask(e, id)}><Icon component={() => <MdOpenInNew />} /></TextLink>}
    size="small"
    hoverable
    onClick={() => showTaskModal(id, name, myUserId, myRole)}
    className={lastUnreadMessageAt ? 'unread' : ''}
  >
    {lastUnreadMessageAt && <UnreadMessageIcon style={{ position: 'absolute', right: 16, top: 16 }} />}
      {/* <Paragraph type="secondary" style={{lineHeight: 0.8}}><small>{taskTemplateName}</small></Paragraph> */}
      <Tooltip title={getUserDisplayName(email, givenName, surname)} placement='bottom'>
        <Row gutter={10} wrap={false} style={{ width: '100%' }}>
          <Col>
            <UserAvatar userId={task.userId} size={40} />
          </Col>
          <Col flex='auto'>
            <UserDisplayName
              email={email}
              surname={surname}
              givenName={givenName}
            />
          </Col>
        </Row>
      </Tooltip>
    {/* <pre>{JSON.stringify(task, null, 2)}</pre> */}
  </StyledCard>
});

TaskCard.propTypes = {
  task: PropTypes.any.isRequired
};

TaskCard.defaultProps = {};
