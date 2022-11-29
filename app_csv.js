// REA Submission CSV Cleaner

// Get command line arguments
const arg = process.argv.slice(2)

// Check if both arhuments have been added
if (arg.length != 4){
  console.log('File Path, Submission Year, Submission Month, FileName ie. c:\\onsis 20212022 MAR filename.csv')
  process.exit(0)
}

const csv = require('csv-parser')
const csvstr = require('csv')
const fs = require('fs')

const rea_period = arg[2].toUpperCase()
const rea_year = arg[1]

const file_dir = arg[0] + '\\'
const file_name = arg[3]
const file_path = file_dir + file_name

const output_file = file_dir + rea_year + '_REA_' + rea_period + '_Submission.csv'

var data = fs.readFileSync(file_path, 'utf-8')

var rows = data.split('\r\n')

var results = []

for (r in rows){
    if (r > 9){
        var columns = rows[r].split(',')
        if (columns[1]){
            columns[1] = columns[1].replaceAll(' ', '').replaceAll('"', '').trim()
            if (columns[1].length < 9){
                columns[1] = '0' + columns[1]
            }
        }

        if (columns[2]){
            columns[2] = columns[2].replaceAll(' ', '').replaceAll('"', '').trim()
            columns[2] = columns[2].toUpperCase()
        }

        if (columns[3]){
            columns[3] = columns[3].replaceAll(' ', '').replaceAll('"', '').trim()
            columns[3] = columns[3].toUpperCase()
        }

        if (columns[4]){
            var dob = columns[4].split('-')
            var mm = dob[1]
            var dd = dob[2]
            var yy = dob[0]
            
            // if (dd < 10) {
            //     dd = '0' + dd
            // }
            // if (mm < 10) {
            //     mm = '0' + mm
            // }
            columns[4] = yy + '/' + mm + '/' + dd
        }

        if (columns[9]){
            var dob = columns[9].split('-')
            var mm = dob[1]
            var dd = dob[2]
            var yy = dob[0]
            
            // if (dd < 10) {
            //     dd = '0' + dd
            // }
            // if (mm < 10) {
            //     mm = '0' + mm
            // }
            columns[9] = yy + '/' + mm + '/' + dd
        }

        rows[r] = columns
    }
    results.push(rows[r])
}


var output = ''

for (row in results) {
    if (row > 9){
        for (c in results[row]) {
            output += results[row][c] + ','
        }
    }
    else {
        output += results[row]
    }
    output += '\r\n'
}

fs.writeFileSync(output_file, output, (err) => {
    if (err) {
        console.log(err)
    }

    console.log('Successful')
})
