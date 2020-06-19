from math import *
import numpy as np

class OrderedGroupOfStars:
    def __init__(self, orderedGroupOfStars):
        self.ordererdGroupOfStars = orderedGroupOfStars
        self.center_1 = np.zeros(3)
        self.center_2 = np.zeros(3)
        self.calculateStarGroupCenter()
        self.brightest_star_on_edge = 0

    def calculateStarGroupCenter(self):
        #Group center is only a running average based on the last eight brightest stars
        number_of_stars_in_group = len(self.ordererdGroupOfStars)
        if(number_of_stars_in_group > 8):
            #Left side
            sum = np.zeros(3)
            stars_for_centering = self.ordererdGroupOfStars[0:min(number_of_stars_in_group, 8)]
            for star in stars_for_centering:
                sum = sum + star.galactic_coordinates
            #Normalize
            self.center_1 = sum / sqrt(np.dot(sum, sum))

            #Right side
            sum = np.zeros(3)
            stars_for_centering = self.ordererdGroupOfStars[(number_of_stars_in_group - min(number_of_stars_in_group, 8) - 1) : number_of_stars_in_group]
            for star in stars_for_centering:
                sum = sum + star.galactic_coordinates
            #Normalize
            self.center_2 = sum / sqrt(np.dot(sum, sum))
        elif(number_of_stars_in_group <= 8 and number_of_stars_in_group != 1):
            #Left side and right side
            sum = np.zeros(3)
            stars_for_centering = self.ordererdGroupOfStars[0:min(number_of_stars_in_group, 8)]
            for star in stars_for_centering:
                sum = sum + star.galactic_coordinates
            #Normalize
            self.center_1 = sum / sqrt(np.dot(sum, sum))
            self.center_2 = self.center_1
        elif(len(self.ordererdGroupOfStars) == 1):
            self.center_1 = self.ordererdGroupOfStars[0].galactic_coordinates
            self.center_2 = self.center_1

    def getHaversineDistanceBetweenVectors(self, v0, v1):
        delta_v = v0 - v1
        mag_v = sqrt(np.dot(delta_v, delta_v))
        phi = abs(asin(mag_v / 2))
        phi = min(phi, 2.0 * np.pi - phi)
        return 2.0 * phi

    def combineWithOtherStarGroup(self, other_star_group, closest_index_in_group_1, closest_index_in_group_2):
        best_combination = (closest_index_in_group_1, closest_index_in_group_2)

        if closest_index_in_group_1 == 0:
            if closest_index_in_group_2 == 0:
                other_star_group.ordererdGroupOfStars.reverse()
                self.ordererdGroupOfStars = other_star_group.ordererdGroupOfStars + self.ordererdGroupOfStars
            else:
                self.ordererdGroupOfStars = other_star_group.ordererdGroupOfStars + self.ordererdGroupOfStars
        else:
            if closest_index_in_group_2 == 0:
                self.ordererdGroupOfStars = self.ordererdGroupOfStars + other_star_group.ordererdGroupOfStars
            else:
                other_star_group.ordererdGroupOfStars.reverse()
                self.ordererdGroupOfStars = self.ordererdGroupOfStars + other_star_group.ordererdGroupOfStars

        #Now that we have a bunch of new members in our star group, we must determine our new center
        self.calculateStarGroupCenter()

    def findAndCombineWithClosestOtherStarGroup(self, orderered_groups_of_stars, i):
        smallest_star_group_index = None
        smallest_distance_by_star_group = float("inf") #Madness!
        number_of_other_groups_that_are_self = 0
        this_star_group = orderered_groups_of_stars[i]
        closest_other_star_group = None
        closest_side_in_group_1 = 0
        closest_side_in_group_2 = 0

        for j, other_star_group in enumerate(orderered_groups_of_stars):
            #Exclude ourselves from the search
            if other_star_group is not this_star_group:
                spherical_distance = self.getHaversineDistanceBetweenVectors(self.center_1, other_star_group.center_1)
                if(spherical_distance < smallest_distance_by_star_group):
                    smallest_distance_by_star_group = spherical_distance
                    smallest_star_group_index = j
                    closest_other_star_group = other_star_group
                    closest_side_in_group_1 = 0
                    closest_side_in_group_2 = 0

                spherical_distance = self.getHaversineDistanceBetweenVectors(self.center_2, other_star_group.center_2)
                if(spherical_distance < smallest_distance_by_star_group):
                    smallest_distance_by_star_group = spherical_distance
                    smallest_star_group_index = j
                    closest_other_star_group = other_star_group
                    closest_side_in_group_1 = -1
                    closest_side_in_group_2 = -1

                spherical_distance = self.getHaversineDistanceBetweenVectors(self.center_1, other_star_group.center_2)
                if(spherical_distance < smallest_distance_by_star_group):
                    smallest_distance_by_star_group = spherical_distance
                    smallest_star_group_index = j
                    closest_other_star_group = other_star_group
                    closest_side_in_group_1 = 0
                    closest_side_in_group_2 = -1

                spherical_distance = self.getHaversineDistanceBetweenVectors(self.center_2, other_star_group.center_1)
                if(spherical_distance < smallest_distance_by_star_group):
                    smallest_distance_by_star_group = spherical_distance
                    smallest_star_group_index = j
                    closest_other_star_group = other_star_group
                    closest_side_in_group_1 = -1
                    closest_side_in_group_2 = 0

        #Remove this other star group from our list of star groups and combine it with this star group
        self.combineWithOtherStarGroup(orderered_groups_of_stars.pop(smallest_star_group_index), closest_side_in_group_1, closest_side_in_group_2)
