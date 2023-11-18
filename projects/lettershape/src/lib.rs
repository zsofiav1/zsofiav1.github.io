// ---------------------------------------------------------------------------------------------
// external
// ---------------------------------------------------------------------------------------------
use js_sys::Date;
use web_sys::console;
use reqwasm::http::Request;
use wasm_bindgen::prelude::*;
use std::collections::HashSet;

// ---------------------------------------------------------------------------------------------
// constants
// ---------------------------------------------------------------------------------------------
// const WORDLIST_PATH_OR_URL: &str = "../data/wordlist_no_repeat.txt"; // "https://zsofiav1.github.io/projects/lettershape/data/wordlist_no_repeat.txt";
const WORDLIST_PATH_OR_URL: &str = "https://zsofiav1.github.io/projects/lettershape/data/wordlist_no_repeat.txt";
#[wasm_bindgen]
pub fn delim() -> char { DELIM_CHAR }
const DELIM_CHAR: char = ';';

// ---------------------------------------------------------------------------------------------
// structs
// ---------------------------------------------------------------------------------------------
#[wasm_bindgen]
pub struct LetterShape {
    wordlist: Option<Vec<String>>,
}

#[wasm_bindgen]
/// Solver for the NYT Letterbox puzzle, but generalized to any number of sides and inputs per side.
/// Hence the name `LetterShape` instead of `Letterbox`!
/// 
/// # Description
/// 
/// The NYT Letterbox puzzle is constrained to a a 4 x 3 array of letters
/// Given said letters, find all valid solutions where the last letter of the first word
/// matches the first letter of the second word, and the last letter of the second word matches
/// the first letter of the third word.
/// 
/// # Example
/// 
/// ```no_run
/// let letters = vec![
///     vec!['i', 'f', 't'],
///     vec!['m', 'a', 'o'],
///     vec!['d', 'r', 'w'],
///     vec!['e', 'l', 'h']
/// ];
/// 
/// // ...
/// // solutions: [("DEFOLIATE", "EARTHWORM"), ("FLOWMETER", "RAWHIDE"), ("FLOWMETER", "RAWHIDED"), ("WEALTHIER", "REFORMED")]
/// ```
impl LetterShape {
    /// Creates a new instance of `LetterShape`.
    /// 
    /// # Returns
    /// 
    /// Returns a `Result` containing the `LetterShape` instance if successful, or a `JsValue` error if an error occurs.
    pub async fn new() -> LetterShape {
        let mut this = LetterShape {
            wordlist: None,
        };
        this.wordlist_loaded().await;
        this
    }

    /// Solves the problem.
    ///
    /// This method attempts to solve the problem and returns a `Result` indicating success or failure.
    /// If the problem is solved successfully, it returns `Ok(())`. Otherwise, it returns an `Err` containing
    /// a boxed `dyn Error` trait object that describes the error encountered during solving.
    pub async fn solve(&mut self, letters: &str) -> Result<JsValue, JsValue> {
        // ---------------------------------------------------------------------------------------------
        // log the start time
        // ---------------------------------------------------------------------------------------------
        let start = Date::now();
        // ---------------------------------------------------------------------------------------------
        // if wordlist is None, try to load it
        // ---------------------------------------------------------------------------------------------
        if !self.wordlist_loaded().await {
            return Err(JsValue::from_str("Failed to load wordlist"));
        }
        // ---------------------------------------------------------------------------------------------
        // split the input letters into a Vec<Vec<char>>
        // ---------------------------------------------------------------------------------------------
        let letters = split_using_delimiter(letters, DELIM_CHAR);
        if letters.iter().any(|l| l.len() != letters[0].len()) {
            return Err(JsValue::from_str("Invalid input: each side must have the same number of letters"));
        }
        // ---------------------------------------------------------------------------------------------
        // flatten + uppercase the input letters, and pre-calculate the valid permutations
        // ---------------------------------------------------------------------------------------------
        let letters_flat: Vec<char> = flatten_and_uppercase(&letters);
        let valid_permutations = get_valid_permutations(&letters);
        // ---------------------------------------------------------------------------------------------
        // get the valid words from the word list
        // ---------------------------------------------------------------------------------------------
        let valid_words = get_valid_words(self.wordlist.as_ref().unwrap(), &valid_permutations);
        // ---------------------------------------------------------------------------------------------
        // get the valid two-word solutions
        // ---------------------------------------------------------------------------------------------
        let solutions = get_two_word_solutions(&valid_words, &letters_flat);
        // ---------------------------------------------------------------------------------------------
        // if there are no valid two-word solutions, get the valid three-word solutions
        // ---------------------------------------------------------------------------------------------
        let result = match solutions.len() {
            0 => {
                let solutions = get_three_word_solutions(&valid_words, &letters_flat);
                format!("{:?}", solutions)
            },
            _ => format!("{:?}", solutions),
        };
        // ---------------------------------------------------------------------------------------------
        // print results
        // ---------------------------------------------------------------------------------------------
        console::log_1(&result.clone().into());
        console::log_1(&format!("Elapsed time: {} ms", Date::now() - start).into());
        Ok(result.into())
    }

    /// Asynchronously checks if the wordlist has been loaded.
    /// 
    /// # Returns
    /// 
    /// Returns `true` if the wordlist has been loaded, otherwise `false`.
    async fn wordlist_loaded(&mut self) -> bool {
        match &self.wordlist {
            Some(_) => true,
            None => {
                let words = read_words_from_request(WORDLIST_PATH_OR_URL).await;
                self.wordlist = match words {
                    Ok(words) => Some(words),
                    Err(e) => {
                        console::log_1(&e.into());
                        None
                    },
                };
                match &self.wordlist {
                    Some(_) => true,
                    None => false,
                }
            },
        }
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
fn get_two_word_solutions(valid_words: &Vec<String>, letters_flat: &Vec<char>) -> Vec<(String, String)> {
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
fn get_three_word_solutions(valid_words: &Vec<String>, letters_flat: &Vec<char>) -> Vec<(String, String, String)> {
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
fn get_valid_words(words: &Vec<String>, valid_permutations: &Vec<String>) -> Vec<String> {
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
fn two_character_hash(slice: &[u8]) -> u16 {
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
fn flatten_and_uppercase(letters: &Vec<Vec<char>>) -> Vec<char> {
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
fn split_using_delimiter(s: &str, delimiter: char) -> Vec<Vec<char>> {
    s.split(delimiter)
        .map(|s| s.chars().collect())
        .collect()
}

/// Reads words from a given URL asynchronously.
///
/// # Arguments
///
/// * `url` - The URL from which to read the words.
///
/// # Returns
///
/// Returns a `Result` containing a vector of strings if successful, or a `JsValue` if an error occurs.
async fn read_words_from_request(url: &str) -> Result<Vec<String>, JsValue> {
    let response = Request::get(url)
        .send()
        .await
        .map_err(|_| JsValue::from_str("Failed to fetch file"))?;
    let text = response
        .text()
        .await
        .map_err(|_| JsValue::from_str("Failed to read response text"))?;
    let words = text.lines().map(str::to_owned).collect::<Vec<String>>();
    Ok(words)
}