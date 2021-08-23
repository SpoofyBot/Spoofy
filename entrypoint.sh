#!/bin/bash

rm -rf /var/run
mkdir -p /var/run/dbus
mkdir -p /var/run/pulse

dbus-uuidgen --ensure > /dev/null 2>&1
dbus-daemon --system > /dev/null 2>&1

bash /run/scripts/pulse.sh > /dev/null 2>&1
bash /run/scripts/spotifyd.sh > /dev/null 2>&1

crond > /dev/null 2>&1
crontab -l | { cat; echo "*/1 * * * * /run/scripts/pulse.sh"; } | crontab -
crontab -l | { cat; echo "*/1 * * * * /run/scripts/spotifyd.sh"; } | crontab -

exec "$@"