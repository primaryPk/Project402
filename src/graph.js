const _ = require('lodash');
const NodeAllPaths = require('node-all-paths')

class Graph {
  constructor() {
    this.vertices = {};
    this.edges = {};
  }

  addVertex(vertex) {
    this.vertices[vertex] = true;
    this.edges[vertex] = {};
  }

  addEdge(vertex1, vertex2) {
    if (!this.hasVertex(vertex1))
      return console.error(vertex1 + ' is not vertex.');
    if (!this.hasVertex(vertex2))
      return console.error(vertex2 + ' is not vertex.');

    this.edges[vertex1][vertex2] = 1;
  }

  hasVertex(vertex) {
    return this.vertices[vertex]
  }

  findAllPath(source) {
    let all_path = [];    
    const route = new NodeAllPaths(this.edges);

    _.forEach(this.vertices, function (value, key) {
      all_path = _.concat(all_path, route.path(source, key) || []);      
    });
    
    return all_path;
  }
}

module.exports = Graph;