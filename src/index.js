const express = require('express');
//handle json requests
const bodyParser = require('body-parser');
//handle graphql server requests/responses
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const schema = require('./schema');
const {authenticate} = require('./authentication');
const buildDataloaders = require('./dataloaders');
const formatError = require('./formatError');

const {execute, subscribe} = require('graphql');
const {createServer} = require('http');
const {SubscriptionServer} = require('subscriptions-transport-ws');
const cors = require('cors');
//mongodb
const connectMongo = require('./mongo-connector');

const PORT = 3000;

const start = async () => {
	const mongo = await connectMongo();
	const buildOptions = async (req, res) => {
		const user = await authenticate(req, mongo.Users);
		return {
			context: {
				dataloaders: buildDataloaders(mongo),
				mongo,
				user
			},
			formatError,
			schema,
		};
	};
	var app = express();
	app.use('/graphql', cors(), bodyParser.json(), graphqlExpress(buildOptions));
	app.use('/graphiql', graphiqlExpress({
		endpointURL: '/graphql',
		passHeader: `'Authorization': 'bearer token-fake@fake.com'`,
		subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
	}));
	const server = createServer(app);
	server.listen(PORT, () => {
		SubscriptionServer.create(
			{execute, subscribe, schema},
			{server, path: '/subscriptions'},
		);
		console.log(`Hackernews GraphQL server running on port ${PORT}.`)
	});
};
start();
