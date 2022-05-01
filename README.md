# Rocket
## Digital Ocean API
- `helpers.createARecord(data);`
	- data.name: the host name *REQUIRED*
	- data.ip: the IPv4 Address *REQUIRED*
	- data.priority: optional
	- data.port: optional
	- data.ttl: optional. if null, defaults to `300`
	- data.weight: optional
	- data.flags: optional

- `helpers.createAAARecord(data);`
	- data.name: the host name *REQUIRED*
	- data.ip: the IPv6 Address *REQUIRED*
	- data.priority: optional
	- data.port: optional
	- data.ttl: optional. if null, defaults to `300`
	- data.weight: optional
	- data.flags: optional

- `helpers.createCAARecord(data);`
	- data.name: the host name *REQUIRED*
	- data.domain: the domain to associate with *REQUIRED*
	- data.tag: optional. if set must be one of: `issue,issuewild,iodef`
	- data.flags: optional. if set, must be between 0-255

- `helpers.createCNAMERecord(data);`
	- `data.source_domain`: the source domain *REQUIRED*
	- `data.target_domain`: the domain which will be an alias of `source_domain` *REQUIRED*

- `helpers.createMXRecord(data);`
	- `data.name`: the host name *REQUIRED*
	- `data.mail_exchanger`: the mail server *REQUIRED*
	- `data.priority`: priority. must be a valid integer *REQUIRED*

