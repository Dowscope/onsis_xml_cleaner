// Fix Report Card Entries - Elementary Schools Only
// Created By: Tim Dowling

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length != 3){
  console.log('File Location, Main XML File, New XML File arguments are missing.  ie. c:\onsis\ old.xml new.xml')
  process.exit(0)
}

const dirLoc = arg[0]
const oldXMLFile = dirLoc + arg[1]
const newXMLFile = dirLoc + arg[2]

// Required Files
const xmljs = require('xml-js')
const fs = require('fs')

const xml_backup = oldXMLFile.slice(0, -4) + '_og.xml'

// Save the original copy of the XML file
fs.copyFileSync(oldXMLFile, xml_backup)

const oldXMLData = fs.readFileSync(oldXMLFile, 'utf-8')
const newXMLData = fs.readFileSync(newXMLFile, 'utf-8')

// Convert the XML file to JSON for easier access
const oldXML = xmljs.xml2json(oldXMLData, {compact: true,spaces: 2})
const newXML = xmljs.xml2json(newXMLData, {compact: true,spaces: 2})
const oldJSONData = JSON.parse(oldXML)
const newJSONData = JSON.parse(newXML)

// Get students from both files.
const old_students = oldJSONData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT
const new_students = newJSONData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT

const total_old = old_students.length
const total_new = new_students.length

var changed = 0

// Now we will loop through all the students of the old file
// and add the entries from the new file.
for (var old_s in old_students){
  // get the OEN
  const old_oen = old_students[old_s].OEN._text
  for (var new_s in new_students){
    if (new_students[new_s].OEN._text === old_oen){
      oldJSONData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[old_s].STUDENT_SCHOOL_ENROLMENT.REPORT_CARD = new_students[new_s].STUDENT_SCHOOL_ENROLMENT.REPORT_CARD
      changed += 1
    }
  }
}

// Change the XML to prevent changes to other data
oldJSONData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_SCHOOL_EDUCATOR_ASSIGNMENT._text = 'N'
oldJSONData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_STUDENT_SCHOOL_ENROLMENT._text = 'N'
oldJSONData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_CLASS._text = 'N'
oldJSONData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_ASSIGNED_SUBJECT._text = 'N'

console.log("Total amount of students in the old file: " + total_old)
console.log("Total amount of students in the new file: " + total_new)
console.log("Total amount of students updated: " + changed)

// Convert the JSON to a string 
const jsonStr = JSON.stringify(oldJSONData)

// Convert the JSON back to XML
const xmlData2 = xmljs.json2xml(jsonStr, {compact: true,spaces: 2})

// Create the file and save.
fs.writeFile(oldXMLFile, xmlData2, 'utf-8', (err) => {
  if(err){
    console.log('NOT SUCCESSFUL: ERROR - ' + err)
    return
  }
  console.log('XML Successful! ')
})