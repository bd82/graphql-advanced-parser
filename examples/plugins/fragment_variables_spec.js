const { expect } = require("chai")
const { parse } = require("./fragment_variables")

describe("The plugin system of graphql-advanced-parser", () => {
  context("experimental fragment variable support", () => {
    it("works without variables", () => {
      const input = `
      fragment frag on Friend {
        foo
      }
      `
      const parseResult = parse(input)
      expect(parseResult.lexErrors).to.be.empty
      expect(parseResult.parseErrors).to.be.empty

      // traverse CST
      const fragmentCst =
        parseResult.cst.children.Definition["0"].children.ExecutableDefinition[
          "0"
        ].children.FragmentDefinition["0"]

      expect(fragmentCst.children).to.have.property("Fragment")
      expect(fragmentCst.children).to.have.property("FragmentName")
      expect(fragmentCst.children).to.have.property("SelectionSet")
      expect(fragmentCst.children).to.have.property("TypeCondition")
      expect(fragmentCst.children).to.not.have.property("VariableDefinitions")
    })

    it("works with variables", () => {
      const input = `
      fragment frag ($x : string) on Friend {
        foo
      }
      `
      const parseResult = parse(input)
      expect(parseResult.lexErrors).to.be.empty
      expect(parseResult.parseErrors).to.be.empty

      // traverse CST
      const fragmentCst =
        parseResult.cst.children.Definition["0"].children.ExecutableDefinition[
          "0"
        ].children.FragmentDefinition["0"]

      expect(fragmentCst.children).to.have.property("Fragment")
      expect(fragmentCst.children).to.have.property("FragmentName")
      expect(fragmentCst.children).to.have.property("SelectionSet")
      expect(fragmentCst.children).to.have.property("TypeCondition")
      expect(fragmentCst.children).to.have.property("VariableDefinitions")
    })
  })
})
