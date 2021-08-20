#!/bin/bash

dbus-launch &>/dev/null
bash /run/scripts/pulse.sh &>/dev/null
bash /run/scripts/spotifyd.sh &>/dev/null

cron &>/dev/null

(crontab -l ; echo "*/1 * * * * /run/scripts/pulse.sh") | crontab - –
(crontab -l ; echo "*/1 * * * * /run/scripts/spotifyd.sh") | crontab - –

exec "$@"