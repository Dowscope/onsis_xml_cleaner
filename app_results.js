// OnSIS Results To CSV
// Created By: Tim Dowling

// Get command line arguments
const arg = process.argv.slice(2)

if (arg.length == 1){
  console.log('File Path and School Code argument is missing.  ie. H:\\onsis\\ mnps')
  process.exit(0)
}

// Required Files
const xmljs = require('xml-js')
const fs = require('fs')
const { exit } = require('process')

// Where the file is located and filename.
const fileLoc = arg[0]
// const fileLoc = 'h:\\2-onsis\\results\\'
const file_name = arg[1] + '.OUT' 
const filePath = fileLoc + file_name

 

// Function to print Errors and return a row
function printError(id, section, error, crs_code){
  var new_rows = []
  if (Object.keys(error).length < 1) {
    return new_rows
  }
  if (Array.isArray(error.ERROR)){
    for (e in error.ERROR){
      var row = []
      var fieldName = ''
      var fieldValue = ''
      if (error.ERROR[e].FIELD_NAME && Object.keys(error.ERROR[e].FIELD_NAME).length > 0){
        fieldName = error.ERROR[e].FIELD_NAME._text
      }
      if (error.ERROR[e].FIELD_NAME && Object.keys(error.ERROR[e].FIELD_NAME).length > 0){
        fieldValue = error.ERROR[e].FIELD_VALUE._text
      }

      var msg = ''
      if (crs_code){
        msg = 'Class: ' + crs_code._text + ' | ' + error.ERROR[e].E_MESSAGE._text
      }
      else {
        msg = error.ERROR[e].E_MESSAGE._text
      }
      if (error.ERROR[e].E_MESSAGE._text != 'Parent entry in error'){
        // console.log('ID: ' + id)
        row.push(section)
        row.push(id)
        
        row.push(fieldName)
        row.push(fieldValue)
        row.push(msg)
        // console.log(fieldName + ': ' + fieldValue)
        // console.log('Error: ' + msg)
        new_rows.push(row)
      }
    }
  }
  else {
    var fieldName = ''
    var fieldValue = ''
    if (error.ERROR.FIELD_NAME && Object.keys(error.ERROR.FIELD_NAME).length > 0){
      fieldName = error.ERROR.FIELD_NAME._text
    }
    if (error.ERROR.FIELD_NAME && Object.keys(error.ERROR.FIELD_NAME).length > 0){
      fieldValue = error.ERROR.FIELD_VALUE._text
    }
    var msg = ''
      if (crs_code){
        msg = 'Class: ' + crs_code._text + ' | ' + error.ERROR.E_MESSAGE._text
      }
      else {
        msg = error.ERROR.E_MESSAGE._text
      }
    var row = []
    if (error.ERROR.E_MESSAGE._text != 'Parent entry in error'){
      // console.log('ID: ' + id)
      row.push(section)
      row.push(id)
      row.push(fieldName)
      row.push(fieldValue)
      row.push(msg)
      // console.log(fieldName + ': ' + fieldValue)
      // console.log('Error: ' + msg)
      new_rows.push(row)
    }
  }
  // console.log('------------------------------------------------------------')
  return new_rows
}

