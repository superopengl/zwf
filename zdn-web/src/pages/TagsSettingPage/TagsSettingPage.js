import React from 'react';
import { withRouter } from 'react-router-dom';
import { deleteUserTag, listUserTags, saveUserTag } from 'services/userTagService';
import TagManagementPanel from 'components/TagManagementPanel';

const TagsSettingPage = () => {

  return (
        <TagManagementPanel
          onList={listUserTags}
          onSave={saveUserTag}
          onDelete={deleteUserTag}
          showOfficialOnly={false}
        />
  );
};

TagsSettingPage.propTypes = {};

TagsSettingPage.defaultProps = {};

export default withRouter(TagsSettingPage);
