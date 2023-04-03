import React from 'react';

import { TagListPanel } from 'components/TagListPanel';
import styled from 'styled-components';
import { deleteTag$, listTags$, saveTag$ } from 'services/tagService';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';


const OrgTagListPage = () => {

  useAssertRole(['admin', 'agent']);

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
      maxWidth={1200}
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

OrgTagListPage.propTypes = {};

OrgTagListPage.defaultProps = {};

export default OrgTagListPage;
