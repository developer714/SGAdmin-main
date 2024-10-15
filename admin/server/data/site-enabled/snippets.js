const SSL_SETTING_TEMPLATE = `
    ssl_certificate %CERT_PATH%/fullchain.pem;
    ssl_certificate_key %CERT_PATH%/privkey.pem;
`;

const LOCATION_SETTING_TEMPLATE = `
    location / {
        proxy_pass %BACKEND_SCHEME%://%SITE_ADDRESS%/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;

        %PROXY_SSL_SETTING%
    }

    location = /health {
        access_log off;
        add_header 'Content-Type' 'application/json';
        return 200 '{"status":"UP"}';
    }
`;

module.exports = {
  SSL_SETTING_TEMPLATE,
  LOCATION_SETTING_TEMPLATE,
};
