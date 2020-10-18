const express = require('express');
const path = require('path');
//import ApolloSever
const { ApolloServer } = require('apollo-server-express');
//authentication middleware
const { authMiddleware } = require('./utils/auth');

//import typeDefs and resolvers
const { typeDefs, resolvers } = ('./schemas');
const db = require('./config/connection');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

//create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs, 
  resolvers,
  context: authMiddleware
});

//integrate our Apollo server with the express application middleware
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
});
