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
      // TODO: implement LOC
      loc: "oops"
    }
  }

  Definition(ctx) {
    if (ctx.ExecutableDefinition) {
      return this.visit(context.ExecutableDefinition)
    } else if (ctx.TypeSystemDefinition) {
      return this.visit(context.TypeSystemDefinition)
    } else if (ctx.TypeSystemExtension) {
      return this.visit(context.TypeSystemExtension)
    } else {
      throw "None Exhaustive Match"
    }
  }

  ExecutableDefinition(ctx) {
    if (ctx.ExecutableDefinition) {
      return this.visit(context.OperationDefinition)
    } else if (ctx.TypeSystemDefinition) {
      return this.visit(context.FragmentDefinition)
    } else {
      throw "None Exhaustive Match"
    }
  }

  OperationDefinition(ctx) {
    if (ctx.$ImplicitQueryOperationDefinition) {
      return this.visit(context.$ImplicitQueryOperationDefinition)
    } else if (ctx.$ExplicitOperationDefinition) {
      return this.visit(context.$ExplicitOperationDefinition)
    } else {
      throw "None Exhaustive Match"
    }
  }

  OperationDefinition$ImplicitQueryOperationDefinition(ctx) {}

  OperationDefinition$ExplicitOperationDefinition(ctx) {}

  OperationType(ctx) {}

  SelectionSet(ctx) {}

  Selection(ctx) {}

  Field(ctx) {}

  Alias(ctx) {}

  Arguments(ctx) {}

  Argument(ctx) {}

  FragmentSpread(ctx) {}

  InlineFragment(ctx) {}

  FragmentDefinition(ctx) {}

  FragmentName(ctx) {}

  TypeCondition(ctx) {}

  Value(ctx) {}

  BooleanValue(ctx) {}

  NullValue(ctx) {}

  EnumValue(ctx) {}

  ListValue(ctx) {}

  ObjectValue(ctx) {}

  ObjectField(ctx) {}

  VariableDefinitions(ctx) {}

  VariableDefinition(ctx) {}

  Variable(ctx) {}

  DefaultValue(ctx) {}

  Type(ctx) {}

  NamedType(ctx) {}

  ListType(ctx) {}

  Directives(ctx) {}

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
