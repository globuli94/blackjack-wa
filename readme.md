## Docker

### Build image
This builds a local Docker image tagged as `blackjack-wa:latest`.

```bash

sbt docker:publishLocal
```
### Run (basic)
```bash

docker run --rm -p 9000:9000 blackjack-wa:latest
```
### Run with production config
```bash

docker run --rm -p 9000:9000 \
  -v $(pwd)/conf:/opt/docker/conf \
  blackjack-wa:latest \
  -Dconfig.file=/opt/docker/conf/application.prod.conf
```

### Run with volumes (files + logs)
```bash

docker run --rm -p 9000:9000 \
  -v $(pwd)/conf:/opt/docker/conf \
  -v $(pwd)/files:/opt/docker/blackjack-wa_files \
  -v $(pwd)/logs:/opt/docker/logs \
  blackjack-wa:latest \
  -Dconfig.file=/opt/docker/conf/application.prod.conf
```