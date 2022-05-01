'use strict';
const process = require('process');

let run_a_record = process.env.RUN_A_RECORD ?? false;
let run_mx_record = process.env.RUN_MX_RECORD ?? false;
let run_caa_record = process.env.RUN_CAA_RECORD ?? false;
let run_ns_record = process.env.RUN_NS_RECORD ?? false;

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

if(run_a_record){
	/** Confirmed this works */
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

if(run_mx_record){
	/** Confirmed this works */
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

if(run_caa_record){
	/** Confirmed this works */
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

if(run_ns_record){
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

})();
