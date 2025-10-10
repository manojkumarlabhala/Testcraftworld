safe-rm-container.sh
=====================

What
----

Small zsh helper to safely stop and remove Docker containers from scripts. It:

- Checks Docker daemon availability before running any commands.
- Checks if the container exists to avoid "No such container" noisy errors.
- Uses `--timeout` for `docker stop` instead of the deprecated `--time` flag.

Usage
-----

Make executable and run:

```bash
chmod +x scripts/safe-rm-container.sh
scripts/safe-rm-container.sh <container-id-or-name> [timeout-seconds]
```

Return codes
------------
0 - nothing to do or success
2 - usage / missing parameter
3 - Docker daemon not available
4 - docker rm failed after attempts
