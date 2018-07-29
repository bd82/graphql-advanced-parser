const XRegExp = require("xregexp")
const { Lexer, createToken: orgCreateToken } = require("chevrotain")

// ----------------- lexer -----------------
// A little mini DSL for easier lexer definition using xRegExp.
const fragments = {}

function FRAGMENT(name, def) {
  fragments[name] = XRegExp.build(def, fragments)
}

function MAKE_PATTERN(def, flags) {
  return XRegExp.build(def, fragments, flags)
}

const allTokens = []
const tokensDictionary = {}

const createToken = function() {
  const newToken = orgCreateToken.apply(null, arguments)
  allTokens.push(newToken)
  return newToken
}

const keywordTokens = []
const createKeywordToken = function(config) {
  config.longer_alt = Identifier
  const newToken = createToken(config)
  keywordTokens.push(newToken)
  newToken.CATEGORIES.push(Keyword)
  return newToken
}

const createNotToken = function(config) {
  const newNotTokenCategory = orgCreateToken({
    name: config.name,
    pattern: Lexer.NA
  })
  const notMatch = config.not
  const matchingKeywords = keywordTokens.filter(keywordTokType => {
    let found = false
    notMatch.forEach(notTokType => {
      if (notTokType === keywordTokType) {
        found = true
      }
    })
    return found
  })

  // All matching keywords now match the category of the NOT token.
  matchingKeywords.forEach(keywordTokType =>
    keywordTokType.CATEGORIES.push(newNotTokenCategory)
  )

  // Name always matches the Not token
  Name.CATEGORIES.push(newNotTokenCategory)

  allTokens.push(newNotTokenCategory)
  return newNotTokenCategory
}

// B1 - Ignored-Tokens
// http://facebook.github.io/graphql/June2018/#sec-Appendix-Grammar-Summary.Ignored-Tokens
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /[ \t]+/,
  group: Lexer.SKIPPED
})

const UnicodeBOM = createToken({
  name: "UnicodeBOM",
  pattern: "\uFFFE",
  group: Lexer.SKIPPED
})

const LineTerminator = createToken({
  name: "LineTerminator",
  pattern: /\r\n|\r|\n/,
  group: Lexer.SKIPPED
})

const Comment = createToken({
  name: "Comment",
  pattern: /#[^\n\r]*/,
  group: Lexer.SKIPPED
})

const Comma = createToken({
  name: "Comma",
  pattern: ",",
  group: Lexer.SKIPPED
})

// B2 - Lexical Tokens
// http://facebook.github.io/graphql/June2018/#sec-Appendix-Grammar-Summary.Lexical-Tokens
// Punctuator
const Exclamation = createToken({ name: "Exclamation", pattern: "!" })
const Dollar = createToken({ name: "Dollar", pattern: "$" })
const LParen = createToken({ name: "LParen", pattern: "(" })
const RParen = createToken({ name: "RParen", pattern: ")" })
const DotDotDot = createToken({ name: "DotDotDot", pattern: "..." })
const Colon = createToken({ name: "Colon", pattern: ":" })
const Equals = createToken({ name: "Equals", pattern: "=" })
const At = createToken({ name: "At", pattern: "@" })
const Ampersand = createToken({ name: "Ampersand", pattern: "&" })
const LSquare = createToken({ name: "LSquare", pattern: "[" })
const RSquare = createToken({ name: "RSquare", pattern: "]" })
const LCurly = createToken({ name: "LCurly", pattern: "{" })
const VerticalLine = createToken({ name: "VerticalLine", pattern: "|" })
const RCurly = createToken({ name: "RCurly", pattern: "}" })

const Name = createToken({ name: "Name", pattern: Lexer.NA })

// keywords and Name
// "Identifier" must not be placed into the TokenTypeList before any keywords
// as it can match any keyword, so we use "orgCreateToken"
const Identifier = orgCreateToken({
  name: "Identifier",
  pattern: /[_A-Za-z][_0-9A-Za-z]*/,
  categories: [Name]
})

const Keyword = createToken({
  name: "Keyword",
  pattern: Lexer.NA,
  categories: [Name]
})
const Query = createKeywordToken({ name: "Query", pattern: "query" })
const Mutation = createKeywordToken({
  name: "Mutation",
  pattern: "mutation"
})
const Subscription = createKeywordToken({
  name: "Subscription",
  pattern: "subscription"
})
const Fragment = createKeywordToken({
  name: "Fragment",
  pattern: "fragment"
})
const On = createKeywordToken({ name: "On", pattern: "on" })
const True = createKeywordToken({ name: "True", pattern: "true" })
const False = createKeywordToken({ name: "False", pattern: "false" })
const Null = createKeywordToken({ name: "Null", pattern: "null" })
const Schema = createKeywordToken({ name: "Schema", pattern: "schema" })
const Extend = createKeywordToken({ name: "Extend", pattern: "extend" })
const Scalar = createKeywordToken({ name: "Scalar", pattern: "scalar" })
const Implements = createKeywordToken({
  name: "Implements",
  pattern: "implements"
})
const Interface = createKeywordToken({
  name: "Interface",
  pattern: "interface"
})
const Union = createKeywordToken({ name: "Union", pattern: "union" })
const Enum = createKeywordToken({ name: "Enum", pattern: "enum" })
const Input = createKeywordToken({ name: "Input", pattern: "input" })
const DirectiveTok = createKeywordToken({
  name: "DirectiveTok",
  pattern: "directive"
})
const TypeTok = createKeywordToken({ name: "TypeTok", pattern: "type" })

