// OnSIS Extract #3 Fix
// Created By: Tim Dowling

// Onsis has changed and this is the fix.

// Get command line arguments
const arg = process.argv.slice(2)

// Check if the correct amount of arguments is given.
if (arg.length == 0) {
  console.log('Path to directory not included')
  process.exit(0)
}

// Set common variables
const dir_path = arg[0]

// Import libraies
const fs = require('fs')
const csv = require('csvtojson')

// function to create new school file
function createSchoolFile(rowArray = [], bsid, sname, filepath, filename) {
  let output = ''
  let record_count = 0
  for (t in rowArray) {
    output += rowArray[t]
    output += '\r\n'
    record_count += 1
  }
  if (record_count < 3) return

  const output_path = filepath
  if (!fs.existsSync(output_path)) {
    fs.mkdirSync(output_path)
  }

  const output_file = output_path + '\\' + filename + '.csv'

  fs.writeFile(output_file, output, (err) => {
    if (err) {
      console.log(err)
      return
    }
    console.log(output_file)
    console.log(sname + ' - ' + bsid + ' | File: ' + filename + ' - ' + record_count + ' successfully added.')
  })
}

function readDirectory(path) {
  // Read file contents of the directory given.
  const files = fs.readdirSync(path)

  // Loop through each file and begin the sorting.
  for (f in files) {
    if (f >= 0) {
      const filePath = path + '\\' + files[f]
      if ( fs.lstatSync(filePath).isDirectory()){
        readDirectory(filePath)
        continue
      }

      const filename = files[f].split('.')

      if (filename[0].slice(-1) == '3') {

        // Read file
        const file = fs.readFileSync(filePath, 'utf-8')
        var rows = file.split('\r\n')

        results = []
        tmpSchool = []
        headerRow = ''
        school_bsid = ''
        school_name = ''

        for (r in rows) {
          var rowSplit = rows[r].split(',')
          if (r != 0 && r != 1) {
            rowSplit.pop()
          }
          var newRow = rowSplit.join()
          var cleanRows = newRow.replaceAll('"', '')
          var row = cleanRows.split(',')

          switch (row[0].trim()) {
            case 'H1':
              tmpSchool.push(newRow)
              headerRow = newRow
              break
            case 'H2':
              tmpSchool.push(newRow)
              school_bsid = row[1]
              school_name = row[2]
              break
            case 'DT':
              tmpSchool.push(newRow)
              break
            default:
              break
          }

          if (r == rows.length - 1) {
            createSchoolFile(tmpSchool, school_bsid, school_name, path, filename[0])
          }
        }
      }
    }
  }
}

readDirectory(dir_path)
