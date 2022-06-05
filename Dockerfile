FROM node:alpine as base

# Build Spoofy
RUN apk -U --no-cache add \
    curl

COPY ./src /app/
WORKDIR /app

# Install node-pune
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

ENV NODE_ENV=production
RUN ["yarn", "install"]
RUN ["node-prune"]

# Remove src dir, no longer needed after using tsup to build
# RUN rm -rf src

# Final image
FROM alpine AS final

ENV NODE_ENV=production
ARG LIBRESPOT_JAVA_RELEASE=https://github.com/librespot-org/librespot-java/releases/download/v1.6.2/librespot-api-1.6.2.jar

# Copy Spoofy
COPY --from=base /app/ /app

# Install librespot-java
ADD ${LIBRESPOT_JAVA_RELEASE} /tmp/librespot-api.jar
RUN apk -U --no-cache add \
    nodejs \
    npm \
    opusfile \
    openjdk8-jre

# Convert jar into executable
RUN echo "#!/usr/bin/java -jar" > /bin/librespot-api \
    && cat /tmp/librespot-api.jar >> /bin/librespot-api \
    && chmod +x /bin/librespot-api \
    && rm /tmp/librespot-api.jar

WORKDIR /app
ENTRYPOINT ["npm", "start"]