import React from 'react';

import styled from 'styled-components';

// import 'App.css';
import { Layout, Typography, Button } from 'antd';

import * as _ from 'lodash';
import { GlobalContext } from 'contexts/GlobalContext';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';
import { Link } from 'react-router-dom';
import * as moment from 'moment';

const { Content } = Layout;
const { Text, Title } = Typography;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const ContentStyled = styled(Content)`
margin: 4rem auto 0 auto;
padding: 2rem 0;
text-align: center;
max-width: 700px;
width: 100%;
`;

const MembershipCardContainer = styled.div`
border: 1px solid #eeeeee;
border-radius: 20px;
margin: 2rem auto 0 auto;
padding: 2%;
width: 100%;
position: relative;
box-shadow: 0px 5px 15px #888888;
`;

const MembershipCard = styled.div`
background-image: url("/images/membership-card.png");
background-size: 68%;
background-repeat: no-repeat;
background-position: right top;
width: 100%;
padding-bottom: 55%;
position: relative;
text-align: left;
`;

// const MembershipCardBack = styled.div`
// background-image: url("/images/membership-card-back.png");
// background-size: contain;
// background-repeat: no-repeat;
// background-position: center;
// width: 100%;
// padding-bottom: 60%;
// `;

const MembershipCardBack = styled.div`
border: 1px solid #eeeeee;
border-radius: 20px;
margin: 3rem auto 0 auto;
padding: 1rem;
width: 100%;
position: relative;
box-shadow: 0px 5px 15px #888888;
background-image: url("/images/membership-card-back.png");
background-size: cover;
background-repeat: no-repeat;
background-position: center;
padding-bottom: 55%;
`;

const MemberName = styled.div`
position: absolute;
left: 3%;
bottom: 25%;
`;

const MemberId = styled.div`
position: absolute;
left: 3%;
bottom: 0;
`;

const MemberExpiration = styled.div`
position: absolute;
right: 3%;
bottom: 0;
`;

const AvatarImage = styled.div`
top: 5%;
left: 5%;
width: 20%;
height: 40%;
position: absolute;
background-size: contain;
background-repeat: no-repeat;
background-position: center;
`;

class MembershipPage extends React.Component {
  render() {
    const { windowWidth } = this.props;

    const maxFontSizeRem = 1.3;
    const fontSize = Math.min(windowWidth / 700 * maxFontSizeRem, maxFontSizeRem);

    const memberCardStyle = {
      fontSize: `${fontSize}rem`,
      lineHeight: `${fontSize * 0.4}rem`
    }

    return <GlobalContext.Consumer>
      {
        context => {

          const { role, user: { memberId, expiryDate }, profile: { name, secondaryName, pictures } } = context;
          const avatarUrl = _.get(pictures, '0.location', null);
          return <LayoutStyled>
            
            {/* <BarStyled></BarStyled> */}
            <ContentStyled>
              <Title level={2}>Member Card</Title>
              {/* <Title level={4}><Text code>{memberId}</Text></Title> */}
              <Text>{_.capitalize(role)} membership</Text>



              <div style={{ padding: '1rem' }} ref={el => (this.componentRef = el)}>
                <MembershipCardContainer >
                  <MembershipCard style={memberCardStyle}>
                    <MemberName>
                      <p><Text type="secondary"><small>Member Name</small></Text></p>
                      <p><Text strong>{name}{secondaryName ? ` (${secondaryName})` : null}</Text></p>
                    </MemberName>
                    <MemberId>
                      <p><Text type="secondary"><small>Member ID</small></Text></p>
                      <p><Text strong>{memberId}</Text></p>
                    </MemberId>
                    <MemberExpiration>
                      <p><Text type="secondary"><small>Valid Until</small></Text></p>
                      <p><Text strong>{expiryDate ? moment(expiryDate).format('DD MMM YYYY') : 'Unlimited'}</Text></p>
                    </MemberExpiration>
                  </MembershipCard>
                  {avatarUrl && <AvatarImage style={{ backgroundImage: `url("${avatarUrl}")` }} />}
                </MembershipCardContainer>
                <MembershipCardBack>
                </MembershipCardBack>
              </div>
              <div style={{ width: '100%', textAlign: 'left', padding: '20px 20px 0 20px' }}>
                <Text type="secondary">*{!avatarUrl && ' The avatar/logo picture is not specified.'} You can upload pictures on the <Link to='/profile'>profile page</Link> and the first picture will be used on this member card.</Text>
              </div>
              <div style={{ marginTop: '3rem' }}>
                <ReactToPrint content={() => this.componentRef}>
                  <PrintContextConsumer>
                    {({ handlePrint }) => <Button type="primary" onClick={handlePrint}>Print this member card</Button>}
                  </PrintContextConsumer>
                </ReactToPrint>
              </div>
            </ContentStyled>
          </LayoutStyled>
        }
      }
    </GlobalContext.Consumer>
  }
}

MembershipPage.propTypes = {};

MembershipPage.defaultProps = {};

export default MembershipPage;
