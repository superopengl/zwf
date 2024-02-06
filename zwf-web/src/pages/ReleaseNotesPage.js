import React from 'react';
import styled from 'styled-components';
import { Typography, Divider } from 'antd';
import { Logo } from 'components/Logo';
const ContainerStyled = styled.div`
padding: 2rem 1rem;
margin: 1rem auto;
text-align: left;
width: 100%;
max-width: 900px;
font-size: 0.9rem;

h2 {
  font-size: 1.3rem;
}

h3 {
  font-size: 1.1rem;
}
`;
const { Title } = Typography;
const ReleaseNotesPage = () => (
  <ContainerStyled>
    <div style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}><Logo /></div>
    <Title style={{ textAlign: 'center' }}>ZeeWorkflow Release Notes</Title>
    <p>Protecting your privacy and the confidentiality of your personal information is a high priority for Techseeding Pty Ltd.</p>
    <p>Personal information with regards to this website and all Techseeding Pty Ltd online portals (and any other Techseeding Pty Ltd printed materials) means information we hold about you from which we can search for and retrieve your identity. For example, we may collect and use your name and address details when you acquire or use particular Techseeding Pty Ltd membership services. Techseeding Pty Ltd understands that providing your personal information imposes a serious responsibility upon us.</p>
    <p>We are committed to protecting your personal information. Where your personal information may be disclosed, and to the extent that we can, we believe in giving you a choice as to whom we may disclose your personal information to, and how these third parties may use your personal information for direct marketing.</p>
    <Divider/>
    <Title level={2} id="collecting-your-personal-information">Collecting your personal information</Title>
    <p>We collect personal information directly from you, and only to the extent necessary to deliver and ensure a Techseeding Pty Ltd membership service. We may choose to collect personal information from you when you fill in an application form, both in hard copy format or online via our website, or over the telephone.</p>
    <p>We will always attempt to collect personal information from you using lawful and fair means, and not in an unlawful manner. The type of personal information we may collect from you generally comprises name, address, gender, contact details (including phone, fax and e-mail).</p>
    <p>If we do not collect this information, we may not be able to provide you with the Techseeding Pty Ltd membership service you have requested.</p>
    <p>If you supply us with the personal information of a third party, you agree to notify that third party of this Privacy Policy.</p>
    <Divider/>
    <Title level={2} id="how-we-make-use-of-your-personal-information">How we make use of your personal information</Title>
    <p>Techseeding Pty Ltd will collect your personal information in order to provide you with, or give you access to, a particular Techseeding Pty Ltd membership service. Techseeding Pty Ltd may choose to disclose your personal information for the main purpose for which we collect it, with such disclosure reasonably expected by you. Some of these examples include, but are not limited to:</p>
    <ul>
      <li>Helping Techseeding Pty Ltd to develop a stronger relationship with you</li>
      <li>Internal membership management, accounting and finance</li>
      <li>Administrative reporting</li>
      <li>Protecting you and Techseeding Pty Ltd from fraud</li>
      <li>As part of a Techseeding Pty Ltd campaign.</li>
    </ul>
    <p>Occasionally, we may also disclose your personal information for the purposes of facilitating the distribution of marketing materials to you by Techseeding Pty Ltd employing a third party. We will not do this if you ask us not to do so. There are other situations where we are compelled by law to disclose your personal information.</p>
    <Divider/>
    <Title level={2} id="direct-marketing">Direct Marketing</Title>
    <p>Techseeding Pty Ltd may use the personal information we collect from you to identify particular ZeeWorkflow
    Pty Ltd products and services, which we believe may be of interest and benefit to you, such as from third
    parties. This may include such activities as competitions, policy announcements, campaigns or to hear about
    shows and entertainment from Techseeding Pty Ltd, our community partners or affiliated sponsors. We may
    then contact you to let you know about these products and services. If you do not wish to receive this direct
marketing information from Techseeding Pty Ltd, please let us know.</p>
    <Divider/>
    <Title level={2} id="quality-and-accuracy-of-your-personal-information">Quality and accuracy of your personal information</Title>
    <p>If we have accurate personal information about you, it enables us to provide you with the best possible service.
    Techseeding Pty Ltd will take reasonable steps to ensure the personal information we collect, use and disclose is
    accurate, complete and up-to-date. If you find that the personal information we hold about you is inaccurate,
