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
const pdf = require('pdf-creator-node')

// School and Period Information
const school_bsid = arg[1]
const school_level = arg[2].toUpperCase()
const sub_month = arg[3].toUpperCase()
var sub_date = arg[4]
var onsis_p
var back_date
var submission_date

if (school_level == 'ELEM') {
  onsis_p = sub_month + 'ELEM'
  if (sub_month == 'OCT') {
    back_date = sub_date + '/07/01'
    submission_date = sub_date + '/10/31'
    onsis_p = onsis_p + '3'
    sub_date = sub_date + '1031'
  }
  else if (sub_month == 'MAR') {
    back_date = parseInt(sub_date)-1 + '/11/01'
    submission_date = sub_date + '/03/31'
    onsis_p = onsis_p + '2'
    sub_date = sub_date + '0331'
  }
  else if (sub_month == 'JUN') {
    back_date = sub_date + '/04/01'
    submission_date = sub_date + '/06/30'
    onsis_p = onsis_p + '4'
    sub_date = sub_date + '0630'
  }
}
else if (school_level == 'SEC'){
  onsis_p = sub_month + 'SEC'
  if (sub_month == 'OCT') {
    back_date = sub_date + '/07/01'
    submission_date = sub_date + '/10/31'
    onsis_p += '1'
    sub_date = sub_date + '1031'
  }
  else if (sub_month == 'MAR') {
    back_date = parseInt(sub_date)-1 + '/11/01'
    submission_date = sub_date + '/03/31'
    onsis_p += '2'
    sub_date = sub_date + '0331'
  }
  else if (sub_month == 'JUN') {
    back_date = sub_date + '/03/01'
    submission_date = sub_date + '/06/30'
    onsis_p += '4'
    sub_date = sub_date + '0628'
  }
}
else {
  console.log('School level argument is invalid.  elem or sec')
  process.exit(0)
}


const onsis_period = onsis_p + '_' + sub_date + '_'

// Where the file is located and filename.
const fileLoc = arg[0]
const file_name = 'ONSIS_' + onsis_period + school_bsid + '.xml' 
const filePath = fileLoc + file_name

const output_file = fileLoc + 'OnSISChangelog_' + school_bsid + '_' + sub_date + '.pdf'

