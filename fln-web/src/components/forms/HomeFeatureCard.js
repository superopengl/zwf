import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  color: #383838;
`;

const P = styled.p`
text-align: justify;
  text-justify: inter-word;
`;

class HomeFeatureCard extends React.Component {
  render() {
    return (
      <Container>
        <div style={{ fontSize: '5rem', color: '#81a9de'}}>{this.props.icon}</div>
        <P>
          {this.props.content}
        </P>
      </Container>
    );
  }
}

HomeFeatureCard.propTypes = {};

HomeFeatureCard.defaultProps = {};

export default HomeFeatureCard;
