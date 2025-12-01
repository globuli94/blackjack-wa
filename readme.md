## Docker

### Build image

sbt docker:publishLocalThis builds a local Docker image tagged as `blackjack-wa:latest`.

### Run (basic)

docker run --rm -p 9000:9000 blackjack-wa:latest### Run with production config

docker run --rm -p 9000:9000 \
  -v $(pwd)/conf:/opt/docker/conf \
  blackjack-wa:latest \
  -Dconfig.file=/opt/docker/conf/application.prod.conf### Run with volumes (files + logs)

docker run --rm -p 9000:9000 \
  -v $(pwd)/conf:/opt/docker/conf \
  -v $(pwd)/files:/opt/docker/blackjack-wa_files \
  -v $(pwd)/logs:/opt/docker/logs \
  blackjack-wa:latest \
  -Dconfig.file=/opt/docker/conf/application.prod.conf