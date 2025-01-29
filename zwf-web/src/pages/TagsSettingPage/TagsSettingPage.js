import React from 'react';

import { TagListPanel } from 'components/TagListPanel';
import styled from 'styled-components';
import { deleteTag$, listTags$, saveTag$ } from 'services/tagService';
import { PageContainer } from '@ant-design/pro-components';
import { PageHeaderContainer } from 'components/PageHeaderContainer';

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

  const handleLoadTaskTags = () => listTags$()

  return (
    <PageHeaderContainer
      breadcrumb={[
        {
          name: 'Others'
        },
        {
          name: 'Tags',
        },
      ]}
      title='Tag Management'
      style={{
        width: '100%',
        maxWidth: 1000,
      }}
    >
      <TagListPanel
        onLoadList={handleLoadTaskTags}
        onSave={saveTag$}
        onDelete={deleteTag$}
        showColor={true}
      />
    </PageHeaderContainer>
  );
};

TagsSettingPage.propTypes = {};

TagsSettingPage.defaultProps = {};

export default TagsSettingPage;
