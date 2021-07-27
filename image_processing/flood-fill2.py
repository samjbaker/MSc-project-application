import cv2
import numpy as np
import os
import time

class DetectPixel:
    def __init__(self, window_name, img):
        self.window_name = window_name
        self.img = img.copy()
        cv2.namedWindow(window_name,cv2.WINDOW_NORMAL)
        cv2.imshow(window_name, img)
        self.point = []

    def select_point(self, event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            self.point.append([x,y])
            #cv2.circle(self.img, (x,y), 2, (0, 0, 255), -1)

    def get_point(self, count=1, img=None):
        if img is not None:
            self.img = img
        else:
            self.img = self.img.copy()
        cv2.namedWindow(self.window_name, cv2.WINDOW_NORMAL)
        cv2.imshow(self.window_name, self.img)
        cv2.setMouseCallback(self.window_name, self.select_point)
        self.point = []
        while(1):
            cv2.imshow(self.window_name, self.img)
            k = cv2.waitKey(20) & 0xFF
            if k == 27 or len(self.point) >= count:
                break
            #print(self.point)
        cv2.setMouseCallback(self.window_name, lambda *args : None)
        #cv2.destroyAllWindows()
        return self.point, self.img


def main():
    # 1. Import pictures
    path_to_image = os.path.join("temp_images", "temp.jpg")
    img_org = open_file(path_to_image)

    window_name = 'image'
    find_width = DetectPixel(window_name, img_org)

    pts, image = find_width.get_point(1, img_org)
    print(pts)
    # 2. Set parameters
    seed_point = pts[0]
    #seed_point = (290, 290)  # Coordinates
    #new_val = (255, 255, 255)  # Assign new value
    new_val = (0, 255, 0)
    lower_diff = (30, 30, 30)  # Lower grayscale difference
    up_diff = (30, 30, 30)  # Upper grayscale difference
    # mask picture
    h, w = img_org.shape[:2]
    img_mask = np.zeros([h + 2, w + 2], np.uint8)  # Need to be bigger

    img_copy = image.copy()  # Will overwrite the original image

    # 3. Perform processing
    cv2.floodFill(img_copy, img_mask, seed_point, new_val, lower_diff, up_diff,
                 flags=4 | (255 << 8) | cv2.FLOODFILL_FIXED_RANGE)  # Mode 4 connectivity + 255 white + area calculation

    # 4. Display the result
    cv2.imshow("img_mask", img_mask)
    # cv2.imshow("img_org", img_org)
    cv2.imshow("img_copy", img_copy)
    cv2.waitKey()
    cv2.destroyAllWindows()
    write_file(os.path.join("temp_images", "temp.jpg"), img_mask)
    


def open_file(path_to_file):
    # ensuring that the cwd is correct
    __location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

    # add error handling - eg try except
    im = cv2.imread(os.path.join(__location__, path_to_file))
    return im


def write_file(path_to_file, image):
    # ensuring that the cwd is correct
    __location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

    # add error handling - eg try except
    path_to_write = os.path.join(__location__, path_to_file)
    cv2.imwrite(path_to_write, image)
    return path_to_write


if __name__ == '__main__':
    main()