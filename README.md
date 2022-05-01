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

## Running the tests
Each test is locked behind an environment variable. If you were to run `node ./test.js`, it wouldn't make any calls.
What you need is a `config.js`:
1. copy it
```sh
cp ./config.example.js config.js
```
2. edit the token to be your digital ocean API key
3. Choose from one or more of the available tests:
```sh
node ./test.js A AAAA CAA CNAME NS MX
```
As you might have guessed, each environment variable coressponds to a specific test. If you copied and pasted
the script above, it would run every test. Of course, you can pick and choose which tests you'd like to run.

OR

## Run every test
```sh
node ./test.js all
```


