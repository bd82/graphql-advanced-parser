const { expect } = require("chai")
const { parse } = require("graphql-advanced-parser")

describe("The capability of the graphql-advanced-parser to report errors", () => {
  it("can report a single error", () => {
    const input = `
    # missing comma in the arguments array
    query queryName($foo ComplexType, $site: Site = MOBILE) {
      whoever123is: node(id: [123, 456]) { 
        id
      }  
    }`
    const parseResult = parse(input)
    expect(parseResult.lexErrors).to.be.empty
    expect(parseResult.parseErrors).to.have.lengthOf(1)
    expect(parseResult.parseErrors[0].message).to.equal(
      "Expecting token of type --> Colon <-- but found --> 'ComplexType' <--"
    )
  })

  it("can report multiple errors", () => {
    const input = `
    # missing comma in the arguments array
    query queryName($foo ComplexType, $site: Site = MOBILE) {
      whoever123is: node(id: [123, 456]) { 
        id
      # missing closing "}"
      # reporting this error is only because we managed to keep parsing and "ignore" the previous error.    
    }`
    const parseResult = parse(input)
    expect(parseResult.lexErrors).to.be.empty
    expect(parseResult.parseErrors).to.have.lengthOf(2)
    expect(parseResult.parseErrors[0].message).to.equal(
      "Expecting token of type --> Colon <-- but found --> 'ComplexType' <--"
    )
    expect(parseResult.parseErrors[1].message).to.equal(
      "Expecting token of type --> RCurly <-- but found --> '' <--"
    )
  })
})
