// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length == 0){
  console.log('School Code argument is missing.  ie. MNPS')
  process.exit(0)
}

const fs = require('fs')

const school_code = arg[0]
const submission_period = 'OCT'
const folder_path = 'h:\\1-onsis\\reports\\' + school_code + '\\'
const output_path = 'h:\\1-onsis\\reports\\'

// Create the folder structure
fs.mkdirSync(output_path + submission_period)
fs.mkdirSync(output_path + submission_period + '\\Aboriginal Self ID')
fs.mkdirSync(output_path + submission_period + '\\Attendance')
fs.mkdirSync(output_path + submission_period + '\\Detailed Reports')
fs.mkdirSync(output_path + submission_period + '\\Educator Reports')
fs.mkdirSync(output_path + submission_period + '\\Enrolment')
fs.mkdirSync(output_path + submission_period + '\\SAL Program')
fs.mkdirSync(output_path + submission_period + '\\Summary Reports')
fs.mkdirSync(output_path + submission_period + '\\Extra')

if (school_code == 'WEST' || school_code == 'HAMM' || school_code == 'SUPE' || school_code == 'LAPS' || school_code == 'LSHS' || school_code == 'MNHS'){
    fs.mkdirSync(output_path + submission_period + '\\ACS')
    fs.mkdirSync(output_path + submission_period + '\\Course Reports')
    fs.mkdirSync(output_path + submission_period + '\\Independent Study')
    fs.mkdirSync(output_path + submission_period + '\\Native Studies')
    fs.mkdirSync(output_path + submission_period + '\\Other Credit Reports')
    fs.mkdirSync(output_path + submission_period + '\\Second Language Programs')
    fs.mkdirSync(output_path + submission_period + '\\SHSM')
    fs.mkdirSync(output_path + submission_period + '\\Student Achievement')
    fs.mkdirSync(output_path + submission_period + '\\Students Without Classes')
}
else {
    fs.mkdirSync(output_path + submission_period + '\\Early Years')
}

const files = fs.readdirSync(folder_path)

for (f in files) {
    var folder = ''
    const fileName = files[f].split('.')[0].split('-')[1]
    if (fileName == '0001BD' || fileName == '0002C1D' || fileName == '0003AD' || fileName == '0003BD' || fileName == '0003CD' || fileName == '0003DD' || fileName == '0004ED' || fileName == '0008F2D' || fileName == '0010G2D' || fileName == '0020TD' || fileName == '0005DD' || fileName == '0006ED' || fileName == '0007F1D' || fileName == '0009G1D' || fileName == '0013J1D' || fileName == '0015K1D' || fileName == '0016L1D' || fileName == '0018ND' || fileName == '0021UD' || fileName == '0023XD' || fileName == '0026K2D'){
        folder = '\\Detailed Reports\\'
    }
    else if (fileName == '0001BE' || fileName == '0002C1S' || fileName == '0005DE' || fileName == '0006ES' || fileName == '0003AS' || fileName == '0003BS' || fileName == '0003CS' || fileName == '0003DS' || fileName == '0004ES' || fileName == '0008F2S' || fileName == '0010G2S' || fileName == '0007F1E' || fileName == '0009G1S' || fileName == '0013J1S' || fileName == '0015K1E' || fileName == '0020TS' || fileName == '0021US' || fileName == '0016L1S' || fileName == '0023XS' || fileName == '0018NS' || fileName == '0026K2E') {
        folder = '\\Summary Reports\\'
    }
    else if (fileName == '0052D' || fileName == '0052S'){
        folder = '\\ACS\\'
    }
    else if (fileName == '0046ED' || fileName == '0046ES' || fileName == '0060D'){
        folder = '\\Course Reports\\'
    }
    else if (fileName == '0027E' || fileName == '0028D' || fileName == '0035E' || fileName == '0082D'){
        folder = '\\Educator Reports\\'
    }
    else if (fileName == '0063D' || fileName == '0063S'){
        folder = '\\Aboriginal Self ID\\'
    }
    else if (fileName == '0064ED' || fileName == '0064SD' || fileName == '0064S'){
        folder = '\\SAL Program\\'
    }
    else if (fileName == '0048D' || fileName == '0048S' || fileName == '0049D'){
        folder = '\\Student Achievement\\'
    }
    else if (fileName == '0066D' || fileName == '0066S'){
        folder = '\\Independent Study\\'
    }
    else if (fileName == '0065D' || fileName == '0065S'){
        folder = '\\Native Studies\\'
    }
    else if (fileName == '0055D'){
        folder = '\\Second Language Programs\\'
    }
    else if (fileName == '0054D'){
        folder = '\\Students Without Classes\\'
    }
    else if (fileName == '0050D' || fileName == '0050S' || fileName == '0051D' || fileName == '0051S'){
        folder = '\\SHSM\\'
    }
    else if (fileName == '0071D' || fileName == '0071S' || fileName == '0072D' || fileName == '0072S'){
        folder = '\\Attendance\\'
    }
    else if (fileName == '0076D' || fileName == '0077D' || fileName == '0078D' || fileName == '0079D' || fileName == '0081D' || fileName == '0082D'){
        folder = '\\Enrolment\\'
    }
    else {
        folder = '\\Extra\\'
    }
    
    const oldPath = folder_path + files[f]
    const newPath = output_path + submission_period + folder + files[f]
    fs.rename(oldPath, newPath, (err) => {
        if(err){
            console.log(err)
        }
    })
}

