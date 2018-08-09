const { GraphQLTokens, tokenize } = require("./lexer")
const { GraphQLParser, getParserInstance } = require("./parser")
const { buildAst } = require("./ast")

const api = {
  VERSION: "0.2.0"
}

api.GraphQLTokens = GraphQLTokens
api.tokenize = tokenize
api.GraphQLParser = GraphQLParser

const parser = getParserInstance()

api.parseToCst = function(text) {
  const lexResult = tokenize(text)
  // setting a new input will RESET the parser instance's state.
  parser.input = lexResult.tokens
  // any top level rule may be used as an entry point
  const cst = parser.Document()

  return {
    cst: cst,
    lexErrors: lexResult.errors,
    parseErrors: parser.errors
  }
}

api.parseToAst = function(text) {
  const lexResult = tokenize(text)
  // setting a new input will RESET the parser instance's state.
  parser.input = lexResult.tokens
  // any top level rule may be used as an entry point
  const cst = parser.Document()

  const ast = buildAst(cst)

  return {
    ast: ast,
    lexErrors: lexResult.errors,
    parseErrors: parser.errors
  }
}

api.buildAst = buildAst

module.exports = api
