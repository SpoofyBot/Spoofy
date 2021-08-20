#!/bin/bash

process=pulseaudio
makerun="pulseaudio --daemon --exit-idle-time=-1"

if ps ax | grep -v grep | grep $process > /dev/null
then
    exit
else
    $makerun
fi

exit