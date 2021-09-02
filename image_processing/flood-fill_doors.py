import sys
import numpy as np
import os
import cv2


def open_file(path_to_file):
    # ensuring that the cwd is correct
    __location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

    # add error handling - eg try except
    im = cv2.imread(os.path.join(__location__, path_to_file))
    return im


def flood_fill(x, y):
    return x*100, y*100


def main():
    x = int(float(sys.argv[1]))
    y = int(float(sys.argv[2]))
    temp_dir = sys.argv[3]
    door_path = os.path.join(temp_dir, "temp_doors.jpg")
    door_path_bw = os.path.join(temp_dir, "temp_doors_bw.jpg")

    image = cv2.imread(door_path)
    image2 = cv2.imread(door_path_bw)
    seed_point = [x, y]
    #seed_point = (290, 290)  # Coordinates
    new_val = (255, 255, 255)  # Assign new value
    # new_val = (0, 255, 0)
    lower_diff = (30, 30, 30)  # Lower grayscale difference
    up_diff = (30, 30, 30)  # Upper grayscale difference
    # mask picture
    h, w = image.shape[:2]
    img_mask = np.zeros([h + 2, w + 2], np.uint8)  # Need to be bigger
    img_mask2 = np.zeros([h + 2, w + 2], np.uint8)
    img_copy = image.copy()  # Will overwrite the original image
    img_copy2 = image2.copy()
    # 3. Perform processing
    cv2.floodFill(img_copy, img_mask, seed_point, new_val, lower_diff, up_diff,
                     flags=4 | (255 << 8) | cv2.FLOODFILL_FIXED_RANGE)  # Mode 4 connectivity + 255 white + area calculation

    cv2.floodFill(img_copy2, img_mask2, seed_point, new_val, lower_diff, up_diff,
                     flags=4 | (255 << 8) | cv2.FLOODFILL_FIXED_RANGE)  # Mode 4 connectivity + 255 white + area calculation
    #print(write_file(os.path.join(temp_dir,"temp.jpg"), img_copy))
    cv2.imwrite(door_path, img_copy)
    cv2.imwrite(door_path_bw, img_copy2)
    print(door_path)
    sys.stdout.flush()


if __name__ == "__main__":
    main()
