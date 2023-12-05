use image::{GenericImageView, DynamicImage, ImageBuffer, Rgba, RgbaImage};
use rand::{distributions::{Distribution, WeightedIndex}, Rng};
use std::{path::Path, collections::HashMap};

const IMAGE_SIZE: u32 = 50;
const NON_ROTATED_INDEX: usize = 5;
const ROWS: usize = 20;
const COLS: usize = 100;

// image directory: current file directory + "tesselation"
const IMAGE_DIRECTORY: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/tesselation/");

fn main() {

    // get all images in the image directory
    let mut img_paths = std::fs::read_dir(IMAGE_DIRECTORY).unwrap().map(|x| x.unwrap().path()).collect::<Vec<_>>();
    // remove all directories
    img_paths.retain(|x| x.is_file());
    // print
    println!("Found {} images", img_paths.len());

    let colors: Vec<Rgba<u8>> = vec![
        Rgba([0, 67, 86, 255]),
        Rgba([214, 40, 40, 255]),
        Rgba([247, 127, 0, 255]),
        Rgba([252, 191, 73, 255])
    ];
    let bg_color = Rgba([243, 238, 208, 255]); // #f3eed0

    // load images
    let mut imgs = Vec::new();
    for img_path in &img_paths {
        let img = image::open(img_path).unwrap();
        //resize image to IMAGE_SIZE
        let img = img.resize_exact(IMAGE_SIZE, IMAGE_SIZE, image::imageops::FilterType::Nearest);
        imgs.push(img);
    }

    let mut rng = rand::thread_rng();


    let weights = [0.1, 0.1, 0.2, 0.5, 0.1, 0.1, 0.2, 0.05,0.05];
    let dist = WeightedIndex::new(&weights).unwrap();
    let randomlist: Vec<usize> = (0..ROWS*COLS).map(|_| dist.sample(&mut rng)).collect();

    
    let weights_c = [0.3, 0.3, 0.2, 0.2];
    let dist_c = WeightedIndex::new(&weights_c).unwrap();
    let randomcol: Vec<usize> = (0..ROWS*COLS).map(|_| dist_c.sample(&mut rng)).collect();

    //create uniform distribution for rotations
    let dist_r = WeightedIndex::new(&[0.25, 0.25, 0.25, 0.25]).unwrap();
    let randomrot: Vec<usize> = (0..ROWS*COLS).map(|_| dist_r.sample(&mut rng)).collect();

    //zip the randomlist, randomcol and randomrot together
    let randomlist = randomlist.iter().zip(randomcol.iter()).zip(randomrot.iter()).map(|((a,b),c)| (*a,*b,*c)).collect::<Vec<_>>();

    //initialize color&rotation lookup table
    let mut lookup_table: HashMap<Rgba<u8>, HashMap<usize, Vec<DynamicImage>>> = HashMap::new();

    //loop through all the colors
    for color in &colors{

        //loop through images and color each one with the current color
        let colored_images:Vec<DynamicImage> = imgs.iter().map(|img| {
            let mut bg: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::from_pixel(img.width(), img.height(), bg_color);
            let mut colored_img: RgbaImage = ImageBuffer::from_pixel(img.width(), img.height(),Rgba([0, 0, 0, 0]));
            // Apply the alpha channel of img as a mask to colored_img
            for (x, y, pixel) in img.pixels() {
                let alpha = pixel[3];
                let colored_pixel = colored_img.get_pixel_mut(x, y);
                if alpha != 0 {*colored_pixel = color.to_owned();
                }
            }
            image::imageops::overlay(&mut bg, &colored_img, 0, 0);
            DynamicImage::ImageRgba8(bg)
        }).collect();

        //loop through rotations
        let mut color_rotations: HashMap<usize, Vec<DynamicImage>> = HashMap::new();
        for rot in 0..=3 {
            let mut rotation: Vec<DynamicImage> = Vec::new();
            for (i,img) in colored_images.iter().enumerate() {
                let img_rotated = match rot {
                    0 => img.to_owned(),
                    1 => img.rotate90(),
                    2 => img.rotate180(),
                    3 => img.rotate270(),
                    _ => img.to_owned(),
                };
                rotation.push(img_rotated.clone());
                //write this output for debugging purposes
                //let path = format!("tesselation/rotated/{}_{}_{}.png", rgba_to_hex(color), rot, i);
                //img_rotated.save(path).unwrap();
            }
            color_rotations.insert(rot, rotation);
        }
        lookup_table.insert(*color, color_rotations);
    }

    let mut all_rows: Vec<DynamicImage> = Vec::new();
    let mut row: Vec<DynamicImage> = Vec::new();
    for (i, (img_index, color_index, rot_index)) in randomlist.iter().enumerate() {
        let img = lookup_table.get(&colors[*color_index]).unwrap().get(&rot_index).unwrap()[*img_index].to_owned();
        row.push(img);
        if (i+1) % COLS == 0 {
            all_rows.push(fast_vcat(row));
            row = Vec::new();
        }
    }
    // rotate all rows
    let rotated_rows = all_rows.iter().map(|row| row.rotate90()).collect::<Vec<_>>();
    let final_image = fast_vcat(rotated_rows);
    final_image.save("tessellation.png").unwrap();


    // let img_size = 360; // Size of each image
    // let padding = 0; // Padding between images
    // let (bg_w, bg_h) = (ROWS as u32 * (padding + img_size), COLS as u32 * (padding + img_size));


    // //loop through the randomlist and place the images
    // for (i, (img_index, color_index, rot_index)) in randomlist.iter().enumerate() {
    //     let row = i / COLS;
    //     let col = i % COLS;
    //     let bx = col as u32 * (padding + img_size);
    //     let by = row as u32 * (padding + img_size);
    //     let img = lookup_table.get(&colors[*color_index]).unwrap().get(&rot_index).unwrap()[*img_index].to_owned();
    //     //image::imageops::overlay(&mut bg, &img, bx, by);
    // }


    // for (i, img) in rotated_images.iter().enumerate() {
    //     let row = i / COLS;
    //     let col = i % COLS;
    //     let bx = col as u32 * (padding + img_size);
    //     let by = row as u32 * (padding + img_size);
    //     println!("{} {} {} {}", i, row, col, bx);

    //     // Create a colored image
    //     let mut colored_img: RgbaImage = ImageBuffer::from_pixel(img.width(), img.height(), colors[randomcol[i]]);

    //     // Apply the alpha channel of img as a mask to colored_img
    //     for (x, y, pixel) in img.pixels() {
    //         let alpha = pixel[3];
    //         let colored_pixel = colored_img.get_pixel_mut(x, y);
    //         if alpha != 0 {
    //             *colored_pixel = Rgba([
    //                 colored_pixel[0],
    //                 colored_pixel[1],
    //                 colored_pixel[2],
    //                 alpha
    //             ]);
    //         }
    //     }

    //     image::imageops::overlay(&mut bg, &colored_img, bx, by);
    // }

    // Save or display the final image
}




fn rgba_to_hex(color: &Rgba<u8>) -> String {
    format!("#{:02X}{:02X}{:02X}{:02X}", color[0], color[1], color[2], color[3])
}

fn fast_vcat(images: Vec<DynamicImage>) -> DynamicImage {
    // let the output be a vec
    let mut output: Vec<u8> = Vec::new();
    // keep track of the heights
    let mut heights: Vec<u32> = Vec::new();
    // get the width
    let width = images[0].width();
    // loop through images
    for image in images {
        // get the height
        let height = image.height();
        // push the height
        heights.push(height);
        // to_vec, then extend output, but only grab the first height*width elements
        let image_vec = image.to_rgba8().to_vec();
        output.extend(image_vec)
    }
    // create a new image from the output
    let heights: Vec<u32> = heights.iter().map(|x| *x).collect();
    DynamicImage::ImageRgba8(ImageBuffer::from_vec(width, heights.iter().sum(), output).unwrap())
}
