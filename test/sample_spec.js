const { expect } = require("chai")
const { resolve } = require("path")
const fs = require("fs")
const { parse } = require("../lib/parser")

describe("The GraphQl advanced Parser", () => {
  describe("Can successfully parse the official Samples", () => {
    it("works for kitchen sink sample", () => {
      const samplePath = resolve(__dirname, "./samples/kitchen-sink.graphql")
      const sampleText = fs.readFileSync(samplePath, "utf8")
      const parseResult = parse(sampleText)
      expect(parseResult.lexErrors).to.be.empty
      expect(parseResult.parseErrors).to.be.empty
    })

    it("works for schema kitchen sink sample", () => {
      const samplePath = resolve(
        __dirname,
        "./samples/schema-kitchen-sink.graphql"
      )
      const sampleText = fs.readFileSync(samplePath, "utf8")
      const parseResult = parse(sampleText)
      expect(parseResult.lexErrors).to.be.empty
      expect(parseResult.parseErrors).to.be.empty
    })
  })
})
