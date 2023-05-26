import { Button } from 'antd';
import { useParams } from "react-router-dom";
import React from 'react';
import styled from 'styled-components';
import { ResourceEditorPanel } from './ResourceEditorPanel';
import { v4 as uuidv4 } from 'uuid';
import { finalize } from 'rxjs/operators';
import { ResourcePageIcon } from 'components/entityIcon';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { getEditResourcePage$, saveResourcePage$ } from 'services/resourcePageService';
import { useNavigate } from 'react-router-dom';

import { SavingAffix } from 'components/SavingAffix';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';
import { SaveOutlined } from '@ant-design/icons';
import { CheckboxButton } from 'components/CheckboxButton';

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  width: 100%;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;

  .ant-page-header-heading-left {
    flex: 1;

    .ant-page-header-heading-title {
      flex: 1;
    }
  }

`;

const createEmptyPage = () => {
  return {
    id: uuidv4(),
    title: 'Unnamed Page',
    keywords: '',
    html: ''
  }
}


export const ResourceEditPage = React.memo((props) => {
  useAssertRole(['system']);
  const params = useParams();

  const { id } = params;
  const isNew = !id;
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [page, setPage] = React.useState(isNew ? createEmptyPage() : null);
  const navigate = useNavigate();
  const debugMode = false;

  // Initial load
  React.useEffect(() => {
    if (isNew) {
      return;
    }
    const sub$ = getEditResourcePage$(id)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(setPage);

    return () => sub$.unsubscribe();
  }, []);

  const handleSave = () => {
    setSaving(true)
    saveResourcePage$(page).pipe(
      finalize(() => setSaving(false))
    ).subscribe();
  }

  const handleRename = (title) => {
    if (title !== page.title) {
      setPage(p => ({ ...p, title }))
    }
  }

  const handlePageChange = (changes) => {
    setPage(p => ({ ...p, ...changes }));
  };

  const handleTogglePublish = () => {
    const publishedAt = page.publishedAt ? null : new Date();
    const newPage = { ...page, publishedAt }
    setPage(newPage);
    setSaving(true)
    saveResourcePage$(newPage).pipe(
      finalize(() => setSaving(false))
    ).subscribe();
  }

  const canPublish = page?.html?.trim().length > 0;
  return <LayoutStyled>
    <PageHeaderContainer
      loading={loading}
      onBack={() => navigate(-1)}
      icon={<ResourcePageIcon />}
      title={<ClickToEditInput placeholder={isNew ? 'Unnamed Page' : "Edit Page"} value={page?.title} size={24} onChange={handleRename} maxLength={100} />}
      ghost
      maxWidth={1000}
      style={{ maxWidth: 900, margin: '0 auto' }}
      extra={[
        <CheckboxButton
          key="publish"
          value={!!page?.publishedAt}
          onChange={handleTogglePublish}
          disabled={!canPublish}
        >{page?.publishedAt ? 'Unpublish' : 'Publish'}</CheckboxButton>,
        <Button
          key="save"
          icon={<SaveOutlined />}
          onClick={handleSave}
        >Save</Button>
      ]}
    >
      <div style={{ position: 'relative' }}>
        {!loading && <ResourceEditorPanel
          value={page}
          onChange={handlePageChange}
          debug={debugMode}
        />}
      </div>
    </PageHeaderContainer>
    {saving && <SavingAffix />}
  </LayoutStyled>
});

ResourceEditPage.propTypes = {};

ResourceEditPage.defaultProps = {};

export default ResourceEditPage;
