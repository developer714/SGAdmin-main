const HTTP_ONLY_BLOCK_TEMPLATE = `
server {
    listen 80;

    server_name %SUB_DOMAINS%;

    include %SITE_CONF_PATH%/%DIR_NAME_CONFS%%FILE_NAME_LOCATION_CONF%;
}
`;

const HTTPS_BLOCK_TEMPLATE = `
server {
    %LISTEN_80%
    listen 443 ssl http2;
    root /usr/share/nginx/html/;

    server_name %SUB_DOMAINS%;

    include %SITE_CONF_PATH%/%DIR_NAME_CONFS%%FILE_NAME_SSL_CONF%;
    include %SITE_CONF_PATH%/%DIR_NAME_CONFS%%FILE_NAME_LOCATION_CONF%;
}
`;
module.exports = {
  HTTP_ONLY_BLOCK_TEMPLATE,
  HTTPS_BLOCK_TEMPLATE,
};
