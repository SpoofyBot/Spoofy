#!/bin/bash

rm -f /var/run/dbus.pid
rm -rf /var/run/dbus
mkdir -p /var/run/dbus

dbus-uuidgen --ensure
dbus-daemon --system