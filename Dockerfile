FROM node:17.0.1-alpine3.14 as base

ARG LIBRESPOT_JAVA_RELEASE=https://github.com/librespot-org/librespot-java/releases/download/v1.6.2/librespot-api-1.6.1.jar

# Install librespot-java
ADD ${LIBRESPOT_JAVA_RELEASE} /tmp/librespot-api.jar
RUN apk -U --no-cache add openjdk8-jre
# Convert jar into an easy executable
RUN echo "#!/usr/bin/java -jar" > /bin/librespot-api \
    && cat /tmp/librespot-api.jar >> /bin/librespot-api \
    && chmod +x /bin/librespot-api \
    && rm /tmp/librespot-api.jar

# Build Spoofy
# FROM node:17.0.1-alpine3.14 as spoofy-build
RUN apk -U --no-cache add \
    libtool \
    libconfig-dev \
    opusfile \
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
ARG LIBRESPOT_JAVA_RELEASE=https://github.com/librespot-org/librespot-java/releases/download/v1.6.2/librespot-api-1.6.1.jar

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

WORKDIR /
ENTRYPOINT ["/init"]