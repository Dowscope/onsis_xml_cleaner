// OnSIS compare
// Will compare the OnSIS student extract file, with PowerSchool Extract.

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length > 5){
  console.log('File Path, OnSIS Extract FileName, PS Extract FileName.  ie. c:\\onsis\\ algo_se algo_ps')
  process.exit(0)
}

const directory_path = arg[0]
const onsis_extract = directory_path + arg[1]
const ps_extract = directory_path + arg[2]

const csv = require('csv-parser')
const csvstr = require('csv')
const fs = require('fs')

const onsis_data = fs.readFileSync(onsis_extract, 'utf-8')
const ps_data = fs.readFileSync(ps_extract, 'utf-8')

const onsis_rows = onsis_data.split('\r\n')
const ps_rows = ps_data.split('\n')

const onsis_students = []
const ps_students = []

for (var row in onsis_rows){
    if (row < 3) continue
    const columns = onsis_rows[row].split(',')
    if (columns[1]) {
        columns[8] = columns[8].replaceAll('"','')
        columns[16] = parseInt(columns[16].replaceAll('"', ''))
        // check for exited students
        if (!columns[16]){
            onsis_students.push([columns[1], columns[8]])
        }
    }
}

for (var row in ps_rows) {
    if (row < 1) continue
    const columns = ps_rows[row].split(',')
    if (columns[3]) {
        columns[4] = columns[4].replaceAll('"','')
        columns[3] = columns[3].replaceAll('"','')
        ps_students.push([columns[4], columns[3]])
    }
}


if (onsis_students.length > ps_students.length) {
    for (s_on of onsis_students) {
        var match = false
        var count = 0
        while (!match && count < ps_students.length) {
            if (s_on[0] == ps_students[count][0]){
                match = true
            }
            count++
        }

        if (!match) {
            console.log('Non Matching Student: ' + s_on[0] + ' Grade: ' + s_on[1])
        }
    }
}
else if (ps_students.length > onsis_students.length) {
    for (s_on of ps_students) {
        var match = false
        var count = 0
        while (!match && count < onsis_students.length) {
            if (s_on[0] == onsis_students[count][0]){
                match = true
            }
            count++
        }

        if (!match) {
            console.log('Non Matching Student: ' + s_on[0] + ' Grade: ' + s_on[1])
        }
    }
}


console.log('Total OnSIS Enrolments: ' + onsis_students.length)
console.log('Total PowerSchool Enrolments: ' + ps_students.length)