from math import *
import numpy as np

class OrderedGroupOfStars:
    def __init__(self, orderedGroupOfStars):
        self.ordererdGroupOfStars = orderedGroupOfStars
        self.center = zeroes(0.0)
        calculateStarGroupCenter()

    def calculateStarGroupCenter(self):
        if(len(self.ordererdGroupOfStars) > 1):
            sum = np.zeroes(0.0)
            for star in self.ordererdGroupOfStars:
                sum = sum + self.ordererdGroupOfStars[0].position
            #Normalize
            self.center = sum / sqrt(np.dot(sum, sum))
        elif(len(self.ordererdGroupOfStars) == 1):
            self.center = self.ordererdGroupOfStars[0].position

    def getHaversineDistanceBetweenVectors(self, v0, v1):
        delta_v = v0 - v1
        mag_v = sqrt(np.dot(delta_v, delta_v))
        phi = abs(asin(mag_v / 2))
        phi = min(phi, 2.0 * np.pi - phi)
        return 2.0 * phi

    def combineWithOtherStarGroup(self, other_star_group):
        possible_connections = ((0, 0), (0, -1), (-1, 0), (-1, -1))
        smallest_spherical_distance = 2 * np.pi
        best_combination = None
        for possible_connection in possible_connections:
            spherical_distance = getHaversineDistanceBetweenVectors(self.ordererdGroupOfStars[possible_connection[0]], other_star_group.ordererdGroupOfStars[possible_connection[1]])
            if(spherical_distance < smallest_spherical_distance):
                smallest_spherical_distance = spherical_distance
                best_combination = possible_connection

        #Now that we have the best combination, combine our two groups together
        if(best_combination == (0, 0)):
            self.ordererdGroupOfStars = other_star_group.ordererdGroupOfStars.reverse() + self.ordererdGroupOfStars
        elif(best_combination == (0, -1)):
            self.ordererdGroupOfStars = other_star_group.ordererdGroupOfStars + self.ordererdGroupOfStars
        elif(best_combination == (-1, 0)):
            self.ordererdGroupOfStars = self.ordererdGroupOfStars + other_star_group.ordererdGroupOfStars
        else: #(-1, -1)
            self.ordererdGroupOfStarsother_star_group.ordererdGroupOfStars + self.ordererdGroupOfStars.reverse()

        #Now that we have a bunch of new members in our star group, we must determine our new center
        self.calculateStarGroupCenter()

    def findAndCombineWithClosestOtherStarGroup(other_star_groups):
        smallest_star_group = None
        small_distance_by_star_group = float("inf") #Madness!
        for i, other_star_group in enumerate(other_star_groups):
            for star in other_star_group.ordererdGroupOfStars:
                spherical_distance = getHaversineDistanceBetweenVectors(self.center, star.galactic_coordinates)
                if(spherical_distance < small_distance_by_star_group):
                    small_distance_by_star_group = spherical_distance
                    smallest_star_group = other_star_group

        self.combineWithOtherStarGroup(other_star_groups.pop(i))
