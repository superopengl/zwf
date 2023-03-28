import React from 'react';
import { withRouter } from 'react-router-dom';
import { deleteUserTag, listUserTags, saveUserTag } from 'services/userTagService';
import TagManagementPanel from 'components/TagManagementPanel';
import { Row, Col, Typography } from 'antd';

const { Title } = Typography;

const span = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 12,
  xxl: 12
};

const TagsSettingPage = () => {

  return (
    <Row gutter={[30, 30]}>
      {/* <Col {...span}>
        <Title level={3}>Stock Tags</Title>
        <TagManagementPanel
          onList={listStockTags}
          onSave={saveStockTag}
          onDelete={deleteStockTag}
        />
      </Col> */}
      <Col {...span}>
        <Title level={3}>User Tags</Title>
        <TagManagementPanel
          onList={listUserTags}
          onSave={saveUserTag}
          onDelete={deleteUserTag}
          showOfficialOnly={false}
        />

      </Col>
    </Row>


  );
};

TagsSettingPage.propTypes = {};

TagsSettingPage.defaultProps = {};

export default withRouter(TagsSettingPage);
