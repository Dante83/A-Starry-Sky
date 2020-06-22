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

    def getPixelGalacticCoordinates(self, side, x_in_pixels, y_in_pixels):
        #Convert our coordinates in x, y, to cubemap space
        x = x_in_pixels * self.one_over_size
        y = y_in_pixels * self.one_over_size
        galactic_position = None
        if side == 0:#px
            galactic_position = [1.0, 1.0 - y, 1.0 - x]
        elif side == 1:#py
            galactic_position = [x, 1.0, y]
        elif side == 2:#pz
            galactic_position = [x, 1.0 - y, 1.0]
        elif side == 3:#nx
            galactic_position = [1.0, 1.0 - y, x]
        elif side == 4:#ny
            galactic_position = [x, 1.0, 1.0 - y]
        elif side == 5:#nz
            galactic_position = [1.0 - x, 1.0 - y, 1.0]

        #Convert our coordinates to centered galactic space
        galactic_position = np.array(galactic_position) - np.array([0.5, 0.5, 0.5])

        #Normalize the coordinate to get the spherical position
        return galactic_position / sqrt(np.dot(galactic_position, galactic_position))
