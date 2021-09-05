FROM node:16-alpine3.14 as base

# Build Spoofy
FROM node:16-alpine3.14 as spoofy-build
RUN apk -U --no-cache add \
    libtool \
    pulseaudio \
    pulseaudio-dev \
    alsa-lib-dev \
    libconfig-dev \
    opusfile \
    dbus-x11 \
    npm \
    cmake \
    python3 \
    g++ \
    make \
    curl

COPY ./src /app/
WORKDIR /app

# Install node-pune
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

ENV NODE_ENV=production
RUN ["yarn", "install"]
RUN ["node-prune"]
RUN ["npx", "tsup"]

# Remove src dir, no longer needed after using tsup to build
RUN rm -rf src

# Final image
FROM base AS final

ENV NODE_ENV=production
ARG S6_OVERLAY_RELEASE=https://github.com/just-containers/s6-overlay/releases/latest/download/s6-overlay-amd64.tar.gz
ARG LIBRESPOT_JAVA_RELEASE=https://github.com/librespot-org/librespot-java/releases/download/v1.6.1/librespot-api-1.6.1.jar

# Copy Spoofy
RUN apk -U --no-cache add \
    libtool \
    pulseaudio \
    dbus
COPY --from=spoofy-build /app/ /app

# Install librespot-java
ADD ${LIBRESPOT_JAVA_RELEASE} /tmp/librespot-api.jar
RUN apk -U --no-cache add openjdk8-jre
# Convert jar into an easy executable
RUN echo "#!/usr/bin/java -jar" > /bin/librespot-api \
    && cat /tmp/librespot-api.jar >> /bin/librespot-api \
    && chmod +x /bin/librespot-api \
    && rm /tmp/librespot-api.jar

# Install s6-overlay
ADD ${S6_OVERLAY_RELEASE} /tmp/s6overlay.tar.gz
RUN apk upgrade --update --no-cache \
    && rm -rf /var/cache/apk/* \
    && tar xzf /tmp/s6overlay.tar.gz -C / \
    && rm /tmp/s6overlay.tar.gz

COPY ./etc/ /etc/

WORKDIR /
ENTRYPOINT ["/init"]