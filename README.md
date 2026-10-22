# Tandava Cult

Static band website served by nginx in Docker.

## Local development

Run `make run` to build and serve the site at http://localhost:8080, or `make dev`
to serve local files with changes visible on refresh. Stop it with `make stop`.

## Production

Coolify deploys `kriogenx0/tandava-site`, branch `main`, using `/Dockerfile` with
build context `/`. Set Ports Exposes to `80` and leave Ports Mappings empty.
The image includes an HTTP health check.

Configure these application domains:

- https://tandavacult.com
- https://www.tandavacult.com

Coolify's shared Traefik proxy owns public HTTP/HTTPS and issues and renews the
Let's Encrypt certificates. The shared proxy configuration redirects `www` to
the canonical bare domain and sends this application's ACME requests to
Traefik's internal handler. There is no host nginx vhost for Tandava Cult.

Other sites on the server still use nginx through separate fallback routes.
The shared proxy's Docker-provider constraint includes Tandava's application UUID
`xo21thln4klu8n0zrnpctf5e`; its HTTP, ACME, and TLS fallback rules exclude both
Tandava hostnames. Preserve these rules when editing the shared proxy.

Coolify reads the repository through its GitHub App with Auto Deploy off. A
push to `main` runs CI (`.github/workflows/ci.yml`), which builds the image and
checks the home page answers; only when that passes does its `deploy` job tell
Coolify to deploy. That job needs two repository secrets: `COOLIFY_WEBHOOK`
(`https://coolify.homecloud.one/api/v1/deploy?uuid=xo21thln4klu8n0zrnpctf5e&force=false`)
and `COOLIFY_TOKEN` (a Coolify API token with deploy permission). Without them
nothing deploys.

The former SSH/rsync/host Certbot deployment scripts are removed. The old host configuration is backed up at
`/root/tandavacult-coolify-20261014/` for rollback.
