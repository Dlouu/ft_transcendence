# Service `kibana`

## Role
`kibana` fournit l'interface graphique d'exploration des logs indexes dans Elasticsearch.

## Stack
- image Docker officielle `docker.elastic.co/kibana/kibana:8.12.0`

## Exposition reseau
- `127.0.0.1:5601:5601` (acces local machine)

## Dependances
- depend de `elasticsearch`
- variable `ELASTICSEARCH_HOSTS=http://elasticsearch:9200`

## Usage
- inspection des logs JSON applicatifs
- creation de vues et filtres pour debug backend/reseau

## Point d'attention
Kibana est un outil d'observabilite: son indisponibilite n'interrompt pas le trafic applicatif, mais rend le diagnostic plus difficile.
