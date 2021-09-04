import cv2
import numpy as np
import sys
import os

"""
Script to add undetected features (doors or window)
@Param image_dir - directory of image to be used
@Param x, y - co-ord of top left corner of rectangle
@Param w, h - offset from top left of bottom right corner of rectangle
@returns path to output image
"""

def main(img_dir, x, y, w, h):
    file_name = "temp_doors.jpg"
    file_name2 = "temp_doors_bw.jpg"
    img_path = os.path.join(img_dir, file_name)
    img_path2 = os.path.join(img_dir, file_name2)
    img = cv2.imread(img_path)
    img2 = cv2.imread(img_path2)
    cv2.rectangle(img, (x, y), (x+w, y+h), [0, 255, 0], -1)
    cv2.rectangle(img2, (x, y), (x+w, y+h), [0, 0, 0], -1)
    # cv2.imshow("drawn", img)
    # cv2.waitKey(0)
    cv2.imwrite(img_path, img)
    cv2.imwrite(img_path2, img2)
    print(img_path)
    cv2.destroyAllWindows()
    sys.stdout.flush()


if __name__ == "__main__":
    image_dir = sys.argv[1]
    x = int(float(sys.argv[2]))
    y = int(float(sys.argv[3]))
    w = int(float(sys.argv[4]))
    h = int(float(sys.argv[5]))
    main(image_dir, x, y , w, h)