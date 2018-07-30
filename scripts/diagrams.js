const path = require("path")
const fs = require("fs")
const chevrotain = require("chevrotain")
const { GraphQLParser } = require("../lib/parser")

// extract the serialized grammar.
const parserInstance = new GraphQLParser()
const serializedGrammar = parserInstance.getSerializedGastProductions()

// create the HTML Text
const htmlText = chevrotain.createSyntaxDiagramsCode(serializedGrammar)

// Write the HTML file to disk
const outPath = path.resolve(__dirname, "../diagrams.html")
fs.writeFileSync(outPath, htmlText)
