// OnSIS XML Cleaner
// Created By: Tim Dowling

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length > 5){
  console.log('File Location, School BSID, School Level, period and year arguments are missing.  ie. c:\\onsis\\ mnps elem oct 2021 or /batch/ hamm sec mar 2022')
  process.exit(0)
}

// Required Files
const xmljs = require('xml-js')
const fs = require('fs')


// School and Period Information
const school_bsid = arg[1]
const sub_month = arg[3].toUpperCase()
var sub_date = arg[4]
var onsis_p
var back_date
var submission_date

if (arg[2] == 'elem') {
  onsis_p = sub_month + 'ELEM'
  if (sub_month == 'OCT') {
    back_date = sub_date + '/07/01'
    submission_date = sub_date + '/10/31'
    onsis_p = onsis_p + '3'
    sub_date = sub_date + '1031_'
  }
  else if (sub_month == 'MAR') {
    back_date = parseInt(sub_date)-1 + '/11/01'
    submission_date = sub_date + '/03/31'
    onsis_p = onsis_p + '2'
    sub_date = sub_date + '0331_'
  }
  else if (sub_month == 'JUN') {
    back_date = sub_date + '/04/01'
    submission_date = sub_date + '/06/26'
    onsis_p = onsis_p + '2'
    sub_date = sub_date + '0631_'
  }
}
else if (arg[2] == 'sec'){
  onsis_p = sub_month + 'SEC'
  if (sub_month == 'OCT') {
    back_date = sub_date + '/07/01'
    submission_date = sub_date + '/10/31'
    onsis_p += '1'
  }
  else if (sub_month == 'MAR') {
    back_date = parseInt(sub_date)-1 + '/11/01'
    submission_date = sub_date + '/03/31'
    onsis_p += '1'
  }
  else if (sub_month == 'JUN') {
    back_date = sub_date + '/03/01'
    submission_date = sub_date + '/05/26'
    onsis_p += '1'
  }
}
else {
  console.log('School level argument is invalid.  elem or sec')
  process.exit(0)
}


const onsis_period = onsis_p + '_' + sub_date

// Where the file is located and filename.
const fileLoc = arg[0]
const file_name = 'ONSIS_' + onsis_period + school_bsid + '.xml' 
const filePath = fileLoc + file_name

