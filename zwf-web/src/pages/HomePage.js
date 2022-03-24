// import 'App.css';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeServiceArea from 'components/homeAreas/HomeServiceArea';
import React from 'react';
import { HomePricingArea } from 'components/homeAreas/HomePricingArea';
import { withRouter } from 'react-router-dom';
import HomeContactArea from 'components/homeAreas/HomeContactArea.js';
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();


const scrollToElement = (selector) => {
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth',
    block: "start",
    inline: "nearest"
  });
}


const HomePage = (props) => {
  return <>

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
  </>
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default withRouter(HomePage);
