var person = null;
var self_icon = null;
var spouse_icon = null;
var graph = { "nodes": [ ], "links": [ ] };
var params = getQueryParams();

getPerson(params.id);

// Get person and render person box
function getPerson(url) {
  // Reset the DOM
  $('.person-box').show();
  $('.parents').html("");
  $('.graph').empty();
  $('.sources').empty();
  $('.memories').empty();
  $('.spouse').empty();
  $('.children').empty();
  graph.nodes = [];
  graph.links = [];

  $.get(url, function(rsp) {
    person = JSON.parse(rsp);
    person.maintainer = '<a href="'+url+'" target="_blank">'+url.split("/")[3]+'</a>';
    console.log(person);

    // Update the URL
    window.history.pushState('page', null, window.location.href.split("?")[0]+'?id='+url);

    // Portrait
    if (person.persons[0].links.portrait) {
      $('.portrait').attr('src', person.persons[0].links.portrait.href);
    } else {
      $('.portrait').attr('src', '/images/unknown.svg');
    }

    // Render person-box
    $('.person-name').text(person.persons[0].display.name);
    $('.person-birth-date').html('<span class="vitals">BIRTH</span>'+person.persons[0].display.birthDate);
    $('.person-birth-place').text(person.persons[0].display.birthPlace);
    $('.person-death-date').html('<span class="vitals">DEATH</span>'+person.persons[0].display.deathDate);
    $('.person-death-place').text(person.persons[0].display.deathDate);
    
    // Gender
    if (person.persons[0].display.gender == "Male") {
      $('.person-vitals').css("background-color","rgba(192, 202, 255, 0.26)");
      self_icon = "/images/man.svg"
      spouse_icon = "/images/woman.svg"
    }
    else {
      $('.person-vitals').css("background-color","rgba(255, 192, 203, 0.26)");
      self_icon = "/images/woman.svg"
      spouse_icon = "/images/man.svg"
    }
    
    // Sources
    for (var i=1; i<person.sourceDescriptions.length; i++) {
      var sourceId = person.sourceDescriptions[i].links.description.href.split('/')[6];
      var title = person.sourceDescriptions[i].titles[0].value;
      var sourceUrl="https://familysearch.org/links-pages/sourceVE?&sourceId="+sourceId;
      $('.sources').append('<li><a href="'+sourceUrl+'" target="_blank">'+title+'</a></li>');
    }

    // Memories
    for (var i=0; i<person.persons[0].evidence.length; i++) {
      var memoryId = person.persons[0].evidence[i].id.split('-')[0];
      var memoryUrl = "https://familysearch.org/photos/artifacts/"+memoryId;
      $('.memories').append('<li><a href="'+memoryUrl+'" target="_blank">'+memoryId+'</li>')
    }

    // Render one hop nodes
    oneHop(person.persons[0].display); 
    renderGraph();
  });
}


