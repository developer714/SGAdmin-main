import Keycloak from "keycloak-js";
const keycloak = new Keycloak({
    url: "http://localhost:8080",
    realm: "sense-defence",
    clientId: "sense-defence"
});

export default keycloak;