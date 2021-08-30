import cv2
import numpy as np
import sys
import os

"""
Script to detect the walls from an image of a building plan
@Param image_dir - directory of where image to be used is located
@Param file_name - name of image file to be used (not including extension)
@Param file_extension - string file extension
@returns file path of written file
"""

def detect_walls(img):
    """
    Greyscales image then attempts to detect walls from it
    @Param image
    @Return image of walls
    """
    # greyscale image
    grey = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    # binary threshold image
    thresh = cv2.threshold(grey,0,255,cv2.THRESH_BINARY_INV+cv2.THRESH_OTSU)[1]
    # Use morphology operations to attempt to automatically detect walls
    morph_flag = False
    kernel_size = 3
    while(morph_flag == False):
        kernel = np.ones((kernel_size, kernel_size),np.uint8)
        opening = cv2.morphologyEx(thresh,cv2.MORPH_OPEN,kernel, iterations = 2)
        # lowering kernel size if too much removed
        if cv2.countNonZero(opening) == 0:
            kernel_size -= 1
        else: 
            morph_flag = True
    return ~opening


def colour_walls(img):
    """
    changes all black pixels in image to be another colour
    @Param img = input greyscale image
    @returns img2 = image with all black pixels changed to be another colour
    ref: https://stackoverflow.com/questions/64336516/how-to-change-all-the-black-pixels-to-white-opencv
    """
    # turn image back to colour
    img2 = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    #find all black pixels in image
    black_pixels = np.where(
        (img2[:, :, 0] == 0) & 
        (img2[:, :, 1] == 0) & 
        (img2[:, :, 2] == 0)
    )

    # set those pixels to be another colour
    img2[black_pixels] = [0, 200, 0]
    return img2


def main(image_dir, file_name, extension):
    # some filename manipulation for use when saving image
    image_path = os.path.join(image_dir,file_name+extension)
    output_path = os.path.join(image_dir,file_name+"_walls"+extension)
    output_path_coloured = os.path.join(image_dir,file_name+"_walls2"+extension)
    
    # reading image
    img = cv2.imread(image_path)

    # detecting walls
    walls = detect_walls(img)

    # colouring image to highlight detected walls
    walls2 = colour_walls(walls.copy())

    cv2.imwrite(output_path, walls)
    cv2.imwrite(output_path_coloured, walls2)
    print(output_path_coloured)
    #cv2.waitKey(0)
    cv2.destroyAllWindows()
    sys.stdout.flush()


if __name__ == "__main__":
    image_dir = sys.argv[1]
    file_name = sys.argv[2]
    extension = sys.argv[3]
    main(image_dir, file_name, extension)