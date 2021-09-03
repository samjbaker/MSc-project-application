import cv2
import numpy as np
import sys
import os

"""
Script to highlight corners for perspective correction
"""

def main(img_path, x, y):
    img = cv2.imread(img_path)
    cv2.circle(img, (x,y), 3, (0,0,200), -1)
    cv2.imwrite(img_path, img)
    print(img_path)
    cv2.destroyAllWindows()
    sys.stdout.flush()


if __name__ == "__main__":
    x = int(float(sys.argv[1]))
    y = int(float(sys.argv[2]))
    img_path = sys.argv[3]
    main(img_path, x, y)