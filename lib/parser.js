// This file was modified from the original sample grammar in the chevrotain repository.
/**
 * GraphQL grammar based on the specifications
 * http://facebook.github.io/graphql/June2018/#sec-Appendix-Grammar-Summary.Document
 *
 * The implementations follows the specs as directly as possible.
 * This means:
 * - Same rule names.
 * - Same Token names.
 *
 * Some things had to be refactored, for example to be an LL(K) grammar.
 * Or to extract repeating code in a rule.
 * But the refactored code is equivalent.
 */
const { Parser } = require("chevrotain")
const { tokenize, GraphQLTokens: t } = require("./lexer")

class GraphQLParser extends Parser {
  constructor(config) {
    super([], t, Object.assign({ outputCst: true }, config))

    // reduce verbosity
    const $ = this

    // the parsing methods
    $.RULE("Document", () => {
      $.MANY(() => {
        $.SUBRULE($.Definition)
      })
    })

    $.RULE("Definition", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.ExecutableDefinition) },
        { ALT: () => $.SUBRULE($.TypeSystemDefinition) },
        { ALT: () => $.SUBRULE($.TypeSystemExtension) }
      ])
    })

    $.RULE("ExecutableDefinition", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.OperationDefinition) },
        { ALT: () => $.SUBRULE($.FragmentDefinition) }
      ])
    })

    $.RULE("OperationDefinition", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.SelectionSet) },
        {
          ALT: () => {
            $.SUBRULE($.OperationType)
            $.OPTION(() => {
              $.CONSUME(t.Name)
            })

            $.OPTION2(() => {
              $.SUBRULE($.VariableDefinitions)
            })

            $.OPTION3(() => {
              $.SUBRULE($.Directives)
            })

            $.SUBRULE2($.SelectionSet)
          }
        }
      ])
    })

    $.RULE("OperationType", () => {
      $.OR([
        { ALT: () => $.CONSUME(t.Query) },
        { ALT: () => $.CONSUME(t.Mutation) },
        { ALT: () => $.CONSUME(t.Subscription) }
      ])
    })

    $.RULE("SelectionSet", () => {
      $.CONSUME(t.LCurly)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.Selection)
      })
      $.CONSUME(t.RCurly)
    })

    $.RULE("Selection", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.Field) },
        { ALT: () => $.SUBRULE($.FragmentSpread) },
        { ALT: () => $.SUBRULE($.InlineFragment) }
      ])
    })

    $.RULE("Field", () => {
      $.OPTION(() => {
        $.SUBRULE($.Alias)
      })

      $.CONSUME(t.Name)

      $.OPTION2(() => {
        $.SUBRULE($.Arguments, { ARGS: [false] })
      })

      $.OPTION3(() => {
        $.SUBRULE($.Directives)
      })

      $.OPTION4(() => {
        $.SUBRULE($.SelectionSet)
      })
    })

    $.RULE("Alias", () => {
      $.CONSUME(t.Name)
      $.CONSUME(t.Colon)
    })

    $.RULE("Arguments", isConst => {
      $.CONSUME(t.LParen)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.Argument, { ARGS: [isConst] })
      })
      $.CONSUME(t.RParen)
    })

    $.RULE("Argument", isConst => {
      $.CONSUME(t.Name)
      $.CONSUME(t.Colon)
      $.SUBRULE($.Value, { ARGS: [isConst] })
    })

    $.RULE("FragmentSpread", () => {
      $.CONSUME(t.DotDotDot)
      $.SUBRULE($.FragmentName)
      $.OPTION(() => {
        $.SUBRULE($.Directives)
      })
    })

    $.RULE("InlineFragment", () => {
      $.CONSUME(t.DotDotDot)
      $.OPTION(() => {
        $.SUBRULE($.TypeCondition)
      })
      $.OPTION2(() => {
        $.SUBRULE($.Directives)
      })
      $.SUBRULE($.SelectionSet)
    })

    $.RULE("FragmentDefinition", () => {
      $.CONSUME(t.Fragment)
      $.SUBRULE($.FragmentName)
      $.SUBRULE($.TypeCondition)
      $.OPTION(() => {
        $.SUBRULE($.Directives)
      })
      $.SUBRULE($.SelectionSet)
    })

    $.RULE("FragmentName", () => {
      $.CONSUME(t.NameButNotOn)
    })

    $.RULE("TypeCondition", () => {
      $.CONSUME(t.On)
      $.SUBRULE($.NamedType)
    })

    $.RULE("Value", isConst => {
      $.OR([
        { GATE: () => !isConst, ALT: () => $.SUBRULE($.Variable) },
        { ALT: () => $.CONSUME(t.IntValue) },
        { ALT: () => $.CONSUME(t.FloatValue) },
        { ALT: () => $.CONSUME(t.StringValue) },
        { ALT: () => $.SUBRULE($.BooleanValue) },
        { ALT: () => $.SUBRULE($.NullValue) },
        { ALT: () => $.SUBRULE($.EnumValue) },
        { ALT: () => $.SUBRULE($.ListValue, { ARGS: [isConst] }) },
        { ALT: () => $.SUBRULE($.ObjectValue, { ARGS: [isConst] }) }
      ])
    })

    $.RULE("BooleanValue", () => {
      $.OR([
        { ALT: () => $.CONSUME(t.True) },
        { ALT: () => $.CONSUME(t.False) }
      ])
    })

    $.RULE("NullValue", () => {
      $.CONSUME(t.Null)
    })

    $.RULE("EnumValue", () => {
      $.CONSUME(t.NameButNotTrueOrFalseOrNull)
    })

    $.RULE("ListValue", isConst => {
      $.CONSUME(t.LSquare)
      $.MANY(() => {
        $.SUBRULE($.Value, { ARGS: [isConst] })
      })
      $.CONSUME(t.RSquare)
    })

    $.RULE("ObjectValue", isConst => {
      $.CONSUME(t.LCurly)
      $.MANY(() => {
        $.SUBRULE($.ObjectField, { ARGS: [isConst] })
      })
      $.CONSUME(t.RCurly)
    })

    $.RULE("ObjectField", isConst => {
      $.CONSUME(t.Name)
      $.CONSUME(t.Colon)
      $.SUBRULE($.Value, { ARGS: [isConst] })
    })

    $.RULE("VariableDefinitions", () => {
      $.CONSUME(t.LParen)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.VariableDefinition)
      })
      $.CONSUME(t.RParen)
    })

    $.RULE("VariableDefinition", () => {
      $.SUBRULE($.Variable)
      $.CONSUME(t.Colon)
      $.SUBRULE($.Type)
      $.OPTION(() => {
        $.SUBRULE($.DefaultValue)
      })
    })

    $.RULE("Variable", () => {
      $.CONSUME(t.Dollar)
      $.CONSUME(t.Name)
    })

    $.RULE("DefaultValue", () => {
      $.CONSUME(t.Equals)
      $.SUBRULE($.Value, { ARGS: [true] })
    })

    $.RULE("Type", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.NamedType) },
        { ALT: () => $.SUBRULE($.ListType) }
      ])

      // NonNullType rule refactored inside the TypeRule
      // as Its not written in LL(K) form.
      $.OPTION(() => {
        $.CONSUME(t.Exclamation)
      })
    })

    $.RULE("NamedType", () => {
      $.CONSUME(t.Name)
    })

    $.RULE("ListType", () => {
      $.CONSUME(t.LSquare)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.Type)
      })
      $.CONSUME(t.RSquare)
    })

    $.RULE("Directives", isConst => {
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.Directive, { ARGS: [isConst] })
      })
    })

    $.RULE("Directive", isConst => {
      $.CONSUME(t.At)
      $.CONSUME(t.Name)
      $.OPTION(() => {
        $.SUBRULE($.Arguments, { ARGS: [isConst] })
      })
    })

    $.RULE("TypeSystemDefinition", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.SchemaDefinition) },
        { ALT: () => $.SUBRULE($.TypeDefinition) },
        { ALT: () => $.SUBRULE($.DirectiveDefinition) }
      ])
    })

    $.RULE("TypeSystemExtension", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.SchemaExtension) },
        { ALT: () => $.SUBRULE($.TypeExtension) }
      ])
    })

    $.RULE("SchemaDefinition", () => {
      $.CONSUME(t.Schema)
      $.OPTION(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })
      $.CONSUME(t.LCurly)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.OperationTypeDefinition)
      })
      $.CONSUME(t.RCurly)
    })

    $.RULE("SchemaExtension", () => {
      $.CONSUME(t.Extend)
      $.CONSUME(t.Schema)

      // Refactored the grammar to be LL(K)
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.Directives, { ARGS: [true] })
            $.OPTION(() => {
              $.SUBRULE($.OperationTypeDefinitionList)
            })
          }
        },
        {
          ALT: () => {
            $.SUBRULE2($.OperationTypeDefinitionList)
          }
        }
      ])
    })

    // This rule does not appear in the original spec, its a factoring out
    // of a the common suffix for "SchemaExtension"
    $.RULE("OperationTypeDefinitionList", () => {
      $.CONSUME(t.LCurly)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.OperationTypeDefinition)
      })
      $.CONSUME(t.RCurly)
    })

    $.RULE("OperationTypeDefinition", () => {
      $.SUBRULE($.OperationType)
      $.CONSUME(t.Colon)
      $.SUBRULE($.NamedType)
    })

    $.RULE("Description", () => {
      $.CONSUME(t.StringValue)
    })

    $.RULE("TypeDefinition", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.ScalarTypeDefinition) },
        { ALT: () => $.SUBRULE($.ObjectTypeDefinition) },
        { ALT: () => $.SUBRULE($.InterfaceTypeDefinition) },
        { ALT: () => $.SUBRULE($.UnionTypeDefinition) },
        { ALT: () => $.SUBRULE($.EnumTypeDefinition) },
        { ALT: () => $.SUBRULE($.InputObjectTypeDefinition) }
      ])
    })

    $.RULE("TypeExtension", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.ScalarTypeExtension) },
        { ALT: () => $.SUBRULE($.ObjectTypeExtension) },
        { ALT: () => $.SUBRULE($.InterfaceTypeExtension) },
        { ALT: () => $.SUBRULE($.UnionTypeExtension) },
        { ALT: () => $.SUBRULE($.EnumTypeExtension) },
        { ALT: () => $.SUBRULE($.InputObjectTypeExtension) }
      ])
    })

    $.RULE("ScalarTypeDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })
      $.CONSUME(t.Scalar)
      $.CONSUME(t.Name)
      $.OPTION2(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })
    })

    $.RULE("ScalarTypeExtension", () => {
      $.CONSUME(t.Extend)
      $.CONSUME(t.Scalar)
      $.CONSUME(t.Name)
      $.SUBRULE($.Directives, { ARGS: [true] })
    })

    $.RULE("ObjectTypeDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })
      $.CONSUME(t.TypeTok)
      $.CONSUME(t.Name)
      $.OPTION2(() => {
        $.SUBRULE($.ImplementsInterfaces)
      })
      $.OPTION3(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })
      $.OPTION4(() => {
        $.SUBRULE($.FieldsDefinition)
      })
    })

    $.RULE("ObjectTypeExtension", () => {
      $.CONSUME(t.Extend)
      $.CONSUME(t.TypeTok)
      $.CONSUME(t.Name)

      // refactored the spec grammar be LL(K)
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.ImplementsInterfaces)
            $.OPTION(() => {
              $.SUBRULE($.Directives, { ARGS: [true] })
            })
            $.OPTION2(() => {
              $.SUBRULE($.FieldsDefinition)
            })
          }
        },
        {
          ALT: () => {
            $.SUBRULE2($.Directives, { ARGS: [true] })
            $.OPTION3(() => {
              $.SUBRULE2($.FieldsDefinition)
            })
          }
        },
        {
          ALT: () => {
            $.SUBRULE3($.FieldsDefinition)
          }
        }
      ])
    })

    $.RULE("ImplementsInterfaces", () => {
      $.CONSUME(t.Implements)
      $.OPTION(() => {
        $.CONSUME(t.Ampersand)
      })
      $.SUBRULE($.NamedType)
      $.MANY(() => {
        $.CONSUME2(t.Ampersand)
        $.SUBRULE2($.NamedType)
      })
    })

    $.RULE("FieldsDefinition", () => {
      $.CONSUME(t.LCurly)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.FieldDefinition)
      })
      $.CONSUME(t.RCurly)
    })

    $.RULE("FieldDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })
      $.CONSUME(t.Name)
      $.OPTION2(() => {
        $.SUBRULE($.ArgumentsDefinition)
      })
      $.CONSUME(t.Colon)
      $.SUBRULE($.Type)
      $.OPTION3(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })
    })

    $.RULE("ArgumentsDefinition", () => {
      $.CONSUME(t.LParen)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.InputValueDefinition)
      })
      $.CONSUME(t.RParen)
    })

    $.RULE("InputValueDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })
      $.CONSUME(t.Name)
      $.CONSUME(t.Colon)
      $.SUBRULE($.Type)
      $.OPTION2(() => {
        $.SUBRULE($.DefaultValue)
      })
      $.OPTION3(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })
    })

    $.RULE("InterfaceTypeDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })
      $.CONSUME(t.Interface)
      $.CONSUME(t.Name)
      $.OPTION2(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })
      $.OPTION3(() => {
        $.SUBRULE($.FieldsDefinition)
      })
    })

    $.RULE("InterfaceTypeExtension", () => {
      $.CONSUME(t.Extend)
      $.CONSUME(t.Interface)
      $.CONSUME(t.Name)

      // Refactored the grammar to be LL(K)
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.Directives, { ARGS: [true] })
            $.OPTION(() => {
              $.SUBRULE($.FieldsDefinition)
            })
          }
        },
        {
          ALT: () => {
            $.SUBRULE2($.FieldsDefinition)
          }
        }
      ])
    })

    $.RULE("UnionTypeDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })
      $.CONSUME(t.Union)
      $.CONSUME(t.Name)
      $.OPTION2(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })
      $.OPTION3(() => {
        $.SUBRULE($.UnionMemberTypes)
      })
    })

    $.RULE("UnionMemberTypes", () => {
      $.CONSUME(t.Equals)

      $.OPTION(() => {
        $.CONSUME(t.VerticalLine)
      })
      $.SUBRULE($.NamedType)

      $.MANY(() => {
        $.CONSUME2(t.VerticalLine)
        $.SUBRULE2($.NamedType)
      })
    })

    $.RULE("UnionTypeExtension", () => {
      $.CONSUME(t.Extend)
      $.CONSUME(t.Union)
      $.CONSUME(t.Name)

      // Refactored the grammar to be LL(K)
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.Directives, { ARGS: [true] })
            $.OPTION(() => {
              $.SUBRULE($.UnionMemberTypes)
            })
          }
        },
        {
          ALT: () => {
            $.SUBRULE2($.UnionMemberTypes)
          }
        }
      ])
    })

    $.RULE("EnumTypeDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })
      $.CONSUME(t.Enum)
      $.CONSUME(t.Name)
      $.OPTION2(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })
      $.OPTION3(() => {
        $.SUBRULE($.EnumValuesDefinition)
      })
    })

    $.RULE("EnumValuesDefinition", () => {
      $.CONSUME(t.LCurly)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.EnumValueDefinition)
      })
      $.CONSUME(t.RCurly)
    })

    $.RULE("EnumValueDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })
      $.SUBRULE($.EnumValue)
      $.OPTION2(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })
    })

    $.RULE("EnumTypeExtension", () => {
      $.CONSUME(t.Extend)
      $.CONSUME(t.Enum)
      $.CONSUME(t.Name)

      // Refactored the grammar to be LL(K)
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.Directives, { ARGS: [true] })
            $.OPTION(() => {
              $.SUBRULE($.EnumValuesDefinition)
            })
          }
        },
        {
          ALT: () => {
            $.SUBRULE2($.EnumValuesDefinition)
          }
        }
      ])
    })

    $.RULE("InputObjectTypeDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })

      $.CONSUME(t.Input)
      $.CONSUME(t.Name)

      $.OPTION2(() => {
        $.SUBRULE($.Directives, { ARGS: [true] })
      })

      $.OPTION3(() => {
        $.SUBRULE($.InputFieldsDefinition)
      })
    })

    $.RULE("InputFieldsDefinition", () => {
      $.CONSUME(t.LCurly)
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.InputValueDefinition)
      })
      $.CONSUME(t.RCurly)
    })

    $.RULE("InputObjectTypeExtension", () => {
      $.CONSUME(t.Extend)
      $.CONSUME(t.Input)
      $.CONSUME(t.Name)

      // Refactored the grammar to be LL(K)
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.Directives, { ARGS: [true] })
            $.OPTION(() => {
              $.SUBRULE($.EnumValuesDefinition)
            })
          }
        },
        {
          ALT: () => {
            $.SUBRULE2($.InputFieldsDefinition)
          }
        }
      ])
    })

    $.RULE("DirectiveDefinition", () => {
      $.OPTION(() => {
        $.SUBRULE($.Description)
      })
      $.CONSUME(t.DirectiveTok)
      $.CONSUME(t.At)
      $.CONSUME(t.Name)
      $.OPTION2(() => {
        $.SUBRULE($.ArgumentsDefinition)
      })
      $.CONSUME(t.On)

      $.OPTION3(() => {
        $.SUBRULE($.DirectiveLocations)
      })
    })

    $.RULE("DirectiveLocations", () => {
      $.OPTION(() => {
        $.CONSUME(t.VerticalLine)
      })
      $.SUBRULE($.DirectiveLocation)

      $.MANY(() => {
        $.CONSUME2(t.VerticalLine)
        $.SUBRULE2($.DirectiveLocation)
      })
    })

    $.RULE("DirectiveLocation", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.ExecutableDirectiveLocation) },
        { ALT: () => $.SUBRULE($.TypeSystemDirectiveLocation) }
      ])
    })

    $.RULE("ExecutableDirectiveLocation", () => {
      $.OR([
        { ALT: () => $.CONSUME(t.QUERY) },
        { ALT: () => $.CONSUME(t.MUTATION) },
        { ALT: () => $.CONSUME(t.SUBSCRIPTION) },
        { ALT: () => $.CONSUME(t.FIELD) },
        { ALT: () => $.CONSUME(t.FRAGMENT_DEFINITION) },
        { ALT: () => $.CONSUME(t.FRAGMENT_SPREAD) },
        { ALT: () => $.CONSUME(t.INLINE_FRAGMENT) }
      ])
    })

    $.RULE("TypeSystemDirectiveLocation", () => {
      $.OR([
        { ALT: () => $.CONSUME(t.SCHEMA) },
        { ALT: () => $.CONSUME(t.SCALAR) },
        { ALT: () => $.CONSUME(t.OBJECT) },
        { ALT: () => $.CONSUME(t.FIELD_DEFINITION) },
        { ALT: () => $.CONSUME(t.ARGUMENT_DEFINITION) },
        { ALT: () => $.CONSUME(t.INTERFACE) },
        { ALT: () => $.CONSUME(t.UNION) },
        { ALT: () => $.CONSUME(t.ENUM) },
        { ALT: () => $.CONSUME(t.ENUM_VALUE) },
        { ALT: () => $.CONSUME(t.INPUT_OBJECT) },
        { ALT: () => $.CONSUME(t.INPUT_FIELD_DEFINITION) }
      ])
    })

    if (config && config.plugins) {
      config.plugins.forEach(plugin => {
        // TODO, enable also defining new rules, not just overriding existing ones
        $.OVERRIDE_RULE(plugin.ruleName, plugin.ruleImpel)
      })
    }

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis()
  }
}

const parser = new GraphQLParser()

module.exports = {
  GraphQLParser: GraphQLParser,

  parse: function parse(text) {
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
}
