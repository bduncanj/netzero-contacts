var fs        = require('fs');
var prompt    = require('prompt');
// Utility to convert to CSV
var stringify = require('csv-stringify');
// Utility for iterating over arrays and more
var _         = require('lodash');

// Defines how we will prompt user for the source filename
var schema = {
  properties:{
    filename:{
      description:'Please enter the file containing the contacts to import.',
      default:'contacts.txt'
    }
  }
};

// A JavaScript regular expression object which will be used to match a field
// in the following format: Field name: Field value; (repeated multiple times)
// in a single line.
var re = /((.*?):(.*?);)/g;

/**
 * Takes an array of fieldNames and an array of objects, where each object will
 * have one or more of the field name properties defined.
 * @param fieldNames {array}
 * @param contacts {array}
 */
function promptSaveContacts(fieldNames, contacts){
  // Ask the user where to save these contacts
  prompt.get({
    properties:{
      outfile:{
        description:'Save as?',
        default:'gmail_contacts.csv'
      }
    }
  },
  // Define a function which will be executed when the console has received
  // the users desired file storage location.
  function(err,res){
    if(err) throw err;
    var
      // Will contain an array of values representing a CSV row
      row,
      // Array of row arrows, to be passed to the csv-stringify module for
      // writing out to the final file.
      rows = [fieldNames];

    // Verify that the outfile does not exist, but do so synchronously (i.e. without
    // requiring a callback function, just to make the code flow more readable)
    if(fs.existsSync(res.outfile)){
      console.log('Error file already exists, rename existing file or pick another name.');
      promptSaveContacts(contacts);
    }
    // File doesn't yet exist, so iterate over our array of objects, and create a
    // simple array for each object in the 'rows' variable, using the fieldNames
    // array to lookup our expected fields.  Record '' (blank) if a field doesn't
    // exists.
    else{
        _.forEach(contacts,function(contact){
           row = [];
            _.forEach(fieldNames, function(fieldName){
              row.push(contact[fieldName] || '');
            });
            rows.push(row);
        });
    }
    // Now use the csv-stringify module to convert this array of arrays to
    // an output CSV file.
    stringify(rows,function(err, output){
      fs.writeFile(res.outfile, output,function(err){
          if(err) throw err;
          console.log('%d contacts saved in file: %s', contacts.length, res.outfile);
      });
    });

  });
}

// MAIN ENTRY POINT
// Prompt the user for a source file to process.
// Second argument is a callback function reference which will be executed
// when the user enters a filename
prompt.get(schema,function(err,res){

  // Read the contents of the file into a variable 'data'
  fs.readFile(res.filename,function(err, data){
    // Throw any errors that occcured as exceptions and abort.
    if(err) throw err;
    var
        // An array containing our parsed contacts
        contacts    = [],
        // An array of every field name we come across while parsing this
        // file, will be used to build the CSV header row.
        fieldNames  = [],
        // Row indexer
        i,
        // Will contain the contact we're working with and is reset to
        // an empty object when we encouter a blank line in the file.
        contact = {},
        // The results of our regular expresssion matching
        matches,
        // Contat the long string of data from our source file into an
        // array based on '\n' (new line characters)
        lines   = data.toString().split('\n');

    // Loop over each line of the file...
    for(i=0;i<lines.length-1;i++){

        // ... and see if this line matches our expected format.
        matches = re.exec(lines[i]);

        // If the line doesn't match *and* we already have data in our 'contact'
        // object from last time, it means we're moving onto a new contact and need
        // to add this contact to the list.
        if((matches === null) && (Object.keys(contact).length > 0)){
          contacts.push(contact);
          contact = {};
        }

        // There are likely going to be multiple sets of 'Field name: value;'
        // in each line of the file, so loop over each match, adding the field
        // name and value to our file.
        while( matches !== null ){

          // We know the index offset from the regular expression at the start
          // of this file.
          fieldName   = matches[2];
          fieldValue  = matches[3];

          // Keep a running unique list of all the fieldnames we come across to
          // build the file columns names.
          if(fieldNames.indexOf(fieldName) == -1){
            fieldNames.push(fieldName);
          }
          // Finally, add this field to our working contact
          contact[fieldName] = fieldValue;
          // And move onto see if there is another 'Field name: value;' pair
          // in this *line* of the file.
          matches  = re.exec(lines[i]);
        }
    }

    console.log('Found %d contacts', contacts.length);

    // We have our list of extracted contacts, so prompt the user to save
    // this for importing to their email software.
    promptSaveContacts(fieldNames, contacts);


  });
});
