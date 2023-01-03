// OnSIS compare 2
// Will compare the Powerschool REG file, with Onsis Extract.  You will need to convert the pdf to a 
// csv file.

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length!= 3){
  console.log('File Path, OnSIS Extract FileName, PS Extract FileName.  ie. c:\\onsis\\ algo_se.csv algo_ps.csv')
  process.exit(0)
}

const directory_path = arg[0]
const onsis_extract = directory_path + arg[1]
const ps_extract = directory_path + arg[2]

const fs = require('fs')

const onsis_data = fs.readFileSync(onsis_extract, 'utf-8')
const ps_data = fs.readFileSync(ps_extract, 'utf-8')

const onsis_rows = onsis_data.split('\r\n')
const ps_rows = ps_data.split('\r\n')

const onsis_students = []
const ps_students = []

var onsis_og_count = 0
var ps_og_count = 0


// Collect all the student reported in OnSIS Extract
for (var row in onsis_rows){
    const columns = onsis_rows[row].split(',')
    if (columns[0] == '"DT"') {
        columns[8] = parseInt(columns[8].replaceAll('"',''))
        columns[9] = columns[9].replaceAll('"','')
        columns[16] = columns[16].replaceAll('"', '').replaceAll(' ','')
        columns[10] = columns[10].replaceAll('"', '').replaceAll(' ','')
        columns[28] = columns[28].replaceAll('"', '').replaceAll(' ','')
        // check for exited students
        if (columns[16] == '' && columns[10] == 'FT'){
            onsis_students.push([columns[28], columns[8]])
        }
    }
}
onsis_og_count = onsis_students.length

// Collect all the students reported in PowerSchool Report
for (var row in ps_rows) {
    const columns = ps_rows[row].split(',')
    if (columns[0]) {
        columns[0] = columns[0].replaceAll('"','')
        
        if (parseInt(columns[1])>0){
            ps_students.push([columns[0], 0])
        }
    }
}
ps_og_count = ps_students.length

// Remove all the matches
for(var x=0;x<onsis_students.length;x++){
    for(var y=0;y<ps_students.length;y++){
        if (onsis_students[x][0]==ps_students[y][0]){
            ps_students.splice(y,1);
            onsis_students.splice(x,1);
            x--;
            break;
        }
    }
}

// Display all the non-matching onsis students
for(var x=0;x<onsis_students.length;x++){
    console.log('Non Matching Student from Onsis: ' + onsis_students[x][0] + ' Grade: ' + onsis_students[x][1]);
}

// Display all the non-matching powerschool students
for(var y=0;y<ps_students.length;y++){
    console.log('Non Matching Student from Powerschool: ' + ps_students[y][0] + ' Grade: ' + ps_students[y][1]);
}

// Display the total students from both reports
console.log('Total OnSIS Enrolments: ' + onsis_og_count)
console.log('Total PowerSchool Enrolments: ' + ps_og_count)