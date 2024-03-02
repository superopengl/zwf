// import 'App.css';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeServiceArea from 'components/homeAreas/HomeServiceArea';
import React from 'react';
import { HomePricingArea } from 'components/homeAreas/HomePricingArea';
import { withRouter } from 'react-router-dom';
import HomeContactArea from 'components/homeAreas/HomeContactArea.js';
import smoothscroll from 'smoothscroll-polyfill';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import styled from 'styled-components';
import HomeFooter from 'components/HomeFooter';

smoothscroll.polyfill();

const Container = styled.div`
  margin: 0 0 120px 0;
  padding: 0;
  max-width: 100%;
`;

const scrollToElement = (selector) => {
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth',
    block: "start",
    inline: "nearest"
  });
}


const HomePage = (props) => {

  useDocumentTitle('All in one task doc management');

  return <Container>
    <section>
      <HomeCarouselArea />
    </section>
    {/* <section>
      <HomeFeatureArea />
    </section> */}
    <section><HomeServiceArea /></section>
    <section id="pricing">
      <HomePricingArea />
    </section>
    <section><HomeContactArea bgColor="#0a425e"></HomeContactArea></section>
    {/* <section><HomeSearchArea /></section> */}
    {/* <section>
      <HomeServiceArea bgColor="#135200" />
    </section> */}
    {/* <HomeFooter /> */}
  </Container>
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default withRouter(HomePage);
