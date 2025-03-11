import React from 'react';
import PropTypes from 'prop-types';
import { switchMapTo } from 'rxjs/operators';
import { listTags$, saveTag$, subscribeTags } from 'services/tagService';
import { TagSelectComponent } from './TagSelectComponent';
import { useOutsideClick } from "rooks";
import { Typography } from 'antd';

const { Text } = Typography;

export const TagSelect = React.memo((props) => {

  const { value: propValues, onChange, readonly: propReadonly, allowCreate, inPlaceEdit, placeholder, ...others } = props;

  const [tags, setTags] = React.useState();
  const [value, setValue] = React.useState(propValues);
  const [readonly, setReadonly] = React.useState(propReadonly || inPlaceEdit);
  const ref = React.useRef();
  useOutsideClick(ref, () => {
    if (inPlaceEdit) {
      setReadonly(true);
    }
  })

  React.useEffect(() => {
    const sub$ = subscribeTags(setTags);
    return () => sub$.unsubscribe()
  }, [])

  const handleCreateNewTag = tag => {
    saveTag$(tag).pipe(
      switchMapTo(listTags$()),
    ).subscribe();
  }

  const handleChange = (ids) => {
    setValue(ids);
    onChange(ids);
  }

  const handleFocus = () => {
    if (inPlaceEdit) {
      setReadonly(false);
    }
  }

  const style = {
    ...(others?.style),
    height: 32,
    width: '100%',
  }

  return (
    <div {...others} style={style} ref={ref} onClick={handleFocus}>
      {!value && placeholder && readonly ? <Text type="secondary">{placeholder}</Text> : <TagSelectComponent
        value={value}
        onChange={handleChange}
        readonly={readonly}
        onSave={handleCreateNewTag}
        tags={tags}
        allowCreate={allowCreate}
      />}
    </div>
  );
});

TagSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  readonly: PropTypes.bool,
  allowCreate: PropTypes.bool,
  onChange: PropTypes.func,
  inPlaceEdit: PropTypes.bool,
  placeholder: PropTypes.string,
};

TagSelect.defaultProps = {
  readonly: false,
  allowCreate: true,
  onChange: () => { },
  inPlaceEdit: false,
};

