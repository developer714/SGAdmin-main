import Keycloak from "keycloak-js";
import {keycloakConfig} from "./config";

const keycloak = new Keycloak({
    url: keycloakConfig.domain,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId
});

export default keycloak;