import React from 'react';
import { withRouter } from 'react-router-dom';
import { TagListPanel } from 'components/TagListPanel';
import styled from 'styled-components';
import { deleteTag$, listTags$, saveTag$ } from 'services/taskTagService';
import { Card, Space } from 'antd';
import { tap } from 'rxjs/operators';
import { GlobalContext } from 'contexts/GlobalContext';

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;


  .ant-spin-nested-loading {
    width: 100%;
  }

  // .ant-divider {
  //   margin: 20px 0 8px;
  // }
`;

const TagsSettingPage = () => {
  const context = React.useContext(GlobalContext);

  const handleLoadTaskTags = () => listTags$()

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%', justifyContent: 'center', maxWidth: 600 }}>
        <Card  type="inner"
        title="Task tags" bordered={true} style={{ width: '100%' }} bodyStyle={{padding: 0}}>
          <TagListPanel
            onLoadList={handleLoadTaskTags}
            onSave={saveTag$}
            onDelete={deleteTag$}
            showColor={true}
          />
        </Card>
      </Space>
    </Container>
  );
};

TagsSettingPage.propTypes = {};

TagsSettingPage.defaultProps = {};

export default withRouter(TagsSettingPage);
