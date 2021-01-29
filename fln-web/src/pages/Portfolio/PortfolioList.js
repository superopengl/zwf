import React from 'react';
import { Button, Modal, List, Space, Row } from 'antd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import Text from 'antd/lib/typography/Text';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { newPortfolioForUser, deletePortfolio, savePortfolio, listPortfolio, listPortfolioForUser } from 'services/portfolioService';
import { TimeAgo } from 'components/TimeAgo';
import { withRouter } from 'react-router-dom';
import ChoosePortfolioType from 'components/ChoosePortfolioType';
import PropTypes from 'prop-types';
import { GlobalContext } from 'contexts/GlobalContext';
import PortfolioForm from '../../components/PortfolioForm';





const PortfolioList = props => {

  const { userId, createMode } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [newModalVisible, setNewModalVisible] = React.useState(createMode);
  const [formVisible, setFormVisible] = React.useState(false);
  const [newType, setNewType] = React.useState();
  const [portfolioId, setPortfolioId] = React.useState();
  const context = React.useContext(GlobalContext);


  const loadList = async () => {
    setLoading(true);
    const data = context.user.role === 'client' ? await listPortfolio() : await listPortfolioForUser(userId);
    setList(data);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  const handleEdit = id => {
    setPortfolioId(id);
    setNewModalVisible(false);
    setFormVisible(true);
    // props.history.push(`/portfolios/${id}`);
  }

  const handleCreateNew = (type) => {
    setNewType(type);
    setPortfolioId(undefined);
    setNewModalVisible(false);
    setFormVisible(true);
  }

  const handleSubmitPortfolio = async (portfolio, userId) => {
    try {
      setLoading(true);
      if(context.user.role === 'client') {
        await savePortfolio(portfolio);
      } else {
        await newPortfolioForUser(portfolio, userId);
      }
      setFormVisible(false);
      await loadList();
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (e, item) => {
    e.stopPropagation();
    const { id, name } = item;
    Modal.confirm({
      title: <>To delete Portfolio <strong>{name}</strong>?</>,
      onOk: async () => {
        await deletePortfolio(id);
        loadList();
      },
      maskClosible: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  return (<>
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
     <Row style={{ flexDirection: 'row-reverse' }}>
        <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => setNewModalVisible(true)}>New Portfolio</Button>
      </Row>
      <List
        itemLayout="horizontal"
        dataSource={list}
        renderItem={item => (
          <List.Item
            key={item.id}
            onClick={() => handleEdit(item.id)}
          >
            <List.Item.Meta
              avatar={<PortfolioAvatar style={{ marginTop: 6 }} value={item.name} id={item.id} />}
              title={<Text style={{ fontSize: '1.2rem' }}>{item.name}</Text>}
              description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <TimeAgo value={item.lastUpdatedAt} prefix="Last Updated" />
                <Space>
                  <Button key="edit" type="link" disabled={loading} icon={<EditOutlined />}></Button>
                  <Button key="delete" type="link" danger disabled={loading} onClick={e => handleDelete(e, item)} icon={<DeleteOutlined />}></Button>
                </Space>
              </Space>}
            />
          </List.Item>
        )}
      />
    </Space>
    <ChoosePortfolioType
      visible={newModalVisible}
      onOk={type => handleCreateNew(type)}
      onCancel={() => setNewModalVisible(false)}
    />
    <Modal
      visible={formVisible}
      maskClosable={false}
      destroyOnClose={true}
      footer={null}
      onOk={() => setFormVisible(false)}
      onCancel={() => setFormVisible(false)}
    >

      <PortfolioForm
        loading={loading}
        id={portfolioId}
        type={newType}
        onCancel={() => setFormVisible(false)}
        onOk={portfolio => handleSubmitPortfolio(portfolio, userId)}
        />
    </Modal>
  </>
  );
};

PortfolioList.propTypes = {
  userId: PropTypes.string,
  createMode: PropTypes.bool,
};

PortfolioList.defaultProps = {
  createMode: false
};

export default withRouter(PortfolioList);
