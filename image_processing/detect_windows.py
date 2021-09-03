import sys
import numpy as np
import os
import cv2


def contourIntersect(original_image, door_image, contours_wall, contours_door):
    """https://stackoverflow.com/questions/55641425/check-if-two-contours-intersect"""
    # Create image filled with zeros the same size of original image
    windows = np.zeros_like(original_image)

    # Putting wall contours onto an image
    walls = cv2.drawContours(windows.copy(), contours_wall, -1, 255, 3)
    #cv2.imshow("image1",image1)

    #iterating through the contours and checking if they intersect with the walls
    contour_overlap = []
    for i in range(len(contours_door)):
        test = cv2.drawContours(windows.copy(), contours_door, i, 255, 3)
        #cv2.imshow("test", test)
        #cv2.waitKey(0)
        intersection = np.logical_and(walls, test)
        if intersection.any():
            contour_overlap.append(i)
    #cv2.imshow("contours",windows)
    for i in contour_overlap:
        cv2.drawContours(windows, contours_door, i, 255, cv2.FILLED)
        cv2.drawContours(door_image, contours_door, i, 255, cv2.FILLED)
    windows = ~windows
    #cv2.imshow("windows",windows)
    #cv2.imshow("door", door_image)
    #write_file(os.path.join("plans","temp_windows.jpg"), windows)
    #write_file(os.path.join("plans","temp_doors_fin.jpg"), door_image)
    return windows, door_image


def write_file(path_to_file, image):
    # ensuring that the cwd is correct
    __location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

    # add error handling - eg try except
    cv2.imwrite(os.path.join(__location__, path_to_file), image)
    return


def combine_images(door_image, wall_image, window_image):
    """
    Overlays the doors on top of the wall image for simple assessment of success
    @Param door_image - image containing detected doors
    @Param wall_image - image containing detected walls
    @Return combined_image - image containing the overlaid image
    """
    door_colour = [0, 255, 0]
    window_colour = [255, 0, 0]
    #mask_door = np.all(door_image == 0,  axis=-1)
    mask_door = np.where(door_image < 20)
    mask_window = np.where(window_image < 20)
    wall_image = cv2.cvtColor(wall_image, cv2.COLOR_GRAY2BGR)

    combined_image = wall_image.copy()
    combined_image[mask_door] = door_colour
    combined_image[mask_window] = window_colour
    return combined_image


def main():
    #file_path = os.path.join("plans","simple-house_walls.jpg")
    temp_dir = sys.argv[1]
    lines_path = os.path.join(temp_dir, "temp_lines.jpg")
    #file_path2 = os.path.join("plans","temp_doors_bw.jpg")
    #file_path2 = os.path.join("plans","simple-house_walls_doors.jpg")
    doors_path = os.path.join(temp_dir,"temp_doors_bw.jpg")
    wall_path = os.path.join(temp_dir,"temp_walls.jpg")
    windows_path = os.path.join(temp_dir,"temp_windows.jpg")
    combo_path = os.path.join(temp_dir,"temp_combo_windows.jpg")
    img = open_file(lines_path)
    img2 = open_file(doors_path)
    walls = open_file(wall_path)
    ret,thresh1 = cv2.threshold(img,127,255,cv2.THRESH_BINARY_INV)
    ret2, thresh2 = cv2.threshold(img2,127,255,cv2.THRESH_BINARY_INV)
    #cv2.imshow("thresh", thresh2)
    out = np.zeros_like(img)
    out = cv2.cvtColor(out, cv2.COLOR_GRAY2BGR)
    contours_wall = cv2.findContours(thresh1, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0]
    contours_door = cv2.findContours(thresh2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0]
    windows, doors = contourIntersect(img, img2, contours_wall, contours_door)
    combo = combine_images(doors, walls, windows)
    cv2.imwrite(windows_path, windows)
    cv2.imwrite(doors_path, doors)
    cv2.imwrite(combo_path, combo)
    print(combo_path)
    sys.stdout.flush()
    cv2.destroyAllWindows()



def open_file(path_to_file):
    # ensuring that the cwd is correct
    __location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

    # open img in greyscale
    im = cv2.imread(os.path.join(__location__, path_to_file), 0)
    if (im is None):
        print("Image "+ os.path.join(__location__, path_to_file) +" does not exist")
        sys.exit(1)
    return im


if __name__=="__main__":
    #array = sys.argv[1].split(",")
    main()