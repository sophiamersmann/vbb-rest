'use strict'

const express      = require('express')
const autocomplete = require('vbb-stations-autocomplete')
const search       = require('vbb-find-stations')
const ndjson       = require('ndjson')
const hafas        = require('vbb-hafas')
const config       = require('config')

const api = express()

api.get('/stations', (req, res) => {
	if (!req.query.query) return res.status(400).end('Missing query.')
	if (req.query.completion === 'true')
		return res.json(autocomplete(req.query.query)
			.map((r) => Object.assign({}, r, r.__proto__)))
	else {
		res.type('application/x-ndjson')
		search(req.query.query)
		.on('error', (err) => res.status(500).end(err.message))
		.pipe(ndjson.stringify())
		.pipe(res)
	}
})

api.get('/stations/:id/departures', (req, res) => {
	hafas.departures(config.vbbKey, req.params.id)
	.then((deps) => res.json(deps))
})

api.listen(3000)
