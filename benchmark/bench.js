"use strict"

const _ = require("lodash")
const Benchmark = require("benchmark")
const fs = require("fs")
const path = require("path")
const { parse: graphQLParse } = require("graphql/language/parser")
const { parse: chevParse } = require("../lib/parser")

const { buildAst } = require("../lib/ast")

const sample1 = fs
  .readFileSync(
    path.join(__dirname, "../test/samples/kitchen-sink.graphql"),
    "utf8"
  )
  .toString()

// This sample fails on the graphql-js parser...
// Which is strange because it came from it's repo.
const sample2 = fs
  .readFileSync(
    path.join(__dirname, "../test/samples/schema-kitchen-sink.graphql"),
    "utf8"
  )
  .toString()

let thousandLineSample = ""

// 16 x 65 === 1040 lines
_.forEach(_.range(0, 16), () => {
  thousandLineSample += sample1
})

function newSuite(name) {
  return new Benchmark.Suite(name, {
    onStart: () => console.log(`\n\n${name}`),
    onCycle: event => console.log(String(event.target)),
    onComplete: function() {
      console.log("Fastest is " + this.filter("fastest").map("name"))
    }
  })
}

newSuite("GraphQL Parser Benchmark")
  .add("grahql-js - AST output", () => graphQLParse(thousandLineSample))
  .add("Chevrotain - CST output", () => {
    const parseResult = chevParse(thousandLineSample)
    if (parseResult.lexErrors.length > 0) {
      throw "Oops"
    }
    if (parseResult.parseErrors.length > 0) {
      throw "Oops"
    }

    const ast = buildAst(parseResult.cst)
  })
  .run({
    async: false
  })
