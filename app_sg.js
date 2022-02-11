// OnSIS XML Cleaner - Trillium Errors
// Created By: Tim Dowling

// Required Files
const xmljs = require('xml-js')
const fs = require('fs')
const { Console } = require('console')

// Where the file is located and filename.
const school_bsid = '409618'
const onsis_period = 'OCTELEM3_20211031_'
const fileLoc = 'C:\\batch2\\'
const file_name = 'virsec_MAR_SUB_936615.xml' 
const filePath = fileLoc + file_name

// Constants to be changed depending on submission period
const PERIOD_START_DATE = '2020/11/01'

// Open the file
fs.readFile(filePath, 'utf-8', (err, data)=> {
  if (err) return
  
  // Convert the XML file to JSON for easier access
  const xmlData = xmljs.xml2json(data, {compact: true,spaces: 2})
  const jsonData = JSON.parse(xmlData)

  // Grab all the students
  const students = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT

  // Set the variables for re-creating the filename
  const report_year = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.ACADEMIC_YEAR._text
  const report_period = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SUBMISSION_PERIOD_TYPE._text
  const school_number = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_NUMBER._text
  const fileName = fileLoc + report_year + "_" + report_period + "_" + school_number + ".xml"

  // Count how many records are being changed
  var exception_counter = 0
  var iprc_date_counter = 0
  var placement_type_counter = 0
  var enrollment_end_date_counter = 0
  var self_id_counter = 0
  var student_manual_counter  = 0
  var class_add_counter = 0
  
  // Manually fix enrollment Errors
  student_fixes = ['328292594','328303979', '328316070','328323100', '328327200', '328328414', '328328638', '328329677', '328330105', '328331665', '328331970', '328332671', '328334073', '328334370', '328335492']

  // Loop through the students
  for (s in students){
    for (student_number in student_fixes){
      if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_fixes[student_number]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ACTION._text = 'ADD'
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE._text = '38'
        student_manual_counter += 1
      }
    }
    
    // Get all the keys in the Student enrollemnt sections
    for (key in students[s].STUDENT_SCHOOL_ENROLMENT){
      
      // Correc the error that this should be blank.
      if (key == 'INDIGENOUS_SELF_IDENTIFICATION'){
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION).length > 0){
          if (students[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text == 'Non'){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.INDIGENOUS_SELF_IDENTIFICATION._text = ''
            self_id_counter += 1
          }
        }
      }

      // make sure that dates before July are corrected to July 1st.
      if (key == 'ENROLMENT_END_DATE') {
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE).length > 0){
          if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text) < new Date(PERIOD_START_DATE)){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text = PERIOD_START_DATE
            enrollment_end_date_counter += 1
          }
        }
      }

      // Find the Special Education section
      if (key == 'SPECIAL_EDUCATION'){

        for( sped in students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION){
          
          // Change in IPRC Date when blank
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_STUDENT_FLAG).length > 0){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_STUDENT_FLAG._text == 'T' && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE).length == 0){
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE = students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE
              iprc_date_counter += 1
            }
          }

          // Change when placement type is blank
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].SPECIAL_EDU_PLMNT_TYPE).length == 0){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].SPECIAL_EDU_PLMNT_TYPE['_text'] = 'I'
            placement_type_counter += 1
          }

          // If student has a certain type NONEXC then lets change it
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE).length > 0){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text == 'NONEXC'){
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text = ''
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].NON_IDENTIFIED_STUDENT_FLAG._text = 'T'
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].MAIN_EXCEPTIONALITY_FLAG._text = 'F'
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_STUDENT_FLAG._text = 'F'
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE = {}
              
              // Update the exception_counter
              exception_counter += 1  
            }
          }
        }
      }

      if (key == 'STUDENT_CLASS_ENROLMENT'){
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT).length < 10){
          for (enrolment in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT){
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[enrolment].ACTION._text == 'UPDATE'){
                if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[enrolment].COURSE_START_DATE._text) > new Date(PERIOD_START_DATE)){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[enrolment].ACTION._text = 'ADD'
                  class_add_counter += 1
                } 
              }
          }
        }else {
          if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.ACTION._text == 'UPDATE'){
            if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_START_DATE._text) > new Date(PERIOD_START_DATE)){
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.ACTION._text = 'ADD'
              class_add_counter += 1
            } 
          }
        }
      }
    }
  }

  // Display the number of records that were changed
  console.log('NONEXC Records Changed: ' + exception_counter)
  console.log('IPRC DATE Records Changed: ' + iprc_date_counter)
  console.log('Placement Type Records Changed: ' + placement_type_counter)
  console.log('Enrollment End Dates Fixed: ' + enrollment_end_date_counter)
  console.log('Self ID\'s changed: ' + self_id_counter)
  console.log('Manual Fixes: ' + student_manual_counter)
  console.log('Class Add Fix: ' + class_add_counter)

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