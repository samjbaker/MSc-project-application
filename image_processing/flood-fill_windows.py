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
    combo_path = os.path.join(temp_dir, "temp_combo_windows.jpg")
    window_path_bw = os.path.join(temp_dir, "temp_windows.jpg")
    door_path = os.path.join(temp_dir, "temp_doors_bw.jpg")


    combo = cv2.imread(combo_path)
    window = cv2.imread(window_path_bw)
    img_door = cv2.imread(door_path)
    seed_point = [x, y]
    #seed_point = (290, 290)  # Coordinates
    new_val = (255, 255, 255)  # Assign new value
    new_val_door = (0, 255, 0) # green for door
    new_val_bw = (0, 0, 0) # black for door_bw
    # new_val = (0, 255, 0)
    lower_diff = (100, 100, 100)  # Lower grayscale difference
    up_diff = (100, 100, 100)  # Upper grayscale difference
    # mask picture
    h, w = combo.shape[:2]
    img_mask = np.zeros([h + 2, w + 2], np.uint8)  # Need to be bigger
    img_mask2 = np.zeros([h + 2, w + 2], np.uint8)
    combo_copy = combo.copy()  # Will overwrite the original image
    window_copy = window.copy()
    # 3. Perform processing
    cv2.floodFill(combo_copy, img_mask, seed_point, new_val_door, lower_diff, up_diff,
                     flags=4 | (255 << 8) | cv2.FLOODFILL_FIXED_RANGE)  # Mode 4 connectivity + 255 white + area calculation

    cv2.floodFill(window_copy, img_mask2, seed_point, new_val, lower_diff, up_diff,
                     flags=4 | (255 << 8) | cv2.FLOODFILL_FIXED_RANGE)  # Mode 4 connectivity + 255 white + area calculation
    #print(write_file(os.path.join(temp_dir,"temp.jpg"), img_copy))

    img_door[np.where(img_mask2 > 30)] = (0, 0, 0)

    cv2.imwrite(combo_path, combo_copy)
    cv2.imwrite(window_path_bw, window_copy)
    cv2.imwrite(door_path, img_door)
    print(combo_path)
    sys.stdout.flush()


if __name__ == "__main__":
    main()
