# external
import cv2
import numpy as np
from pathlib import Path

# constants
IMAGE_RESOLUTION_FINAL = (360, 360)
IMAGE_RESOLUTION = (1080, 1080)

# output dir
OUTPUT_DIR = Path().cwd()

# main
def main(num_rings=5, starting_ring_filled=True):
    # get a blank image with alpha channel
    img = np.zeros((IMAGE_RESOLUTION[0], IMAGE_RESOLUTION[1], 4), np.uint8)

    # number of rings, so need to draw double (filled and empty)
    total_num_rings = num_rings * 2
    
    # get the ring width
    ring_width = (IMAGE_RESOLUTION[0] / 2) / total_num_rings

    # get the ring color
    ring_color = (255, 0, 0, 255)

    # if starting ring is filled
    offset = 0 if starting_ring_filled else 1

    # draw the rings
    for i in reversed(range(total_num_rings)):
        # get the ring radius
        ring_radius = int(ring_width * (i + 1))

        # get image center as int32
        center = (int(IMAGE_RESOLUTION[0] / 2), int(IMAGE_RESOLUTION[1] / 2))
        # if even
        if (i + offset) % 2 == 0:
            # draw the ring in color
            cv2.circle(img, center, ring_radius, ring_color, thickness=-1)
        else:
            # draw the ring transparent
            cv2.circle(img, center, ring_radius, (0, 0, 0, 0), thickness=-1)

    # crop 1 quadrant
    img = img[0:int(IMAGE_RESOLUTION[0] / 2), 0:int(IMAGE_RESOLUTION[1] / 2)]

    # resize the image using nearest neighbor interpolation
    img = cv2.resize(img, IMAGE_RESOLUTION_FINAL, interpolation=cv2.INTER_NEAREST)

    # save the image
    suffix = "filled" if starting_ring_filled else "empty"
    cv2.imwrite(str(OUTPUT_DIR / f"concentric_circles_{num_rings}_{suffix}.png"), img)

    

# main
if __name__ == '__main__':
    # number of rings 1 - 25
    rings = range(1, 26)
    for r in rings:
        main(r, True)
        main(r, False)
