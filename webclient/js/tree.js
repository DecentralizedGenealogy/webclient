var params = getQueryParams();
var treeObj = null;

window.onerror = function(){
   return true;
}

// Walk tree for ancestors and descendants
getTree(params.id, {id: params.id, name: null, _parents: [], _children: []});

// Walk tree
var generationCount = 0;
var asyncCount = 0;
function getTree(url = params.id, node) {
	generationCount++;
	asyncCount ++;



	var jqxhr = $.ajax(url)
  .done(function(rsp) {
  }).fail(function(error) {
    console.log( "error", error );
  }).always(function(rsp) {
    person = JSON.parse(rsp);
    var parents = getParents(person.persons[0].display.familiesAsChild[0], person.persons);
    // console.log(person.persons[0].id, person.persons[0].display.name+": ", parents.father.name, parents.mother.name);

		if (node.name == null) node.name = person.persons[0].display.name;
		// Find current person in json tree
		var tmpNode = find(node, url);
    tmpNode._parents.push({id: parents.father.url, name: parents.father.name, _parents: []});
    tmpNode._parents.push({id: parents.mother.url, name: parents.mother.name, _parents: []});

		// Get children of root person only
		// TODO Get multiple generations of descendants
		if (generationCount == 0) {
			if (person.persons[0].display.familiesAsParent[0].children.length > 0) {
				for (var i=0; i < person.persons[0].display.familiesAsParent[0].children.length; i++) {
					node._children.push({id: person.persons[0].display.familiesAsParent[0].children[i].resource, name: person.persons[0].display.familiesAsParent[0].children[i].resourceId});
				}
			}
		}
    // Stop after 4 generations
    if (generationCount < 6) {
	    getTree(parents.father.url, node);
	    getTree(parents.mother.url, node);
    }
    // Detect when finished
    if (asyncCount-- == 0 ) {
    	treeObj = node;
    	console.log(treeObj);
    	document.dispatchEvent(new Event('treeComplete'));
    }
  });




 //  $.get(url, function(rsp, error) {
 //    person = JSON.parse(rsp);
 //    var parents = getParents(person.persons[0].display.familiesAsChild[0], person.persons);
 //    // console.log(person.persons[0].id, person.persons[0].display.name+": ", parents.father.name, parents.mother.name);

	// 	if (node.name == null) node.name = person.persons[0].display.name;
	// 	// Find current person in json tree
	// 	var tmpNode = find(node, url);
 //    tmpNode._parents.push({id: parents.father.url, name: parents.father.name, _parents: []});
 //    tmpNode._parents.push({id: parents.mother.url, name: parents.mother.name, _parents: []});

	// 	// Get children of root person only
	// 	// TODO Get multiple generations of descendants
	// 	if (generationCount == 0) {
	// 		if (person.persons[0].display.familiesAsParent[0].children.length > 0) {
	// 			for (var i=0; i < person.persons[0].display.familiesAsParent[0].children.length; i++) {
	// 				node._children.push({id: person.persons[0].display.familiesAsParent[0].children[i].resource, name: person.persons[0].display.familiesAsParent[0].children[i].resourceId});
	// 			}
	// 		}
	// 	}

 //    // Stop after 4 generations
 //    if (generationCount < 7) {
	//     getTree(parents.father.url, node);
	//     getTree(parents.mother.url, node);
 //    }

 //    // Detect when finished
 //    if (asyncCount-- == 0 ) {
 //    	treeObj = node;
 //    	console.log(treeObj);
 //    	document.dispatchEvent(new Event('treeComplete'));
 //    }
	// }).fail(function(){
	// 	console.log("Failure!");
	// });



}

// Find person by ID in json object tree
function find(obj, id) {
  if (obj.id === id) return obj;
  for (var i = 0; i < obj._parents.length; i ++) {
    var result = find(obj._parents[i], id);
    if (result) return result;
  }
  return null;
}

// Get the parents
function getParents(family, persons) {
	var parent1 = family.parent1.resourceId;
	var parent2 = family.parent2.resourceId;
	var parents = {father: null, mother: null};
	// Iterate all persons
	for (var i=1; i<persons.length; i++) {

		// Look for first parent
		if (persons[i].id == parent1) {
			// Detect Father/Mother by gender
			if (persons[i].gender.type == "http://gedcomx.org/Male") {
				parents.father = {id: persons[i].id, name: persons[i].display.name, url: family.parent1.resource};
			} else {
				parents.mother = {id: persons[i].id, name: persons[i].display.name, url: family.parent1.resource};
			}
		}

		// Look for second parent
		if (persons[i].id == parent2) {
			// Detect Father/Mother by gender
			if (persons[i].gender.type == "http://gedcomx.org/Male") {
				parents.father = {id: persons[i].id, name: persons[i].display.name, url: family.parent2.resource};
			} else {
				parents.mother = {id: persons[i].id, name: persons[i].display.name, url: family.parent2.resource};
			}
		}

	}
	return parents;
}

// Get Query parameters
function getQueryParams() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
  }
  // Set a default location just for fun
  if (vars.id == undefined) vars.id = "https://raw.githubusercontent.com/misbach/familytree/master/people/KWCJ-RN4/KWCJ-RN4.json";
  return vars;
}