// TODO: are these really tokens/keywords?
// they are used in "ExecutableDirectiveLocation" and "TypeSystemDirectiveLocation" rules
// Why are they upper case?
// Why are they with the names of parsing rules
const QUERY = createKeywordToken({ name: "QUERY", pattern: "QUERY" })
const MUTATION = createKeywordToken({
  name: "MUTATION",
  pattern: "MUTATION"
})
const SUBSCRIPTION = createKeywordToken({
  name: "SUBSCRIPTION",
  pattern: "SUBSCRIPTION"
})
const FIELD = createKeywordToken({ name: "FIELD", pattern: "FIELD" })
const FRAGMENT_DEFINITION = createKeywordToken({
  name: "FRAGMENT_DEFINITION",
  pattern: "FRAGMENT_DEFINITION"
})
const FRAGMENT_SPREAD = createKeywordToken({
  name: "FRAGMENT_SPREAD",
  pattern: "FRAGMENT_SPREAD"
})
const INLINE_FRAGMENT = createKeywordToken({
  name: "INLINE_FRAGMENT",
  pattern: "INLINE_FRAGMENT"
})
const SCHEMA = createKeywordToken({ name: "SCHEMA", pattern: "SCHEMA" })
const SCALAR = createKeywordToken({ name: "SCALAR", pattern: "SCALAR" })
const OBJECT = createKeywordToken({ name: "OBJECT", pattern: "OBJECT" })
const FIELD_DEFINITION = createKeywordToken({
  name: "FIELD_DEFINITION",
  pattern: "FIELD_DEFINITION"
})
const ARGUMENT_DEFINITION = createKeywordToken({
  name: "ARGUMENT_DEFINITION",
  pattern: "ARGUMENT_DEFINITION"
})
const INTERFACE = createKeywordToken({
  name: "INTERFACE",
  pattern: "INTERFACE"
})
const UNION = createKeywordToken({ name: "UNION", pattern: "UNION" })
const ENUM = createKeywordToken({ name: "ENUM", pattern: "ENUM" })
const ENUM_VALUE = createKeywordToken({
  name: "ENUM_VALUE",
  pattern: "ENUM_VALUE"
})
const INPUT_OBJECT = createKeywordToken({
  name: "INPUT_OBJECT",
  pattern: "INPUT_OBJECT"
})
const INPUT_FIELD_DEFINITION = createKeywordToken({
  name: "INPUT_FIELD_DEFINITION",
  pattern: "INPUT_FIELD_DEFINITION"
})
const NameButNotOn = createNotToken({
  name: "NameButNotOn",
  not: [On]
})
const NameButNotTrueOrFalseOrNull = createNotToken({
  name: "NameButNotTrueOrFalseOrNull",
  not: [True, False, Null]
})

// We manually add the general Identifier AFTER all the keyword token types.
allTokens.push(Identifier)

FRAGMENT("IntegerPart", "-?(0|[1-9][0-9]*)")
FRAGMENT("FractionalPart", "\\.[0-9]+")
FRAGMENT("ExponentPart", "[eE][+-]?[0-9]+")

// FloatValue must appear BEFORE IntValue due to longer common prefix
const FloatValue = createToken({
  name: "FloatValue",
  pattern: MAKE_PATTERN(
    "{{IntegerPart}}{{FractionalPart}}({{ExponentPart}})?|{{IntegerPart}}{{ExponentPart}}"
  )
})

const IntValue = createToken({
  name: "IntValue",
  pattern: MAKE_PATTERN("{{IntegerPart}}")
})

FRAGMENT("EscapedCharacter", '[\\\\/"bfnrt]')
FRAGMENT("EscapedUnicode", "[0-9a-fA-F]{4}")
FRAGMENT(
  "StringCharacter",
  '(?:[^\\\\"\\n\\r]|\\\\(?:{{EscapedUnicode}}|u{{EscapedCharacter}}))'
)
FRAGMENT("BlockStringCharacter", '\\\\"""|[^"]|"(?!"")')
const StringValue = createToken({
  name: "StringValue",
  pattern: MAKE_PATTERN(
    '"""(?:{{BlockStringCharacter}})*"""|"(?:{{StringCharacter}})*"'
  )
})

const graphQLLexer = new Lexer(allTokens)

allTokens.forEach(tokType => {
  tokensDictionary[tokType.name] = tokType
})

module.exports = {
  GraphQLTokens: tokensDictionary,
  graphQLLexer: graphQLLexer,

  tokenize: function(text) {
    return graphQLLexer.tokenize(text)
  }
}
