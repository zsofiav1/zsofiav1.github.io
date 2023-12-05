
use itertools::Itertools;
use std::collections::HashMap;
use petgraph::graph::{NodeIndex, UnGraph};
use petgraph::data::FromElements;
use petgraph::dot::{Dot, Config};
use wasm_bindgen::prelude::*;


fn main() {
    //println!("Hello, world!");
    let nodes: HashMap<char, (i32, i32)> = HashMap::from([
        ('A', (0,0)),
        ('B', (0,2)),
        ('C', (2,2)),
        ('D', (2,0)),
    ]);
    //let nodes = {'A': (0,0), 'B': (0,2), 'C': (2,2), 'D': (2,0)};
    let edges = [('A', 'B'), ('C', 'D'), ('D', 'A'), ('B', 'D')];
}

fn getRWGraphs(node_list: HashMap<char, (i32, i32)>, edge_list: &[(char,char)]) -> (UnGraph<(i32,i32), (bool, f32)>, UnGraph::<((i32, i32), usize), f32>){
    let mut node_indices: HashMap<char, NodeIndex> = HashMap::new();
    let mut rightside = UnGraph::<(i32,i32), (bool, f32)>::new_undirected();
    //let mut W = UnGraph::<(i32,i32), f32>::new_undirected();

    //Add each node to the graph
    for (name, position) in node_list {
        let node_index = rightside.add_node(position);
        node_indices.insert(name, node_index);
    }
    
    //add edges to graph
    for (start, end) in edge_list {
        let start_index = node_indices[&start];
        let end_index = node_indices[&end];
        // Calculate the distance and use it as the edge weight
        let distance = calculate_distance(rightside[start_index], rightside[end_index]);
        rightside.add_edge(start_index, end_index, (false, distance));
    }
    let mut wrongside = UnGraph::<((i32, i32), usize), f32>::new_undirected();

    // Map to store new node indices and positions
    let mut new_node_indices: HashMap<NodeIndex, (NodeIndex, (i32, i32))> = HashMap::new();

    // Copy nodes with updated weight
    for node_idx in rightside.node_indices() {
        let position = rightside[node_idx];
        let neighbors_count = rightside.neighbors(node_idx).count();
        let new_node_idx = wrongside.add_node((position, neighbors_count));
        new_node_indices.insert(node_idx, (new_node_idx, position));
    }

    // Create edges between all pairs of nodes
    for (&node_idx1, &(new_node_idx1, pos1)) in &new_node_indices {
        for (&node_idx2, &(new_node_idx2, pos2)) in &new_node_indices {
            if node_idx1 != node_idx2 {
                let distance = calculate_distance(pos1, pos2);
                wrongside.add_edge(new_node_idx1, new_node_idx2, distance);
            }
        }
    }
    (rightside,wrongside)


}

fn calculate_distance(pos1: (i32, i32), pos2: (i32, i32)) -> f32 {
    let dx = pos2.0 - pos1.0;
    let dy = pos2.1 - pos1.1;
    ((dx * dx + dy * dy) as f32).sqrt()
}

//get nearest neighbor of rightside node
// fn get_nearest_neighbor(rightside: &UnGraph<(i32,i32), (bool, f32)>, node_idx: NodeIndex) -> NodeIndex {
//     //let mut min_distance = std::f32::MAX;
//     let mut nearest_neighbor = None;
//     for neighbor_idx in rightside.neighbors(node_idx) {
//         let (_, distance) = rightside.edge_weight(node_idx, neighbor_idx).unwrap();
//         if *distance < min_distance {
//             min_distance = *distance;
//             nearest_neighbor = Some(neighbor_idx);
//         }
//     }
//     nearest_neighbor.unwrap()
// }

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
