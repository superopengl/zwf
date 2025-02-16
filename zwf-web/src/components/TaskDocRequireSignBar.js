import React from 'react';
import PropTypes from 'prop-types';
import { useDebouncedValue } from "rooks";
import { Alert, Row, Space, Typography } from 'antd';
import { FileIcon } from 'components/FileIcon';
import { FaSignature } from 'react-icons/fa';
import Icon from '@ant-design/icons';
import { showSignTaskFileModal } from './showSignTaskFileModal';

const { Link: TextLink } = Typography;

const shouldSign = file => {
  return file?.requiresSign && !file?.signedAt;
}

const getSignnableFiles = (fields) => {
  const files = [];
  fields?.forEach(field => {
    const { type, value } = field;
    if (type === 'upload' && value?.length) {
      const signnableFiles = value.filter(f => shouldSign(f));
      files.push(...signnableFiles);
    } else if (type === 'autodoc' && shouldSign(value)) {
      files.push(value);
    }
  })

  return files;
}

export const TaskDocRequireSignBar = React.memo((props) => {

  const { value: task, onChange } = props;

  const [files, setFiles] = React.useState([]);
  const [visible, setVisible] = React.useState(false);
  const [changedFields, setChangedFields] = React.useState({});
  const [aggregatedChangedFields] = useDebouncedValue(changedFields, 1000);
  const [disabled, setDisabled] = React.useState(false);
  // const [bufferedChangedFields, setBu]


  React.useEffect(() => {
    const files = getSignnableFiles(task?.fields);
    setFiles(files);
    setVisible(!!files.length);
  }, [task]);

  const handleSignTaskDoc = (taskFile) => {
    showSignTaskFileModal(taskFile, {
      onOk: () => {
        taskFile.signedAt = new Date();
        onChange(taskFile);
      },
    })
  }

  // return <Modal
  //   visible={visible}
  //   title={<Space><Icon component={FaSignature} /> Documents require sign</Space>}
  //   onOk={() => setVisible(false)}
  //   onCancel={() => setVisible(false)}
  //   footer={<Button type="primary" onClick={() => setVisible(false)}>Done</Button>}
  // >
  //   {files.map((f, i) => <Row key={i} justify="space-between" align="middle">
  //     <TextLink onClick={() => handleSignTaskDoc(f)} >
  //       <Space>
  //         <FileIcon name={f.name} />
  //         {f.name}
  //       </Space>
  //     </TextLink>
  //   </Row>)}

  // </Modal>

  if (!files?.length) {
    return null;
  }

  return (<>
    <Alert
      showIcon
      type="warning"
      icon={<Icon component={FaSignature} />}
      style={{ marginBottom: 32 }}
      message="These documents require to be signed"
      description={<>
     {files.map((f, i) => <Row key={i} justify="space-between" align="middle">
       <TextLink onClick={() => handleSignTaskDoc(f)} >
         <Space>
           <FileIcon name={f.name} />
           {f.name}
         </Space>
       </TextLink>
     </Row>)}
      </>}
    />
  </>
  );
});

TaskDocRequireSignBar.propTypes = {
  value: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    docs: PropTypes.array,
  }).isRequired,
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
  // onChange: PropTypes.func,
  onSavingChange: PropTypes.func,
};

TaskDocRequireSignBar.defaultProps = {
  type: 'client',
  onSavingChange: () => { },
};

