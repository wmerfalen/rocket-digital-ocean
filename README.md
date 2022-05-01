# Rocket
## Digital Ocean API
- `helpers.createARecord(data);`
	- `data.zone`: the domain name you'd like to apply this A record to. i.e.: 'wearedoomedarentwe.com', *REQUIRED*
	- `data.sub_domain`: the sub domain. i.e.: 'www', *REQUIRED*
	- `data.ip`: the ip address to assign.  *REQUIRED*

- `helpers.createAAARecord(data);`
	- same requirements as `createARecord`

- `helpers.createCAARecord(data);`
	- `data.zone`: *REQUIRED*
	- `data.name`: the domain. this can be '@' or a FQDN *REQUIRED*
	- `data.authority`: the FQDN of the Certificate Authority. i.e: 'letsencrypt.org', *REQUIRED*
	- `data.flags`: must be between 0-255 if set. if not set, will default to null
	- `data.tag`: if set, must be one of 'issue','issuewild','iodef'. if not set, defaults to null

- `helpers.createCNAMERecord(data);`
	- `data.zone`: *REQUIRED*
	- `data.source_domain`: the source domain *REQUIRED*
	- `data.target_domain`: the domain which will be an alias of `source_domain` *REQUIRED*

- `helpers.createMXRecord(data);`
	- `data.zone`: *REQUIRED*
	- `data.name`: the host name. can be '@' or a FQDN  *REQUIRED*
	- `data.mail_exchanger`: the mail server as FQDN *REQUIRED*
	- `data.priority`: priority. must be a valid integer *REQUIRED*
	- `data.ttl`: the ttl. if set, must be a valid integer *REQUIRED*

- `helpers.createNSRecord(data);`
	- `data.zone`: *REQUIRED*
	- `data.name`: the host name as FQDN or a subdomain. if subdomain, it's just 'www' instead of 'www.domain.com'  *REQUIRED*
	- `data.name_server`: the name server as FQDN. i.e.: ns1.coolaj86.com  *REQUIRED*
	- `data.ttl`: the ttl. must be a valid integer *REQUIRED*

