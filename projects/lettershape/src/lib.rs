// ---------------------------------------------------------------------------------------------
// external
// ---------------------------------------------------------------------------------------------
use std::time;
use std::fs::File;
use std::path::Path;
use std::io::{self, BufRead};
use wasm_bindgen::prelude::*;
use std::collections::HashSet;

#[wasm_bindgen]
pub struct LetterShape {
    pub num_sides: usize,
    pub num_inputs_per_side: usize,
    letters: Vec<Vec<char>>,
}

#[wasm_bindgen]
/// Solver for the NYT Letterbox puzzle, but generalized to any number of sides and inputs per side.
/// Hence the name `LetterShape` instead of `Letterbox`!
/// 
/// # Description
/// 
/// The NYT Letterbox puzzle is constrained to a a 4x3 array of letters
/// Given said letters, find all valid solutions where the last letter of the first word
/// matches the first letter of the second word, and the last letter of the second word matches
/// the first letter of the third word.
/// 
/// # Example
/// 
/// ```no_run
/// let letters = [
///     ['i', 'f', 't'],
///     ['m', 'a', 'o'],
///     ['d', 'r', 'w'],
///     ['e', 'l', 'h']
/// ];
/// 
/// // ...
/// // solutions: [("DEFOLIATE", "EARTHWORM"), ("FLOWMETER", "RAWHIDE"), ("FLOWMETER", "RAWHIDED"), ("WEALTHIER", "REFORMED")]
/// ```
impl LetterShape {
    /// Creates a new `LetterShape` with the given letters.
    ///
    /// # Arguments
    ///
    /// * `letters` - A string of letters, delimited by a semicolon, representing the letters to permute.
    ///
    /// # Returns
    ///
    /// A new `LetterShape` instance.
    pub fn new(letters: &str) -> Result<LetterShape, JsValue> {
        let letters = split_using_delimiter(letters, ';');
        Ok(LetterShape {
            num_sides: letters.len(),
            num_inputs_per_side: letters[0].len(),
            letters: letters,
        })
    }

    /// Solves the problem.
    ///
    /// This method attempts to solve the problem and returns a `Result` indicating success or failure.
    /// If the problem is solved successfully, it returns `Ok(())`. Otherwise, it returns an `Err` containing
    /// a boxed `dyn Error` trait object that describes the error encountered during solving.
    pub fn solve(&self) -> Result<JsValue, JsValue> {
        // ---------------------------------------------------------------------------------------------
        // start timer
        // ---------------------------------------------------------------------------------------------
        let t0 = time::Instant::now();
        // ---------------------------------------------------------------------------------------------
        // get the letters and convert them to a Vec<Vec<char>>
        // ---------------------------------------------------------------------------------------------
        let letters = &self.letters;
        // let letters = [
        //     ['i', 'f', 't'],
        //     ['m', 'a', 'o'],
        //     ['d', 'r', 'w'],
        //     ['e', 'l', 'h']
        // ];
        // // convert to Vec<Vec<char>>
        // let letters: Vec<Vec<char>> = letters
        //     .iter()
        //     .map(|side| side.to_vec())
        //     .collect();
        // ---------------------------------------------------------------------------------------------
        // file path to word list (with no repeating characters), and load
        // ---------------------------------------------------------------------------------------------
        let word_list_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("data").join("word_list_no_repeat.txt");
        let words = read_words_from_file(word_list_path);
        let words = match words {
            Ok(words) => words,
            Err(_e) => return Err(JsValue::from_str("ERROR: could not read word list from file")),
            // Err(e) => return "ERROR: could not read word list from file".into(),
            // Err(e) => return Err(Box::new(e)),
        };
        // ---------------------------------------------------------------------------------------------
        // flatten + uppercase the input letters, and pre-calculate the valid permutations
        // ---------------------------------------------------------------------------------------------
        let letters_flat: Vec<char> = flatten_and_uppercase(&letters);
        let valid_permutations = get_valid_permutations(&letters);
        // ---------------------------------------------------------------------------------------------
        // get the valid words from the word list
        // ---------------------------------------------------------------------------------------------
        let valid_words = get_valid_words(&words, &valid_permutations);
        // ---------------------------------------------------------------------------------------------
        // get the valid two-word solutions
        // ---------------------------------------------------------------------------------------------
        let solutions = get_two_word_solutions(&valid_words, &letters_flat);
        // ---------------------------------------------------------------------------------------------
        // if there are no valid two-word solutions, get the valid three-word solutions
        // ---------------------------------------------------------------------------------------------
        if solutions.len() == 0 {
            let _solutions = get_three_word_solutions(&valid_words, &letters_flat);
        }
        // ---------------------------------------------------------------------------------------------
        // print results
        // ---------------------------------------------------------------------------------------------
        let elapsed = time::Instant::now() - t0;
        println!("{:?}", solutions);
        println!("{:?} results", solutions.len());
        println!("{:?} seconds", elapsed.as_secs_f32());
        Ok(JsValue::from_str("OKAY"))
        // Ok(())
    }
}

