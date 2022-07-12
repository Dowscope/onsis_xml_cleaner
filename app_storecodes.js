// OnSIS Store Codes Changer
// Author: Timothy Dowling
// Last Modified: July 12, 2022
// Description: Will take a powerschool export file and update the store codes


// Get command line arguments
const arg = process.argv.slice(2)

// Check if both arhuments have been added
if (arg.length != 2){
  console.log('File Path, School Code.  ie. c:\\onsis\\ ALGO')
  console.log('Make sure the file name is this format: standard_grade_section_export_<SCHOOLCODE>.csv')
  process.exit(0)
}

const directory_path = arg[0]
const ps_extract = directory_path + 'standard_grade_section_export_' + arg[1] + '.csv'
const school_code = arg[1].toUpperCase()

// Set to the existing term storecodes in PoerSchool
const termone_code = 'I1'
const termtwo_code = 'F1'

// Output Filename
const output_file = directory_path + school_code + '_storecodes_import.csv'

const fs = require('fs')

// Read and format CSV file
const ps_data = fs.readFileSync(ps_extract, 'utf-8')
const ps_rows = ps_data.split('\r')

var count = 0
var termone_count = 0
var termtwo_count = 0

// Results container to be populated with the changes
const results = []

// Loop through every row
for (row in ps_rows) {

    // The first row is the header row.  Change to zero if there is no header
    if (row < 1){
        results.push(ps_rows[row].split(',').splice(0,7))
        continue
    }

    // Split the columns into array 
    const columns = ps_rows[row].split(',')

    // Go through each row looking for the matching existing storecode
    // Add to the results container
    if (columns[4] == termone_code){
        columns[4] = 'R1'
        termone_count += 1
        count += 1
        results.push(columns.splice(0,7))
    }
    else if (columns[4] == termtwo_code){
        columns[4] = 'R2'
        termtwo_count += 1
        count += 1
        results.push(columns.splice(0,7))      
    }
}

// Display the results
console.log('The number is Term One changed ' + termone_code + ': ' + termone_count)
console.log('The number is Term Two changed ' + termtwo_code + ': ' + termtwo_count)
console.log('The number is rows changed: ' + count)

// Initialize the output string for the output file.
var output = ''

// Loop through the results and concat the output string
for (row in results) {
    output += results[row].join(',')+'\r';
}

// Open file for writing and write output string.
fs.writeFileSync(output_file, output, (err) => {
    if (err) {
        console.log(err)
    }

    console.log('Successful')
})