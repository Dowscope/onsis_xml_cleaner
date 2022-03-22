// OnSIS XML Cleaner
// Created By: Tim Dowling

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length > 2){
  console.log('School BSID and period arguments are missing.  ie. mnps elem or hamm sec')
  process.exit(0)
}

// Required Files
const xmljs = require('xml-js')
const fs = require('fs')

// School and Period Information
const school_bsid = arg[0]
var onsis_p
if (arg[1] == 'elem'){
   onsis_p = 'OCTELEM3'     // OCTELEM3 - Elementary | OCTSEC1 - Secondary
}
else if (arg[1] == 'sec'){
  onsis_p = 'OCTSEC1'
}
else {
  console.log('School level argument is invalid.  elem or sec')
  process.exit(0)
}
const onsis_year = '_20211031_'
const onsis_period = onsis_p + onsis_year

// Where the file is located and filename.
const fileLoc = 'H:\\1-onsis\\batch\\'
const file_name = 'ONSIS_' + onsis_period + school_bsid + '.xml' 
const filePath = fileLoc + file_name

// Open the file
fs.readFile(filePath, 'utf-8', (err, data)=> {
  if (err) {
    console.log(err)
    return
  } 
    
  
  // Convert the XML file to JSON for easier access
  const xmlData = xmljs.xml2json(data, {compact: true,spaces: 2})
  const jsonData = JSON.parse(xmlData)

  // Grab all the students
  const students = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT
  const educators = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT

  // Set the variables for re-creating the filename
  const report_year = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.ACADEMIC_YEAR._text
  const report_period = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SUBMISSION_PERIOD_TYPE._text
  const school_number = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_NUMBER._text
  const fileName = fileLoc + report_year + "_" + report_period + "_" + school_number + ".xml"

  // Count total records
  var student_counter = 0
  var educator_counter = 0

  // Count how many records are being changed
  var board_status_counter = 0
  var res_status_counter = 0
  var exception_counter = 0
  var exception_del_counter = 0
  var speced_flag_counter = 0
  var iprc_date_counter = 0
  var irpc_date_greater_counter = 0
  var placement_type_counter = 0
  var enrollment_end_date_counter = 0
  var crs_complete_counter = 0
  var self_id_counter = 0
  var student_manual_counter = 0
  var second_language_counter = 0
  var educator_status_counter = 0
  var educator_missing_men = 0
  var educator_gender_counter = 0

  // Manual Student Changes - Student Number
  // Students with IA codes.
  const student_ia_fixes = [
    '328315460',
    '328302310',
    '328302336',
    '328302344',
    '328302401',
    '328302419',
    '328302443',
    '328302476',
    '328302971',
    '328303391',
    '328303532',
    '328304092',
    '328304209',
    '328306063',
    '328320213',
    '328324637',
    '328324835',
    '328327523',
    '328327887',
    '328328125',
    '328331012',
    '328335351',
    '328335955',
    '328337241',
    '328337266',
  ]

  // Students not end dated properly
  const student_end_fixes = [
    '328324207',
    '328281605',
    '328287297',
    '328316153',
    '328317292',
    '328320320',
    '328320338',
    '328320346',
    '328320353',
    '328324090',
    '328324108',
    '328324140',
    '328324173',
    '328324199',
    '328325006',
  ]

  // Students that have a wrong exit code.
  const student_exit_fixes = [
    '328269287',
    '328295837',
    '328326889',
    '328326996',
    '328327093',
    '328331889',
    '328334230',

  ]

  // Students that have a wrong exit code.
  const student_postal_fixes = [
    '328331186'
  ]

  // Manual Educator Changes - Make sure to add the preceeding zero if the MEN doesn't have it.
  // Change eductor status to UPDATE if it is ADD.
  const manual_status_fix = [
    '013461710',
    '033966748',
    '034397794',
    '037719085',
    '037964061',
    '044327302',
  ]
  
  // Loop through the students
  for (s in students){

    student_counter += 1

    // Manual Changes Here 
    // Student IA Changes
    for (student_number in student_ia_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_ia_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE._text = '38'
        student_manual_counter += 1
      }
    }

    // Students not end dated properly
    for (student_number in student_end_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_end_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text = '2021/07/01'
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE_EXIT._text = '71'
        if (students[s].STUDENT_SCHOOL_ENROLMENT.DAYS_ABSENT_YTD){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.DAYS_ABSENT_YTD._text = '0'
        }
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_CLOSURE_DAYS_ABSENT_YTD){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_CLOSURE_DAYS_ABSENT_YTD._text = '0'
        }
        if (students[s].STUDENT_SCHOOL_ENROLMENT.TIMES_LATE_YTD){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.TIMES_LATE_YTD._text = '0'
        }
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ATTENDANCE_TYPE._text = 'FT'
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.FTE._text = '1.00'
        student_manual_counter += 1
      }
    }

    // Students that have a wrong exit code.
    for (student_number in student_exit_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_exit_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE_EXIT._text = '71'
        student_manual_counter += 1
      }
    }

    // Students that have a wrong exit code.
    for (student_number in student_postal_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_postal_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.POSTAL_AREA_TYPE._text = 'P0T 2E0'
        student_manual_counter += 1
      }
    }
    
    // Missing Board Status
    if (students[s].STUDENT_SCHOOL_ENROLMENT.STU_BRD_RES_STAT_TYPE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STU_BRD_RES_STAT_TYPE).length == 0){
      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STU_BRD_RES_STAT_TYPE._text = '01'
      board_status_counter += 1
    }
    
    // Changed Residence Status (Work VISA)
    if (students[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE).length > 0){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE._text == '4' || students[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE._text == '5'){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE._text = '16'
        res_status_counter += 1
      }
    }
    
    // Get all the keys in the Student enrollemnt sections
    for (key in students[s].STUDENT_SCHOOL_ENROLMENT){
      if (key == 'STUDENT_CLASS_ENROLMENT'){
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT).length > 10){
          if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.FINAL_MARK && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.FINAL_MARK).length > 0){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_COMPLETE_FLAG && students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_COMPLETE_FLAG._text == 'F'){
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_COMPLETE_FLAG._text = 'T'
              crs_complete_counter += 1
            }
          }
        }
        else {
          for ( cls in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT ){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].FINAL_MARK && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].FINAL_MARK).length > 0){
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_COMPLETE_FLAG && students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_COMPLETE_FLAG._text == 'F'){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_COMPLETE_FLAG._text = 'T'
                crs_complete_counter += 1
              }
            }
          }
        }
      }
      
      // Correc the error that this should be blank.
      if (key == 'INDIGENOUS_SELF_IDENTIFICATION'){
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION).length > 0){
          if (students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text == 'Non'){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text = ''
            self_id_counter += 1
          }
        }
      }

      // Make sure that dates before July are corrected to July 1st.
      if (key == 'ENROLMENT_END_DATE') {
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE).length > 0){
          if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text) < new Date('2021/07/01')){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text = '2021/07/01'
            enrollment_end_date_counter += 1
          }
        }
      }

      // Find the Special Education section
      if (key == 'SPECIAL_EDUCATION'){
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION).length != 8){
          for( sped in students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION){

            // Change in IPRC Date when blank or if IRPC date is greater then submission date.
            if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_STUDENT_FLAG).length > 0){
              if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_STUDENT_FLAG._text == 'T'){

                // If IRPC Date is missing
                if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE).length == 0){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE = students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE
                  iprc_date_counter += 1
                }

                // If IRPC Date is greater then the submission date, remove the date and clear the flag.
                if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE).length > 0){
                  if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE._text) > new Date('2021/10/31')){
                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE._text = '2021/10/31'
                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_STUDENT_FLAG._text = 'T'
                    irpc_date_greater_counter += 1 
                  }
                }
              }
            }

            // Change when placement type is blank
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].SPECIAL_EDU_PLMNT_TYPE) {
              if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].SPECIAL_EDU_PLMNT_TYPE).length == 0){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].SPECIAL_EDU_PLMNT_TYPE._text = 'I'
                placement_type_counter += 1
              }
            }
  
            // If student has a certain type NONEXC or NONIND then lets change it
            if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE).length >= 0){
              if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE).length == 0){
                delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped]
                delete students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped]

                exception_del_counter += 1
                continue
              }
              else if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text == 'NONEXC' || students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text == 'NONEID'){
                delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped]
                delete students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped]
                
                exception_del_counter += 1
                continue
              }
            }
          }

          var tempArry = [];
          for (let i of jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION) {
            i && tempArry.push(i);
          }
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION = tempArry;
        
          if (Object.keys(jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION).length == 0){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION_FLAG._text = 'F'
            speced_flag_counter += 1
          }
        }
        else {
          // Change in IPRC Date when blank or if IRPC date is greater then submission date.
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_STUDENT_FLAG).length > 0){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_STUDENT_FLAG._text == 'T'){

              // If IRPC Date is missing
              if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE).length == 0){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE = students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE
                iprc_date_counter += 1
              }

              // If IRPC Date is greater then the submission date, remove the date and clear the flag.
              if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE).length > 0){
                if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE._text) > new Date('2021/10/31')){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE._text = '2021/10/31'
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_STUDENT_FLAG._text = 'T'
                  irpc_date_greater_counter += 1
                }
              }
            }
          }

          // Change when placement type is blank
          if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.SPECIAL_EDU_PLMNT_TYPE) {
            if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.SPECIAL_EDU_PLMNT_TYPE).length == 0){
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.SPECIAL_EDU_PLMNT_TYPE._text = 'I'
              placement_type_counter += 1
            }
          }

          // If student has a certain type NONEXC then lets change it
          if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.EXCEPTIONALITY_TYPE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.EXCEPTIONALITY_TYPE).length > 0){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.EXCEPTIONALITY_TYPE._text == 'NONEXC' || students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.EXCEPTIONALITY_TYPE._text == 'NONEID'){
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.EXCEPTIONALITY_TYPE._text = ''
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.NON_IDENTIFIED_STUDENT_FLAG._text = 'T'
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.MAIN_EXCEPTIONALITY_FLAG._text = 'F'
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_STUDENT_FLAG._text = 'F'
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE = {}
              
              // Update the exception_counter
              exception_counter += 1  
            }
          }
        }
      }

      // Change the second language minutes to 40 when it has been recorded as 0
      if (key == 'SECOND_LANGUAGE_PROGRAM') {
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM).length = 3){
          if (students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM.MINUTES_PER_DAY_OF_INSTRUCTION && students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM.MINUTES_PER_DAY_OF_INSTRUCTION._text == '000.00') {
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM.MINUTES_PER_DAY_OF_INSTRUCTION._text = '040.00'
            second_language_counter += 1
          }
        }else {
          for (sl in students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM[sl].MINUTES_PER_DAY_OF_INSTRUCTION && students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM[sl].MINUTES_PER_DAY_OF_INSTRUCTION._text == '000.00') {
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM[sl].MINUTES_PER_DAY_OF_INSTRUCTION._text = '040.00'
              second_language_counter += 1
            }
          }
        }
      }
    }
  }

  for (e in educators) {
    educator_counter += 1

    // Change the status to UPDATE if ADD for manual changes.
    for (i in manual_status_fix){
      if (educators[e].MEN._text == manual_status_fix[i]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].ACTION._text = 'UPDATE'
        delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].ASSIGNMENT_START_DATE
        educator_status_counter += 1
      }
    }

    // If an educator has no gender, set it to NON-DISCLOSED
    if (!educators[e].GENDER_TYPE || Object.keys(educators[e].GENDER_TYPE).length == 0){
      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].GENDER_TYPE._text = 'N'
      educator_gender_counter += 1
    }

    // Check if there are any educators that have missing MEN's
    if (!educators[e].MEN._text) {
      educator_missing_men += 1
    }
  }

  console.log('School Numner: ' + school_bsid)
  // Display the toal records
  console.log('Student Count: ' + student_counter)
  console.log('Educator Count: ' + educator_counter)

  // Display the number of records that were changed
  
  console.log('Board Status Changed: ' + board_status_counter)
  console.log('Residence Status Changed: ' + res_status_counter)
  console.log('NONEXC/NONEID Records Changed: ' + exception_counter)
  console.log('\x1b[41m\x1b[33m%s\x1b[0m', 'Non-Exceptionals Deleted: ' + exception_del_counter)
  console.log('Special Ed Flag Change: ' + speced_flag_counter)
  console.log('IPRC DATE Records Changed: ' + iprc_date_counter)
  console.log('IRPC Date is greater then Submission Date changed: ' + irpc_date_greater_counter)
  console.log('Placement Type Records Changed: ' + placement_type_counter)
  console.log('Enrollment End Dates Fixed: ' + enrollment_end_date_counter)
  console.log('Courses Completed Flag Fixed: ' + crs_complete_counter)
  console.log('Self ID\'s changed: ' + self_id_counter)
  console.log('\x1b[33m%s\x1b[0m', 'Student Manual Fixes: ' + student_manual_counter)
  console.log('Second Language Fixes: ' + second_language_counter)
  console.log('\x1b[33m%s\x1b[0m', 'Educator Action Changes (Manual Changes): ' + educator_status_counter)
  console.log('\x1b[33m%s\x1b[0m', 'Educator Gender Changes (Manual Changes): ' + educator_gender_counter)
  console.log('\x1b[41m\x1b[33m%s\x1b[0m', 'Educator Missing MEN: ' + educator_missing_men)

  // Convert the JSON to a string 
  jsonStr = JSON.stringify(jsonData)

  // Convert the JSON back to XML
  const xmlData2 = xmljs.json2xml(jsonStr, {compact: true,spaces: 2})

  // Create the file and save.
  fs.writeFile(fileName, xmlData2, 'utf-8', (err) => {
    if(err){
      console.log('NOT SUCCESSFUL: ERROR - ' + err)
      return
    }
    console.log('Successful! ')
  })
})