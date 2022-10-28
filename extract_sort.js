// OnSIS Extract Sorter
// Created By: Tim Dowling

// To help speed up the way the extracts files are downloaded for PowerSchool.

// Get command line arguments
const arg = process.argv.slice(2)

// Check if the correct amount of arguments is given.
if (arg.length == 0){
  console.log('Path to directory not included')
  process.exit(0)
}

// Set common variables
const dir_path = arg[0]

// Import libraies
const fs = require('fs')
const csv = require('csvtojson')

// Read file contents of the directory given.
const files = fs.readdirSync(dir_path)

// function to create new school file
function createSchoolFile(rowArray = [], bsid, sname, filepath, filename){
    let output = ''
    let record_count = 0
    for (t in rowArray) {
        output += rowArray[t]
        output += '\r\n'
        record_count += 1
    }
    if (record_count < 3) return

    const output_path = filepath + '\\' + bsid
    if (!fs.existsSync(output_path)){
        fs.mkdirSync(output_path)
    }

    const output_file = output_path + '\\' + filename + '.csv'
    
    fs.writeFile(output_file, output, (err) => {
        if (err) {
            console.log(err)
            return
        }
    
        console.log(sname + ' - ' + bsid + '| File: ' + filename + ' - ' + record_count + ' successfully added.')
    })
}

// Loop through each file and begind the sorting.
for (f in files){
    if (f >= 0){
        const filePath = dir_path + '\\' + files[f]
        const filename = files[f].split('.')
        
        // Read file
        const file = fs.readFileSync(filePath, 'utf-8')
        var rows = file.split('\r\n')

        results = []
        tmpSchool = []
        headerRow = ''
        school_bsid = ''
        school_name = ''

        for (r in rows){
            var cleanRows = rows[r].replaceAll('"', '')
            var row = cleanRows.split(',')

            if (row[0].trim() == 'H1'){
                tmpSchool.push(rows[r])
                headerRow = rows[r]
            }
            else if (row[0] == 'H2'){
                if (tmpSchool.length > 1){
                    createSchoolFile(tmpSchool, school_bsid, school_name, dir_path, filename[0])
                }
                tmpSchool = []
                tmpSchool.push(headerRow)
                tmpSchool.push(rows[r])
                school_bsid = row[1]
                school_name = row[2]
            }
            else if (row[0] == 'DT'){
                tmpSchool.push(rows[r])
            }

            if (r == rows.length - 1){
                createSchoolFile(tmpSchool, school_bsid, school_name, dir_path, filename[0])
            }
        }
    }
}
