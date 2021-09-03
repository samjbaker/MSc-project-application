import sys
import numpy as np
import os
import cv2

# ref: https://github.com/sucimahfudy/Document-Scanner-Python/blob/master/pyimagesearch/transform.py
def order_points(pts):
	# initialize array for output ordered co-ords
	rect = np.zeros((4, 2), dtype = "float32")
	# top-left point will have smallest sum
	# bottom-right point will have largest sum
	s = pts.sum(axis = 1)
	rect[0] = pts[np.argmin(s)]
	rect[2] = pts[np.argmax(s)]
	# top-right point will have smallest diff
	# bottom-left will have largest diff
	diff = np.diff(pts, axis = 1)
	rect[1] = pts[np.argmin(diff)]
	rect[3] = pts[np.argmax(diff)]
	# return the ordered coordinates
	return rect


if __name__=="__main__":
    array = sys.argv[1].split(",")
    file_path = sys.argv[2]
    corners = []
    corner = []
    for n in array:
        corner.append(int(float(n)))
        if len(corner) == 2:
            corners.append(corner)
            corner = []
    corners = np.asarray(corners)
    corners = order_points(corners)
    img = cv2.imread(file_path)
    h, w = img.shape[:2]
    output = np.array([[0,0], [w-1,0], [w-1,h-1], [0,h-1]], np.float32)
    output = np.asarray(output)
    matrix = cv2.getPerspectiveTransform(corners, output)
    warped = cv2.warpPerspective(img, matrix, (w,h))
    cv2.imwrite(file_path, warped)
    print(file_path)
    sys.stdout.flush()
  