from stl import mesh
import cv2
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits import mplot3d
import os
import sys

"""
Generates a mesh based on an image of detected walls.
Can optionally generate a mesh above detected doorways and windows.
"""


def open_file(path_to_file):
    """    
    Open an image using open_cv including rudimentary error handling
    @Param path_to_file - path to image to open @mandatory @type str
    @Return im - image that has been opened  
    """
    # ensuring that the cwd is correct
    __location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))
    im = cv2.imread(os.path.join(__location__, path_to_file))
    if (im is None):
        print("Image does not exist")
        sys.exit(1)
    return im


def preprocess_image(image):
    """    
    Prepare image for contouring: greyscale and then binary threshold
    @Param image - image that to process
    @Return im - image that has been processed  
    """
    #flipping image horizontally to ensure correct output orientation
    image = cv2.flip(image, 1)
    # greyscaling image
    img_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # binary thresholding image
    #ret, im = cv2.threshold(img_gray, 100, 255, cv2.THRESH_BINARY_INV)
    im = cv2.threshold(img_gray, 254, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    return im


def calc_faces(contour, z, h, faces, vertices):
    """
    calculate vertices and faces from contours for mesh generation
    @Param contour - single array of points for one contour from contours detected by cv2.findContours()
    @Param z - integer defining the bottom co-ordinate for the faces
    @Param h - integer defining the height of walls
    @Return faces - list of indices of faces from vertices list for mesh generation 
    @Return vertices - list of all vertices of faces including extruded 
    """
    # vertices = []
    j = len(vertices)
    for i in range(len(contour)):
        x, y = contour[i].ravel()
        vertices.append([x, y, z])
        vertices.append([x, y, h])
    start = j
    while j <= len(vertices)-4:
        faces.append([j, j+3, j+1])
        faces.append([j, j+2, j+3])
        j += 2
    faces.append([j, start+1, j+1])
    faces.append([j, start, start+1])
    # faces = np.array(face)
    # vertices = np.array(vertices)
    return faces, vertices


def calc_floor_faces(contours, faces, vertices, h):
    """
    Adds a floor if required to the 3D model.
    @Param: 
    """
    x_min, y_min = contours[0][0].ravel()
    x_max, y_max = x_min, y_min
    for contour in contours:
        if min(contour.squeeze()[:, 0]) < x_min:
            x_min = min(contour.squeeze()[:, 0])
        if min(contour.squeeze()[:, 1]) < y_min:
            y_min = min(contour.squeeze()[:, 1])
        if x_max < max(contour.squeeze()[:, 0]):
            x_max = max(contour.squeeze()[:, 0])
        if y_max < max(contour.squeeze()[:, 1]):
            y_max = max(contour.squeeze()[:, 1])
    print(x_max, y_max)
    print(x_min, y_min)
    j = len(vertices)
    vertices.append([x_min, y_min, 0])
    vertices.append([x_min, y_max, 0])
    vertices.append([x_max, y_min, 0])
    vertices.append([x_max, y_max, 0])
    start = j
    while j <= len(vertices)-4:
        faces.append([j, j+3, j+1])
        faces.append([j, j+2, j+3])
        j += 2
    faces.append([j, start+1, j+1])
    faces.append([j, start, start+1])

    return faces, vertices



def generate_mesh(faces, vertices):
    """
    Generates a mesh from the face and vertex info
    @Param faces - numpy array of face data
    @Param vertices - numpy array of vertex data
    @Return shape - Mesh containing all the information ready to export as an .stl file
    """
    shape = mesh.Mesh(np.zeros(faces.shape[0], dtype=mesh.Mesh.dtype))

    for i, f in enumerate(faces):
        for j in range(3):
            shape.vectors[i][j] = vertices[f[j], :]

    return shape


def main(image_dir, filename_wall, filename_door, filename_window):
    filepath = os.path.join(image_dir,filename_wall)
    filepath_door = os.path.join(image_dir,filename_door)
    filepath_window = os.path.join(image_dir,filename_window)
    
    output = os.path.join(image_dir, "temp_mesh.stl")
    floor = False
    door = True
    window = True

    image = open_file(filepath)
    image_door = open_file(filepath_door)
    image_window = open_file(filepath_window)
    #image = cv2.imread(filepath)
    #image_door = cv2.imread(filepath_door)
    post_image = preprocess_image(image)
    post_image_door = preprocess_image(image_door)
    post_image_window = preprocess_image(image_window)

    contours, hierarchy = cv2.findContours(post_image.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours2, hierarchy2 = cv2.findContours(post_image_door.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours3, hierarchy2 = cv2.findContours(post_image_window.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    faces = []
    vert = []
    # height for walls
    h = 150
    # height for top of windows
    h_w = h*0.8
    # height for bottom of windows
    h_b = h*0.3

    for contour in contours:
        faces, vert = calc_faces(contour, 0, h, faces, vert)

    if floor:
        faces, vert = calc_floor_faces(contours, faces, vert, h)

    if door:
        for contour in contours2:
            faces, vert = calc_faces(contour, h_w, h, faces, vert)

    if window:
        for contour in contours3:
            faces, vert = calc_faces(contour, h_w, h, faces, vert)
            faces, vert = calc_faces(contour, 0, h_b, faces, vert)

    faces = np.array(faces)
    vertices = np.array(vert)

    shape = generate_mesh(faces, vertices) 
    shape.save(output)
    """
    # Create a new plot
    figure = plt.figure()
    axes = mplot3d.Axes3D(figure, auto_add_to_figure=False)
    figure.add_axes(axes)

    # Render the shape
    axes.add_collection3d(mplot3d.art3d.Poly3DCollection(shape.vectors))
    # print(shape.vectors)

    # Auto scale to the mesh size
    scale = shape.points.flatten()
    axes.auto_scale_xyz(scale, scale, scale)

    # Show the plot to the screen
    #plt.savefig("figures/simple_drawn_mesh_1.jpg")
    plt.show()
    """
    print(output)
    sys.stdout.flush()
    #clean up
    cv2.destroyAllWindows()



if __name__ == "__main__":
    image_dir = sys.argv[1]
    file_name_walls = sys.argv[2]
    file_name_doors = sys.argv[3]
    file_name_windows = sys.argv[4]
    main(image_dir, file_name_walls, file_name_doors, file_name_windows)