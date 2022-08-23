// Cleanup up SpecEd Students for the XML file.
// Created By: Tim Dowling

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length != 3){
  console.log('File Location, xml file name, ps report file arguments are missing.  ie. c:\\onsis\\ mnps.xml ps.csv')
  process.exit(0)
}

// Required Files
const xmljs = require('xml-js')
const fs = require('fs')
const pdf = require('pdf-creator-node')

// Where the file is located and filename.
const fileLoc = arg[0]
const xml_file_name = arg[1]
const ps_file_name = arg[2]
const xml_filePath = fileLoc + xml_file_name
const xml_backup = fileLoc + xml_file_name.slice(0, -4) + '_og.xml'
const ps_filePath = fileLoc + ps_file_name

// Save the original copy of the XML file
fs.copyFileSync(xml_filePath, xml_backup)

// Read the data from both files
const xml_data = fs.readFileSync(xml_filePath)
const ps_data = fs.readFileSync(ps_filePath, 'utf-8')

// Convert the XML file to JSON for easier access
const xmlData = xmljs.xml2json(xml_data, {compact: true,spaces: 2})
const jsonData = JSON.parse(xmlData)

// Grab all the classes, students and educators
const students = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT

// Counters
var speced_counter = 0
var ps_report_counter = 0
var xml_only_counter = 0
var xml_fixed_counter = 0
var ps_only_counter = 0
var ps_fixed_counter = 0

const exceptions = {
    1: 'Behaviour',
    2: 'Autism',
    3: 'Deaf',
    5: 'Learning Disability',
    6: 'Speach Impairment',
    7: 'Lang Impairment',
    8: 'Giftedness',
    9: 'Mild Intel Diaability',
    10: 'Dev Diability',
    11: 'Physical Disability',
    12: 'Blind',
    13: 'Blind/Deaf',
    14: 'Multi',
    15: 'Deaf/Preschool',
}

const dates = {
    'JAN': '01',
    'FEB': '02',
    'MAR': '03',
    'APR': '04',
    'MAY': '05',
    'JUN': '06',
    'JUL': '07',
    'AUG': '08',
    'SEP': '09',
    'OCT': '10',
    'NOV': '11',
    'DEC': '12',
}

// Cycle through all the students and collect spec ed students
const xml_students = new Set()
for (var s in students) {
    if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION){
        speced_counter++
        xml_students.add(students[s].OEN._text)
    }
}

// Cycle through the PS report and collect students
const ps_students = new Set()
const ps_rows = ps_data.split('\n')
for (var row in ps_rows){
    ps_rows[row] = ps_rows[row].split(',')
    if (ps_rows[row][1]){
        ps_rows[row][1] = ps_rows[row][1].replaceAll('\'', '').replaceAll('"', '')
        if (ps_rows[row][1] != 'OEN'){
            ps_report_counter++
            ps_students.add(ps_rows[row][1])
        }
    }
}

// Compare the two lists
xml_students.forEach((s)=>{
    if (ps_students.has(s)){
        xml_students.delete(s)
        ps_students.delete(s)
    }
})

xml_only_counter = xml_students.size
ps_only_counter = ps_students.size


// Display Differents and clean up data
for (var s of xml_students){
    console.log('This student only in XML: ' + s)
    for (var i in students){
        if (s === students[i].OEN._text){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[i].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION_FLAG._text = 'F'
            delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[i].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION
            xml_fixed_counter++
            console.log('\x1b[31m%s\x1b[0m', 'Removed from XML')
            break
        }
    }
}
for (var s of ps_students){
    console.log('This student only in PS Report: ' + s)
    for (var i in students){
        if (s === students[i].OEN._text){
            for (var x of ps_rows){
                if (x[1] === s) {
                    var iep = x[7].replaceAll('"', '')
                    if (iep === 'X') {
                        iep = 'T'
                    }else {
                        iep = 'F'
                    }
                    const placement = x[8].replaceAll('"', '')
                    var nonind_flag = 'F'
                    var exception = x[10].replaceAll('"', '')
                    if (exception != '' && exception != 'Non-Identified'){
                        exception = Object.keys(exceptions).find(key => exceptions[key] === exception)
                    }else {
                        nonind_flag = 'T'
                    }
                    var main = x[11].replaceAll('"', '')
                    if (main === 'X') {
                        main = 'T'
                    }else {
                        main = 'F'
                    }

                    var iprc_flag = x[17].replaceAll('"', '')
                    if (iprc_flag === 'X') {
                        iprc_flag = 'T'
                    }else {
                        iprc_flag = 'F'
                    }

                    var iprc_date = x[18].replaceAll('"', '')
                    if (iprc_date != '' && iprc_date != '-'){
                        iprc_date = iprc_date.split('-')
                        if (parseInt(iprc_date[0]) < 10) {
                            iprc_date[0] = '0' + iprc_date[0]
                        }
                        iprc_date = '20' + iprc_date[2] + '/' + dates[ iprc_date[1].toUpperCase() ] + '/' + iprc_date[0]
                    }
                    else {
                        iprc_date = ''
                    }

                    const se = {
                        'ACTION': {
                            '_text': 'ADD',
                        },
                        'EXCEPTIONALITY_TYPE': {
                            '_text': exception,
                        },
                        'SPECIAL_EDU_PLMNT_TYPE': {
                            '_text': placement.slice(0, -1),
                        },
                        'NON_IDENTIFIED_STUDENT_FLAG': {
                            '_text': nonind_flag,
                        },
                        'MAIN_EXCEPTIONALITY_FLAG': {
                            '_text': main,
                        },
                        'IPRC_REVIEW_DATE': {
                            '_text': iprc_date,
                        },
                        'IPRC_STUDENT_FLAG': {
                            '_text': iprc_flag,
                        },
                        'INDIVIDUAL_EDUCATION_PLAN_FLAG': {
                            '_text': iep,
                        }
                    }

                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[i].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION = se

                    if (jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[i].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION_FLAG){
                        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[i].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION_FLAG._text = 'T'
                    }
                    else {
                        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[i].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION_FLAG = { '_text': 'T' }
                    }
                    console.log('\x1b[33m%s\x1b[0m', 'Added to XML')
                }
            }
            ps_fixed_counter++
        }
    }
}


// Display Totals
console.log("Total Special Education Students: " + speced_counter)
console.log("Total Special Education PS Report Students: " + ps_report_counter)
console.log('Total students only in XML: ' + xml_only_counter)
console.log('Total students only in PS Reports: ' + ps_only_counter)
console.log('Total students fixed in XML: ' + xml_fixed_counter)
console.log('Total students fixed in PS Reports: ' + ps_fixed_counter)

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