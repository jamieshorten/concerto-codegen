/**
 * Convert the contents of a ModelManager to a directed graph where types are
 * vertices and edges are relationships between types.
 *
 * @protected
 * @class
 * @memberof module:concerto-util
 */
export class ConcertoGraphVisitor extends BaseVisitor {
    /**
     * Visitor design pattern
     * @param {ClassDeclaration} classDeclaration - the object being visited
     * @param {Object} parameters  - the parameter
     * @property {boolean} parameters.includeDerivedTypes - If this option is enabled, edges will be created from super types to their derived types.
     * This guarantees that if type X exists in the model manager, all types that inherit from X will be represented in the graph.
     * @protected
     */
    protected visitClassDeclaration(classDeclaration: ClassDeclaration, parameters: any): void;
    addEdgeForDecorator(name: any, parent: any, modelFile: any, parameters: any): void;
    /**
     * Visitor design pattern
     * @param {MapDeclaration} mapDeclaration - the object being visited
     * @param {Object} parameters  - the parameter
     * @protected
     */
    protected visitMapDeclaration(mapDeclaration: MapDeclaration, parameters: any): void;
}
export class DirectedGraph {
    /**
     * Construct a new graph from an adjacency map representation.
     *
     * Vertices are represented by strings.
     * Edges are a list of names of connected vertices
     *
     * @param {Object.<string, string[]>} adjacencyMap - initial graph
     */
    constructor(adjacencyMap?: {
        [x: string]: string[];
    });
    adjacencyMap: {
        [x: string]: string[];
    };
    /**
     * Checks if the graph has an edge from source to target
     * @param {string} source - the origin of the edge
     * @param {string} target - the destination of the edge
     * @return {boolean} - true, if the graph has the edge
     */
    hasEdge(source: string, target: string): boolean;
    /**
     * Adds an edge from `source` to `target`
     * @param {string} source - the origin of the edge
     * @param {string} target - the destination of the edge
     */
    addEdge(source: string, target: string): void;
    /**
     * Checks if the graph has a named vertex
     * @param {string} vertex - the name of the new vertex
     * @return {boolean} - true, if the graph has the named vertex
     */
    hasVertex(vertex: string): boolean;
    /**
     * Add a vertex to the graph
     * @param {string} vertex - the name of the new vertex
     */
    addVertex(vertex: string): void;
    /**
     * A utility which traverses this directed graph from the `source` vertex
     * to visit all connected vertices to find the maximal subgraph.
     *
     * This is useful for finding disconnected subgraphs,
     * i.e. so-called "tree-shaking".
     *
     * Optionally supports a list of source vertices, to allow searching from
     * multiple start vertices.
     *
     * Returns a new DirectedGraph instance
     *
     * @param {string | string[]} source - The root vertex (or vertices) from
     * which to begin the search
     * @returns {DirectedGraph} - A maximal subgraph
     */
    findConnectedGraph(source: string | string[]): DirectedGraph;
    /**
     * Visualizes the graph as a Mermaid Flowchart
     *
     * @param {Writer} writer - Buffer for text to be written
     */
    print(writer: Writer): void;
}
import BaseVisitor = require("./basevisitor");
import { ClassDeclaration } from "@accordproject/concerto-core";
import { MapDeclaration } from "@accordproject/concerto-core";
import { Writer } from "@accordproject/concerto-util";
