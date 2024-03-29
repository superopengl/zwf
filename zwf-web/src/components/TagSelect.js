import React from 'react';
import PropTypes from 'prop-types';
import { switchMap } from 'rxjs/operators';
import { listTags$, saveTag$, subscribeTags } from 'services/tagService';
import { useOutsideClick } from "rooks";
import { Typography, Select, Divider, Input, Row, Tag } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import uniqolor from 'uniqolor';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const TagSelect = React.memo((props) => {

  const { value: propValues, onChange, readonly, inPlaceEdit, placeholder, bordered, allowClear } = props;

  const [tags, setTags] = React.useState([]);
  const [value, setValue] = React.useState(propValues);
  // const [readonly, setReadonly] = React.useState(propReadonly || inPlaceEdit);
  const [name, setName] = React.useState('');
  const inputRef = React.useRef(null);
  const ref = React.useRef();
  useOutsideClick(ref, () => {
    if (inPlaceEdit) {
      // setReadonly(true);
    }
  })

  React.useEffect(() => {
    const sub$ = subscribeTags(list => setTags(list ?? []));
    return () => sub$.unsubscribe()
  }, [])

  const handleCreateNewTag = () => {
    if (!name.trim()) {
      return;
    }
    const tagId = uuidv4();
    const tag = {
      id: tagId,
      name: name,
      colorHex: uniqolor.random().color,
    };
    saveTag$(tag).pipe(
      switchMap(() => listTags$()),
    ).subscribe({
      next: () => {
        inputRef.current?.focus();
        setName('');
      },
      error: () => {}
    });
  }

  const handleChange = (ids) => {
    setValue(ids);
    onChange(ids);
  }


  const handleAddNewTag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleCreateNewTag();
  };

  const onNameChange = (event) => {
    setName(event.target.value);
  };


  const handleTagRender = (props) => {
    const { value, closable, onClose } = props;
    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const tag = tags.find(t => t.id === value);
    if (!tag) return null;
    return (
      <Tag
        color={tag.colorHex}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          marginRight: 3,
        }}
      >
        {tag.name}
      </Tag>
    );
  };

  if (readonly) {
    return <Row gutter={[2,2]}>
      {tags.filter(t => value?.includes(t.id)).map(t => <Tag key={t.id} color={t.colorHex}>{t.name}</Tag>)}
    </Row>
  }

  return <>
    <Select
      mode="multiple"
      placeholder={placeholder}
      allowClear={allowClear}
      style={{ minWidth: 150, width: '100%' }}
      bordered={bordered}
      tagRender={handleTagRender}
      dropdownMatchSelectWidth={false}
      // maxTagCount="responsive"
      options={tags.map(t => ({ value: t.id, label: <Tag color={t.colorHex}>{t.name}</Tag> }))}
      value={value || undefined}
      onChange={handleChange}
      notFoundContent={"No tag defined"}
      dropdownRender={(menu) => (
        <>
          {menu}
          {inPlaceEdit && <>
            <Divider
              style={{
                margin: '8px 0',
              }}
            />
            <Row
              style={{
                padding: '0 8px 4px',
                width: '100%',
              }}
            >
              <Input.Search
                placeholder="Add new tag"
                ref={inputRef}
                value={name}
                onChange={onNameChange}
                onPressEnter={handleAddNewTag}
                onSearch={handleCreateNewTag}
                block
                style={{ width: '100%' }}
                enterButton={<PlusOutlined />}
              />
            </Row>
          </>}
        </>
      )}
    />
  </>
});

TagSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  readonly: PropTypes.bool,
  onChange: PropTypes.func,
  inPlaceEdit: PropTypes.bool,
  bordered: PropTypes.bool,
  placeholder: PropTypes.string,
  allowClear: PropTypes.bool,
};

TagSelect.defaultProps = {
  readonly: false,
  onChange: () => { },
  inPlaceEdit: false,
  allowClear: false,
};