// Parse display->families for one Hop relationships
var oneHopPerson = { type: "", rel: "", url: "", id: ""};
function oneHop(family) {
  Object.keys(family).forEach(function(key) {
    // Detect what type of relationship
    if (key == "familiesAsParent") oneHopPerson.type = "parent";
    if (key == "familiesAsChild") oneHopPerson.type = "child";
    if (key == "resource") oneHopPerson.url = family[key];
    if (key == "parent1" || key == "parent2" || key == "children") oneHopPerson.rel = key;

    // We are done when we hit a resourceId
    if (key == "resourceId") {
      oneHopPerson.id = family[key];
      // Self
      if (oneHopPerson.type == "parent" && oneHopPerson.rel == "parent1") {
        graph.nodes.push({ "id": person.persons[0].display.name, "relationship": "self", "color": "#1f77b4", "image": self_icon, "link": "" });
      }
      // Spouse
      if (oneHopPerson.type == "parent" && oneHopPerson.rel == "parent2") {
        $('.spouse').append('<li><button class="fetch btn btn-link" data="'+oneHopPerson.url+'">spouse</button></li>');
        graph.nodes.push({ "id": "spouse", "relationship": "spouse", "color": "#cccccc", "image": spouse_icon, "link": oneHopPerson.url });
        graph.links.push({ "source": "spouse", "target": person.persons[0].display.name, "line": 8 });
      }
      // Father
      if (oneHopPerson.type == "child" && oneHopPerson.rel == "parent1") {
        $('.parents').append('<li><button data="'+oneHopPerson.url+'" class="fetch person-father btn btn-link">Father</button></li>');
        graph.nodes.push({ "id": "father", "relationship": "parent", "color": "#aec7e8", "image":"/images/grandpa.svg", "link": oneHopPerson.url });
        graph.links.push({ "source": "father", "target": person.persons[0].display.name, "line": 5 });
      }
      // Mother
      if (oneHopPerson.type == "child" && oneHopPerson.rel == "parent2") {
        $('.parents').append('<li><button data="'+oneHopPerson.url+'" class="fetch person-mother btn btn-link">Mother</button></li>');
        graph.nodes.push({ "id": "mother", "relationship": "parent", "color": "#aec7e8", "image":"/images/grandma.svg", "link": oneHopPerson.url });
        graph.links.push({ "source": "mother", "target": person.persons[0].display.name, "line": 5 });
      }
      // Children
      if (oneHopPerson.type == "parent" && oneHopPerson.rel == "children") {
        $('.children').append('<li><button class="fetch btn btn-link" data="'+oneHopPerson.url+'">child</button></li>');
        graph.nodes.push({ "id": "child"+oneHopPerson.id, "relationship": "child", "color": "#ff7f0e", "image":"/images/boy.svg", "link": oneHopPerson.url });
        graph.links.push({ "source": "child"+oneHopPerson.id, "target": person.persons[0].display.name, "line": 11 });
      }
    }

    // If there is still an object or an array keep iterating
    if (typeof family[key] != 'string') oneHop(family[key]);
  });
}

// Populate Change Request Modal
$('#edit').on('shown.bs.modal', function () {
  $('.maintainer').html(person.maintainer);
  $('#first_name').val(person.persons[0].display.name);
  $('#middle_name').val(person.middlename);
  $('#surname').val(person.surname);
  if (person.persons[0].display.birthDate) {
    $('#birth_date').val(person.persons[0].display.birthDate);
    $('#birth_place').val(person.persons[0].display.birthPlace);
  }
  if (person.persons[0].display.deathDate) {
    $('#death_date').val(person.persons[0].display.deathDate);
    $('#death_place').val(person.persons[0].display.deathPlace);
  }
})

// Render onehop tree
function renderGraph() {
  var svg = d3.select("svg");
  var width = +svg.attr("width");
  var height = +svg.attr("height");

  var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("link", d3.forceLink());

  simulation.nodes(graph.nodes);
  simulation
    .force("link")
    .id(function(d) { return d.id; })
    .distance("100")
    .links(graph.links);

  var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .attr("stroke-width", function(d) { return d.line; });;

  var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
      .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  node.append("image")
    .attr("xlink:href", function(d) { return d.image; })
    .attr("class", "node_img")
    .attr("x", -32)
    .attr("y", -32);

  node.append("a")
    .append("text")
    .attr("dx", 5)
    .attr("dy", 55)
    .attr("text-anchor", "middle")
    .attr("class","fetch")
    .attr("data", function(d) { return d.link })
    .text(function(d) { return d.id });

  // Add hover text to nodes
  node.append("title").text(function(d) { return d.id; });

  simulation.on("tick", function() {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

// Load a new person
$('.container').on('click', '.fetch', function(e) {
  getPerson($(e.target).attr('data'));
});

// Reload person if back button is pressed
window.addEventListener('popstate', function(event) {
  getPerson(params.id);
}, false);

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
