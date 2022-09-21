// OnSIS Report Sorter
// Created By: Tim Dowling

// Get command line arguments
const arg = process.argv.slice(2)

// Check if the correct amount of arguments is given.
if (arg.length < 5){
  console.log('School Code, School Level, Submission Period, Folder Path and submission year are missing.  ie. MNPS ELEM OCT C:\ONSIS 20212022, HAMM SEC OCT C:\ONSIS 20222023')
  process.exit(0)
}

// Import libraies
const fs = require('fs')
const prompt = require('prompt-sync')({sigint: true})
const PDFMerger = require('easy-pdf-merge')
const unzip = require('unzipper')

// Set variables
const school_code = arg[0].toUpperCase()
const school_level = arg[1].toUpperCase()
const submission_period = arg[2].toUpperCase()
const folder_root = arg[3]
const folder_path = arg[3] + '\\' + school_code + '\\'
const submission_year = arg[4]
const submission_path = arg[3] + '\\' + submission_year + '\\' + school_code + '\\' + submission_period + '\\'

if (!fs.existsSync(arg[3] + '\\' + submission_year)){
    fs.mkdirSync(arg[3] + '\\' + submission_year)
}
if (!fs.existsSync(arg[3] + '\\' + submission_year + '\\' + school_code)){
    fs.mkdirSync(arg[3] + '\\' + submission_year + '\\' + school_code)
}
if (!fs.existsSync(arg[3] + '\\' + submission_year + '\\' + school_code)){
    fs.mkdirSync(arg[3] + '\\' + submission_year + '\\' + school_code)
}
if (fs.existsSync(arg[3] + '\\' + submission_year + '\\' + school_code + '\\' + submission_period)){
    console.log('Reports previously generated.  To continue type \'yes\' and press enter: ')
    const user_continue = prompt()
    if (user_continue != 'yes') {
        process.exit(0)
    }
    console.log('Removing Previous...')
    fs.rmSync(arg[3] + '\\' + submission_year + '\\' + school_code + '\\' + submission_period, { recursive: true }, (err) => {
        if (err) {
            throw err
        }
        console.log('Previous reports removed successfully')
    })
}
const output_path = arg[3] + '\\' + submission_year + '\\' + school_code + '\\'

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

// If a secondary school create necessary folders
if (school_level == 'SEC'){
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
    // Create Elementary specific folders
    fs.mkdirSync(output_path + submission_period + '\\Early Years')
}

// Unzip the files
const zipFile = folder_root + '\\' + school_code + '.zip'
const zipLoc = folder_root + '\\' + school_code

console.log (zipFile, zipLoc)
fs.createReadStream(zipFile)
.pipe(unzip.Extract({
    path: zipLoc
}))
.on('close', () => {
    // Get files from the folder
    const files = fs.readdirSync(folder_path)

    // Cycle through each file and move to the correct folder
    for (var f in files) {
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

    merge()
})

// Merge the summary files together.
function merge () {
    fs.readdir(submission_path + '\\Summary Reports', (err, fileList) => {
        
        // Get list of summary files
        for (let index = 0; index < fileList.length; index++) {
            fileList[index] = submission_path + 'Summary Reports\\' +  fileList[index];
        }

        const outputLoc = submission_path + school_code.toLowerCase() + '_' + submission_period + '_summary.pdf'
        
        // Merge the files together.
        PDFMerger(fileList, outputLoc, (err) => {
            if (err) {
                console.log(err)
            }
            console.log('File Merged: ' + outputLoc)
        })
    })
}
