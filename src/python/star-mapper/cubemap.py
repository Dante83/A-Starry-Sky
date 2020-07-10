from math import *
import numpy as np

#Mulitples of PI
PI = np.pi
ONE_OVER_PI = 1.0 / PI
PI_TIMES_TWO = np.pi * 2.0
ONE_OVER_PI_TIMES_TWO = 1.0 / PI_TIMES_TWO
PI_OVER_TWO = np.pi * 0.5

class Cubemap:
    def __init__(self, size):
        self.size = size
        self.one_over_size = 1.0 / size
        self.sides = [[[[0, 0, 0, 0] for y in range(size)] for x in range(size)] for i in range(6)]
        self.px = self.sides[0]
        self.py = self.sides[1]
        self.pz = self.sides[2]
        self.nx = self.sides[3]
        self.ny = self.sides[4]
        self.nz = self.sides[5]

    def getPixelGalacticCoordinates(self, faceIdx, x_in_pixels, y_in_pixels):
        radius_of_cube = self.size * 0.5

        if faceIdx == 'px': # px
            galactic_position = [radius_of_cube, y_in_pixels - radius_of_cube, radius_of_cube - x_in_pixels]
        elif faceIdx == 'nx': # nx
            galactic_position = [-radius_of_cube, y_in_pixels - radius_of_cube, x_in_pixels - radius_of_cube]
        elif faceIdx == 'py': # py
            galactic_position = [x_in_pixels - radius_of_cube, radius_of_cube, radius_of_cube - y_in_pixels]
        elif faceIdx == 'ny': # ny
            galactic_position = [x_in_pixels - radius_of_cube, -radius_of_cube, y_in_pixels - radius_of_cube]
        elif faceIdx == 'pz': # pz
            galactic_position = [x_in_pixels - radius_of_cube, y_in_pixels - radius_of_cube, radius_of_cube]
        elif faceIdx == 'nz': # nz
            galactic_position = [radius_of_cube - x_in_pixels, y_in_pixels - radius_of_cube, -radius_of_cube]

        #Convert our coordinates to centered galactic space
        galactic_position = np.array(galactic_position)

        #Normalize the coordinate to get the spherical position
        return galactic_position / sqrt(np.dot(galactic_position, galactic_position))
