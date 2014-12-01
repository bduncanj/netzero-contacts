netzero-contacts
================

NodeJS script to convert NetZero exported list of contacts to CSV

## Installation

# Install NodeJS (http://nodejs.org/)
# Clone this repository into an empty folder.

## Usage

By default the script will look for `contacts.txt` and will create a file named `gmail_contacts.csv` (however these can be changed at run time via the CLI prompts).

To use, type: `node index` and you'll be prompted for file names.

## Notes

This is a very quick, first pass effort used for a problem I had and not designed for public consumption.  It takes a file formatted from a NetZero text export and simply maps the NetZero field names to CSV column headers.

It expects an input file formatted as folows:
```
First Name: Some; Last Name: Person;
Primary Email: someone@isp.net;
Ignored
Ignored
https://jlisdfsjdfsdfs
Ignored
First Name: Some; Last Name: Person;
Primary Email: someone@isp.net;
```

It will output a CSV file:
```
First Name, Last Name, Primary Email
Some, Person, someone@isp.net
Some, Person, someone@isp.net
```
