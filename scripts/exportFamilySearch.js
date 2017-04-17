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
  4. node scripts/exportFamilySearch.js
*/

// Dependancies
var fs = require('fs');
var request = require('request');

// User Variables
var session = "USYSDC901653ADEB1928B1E914AD72B185E6_idses-prod08.a.fsglobal.net";
var start = "KWCJ-FND";
// Set to true if you want to save living people
var living = false;
// Where will these files reside so we can update relationship and protrait links
var dest = "https://raw.githubusercontent.com/misbach/familytree/master/people/";
var generations = "6";
var type = "tree"; // Valid types are: ["array", "tree"]


// -------------------------
// Download array of persons
// -------------------------
if (type == "array") {
  var pids = ["LW61-WTY", "KGJK-M92", "LCPC-FFV", "KL2Z-7Y4", "LJLG-19M", "LCPZ-YL9", "LZVM-Y96"];
  pids.forEach(function(pid) {
      download(pid, function(rsp) {
        // console.log(rsp);
      });
  });
}

// -------------------------------------
// Get all ancestors starting from a PID
// -------------------------------------
var pids = [];
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

      // Save all PIDs into array to help weed out persons we are not saving
      for (var i = 0; i<tree.persons.length; i++) {
        pids.push(tree.persons[i].id);
      }

      // Download each PID
      for (var i = 0; i<tree.persons.length; i++) {
        download(tree.persons[i].id, function(rsp) {
          // console.log(rsp);
        });
      }
    }
    else { console.log(body) }
  });
}


// Download a person
var iteration = 0;
function download(id, callback) {
  iteration++;
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
      if (living == false && person.persons[0].living == true) {
        console.log("LIVING: "+person.persons[0].display.name+" "+id);
        return callback("LIVING: "+person.persons[0].display.name+" "+id);
      }

      // Fix portrait link
      person.persons[0].links.portrait.href = dest+id+'/'+id+'.jpg';

      // Fix relationship links
      fixLinks(person.persons[0].display);

      // Remove children that are not being downloaded
      removeChildren(person.persons[0].display);

      // Remove living people
      for (var i = person.persons.length - 1; i >= 0; i--) {
        if (living == false && person.persons[i].living == true) {
          console.log("living: "+person.persons[i].display.name+" "+id);
          person.persons.splice(i, 1);
        }
      }

      // Save file
      var dir = "scripts/data/"+id;
      if (!fs.existsSync(dir)) { fs.mkdirSync(dir) }
      var file = "scripts/data/"+id+"/"+id+".json";
      fs.writeFile(file, JSON.stringify(person, null, 2), function(err) {
        if (err) { console.log("ERROR: "+err) }
        else { console.log(id+" - "+person.persons[0].display.name) }
      }); 

      // Get Portrait
      var options = {
        url: "https://familysearch.org/platform/tree/persons/"+id+"/portrait?default=http://vignette3.wikia.nocookie.net/grimm/images/a/a9/Unknown_Male.jpg",
        headers: {
          'Authorization': 'Bearer '+session,
        }
      };
      // Poor man's throttling handler: Wait (iteration * 1 second) for each portrait request to avoid being throttling :-(
      setTimeout(function() {
        request(options, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log("Portrait: "+id);
          }
          else {
            console.log("Portrait Failed "+response.statusCode+": "+id);
          }
        }).pipe(fs.createWriteStream("scripts/data/"+id+"/"+id+".jpg"));
      }, iteration * 1000);

      // console.log(person.persons[0].display.name);
      return callback(id)
    }
    else { return callback(body) }
  });
}

// Remove children that are not being downloaded
function removeChildren(display) {
  var children = display.familiesAsParent[0].children;
  if (display.familiesAsParent) {
    if (children) {
      for (var i = children.length - 1; i >= 0; i--) {
        if (pids.indexOf(children[i].resourceId) == -1) {
          children.splice(i, 1);
        }
      }
    }
  }
}

// Re-write all the relationship links to accomodate it's new location (github, etc.)
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
