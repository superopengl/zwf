FROM --platform=linux/amd64 node:18-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.

RUN apt-get update --allow-releaseinfo-change
RUN apt-get install -y wget gnupg
# RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=amd64] https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update --allow-releaseinfo-change
RUN apt-get install -y bzip2 fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 build-essential chrpath libssl-dev libxft-dev --no-install-recommends
RUN rm -rf /var/lib/apt/lists/*

RUN apt-get install libfreetype6 libfreetype6-dev
RUN apt-get install libfontconfig1 libfontconfig1-dev

# Install Chrome.
# RUN apt-get -y install google-chrome-stable
# RUN apt-get -y install chromium-browser
# RUN apt update
# RUN apt-get install https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# RUN dpkg -i google-chrome-stable_current_amd64.deb
# RUN apt -f install

RUN apt-get update -y && \ 
    apt-get install -y wget gnupg2 && \ 
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update -y && \
    apt-get install -y google-chrome-stable

# RUN apt-get update && apt-get install -y wget gnupg2 apt-utils curl unzip RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \ 
# && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
# && apt-get update && apt-get install -y google-chrome-stable

# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
# ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
# RUN chmod +x /usr/local/bin/dumb-init
# ENTRYPOINT ["dumb-init", "--"]

# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-stable'})
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install puppeteer so it's available in the container.
# RUN npm i puppeteer \
#     # Add user so we don't need --no-sandbox.
#     # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
#     && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#     && mkdir -p /home/pptruser/Downloads \
#     && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /node_modules

# # Run everything after as non-privileged user.
# USER pptruser

RUN npm install -g pnpm@7

#RUN apk update && apk add curl

# RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

# install node-prune (https://github.com/tj/node-prune)
# RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | sh -s -- -b /usr/local/bin

EXPOSE 80
# Install dependencies
WORKDIR /usr/portal
COPY ./pnpm-lock.yaml .
RUN pnpm fetch
# WORKDIR /usr/portal/web
# RUN pnpm install

# WORKDIR /usr/portal/app
# RUN pnpm install
#     # && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#     # && mkdir -p /home/pptruser/Downloads \
#     # && chown -R pptruser:pptruser /home/pptruser \
#     # && chown -R pptruser:pptruser /node_modules \
#     # && chown -R pptruser:pptruser /package.json \
#     # && chown -R pptruser:pptruser /package-lock.json

# # Env vars in build time
# ARG NODE_ENV
# ARG REACT_APP_GIT_HASH
# ENV TZ=utc
# ENV GIT_HASH=$REACT_APP_GIT_HASH
# ENV GENERATE_SOURCEMAP=false
# ENV NODE_OPTIONS=--max_old_space_size=4096
# # ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY . .

WORKDIR /usr/portal
RUN pnpm install -r --offline

# Build app
WORKDIR /usr/portal/zwf-app
RUN pnpm build:prod

ENV REACT_APP_ZWF_API_ENDPOINT=/api/v1
ENV REACT_APP_ZWF_API_DOMAIN_NAME=
ENV REACT_APP_ZWF_GOOGLE_SSO_CLIENT_ID=494191602561-v5djkofskkipefvj6mgqpbqs60e8hok9.apps.googleusercontent.com
ENV REACT_APP_ZWF_STRIPE_PUBLISHABLE_KEY=pk_live_51KdBy9GTxuce44Dho25dWDow3a0zMM7cSJeSvyBSh6YM0zv208nGcAwluNEsI3u4wbipNZDUvQatMw5Fs0krvDYF00jRuqfFSE
ENV PUBLIC_URL=https://zeeworkflow.com

# Build web
WORKDIR /usr/portal/zwf-web
RUN pnpm compile:prod

# Copy web to app/www
RUN cp -rf /usr/portal/zwf-web/build /usr/portal/zwf-app/www
RUN rm -rf /usr/portal/zwf-web

# # Start the portal website
WORKDIR /usr/portal/zwf-app

# # USER pptruser

# # CMD node index.js
CMD node index.js

