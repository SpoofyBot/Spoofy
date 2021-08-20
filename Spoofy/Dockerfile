FROM mcr.microsoft.com/dotnet/aspnet:5.0-alpine AS base

# ffmpeg image with --enable-libpulse
FROM collelog/ffmpeg:4.4-alpine-amd64 AS ffmpeg-image

# Build spotifyd with pulseaudio_backend
FROM alpine:3.14 AS spotifyd-build
RUN apk -U --no-cache add \
	git \
	build-base \
	autoconf \
	automake \
	libtool \
	pulseaudio-dev \
	libpulse \
	alsa-lib-dev \
	libdaemon-dev \
	openssl-dev \
	libconfig-dev \
	libstdc++ \
	gcc \
	rust \
	cargo

RUN cd /root \
	&& git clone https://github.com/Spotifyd/spotifyd .\
	&& cargo build --release --features "pulseaudio_backend"

# Build Spoofy in alpine
FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS spoofy-publish
WORKDIR /app
COPY ./src/ .
WORKDIR /app/Spoofy
RUN dotnet publish "Spoofy.csproj" -c Release -o /app/publish

FROM base AS final

# Install libs for spotifyd, openrc for service management, libsodium/opus-dev for dsharp
RUN apk -U --no-cache add \
	libtool \
	dbus \
	pulseaudio \
	pulseaudio-utils \
	libconfig-dev \
	openrc \
	libsodium \
	opus-dev

ENV LD_LIBRARY_PATH=/usr/local/lib64:/usr/local/lib:/usr/lib:/lib

COPY --from=ffmpeg-image /build /
COPY --from=spotifyd-build /root/target/release/spotifyd /usr/bin/spotifyd
COPY --from=spoofy-publish /app/publish /app

COPY entrypoint.sh /run/entrypoint.sh
RUN chmod +x /run/entrypoint.sh

WORKDIR /app
ENTRYPOINT ["dotnet", "Spoofy.dll"]
