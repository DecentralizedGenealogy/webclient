// Get starting person ID
$('.start').click(function() {
  getPerson($('.personid').val());
});

$('.container').on('click', '.fetch', function(e) {
  getPerson($(e.target).attr('data'));
});

// Get person and render person box
var graph = { "nodes": [ ], "links": [ ] };
function getPerson(url) {
  // Reset the DOM
  $('.person-box').show();
  $('.parents').html("");
  $('.graph').empty();
  graph.nodes = [];
  graph.links = [];
  
  $.get(url, function(rsp) {
    person = JSON.parse(rsp);
    console.log(person);
    $('.personid').val(person.id);

    // Portrait
    if (person.portrait) {
      $('.portrait').attr('src', person.portrait);
    } else {
      $('.portrait').attr('src', 'https://dl.dropboxusercontent.com/u/8037582/log/icons/gender-unknown-large.svg');
    }

    // Render person-box
    $('.person-name').text(person.firstname+" "+person.middlename+" "+person.surname);
    if (person.birth) {
      $('.person-birth-date').html('<span class="vitals">BIRTH</span>'+person.birth[0].date);
      $('.person-birth-place').text(person.birth[1].place);
    }
    if (person.death) {
      $('.person-death-date').html('<span class="vitals">DEATH</span>'+person.death[0].date);
      $('.person-death-place').text(person.death[1].place);
    }
    
    // Gender
    if (person.gender == "male") {
      $('.person-vitals').css("background-color","rgba(192, 202, 255, 0.26)");
      var self_icon = "images/man.svg"
      var spouse_icon = "images/woman.svg"
    }
    else {
      $('.person-vitals').css("background-color","rgba(255, 192, 203, 0.26)");
      var self_icon = "images/woman.svg"
      var spouse_icon = "images/man.svg"
    }
    
    // Notes
    $('.notes').text(person.notes);

    // ------
    // Nodes
    // ------
    graph.nodes.push({ "id": person.firstname, "relationship": "self", "color": "#1f77b4", "image": self_icon, "link": person.id });

    // Parents
    for (var i=0; i<person.parents.length; i++) {
      if (person.parents[i].father) {
        $('.parents').append('<button data="'+person.parents[i].father+'" class="fetch person-father btn btn-link">Father</button>');        
        graph.nodes.push({ "id": "father"+i, "relationship": "parent", "color": "#aec7e8", "image":"images/grandpa.svg", "link": person.parents[i].father });
        graph.links.push({ "source": "father"+i, "target": person.firstname, "line": 5 });
      }
      if (person.parents[i].mother) {
        $('.parents').append('<button data="'+person.parents[i].mother+'" class="fetch person-mother btn btn-link">Mother</button>');        
        graph.nodes.push({ "id": "mother"+i, "relationship": "parent", "color": "#aec7e8", "image":"images/grandma.svg", "link": person.parents[i].mother });
        graph.links.push({ "source": "mother"+i, "target": person.firstname, "line": 5 });
      }
    }

    // Spouse
    $('.spouse').html('');
    if (person.spouse.length > 0) {
      for (var i=0; i<person.spouse.length; i++) {
        $('.spouse').append('<li><button class="fetch btn btn-link" data="'+person.spouse[i]+'">spouse '+i+'</button></li>');
        graph.nodes.push({ "id": "spouse"+i, "relationship": "spouse", "color": "#cccccc", "image": spouse_icon, "link": person.spouse[i] });
        graph.links.push({ "source": "spouse"+i, "target": person.firstname, "line": 8 });
      }      
    }

    // Children
    $('.children').html('');
    if (person.children.length > 0) {
      for (var i=0; i<person.children.length; i++) {
        $('.children').append('<li><button class="fetch btn btn-link" data="'+person.children[i]+'">child '+i+'</button></li>');
        graph.nodes.push({ "id": "child"+i, "relationship": "child", "color": "#ff7f0e", "image":"images/boy.svg", "link": person.children[i] });
        graph.links.push({ "source": "child"+i, "target": person.firstname, "line": 11 });
      }      
    }

    // Person maintainer
    person.maintainer = url.split('/')[3];
    $('.maintainer').html('Maintainer: <a href="https://github.com/'+person.maintainer+'" target="_blank">'+person.maintainer+'</a>');
    var githubUrl = url.replace('raw.githubusercontent.com', 'github.com');
    var githubUrl = githubUrl.replace('/master/', '/blob/master/');
    $('.raw').html('Raw Source: <a href="'+githubUrl+'" target="_blank">Github</a>');
    
    console.log(graph);
    renderGraph();
  });
}

// Populate Change Request Modal
$('#edit').on('shown.bs.modal', function () {
  $('.maintainer_edit').text(person.maintainer);
  $('#first_name').val(person.firstname);
  $('#middle_name').val(person.middlename);
  $('#surname').val(person.surname);
  if (person.birth) {
    $('#birth_date').val(person.birth[0].date);
    $('#birth_place').val(person.birth[1].place);
  }
  if (person.death) {
    $('#death_date').val(person.death[0].date);
    $('#death_place').val(person.death[1].place);
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