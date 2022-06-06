FROM node:alpine as base

# Build spoofy
COPY ./src /src
WORKDIR /src

# Install dependencies
RUN ["yarn", "install"]
RUN ["npm", "install", "-g", "pkg"]

# Run pkg
RUN ["yarn", "pkg", "."]

# Build final image
FROM alpine as final

COPY --from=base /src/dist /app

ENV LIBRESPOT_PATH=/bin/librespot-api
ARG LIBRESPOT_JAVA_RELEASE=https://github.com/librespot-org/librespot-java/releases/download/v1.6.2/librespot-api-1.6.2.jar

# Install librespot-java
ADD ${LIBRESPOT_JAVA_RELEASE} /tmp/librespot-api.jar
RUN apk -U --no-cache add \
    opusfile \
    openjdk8-jre

# Convert jar into executable
RUN echo "#!/usr/bin/java -jar" > ${LIBRESPOT_PATH} \
    && cat /tmp/librespot-api.jar >> ${LIBRESPOT_PATH} \
    && chmod +x ${LIBRESPOT_PATH} \
    && rm /tmp/librespot-api.jar

WORKDIR /app/

ENTRYPOINT ["./spoofyjs"]