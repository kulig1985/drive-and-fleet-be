FROM ubuntu:latest
LABEL authors="kuligabor"

ENTRYPOINT ["top", "-b"]
