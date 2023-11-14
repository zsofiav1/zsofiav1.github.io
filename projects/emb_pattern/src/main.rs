
use itertools::Itertools;
use std::collections::{HashMap, HashSet};
use petgraph::graph::{NodeIndex, UnGraph};
use petgraph::data::FromElements;
use petgraph::dot::{Dot, Config};


fn main() {
    //println!("Hello, world!");
    let nodes: HashMap<&str, (i32, i32)> = HashMap::from([
        ("A", (0,0)),
        ("B", (0,2)),
        ("C", (2,2)),
        ("D", (2,0)),
    ]);
    //let nodes = {'A': (0,0), 'B': (0,2), 'C': (2,2), 'D': (2,0)};
    let edges = [('A', 'B'), ('C', 'D'), ('D', 'A'), ('B', 'D')];
}

fn getRWGraphs(node_list: HashMap<&str, (i32, i32)>, edge_list: &[(char,char)]){
    //let R = UnGraph::<i32, ()>::from_edges(&edge_list);

}
