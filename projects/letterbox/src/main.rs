use std::time;
use std::error;
use std::result;
use std::fs::File;
use std::path::Path;
use itertools::Itertools;
use std::io::{self, BufRead};
use std::collections::HashSet;

pub fn get_valid_words(words: &Vec<String>, permutations: &Vec<String>, letters_flat: &Vec<char>) -> io::Result<Vec<String>> {
    let invalid_perms: Vec<u16> = permutations
        .iter()
        .map(|perm| {
            perm
            .as_bytes()
            .windows(2)
            .map(|p| {
                // apply modulus 32 on each element of the slice and collect into a 16 bit integer
                let mut hash = 0;
                for &byte in p {
                    hash = (hash << 5) + (byte as u16 % 32);
                }
                hash
            })
            .fold(0, |acc, hash| acc + hash)
        })
        .collect();
        
    let mut valid_words_idx = Vec::new();
    let mut invalid = false;
    for (widx, word) in words.into_iter().enumerate() {
        let mut idx = 0;
        while let Some(slice) = word.as_bytes().get(idx..idx + 2) {
            // if the slice contains the same letter twice, break and continue to next word
            if slice[0] == slice[1] {
                invalid = true;
                break;
            }
            // apply modulus 32 on each element of the slice and collect into a 16 bit integer
            let mut hash = 0;
            for &byte in slice {
                hash = (hash << 5) + (byte as u16 % 32);
            }
            if invalid_perms.contains(&hash) {
                // break and continue to next word
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

    // filter for valid words
    let valid_words: Vec<String> = valid_words_idx
        .iter()
        .map(|&idx| &words[idx])
        .filter(|word| {
            word
            .chars()
            .all(|c| letters_flat.contains(&c))
        })
        .cloned()
        .collect();

    // return valid words
    Ok(valid_words)
}

pub fn get_valid_words_v1(words: &Vec<String>, permutations: &Vec<String>) -> io::Result<Vec<String>> {
    let valid_perms: HashSet<u16> = permutations
        .iter()
        .map(|perm| {
            perm
            .as_bytes()
            .windows(2)
            .map(|p| { (p[0] as u16 % 32) << 5 | (p[1] as u16 % 32) })
            .fold(0, |_, hash| hash)
        })
        .collect();

    // // print my permutations
    // println!("{:?}", valid_perms);
        
    // let mut valid_words = Vec::new();
    let mut valid_words_idx = Vec::new();
    let mut invalid = false;
    for (widx, word) in words.into_iter().enumerate() {
        let mut idx = 0;
        while let Some(slice) = word.as_bytes().get(idx..idx + 2) {
            // assume reading from word_list with no repeating characters, so dont check for repeating characters

            // apply modulus 32 on each element of the slice and collect into a 16 bit integer
            let hash = (slice[0] as u16 % 32) << 5 | (slice[1] as u16 % 32);
            if !valid_perms.contains(&hash) {
                // break and continue to next word
                invalid = true;
                break;
            }
            idx += 1;
        }
        match invalid {
            true => invalid = false,
            false => {
                // valid_words.push(word.clone());
                valid_words_idx.push(widx);
            }
        }
    }

    // filter for valid words
    let valid_words: Vec<String> = valid_words_idx
        .iter()
        .map(|&idx| &words[idx])
        .cloned()
        .collect();

    // print length of valid words
    println!("{:?}", valid_words.len());

    // return valid words
    Ok(valid_words)
}

pub fn flatten(letters: &[[char; 3]; 4]) -> Vec<char> {
    let mut letters_flat: Vec<char> = Vec::new();
    for side in letters {
        for letter in side {
            // letters_flat.push(*letter as u8 % 32);
            letters_flat.push(letter.to_ascii_uppercase());
        }
    }
    letters_flat
}

fn main() -> result::Result<(), Box<dyn error::Error>> {
    // start time
    let t0 = time::Instant::now();

    // file paths
    // let word_list_path = "word_list.txt";
    let word_list_path = "word_list_no_repeat.txt";

    // input letters
    let letters = [
        ['i', 'f', 't'],
        ['m', 'a', 'o'],
        ['d', 'r', 'w'],
        ['e', 'l', 'h']
    ];

    let letters_flat: Vec<char> = flatten(&letters);
    //let invalid_permutations = get_invalid_permutations(&letters)?;
    let valid_permutations = get_valid_permutations(&letters)?;

    // load words from file
    let words = read_words_from_file(word_list_path)?;

    // filter words
    // let valid_words = get_valid_words(&words, &invalid_permutations, &letters_flat)?;
    let valid_words = get_valid_words_v1(&words, &valid_permutations)?;

    let mut list: Vec<(String,String)> = Vec::new();
    for word1 in &valid_words {
        for word2 in &valid_words {
            if word1 == word2 { continue }
            // Check if the last character of word1 matches the first character of word2
            if word1.ends_with(&word2[0..1]) {
                let concatenated = format!("{}{}", word1, word2);
                if letters_flat.iter().all(|&c| concatenated.contains(c)) {
                    list.push((word1.clone(), word2.clone()));
                }
                // if letters_flat.iter().all(|&l| concatenated.chars().any(|c| c as u8 % 32 == l)) {
                //     list.push((word1.clone(), word2.clone()));
                // }
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

    // print results
    let elapsed = time::Instant::now() - t0;
    println!("{:?}", list);
    println!("{:?} results", list.len());
    println!("{:?} seconds", elapsed.as_secs_f32());

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

fn get_invalid_permutations(letters: &[[char; 3]; 4]) -> io::Result<Vec<String>>{
    let mut permutations : Vec<String> = Vec::new();
    for side in letters{
        permutations.extend(
            side
            .iter()
            .permutations(2)
            .map(|combo| combo.into_iter().collect::<String>())
            .collect::<Vec<String>>())
    }
    Ok(permutations)
}

fn get_valid_permutations(letters: &[[char; 3]; 4]) -> io::Result<Vec<String>>{
    let mut permutations : Vec<String> = Vec::new();
    for side in letters {
        for other_side in letters {
            // only works because assuming characters are all unique
            if side[0] == other_side[0] { continue }
            // iterate through characters of side, permute with other_side, and collect into a vector of strings
            for sl in side {
                // loop through otherside
                for osl in other_side {
                    // concatenate sl and osl into a string
                    let mut perm = String::new();
                    perm.push(*sl);
                    perm.push(*osl);
                    // push perm into permutations
                    permutations.push(perm);
                }
            }
        }
    }
    Ok(permutations)
}