/// Returns a vector of tuples containing two valid words from the given vector of words.
/// 
/// # Arguments
/// 
/// * `valid_words` - A vector of strings containing valid words.
/// 
/// # Returns
/// 
/// A vector of tuples containing two valid words.
pub fn get_two_word_solutions(valid_words: &Vec<String>, letters_flat: &Vec<char>) -> Vec<(String, String)> {
    let mut solution: Vec<(String, String)> = Vec::new();
    for word1 in valid_words {
        for word2 in valid_words {
            if word1 == word2 { continue }
    // ---------------------------------------------------------------------------------------------
    // Check if the last character of word1 matches the first character of word2
    // ---------------------------------------------------------------------------------------------
            if word1.ends_with(&word2[0..1]) {
                let concatenated = format!("{}{}", word1, word2);
                if letters_flat.iter().all(|&c| concatenated.contains(c)) {
                    solution.push((word1.clone(), word2.clone()));
                }
            }
        }
    }
    solution
}

/// Returns a vector of tuples containing three valid words from the given vector of words.
/// 
/// # Arguments
/// 
/// * `valid_words` - A vector of strings containing valid words.
/// 
/// # Returns
/// 
/// A vector of tuples containing three valid words.
pub fn get_three_word_solutions(valid_words: &Vec<String>, letters_flat: &Vec<char>) -> Vec<(String, String, String)> {
    let mut solution: Vec<(String, String, String)> = Vec::new();
    for word1 in valid_words {
        for word2 in valid_words {
            if word1 == word2 { continue }
    // ---------------------------------------------------------------------------------------------
    // Check if the last character of word1 matches the first character of word2
    // ---------------------------------------------------------------------------------------------
            if word1.ends_with(&word2[0..1]) {
                for word3 in valid_words {
                    if word1 == word3 || word2 == word3 { continue }
    // ---------------------------------------------------------------------------------------------
    // Check if the last character of word2 matches the first character of word3
    // ---------------------------------------------------------------------------------------------
                    if word2.ends_with(&word3[0..1]) {
                        let concatenated = format!("{}{}{}", word1, word2, word3);
                        if letters_flat.iter().all(|&c| concatenated.contains(c)){
                            solution.push((word1.clone(), word2.clone(), word3.clone()));
                        }
                    }
                }
            }
        }
    }
    solution
}

/// Returns a vector of valid words from a given vector of words and a vector of valid permutations.
/// 
/// # Arguments
/// 
/// * `words` - A vector of strings representing the words to check for validity.
/// * `valid_permutations` - A vector of strings representing the valid permutations to check against.
/// 
/// # Returns
/// 
/// A Result containing a vector of valid words or an io::Error if an error occurred while reading the input.
pub fn get_valid_words(words: &Vec<String>, valid_permutations: &Vec<String>) -> Vec<String> {
    // ---------------------------------------------------------------------------------------------
    // hash valid permutations
    // ---------------------------------------------------------------------------------------------
    let valid_permutations_hash: HashSet<u16> = valid_permutations
        .iter()
        .map(|perm| {
            perm
            .as_bytes()
            .windows(2)
            .map(|p| { two_character_hash(&p) })
            .fold(0, |_, hash| hash)
        })
        .collect();
    // ---------------------------------------------------------------------------------------------
    // collect valid word indicies by matching them with the valid two-character permutations
    // ---------------------------------------------------------------------------------------------
    let mut valid_words_idx = Vec::new();
    let mut invalid = false;
    for (widx, word) in words.into_iter().enumerate() {
        let mut idx = 0;
        while let Some(slice) = word.as_bytes().get(idx..idx + 2) {
    // ---------------------------------------------------------------------------------------------
    // ASSUMPTION:
    // - `words` contains words with NO ADJACENT DUPLICATE CHARACTERS
    //   (e.g. does not contain: dOOr, AArdvark, etc.)
    // ---------------------------------------------------------------------------------------------
            if !valid_permutations_hash.contains(&two_character_hash(&slice)) {
                invalid = true;
                break;
            }
            idx += 1;
        }
        match invalid {
            true => invalid = false,
            false => valid_words_idx.push(widx),
        }
    }
    // ---------------------------------------------------------------------------------------------
    // clone the words from the indicies and return
    // ---------------------------------------------------------------------------------------------
    valid_words_idx
        .iter()
        .map(|&idx| &words[idx])
        .cloned()
        .collect()
}

