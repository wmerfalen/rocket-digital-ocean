# Rocket
This project is part of the initiative set by `therootcompany` and their Rocket API.
https://github.com/therootcompany/rocket/issues/2

## Digital Ocean API
[DNS API Docs](https://docs.digitalocean.com/reference/api/api-reference/#operation/create_domain_record)

## List of supported record types
- [x] A
- [x] AAAA
- [ ] ANAME (not available for digital ocean)
- [x] CAA
- [x] CNAME
- [x] MX
- [x] TXT
- [x] SRV
- [x] NS (only available for apex and delegated domains)
- [ ] DOA (only available for apex and delegated domains)

### READ Functions
- [x]  List all records
	- listAll(data)
		- `data.zone`: *REQUIRED*
- [x]  Follow pagination
	- listByPaginatedLink(link)
		- link is the paginated link found in body.links.pages.next
- [x] List by record type,name, or both
	- listByType(data)
		- `data.zone`: *REQUIRED*
		- `data.type`: *REQUIRED*
	- listByName(data)
		- `data.zone`: *REQUIRED*
		- `data.name`: *REQUIRED* if not set, `data.zone` is used
	- listByNameAndType(data)
		- `data.zone`: *REQUIRED*
		- `data.name`: *REQUIRED* if not set, `data.zone` is used
		- `data.type`: *REQUIRED*
- [x] list by record 'id' (assigned by digital ocean server side code to identify successfully saved records)
	- getById(data)
		- `data.zone`: *REQUIRED*
		- `data.id`: *REQUIRED*

### UPDATE Functions
- [ ] Update by record ID

### DELETE Functions
- [ ] Delete by record ID

## CREATE Functions
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

- `helpers.createTXTRecord(data);`
	- `data.zone`: *REQUIRED*
	- `data.name`: the domain or subdomain *REQUIRED*
	- `data.value`: a somewhat free-form string *REQUIRED*
	- `data.ttl`: the ttl. must be a valid integer *REQUIRED*

- `helpers.createSRVRecord(data);`
	- `data.zone`: *REQUIRED*
	- `data.host_name`: the service or domain or subdomain *REQUIRED*
	- `data.direct_to`: a somewhat free-form string *REQUIRED*
	- `data.port`: the port. must be a valid integer *REQUIRED*
	- `data.priority`: the priority. must be a valid integer *REQUIRED*
	- `data.weight`: the weight. must be a valid integer *REQUIRED*
	- `data.ttl`: the ttl. must be a valid integer *REQUIRED*

## Temporarily disabled SOA record creation from the tests
- you can still call this function, it's just that the test is commented out inside `test.js`
-  couldn't quite get this to work. YMMV
- `helpers.createSOARecord(data);`
	- `data.zone`: *REQUIRED*
	- `data.mname`: name server *REQUIRED*
	- `data.rname`: 'admin@example.com', *REQUIRED*
	- `data.serial`: serial  *REQUIRED*
	- `data.refresh`: refresh *REQUIRED*
	- `data.retry`: retry  *REQUIRED*
	- `data.expire`: expire *REQUIRED*
	- `data.ttl`: ttl  *REQUIRED*

## Records that can't be created easily using the DO API (or at all)
- `ANAME` (not available)

## Caveats
- `NS`  (only for apex and delegated domains)
- `DOA`  (only for apex and delegated domains) *NOT IMPLEMENTED*

## Running the tests
`test.js` accepts a variety of options to specify which tests you'd like to run.
But first, you must make sure your config.js file is sane:

1. copy it
```sh
cp ./config.example.js config.js
```
2. edit the token to be your digital ocean API key
3. Choose from one or more of the available tests:
```sh
node ./test.js A AAAA CAA CNAME NS MX SRV TXT list
```
Each argument to `test.js` tells the script which test to run. If you'd like to run all tests, simply run:
```sh
node ./test.js all
```

# version
- `1.0.1`:
	- Creating and listing records
	- Selecting records by type and name
	- All reasonably supported types implemented as per the request by the original therootcompany issue.
	- Basic tests as examples for how to use the library

# This code is based on
The Root Company's ACME DNS [implementation](https://git.coolaj86.com/coolaj86/acme-dns-01-digitalocean.js/src/branch/master/lib/index.js)

# Authors
- William Merfalen
	- GitHub Profile: [/wmerfalen](https://github.com/wmerfalen)
	- Email: <wmerfalen@gmail.com>
	- Twitter: [@wmerfalen](https://twitter.com/wmerfalen)
- AJ ONeal
	- GitHub Profile: [/coolaj86](https://github.com/coolaj86)
	- Email: <coolaj86@gmail.com> (https://coolaj86.com/)
	- Website: (https://coolaj86.com/)
	- Twitter: [@coolaj86](https://twitter.com/coolaj86)
- Aneem Patrabansha
	- Email: <aneempp@gmail.com>
	- Website: (https://aneem.com.np)

# License
The code that this repo is based on used the following license: [LICENSE](https://git.coolaj86.com/coolaj86/acme-dns-01-digitalocean.js/src/commit/9f86ee8d32dc45d998c10e46178eeb3e3a870fe8/LICENSE)
