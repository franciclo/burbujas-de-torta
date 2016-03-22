//Preparar layout
var bubble = d3.layout.pack()
    .sort(null)
    .size([500, 500])
    .padding(20);

var svg = d3.select("body")
    .append("svg")
    .style("width", '500px')
    .style("height", '500px');

//Elementos dinamicos
var torta_input = document.getElementById('torta_input');
var burbuja_input = document.getElementById('burbuja_input');
var label_burbu = document.getElementById('label');

//Get .csv
d3.csv("acceso-informacion-publica.csv", function(csv_data) {

  //Graficar!
  document.querySelector('aside button').addEventListener('click', function(e){
    var que_torta = document.getElementById('torta_input').value;
    var que_burbuja = document.getElementById('burbuja_input').value;
    Graficar(que_burbuja, que_torta);
  });

  //Cargar las opciones de datos
  Object.keys(csv_data[0]).forEach(function(v){
    var opt = document.createElement('option');
    opt.innerHTML = opt.value = v;
    torta_input.appendChild(opt);
    burbuja_input.appendChild(opt.cloneNode(true));
  });

  function Graficar(burbuja, torta){
    //Resetear grafico
    document.querySelector('svg').innerHTML = '';

    //Parsear la data
    var xMinisterios = [];
    csv_data.forEach(function(v){
      if (typeof xMinisterios[v[burbuja]] != 'object') {
        xMinisterios[v[burbuja]] = [];
      }
      if (typeof xMinisterios[v[burbuja]][v[torta]] != 'object') {
        xMinisterios[v[burbuja]][v[torta]] = [];
      }
      xMinisterios[v[burbuja]][v[torta]].push(v);
    });

    //console.log(xMinisterios)

    //Separar lo que se va a graficar
    var data_pa_graficar = Object.keys(xMinisterios)
      .map(function(m){
        return { 
          item:m,
          values: Object.keys(xMinisterios[m])
            .map(function(v){
              return { label: v, val:xMinisterios[m][v].length };
            })
        }
      }).map(function(v){
        v.value = v.values
          .map(function(v){return v.val})
          .reduce(function(a, b){ return a + b; });
          return v;
      });

    //Bindear datos al layout
    var burbujas = svg
      .append("g")
      .selectAll("svg")
      .data( 
        bubble
          .nodes({children:data_pa_graficar})
          .filter(function(d) { return !d.children; })
      );

    //Ubicar burbujas y mostrar sus referencias al pasar el cursor
    burbujas
      .enter()
      .append("g")      
      .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y+ ")"; 
      })
      .on("mouseover", function(d) {
        label_burbu.innerHTML = d.item;
      })
      .on("mouseout", function(d) {
        label_burbu.innerHTML = "";
        //  d.parent
        //   .children
        //   .map(function(v){
        //     return '<p class="gris">'+v.item+"</p>";
        //   })
        //   .join('');
      });

    //Referencias de tortas
    var referencias = []
      .concat.apply([], 
        Object.keys(xMinisterios)
          .map(function(v){ return Object.keys(xMinisterios[v]) }))
      .filter(function(v,i,a){ return a.indexOf(v) === i });

    var color = d3.scale.category20()
    
    var refes_div = document.getElementById('refes');
    refes_div.innerHTML = "";
    referencias.forEach(function(v){
      refes_div.innerHTML += 
        "<div class='ref'>"+
          "<span class='ref-color' style='background:"+color(v)+";'></span>"+
          "<span class='ref-label'>" +v+ "</span>"+
        "</div>";
    });

    //Tortas
    var arc = d3.svg.arc().innerRadius(0);
    var pie = d3.layout.pie();
    burbujas
      .selectAll("g.torta")
      .data(function(d) {
        return pie( d.values.map(function(v){return v.val}) )
          .map(function(m) { 
            m.lbl = d.values.map(function(v){return v.label});
            m.r = d.r; 
            return m; 
          });
      })
      .enter()
      .append("g")
      .attr("class", "torta")
      .append("path")
      .attr("d", function(d) {
        arc.outerRadius(d.r);
        return arc(d);
      })
      .style("fill", function(d, i) {
        return color(d.lbl[i]); 
      });
  };
});