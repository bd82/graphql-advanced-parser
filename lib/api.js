const { GraphQLTokens, tokenize } = require("./lexer")
const { GraphQLParser, parse } = require("./parser")

const api = {}

api.GraphQLTokens = GraphQLTokens
api.tokenize = tokenize
api.GraphQLParser = GraphQLParser
api.parse = parse

module.exports = api