const output_file = fileLoc + 'OnSISChangelog_' + school_bsid + '_' + sub_date + '.csv'

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
  var enrollment_start_date_counter = 0
  var crs_complete_counter = 0
  var self_id_counter = 0
  var language_type_counter = 0
  var student_start_counter = 0
  var student_manual_counter = 0
  var second_language_counter = 0
  var educator_status_counter = 0
  var educator_missing_men = 0
  var educator_gender_counter = 0
  var educator_startdate_counter = 0
  var educator_core_counter = 0

  // Manual Student Changes - Student Number
  // Students with IA codes.
  const student_ia_fixes = [
    '359011285'
  ]

  // Students that are missing a entry code.
  const student_mob_fixes = [
    '359124915',
    '359125005',
  ]

  // Students not end dated properly
  const student_end_fixes = [
    '328318597',
    '328324454',
    '328325055',
    '328332259',
    '328332267',
  ]

  // Students that have a wrong exit code.
  const student_exit_fixes = [
    '359055563',
    '359001906',
    '359055803',
  ]

  // Students that have a wrong postal code.
  const student_postal_fixes = [
    '359116539',
  ]

  // Manual Educator Changes - Make sure to add the preceeding zero if the MEN doesn't have it.
  // Change eductor status to UPDATE if it is ADD.
  const manual_status_fix = [
    
  ]

  // Initialize the array to for the changes log
  const change_log = []
  change_log.push('Student/MEN Number, Change to be made\n\r')

  
  // Loop through the students
  for (s in students){

    student_counter += 1

    // Manual Changes Here 
    // Student IA Changes
    for (student_number in student_ia_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_ia_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE._text = '38'
        student_manual_counter += 1
        change_log.push(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text + ', Change entry code to 38\n\r')
      }
    }

    // Student entry codes missing
    for (student_number in student_mob_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_mob_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE._text = '38'
        student_manual_counter += 1
        change_log.push(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text + ', Missing entry code, change to 38\n\r')
      }
    }

    // Students not end dated properly
    for (student_number in student_end_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_end_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text = back_date
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
        change_log.push(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text + ', Changed exit date to ' + back_date + ' and exit code to 71' + '\n\r')
      }
    }

    // Students that have a wrong exit code.
    for (student_number in student_exit_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_exit_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE_EXIT._text = '71'
        student_manual_counter += 1
        change_log.push(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text + ', Changed exit code to 71' + '\n\r')
      }
    }

    // Students that have a wrong postal code.
    for (student_number in student_postal_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_postal_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.POSTAL_AREA_TYPE._text = 'P0T 2E0'
        student_manual_counter += 1
        change_log.push(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text + ', Postal code is invalid' + '\n\r')
      }
    }
    
    // Missing Board Status
    if (students[s].STUDENT_SCHOOL_ENROLMENT.STU_BRD_RES_STAT_TYPE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STU_BRD_RES_STAT_TYPE).length == 0){
      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STU_BRD_RES_STAT_TYPE._text = '01'
      board_status_counter += 1
      change_log.push(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text + ', Missing board residence status, make Pupil of the board' + '\n\r')
    }
    
    // Changed Residence Status (Work VISA)
    if (students[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE).length > 0){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE._text == '4' || students[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE._text == '5'){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE._text = '16'
        res_status_counter += 1
      }
      if (students[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE._text == '17'){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.RESIDENCE_STATUS_TYPE._text = '3'
        res_status_counter += 1
        change_log.push(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text + ', Invalid Residence Status, change to permenant residence' + '\n\r')
      }
    }

    // Self-ID incorrect
    if (students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION).length > 0){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text == '2'){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text = '002'
        res_status_counter += 1
      }
      if (students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text == '3'){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text = '003'
        res_status_counter += 1
      }
      if (students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text == '4'){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text = '004'
        res_status_counter += 1
      }
      if (students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text == 'No'){
        delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text
        res_status_counter += 1
      }
    }

    // Language Type Change
    if (Object.keys(students[s].LANGUAGE_TYPE).length > 0){
      if (students[s].LANGUAGE_TYPE._text == '4') {
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].LANGUAGE_TYPE._text = 'E'
        language_type_counter += 1
      }
    }

    if (students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE._text == '2021/10/31'){
      console.log(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text)
    }

    // If the status is ADD then the start date has to be within the submission period.
    if (students[s].STUDENT_SCHOOL_ENROLMENT.ACTION._text == 'ADD') {
      if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE._text) < new Date(back_date)){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE._text = back_date
        enrollment_start_date_counter += 1
        change_log.push(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text + ', Check school enrolment start date, It has been reported as ' + back_date + '\n\r')
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
          if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text) < new Date(back_date)){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text = back_date
            enrollment_end_date_counter += 1
          }
        }
      }

      // Find the Special Education section
      if (key == 'SPECIAL_EDUCATION'){
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION).length != 8){
          var saveRecord = false
          var numOfDeleted = 0
          for( sped in students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].ACTION._text == 'DELETE'){
              numOfDeleted += 1
            }
          }
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION).length - numOfDeleted == 1){
            saveRecord = true
          }

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
                  if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE._text) > new Date(submission_date)){
                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE._text = submission_date
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
                if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].ACTION._text == 'DELETE'){
                  continue
                }
                else {
                  delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped]
                  delete students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped]
                  exception_del_counter += 1
                }
                continue
              }
              else if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text == 'NONEXC' || students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text == 'NONIND'){
                if (!saveRecord){
                  delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped]
                  delete students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped]
                  exception_del_counter += 1
                }
                else {
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text = ''
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].NON_IDENTIFIED_STUDENT_FLAG._text = 'T'
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].MAIN_EXCEPTIONALITY_FLAG._text = 'F'
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_STUDENT_FLAG._text = 'F'
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE = {}
                  
                  // Update the exception_counter
                  exception_counter += 1 
                }
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
                if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE._text) > new Date(submission_date)){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE._text = submission_date
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
              change_log.push(students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text + ', Special Education Program is missing Placement Type' + '\n\r')
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

    // Remove start date if the status is update
    if (educators[e].ACTION._text == 'UPDATE') {
      if (educators[e].ASSIGNMENT_START_DATE) {
        delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].ASSIGNMENT_START_DATE
      }
      educator_startdate_counter += 1
    }

    // Educator core flag wrong.
    if (educators[e].POSITION_TYPE && educators[e].POSITION_TYPE._text == 'TEA') {
      if (educators[e].CORE_FLAG._text == 'F' && (!educators[e].NEW_EDUCATOR_LEAVE_TYPE && !educators[e].NEW_ASSIGNMENT_WTHD_TYPE)) {
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].CORE_FLAG._text = 'T'
        change_log.push(educators[e].MEN._text + ', Educator class assignmnet flag not checked?\n\r')
        educator_core_counter += 1
      }
      else if ((educators[e].NEW_EDUCATOR_LEAVE_TYPE || educators[e].NEW_ASSIGNMENT_WTHD_TYPE) && educators[e].CORE_FLAG._text == 'T') {
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].CORE_FLAG._text = 'F'
        change_log.push(educators[e].MEN._text + ', Educator is on leave but still attached to a class\n\r')
        educator_core_counter += 1
        if (educators[e].TEACHING_TYPE != 'N/A') {
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].TEACHING_TYPE._text = 'N/A' 
          change_log.push(educators[e].MEN._text + ', Educator is on leave but teaching type is not N/A\n\r')
        }
      }
    }

    // If an educator has no gender, set it to NON-DISCLOSED
    if (!educators[e].GENDER_TYPE || Object.keys(educators[e].GENDER_TYPE).length == 0){
      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].GENDER_TYPE._text = 'N'
      educator_gender_counter += 1
      change_log.push('0' + educators[e].MEN._text + ', Educator is missing their gender\n\r')
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
  console.log('Enrollment Start Dates Fixed: ' + enrollment_start_date_counter)
  console.log('Enrollment End Dates Fixed: ' + enrollment_end_date_counter)
  console.log('Courses Completed Flag Fixed: ' + crs_complete_counter)
  console.log('Self ID\'s changed: ' + self_id_counter)
  console.log('Launguage Type Changes: ' + language_type_counter)
  console.log('\x1b[33m%s\x1b[0m', 'Student Manual Fixes: ' + student_manual_counter)
  console.log('Second Language Fixes: ' + second_language_counter)
  console.log('\x1b[33m%s\x1b[0m', 'Educator Action Changes (Manual Changes): ' + educator_status_counter)
  console.log('\x1b[33m%s\x1b[0m', 'Educator Gender Changes (Manual Changes): ' + educator_gender_counter)
  console.log('\x1b[41m\x1b[33m%s\x1b[0m', 'Educator Missing MEN: ' + educator_missing_men)
  console.log('Educator start date not needed: ' + educator_startdate_counter)
  console.log('Educator core flag change: ' + educator_core_counter)

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
    console.log('XML Successful! ')
  })

  change_log.push('MEN\'s will need a leading zero to search them in PowerSchool\n\r')

  var output = ''
  for (let row in change_log) {
    output += change_log[row]
  }

  fs.writeFileSync(output_file, output, (err) => {
      if (err) {
          console.log(err)
      }

      console.log('Change Log Successful')
  })
})