// Open the file
fs.readFile(filePath, 'utf-8', (err, data)=> {
  if (err) {
    console.log(err)
    return
  } 
    
  
  // Convert the XML file to JSON for easier access
  const xmlData = xmljs.xml2json(data, {compact: true,spaces: 2})
  const jsonData = JSON.parse(xmlData)

  // Grab all the classes, students and educators
  const classes = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS
  const students = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT
  const educators = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT

  // Set the variables for re-creating the filename
  const report_year = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.ACADEMIC_YEAR._text
  const report_period = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SUBMISSION_PERIOD_TYPE._text
  const school_number = jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_NUMBER._text
  const fileName = fileLoc + report_year + "_" + report_period + "_" + school_number + ".xml"

  // Count total records
  var class_counter = 0
  var student_counter = 0
  var educator_counter = 0

  // Count how many records are being changed
  var class_duplicate_counter = 0
  var class_type_counter = 0
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
  var crs_credit_counter = 0
  var crs_change_enddate_counter = 0
  var crs_startdate_counter = 0
  var crs_langtype_counter = 0
  var self_id_counter = 0
  var language_type_counter = 0
  var student_gender_s_counter = 0
  var student_entrycode_counter = 0
  var student_manual_counter = 0
  var second_language_counter = 0
  var educator_status_counter = 0
  var educator_class_counter = 0
  var educator_missing_men = 0
  var educator_gender_counter = 0
  var educator_startdate_counter = 0
  var educator_core_counter = 0

  // Manual Student Changes - Student Number
  // Students with IA codes.
  const student_ia_fixes = [
    '330340514',
    '330370883',
    '359008935',
    '359061488',
    '359094042',
    '359103198',
    '359123743',
  ]

  // Students that are missing a entry code.
  const student_mob_fixes = [
  ]

  // Students not end dated properly
  const student_end_fixes = [
  ]

  // Students that have a wrong exit code.
  const student_exit_fixes = [
    '330370883',
    '359008935',
    '359032645',
    '359061488',
    '359094042',
    '359123637',
    '359123743',
  ]

  // Students should be ADD not UPDATE
  const student_status_add = [
  ]

  // Students need status change
  const student_status_fixes = [
  ]
  const student_status_dates = [
  ]

  // Students that have a wrong postal code.
  const student_postal_fixes = [
    '359124185'
  ]

  // Students class start date removed when ACTION is update
  const class_start_fixes = [
  ]

  // Error showing language type of 34
  const class_lang_type_fixes = [
  ]

  // Error with class start date and should be removed.
  const student_class_start = [
  ]

  // Weird error change with course end date exceeding submission date.
  const student_crs_exceed = [
  ]
  const date_exceeded = '2022/03/31'
  const change_date = '2022/03/30'

  // Not all course indicators are the same.
  const crs_indicator_flag = true
  const crs_ind_code = 'SAM'
  const crs_ind_change = '3'

  // Manual Educator Changes - Make sure to add the preceeding zero if the MEN doesn't have it.
  // Change eductor status to UPDATE if it is ADD.
  const manual_status_fix = [
  ]

  // Class assignmnets for educators should be UPDATE
  const manual_class_fix = [
  ]

  const change_log_json = {
    submissionDate: report_year,
    subMonth: sub_month,
    bsid: school_bsid,
    changes: []
  }
  const change_log = []

  const class_codes = []

  // Loop through all the classes
  for (var c = 0; c < classes.length; c++ ){
    var valid = true
    for (code of class_codes){
      const index = parseInt(code.index)
      if (classes[c].CLASS_CODE._text == code.code) {
        if (classes[c].SEGMENT){
          
          if (!classes[index].SEGMENT){
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS[index].SEGMENT = classes[c].SEGMENT
            classes[index].SEGMENT = classes[c].SEGMENT
          }
          else {
            if (Array.isArray(classes[c].SEGMENT)){
              for (seg of classes[c].SEGMENT){
                if (Array.isArray(classes[index].SEGMENT)){
                  var duplicate = false
                  for (cc of classes[index].SEGMENT){
                    if (Object.keys(cc.MINISTRY_DFND_CRS).length > 0 && cc.MINISTRY_DFND_CRS._text == seg.MINISTRY_DFND_CRS._text){
                      duplicate = true
                    }
                    else if (Object.keys(cc.LOCAL_DEV_CRS).length > 0 && cc.LOCAL_DEV_CRS._text == seg.LOCAL_DEV_CRS._text){
                      duplicate = true
                    }
                  }

                  if (!duplicate){
                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS[index].SEGMENT.push(seg)
                  }
                }
                else {
                  const segs = []
                  segs.push(classes[index].SEGMENT)

                  if (classes[index].SEGMENT.MINISTRY_DFND_CRS._text != seg.MINISTRY_DFND_CRS._text || classes[index].SEGMENT.LOCAL_DEV_CRS._text != seg.LOCAL_DEV_CRS._text){
                    segs.push(seg)
                  }
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS[index].SEGMENT = segs
                }
              }
            }
            else {
              if (Array.isArray(classes[index].SEGMENT)){
                var duplicate = false
                for (cc of classes[index].SEGMENT){
                  if (Object.keys(cc.MINISTRY_DFND_CRS).length > 0 && cc.MINISTRY_DFND_CRS._text == classes[c].SEGMENT.MINISTRY_DFND_CRS._text){
                    duplicate = true
                  }
                  else if (Object.keys(cc.LOCAL_DEV_CRS).length > 0 && cc.LOCAL_DEV_CRS._text == classes[c].SEGMENT.LOCAL_DEV_CRS._text){
                    duplicate = true
                  }
                }

                if (!duplicate){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS[index].SEGMENT.push(classes[c].SEGMENT)
                }
              }
              else {
                const segs = []
                segs.push(classes[index].SEGMENT)

                if (classes[index].SEGMENT.MINISTRY_DFND_CRS._text != classes[c].SEGMENT.MINISTRY_DFND_CRS._text || classes[index].SEGMENT.LOCAL_DEV_CRS._text != classes[c].SEGMENT.LOCAL_DEV_CRS._text){
                  segs.push(classes[c].SEGMENT)
                }

                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS[index].SEGMENT = segs
              }
            }
          }

          delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS[c]
          classes.splice(c,1)
          c--
        }
        else {
          delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS[c]
          classes.splice(c,1)
          c--
        }
        class_duplicate_counter += 1
        valid = false
      }
    }

    if (!valid){
      var tempArry = [];
      for (let i of jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS) {
        i && tempArry.push(i);
      }
      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS = tempArry;
    }

    if(valid){
      class_counter += 1
      var hasSegment = false
      if (classes[c].SEGMENT){
        hasSegment = true
      }
      
      // Classtype not needed when ACTION is UPDATE
      if (classes[c].ACTION._text == 'UPDATE' && classes[c].CLASS_TYPE){
        delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.CLASS[c].CLASS_TYPE
        class_type_counter += 1
      }

      class_codes.push({'code':classes[c].CLASS_CODE._text, 'index':c, 'segment':hasSegment})
    }
  }
  
  // Loop through the students
  for (s in students){

    student_counter += 1

    
    if (students[s].STUDENT_SCHOOL_ENROLMENT){

      // ----- Manual Changes -----

      // Status Change to add
      for (student_number in student_status_add){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_status_add[student_number]){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ACTION._text = 'ADD'

          // Change spec ed if applicable
          if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION){
            if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION)){
              for (speced in students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION){
                if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[speced].ACTION._text == 'UPDATE'){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[speced].ACTION._text = 'ADD'
                }
              }
            }
            else {
              if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.ACTION._text == 'UPDATE'){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.ACTION._text = 'ADD'
              }
            }
          }

          // Change Classes if applicable
          if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT){
            if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT)){
              for (c in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT){
                if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].ACTION._text == 'UPDATE'){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].ACTION._text = 'ADD'
                }
              }
            }
            else {
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.ACTION._text == 'UPDATE'){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.ACTION._text = 'ADD'
              }
            }
          }

          student_manual_counter += 1
        }
      }
      
      // Status Changes
      for (student_number in student_status_fixes){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_status_fixes[student_number]){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ACTION._text = 'UPDATE'
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE._text = student_status_dates[student_number]
          student_manual_counter += 1
        }
      }
  
      // Student IA Changes
      for (student_number in student_ia_fixes){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_ia_fixes[student_number]){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE._text = '38'
          student_manual_counter += 1
          change_log.push({
            'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
            'Desc': 'Entry code is IA, It has been reported as 38'
          });
        }
      }
  
      // Student entry codes missing
      for (student_number in student_mob_fixes){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_mob_fixes[student_number]){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE._text = '38'
          student_manual_counter += 1
          change_log.push({
            'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
            'Desc': 'Entry code is missing, change to 38'
          });
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
          
          change_log.push({
            'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
            'Desc': 'Changed exit date to ' + back_date + ' and exit code to 71'
          });
        }
      }
  
      // Students that have a wrong exit code.
      for (student_number in student_exit_fixes){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_exit_fixes[student_number]){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE_EXIT._text = '71'
          student_manual_counter += 1
          change_log.push({
            'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
            'Desc': 'Changed exit code to 71'
          });
        }
      }
  
      // Students that have a wrong postal code.
      for (student_number in student_postal_fixes){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_postal_fixes[student_number]){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.POSTAL_AREA_TYPE._text = 'P0T 2E0'
          student_manual_counter += 1
          change_log.push({
            'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
            'Desc': 'Postal code is invalid'
          });
        }
      }
  
      // If status is update then remove the start date.
      for (student_number in class_start_fixes){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == class_start_fixes[student_number]){
          if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT)){
            for (c in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT){
              if(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].ACTION._text == "UPDATE") {
                delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].COURSE_START_DATE
                crs_startdate_counter += 1
              }
            }
          }
          else {
            if(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.ACTION._text == "UPDATE") {
              delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_START_DATE
              crs_startdate_counter += 1
            }
          }
        }
      }
  
      // Error with class start date needs removed.
      for (student_number in student_class_start){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_class_start[student_number]){
          delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_START_DATE
          crs_startdate_counter += 1
        }
      }

      // Error with class language type.
      for (student_number in class_lang_type_fixes){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == class_lang_type_fixes[student_number]){
          if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT)){
            for (c in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT) {
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].LANGUAGE_TYPE._text == '34'){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].LANGUAGE_TYPE._text = 'E'
                crs_langtype_counter += 1
              }
            }
          }
          else {
            if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.LANGUAGE_TYPE._text == '34'){
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].LANGUAGE_TYPE._text = 'E'
              crs_langtype_counter += 1
            }
          }
        }
      }

      // Weird error change with course end date exceeding submission date.
      for (student_number in student_crs_exceed){
        if (students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text == student_crs_exceed[student_number]){
          if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT)){
            for (c in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT){
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].CLASS_END_DATE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].CLASS_END_DATE).length > 0){
                if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].CLASS_END_DATE._text == date_exceeded){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[c].CLASS_END_DATE._text = change_date
                }
              }
            }
          }
          else {
            if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CLASS_END_DATE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CLASS_END_DATE).length > 0){
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CLASS_END_DATE._text == date_exceeded){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CLASS_END_DATE._text = change_date
              }
            }
          }
          student_manual_counter += 1
        }
      }
  
      // ----- Automatic Changes -----
      
      // Missing Board Status
      if (students[s].STUDENT_SCHOOL_ENROLMENT && students[s].STUDENT_SCHOOL_ENROLMENT.STU_BRD_RES_STAT_TYPE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STU_BRD_RES_STAT_TYPE).length == 0){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STU_BRD_RES_STAT_TYPE._text = '01'
        board_status_counter += 1
        change_log.push({
          'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
          'Desc': 'Missing board residence status, reported as Pupil of the board'
        });
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
          change_log.push({
            'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
            'Desc': 'Invalid Residence Status, reported as permenant residence'
          });
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
  
      // Gender Type is 'S' and no Desc.
      if (students[s].STUDENT_SCHOOL_ENROLMENT.GENDER_TYPE){
        if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.GENDER_TYPE).length > 0 && students[s].STUDENT_SCHOOL_ENROLMENT.GENDER_TYPE._text == 'S') {
          if (students[s].STUDENT_SCHOOL_ENROLMENT.GENDER_DESC && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.GENDER_DESC).length == 0) {
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.GENDER_TYPE._text = 'N'
            change_log.push({
              'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
              'Desc': 'Student gender is specified and no desc was given, It has been reported as Not Disclosed'
            });
            student_gender_s_counter += 1
          }
        }
      }
  
      // Missing Entry Code.
      if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE).length == 0) {
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_MOBILITY_TYPE._text = '38'
        change_log.push({
          'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
          'Desc': 'Student entry code is missing, It has been reported as 38 - Unknown'
        });
        student_entrycode_counter += 1
      }
  
      // If the status is ADD then the start date has to be within the submission period.
      if (students[s].STUDENT_SCHOOL_ENROLMENT.ACTION._text == 'ADD') {
        if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE._text) < new Date(back_date)){
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_START_DATE._text = back_date
          enrollment_start_date_counter += 1
          change_log.push({
            'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
            'Desc': 'Check school enrolment start date, It has been reported as ' + back_date
          });
        }
      }
      
      // Get all the keys in the Student enrollemnt sections
      for (key in students[s].STUDENT_SCHOOL_ENROLMENT){
        if (key == 'STUDENT_CLASS_ENROLMENT'){
          if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT).length > 20){
            
            // Passing mark and complete flag error.
            if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.FINAL_MARK && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.FINAL_MARK).length > 0 && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.WITHDRAWAL_TYPE).length > 0 && students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.WITHDRAWAL_TYPE._text != 'W'){
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_COMPLETE_FLAG && students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_COMPLETE_FLAG._text == 'F'){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_COMPLETE_FLAG._text = 'T'
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_INCOMPLETE_FLAG._text = 'F'
                crs_complete_counter += 1
              }
            }
  
            // The earned credit is zero even with passing mark.
            if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.FINAL_MARK && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.FINAL_MARK).length > 0){
              const mark = parseInt(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.FINAL_MARK._text)
              if (mark >= 50 && students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.EARNED_CREDIT_VALUE._text == '0.00'){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.EARNED_CREDIT_VALUE = students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CREDIT_VALUE
                crs_credit_counter += 1
              }
            }
  
            // Class end date exceeds enrolment date
            if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_END_DATE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_END_DATE).length > 0){
              if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE).length > 0){
                const crs_enddate = new Date(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_END_DATE._text)
                const enr_enddate = new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text)
                if (enr_enddate < crs_enddate){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_END_DATE = students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE
                  crs_change_enddate_counter += 1
                }
              }
            }

            // Class complete/incomplete and not all values have been entered.
            if ((students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_COMPLETE_FLAG._text == 'T' || students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_INCOMPLETE_FLAG._text == 'T') && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_END_DATE).length == 0){
              for (c of classes){
                if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CLASS_CODE._text == c.CLASS_CODE._text){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_END_DATE = new Date(c.CLASS_END_DATE) < new Date(submission_date) ? c.CLASS_END_DATE : submission_date
                  crs_change_enddate_counter += 1
                }
              }
            }

            // If the course indicator flag is set differently for some courses
            if (crs_indicator_flag){
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.CLASS_CODE._text == crs_ind_code) {
                if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_SEM_TYPE._text != crs_ind_change){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT.COURSE_SEM_TYPE._text = crs_ind_change
                }
              }
            }
          }
          else {
            for ( cls in students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT ){
  
              // Passing mark and complete flag error.
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].FINAL_MARK && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].FINAL_MARK).length > 0 && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].WITHDRAWAL_TYPE).length > 0 && students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].WITHDRAWAL_TYPE._text != 'W'){
                if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_COMPLETE_FLAG && students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_COMPLETE_FLAG._text == 'F'){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_COMPLETE_FLAG._text = 'T'
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_INCOMPLETE_FLAG._text = 'T'
                  crs_complete_counter += 1
                }
              }
  
              // The earned credit is zero even with passing mark.
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].FINAL_MARK && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].FINAL_MARK).length > 0){
                const mark = parseInt(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].FINAL_MARK._text)
                if (mark >= 50 && students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].EARNED_CREDIT_VALUE._text == '0.00'){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].EARNED_CREDIT_VALUE = students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].CREDIT_VALUE
                  crs_credit_counter += 1
                }
              }
  
              // Class end date exceeds enrolment date
              if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_END_DATE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_END_DATE).length > 0){
                if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE).length > 0){
                  const crs_enddate = new Date(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_END_DATE._text)
                  const enr_enddate = new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE._text)
                  if (enr_enddate < crs_enddate){
                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_END_DATE = students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE
                    crs_change_enddate_counter += 1
                  }
                }
              }

              // Class complete/incomplete and not all values have been entered.
              if ((students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_COMPLETE_FLAG._text == 'T' || students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_INCOMPLETE_FLAG._text == 'T') && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_END_DATE).length == 0){
                for (c of classes){
                  if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].CLASS_CODE._text == c.CLASS_CODE._text){
                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_END_DATE = new Date(c.CLASS_END_DATE) < new Date(submission_date) ? c.CLASS_END_DATE : submission_date
                    crs_change_enddate_counter += 1
                  }
                }
              }

              // If the course indicator flag is set differently for some courses
              if (crs_indicator_flag){
                if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].CLASS_CODE._text == crs_ind_code) {
                  if (students[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_SEM_TYPE._text != crs_ind_change){
                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.STUDENT_CLASS_ENROLMENT[cls].COURSE_SEM_TYPE._text = crs_ind_change
                  }
                }
              }
            }
          }
        }
        
        // Correct the error that this should be blank.
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
                    change_log.push({
                      'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
                      'Desc': 'Student is flagged as IPRC and is missing a date, Enrollment start date has been used'
                    });
                  }
  
                  // If IRPC Date is greater then the submission date, remove the date and clear the flag.
                  if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE).length > 0){
                    if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE._text) > new Date(submission_date)){
                      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_REVIEW_DATE._text = submission_date
                      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].IPRC_STUDENT_FLAG._text = 'T'
                      irpc_date_greater_counter += 1 
                      change_log.push({
                        'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
                        'Desc': 'Student IPRC date is past submission date, IPRC has been cleared'
                      });
                    }
                  }
                }
              }
  
              // Change when placement type is blank
              if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].SPECIAL_EDU_PLMNT_TYPE) {
                if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].SPECIAL_EDU_PLMNT_TYPE).length == 0){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].SPECIAL_EDU_PLMNT_TYPE._text = 'I'
                  placement_type_counter += 1
                  change_log.push({
                    'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
                    'Desc': 'Student Spec Ed Placement type is blank, reported as Indirect Service'
                  });
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
                else if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text == 'NONEXC' || students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text == 'NONIND' || students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION[sped].EXCEPTIONALITY_TYPE._text == 'NONEID'){
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
                  change_log.push({
                    'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
                    'Desc': 'Student is flagged as IPRC and is missing a date, Enrollment start date has been used'
                  });
                }
  
                // If IRPC Date is greater then the submission date, remove the date and clear the flag.
                if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE).length > 0){
                  if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE._text) > new Date(submission_date)){
                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_REVIEW_DATE._text = submission_date
                    jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.IPRC_STUDENT_FLAG._text = 'T'
                    irpc_date_greater_counter += 1
                    change_log.push({
                      'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
                      'Desc': 'Student IPRC date is greater then submission date, IPRC has been cleared'
                    });
                  }
                }
              }
            }
  
            // Change when placement type is blank
            if (students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.SPECIAL_EDU_PLMNT_TYPE) {
              if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.SPECIAL_EDU_PLMNT_TYPE).length == 0){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SPECIAL_EDUCATION.SPECIAL_EDU_PLMNT_TYPE._text = 'I'
                placement_type_counter += 1
                change_log.push({
                  'StudentNumber': students[s].STUDENT_SCHOOL_ENROLMENT.SCHOOL_STUDENT_NUMBER._text,
                  'Desc': 'Special Education Program is missing Placement Type'
                });
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
          if (Array.isArray(students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM)){
            if (students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE).length > 0){
              if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE < new Date(submission_date))){
                for (lna in students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM){
                  jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM[lna].MINUTES_PER_DAY_OF_INSTRUCTION._text = '000.00'
                }
                second_language_counter += 1
              }
            }
          }
          else {
            if (students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE && Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE).length > 0){
              if (new Date(students[s].STUDENT_SCHOOL_ENROLMENT.ENROLMENT_END_DATE < new Date(submission_date))){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM.MINUTES_PER_DAY_OF_INSTRUCTION._text = '000.00'
                second_language_counter += 1
              }
            }
          }
        //   if (Object.keys(students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM).length = 3){
        //     if (students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM.MINUTES_PER_DAY_OF_INSTRUCTION && students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM.MINUTES_PER_DAY_OF_INSTRUCTION._text == '000.00') {
        //       jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM.MINUTES_PER_DAY_OF_INSTRUCTION._text = '040.00'
        //       second_language_counter += 1
        //     }
        //   }else {
        //     for (sl in students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM){
        //       if (students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM[sl].MINUTES_PER_DAY_OF_INSTRUCTION && students[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM[sl].MINUTES_PER_DAY_OF_INSTRUCTION._text == '000.00') {
        //         jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.STUDENT[s].STUDENT_SCHOOL_ENROLMENT.SECOND_LANGUAGE_PROGRAM[sl].MINUTES_PER_DAY_OF_INSTRUCTION._text = '040.00'
        //         second_language_counter += 1
        //       }
        //     }
        //   }
        }
      }
    }
  }

  // Loop through all the educators
  for (e in educators) {
    educator_counter += 1

    // ----- Manual Changes -----

    // Change the status to UPDATE if ADD for manual changes.
    for (i in manual_status_fix){
      if (educators[e].MEN._text == manual_status_fix[i]){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].ACTION._text = 'UPDATE'
        delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].ASSIGNMENT_START_DATE
        educator_status_counter += 1
      }
    }

    // Changing the status for class assignments.
    for (i in manual_class_fix){
      if (educators[e].MEN._text == manual_class_fix[i][0]){
        if (Array.isArray(educators[e].CLASS_ASSIGNMENT)){
          for (code in educators[e].CLASS_ASSIGNMENT){
            for (manual_code of manual_class_fix[i][1]){
              if (educators[e].CLASS_ASSIGNMENT[code].CLASS_CODE._text == manual_code){
                jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].CLASS_ASSIGNMENT[code].ACTION._text = 'UPDATE'
                educator_class_counter += 1
              }
            }
          }
        }
        else {
          for (manual_code of manual_class_fix[i][1]){
            if (educators[e].CLASS_ASSIGNMENT.CLASS_CODE._text == manual_code){
              jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].CLASS_ASSIGNMENT.ACTION._text = 'UPDATE'
              educator_class_counter += 1
            }
          }
        }
      }
    }

    // ----- Automatic Changes -----

    // Remove start date if the status is update
    if (educators[e].ACTION._text == 'UPDATE') {
      if (educators[e].ASSIGNMENT_START_DATE) {
        delete jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].ASSIGNMENT_START_DATE
      }
      educator_startdate_counter += 1
    }

    // Educator that is TEACHER REGULAR core flag wrong.
    if (educators[e].POSITION_TYPE && (educators[e].POSITION_TYPE._text == 'TEA' || (educators[e].NEW_POSITION_TYPE && educators[e].NEW_POSITION_TYPE._text == 'TEA'))) {
      if (school_level == 'ELEM'){
        // Core flag is False and they are not on leave correction.
        if (educators[e].CORE_FLAG && educators[e].CORE_FLAG._text == 'F' && !educators[e].NEW_EDUCATOR_LEAVE_TYPE && !educators[e].NEW_ASSIGNMENT_WTHD_TYPE && educators[e].TEACHING_TYPE._text != 'N/A') {
          if (educators[e].NEW_POSITION_TYPE && educators[e].NEW_POSITION_TYPE._text == 'SPE'){
            break
          }
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].CORE_FLAG._text = 'T'
          change_log.push({
            'MEN': educators[e].MEN._text,
            'Desc': 'Educator has teaching type of TEACHER REGULAR,  Educator class assignmnet flag must be checked and must be LEAD or CO-TEACHER of a HOMEROOM CLASS'
          });
          educator_core_counter += 1
        }
        // Core flag is True and they are ON leave correction
        else if ((educators[e].NEW_EDUCATOR_LEAVE_TYPE || educators[e].NEW_ASSIGNMENT_WTHD_TYPE) && educators[e].CORE_FLAG._text == 'T') {
          jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].CORE_FLAG._text = 'F'
          change_log.push({
            'MEN': educators[e].MEN._text,
            'Desc': 'Educator has teaching type of TEACHER REGULAR, Educator is on leave but still attached to a class'
          });
          educator_core_counter += 1
          if (educators[e].TEACHING_TYPE._text != 'N/A') {
            jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].TEACHING_TYPE._text = 'N/A' 
            change_log.push({
              'MEN': educators[e].MEN._text,
              'Desc': 'Educator is on leave but teaching type is not N/A'
            });
          }
        }
      }
    }

    // Educator on leave and teaching type is not N/A
    if ((educators[e].NEW_EDUCATOR_LEAVE_TYPE || educators[e].NEW_ASSIGNMENT_WTHD_TYPE) && educators[e].TEACHING_TYPE != 'N/A'){
      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].TEACHING_TYPE._text = 'N/A'
      if (school_level != 'SEC'){
        jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].CORE_FLAG._text = 'F'
      }
      change_log.push({
        'MEN': educators[e].MEN._text,
        'Desc': 'Educator is on leave but teaching type is not N/A'
      });
    }

    // If an educator has no gender, set it to NON-DISCLOSED
    if (!educators[e].GENDER_TYPE || Object.keys(educators[e].GENDER_TYPE).length == 0){
      jsonData.ONSIS_BATCH_FILE.DATA.SCHOOL_SUBMISSION.SCHOOL.SCHOOL_EDUCATOR_ASSIGNMENT[e].GENDER_TYPE._text = 'N'
      educator_gender_counter += 1
      change_log.push({
        'MEN': educators[e].MEN._text,
        'Desc': 'Educator is missing their gender, Reported as N - Not Disclosed'
      });
    }

    // Check if there are any educators that have missing MEN's
    if (!educators[e].MEN._text) {
      educator_missing_men += 1
    }
  }

  console.log('School Numner: ' + school_bsid)

  // Display the total records
  console.log('Class Count: ' + class_counter)
  console.log('Student Count: ' + student_counter)
  console.log('Educator Count: ' + educator_counter)

  // Display the number of records that were changed
  console.log('Class Duplicates removed: ' + class_duplicate_counter)
  console.log('Class Type Changed: ' + class_type_counter)
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
  console.log('Courses Credit Earned Fixed: ' + crs_credit_counter)
  console.log('Course End Date Correction: ' + crs_change_enddate_counter)
  console.log('Course Start Date Removed: ' + crs_startdate_counter)
  console.log('Course Language Type Change: ' + crs_langtype_counter)
  console.log('Self ID\'s changed: ' + self_id_counter)
  console.log('Launguage Type Changes: ' + language_type_counter)
  console.log('Student Gender Change: ' + student_gender_s_counter)
  console.log('Student Entry Code Change: ' + student_entrycode_counter)
  console.log('\x1b[33m%s\x1b[0m', 'Student Manual Fixes: ' + student_manual_counter)
  console.log('Second Language Fixes: ' + second_language_counter)
  console.log('\x1b[33m%s\x1b[0m', 'Educator Action Changes (Manual Changes): ' + educator_status_counter)
  console.log('\x1b[33m%s\x1b[0m', 'Educator Class Assignment Status Changes (Manual Changes): ' + educator_class_counter)
  console.log('Educator Gender Changes: ' + educator_gender_counter)
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

  change_log_json.changes = change_log

  // PDF Creation
  const html = fs.readFileSync("template.html", "utf8");
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
})