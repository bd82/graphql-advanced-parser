const { GraphQLTokens, tokenize } = require("./lexer")
const { GraphQLParser, parse } = require("./parser")

const api = {
  VERSION: "0.0.1"
}

api.GraphQLTokens = GraphQLTokens
api.tokenize = tokenize
api.GraphQLParser = GraphQLParser
api.parse = parse

module.exports = api
