import { MenuOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table, Space } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import { getOrgClientDataBag$ } from 'services/clientService';
import { finalize } from 'rxjs';
import { FieldNameSelect } from 'components/FieldNameSelect';
import { EditDataBagContext } from 'contexts/EditDataBagContext';


const Row = ({ children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });
  const style = {
    ...props.style,
    transform: CSS.Transform.toString(
      transform && {
        ...transform,
        scaleY: 1,
      },
    )?.replace(/translate3d\(([^,]+),/, 'translate3d(0,'),
    transition,
    ...(isDragging
      ? {
        position: 'relative',
        zIndex: 9999,
      }
      : {}),
  };
  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if (child.key === 'sort') {
          return React.cloneElement(child, {
            children: (
              <MenuOutlined
                ref={setActivatorNodeRef}
                style={{
                  touchAction: 'none',
                  cursor: 'move',
                }}
                {...listeners}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

export const OrgClientDataBagPanel = (props) => {
  const { id } = props;
  const [loading, setLoading] = React.useState(true);
  const [fields, setFields] = React.useState([]);
  const [allNames, setAllNames] = React.useState([]);
  const [allFieldNames, setAllFieldNames] = React.useState([]);

  React.useEffect(() => {
    const sub$ = getOrgClientDataBag$(id)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe({
        next: (result) => {
          setFields(result.fields);
          setAllNames(result.org)
        }
      });
    return () => sub$.unsubscribe();
  }, []);

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setFields((previous) => {
        const activeIndex = previous.findIndex((i) => i.key === active.id);
        const overIndex = previous.findIndex((i) => i.key === over?.id);
        return arrayMove(previous, activeIndex, overIndex);
      });
    }
  };

  const columns = [
    {
      key: 'sort',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (value) => <FieldNameSelect value={value} />
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (value) => value
    },
  ];

  return (
    <DndContext onDragEnd={onDragEnd}>
      <SortableContext
        // rowKey array
        items={fields.map((i) => i.key)}
        strategy={verticalListSortingStrategy}
      >
        <EditDataBagContext.Provider value={{
          allNames,
          setAllNames
        }}>
          <Table
            bordered={false}
            // showHeader={false}
            pagination={false}
            size="small"
            components={{
              body: {
                row: Row,
              },
            }}
            rowKey="key"
            columns={columns}
            dataSource={fields}
            footer={() => <Space>
              <FieldNameSelect />
            </Space>}
          />
        </EditDataBagContext.Provider>
      </SortableContext>
    </DndContext>
  );
};

OrgClientDataBagPanel.propTypes = {
  id: PropTypes.string,
};

OrgClientDataBagPanel.defaultProps = {};