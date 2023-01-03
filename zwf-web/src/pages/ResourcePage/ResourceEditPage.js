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

import { SavingAffix } from 'components/SavingAffix';

const { Text } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
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
  const params = useParams();

  const { id } = params;
  const isNew = !id;
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [page, setPage] = React.useState(isNew ? createEmptyPage() : null);
  const [debouncedPage, setPageImmidiately] = useDebouncedValue(page, 500);
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
    <Loading loading={loading}>
      <PageContainer
        ghost
        style={{ maxWidth: 900, margin: '0 auto' }}
        header={{
          title: <Row align="middle" wrap={false}>
            <Col>
              <ResourcePageIcon />
            </Col>
            <Col flex={1}>
              <ClickToEditInput placeholder={isNew ? 'Unnamed Page' : "Edit Page"} value={page?.title} size={24} onChange={handleRename} maxLength={100} />
            </Col>
          </Row>,
          extra: [
            debouncedPage
              ? <Button
                type="primary"
                ghost={!!debouncedPage.publishedAt}
                onClick={handleTogglePublish}
                disabled={!canPublish}>
                {debouncedPage.publishedAt ? 'Unpublish' : 'Publish'}
              </Button>
              : <Skeleton.Button />
          ]
        }}
      >
        <div style={{ position: 'relative' }}>
          {!loading && <ResourceEditorPanel
            value={page}
            onChange={handlePageChange}
            debug={debugMode}
          />}
        </div>
      </PageContainer>
    </Loading>
    {saving && <SavingAffix />}
  </LayoutStyled>
});

ResourceEditPage.propTypes = {};

ResourceEditPage.defaultProps = {};

export default ResourceEditPage;