incomplete or out-of-date, please contact us immediately and we will take reasonable steps to correct it.</p>
    <Divider/>
    <Title level={2} id="zwf-allied-pty-ltd-campaigns">Techseeding Pty Ltd Campaigns</Title>
    <p>Techseeding Pty Ltd conducts various campaigns and from time to time may use your contact details to update
    you on the status of a campaign. Likewise, Techseeding Pty Ltd may also use your details for specific petitions
    on campaigns. If you have signed a petition, your details may be used for instances such as presenting this
    information to members of Parliament. If you do not wish for Techseeding Pty Ltd to contact you via phone or
email during or campaign or present a petition you have signed, please let us know.</p>
    <Divider/>
    <Title level={2} id="security-of-your-information">Security of your information</Title>
    <p>Techseeding Pty Ltd takes reasonable steps to protect your personal information from loss, misuse, unauthorised
disclosure or destruction.</p>
    <Divider/>
    <Title level={2} id="cookies-on-zwf-allied-pty-ltd-website">Cookies on Techseeding Pty Ltd website</Title>
    <p>A "cookie" is a packet of information that allows the Techseeding Pty Ltd server (the computer that houses our
web site) to identify and interact more effectively with your computer.</p>
    <p>When you access our website, we send you a "temporary cookie" that gives you a unique identification number.
    A different identification number is sent each time you use our web site. Cookies do not identify individual
    users, although they do identify a user's Internet browser type and your Internet Service Provider. Our cookie
    allows us to keep track of the pages you have accessed while visiting our web site. It also allows you to page
    back and forwards through our website and return to pages you have already visited without requiring you to
log in to our home page again.</p>
    <p>You can configure your Internet browser to accept all cookies, reject all cookies or notify you when a cookie is
sent. Please refer to your Internet browser's instructions or help screens to learn more about these functions.</p>
    <Divider/>
    <Title level={2} id="information-logged-on-the-zwf-allied-pty-ltd-website">Information logged on the Techseeding Pty Ltd website</Title>
    <p>When you visit the Techseeding Pty Ltd web site, our server logs the following information which is provided by your browser for statistical purposes only:</p>
    <ul>
      <li>The type of browser and operating system you are using</li>
      <li>Your Internet Service Provider and top level domain name (for example - .com, .gov, .au, .uk etc)</li>
      <li>Your computer's IP (Internet Protocol) address (a number which is unique to the machine through which you are connected to the internet).</li>
      <li>All of this information is used by Techseeding Pty Ltd for aggregated statistical analyses, such as Google Analytics reporting, or systems administration purposes only. More information about how Google Analytics collects and processes data is available at <a href="https://www.google.com/policies/privacy/partners/" target="_blank" rel="noopener noreferrer">https://www.google.com/policies/privacy/partners/</a>.</li>
    </ul>
    <Divider/>
    <Title level={2} id="links-to-other-websites">Links to other websites</Title>
    <p>The Techseeding Pty Ltd site contains links to other web sites. While Techseeding Pty Ltd will always endeavour to engage in business arrangements with commercial entities of good repute and ethical business practices, we are ultimately not responsible for the privacy practices or the content of such external web sites.</p>
    <p>Please note that Techseeding Pty Ltd takes no responsibility for your PC obtaining any viruses from visiting these website links, or viruses obtained from visiting the Techseeding Pty Ltd website.</p>
    <Divider/>
    <Title level={2} id="searching-within-the-zwf-allied-pty-ltd-website">Searching within the Techseeding Pty Ltd website</Title>
    <p>Search terms that you enter when using our search engine are collected, but are not associated with any other information that we collect. We use these search terms for the purpose of aggregated statistical analyses so we can ascertain what people are looking for on our web site, and to improve the services that we provide.</p>
    <Divider/>
    <Title level={2} id="accessing-your-personal-information">Accessing your personal information</Title>
    <p>Techseeding Pty Ltd will, upon your request, and subject to applicable privacy laws, provide you with access to your personal information held by us. However, we ask that you identify, as clearly as possible, the type/s of information requested.</p>
    <Divider/>
    <Title level={2} id="contact-the-zwf-allied-pty-ltd-privacy-officer">Contact the Techseeding Pty Ltd Privacy Officer</Title>
    <p>Please email your query and contact details (your name, contact phone number and email address) to the Techseeding Pty Ltd Officer at <a href="mailto:office.zwf.allied@gmail.com">office.zwf.allied@gmail.com</a>. We will respond to your query or complaint within 14 working days from the date first lodged. If your complaint is not resolved to your satisfaction you can contact the Office of the Privacy Commissioner on <a href="tel:1300 363 992">1300 363 992</a>.</p>
    <p>This policy represents our policy at Aug 2020. We may change this privacy policy from time to time.</p>

  </ContainerStyled>

);

ReleaseNotesPage.propTypes = {};

ReleaseNotesPage.defaultProps = {};

export default ReleaseNotesPage;
