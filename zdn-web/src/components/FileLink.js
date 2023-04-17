import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Spin, Space } from 'antd';
import { getFile } from 'services/fileService';
import { FileIcon } from './FileIcon';
import { from, Subscription } from 'rxjs';
import { Loading } from './Loading';

const { Link } = Typography;

const FileLink = props => {
  const { placeholder, name, id, location } = props;
  const [fileUrl, setFileUrl] = React.useState(location);
  const [fileName, setFileName] = React.useState(placeholder || name);
  const [loading, setLoading] = React.useState(true);

  const loadEntity = () => {
    if (location) {
      setFileUrl(location);
      setLoading(false);
    } else if (id) {
      setLoading(true);
      const file$ = from(getFile(id)).subscribe(file => {
        setFileName(file.fileName);
        setFileUrl(file.location);
        setLoading(false);
      });
      return file$;
    }

    return Subscription.EMPTY;
  }

  React.useEffect(() => {
    const s$ = loadEntity();
    return () => {
      s$.unsubscribe();
    }
  }, [id]);

  return <Loading loading={loading}>
    <Link href={fileUrl} target="_blank" style={{ width: '100%' }}>
      <Space style={{ width: '100%', alignItems: 'center' }}>
        <FileIcon name={fileName} />
        {fileName}
      </Space>
    </Link>
  </Loading>
}

FileLink.propTypes = {
  placeholder: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  location: PropTypes.string,
};

export default FileLink