// Open the file
fs.readFile(filePath, 'utf-8', (err, data)=> {
  if (err) return
  
  // Convert the XML file to JSON for easier access
  const xmlData = xmljs.xml2json(data, {compact: true,spaces: 2})
  const jsonData = JSON.parse(xmlData)

  // Grab all the classes, students and educators
  const classes = jsonData.ONSIS_BATCH_FILE_RESULT.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS
  const students = jsonData.ONSIS_BATCH_FILE_RESULT.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT
  const educators = jsonData.ONSIS_BATCH_FILE_RESULT.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT

  // Useful Info
  const sub_year = jsonData.ONSIS_BATCH_FILE_RESULT.DATA.SCHOOL_SUBMISSION.ACADEMIC_YEAR._text
  const sub_period = jsonData.ONSIS_BATCH_FILE_RESULT.DATA.SCHOOL_SUBMISSION.SUBMISSION_PERIOD_TYPE._text
  const sub_school = jsonData.ONSIS_BATCH_FILE_RESULT.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_NUMBER._text

  // Set the variables for re-creating the filename
  const output_file = fileLoc + sub_year + '_' + sub_period + '_SUBMISSION_' + sub_school + '_ERRORS.csv'

  // Count how many records are being changed
  var classes_counter = 0
  var segments_counter = 0
  var student_enrollments_counter = 0
  var student_ce_counter = 0
  var student_oci_counter = 0
  var stu_speced_counter = 0
  var stu_slp_counter = 0
  var stu_plar_counter = 0
  var stu_diploma_counter = 0
  var stu_shsm_counter = 0
  var stu_shsm_cert_counter = 0
  var tea_counter = 0
  var tea_class_counter = 0

  // Output container
  var results = []
  results.push(['OnSIS Error', 'Student#/MEN', 'Error Name', 'Current Value', 'Error Desc', 'Error Desc Continued'])

  // Loop through the classes
  for (c in classes) {
    if (Object.keys(classes[c].DATA_ERROR_DETAILS).length > 0){
      const rows_c = printError('N/A', 'Classes Error', classes[c].DATA_ERROR_DETAILS, null)
      for (r in rows_c){
        results.push(rows_c[r])
      }
      classes_counter += 1
    }
    for (key in classes[c]){
      if (key == 'SEGMENT'){
        if (Array.isArray(classes[c].SEGMENT)){
          for (s in classes[c].SEGMENT){
            if (Object.keys(classes[c].SEGMENT[s].DATA_ERROR_DETAILS).length > 0){
              const rows_s = printError('N/A', 'Classes Segment Error', classes[c].SEGMENT[s].DATA_ERROR_DETAILS, null)
              for (r in rows_s){
                results.push(rows_s[r])
              }
              segments_counter += 1
            }
          }
        }
        else if (Object.keys(classes[c][key].DATA_ERROR_DETAILS).length > 0){
          const rows_ss = printError('N/A', 'Classes Segment Error', classes[c][key].DATA_ERROR_DETAILS, null)
          for (r in rows_ss){
            results.push(rows_ss[r])
          }
          segments_counter += 1
        }
        
      }
    }
  }

  //Loop through the students
  for (s in students){
    var enrollment_errors = false
    const id = students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text
    const id_oen = students[s].OEN._text
    if (Object.keys(students[s].DATA_ERROR_DETAILS).length > 0){
      const rows_ste = printError(id, 'STUDENT_SCHOOL_ENROLMENT', students[s].DATA_ERROR_DETAILS, null)
      for (r in rows_ste){
        results.push(rows_ste[r])
      }
      enrollment_errors = true
    }

    if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.DATA_ERROR_DETAILS).length > 0){
      const rows_stee = printError(id, 'STUDENT_SCHOOL_ENROLMENT', students[s].STUDENT_SCHOOL_ENROLMENT.DATA_ERROR_DETAILS, null)
      for (r in rows_stee){
        results.push(rows_stee[r])
      }
      enrollment_errors = true
    }

    // Get all the keys in the Student enrollemnt sections
    for (key in students[s].STUDENT_SCHOOL_ENROLMENT){
      if (key == 'STUDENT_CLASS_ENROLMENT'){
        if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT)){
          for (ce in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT){
            if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].DATA_ERROR_DETAILS).length > 0){
              const rows_se = printError(id, 'STUDENT_CLASS_ENROLMENT', students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].DATA_ERROR_DETAILS, students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].CLASS_CODE)
              for (r in rows_se){
                results.push(rows_se[r])
              }
              student_ce_counter += 1
            }

            if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].OTHER_COURSE_INFO){
              if(Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].OTHER_COURSE_INFO)){
                for (oci in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].OTHER_COURSE_INFO){
                  if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].OTHER_COURSE_INFO[oci]).length > 0){
                    const rows_oci = printError(id, 'OTHER COURSE INFO', students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].OTHER_COURSE_INFO[oci].DATA_ERROR_DETAILS, students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].CLASS_CODE)
                    for (r in rows_oci){
                      results.push(rows_oci[r])
                    }
                    student_oci_counter += 1
                  }
                }
              }
              else if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].OTHER_COURSE_INFO).length > 0){
                if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].OTHER_COURSE_INFO.DATA_ERROR_DETAILS).length > 0){
                  const rows_ocii = printError(id, 'OTHER COURSE INFO', students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].OTHER_COURSE_INFO.DATA_ERROR_DETAILS, students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[ce].CLASS_CODE)
                  for (r in rows_ocii){
                    results.push(rows_ocii[r])
                  }
                  student_oci_counter += 1
                }
              }
            }
          }
        }
        else if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.DATA_ERROR_DETAILS && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT[key].DATA_ERROR_DETAILS).length > 0){
          const rows_sce = printError(id, 'STUDENT_CLASS_ENROLMENT', students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.DATA_ERROR_DETAILS, students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CLASS_CODE)
          for (r in rows_sce){
            results.push(rows_sce[r])
          }
          student_ce_counter += 1

          if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.OTHER_COURSE_INFO){
            if(Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.OTHER_COURSE_INFO)){
              for (oci in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.OTHER_COURSE_INFO){
                if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.OTHER_COURSE_INFO[oci].DATA_ERROR_DETAILS).length > 0){
                  const rows_scee = printError(id, 'STUDENT_CLASS_ENROLMENT', students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.OTHER_COURSE_INFO[oci].DATA_ERROR_DETAILS, students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CLASS_CODE)
                  for (r in rows_scee){
                    results.push(rows_scee[r])
                  }
                  student_oci_counter += 1
                }
              }
            }
            else if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.OTHER_COURSE_INFO).length > 0){
              if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.OTHER_COURSE_INFO.DATA_ERROR_DETAILS).length > 0){
                const rows_sceee = printError(id, 'OTHER COURSE INFO', students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.OTHER_COURSE_INFO.DATA_ERROR_DETAILS, students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CLASS_CODE)
                for (r in rows_sceee){
                  results.push(rows_sceee[r])
                }
                student_oci_counter += 1
              }
            }
          }
        }
      }

      if (key == 'SPECIAL_EDUCATION'){
        if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION)){
          for (se in students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION){
            if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[se].DATA_ERROR_DETAILS).length > 0){
              const rows_spe = printError(id, 'SPECIAL_EDUCATION', students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[se].DATA_ERROR_DETAILS, null)
              for (r in rows_spe){
                results.push(rows_spe[r])
              }
              stu_speced_counter += 1
            }
          }
        }
        else if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION).length > 0){
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.DATA_ERROR_DETAILS).length > 0){
            const rows_spee = printError(id, 'SPECIAL_EDUCATION', students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.DATA_ERROR_DETAILS, null)
            for (r in rows_spee){
              results.push(rows_spee[r])
            }
            stu_speced_counter += 1
          }
        }
      }

      if (key == 'SECOND_LANGUAGE_PROGRAM') {
        if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM)){
          for (slp in students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM){
            if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM[slp].DATA_ERROR_DETAILS).length > 0){
              const rows_slp = printError(id, 'SECOND_LANGUAGE_PROGRAM', students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM[slp].DATA_ERROR_DETAILS, null)
              for (r in rows_slp){
                results.push(rows_slp[r])
              }
              stu_slp_counter += 1
            }
          }
        }
        else if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM).length > 0){
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM.DATA_ERROR_DETAILS).length > 0){
            const rows_slpp = printError(id, 'SECOND_LANGUAGE_PROGRAM', students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM.DATA_ERROR_DETAILS, null)
            for (r in rows_slpp){
              results.push(rows_slpp[r])
            }
            stu_slp_counter += 1
          }
        }
      }

      if (key == 'PLAR') {
        if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.PLAR)){
          for (slp in students[s].STUDENT_SCHOOL_ENROLMENT.PLAR){
            if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.PLAR[slp].DATA_ERROR_DETAILS).length > 0){
              const rows_slp = printError(id, 'PLAR', students[s].STUDENT_SCHOOL_ENROLMENT.PLAR[slp].DATA_ERROR_DETAILS, null)
              for (r in rows_slp){
                results.push(rows_slp[r])
              }
              stu_plar_counter += 1
            }
          }
        }
        else if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.PLAR).length > 0){
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.PLAR.DATA_ERROR_DETAILS).length > 0){
            const rows_slpp = printError(id, 'PLAR', students[s].STUDENT_SCHOOL_ENROLMENT.PLAR.DATA_ERROR_DETAILS, null)
            for (r in rows_slpp){
              results.push(rows_slpp[r])
            }
            stu_plar_counter += 1
          }
        }
      }

      if (key == 'DIPLOMA') {
        if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.DIPLOMA)){
          for (slp in students[s].STUDENT_SCHOOL_ENROLMENT.DIPLOMA){
            if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.DIPLOMA[slp].DATA_ERROR_DETAILS).length > 0){
              const rows_slp = printError(id, 'DIPLOMA', students[s].STUDENT_SCHOOL_ENROLMENT.DIPLOMA[slp].DATA_ERROR_DETAILS, null)
              for (r in rows_slp){
                results.push(rows_slp[r])
              }
              stu_diploma_counter += 1
            }
          }
        }
        else if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.DIPLOMA).length > 0){
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.DIPLOMA.DATA_ERROR_DETAILS).length > 0){
            const rows_slpp = printError(id, 'DIPLOMA', students[s].STUDENT_SCHOOL_ENROLMENT.DIPLOMA.DATA_ERROR_DETAILS, null)
            for (r in rows_slpp){
              results.push(rows_slpp[r])
            }
            stu_diploma_counter += 1
          }
        }
      }

      if (key == 'SHSM_PROGRAM') {
        if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM)){
          for (slp in students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM){
            if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].DATA_ERROR_DETAILS).length > 0){
              const rows_slp = printError(id, 'SHSM_PROGRAM', students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].DATA_ERROR_DETAILS, null)
              for (r in rows_slp){
                results.push(rows_slp[r])
              }
              stu_shsm_counter += 1
            }
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].SHSM_CERTIFICATION){
              if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].SHSM_CERTIFICATION)){
                for (sc in students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].SHSM_CERTIFICATION){
                  if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].SHSM_CERTIFICATION[sc].DATA_ERROR_DETAILS).length > 0){
                    const rows_sc = printError(id, 'SHSM_PROGRAM', students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].SHSM_CERTIFICATION[sc].DATA_ERROR_DETAILS, null)
                    for (r in rows_sc){
                      results.push(rows_sc[r])
                    }
                    stu_shsm_cert_counter += 1
                  }
                }
              }
              else if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].SHSM_CERTIFICATION).length > 0){
                if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].SHSM_CERTIFICATION.DATA_ERROR_DETAILS).length > 0){
                  const rows_sc = printError(id, 'SHSM_PROGRAM', students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM[slp].SHSM_CERTIFICATION.DATA_ERROR_DETAILS, null)
                  for (r in rows_sc){
                    results.push(rows_sc[r])
                  }
                  stu_shsm_cert_counter += 1
                }
              }
            }
          }
        }
        else if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM).length > 0){
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.DATA_ERROR_DETAILS).length > 0){
            const rows_slpp = printError(id, 'SHSM_PROGRAM', students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.DATA_ERROR_DETAILS, null)
            for (r in rows_slpp){
              results.push(rows_slpp[r])
            }
            stu_shsm_counter += 1
          }
          if (students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.SHSM_CERTIFICATION){
            if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.SHSM_CERTIFICATION)){
              for (sc in students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.SHSM_CERTIFICATION){
                if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.SHSM_CERTIFICATION[sc].DATA_ERROR_DETAILS).length > 0){
                  const rows_sc = printError(id, 'SHSM_PROGRAM', students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.SHSM_CERTIFICATION[sc].DATA_ERROR_DETAILS, null)
                  for (r in rows_sc){
                    results.push(rows_sc[r])
                  }
                  stu_shsm_cert_counter += 1
                }
              }
            }
            else if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.SHSM_CERTIFICATION).length > 0){
              if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.SHSM_CERTIFICATION.DATA_ERROR_DETAILS).length > 0){
                const rows_sc = printError(id, 'SHSM_PROGRAM', students[s].STUDENT_SCHOOL_ENROLMENT.SHSM_PROGRAM.SHSM_CERTIFICATION.DATA_ERROR_DETAILS, null)
                for (r in rows_sc){
                  results.push(rows_sc[r])
                }
                stu_shsm_cert_counter += 1
              }
            }
          }
        }
      }
    }

    if (enrollment_errors) {
      student_enrollments_counter += 1
    }
  }

  // Loop through the educators
  for (e in educators){
    var id = 'MISSING'
    if (Object.keys(educators[e].MEN).length > 0){
      id = educators[e].MEN._text
    }
    if (Array.isArray(educators[e].DATA_ERROR_DETAILS)){
      for (er in educators[e].DATA_ERROR_DETAILS){
        if (Object.keys(educators[e].DATA_ERROR_DETAILS[er]).length > 0){
          const rows = printError(id, 'EDUCATOR ERROR', educators[e].DATA_ERROR_DETAILS[er], null)
          for (r in rows){
            results.push(rows[r])
          }
          tea_counter += 1
        }
      }
    }
    if (Object.keys(educators[e].DATA_ERROR_DETAILS).length > 0){
      const rows = printError(id, 'EDUCATOR ERROR', educators[e].DATA_ERROR_DETAILS, null)
      for (r in rows){
        results.push(rows[r])
      }
      tea_counter += 1
    }

    // Check class assignments for errors
    if (educators[e].CLASS_ASSIGNMENT){
      if (Array.isArray(educators[e].CLASS_ASSIGNMENT)){
        for (ee in educators[e].CLASS_ASSIGNMENT){
          if (Array.isArray(educators[e].CLASS_ASSIGNMENT[ee].DATA_ERROR_DETAILS)){
            for (err in educators[e].CLASS_ASSIGNMENT[ee].DATA_ERROR_DETAILS){
              if (Object.keys(educators[e].CLASS_ASSIGNMENT[ee].DATA_ERROR_DETAILS[err]).length > 0){
                const rows = printError(id, 'EDUCATOR ERROR', educators[e].CLASS_ASSIGNMENT[ee].DATA_ERROR_DETAILS[err], educators[e].CLASS_ASSIGNMENT[ee].CLASS_CODE)
                for (r in rows){
                  results.push(rows[r])
                }
                tea_class_counter += 1
              }
            }
          }
          else if (Object.keys(educators[e].CLASS_ASSIGNMENT[ee].DATA_ERROR_DETAILS).length > 0){
            const rows = printError(id, 'EDUCATOR ERROR', educators[e].CLASS_ASSIGNMENT[ee].DATA_ERROR_DETAILS, educators[e].CLASS_ASSIGNMENT[ee].CLASS_CODE)
            for (r in rows){
              results.push(rows[r])
            }
            tea_class_counter += 1
          }
        }
      }
      else {
        if (Array.isArray(educators[e].CLASS_ASSIGNMENT.DATA_ERROR_DETAILS)){
          for (err in educators[e].CLASS_ASSIGNMENT.DATA_ERROR_DETAILS){
            if (Object.keys(educators[e].CLASS_ASSIGNMENT.DATA_ERROR_DETAILS[err]).length > 0){
              const rows = printError(id, 'EDUCATOR ERROR', educators[e].CLASS_ASSIGNMENT.DATA_ERROR_DETAILS[err], educators[e].CLASS_ASSIGNMENT.CLASS_CODE)
              for (r in rows){
                results.push(rows[r])
              }
              tea_class_counter += 1
            }
          }
        }
        else if (Object.keys(educators[e].CLASS_ASSIGNMENT.DATA_ERROR_DETAILS).length > 0){
          const rows = printError(id, 'EDUCATOR ERROR', educators[e].CLASS_ASSIGNMENT.DATA_ERROR_DETAILS, educators[e].CLASS_ASSIGNMENT.CLASS_CODE)
          for (r in rows){
            results.push(rows[r])
          }
          tea_class_counter += 1
        }
      }
    }
  }

  // console.log(results[4000])
  // console.log(results[4004])

  // Display the number of records that were changed
  console.log('Class Errors: ' + classes_counter)
  console.log('Segment Errors: ' + segments_counter)
  console.log('Students Enrollment Errors: ' + student_enrollments_counter)
  console.log('Students Class Enrollment Errors: ' + student_ce_counter)
  console.log('Students Other Course Info Errors: ' + student_oci_counter)
  console.log('Special Education Errors: ' + stu_speced_counter)
  console.log('Second Langauge Prog Errors: ' + stu_slp_counter)
  console.log('Plar Errors: ' + stu_plar_counter)
  console.log('Diploma Errors: ' + stu_diploma_counter)
  console.log('SHSM Errors: ' + stu_shsm_counter)
  console.log('SHSM Cert Errors: ' + stu_shsm_cert_counter)
  console.log('Educator Errors: ' + tea_counter)
  console.log('Educator Class Assignment Errors: ' + tea_class_counter)


  // Create the CSV File
  var output = ''

  for (row in results) {
    for (c in results[row]) {
      output += results[row][c] + ','
    }
      
    output += '\r\n'
  }

  fs.writeFileSync(output_file, output, (err) => {
      if (err) {
          console.log(err)
      }

      console.log('Successful')
  })
})