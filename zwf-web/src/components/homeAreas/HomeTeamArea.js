import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { Typography, Avatar } from 'antd';

const { Title } = Typography;

const InfoCard = styled.div`
box-sizing: border-box;
width: 100%;
// margin-top: 2rem;
padding: 1rem;
// border: 1px solid #eeeeee;

p {
  text-align: left;
}
`;



const StyledAvatar = (props) => <Avatar
  style={{
    marginBottom: '1rem',
    border: '1px solid #dddddd'
  }}
  size={240} src={props.src} />


class HomeTeamArea extends React.Component {
  render() {
    const props = {
      bgColor: '',
      span: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 8,
        xl: 8,
        xxl: 8
      },
      style: {
        backgroundImage: 'linear-gradient(180deg, #f5f5f5, #ffffff)',
        // color: '#f0f0f0',
      }
    }

    return (
      <HomeRowArea {...props} title="Team">
        <InfoCard >
          <StyledAvatar src="/images/avatar-zhou.jpg" />
          <section>
            <Title level={3}>Jinlin Zhou</Title>
            <p>
              Hi, I am the principal and partner in our accounting firm. I have more than 15 years accounting and taxation experience. Does it sound right for you?
            </p>
            <p>
              I like reading, sports, swimming, most of time if I am not working, you probably can find me nowhere but at home, watching soap opera.
            </p>
            <p>
              I have a lovely family and living in northshore, hope somewhere, sometime, we just walk by on the street or catching up for a coffee.
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <StyledAvatar src="https://static.wixstatic.com/media/8a7fac_45052d578d8348f0bb66ee06c96ac5c4~mv2.jpg/v1/fill/w_294,h_374,al_c,q_80,usm_0.66_1.00_0.01/0970526135807ea3126b40600733e9bc.webp" />
          <section>
            <Title level={3}>Claire Cheng</Title>
            <p>
              Hi, I am Claire. I have been in Australia for more than 5 years. I have been working in our firm for more than 3 years.
            </p>
            <p>
              I have been crossing australia in the past where I worked, I loved and I enjoyed.
            </p>
            <p>
              I am usually busy with numbers and paperworks. Thank you if you can call me or text me or even come to see me!
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <StyledAvatar src="/images/avatar-pei.jpg" />
          <section>
            <Title level={3}>Pei Zhang</Title>
            <p>
              Hi, my name is Pei. I have been in Sydney for nearly 6 years, but I am originally from China. I studied
              at the University of Sydney majoring in accounting and commercial law.
            </p>
            <p>I have been working as an
            accountant since I graduated and I have been in our team for almost one year. I am responsible for
            the bookkeeping, corporate accounting, and taxation matters.
            </p>
            <p>
              I am into the work-life balance style
              of our firm. When not in the office, you can find me spending time with my family.
            </p>
          </section>
        </InfoCard>

      </HomeRowArea>
    );
  }
}

HomeTeamArea.propTypes = {};

HomeTeamArea.defaultProps = {};

export default HomeTeamArea;
