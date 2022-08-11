// OnSIS spec ed compare
// Will compare the OnSIS Section J  file, with PowerSchool Section J File.

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length > 7){
  console.log('File Path, OnSIS Extract FileName, PS Extract FileName, School Year, Submission Month, and school bsid/short code.  ie. c:\\onsis\\ algo_se.csv algo_ps.csv 20212022 OCT ALGO')
  process.exit(0)
}

const directory_path = arg[0]
const onsis_extract = directory_path + arg[1]
const ps_extract = directory_path + arg[2]
const report_year = arg[3]
const sub_month = arg[4].toUpperCase()
const school_bsid = arg[5]

const fs = require('fs')
const pdf = require('pdf-creator-node')

const output_file = directory_path + 'SpecEdErrorlog_' + school_bsid + '_' + report_year + '_' + sub_month + '.pdf'
const change_log_json = {
    submissionDate: report_year,
    subMonth: sub_month,
    bsid: school_bsid,
    changes: []
}

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

const onsis_data = fs.readFileSync(onsis_extract, 'utf-8')
const ps_data = fs.readFileSync(ps_extract, 'utf-8')

var onsis_rows = onsis_data.split('\r\n')
const ps_rows = ps_data.split('\n')

// ONSIS
// -----

for (row in onsis_rows){
    onsis_rows[row] = onsis_rows[row].split(',')
}

// Get students from OnSIS records
const onsis_students = []
for (row of onsis_rows){
    if (row[0] == '"DT"' && row[1] !=''){
        var e = row[2].replaceAll('"', '').replaceAll(' ', '')
        if (e == ''){
            e = 'NON'
        }
        else {
            e = exceptions[e]
        }
        onsis_students.push({
            'OEN': row[1],
            'Exception': e,
            'Placement': row[3].replaceAll('"', '').replaceAll(' ', ''),
            'IPRCDate': row[4].replaceAll('"', '').replaceAll(' ', ''),
            'MainFlag': row[7].replaceAll('"', ''),
            'IdentityFlag': row[6].replaceAll('"', ''),
            'IPRCFlag': row[5].replaceAll('"', ''),
            'IEPFlag': row[8].replaceAll('"', ''),
        })
    }
}
const onsis_students_count = onsis_students.length

// Powerschool
// -----------

const ps_students = []
for (var row in ps_rows) {
    if (row < 1) continue
    const columns = ps_rows[row].split(',')
    if (columns[0] != '') {
        columns[0] = columns[0].replaceAll('"','')
        ps_students.push({
            'OEN': columns[0],
            'Exception': columns[9].replaceAll('"', ''),
            'Placement': columns[7].replaceAll('"', ''),
            'MainFlag': columns[10].replaceAll('"', ''),
            'IEPFlag': columns[6].replaceAll('"', ''),
        })
    }
}
const ps_students_count = ps_students.length

// Remove all the matches
for(var x=0;x<onsis_students.length;x++){
    for(var y=0;y<ps_students.length;y++){
        if (onsis_students[x].OEN==ps_students[y].OEN){
            ps_students.splice(y,1);
            onsis_students.splice(x,1);
            x--;
            break;
        }
    }
}

// add all the non-matching onsis students
// for(var x=0;x<onsis_students.length;x++){
//     console.log('Non Matching Student Onsis: ' + onsis_students[x]);
// }

// // add all the non-matching powerschool students
// for(var y=0;y<ps_students.length;y++){
//     console.log('Non Matching Student Powerschool: ' + ps_students[y]);
// }

console.log('Number of students counted in Onsis: ' + onsis_students_count)
console.log('Number of students counted in PowerSchool: ' + ps_students_count)

// PDF Creation
change_log_json.onsis_changes = onsis_students
change_log_json.ps_changes = ps_students
const html = fs.readFileSync("template_speced.html", "utf8");
const options = {
  format: "Letter",
  orientation: "portrait",
  border: "5mm",
  footer: {
    height: "5mm",
    contents: {
        default: '<span style="float: right;"><span style="color: #444;">{{page}}</span> of <span>{{pages}} pages</span></span>'
    }
}
};
var document = {
  html: html,
  data: {
    changes: change_log_json,
  },
  path: output_file,
  type: "",
};
pdf
.create(document, options)
.then((res) => {
  console.log(res);
})
.catch((error) => {
  console.error(error);
});