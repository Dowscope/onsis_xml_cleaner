          
// OnSIS FSL Update
// Will compare the OnSIS XML file, with Database CSV of FSL students.

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length != 3){
  console.log('File Path, OnSIS XML FileName, Database CSV FileName.  ie. c:\\onsis\\ algo_on.xml algo_fsl.csv')
  process.exit(0)
}

// Required Files
const xmljs = require('xml-js')
const fs = require('fs')

// Where the file is located and filename.
const fileLoc = arg[0]
const xml_file_name = arg[1]
const ps_file_name = arg[2]
const xml_filePath = fileLoc + xml_file_name
const ps_filePath = fileLoc + ps_file_name

// Read the data from both files
const xml_data = fs.readFileSync(xml_filePath)
const ps_data = fs.readFileSync(ps_filePath, 'utf-8')

// Convert the XML file to JSON for easier access
const xmlData = xmljs.xml2json(xml_data, {compact: true,spaces: 2})
const jsonData = JSON.parse(xmlData)

// Grab all the students
const students = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT

// Get the fsl students from the csv
const fsl_students = ps_data.split('\r\n').splice(1)
for (var fsl_s in fsl_students){
    fsl_students[fsl_s] = fsl_students[fsl_s].split(',')
}

// Counters
var fsl_student_counter = 0

// Cycle through the students and correct the FSL
for (var s in students){
  for (var fsl_s of fsl_students){
    if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == fsl_s[0]) {
      var fsl_type = '021'
      if (fsl_s[3] == '2032'){
        fsl_type = '001'
      }
      const record = {
        'ACTION': {
          '_text': 'ADD',
        },
        'TYPE': {
          '_text': '001',
        },
        'MINUTES_PER_DAY_OF_INSTRUCTION': {
          '_text': '040.00',
        },
      }
      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.push(record)
      fsl_student_counter++
    }
  }
}

console.log('Total language programs added: ' + fsl_student_counter)

// Convert the JSON to a string 
jsonStr = JSON.stringify(jsonData)

// Convert the JSON back to XML
const xmlData2 = xmljs.json2xml(jsonStr, {compact: true,spaces: 2})
var outputFile = xml_filePath

// Create the file and save.
fs.writeFile(outputFile, xmlData2, 'utf-8', (err) => {
    if(err){
        console.log('NOT SUCCESSFUL: ERROR - ' + err)
        return
    }
    console.log('File Saved: ' + outputFile)
})
