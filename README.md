# OnSIS XML Modifier

This program is designed to change errors in the XML Batch file,  It is designed to do this on a mass change level.

This utility was designed to help cleanup the XML file produced by PowerSchool SIS

This program requires NODE.JS and NPM to be installed and working before downloading this repo.

## To Install

Using NODE.JS and NPM, make sure you are in the folder of the program.

```bash
npm install
```

## To run

Download the file in a known folder using the default filename from powerschool and update the code with the folder location.  You will have to update the school BSID number and the OnSIS period.

Using NODE.JS run

```bash
node app.js 000000 elem
```

There are two arguments.  (1) The school BSID Number.  (2) The school level. elem - Elementary Schools, sec - Secondary Schools.

It will output the cleaned file in the same folder and the one you downloaded to.

# StoreCodes app

This program will take an export of the "Standards - Final Grades by Class" code set from PowerSchool and change the StoreCodes from the term name they were giving at setup and make them R1 and R2.
These storecodes are needed so that the <REPORT_CARD> segment of the OnSIS file are generated.

## To run

```bash
node storecodes.js c:\onsis\ schoolcode
```

The school code will be the bsid number or the shortcode of the school you are working on.
The filename of the csv needs to be ```standard_grade_section_export_SCHOOLCODE.csv```
