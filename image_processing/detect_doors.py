import cv2
import numpy as np
import sys
import os

"""
Script to detect the doors automatically from the provided wall plan
@Param image_dir - directory of where image to be used is located
@Param file_name - name of image file to be used (not including extension)
@Param file_extension - string file extension
@returns file path of written file
"""

def remove_noise(img, noise_removal_threshold):
    """
    Remove noise from image and return mask
    @Param img - image to remove noise from
    @Param noise_removal_threshold - threshold under which something 
    is considered noise
    @Return return new mask of image
    """
    img[img < 128] = 0
    img[img > 128] = 255
    contours, _ = cv2.findContours(~img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros_like(img)
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > noise_removal_threshold:
            cv2.fillPoly(mask, [contour], 255)
    return mask


def remove_large_doors(image):
    """
    Remove doors that are 'too square' - most doorways are rectangular
    @Param img @mandatory image to trim large doors from
    @Return return new mask of image
    """
    gray = cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    # Find contours, obtain bounding rect, and draw width
    conts = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    conts = conts[0] if len(conts) == 2 else conts[1]
    for c in conts:
        x,y,w,h = cv2.boundingRect(c)
        #cv2.rectangle(image, (x, y), (x + w, y + h), (36,255,12), 1)
        #removing any doorways that have w > h/2 or vice-versa
        if w <= h:
            if w > (h/2):
                cv2.fillPoly(image, [c], [0,0,0])
        else:
            if h > (w/2):
                cv2.fillPoly(image, [c], [0,0,0])
    return image


def join_doorways(img, corners_threshold, room_max_length):
    """
    Finds corners and draw lines from them
    @Param image input image
    @Param corners_threshold threshold for percentage certainty that detected corner is a corner
    @Param room_max_length threshold for room max width
    @Return output image
    """
    img2 = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    # Detect corners - can fiddle with parameters
    kernel = np.ones((1,1),np.uint8)
    dst = cv2.cornerHarris(img ,2,3,0.04)
    dst = cv2.erode(dst,kernel, iterations = 10)
    corners = dst > corners_threshold * dst.max()
    img2[dst>0.05*dst.max()]=[0,0,255]

    # Draw line between corners on the same x or y coordinate
    for y,row in enumerate(corners):
        x_same_y = np.argwhere(row)
        for x1, x2 in zip(x_same_y[:-1], x_same_y[1:]):

            if x2[0] - x1[0] < room_max_length:
                color = 0
                cv2.line(img, (x1[0], y), (x2[0], y), color, 1)
                cv2.line(img2, (x1[0], y), (x2[0], y), [0, 0, 0], 1)


    for x,col in enumerate(corners.T):
        y_same_x = np.argwhere(col)
        for y1, y2 in zip(y_same_x[:-1], y_same_x[1:]):
            if y2[0] - y1[0] < room_max_length:
                color = 0
                cv2.line(img, (x, y1[0]), (x, y2[0]), color, 1)
                cv2.line(img2, (x, y1[0]), (x, y2[0]), [0, 0, 0], 1)

    #cv2.imshow("linez",img2)
    return img


def mark_outside_black(img, mask):
    """
    Mark white background as black
    @Param @mandatory img image input
    @Param @mandatory mask mask to use
    @Return image, mask
    """
    # Mark the outside of the house as black
    contours, _ = cv2.findContours(~img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contour_sizes = [(cv2.contourArea(contour), contour) for contour in contours]
    biggest_contour = max(contour_sizes, key=lambda x: x[0])[1]
    mask = np.zeros_like(mask)
    cv2.fillPoly(mask, [biggest_contour], 255)
    img[mask == 0] = 0
    return img, mask


def get_door_boxes(img, noise_removal_threshold=50, corners_threshold=0.01,
               room_max_length=140):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    assert 0 <= corners_threshold <= 1

    # Remove noise left from wall detection
    mask = remove_noise(img, noise_removal_threshold)
    img = ~mask

    img = join_doorways(img,corners_threshold,room_max_length)
    return img, mask


def detect_doors(img, mask, door_width_max=5000,
               door_width_min=10):

    """
    https://stackoverflow.com/questions/54274610/crop-each-of-them-using-opencv-python
    @Param img: image of walls from floorplan after walls have been detected
    @Param noise_removal_threshold: Minimum area of noise allowed
    @Param corners_threshold: Threshold to allow corners. Higher removes more of the house.
    @Param room_max_length: Maximum line length to add to close off open doors.
    @Param door_width_min: Minimum number of pixels to identify component as room instead of hole in the wall.
    @Return: rooms: list of numpy arrays containing boolean masks for each detected room
             colored_house: A colored version of the input image, where each room has a random color.
    """
    img, mask = mark_outside_black(img, mask)

    # Find the connected components in the house
    ret, labels = cv2.connectedComponents(img)
    img = cv2.cvtColor(img,cv2.COLOR_GRAY2BGR)
    unique = np.unique(labels)
    details = []
    for label in unique:
        component = labels == label
        #print(img[component].sum())
        if img[component].sum() == 0 or np.count_nonzero(component) < door_width_min or np.count_nonzero(component) > door_width_max:
            color = 0
        else:
            details.append(component)
            #color = np.random.randint(0, 255, size=3)
            color = [0,255,0]

        img[component] = color
    # return details, img
    return img


def process_doors(image):
    """
    turn coloured door image to black and white
    @Param image: image file containing doors to turn black and white
    @Return image: image that has been turned to black and white
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Set threshold level
    threshold_level = 20

    # Create mask of all pixels lower than threshold level
    mask = gray < threshold_level
    mask2 = gray > threshold_level

    # Color the pixels in the mask
    image[mask] = (255, 255, 255)
    image[mask2] = (0, 0, 0)
    return image


def combine_images(door_image, wall_image):
    """
    Overlays the doors on top of the wall image for simple assessment of success
    @Param door_image - image containing detected doors
    @Param wall_image - image containing detected walls
    @Return combined_image - image containing the overlaid image
    """
    door_colour = [0, 255, 0]
    mask = np.all(door_image == door_colour,  axis=-1)
    # combined_image = cv2.cvtColor(wall_image,cv2.COLOR_GRAY2BGR)
    combined_image = wall_image.copy()
    # combined_image[np.where(door_image != 0)] = door_image[np.where(door_image != 0)]
    combined_image[mask] = door_colour
    return combined_image


def main(image_dir, file_name, extension):
    # some filename manipulation for use when saving image
    image_path = os.path.join(image_dir,file_name+extension)
    output_path = os.path.join(image_dir,"temp_doors"+extension)
    output_path_bw = os.path.join(image_dir,"temp_doors_bw"+extension)
    output_path_lines = os.path.join(image_dir,"temp_lines"+extension)


    # reading image
    img = cv2.imread(image_path)

    # get the boxes where the auto detected doors are
    lines, mask = get_door_boxes(img)
    #cv2.imshow("linez", lines)
    cv2.imwrite(output_path_lines, lines)
    coloured_doors = detect_doors(lines, mask)
    doors = remove_large_doors(coloured_doors)
    #cv2.imshow("coloured",doors)
    bw_doors = process_doors(doors.copy())
    cv2.imwrite(output_path_bw, bw_doors)
    #cv2.imshow("bw", bw_doors)
    
    combo = combine_images(doors, img)
    #cv2.imshow("combo",combo)
    cv2.imwrite(output_path, combo)
    print(output_path)
    cv2.destroyAllWindows()
    sys.stdout.flush()
    


if __name__ == "__main__":
    image_dir = sys.argv[1]
    file_name = sys.argv[2]
    extension = sys.argv[3]
    main(image_dir, file_name, extension)