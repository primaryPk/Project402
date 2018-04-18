const _ = require('lodash');
const NodeAllPaths = require('node-all-paths')

class Graph {
  constructor() {
    this.vertices = {};
    this.edges = {};
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {string} vertex The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  addVertex(vertex) {
    this.vertices[vertex] = true;
    this.edges[vertex] = {};
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {string} vertex1 The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  addEdge(vertex1, vertex2) {
    if (!this.hasVertex(vertex1))
      return console.error(vertex1 + ' is not vertex.');
    if (!this.hasVertex(vertex2))
      return console.error(vertex2 + ' is not vertex.');

    this.edges[vertex1][vertex2] = 1;
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {string} vertex The numeric MIDI pitch value to convert.
   * @returns {boolean} The resulting symbolic note name.
   */
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