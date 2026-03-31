# Service `elasticsearch`

## Role
`elasticsearch` stocke et indexe les logs centralises du projet.

## Stack
- image Docker officielle `docker.elastic.co/elasticsearch/elasticsearch:8.12.0`

## Exposition reseau
- port externe: `5065:9200`
- reseau compose: `elk_network`

## Alimentation des donnees
- recoit les logs depuis `logstash`
- les documents sont ensuite consultables via `kibana`

## Configuration
Variables d'environnement chargees via `srcs/env/elasticsearch.env`.

## Usage dans le projet
- recherche et diagnostic des incidents applicatifs
- visualisation centralisee des journaux multi-services

## Point d'attention
Sans ce service, les applications continuent de fonctionner, mais la centralisation/recherche de logs est degradee.
