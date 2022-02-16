// OnSIS XML Cleaner
// Created By: Tim Dowling

// Required Files
const xmljs = require('xml-js')
const fs = require('fs')

// School and Period Information
const school_bsid = '011517'
const onsis_p = 'OCTELEM3'
const onsis_year = '_20211031_'
const onsis_period = onsis_p + onsis_year

// Where the file is located and filename.
const fileLoc = 'C:\\batch\\'
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

  // Set the variables for re-creating the filename
  const report_year = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.ACADEMIC_YEAR._text
  const report_period = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SUBMISSION_PERIOD_TYPE._text
  const school_number = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_NUMBER._text
  const fileName = fileLoc + report_year + "_" + report_period + "_" + school_number + ".xml"

  // If this is the October Submissionremove some tags. ** This may be a future issue **
  // if (onsis_p == 'OCTELEM3'){
  //   if (jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_AVG_REPORT_CARD_GRADE && Object.keys(jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_AVG_REPORT_CARD_GRADE).length > 0){
  //     delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_AVG_REPORT_CARD_GRADE
  //   }

  //   if (jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_MEDIAN_REPORT_CARD_GRADE && Object.keys(jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_MEDIAN_REPORT_CARD_GRADE).length > 0){
  //     delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_MEDIAN_REPORT_CARD_GRADE
  //   }

  //   if (jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_REPORT_CARD && Object.keys(jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_REPORT_CARD).length > 0){
  //     delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLEAR_REPORT_CARD
  //   }
  // }


  // Count how many records are being changed
  var exception_counter = 0
  var iprc_date_counter = 0
  var placement_type_counter = 0
  var enrollment_end_date_counter = 0
  var self_id_counter = 0

  // Loop through the students
  for (s in students){

    
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
          if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text) < new Date('2021/07/01')){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text = '2021/07/01'
            enrollment_end_date_counter += 1
          }
        }
      }

      // Find the Special Education section
      if (key == 'SPECIAL_EDUCATION'){
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION).length < 5){
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
        else {
          // Change in IPRC Date when blank
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_STUDENT_FLAG).length > 0){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_STUDENT_FLAG._text == 'T' && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE).length == 0){
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE = students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE
              iprc_date_counter += 1
            }
          }

          // Change when placement type is blank
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.SPECIAL_EDU_PLMNT_TYPE).length == 0){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.SPECIAL_EDU_PLMNT_TYPE['_text'] = 'I'
            placement_type_counter += 1
          }

          // If student has a certain type NONEXC then lets change it
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.EXCEPTIONALITY_TYPE).length > 0){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.EXCEPTIONALITY_TYPE._text == 'NONEXC'){
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
    }
  }

  // Display the number of records that were changed
  console.log('School Numner: ' + school_bsid)
  console.log('NONEXC Records Changed: ' + exception_counter)
  console.log('IPRC DATE Records Changed: ' + iprc_date_counter)
  console.log('Placement Type Records Changed: ' + placement_type_counter)
  console.log('Enrollment End Dates Fixed: ' + enrollment_end_date_counter)
  console.log('Self ID\'s changed: ' + self_id_counter)

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