'use strict';

var defaults = {
	baseUrl: 'https://api.digitalocean.com/v2/domains'
};

module.exports.create = function(config) {
	// config = { baseUrl, token }
	var baseUrl = (config.baseUrl || defaults.baseUrl).replace(/\/$/, '');
	var authtoken = config.token;
	var request;

	function api(method, path, form) {
		var req = {
			method: method,
			url: baseUrl + path,
			headers: {
				Authorization: 'Bearer ' + authtoken,
				'Content-Type': 'application/json'
			},
			json: true,
			form: form
		};
		return request(req).then(function(resp) {
			if (2 !== Math.floor(resp.statusCode / 100)) {
				console.error(resp.statusCode, req.url);
				console.error();
				console.error('Request:');
				console.error(req);
				console.error();
				console.error('Response:');
				console.error(resp.body);
				console.error();
				throw new Error('Error response. Check token, baseUrl, domains, etc.');
			}
			return resp;
		});
	}

	var helpers = {
		getZonenames: function(/*opts*/) {
			// { dnsHosts: [ xxxx.foo.example.com ] }
			return api('GET', '/').then(function(resp) {
				return resp.body.domains.map(function(x) {
					return x.name;
				});
			});
		},
		getTXTRecord: function(data) {
			// data:{dnsPrefix:"_88-acme-challenge-0e.foo",zone:"example.com",txt:"_cdZWaclIbkP1qYpMkZIURTK--ydQIK6d9axFmftWz0"}
			var dnsPrefix = data.dnsPrefix;
			var txt = data.txt;

			// Digital ocean provides the api to fetch records by ID. Since we do not have id, we fetch all the records,
			// filter the required TXT record

			return api('GET', '/' + data.zone + '/records').then(function(resp) {
				resp = resp.body;
				var entries =
					resp &&
					resp.domain_records &&
					resp.domain_records.filter(function(x) {
						return x.type === 'TXT' && x.name === dnsPrefix && x.data === txt;
					});
				return entries && entries[0];
			});
		},
		_createATypeRecordRecord: function(data,type) {
			var ch = data.challenge;
			var txt = ch.dnsAuthorization;
			if(!data.name){
				throw new Error('name field is required');
			}
			if(!data.ip){
				throw new Error('ip field is require');
			}

			// console.info('Adding A record', data);
			return api('POST', '/' + ch.dnsZone + '/records', {
/** Example payload
{
"type": "A", // or: "type": "AAAA"
"name": "www",
"data": "162.10.66.0",
"priority": null,
"port": null,
"ttl": 1800,
"weight": null,
"flags": null,
"tag": null
}
*/
				type: type,
				name: data.name, //This might be okay too: ch.dnsPrefix,
				data: data.ip,
				priority: ('undefined' === typeof data.priority ? null : data.priority),
				port: ('undefined' === typeof data.port ? null : data.port),
				ttl: ('undefined' === typeof data.ttl ? 300 : data.ttl),
				weight: ('undefined' === typeof data.weight ? null : data.weight),
				flags: ('undefined' === typeof data.flags ? null : data.flags),
				tag: ('undefined' === typeof data.tag ? null : data.tag),
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.data === txt) {
					return true;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},
		createARecord: function(data){
			return helpers._createATypeRecordRecord(data,'A');
		},
		createAAAARecord: function(data){
			return helpers._createATypeRecordRecord(data,'AAAA');
		},
		createCAARecord: function(data){
			var ch = data.challenge;
			var txt = ch.dnsAuthorization;
			if(!data.name){
				throw new Error('name field is required');
			}
			if(!data.domain){
				throw new Error('domain field is required');
			}
			if('undefined' === typeof data.flags) {
				data.flags = null;
			}
			if(data.flags !== null && (data.flags < 0 || data.flags > 255)){
				throw new Error('flags field must be between 0 and 255');
			}

			if('undefined' === typeof data.tag) {
				data.tag = null;
			}
			if(data.tag !== null && (!['issue','issuewild','iodef'].includes(data.tag))){
				throw new Error('tag field must be either null or one of: "issue","issuewild", or "iodef"');
			}

			// console.info('Adding A record', data);
			return api('POST', '/' + ch.dnsZone + '/records', {
				type: 'CAA',
				name: data.name, //This might be okay too: ch.dnsPrefix,
				data: data.domain,
				flags: data.flags,
				tag: data.tag,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.data === txt) {
					return true;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},
		createCNAMERecord: function(data){
			var ch = data.challenge;
			var txt = ch.dnsAuthorization;
			if(!data.source_domain){
				throw new Error('source_domain field is required');
			}
			if(!data.target_domain){
				throw new Error('target_domain field is required');
			}

			// console.info('Adding A record', data);
			return api('POST', '/' + ch.dnsZone + '/records', {
/** Example payload
{
"type": "CNAME",
"name": "www.example.com",
"data": "example.com"
}
*/
				type: 'CNAME',
				name: data.source_domain,
				data: data.target_domain,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.data === txt) {
					return true;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},

		createMXRecord: function(data){
			var ch = data.challenge;
			var txt = ch.dnsAuthorization;
			if(!data.name){
				throw new Error('name field is required');
			}
			if(!data.mail_exchanger){
				throw new Error('mail_exchanger field is required');
			}
			if(!data.priority){
				throw new Error('priority field is required');
			}

			if(isNaN(parseInt(data.priority,10))){
				throw new Error('priority field is not a valid integer');
			}

			// console.info('Adding A record', data);
			return api('POST', '/' + ch.dnsZone + '/records', {
/** Example payload
{
"type": "MX",
"name": "example.com",
"data": "mail.example.com",
"priority": 10
}
*/
				type: 'MX',
				name: data.name,
				data: data.mail_exchanger,
				priority: data.priority,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.data === txt) {
					return true;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},

		createNSRecord: function(data){
			/** TODO: FIXME: this function is not complete */
			var ch = data.challenge;
			var txt = ch.dnsAuthorization;
			if(!data.name){
				throw new Error('name field is required');
			}
			if(!data.name_server){
				throw new Error('name_server field is required');
			}
			if(!data.ttl){
				throw new Error('ttl field is required');
			}

			if(isNaN(parseInt(data.ttl,10))){
				throw new Error('ttl field is not a valid integer');
			}

			// console.info('Adding A record', data);
			return api('POST', '/' + ch.dnsZone + '/records', {
/** Example payload
{
"type": "NS",
"name": "example.com",
"data": "ns1.some-dns-service.com",
"ttl": 21600
}
*/
				type: 'NS',
				name: data.name,
				data: data.name_server,
				ttl: data.ttl,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.data === txt) {
					return true;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},
		remove: function(data) {

		}
	};

	return {
		init: function(opts) {
			request = opts.request;
			return null;
		},
		zones: function(data) {
			//console.info('Get zones');
			return helpers.getZonenames(data);
		},
		set: function(data) {
			var ch = data.challenge;
			var txt = ch.dnsAuthorization;

			// console.info('Adding TXT', data);
			return api('POST', '/' + ch.dnsZone + '/records', {
				type: 'TXT',
				name: ch.dnsPrefix,
				data: txt,
				ttl: 300
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.data === txt) {
					return true;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},
		remove: function(data) {
			var ch = data.challenge;

			// Digital ocean provides the api to remove records by ID. So we first get the recordId and use it to remove the domain record
			// console.info('Removing TXT', data);
			var payload = {
				dnsPrefix: ch.dnsPrefix,
				zone: ch.dnsZone,
				txt: ch.dnsAuthorization
			};

			return helpers.getTXTRecord(payload).then(function(txtRecord) {
				if (txtRecord) {
					var url = baseUrl + '/' + ch.dnsZone + '/records/' + txtRecord.id;

					return api(
						'DELETE',
						'/' + ch.dnsZone + '/records/' + txtRecord.id
					).then(function(resp) {
						resp = resp.body;
						return true;
					});
				} else {
					throw new Error('Txt Record not found for removal');
				}
			});
		},
		get: function(data) {
			var ch = data.challenge;

			// console.info('Fetching TXT', data);
			var payload = {
				dnsPrefix: ch.dnsPrefix,
				zone: ch.dnsZone,
				txt: ch.dnsAuthorization
			};
			return helpers.getTXTRecord(payload).then(function(txtRecord) {
				if (txtRecord) {
					return { dnsAuthorization: txtRecord.data };
				} else {
					return null;
				}
			});
		}
	};
};
