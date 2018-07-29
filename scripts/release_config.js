"use strict"

const fs = require("fs")
const jf = require("jsonfile")
const path = require("path")
const _ = require("lodash")

const packagePath = path.join(__dirname, "../package.json")
const changeLogPath = path.join(__dirname, "../CHANGELOG.md")
const apiPath = path.join(__dirname, "../lib/api.js")

const pkgJson = jf.readFileSync(packagePath)
const changeLogString = fs.readFileSync(changeLogPath, "utf8").toString()

let mode
if (_.includes(process.argv, "patch")) {
  mode = "patch"
} else if (_.includes(process.argv, "minor")) {
  mode = "minor"
} else if (_.includes(process.argv, "major")) {
  mode = "major"
} else {
  console.log("release mode (patch|minor|major) not provided")
  process.exit(-1)
}

module.exports = {
  apiPath: apiPath,
  packagePath,
  changeLogPath,
  pkgJson,
  changeLogString,
  currVersion: pkgJson.version,
  mode,
  tagPrefix: "v"
}
