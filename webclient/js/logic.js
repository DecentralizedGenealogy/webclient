// Get starting person ID
$('.start').click(function() {
  getPerson($('.personid').val());
});

$('.container').on('click', '.fetch', function(e) {
  getPerson($(e.target).attr('data'));
});

// Get person and render person box
function getPerson(url) {
  // Reset the DOM
  $('.person-box').show();
  $('.parents').html("");
  $('.graph').empty();
  graph.nodes = [];
  graph.links = [];
  
  // Person maintainer
  var maintainer = url.split('/')[3];
  $('.maintainer').html('Maintainer: <a href="https://github.com/'+maintainer+'">'+maintainer+'</a>');
  var githubUrl = url.replace('raw.githubusercontent.com', 'github.com');
  var githubUrl = githubUrl.replace('/master/', '/blob/master/');
  $('.raw').html('Raw Source: <a href="'+githubUrl+'">Github</a>');
  
  $.get(url, function(rsp) {
    person = JSON.parse(rsp);
    console.log(person);

    // Portrait
    if (person.portrait) {
      $('.portrait').attr('src', person.portrait);
    } else {
      $('.portrait').attr('src', 'https://dl.dropboxusercontent.com/u/8037582/log/icons/gender-unknown-large.svg');
    }

    // Render person-box
    $('.person-name').text(person.firstname+" "+person.middlename+" "+person.surname);
    if (person.birth) {
      $('.person-birth-date').text("Birth Date: "+person.birth[0].date);
      $('.person-birth-place').text("Birth Place: "+person.birth[1].place);
    }
    if (person.death) {
      $('.person-death-date').text("Death Date: "+person.death[0].date);
      $('.person-death-place').text("Death Place: "+person.death[1].place);
    }
    
    // Gender
    if (person.gender == "male") $('.person-vitals').css("background-color","rgba(192, 202, 255, 0.26)");
      else $('.person-vitals').css("background-color","rgba(255, 192, 203, 0.26)");
    
    // Notes
    $('.notes').text(person.notes);

    graph.nodes.push({ "id": person.firstname, "relationship": "self", "color": 0 });

    // Parents
    for (var i=0; i<person.parents.length; i++) {
      if (person.parents[i].father) {
        $('.parents').append('<button data="'+person.parents[0].father+'" class="fetch person-father btn btn-link">Father</button>');        
        graph.nodes.push({ "id": "father"+i, "relationship": "parent", "color": 3 });
        graph.links.push({ "source": "father"+i, "target": person.firstname, "line": 5 });
      }
      if (person.parents[i].mother) {
        $('.parents').append('<button data="'+person.parents[0].mother+'" class="fetch person-mother btn btn-link">Mother</button>');        
        graph.nodes.push({ "id": "mother"+i, "relationship": "parent", "color": 3 });
        graph.links.push({ "source": "mother"+i, "target": person.firstname, "line": 5 });
      }
    }

    // Spouse
    $('.spouse').html('');
    if (person.spouse.length > 0) {
      for (var i=0; i<person.spouse.length; i++) {
        $('.spouse').append('<li><button class="fetch btn btn-link" data="'+person.spouse[i]+'">spouse '+i+'</button></li>');
        graph.nodes.push({ "id": "spouse"+i, "relationship": "spouse", "color": 1 });
        graph.links.push({ "source": "spouse"+i, "target": person.firstname, "line": 10 });
      }      
    }

    // Children
    $('.children').html('');
    if (person.children.length > 0) {
      for (var i=0; i<person.children.length; i++) {
        $('.children').append('<li><button class="fetch btn btn-link" data="'+person.children[i]+'">child '+i+'</button></li>');
        graph.nodes.push({ "id": "child"+i, "relationship": "child", "color": 2 });
        graph.links.push({ "source": "child"+i, "target": person.firstname, "line": 20 });
      }      
    }
    
    // kickoff oneHop call to generate tree
    oneHop(person);    
    
  });

}

// Get all immediate relationships
var graph = { "nodes": [ ], "links": [ ] };
function oneHop (person) {
  renderGraph();
}

function renderGraph() {
  var svg = d3.select("svg");
  var width = +svg.attr("width");
  var height = +svg.attr("height");
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.line); });

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 10)
    .attr("fill", function(d) { return color(d.color); })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  node.append("title").text(function(d) { return d.id; });

  simulation.nodes(graph.nodes).on("tick", ticked);
  simulation.force("link").links(graph.links);

  function ticked() {
    link
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
  }

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