#!/bin/bash

process=/usr/bin/spotifyd
makerun="/usr/bin/spotifyd --config-path /etc/spotifyd.conf --no-daemon"

if ps ax | grep -v grep | grep $process > /dev/null
then
    exit
else
    $makerun > /dev/null &
fi

exit