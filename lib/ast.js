const { getParserInstance } = require("./parser")

const BaseVisitor = getParserInstance().getBaseCstVisitorConstructor()

class AstBuilderVisitor extends BaseVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  Document(ctx) {
    let definitions = []
    if (ctx.Definition) {
      definitions = ctx.Definition.map(this.visit, this)
    }

    return {
      kind: "Document",
      definitions,
      loc: "TBD"
    }
  }

  Definition(ctx) {
    if (ctx.ExecutableDefinition) {
      return this.visit(ctx.ExecutableDefinition)
    } else if (ctx.TypeSystemDefinition) {
      return this.visit(ctx.TypeSystemDefinition)
    } else if (ctx.TypeSystemExtension) {
      return this.visit(ctx.TypeSystemExtension)
    } else {
      throw "None Exhaustive Match"
    }
  }

  ExecutableDefinition(ctx) {
    if (ctx.ExecutableDefinition) {
      return this.visit(ctx.OperationDefinition)
    } else if (ctx.TypeSystemDefinition) {
      return this.visit(ctx.FragmentDefinition)
    } else {
      throw "None Exhaustive Match"
    }
  }

  OperationDefinition(ctx) {
    if (ctx.$ImplicitQueryOperationDefinition) {
      return this.visit(ctx.$ImplicitQueryOperationDefinition)
    } else if (ctx.$ExplicitOperationDefinition) {
      return this.visit(ctx.$ExplicitOperationDefinition)
    } else {
      throw "None Exhaustive Match"
    }
  }

  OperationDefinition$ImplicitQueryOperationDefinition(ctx) {
    return {
      kind: "OperationDefinition",
      operation: "query",
      name: undefined,
      variableDefinitions: [],
      directives: [],
      selectionSet: this.visit(ctx.SelectionSet),
      loc: "TBD"
    }
  }

  OperationDefinition$ExplicitOperationDefinition(ctx) {
    return {
      kind: "OperationDefinition",
      operation: this.visit(ctx.OperationType),
      name: visitName(ctx.Name),
      variableDefinitions: this.visit(ctx.VariableDefinitions),
      directives: this.visit(ctx.Directives),
      selectionSet: this.visit(ctx.SelectionSet),
      loc: "TBD"
    }
  }

  OperationType(ctx) {
    // TODO: Lost Token Info
    // we lose position information by only returning the value
    // we may need to either keep the whole CST reference or change the return type?
    if (ctx.Query) {
      return "query"
    } else if (ctx.Mutation) {
      return "mutation"
    } else if (ctx.Subscription) {
      return "subscription"
    } else {
      throw "None Exhaustive Match"
    }
  }

  SelectionSet(ctx) {
    let selections = []

    if (ctx.Selection) {
      selections = ctx.Selection.map(this.visit, this)
    }

    return {
      kind: "SelectionSet",
      selections: selections,
      loc: "TBD"
    }
  }

  Selection(ctx) {
    if (ctx.Field) {
      return this.visit(ctx.Field)
    } else if (ctx.FragmentSpread) {
      return this.visit(ctx.FragmentSpread)
    } else if (ctx.InlineFragment) {
      return this.visit(ctx.InlineFragment)
    } else {
      throw "None Exhaustive Match"
    }
  }

  Field(ctx) {
    return {
      kind: "Field",
      alias: this.visit(ctx.Alias),
      name: visitName(ctx.Name),
      arguments: this.visit(ctx.Arguments) || [],
      directives: this.visit(ctx.Directives) || [],
      selectionSet: this.visit(ctx.SelectionSet),
      loc: loc(lexer, start)
    }
  }

  Alias(ctx) {
    // TODO: Lost Token Info (The Colon)
    return visitName(ctx.Name)
  }

  Arguments(ctx) {
    let argumentsAsts = []

    if (ctx.Argument) {
      argumentsAsts = ctx.Argument.map(this.visit, this)
    }

    return argumentsAsts
  }

  Argument(ctx) {
    return {
      kind: "Argument",
      name: visitName(ctx.Name),
      value: this.visit(ctx.Value),
      loc: "TBD"
    }
  }

  FragmentSpread(ctx) {
    return {
      kind: "FragmentSpread",
      name: this.visit(ctx.FragmentName),
      directives: this.visit(ctx.Directives),
      loc: "TBD"
    }
  }

  InlineFragment(ctx) {
    return {
      kind: "InlineFragment",
      typeCondition: this.visit(ctx.TypeCondition),
      directives: this.visit(ctx.Directives),
      selectionSet: this.visit(ctx.SelectionSet),
      loc: "TBD"
    }
  }

  FragmentDefinition(ctx) {
    return {
      kind: "FragmentDefinition",
      name: this.visit(ctx.FragmentName),
      typeCondition: this.visit(ctx.TypeCondition),
      directives: this.visit(ctx.Directives),
      selectionSet: this.visit(ctx.SelectionSet),
      loc: "TBD"
    }
  }

  FragmentName(ctx) {
    return visitName(ctx.NameButNotOn)
  }

  TypeCondition(ctx) {
    return visitName(ctx.NameButNotOn)
  }

  Value(ctx) {
    if (ctx.Variable) {
      return this.visit(ctx.Variable)
    } else if (ctx.IntValue) {
      return visitToken(ctx.IntValue, "IntValue")
    } else if (ctx.FloatValue) {
      return visitToken(ctx.IntValue, "FloatValue")
    } else if (ctx.StringValue) {
      return visitToken(ctx.IntValue, "StringValue")
    } else if (ctx.BooleanValue) {
      return this.visit(ctx.BooleanValue)
    } else if (ctx.NullValue) {
      return this.visit(ctx.NullValue)
    } else if (ctx.EnumValue) {
      return this.visit(ctx.EnumValue)
    } else if (ctx.ListValue) {
      return this.visit(ctx.ListValue)
    } else if (ctx.ObjectValue) {
      return this.visit(ctx.ObjectValue)
    } else {
      throw "None Exhaustive Match"
    }
  }

  BooleanValue(ctx) {
    let boolValue
    if (ctx.True) {
      boolValue = true
    } else if (ctx.False) {
      boolValue = false
    } else {
      throw "None Exhaustive Match"
    }

    return {
      kind: "BooleanValue",
      value: boolValue,
      loc: "TBD"
    }
  }

  NullValue(ctx) {
    return {
      kind: "null",
      loc: "TBD"
    }
  }

  EnumValue(ctx) {
    return visitToken(ctx.NameButNotTrueOrFalseOrNull, "EnumValue")
  }

  ListValue(ctx) {
    let items = []
    if (ctx.Value) {
      items = ctx.Value.map(this.visit, this)
    }

    return {
      kind: "ListValue",
      definitions: items,
      loc: "TBD"
    }
  }

  ObjectValue(ctx) {
    let entries = []
    if (ctx.ObjectField) {
      entries = ctx.ObjectField.map(this.visit, this)
    }

    return {
      kind: "ObjectValue",
      definitions: entries,
      loc: "TBD"
    }
  }

  ObjectField(ctx) {
    return {
      kind: "ObjectField",
      name: visitName(ctx.Name),
      value: this.visit(ctx.Value),
      loc: "TBD"
    }
  }

  VariableDefinitions(ctx) {
    let definitions = []
    if (ctx.VariableDefinition) {
      definitions = ctx.VariableDefinition.map(this.visit, this)
    }

    return definitions
  }

  VariableDefinition(ctx) {
    return {
      kind: "VariableDefinition",
      variable: this.visit(ctx.Variable),
      type: this.visit(ctx.Type),
      defaultValue: this.visit(ctx.DefaultValue),
      loc: "TBD"
    }
  }

  Variable(ctx) {
    return {
      kind: "Variable",
      name: visitName(ctx.Name),
      loc: "TBD"
    }
  }

  DefaultValue(ctx) {
    // TODO: update the Location property ("=" Token)
    return this.visit(ctx.Value)
  }

  Type(ctx) {
    let type
    if (ctx.NamedType) {
      type = this.visit(ctx.NamedType)
    } else if (ctx.ListType) {
      type = this.visit(ctx.ListType)
    } else {
      throw "None Exhaustive Match"
    }

    // TODO: would exclamation affect Location property?
    if (ctx.Exclamation) {
      return {
        kind: "NonNullType",
        type: type,
        loc: "TBD"
      }
    } else {
      return type
    }
  }

  NamedType(ctx) {
    return {
      kind: "NamedType",
      name: visitName(ctx.Name),
      loc: "TBD"
    }
  }

  ListType(ctx) {
    return {
      kind: "ListType",
      type: this.visit(ctx.Type),
      loc: loc(lexer, start)
    }
  }

  Directives(ctx) {
    let directives = []
    if (ctx.Directive) {
      directives = ctx.Directive.map(this.visit, this)
    }
    return directives
  }

  Directive(ctx) {}

  TypeSystemDefinition(ctx) {}

  TypeSystemExtension(ctx) {}

  SchemaDefinition(ctx) {}

  SchemaExtension(ctx) {}

  OperationTypeDefinitionList(ctx) {}

  OperationTypeDefinition(ctx) {}

  Description(ctx) {}

  TypeDefinition(ctx) {}

  TypeExtension(ctx) {}

  ScalarTypeDefinition(ctx) {}

  ScalarTypeExtension(ctx) {}

  ObjectTypeDefinition(ctx) {}

  ObjectTypeExtension(ctx) {}

  ImplementsInterfaces(ctx) {}

  FieldsDefinition(ctx) {}

  FieldDefinition(ctx) {}

  ArgumentsDefinition(ctx) {}

  InputValueDefinition(ctx) {}

  InterfaceTypeDefinition(ctx) {}

  InterfaceTypeExtension(ctx) {}

  UnionTypeDefinition(ctx) {}

  UnionMemberTypes(ctx) {}

  UnionTypeExtension(ctx) {}

  EnumTypeDefinition(ctx) {}

  EnumValuesDefinition(ctx) {}

  EnumValueDefinition(ctx) {}

  EnumTypeExtension(ctx) {}

  InputObjectTypeDefinition(ctx) {}

  InputFieldsDefinition(ctx) {}

  InputObjectTypeExtension(ctx) {}

  DirectiveDefinition(ctx) {}

  DirectiveLocations(ctx) {}

  DirectiveLocation(ctx) {}

  ExecutableDirectiveLocation(ctx) {}

  TypeSystemDirectiveLocation(ctx) {}
}

new AstBuilderVisitor()

function visitName(nameToken) {
  if (nameToken === undefined) {
    return undefined
  }

  if (nameToken.length) {
    nameToken = nameToken[0]
  }

  return {
    kind: "Name",
    value: nameToken.image,
    loc: "TBD"
  }
}

function visitToken(tokCst, kind) {
  if (tokCst === undefined) {
    return undefined
  }

  return {
    kind: kind,
    value: tokCst[0].image,
    loc: "TBD"
  }
}
