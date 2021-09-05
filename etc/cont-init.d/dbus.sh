#!/bin/sh

rm -rf /var/run/dbus
mkdir -p /var/run/dbus

dbus-uuidgen --ensure > /dev/null 2>&1
dbus-daemon --system > /dev/null 2>&1