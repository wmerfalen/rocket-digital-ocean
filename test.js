'use strict';
const process = require('process');

let run_a_record = false;
let run_aaaa_record = false;
let run_mx_record = false;
let run_caa_record = false;
let run_ns_record = false;
let run_cname_record = false;
let run_txt_record = false;
let run_soa_record = false;
let run_srv_record = false;
let run_all = false;

process.argv.forEach(function(value){
	switch(value){
		case 'A':
			run_a_record = true;
			break;
		case 'AAAA':
			run_aaaa_record = true;
			break;
		case 'MX':
			run_mx_record = true;
			break;
		case 'CAA':
			run_caa_record = true;
			break;
		case 'NS':
			run_ns_record = true;
			break;
		case 'CNAME':
			run_cname_record = true;
			break;
		case 'TXT':
			run_txt_record = true;
			break;
		case 'SOA':
			run_soa_record = true;
			break;
		case 'SRV':
			run_srv_record = true;
			break;
		case 'all':
			run_all = true;
			break;
		default:
			break;
	}
});

(async function(){
let config = require('./config.js');

const ocean = require('./index.js');

let api = ocean.create(config);
api.init({
	request: async function(req){

		return new Promise((resolve, reject) => {
			console.log({req});
			let buffer = '';
			const https = require('https');
			let stream = https.request(req.url,{
				method: req.method,
				headers: req.headers,
			}, function(res){
				console.log(`STATUS: ${res.statusCode}`);
				console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
				res.setEncoding('utf8');
				res.on('data', (chunk) => {
					resolve({
						statusCode: res.statusCode,
						body: JSON.parse(chunk),
					});
					console.log(`BODY: ${chunk}`);
				});
				res.on('end', () => {
					console.log('No more data in response.');
				});
			});

			stream.on('error', (e) => {
				console.error(`problem with request: ${e.message}`);
				reject(`problem with request: ${e.message}`);
			});

			stream.write(JSON.stringify(req.form));
			stream.end();
		});
	},
});

if(run_all || run_a_record){
	/** Create an 'A' Record */
	let response = await api.helpers.createARecord({
		zone: 'wearedoomedarent.we',
		sub_domain: 'bruh',
		ip: '138.68.51.8',
	}).catch(function(error){
		console.error({error});
	});

	console.log({response});
}

if(run_all || run_aaaa_record){
	/** Create an 'A' Record */
	let response = await api.helpers.createAAAARecord({
		zone: 'wearedoomedarent.we',
		sub_domain: 'bruh',
		ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
	}).catch(function(error){
		console.error({error});
	});

	console.log({response});
}


if(run_all || run_mx_record){
	/** Create a 'MX' record */
	let response = await api.helpers.createMXRecord({
		zone: 'wearedoomedarent.we',
		name: '@',
		mail_exchanger: 'mx.wearedoomedarent.we',
		priority: 1,
		ttl: 14400,
	}).catch(function(error){
		console.error({error});
	});
	console.log({response});
}

if(run_all || run_caa_record){
	/** Create a 'CAA' record */
	let response = await api.helpers.createCAARecord({
		zone: 'wearedoomedarent.we',
		name: '@',
		authority: 'letsencrypt.org',
		flags: 0,
		tag: 'issue',
	}).catch(function(error){
		console.error({error});
	});
	console.log({response});
}

if(run_all || run_ns_record){
	/** Create a 'NS' record */
	let response = await api.helpers.createNSRecord({
		zone: 'wearedoomedarent.we',
		name: 'www',
		name_server: 'ns1.coolaj86.com',
		ttl: 86400,
	}).catch(function(error){
		console.error({error});
	});
	console.log({response});
}

if(run_all || run_cname_record){
	/** Create a 'CNAME' record */
	let response = await api.helpers.createCNAMERecord({
		zone: 'wearedoomedarent.we',
		source_domain: 'www.example.com',
		target_domain: 'example.com',
	}).catch(function(error){
		console.error({error});
	});
	console.log({response});
}

if(run_all || run_txt_record){
	/** Create a 'TXT' Record */
	let response = await api.helpers.createTXTRecord({
		zone: 'wearedoomedarent.we',
		name: 'wearedoomedarent.we',	// must be equal to, or a subdomain of 'zone'
		value: 'coolness_level=86',
		ttl: 32600,
	}).catch(function(error){
		console.error({error});
	});

	console.log({response});
}

//if(run_all || run_soa_record){
//	/** Create a 'SOA' Record */
//	let response = await api.helpers.createSOARecord({
//		zone: 'wearedoomedarent.we',
//		mname: 'ns.primaryserver.com',
//		rname: 'admin@example.com',
//		serial: '1111111111',
//		refresh: 86400,
//		retry: 7200,
//		expire: 4000000,
//		ttl: 2600,
//	}).catch(function(error){
//		console.error({error});
//	});
//
//	console.log({response});
//}

if(run_all || run_srv_record){
	/** Create a 'SRV' Record */
	let response = await api.helpers.createSRVRecord({
		zone: 'wearedoomedarent.we',
		host_name: '_service._protocol',
		direct_to: '@',
		port: 80,
		priority: 10,
		weight: 100,
		ttl: 43200,
	}).catch(function(error){
		console.error({error});
	});

	console.log({response});
}
})();
