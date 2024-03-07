function Globe() {
  var width = 160,
    height = 160,
    scale = width / 2 - 4,
    color = 'rgba(0,0,0,255)',
    lightColor = 'white';

  var sphere = {type: "Sphere"},
      upper = d3.geo.graticule()
        .step([30, 30])
        .extent([[-180,0],[180,90]]),
      lowerFill = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature', properties: { name: 'swf' }, geometry: {
              type: 'Polygon',
              coordinates: [[[-90, -90 ], [-90, -0.01 ], [0, -0.01 ], [0, -90 ], [-90, -90 ] ] ]
            }
          },
          {
            type: 'Feature', properties: { name: 'sef' }, geometry: {
              type: 'Polygon',
              coordinates: [[[0, -90 ], [0, -0.01 ], [90, -0.01 ], [90, -90 ], [0, -90 ] ] ]
            }
          },
          {
            type: 'Feature', properties: { name: 'seb' }, geometry: {
              type: 'Polygon',
              coordinates: [[[90, -90 ], [90, -0.01 ], [180, -0.01 ], [180, -90 ], [90, -90 ] ] ]
            }
          },
          {
            type: 'Feature', properties: { name: 'swb' }, geometry: {
              type: 'Polygon',
              coordinates: [[[-180, -90 ], [-180, -0.01 ], [-90, -0.01 ], [-90, -90 ], [-180, -90 ] ] ]
            }
          }
        ]
      },
      dot = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[0, 8], [0, 12]]
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[0, -8], [0, -12]]
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[8, 0], [12, 0]]
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[-8, 0], [-12, 0]]
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[5.6, 5.6], [7.9, 7.9]]
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[-5.6, -5.6], [-7.9, -7.9]]
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[5.6, -5.6], [7.9, -7.9]]
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[-5.6, 5.6], [-7.9, 7.9]]
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [0, 0]
            }
          }
        ]
      };

  var events = d3.dispatch('change');

  var svg;

  function globe(selection) {
      var projStill = d3.geo.orthographic()
          .precision(0.3 / scale)
          .translate([width / 2, height / 2])
          .clipAngle(90)
          .rotate([0, -5, 0])
          .scale(height / 4),

          projRotate = d3.geo.orthographic()
          .precision(0.3 / scale)
          .translate([width / 2, height / 2])
          .clipAngle(90)
          .rotate([45, 45, 0])
          .scale(height / 2);

     svg = selection.append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class','abs')
      .append('g');

    svg.append('path')
      .attr('class','nomove')
      .datum(lowerFill)
      .attr('fill', color)
      .attr('stroke', 'none')
      .attr('d', d3.geo.path()
          .projection(projStill));

    var sens = 1;

    svg.append('path')
      .attr('class','nomove')
      .datum(upper())
      .attr('fill', 'rgba(0,0,0,0)')
      .attr('stroke', color)
      .attr('d', d3.geo.path()
          .projection(projStill));

    svg.append('path')
      .attr('class', 'move')
      .datum(dot)
      .attr('stroke', lightColor)
      .attr('fill', lightColor);

    svg.append('path')
      .datum({ type: 'Sphere' })
      .attr('fill', 'rgba(0,0,0,0)')
      .attr('class', 'grabby')
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('d', d3.geo.path()
          .projection(projRotate))
      .on('mousedown', function() {
        d3.select(this).attr('class', 'grabbed');
      })
      .on('mouseup', function() {
        d3.select(this).attr('class', 'grabby');
      })
      .call(d3.behavior.drag()
        .origin(function() { var r = projRotate.rotate(); return { x: r[0] / sens, y: -r[1] / sens}})
        .on('drag', function() {
          var rotate = projRotate.rotate();
          projRotate.rotate([d3.event.x * sens, Math.min(90, Math.max(-90, -d3.event.y * sens)), rotate[2]]);
          events.change(translateRotation(projRotate.rotate()));
          svg.selectAll('.move').attr('d', d3.geo.path().projection(projRotate));
        }));

    svg.selectAll('.move').attr('d', d3.geo.path().projection(projRotate));
  }

  globe.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return globe;
  }

  globe.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return globe;
  }

  globe.color = function(_) {
    if (!arguments.length) return color;
    color = _;
    return globe;
  }

  globe.lightColor = function(_) {
    if (!arguments.length) return lightColor;
    lightColor = _;
    if (svg) svg.selectAll('.move').attr('fill', _).attr('stroke', _);
    return globe;
  }

  function translateRotation(rotation) {
    return [1.15, -rotation[0] + 180, -rotation[1] + 90];
  }

  return d3.rebind(globe, events, 'on', 'off');
}
