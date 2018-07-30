const {
  GraphQLParser,
  GraphQLTokens: t,
  tokenize
} = require("graphql-advanced-parser")

const plugins = [
  // Experimental support for defining variables within fragments changes
  {
    ruleName: "FragmentDefinition",
    ruleImpel: function() {
      this.CONSUME(t.Fragment)
      this.SUBRULE(this.FragmentName)
      this.OPTION(() => {
        this.SUBRULE(this.VariableDefinitions)
      })
      this.SUBRULE(this.TypeCondition)
      this.OPTION2(() => {
        this.SUBRULE(this.Directives)
      })
      this.SUBRULE(this.SelectionSet)
    }
  }
]

const parser = new GraphQLParser({ plugins })

module.exports = {
  parse: function parse(text) {
    // Note that because all the "base" GraphQL token types are exported ("GraphQLTokens"),
    // We can also create plugins that add/remove/modify the token types, meaning the lexer...
    const lexResult = tokenize(text)
    parser.input = lexResult.tokens
    const cst = parser.Document()

    return {
      cst: cst,
      lexErrors: lexResult.errors,
      parseErrors: parser.errors
    }
  }
}
