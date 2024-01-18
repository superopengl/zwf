import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Input, Switch, InputNumber, Typography } from 'antd';
import {
  PlusOutlined
} from '@ant-design/icons';
import { Space, Tag } from 'antd';
import { ConfirmDeleteButton } from 'components/ConfirmDeleteButton';
import { CirclePicker, GithubPicker } from 'react-color';
import { concat } from 'rxjs';
import { switchMapTo } from 'rxjs/operators';
import { getFontColor } from 'util/getFontColor';

const { Text } = Typography;

const NEW_TAG_ITEM = Object.freeze({
  isNew: true,
  name: '',
  color: null,
});

export const TagListPanel = React.memo((props) => {
  const { onLoadList, onSave, onDelete, showColor } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([{ ...NEW_TAG_ITEM }]);

  const columnDef = [
    {
      render: (value, item) => <Tag color={item.colorHex} style={item.colorHex ? {color: getFontColor(item.colorHex)} : null}>{item.name}</Tag>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      // sorter: {
      //   compare: (a, b) => (a.name || '').localeCompare(b.name)
      // },
      render: (value, item) => <Input
        value={value}
        allowClear={item.isNew}
        placeholder={item.isNew ? 'New tag name' : 'Tag name'}
        onChange={e => handleInputChange(item, e.target.value)}
        onBlur={e => handleInputBlur(item, e.target.value)}
      />
    },
    showColor ? {
      title: 'Color',
      dataIndex: 'colorHex',
      render: (colorHex, item) => <GithubPicker color={colorHex} onChangeComplete={color => handleColorChange(item, color)} />
    } : null,
    {
      render: (text, item) => <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        {item.isNew && <Button type="primary" icon={<PlusOutlined />} disabled={!isItemValid(item)} onClick={() => handleSaveNew(item)}></Button>}
        {item.builtIn ? <Text type="secondary"><small>builtin</small></Text> : item.isNew ? null : <ConfirmDeleteButton shape="circle" onOk={() => handleDelete(item)} />}
      </Space>
    },
  ].filter(x => !!x);

  const isItemValid = (item) => {
    return !!item.name?.trim() && (!showColor || item.colorHex);
  }

  const handleInputChange = (item, value) => {
    item.name = value;
    setList([...list]);
  }

  const saveTagItem = (item) => {
    setLoading(true);
    onSave(item).pipe(
      switchMapTo(onLoadList())
    ).subscribe(list => {
      setList([{ ...NEW_TAG_ITEM }, ...list]);
      setLoading(false);
    })
  }

  const handleInputBlur = (item, value) => {
    if (item.isNew) return;
    saveTagItem(item);
  }

  const handleDelete = (item) => {
    setLoading(true);
    onDelete(item.id).pipe(
      switchMapTo(onLoadList())
    ).subscribe(list => {
      setList([{ ...NEW_TAG_ITEM }, ...list]);
      setLoading(false);
    })
  }

  const handleColorChange = (item, color) => {
    if (item.colorHex === color.hex) {
      return
    }
    item.colorHex = color.hex;
    setList([...list]);
    if (item.isNew) return;
    saveTagItem(item);
  }

  const loadList = () => {
    setLoading(true);
    return onLoadList().subscribe(list => {
      setList([{ ...NEW_TAG_ITEM }, ...list]);
      setLoading(false);
    })
  }

  React.useEffect(() => {
    const subscription = loadList();
    return () => {
      subscription.unsubscribe();
    }
  }, []);


  const handleSaveNew = (item) => {
    if (!isItemValid(item)) return;
    saveTagItem(item);
  }

  return (
    <Table columns={columnDef}
      showHeader={false}
      bordered={false}
      dataSource={list}
      rowKey={item => item.id || 'new'}
      loading={loading}
      pagination={false}
    />
  );
});

TagListPanel.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showColor: PropTypes.bool,
};

TagListPanel.defaultProps = {
  showColor: false
};

