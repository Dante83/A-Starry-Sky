from math import *
import numpy as np

class OrderedGroupOfStars:
    def __init__(self, orderedGroupOfStars):
        self.ordererdGroupOfStars = orderedGroupOfStars
        self.center = np.zeros(3)
        self.calculateStarGroupCenter()
        self.brightest_star_on_edge = 0

    def calculateStarGroupCenter(self):
        #Group center is only a running average based on the last eight brightest stars
        if(len(self.ordererdGroupOfStars) > 1):
            sum = np.zeros(3)
            stars_for_centering = None
            if self.ordererdGroupOfStars[0].magnitude > self.ordererdGroupOfStars[-1].magnitude:
                self.brightest_star_on_edge = 0
                stars_for_centering = self.ordererdGroupOfStars[0:min(len(self.ordererdGroupOfStars), 8)]
            else:
                self.brightest_star_on_edge = -1
                stars_for_centering = self.ordererdGroupOfStars[-min(8, len(self.ordererdGroupOfStars)):0]

            for star in stars_for_centering:
                sum = sum + self.ordererdGroupOfStars[0].galactic_coordinates
            #Normalize
            self.center = sum / sqrt(np.dot(sum, sum))
        elif(len(self.ordererdGroupOfStars) == 1):
            self.center = self.ordererdGroupOfStars[0].galactic_coordinates

    def getHaversineDistanceBetweenVectors(self, v0, v1):
        delta_v = v0 - v1
        mag_v = sqrt(np.dot(delta_v, delta_v))
        phi = abs(asin(mag_v / 2))
        phi = min(phi, 2.0 * np.pi - phi)
        return 2.0 * phi

    def combineWithOtherStarGroup(self, other_star_group):
        possible_connections = [0, -1]
        smallest_spherical_distance = 2 * np.pi
        best_combination = None
        for possible_connection in possible_connections:
            position_1 = self.ordererdGroupOfStars[self.brightest_star_on_edge].galactic_coordinates
            position_2 = other_star_group.ordererdGroupOfStars[possible_connection].galactic_coordinates
            spherical_distance = self.getHaversineDistanceBetweenVectors(position_1, position_2)
            if(spherical_distance < smallest_spherical_distance):
                smallest_spherical_distance = spherical_distance
                best_combination = (self.brightest_star_on_edge, possible_connection)

        #Now that we have the best combination, combine our two groups together
        if(best_combination == (0, 0)):
            other_star_group.ordererdGroupOfStars.reverse()
            self.ordererdGroupOfStars = other_star_group.ordererdGroupOfStars + self.ordererdGroupOfStars
        elif(best_combination == (0, -1)):
            self.ordererdGroupOfStars = other_star_group.ordererdGroupOfStars + self.ordererdGroupOfStars
        elif(best_combination == (-1, 0)):
            self.ordererdGroupOfStars = self.ordererdGroupOfStars + other_star_group.ordererdGroupOfStars
        else: #(-1, -1)
            self.ordererdGroupOfStars.reverse()
            self.ordererdGroupOfStars = other_star_group.ordererdGroupOfStars + self.ordererdGroupOfStars

        #Now that we have a bunch of new members in our star group, we must determine our new center
        self.calculateStarGroupCenter()

    def findAndCombineWithClosestOtherStarGroup(self, other_star_groups):
        smallest_star_group = None
        small_distance_by_star_group = float("inf") #Madness!
        for i, other_star_group in enumerate(other_star_groups):
            spherical_distance = self.getHaversineDistanceBetweenVectors(self.center, other_star_group.center)
            if(spherical_distance < small_distance_by_star_group):
                small_distance_by_star_group = spherical_distance
                smallest_star_group = other_star_group

        self.combineWithOtherStarGroup(other_star_groups.pop(i))
