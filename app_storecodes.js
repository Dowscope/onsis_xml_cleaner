// OnSIS Store Codes Changer
// Will take a powerschool export file and update the store codes

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length > 4){
  console.log('File Path, PS Extract FileName, School Code.  ie. c:\\onsis\\ algo_se.csv ALGO')
  process.exit(0)
}

const directory_path = arg[0]
const ps_extract = directory_path + arg[1]
const school_code = arg[2].toUpperCase()

const termone_code = 'I1'
const termtwo_code = 'F1'

const output_file = directory_path + school_code + '_storecodes_import.csv'

const fs = require('fs')

const ps_data = fs.readFileSync(ps_extract, 'utf-8')
const ps_rows = ps_data.split('\r')

var count = 0
var termone_count = 0
var termtwo_count = 0

const results = []

for (row in ps_rows) {
    if (row < 1){
        results.push(ps_rows[row].split(','))
        continue
    }
    const columns = ps_rows[row].split(',')
    if (columns[4] == termone_code){
        columns[4] = 'R1'
        termone_count += 1
        count += 1
        results.push(columns)
    }
    else if (columns[4] == termtwo_code){
        columns[4] = 'R2'
        termtwo_count += 1
        count += 1
        results.push(columns)      
    }
}


console.log('The number is Term One changed ' + termone_code + ': ' + termone_count)
console.log('The number is Term Two changed ' + termtwo_code + ': ' + termtwo_count)
console.log('The number is rows changed: ' + count)

var output = ''

for (row in results) {
    for (c in results[row]) {
        output += results[row][c] + ','
    }
    output += '\r'
}

fs.writeFileSync(output_file, output, (err) => {
    if (err) {
        console.log(err)
    }

    console.log('Successful')
})