use std::collections::HashSet;
use std::fs;
use std::time;
use std::fs::File;
use std::path::Path;
use itertools::Itertools;
use json::{object,JsonValue};
use std::collections::HashMap;
use std::io::{self,BufRead, Read};

fn main() -> io::Result<()> {
    let t0 = time::Instant::now();
    let word_list_path = "word_list.txt";
    let word_struct_path = "word_struct.json";

    let letters = [
        ['P', 'N', 'B'],
        ['K', 'T', 'M'],
        ['A', 'R', 'I'],
        ['O', 'U', 'C']];
    let mut letters_flat: Vec<char> = Vec::new();
    for set in letters{
        for letter in set{
            letters_flat.push(letter);
        }
    }
    let permutations = get_permutations(&letters)?;
    println!("{:?}", permutations);

    let hashmap = match File::open(word_struct_path) {
        Ok(mut file) => {
            // If the file exists, you can proceed with your operations on the file
            println!("File opened successfully.");
            let mut contents = String::new();
            file.read_to_string(&mut contents)?;
            // Parse the JSON content
            let json = json::parse(&contents).unwrap_or_else(|_| json::JsonValue::new_object());

            // Convert the JSON to a HashMap
            let mut hashmap = HashMap::new();
            if let JsonValue::Object(obj) = json {
                for (key, value) in obj.iter() {
                    if let JsonValue::Array(arr) = value {
                        let strings: HashSet<String> = arr
                            .iter()
                            .filter_map(|val| val.as_str())
                            .map(String::from)
                            .collect();
                        if strings.is_disjoint(&permutations){ hashmap.insert(key.to_string(), strings);}
                        
                    }       
                }
            }
            hashmap
        },
        Err(e) => {
            if e.kind() == io::ErrorKind::NotFound {
                // If the file does not exist, call the function to create it
                let file = create_file(word_struct_path, word_list_path)?;
                println!("File created successfully.");
                file
            } else {
                // Handle other kinds of errors
                return Err(e);
            }
        }
    };
    
    
    println!("{:?}", hashmap.get("PROMOTION".into()));

    let mut filtered_words: Vec<String> = hashmap
        .iter()
        .filter(|&(_, values)| {
            !values
            .iter()
            .any(|value| permutations.contains(value))
        })
        .map(|(key, _)| key)
        .filter(|word| {
            word
            .chars()
            .all(|c| letters_flat.contains(&c))
        })
        .cloned()
        .collect();
    filtered_words.sort();

    let mut list: Vec<(String,String)> = Vec::new();

    for word1 in &filtered_words {
        for word2 in &filtered_words {
            if word1 == word2 { continue }
            // Check if the last character of word1 matches the first character of word2
            if word1.ends_with(&word2[0..1]) {
                let concatenated = format!("{}{}", word1, word2);
                if letters_flat.iter().all(|&c| concatenated.contains(c)){
                    list.push((word1.clone(), word2.clone()));
                }
                // else {
                //     for word3 in &filtered_words {
                //         // Check if the last character of word2 matches the first character of word3
                //         if word2.ends_with(&word3[0..1]) {
                //             let concatenated = format!("{}{}{}", word1, word2, word3);
                //             if letters_flat.iter().all(|&c| concatenated.contains(c)){
                //                 list.push(MyTuple::Tuple3(word1.clone(), word2.clone(), word3.clone()));
                //             }
                //         }
                //     }
                // }
            }
        }
    }
    let elapsed = time::Instant::now() - t0;

    for item in &list { println!("{}, {}", item.0, item.1);}
    println!("{:?}", list.len());
    println!("{:?}", elapsed.as_secs_f32());
    
    Ok(())
}

// Function to read words from a file and return them as a vector of strings
fn read_words_from_file<P: AsRef<Path>>(path: P) -> io::Result<Vec<String>> {
    let file = File::open(path)?;
    let reader = io::BufReader::new(file);
    
    // Collect words into a vector
    let words = reader
        .lines()
        .filter_map(Result::ok)
        .collect::<Vec<String>>();
    Ok(words)
}

fn get_permutations(letters: &[[char; 3]; 4]) -> io::Result<HashSet<String>>{
    let mut permutations : HashSet<String> = HashSet::new();
    for side in letters{
        permutations.extend(
            side
            .iter()
            .permutations(2)
            .map(|combo| combo.into_iter().collect::<String>())
            .collect::<HashSet<String>>())
    }
    Ok(permutations)

}

fn create_file<P: AsRef<Path>>(word_struct_path: P, word_list_path: P) -> io::Result<HashMap<String, HashSet<String>>> {
    //let mut file = File::create(path)?;
    let words = read_words_from_file(word_list_path)?;
    //println!("{}", words.contains(&"PROMOTION".to_string()));
    let mut substrings_map: HashMap<String, HashSet<String>> = HashMap::new();

    for word in words.iter().cloned() {
        // Only process words that are at least 2 characters long
        if word.len() >= 3 {
            // let substrings = (0..word.len() - 1)
            //     .map(|i| word[i..i + 2].to_string())
            //     .collect::<Vec<String>>();
            let mut substrings = HashSet::new();
            for w in word
                .chars()
                .collect::<Vec<char>>()
                .windows(2) {
                    //let pair = (w[0], w[1]); // or format!("{}{}", window[0], window[1]) for string pairs
                    substrings
                    .insert(format!("{}{}", w[0], w[1]));
                }
            substrings_map.insert(word, substrings);
        } 
    }
    let mut json_map = object!{};

    for (key, values) in &substrings_map {
        // Manually create a JsonValue array
        let mut json_array = JsonValue::new_array();
        for val in values {
            // Push each value into the array
            json_array.push(val.as_str()).unwrap();  // val.as_str() converts &String to &str
        }
    
        json_map[key] = json_array;
    }

    // Convert the JSON object to a string
    let serialized = json_map.dump();

    // Write to a file
    fs::write(word_struct_path, serialized)?;
    Ok(substrings_map.clone())
}