/// Returns a vector of valid permutations of the given letters for Letterbox
/// E.g. each row or "side" can not be connected with itself, only with the other sides.
/// 
/// # Arguments
/// 
/// * `letters` - A reference to a N x M array of characters representing the letters to permute.
/// 
/// # Returns
/// 
/// A `Vec<String>` containing all valid permutations of the given letters.
fn get_valid_permutations(letters: &Vec<Vec<char>>) -> Vec<String>{
    // ---------------------------------------------------------------------------------------------
    // ASSUMPTION:
    // - all characters within `letters` are UNIQUE
    // ---------------------------------------------------------------------------------------------
    let mut permutations : Vec<String> = Vec::new();
    for side in letters {
        for other_side in letters {
            if side[0] == other_side[0] { continue }
            for sl in side {
                for osl in other_side {
                    permutations.push(format!("{}{}", sl, osl));
                }
            }
        }
    }
    permutations
}

/// Computes a two-character hash from a slice of bytes.
/// Not an actual hash function, but a simple way to generate a unique id for a given slice of two bytes.
/// 
/// # Arguments
/// 
/// * `slice` - A slice of bytes to be hashed.
/// 
/// # Returns
/// 
/// The computed two-character hash as a `u16`.
pub fn two_character_hash(slice: &[u8]) -> u16 {
    // ---------------------------------------------------------------------------------------------
    // apply modulus 32 on each element of the slice and collect into a 16 bit integer
    // ---------------------------------------------------------------------------------------------
    (slice[0] as u16 % 32) << 5 | (slice[1] as u16 % 32)
}

/// Flattens a 4x3 array of characters into a vector and converts all characters to uppercase.
/// 
/// # Arguments
/// 
/// * `letters` - A reference to a 4x3 array of characters.
/// 
/// # Returns
/// 
/// A vector containing all characters from the input array, in flattened order and converted to uppercase.
pub fn flatten_and_uppercase(letters: &Vec<Vec<char>>) -> Vec<char> {
    let mut result: Vec<char> = Vec::new();
    for side in letters {
        for letter in side {
            result.push(letter.to_ascii_uppercase());
        }
    }
    result
}

/// Splits a string into multiple substrings using a specified delimiter.
///
/// # Arguments
///
/// * `s` - The string to be split.
/// * `delimiter` - The character used as the delimiter.
///
/// # Returns
///
/// A vector of vector of characters containing the substrings.
pub fn split_using_delimiter(s: &str, delimiter: char) -> Vec<Vec<char>> {
    s.split(delimiter)
        .map(|s| s.chars().collect())
        .collect()
}

/// Reads words from a file, delimited by newline, and returns them as a vector of strings.
/// 
/// # Arguments
/// 
/// * `path` - A path to the file to be read.
/// 
/// # Returns
/// 
/// * `Vec<String>` - A vector of strings containing the words read from the file.
fn read_words_from_file<P: AsRef<Path>>(path: P) -> io::Result<Vec<String>> {
    let file = File::open(path)?;
    let reader = io::BufReader::new(file);
    let words = reader
        .lines()
        .filter_map(Result::ok)
        .collect::<Vec<String>>();
    Ok(words)
}