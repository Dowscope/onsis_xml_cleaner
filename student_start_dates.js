// OnSIS compare
// Will compare the OnSIS student extract file, with PowerSchool Extract.

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length > 5){
  console.log('File Path, OnSIS Extract FileName, student numbers FileName.  ie. c:\\onsis\\ algo_on.csv algo_xml.csv')
  process.exit(0)
}

const directory_path = arg[0]
const onsis_extract = directory_path + arg[1]
const ps_extract = directory_path + arg[2]

const fs = require('fs')

const onsis_data = fs.readFileSync(onsis_extract, 'utf-8')
const ps_data = fs.readFileSync(ps_extract, 'utf-8')

const onsis_rows = onsis_data.split('\r\n')
const ps_rows = ps_data.split('\n')

const onsis_students = []
const ps_students = []

var onsis_og_count = 0
var ps_og_count = 0

const output_file = directory_path + 'results.csv'


// Collect all the student reported in OnSIS Extract
for (var row in onsis_rows){
    const columns = onsis_rows[row].split(',')
    if (columns[0] == '"DT"') {
        columns[28] = columns[28].replaceAll('"','')                      // Student Numbers
        columns[36] = columns[36].replaceAll('"', '').replaceAll(' ','')  // Start Date
        
        onsis_students.push([columns[28], columns[36]])
    }
}
onsis_og_count = onsis_students.length

// Collect all the students reported in student csv
for (var row in ps_rows) {
    const columns = ps_rows[row].split(',')
    columns[0] = columns[0].replaceAll('"','')
    ps_students.push(columns[0])
}
ps_og_count = ps_students.length

const results = []

// Remove all the matches
for(var x=0;x<onsis_students.length;x++){
    for(var y=0;y<ps_students.length;y++){
        if (parseInt(onsis_students[x][0])==ps_students[y]){
            results.push([onsis_students[x][0], onsis_students[x][1]])
            break;
        }
    }
}

// Display the total students from both reports
console.log('Total OnSIS Enrolments: ' + onsis_og_count)
console.log('Total Student Errors: ' + ps_og_count)

// Generate the output string
var output = ''

for (row in results) {
  for (c in results[row]) {
      output += results[row][c] + ','
  }
  output += '\r\n'
}

// Write the results to a file
fs.writeFileSync(output_file, output, (err) => {
  if (err) {
      console.log(err)
  }

  console.log('Successful')
})