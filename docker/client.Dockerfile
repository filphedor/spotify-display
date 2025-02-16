FROM ubuntu:20.04 AS npm

ARG SPOTIFY_CLIENT_ID
ARG REDIRECT_URI

USER root

RUN apt-get update && apt-get -y install \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -

RUN apt-get install nodejs -y \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 449 dockeruser && \
    useradd -r -m -u 449 -g dockeruser dockeruser

USER dockeruser

ENV SPOTIFY_CLIENT_ID=${SPOTIFY_CLIENT_ID}
ENV REDIRECT_URI=${REDIRECT_URI}

RUN mkdir /home/dockeruser/project

WORKDIR /home/dockeruser/project

COPY package.json .

RUN npm install

COPY ./config ./config

COPY ./public ./public

COPY ./src ./src

RUN mkdir dist

RUN npm run build


FROM httpd:2.4.62 AS apache

ARG CONF_FILE
ARG SSL_KEY
ARG SSL_CERT
ARG SERVER_NAME

ENV SSL_KEY=${SSL_KEY}
ENV SSL_CERT=${SSL_CERT}
ENV SERVER_NAME=${SERVER_NAME}

RUN mkdir /usr/local/apache2/ssl

RUN echo "$SSL_CERT" > /usr/local/apache2/ssl/cert.crt
RUN echo "$SSL_KEY" > /usr/local/apache2/ssl/key.key

COPY ./apache/httpd.conf /usr/local/apache2/conf/httpd.conf

COPY --from=npm /home/dockeruser/project/dist /usr/local/apache2/htdocs/

EXPOSE 80
EXPOSE 443
