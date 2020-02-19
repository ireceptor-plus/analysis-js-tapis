# Base Image
FROM ubuntu:18.04

MAINTAINER iReceptor Plus <info@ireceptor-plus.com>

# Install OS Dependencies
RUN DEBIAN_FRONTEND='noninteractive' apt-get update
RUN DEBIAN_FRONTEND='noninteractive' apt-get install -y \
    make \
    gcc g++ \
    redis-server \
    redis-tools \
    sendmail-bin \
    supervisor \
    wget \
    xz-utils

# node
RUN wget https://nodejs.org/dist/v8.10.0/node-v8.10.0-linux-x64.tar.xz
RUN tar xf node-v8.10.0-linux-x64.tar.xz
RUN cp -rf /node-v8.10.0-linux-x64/bin/* /usr/bin
RUN cp -rf /node-v8.10.0-linux-x64/lib/* /usr/lib
RUN cp -rf /node-v8.10.0-linux-x64/include/* /usr/include
RUN cp -rf /node-v8.10.0-linux-x64/share/* /usr/share

# DISABLE: postfix until we need email capabilities
# Setup postfix
# The postfix install won't respect noninteractivity unless this config is set beforehand.
#RUN mkdir /etc/postfix
#RUN touch /etc/mailname
#COPY docker/postfix/main.cf /etc/postfix/main.cf

COPY docker/scripts/start-service.sh /root/start-service.sh

# Debian vociferously complains if you try to install postfix and sendmail at the same time.
#RUN DEBIAN_FRONTEND='noninteractive' apt-get install -y -q \
#    postfix

##################
##################

RUN mkdir /analysis-js-tapis

# Setup redis
COPY docker/redis/redis.conf /etc/redis/redis.conf

# Setup supervisor
COPY docker/supervisor/supervisor.conf /etc/supervisor/conf.d/

# Install npm dependencies (optimized for cache)
COPY package.json /analysis-js-tapis/
RUN cd /analysis-js-tapis && npm install

# Copy project source
COPY . /analysis-js-tapis

CMD ["/root/start-service.sh"]
