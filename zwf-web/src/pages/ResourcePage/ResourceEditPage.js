import { Button, Typography, Row, Col, Skeleton } from 'antd';
import { useParams } from "react-router-dom";
import React from 'react';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { ResourceEditorPanel } from './ResourceEditorPanel';
import { v4 as uuidv4 } from 'uuid';
import { finalize } from 'rxjs/operators';
import { ResourcePageIcon } from 'components/entityIcon';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { getEditResourcePage$, saveResourcePage$ } from 'services/resourcePageService';
import { useDebouncedValue } from "rooks";
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';

import { SavingAffix } from 'components/SavingAffix';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';

const { Text } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  max-width: 700px;
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
  const [debouncedPage, setPageImmidiately] = useDebouncedValue(page, 500);
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

  // Auto save every 0.5 seconds if needed
  React.useEffect(() => {
    if (debouncedPage) {
      setSaving(true)
      saveResourcePage$(debouncedPage).pipe(
        finalize(() => setSaving(false))
      ).subscribe();
    }
  }, [debouncedPage]);

  const handleRename = (title) => {
    if (title !== page.title) {
      setPage(p => ({ ...p, title }))
    }
  }

  const handlePageChange = (changes) => {
    setPage(p => ({ ...p, ...changes }));
  };

  const handleTogglePublish = () => {
    setPageImmidiately(p => {
      const publishedAt = p.publishedAt ? null : new Date();
      return { ...p, publishedAt };
    })
  }

  const canPublish = page?.html?.trim().length > 0;
  return <LayoutStyled>
    <PageHeaderContainer
      loading={loading}
      onBack={() => navigate('/resource')}
      icon={<ResourcePageIcon />}
      title={<ClickToEditInput placeholder={isNew ? 'Unnamed Page' : "Edit Page"} value={page?.title} size={24} onChange={handleRename} maxLength={100} />}
      ghost
      style={{ maxWidth: 900, margin: '0 auto' }}
      extra={[
        debouncedPage
          ? <Button
            type="primary"
            ghost={!!debouncedPage.publishedAt}
            onClick={handleTogglePublish}
            disabled={!canPublish}>
            {debouncedPage.publishedAt ? 'Unpublish' : 'Publish'}
          </Button>
          : <Skeleton.Button />
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
