FROM node:alpine as base

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

# Build spoofy
COPY ./src /app
WORKDIR /app/

# Install dependencies
RUN ["yarn", "install"]

# ENTRYPOINT ["./spoofyjs"]
ENTRYPOINT ["yarn", "start"]