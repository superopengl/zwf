import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Input, Typography } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Space, Tag } from 'antd';
import { ConfirmDeleteButton } from 'components/ConfirmDeleteButton';
import { switchMapTo } from 'rxjs/operators';
import { getFontColor } from 'util/getFontColor';
import { generateRandomColorHex } from 'util/generateRandomColorHex';

const { Text } = Typography;

const NEW_TAG_ITEM = {
  isNew: true,
  name: '',
  colorHex: generateRandomColorHex(),
}

export const TagListPanel = React.memo((props) => {
  const { onLoadList, onSave, onDelete } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([{ ...NEW_TAG_ITEM }]);
  const [editingKey, setEditingKey] = React.useState('');

  const columnDef = [
    {
      dataIndex: 'name',
      render: (value, item) => {
        const isEditing = editingKey === item.id;
        const isNew = item.isNew;
        if (isEditing || isNew) {
          return <Input
            style={{ width: 200 }}
            maxLength={100}
            value={value}
            allowClear={item.isNew}
            placeholder={item.isNew ? 'New tag name' : 'Tag name'}
            onChange={e => handleInputChange(item, e.target.value)}
          // onBlur={e => {
          //   if (isNew) {
          //     handleInputChange(item, e.target.value)
          //   } else {
          //     saveTagItem(item)
          //     setEditingKey(null);
          //   }
          // }}
          />
        }
        return <Tag color={item.colorHex} style={{ color: 'white' }}>{item.name}</Tag>
      }
    },
    // {
    //   title: 'Name',
    //   dataIndex: 'name',
    //   // sorter: {
    //   //   compare: (a, b) => (a.name || '').localeCompare(b.name)
    //   // },
    //   render: (value, item) => <Input
    //     value={value}
    //     allowClear={item.isNew}
    //     placeholder={item.isNew ? 'New tag name' : 'Tag name'}
    //     onChange={e => handleInputChange(item, e.target.value)}
    //   />
    // },
    {
      dataIndex: 'colorHex',
      render: (colorHex, item) => {
        const isEditing = editingKey === item.id;
        const isNew = item.isNew;
        return isEditing || isNew ? <Button icon={<SyncOutlined />} ghost style={{ backgroundColor: colorHex, color: getFontColor(colorHex) }} onClick={() => handleColorChange(item)} /> : null
      }
    },
    {
      render: (text, item) => {
        const isNew = item.isNew;
        const isEditing = editingKey === item.id;
        return <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          {isNew && <Button type="primary" ghost disabled={!isItemValid(item)} onClick={() => handleSaveNew(item)}>Create</Button>}
          {isEditing ? <Button type="primary" ghost onClick={() => handleSaveName(item)}>Save</Button> : null}
          {isEditing ? <Button type="text" onClick={() => handleCancelEdit(item)}>Cancel</Button> : null}
          {isNew || isEditing ? null : <Button type="text" onClick={() => handleEdit(item)}>Edit</Button>}
          {isNew || isEditing ? null : <ConfirmDeleteButton onOk={() => handleDelete(item)}
            message={<>Delete tag <Tag color={item.colorHex} style={{ color: getFontColor(item.colorHex) }}>{item.name}</Tag>?</>}>
            Delete
          </ConfirmDeleteButton>}
        </Space>
      }
    },
  ].filter(x => !!x);

  const isItemValid = (item) => {
    return !!item.name?.trim() && item.colorHex;
  }

  const handleInputChange = (item, value) => {
    item.name = value;
    setList([...list]);
  }

  const handleCancelEdit = () => {
    setEditingKey(null);
    onLoadList().subscribe(list => {
      setList([{ ...NEW_TAG_ITEM }, ...list]);
    })
  }

  const handleEdit = (item) => {
    setEditingKey(item.id);
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

  const handleSaveName = (item) => {
    saveTagItem(item);
    setEditingKey(null);
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

  const handleColorChange = (item) => {
    item.colorHex = generateRandomColorHex();
    setList([...list]);
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
    NEW_TAG_ITEM.colorHex = generateRandomColorHex();
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
};

TagListPanel.defaultProps = {
};

