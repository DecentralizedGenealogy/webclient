/*
  Description: This script has two modes ("array", "tree"). You set the mode in the "type" var.
    "tree": Will download from FamilySearch all ancestors starting from the specified starting person "start", and will continue for the number of generattions specified in the "generations" var.
    "array": Will download all PIDS in the "pids" array.

  Post export: This scripts also:
    Downloades the portrait.
    Updates the links->portrait->href field to point to the relative path of the downloaded portrait.
    Updates all resource links in the display->families objects to point to relative paths

  TODO: Remove relationship links in display->famailiesAs so they don't render in the One Hop Relatives.
    Possible solution: Keep an array if PIDs we are getting and if that relationship is not in the array don't include it.

 To run:
  1. Enter your session id below into the session var
  2. Enter your starting person ID in the start var
  3. npm install request
  4. npm install jsonfile
  5. node scripts/exportFamilySearch.js
*/

// Dependancies
var fs = require('fs');
var request = require('request');
var jsonfile = require('jsonfile')

// User Variables
var session = "USYS10AF2A8DC784A73427B71370F68ACC35_idses-prod02.a.fsglobal.net";
var start = "KWCJ-RN4";
// Set to true if you want to save living people
var living = false;
// Where will these files reside so we can update relationship and protrait links
// var dest = "https://raw.githubusercontent.com/misbach/familytree/master/people/";
var dest = "https://raw.githubusercontent.com/jdsumsion/familytree/master/people/";
var generations = "4";
var type = "array"; // Valid types are: ["array", "tree"]

// -------------------------
// Download array of persons
// -------------------------
if (type == "array") {
  var pids = ["KWZ3-P71", "KWZ3-PW3", "KW8Q-TD8", "KWJZ-1GK", "K2FG-5ZC", "K23Y-2RH", "KGKN-CLS", "LC5T-J6H", "9HLK-VX9", "LCZ8-136", "93XB-FM6", "LZVM-Y96"];
  pids.forEach(function(pid) {
      download(pid, function(rsp) { console.log(rsp) });
  });
}

// -------------------------------------
// Get all ancestors starting from a PID
// -------------------------------------
if (type == "tree") {
  var options = {
    url: "https://familysearch.org/platform/tree/ancestry?generations="+generations+"&person="+start,
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+session,
    }
  };
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var tree = JSON.parse(body);
      for (var i = 0; i<tree.persons.length; i++) {
        download(tree.persons[i].id, function(rsp) { console.log(rsp) });
      }
    }
    else { console.log(body) }
  });
}

// Download a person
function download(id, callback) {
  // Get Person
  var options = {
    url: "https://familysearch.org/platform/tree/persons/"+id+'?relatives=true&sourceDescriptions=true',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+session,
    }
  };
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var person = JSON.parse(body);

      // Don't save living people
      if (living == false && person.persons[0].living == true) return callback("LIVING: "+person.persons[0].display.name);

      // Fix portrait link
      person.persons[0].links.portrait.href = dest+id+'/'+id+'.jpg';
      // Fix relationship links
      fixLinks(person.persons[0].display);

      // Remove living people
      for (var i=0; i<person.persons.length; i++) {
        if (living == false && person.persons[i].living == true) {
          console.log("living: "+person.persons[i].display.name);
          person.persons.splice(i, 1);
        }
      }

      // Save file
      var dir = "scripts/data/"+id;
      if (!fs.existsSync(dir)) { fs.mkdirSync(dir) }
      var file = "scripts/data/"+id+"/"+id+".json";
      jsonfile.writeFileSync(file, person, {spaces: 2})

      // Get Portrait
      var options = {
        url: "https://familysearch.org/platform/tree/persons/"+id+"/portrait?default=http://vignette3.wikia.nocookie.net/grimm/images/a/a9/Unknown_Male.jpg",
        headers: {
          'Authorization': 'Bearer '+session,
        }
      };
      request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {  }
        else { console.log("Failed to download portrait for: "+id) }
      }).pipe(fs.createWriteStream("scripts/data/"+id+"/"+id+".jpg"));  

      console.log(person.persons[0].display.name);
      return callback(id)
    }
    else { return callback(body) }
  });
}

function fixLinks(family) {
  Object.keys(family).forEach(function(key) {
    if (key == "resource") {
      if (family[key][0]=="#") {
        var id = family[key].split("#")[1];
      } else {
        var id = family[key].split(":")[4];
      }
      family[key] = dest+id+'/'+id+".json";
    }
    if (typeof family[key] != 'string') fixLinks(family[key]);
  });
}
