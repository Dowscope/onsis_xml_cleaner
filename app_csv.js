const csv = require('csv-parser')
const csvstr = require('csv')
const fs = require('fs')

const rea_period = 'OCT'
const rea_year = '20212022'

const file_dir = 'C:\\rea\\'
const file_name = '20212022_REA_Oct_Submission_CSV.csv' 
const file_path = file_dir + file_name

const output_file = file_dir + rea_year + '_REA_' + rea_period + '_Submission.csv'

var data = fs.readFileSync(file_path, 'utf-8')

var rows = data.split('\r\n')

var results = []

for (r in rows){
    if (r > 9){
        var columns = rows[r].split(',')
        if (columns[1] && columns[1].length < 9){
            columns[1] = '0' + columns[1]
        }

        if (columns[4]){
            var dob = columns[4].split('/')
            var mm = 0, dd = 0, yy = 0
            for (d in dob){
                if (dob[d].length > 3) {
                    yy = dob[d]
                }
                else if (dob[d] > 12) {
                    dd = dob[d]
                }
                else if (d == 1 && dob[d] < 13) {
                    mm = dob[d]
                }
                else if (mm == 0) {
                    mm = dob[d]
                }
                else {
                    dd = dob[d]
                }
            }
            columns[4] = yy + '/' + mm + '/' + dd
        }

        if (columns[9]){
            var dob = columns[9].split('/')
            var mm = 0, dd = 0, yy = 0
            for (d in dob){
                if (dob[d].length > 3) {
                    yy = dob[d]
                }
                else if (dob[d] > 12) {
                    dd = dob[d]
                }
                else if (d == 1 && dob[d] < 13) {
                    mm = dob[d]
                }
                else if (mm == 0) {
                    mm = dob[d]
                }
                else {
                    dd = dob[d]
                }
            }
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
