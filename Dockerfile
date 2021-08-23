FROM node:16-alpine3.14 as base

FROM alpine:3.14 AS spotifyd-build
RUN apk -U --no-cache add \
	git \
	build-base \
	autoconf \
	automake \
	libtool \
	alsa-lib-dev \
	libdaemon-dev \
	openssl-dev \
	pulseaudio-dev \
	libconfig-dev \
	libstdc++ \
	gcc \
	rust \
	cargo

WORKDIR /spotifyd
RUN git clone https://github.com/Spotifyd/spotifyd . \
	&& cargo build --release --features "pulseaudio_backend"

FROM node:16-alpine3.14 as spoofy-build
RUN apk -U --no-cache add \
	libtool \
	pulseaudio \
	pulseaudio-utils \
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

ENV NODE_ENV=production
COPY ./src /app/

# Install node-pune
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

WORKDIR /app
RUN ["yarn", "install", "--flat"]
RUN [ "node-prune" ]

FROM base AS final

# Install libs
RUN apk -U --no-cache add \
	libtool \
	pulseaudio \
	dbus-x11

ENV NODE_ENV=production

COPY --from=spotifyd-build /spotifyd/target/release/spotifyd /usr/bin/spotifyd
COPY --from=spoofy-build /app/ /app

COPY ./scripts/ /run/scripts
COPY conf/pulseaudio.pa /etc/pulse/default.pa
COPY conf/pulseaudio.conf /etc/pulse/daemon.conf
COPY conf/spotifyd.conf /etc/spotifyd.conf

RUN chmod +x /run/entrypoint.sh

WORKDIR /app
ENTRYPOINT ["bash", "/run/scripts/entrypoint.sh"]
CMD ["yarn", "start"]