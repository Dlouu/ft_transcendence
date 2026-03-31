# Service `logstash`

## Role
`logstash` collecte les logs applicatifs des services et les envoie vers Elasticsearch.

## Stack
- image Docker officielle `docker.elastic.co/logstash/logstash:8.12.0`

## Pipeline configure
Fichier: `srcs/logstash.conf`

- `input`:
  - lit les fichiers `/logs/*.log`
  - codec JSON
- `filter`:
  - pas de transformation complexe active par defaut
- `output`:
  - envoi vers `http://elasticsearch:9200`

## Volumes
- `service_logs:/logs` (logs produits par services)
- `./logstash.conf:/usr/share/logstash/pipeline/logstash.conf`

## Position dans la chaine observabilite
Services -> fichiers log JSON -> Logstash -> Elasticsearch -> Kibana

## Point d'attention
Si Logstash tombe, les logs restent produits localement (volume), mais l'indexation centralisee vers Elasticsearch est interrompue.
