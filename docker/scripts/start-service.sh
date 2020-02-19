#!/bin/bash

# DISABLE: postfix until we need email capability
# Using environment variables to set postfix configuration
#[ -z "${POSTFIX_RELAYHOST}" ] && echo "\$POSTFIX_RELAYHOST is not set" || sed -i "s:POSTFIX_RELAYHOST:${POSTFIX_RELAYHOST}:" /etc/postfix/main.cf
#[ -z "${POSTFIX_HOSTNAME}" ] && echo "\$POSTFIX_HOSTNAME is not set" || sed -i "s:POSTFIX_HOSTNAME:${POSTFIX_HOSTNAME}:" /etc/postfix/main.cf
#[ -z "${POSTFIX_HOSTNAME}" ] && echo "\$POSTFIX_HOSTNAME is not set" || echo ${POSTFIX_HOSTNAME} >> /etc/mailname
#service postfix start

# supervisor will start up and watch the services
/usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
