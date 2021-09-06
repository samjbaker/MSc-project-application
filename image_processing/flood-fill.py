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

"""
def write_file(path_to_file, image):
    # ensuring that the cwd is correct
    __location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

    # add error handling - eg try except
    cv2.imwrite(os.path.join(__location__, path_to_file), image)
    return
"""

def flood_fill(x, y):
    return x*100, y*100


def main():
    x = int(float(sys.argv[1]))
    y = int(float(sys.argv[2]))
    temp_dir = sys.argv[3]

    path_to_write = os.path.join(temp_dir, "temp_backup.jpg")
    path_to_write2 = os.path.join(temp_dir, "temp_walls.jpg")
    path_to_write3 = os.path.join(temp_dir, "temp_walls2.jpg")

    # image = open_file(path_to_write)
    image = cv2.imread(path_to_write)
    seed_point = [x, y]
    #seed_point = (290, 290)  # Coordinates
    #new_val = (255, 255, 255)  # Assign new value
    new_val = (0, 255, 0)
    lower_diff = (40, 40, 40)  # Lower grayscale difference
    up_diff = (40, 40, 40)  # Upper grayscale difference
    # mask picture
    h, w = image.shape[:2]
    # img_mask = open_file(path_to_write2)
    img_mask = cv2.imread(path_to_write2)
    if (img_mask is None):
        img_mask = np.zeros([h + 2, w + 2], np.uint8)  # Needs to be bigger
    else:
        img_mask = cv2.cvtColor(img_mask, cv2.COLOR_BGR2GRAY)
        img_mask = ~img_mask
    img_copy = image.copy()  # Will overwrite the original image
    # 3. Perform processing
    cv2.floodFill(img_copy, img_mask, seed_point, new_val, lower_diff, up_diff,
                    flags=4 | (255 << 8) | cv2.FLOODFILL_FIXED_RANGE)  # Mode 4 connectivity + 255 white + area calculation
    
    black_pixels = np.where(~img_mask < 10)
    img_out = np.zeros_like(img_mask)
    img_out = cv2.cvtColor(img_out, cv2.COLOR_GRAY2BGR)
    img_out = ~img_out
    img_out[black_pixels] = [0, 255, 0]
    """
    write_file(path_to_write, img_copy)
    write_file(path_to_write2, ~img_mask)
    write_file(path_to_write3, img_out)
    """
    cv2.imwrite(path_to_write, img_copy)
    cv2.imwrite(path_to_write2, ~img_mask)
    cv2.imwrite(path_to_write3, img_out)
    #print(write_file(os.path.join(temp_dir,"temp.jpg"), img_copy))
    #cv2.imwrite(path_to_write, img_copy)
    #cv2.waitKey(0)
    #cv2.destroyAllWindows()
    print(path_to_write)
    sys.stdout.flush()


if __name__ == "__main__":
    main()
