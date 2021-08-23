#!/bin/bash

# Writes to secret files with flags
# Example: ./writeSecrets.sh -t discord-token -u spotify-username -p spotify-password

while getopts t:u:p: flag
do
    case "${flag}" in
        t) token=${OPTARG};;
        u) user=${OPTARG};;
        p) passwd=${OPTARG};;
    esac
done

dir="$(dirname "${BASH_SOURCE[0]}")"

touch ${dir}/secrets/discord-token && echo -n ${token} > ${dir}/secrets/discord-token && echo "Wrote secret ${dir}/secrets/discord-token"
touch ${dir}/secrets/spotify-user && echo -n ${user} > ${dir}/secrets/spotify-user && echo "Wrote secret ${dir}/secrets/spotify-user"
touch ${dir}/secrets/spotify-passwd && echo -n ${passwd} > ${dir}/secrets/spotify-passwd && echo "Wrote secret ${dir}/secrets/spotify-passwd"