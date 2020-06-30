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

    def getPix():
        a = 2.0 * float(i) / faceSize
        b = 2.0 * float(j) / faceSize

        if faceIdx == 0: # back
            (x,y,z) = (-1.0, 1.0 - a, 1.0 - b)
        elif faceIdx == 1: # left
            (x,y,z) = (a - 1.0, -1.0, 1.0 - b)
        elif faceIdx == 2: # front
            (x,y,z) = (1.0, a - 1.0, 1.0 - b)
        elif faceIdx == 3: # right
            (x,y,z) = (1.0 - a, 1.0, 1.0 - b)
        elif faceIdx == 4: # top
            (x,y,z) = (b - 1.0, a - 1.0, 1.0)
        elif faceIdx == 5: # bottom
            (x,y,z) = (1.0 - b, a - 1.0, -1.0)

        return (x, y, z)

    #With help from Benjamin Dobell
    #https://stackoverflow.com/questions/29678510/convert-21-equirectangular-panorama-to-cube-map
    def getPixelGalacticCoordinates(self, side, x_in_pixels, y_in_pixels):
        #Convert our coordinates in x, y, to cubemap space
        a = 2.0 * float(x_in_pixels) * self.one_over_size
        b = 2.0 * float(y_in_pixels) * self.one_over_size

        if side == 0: # back
            galactic_position = [-1.0, 1.0 - a, 1.0 - b]
        elif side == 1: # left
            galactic_position = [a - 1.0, -1.0, 1.0 - b]
        elif side == 2: # front
            galactic_position = [1.0, a - 1.0, 1.0 - b]
        elif side == 3: # right
            galactic_position = [1.0 - a, 1.0, 1.0 - b]
        elif side == 4: # top
            galactic_position = [b - 1.0, a - 1.0, 1.0]
        elif side == 5: # bottom
            galactic_position = [1.0 - b, a - 1.0, -1.0]

        #Convert our coordinates to centered galactic space
        galactic_position = np.array(galactic_position)

        #Normalize the coordinate to get the spherical position
        return galactic_position / sqrt(np.dot(galactic_position, galactic_position))
