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
