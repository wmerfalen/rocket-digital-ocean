'use strict';

var defaults = {
	baseUrl: 'https://api.digitalocean.com/v2/domains'
};

module.exports.create = function(config) {
	// config = { baseUrl, token }
	var baseUrl = (config.baseUrl || defaults.baseUrl).replace(/\/$/, '');
	var authtoken = config.token;
	var request;
	var recordTypes = ['A', 'AAAA', 'CAA', 'CNAME', 'MX', 'NS', 'TXT', 'SRV', 'SOA',];

	function api(method, path, form) {
		var req = {
			method: method,
			url: baseUrl + path,
			headers: {
				Authorization: 'Bearer ' + authtoken,
				'Content-Type': 'application/json'
			},
			json: (null === form || 'undefined' === typeof form) ? false : true,
			form: form,
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
	function rawApi(method,url,form){
		var req = {
			method: method,
			url: url,
			headers: {
				Authorization: 'Bearer ' + authtoken,
			},
			json: false,
		};
		let is_json = (null === form || 'undefined' === typeof form) ? false : true;
		if(is_json){
			req.headers['Content-Type'] = 'application/json';
			req.form = form;
			req.json = true;
		}
		return request(req).then(function(resp) {
			return resp;
		});
	}

	var helpers = {
		add_dot: function(domain){
			if(['*','@'].includes(domain)){
				return domain; // leave untouched
			}
			if(!domain.match(/\.$/)){
				return domain + '.';
			}
			return domain;
		},
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
		listAll: function(data) {
			if(!data.zone){
				throw new Error('zone field is required');
			}

			return api('GET', '/' + data.zone + '/records', null).then(function(resp) {
				return resp;
			});
		},
		listByPaginatedLink: function(link) {
			return rawApi('GET', link, null).then(function(resp) {
				return resp;
			});
		},
		listByType: function(data) {
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if(!data.type){
				throw new Error('type field is require');
			}
			if(!recordTypes.includes(data.type)){
				throw new Error('unrecognized record type. Record types must be one of: ' + recordTypes.join(','));
			}

			return api('GET', '/' + data.zone + '/records?type=' + data.type, null).then(function(resp) {
				return resp;
			});
		},
		listByName: function(data) {
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if(!data.name){
				data.name = data.zone;
			}
			// FIXME: use the URL formatting facilities that are native to node and js
			return api('GET', '/' + data.zone + '/records?name=' + data.name, null).then(function(resp) {
				return resp;
			});
		},
		listByNameAndType: function(data) {
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if(!data.type){
				throw new Error('type field is required');
				
			}
			if(!recordTypes.includes(data.type)){
				throw new Error('unrecognized record type. Record types must be one of: ' + recordTypes.join(','));
			}

			if(!data.name){
				data.name = data.zone;
			}

			// FIXME: use the URL formatting facilities that are native to node and js
			return api('GET', '/' + data.zone + '/records?type=' + data.type + '&name=' + data.name, null).then(function(resp) {
				return resp;
			});
		},
		getById: function(data) {
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if(!data.id){
				throw new Error('id field is required');
				
			}
			// FIXME: use the URL formatting facilities that are native to node and js
			return api('GET', '/' + data.zone + '/records/' + data.id, null).then(function(resp) {
				return resp;
			});
		},
		_createATypeRecordRecord: function(data,type) {
			//var ch = data.challenge;
			//var txt = ch.dnsAuthorization;
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if(!data.ip){
				throw new Error('ip field is require');
			}
			if(!data.sub_domain){
				throw new Error('sub_domain field is require');
			}

			return api('POST', '/' + data.zone + '/records', {
/** Example payload
{
"type": "A", // or: "type": "AAAA"
"name": "www",
"data": "162.10.66.0",
"ttl": 1800
}
*/
				type: type,
				name: helpers.add_dot(data.sub_domain),
				data: data.ip,
				priority: ('undefined' === typeof data.priority ? null : data.priority),
				port: ('undefined' === typeof data.port ? null : data.port),
				ttl: ('undefined' === typeof data.ttl ? 300 : data.ttl),
				weight: ('undefined' === typeof data.weight ? null : data.weight),
				flags: ('undefined' === typeof data.flags ? null : data.flags),
				tag: ('undefined' === typeof data.tag ? null : data.tag),
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.type === type) {
					return resp;
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
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if(!data.name){
				throw new Error('name field is required');
			}
			if(!data.authority){
				throw new Error('authority field is required');
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

			return api('POST', '/' + data.zone + '/records', {
				type: 'CAA',
				name: helpers.add_dot(data.name),
				data: helpers.add_dot(data.authority),
				flags: data.flags,
				tag: data.tag,
				ttl: 2500,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.type === 'CAA') {
					return resp;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},
		createCNAMERecord: function(data){
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if(!data.source_domain){
				throw new Error('source_domain field is required');
			}
			if(!data.target_domain){
				throw new Error('target_domain field is required');
			}

			return api('POST', '/' + data.zone + '/records', {
/** Example payload
{
"type": "CNAME",
"name": "www.example.com",
"data": "example.com"
}
*/
				type: 'CNAME',
				name: helpers.add_dot(data.source_domain),
				data: helpers.add_dot(data.target_domain),
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.type === 'CNAME') {
					return resp;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},

		createMXRecord: function(data){
			//var ch = data.challenge;
			//var txt = ch.dnsAuthorization;
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

			if(!data.ttl || isNaN(parseInt(data.ttl,10))){
				throw new Error('ttl field must be a valid integer');
			}

			return api('POST', '/' + data.zone + '/records', {
/** Example payload
{
"type": "MX",
"name": "example.com",
"data": "mail.example.com",
"priority": 10
}
*/
				type: 'MX',
				name: helpers.add_dot(data.name),
				data: helpers.add_dot(data.mail_exchanger),
				priority: data.priority,
				ttl: data.ttl,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.type === 'MX') {
					return resp;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},

		createNSRecord: function(data){
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

			return api('POST', '/' + data.zone + '/records', {
/** Example payload
{
"type": "NS",
"name": "example.com",
"data": "ns1.some-dns-service.com",
"ttl": 21600
}
*/
				type: 'NS',
				name: ['*','@'].includes(data.name) ? data.name : helpers.add_dot(data.name),
				data: helpers.add_dot(data.name_server),
				ttl: data.ttl,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.type === 'NS') {
					return resp;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},
		createTXTRecord: function(data){
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if(!data.name){
				throw new Error('name field is required');
			}
			if(!data.value){
				throw new Error('value field is required');
			}
			if('undefined' === typeof data.ttl) {
				data.ttl = null;
			}
			if(data.ttl !== null && isNaN(parseInt(data.ttl,10))){
				throw new Error('ttl field must be a valid integer');
			}

			return api('POST', '/' + data.zone + '/records', {
				type: 'TXT',
				name: helpers.add_dot(data.name),
				data: data.value,
				ttl: data.ttl,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.type === 'TXT') {
					return resp;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},
		createSRVRecord: function(data){
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if(!data.host_name){
				throw new Error('host_name field is required');
			}
			if(!data.direct_to){
				throw new Error('direct_to field is required');
			}
			if(!data.priority){
				throw new Error('priority field is required');
			}
			if(!data.port){
				throw new Error('port field is required');
			}
			if(!data.weight){
				throw new Error('weight field is required');
			}
			if(!data.ttl){
				throw new Error('ttl field is required');
			}

			return api('POST', '/' + data.zone + '/records', {
				type: 'SRV',
				name: (data.host_name),
				data: (data.direct_to),
				priority: data.priority,
				weight: data.weight,
				port: data.port,
				flags: data.weight,
				ttl: data.ttl,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.type === 'SRV') {
					return resp;
				}
				throw new Error('record did not set. check subdomain, api key, etc');
			});
		},
		createSOARecord: function(data){
			if(!data.zone){
				throw new Error('zone field is required');
			}
			if('undefined' === typeof data.mname) {
				throw new Error('mname field is required');
			}
			if('undefined' === typeof data.rname) {
				throw new Error('rname field is required');
			}
			if('undefined' === typeof data.serial) {
				throw new Error('serial field is required');
			}
			if('undefined' === typeof data.refresh) {
				throw new Error('refresh field is required');
			}
			if('undefined' === typeof data.retry) {
				throw new Error('retry field is required');
			}
			if('undefined' === typeof data.expire) {
				throw new Error('expire field is required');
			}
			if('undefined' === typeof data.ttl) {
				throw new Error('ttl field is required');
			}
			/** TODO: do same integer validation for refresh, retry, expire, and maybe serial */
			if(data.ttl !== null && isNaN(parseInt(data.ttl,10))){
				throw new Error('ttl field must be a valid integer');
			}

			return api('POST', '/' + data.zone + '/records', {
				type: 'SOA',
				mname: data.mname,
				rname: data.rname.replace(/@/,'.'),
				serial: data.serial,
				refresh: data.refresh,
				retry: data.retry,
				expire: data.expire,
				ttl: data.ttl,
			}).then(function(resp) {
				resp = resp.body;
				if (resp && resp.domain_record && resp.domain_record.type === 'SOA') {
					return resp;
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
			return helpers.getZonenames(data);
		},
		helpers: helpers,
		set: function(data) {
			var ch = data.challenge;
			var txt = ch.dnsAuthorization;

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
