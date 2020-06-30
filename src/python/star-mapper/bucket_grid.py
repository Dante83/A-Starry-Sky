from math import *
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import colors

#Mulitples of PI
PI = np.pi
ONE_OVER_PI = 1.0 / PI
PI_TIMES_TWO = np.pi * 2.0
ONE_OVER_PI_TIMES_TWO = 1.0 / PI_TIMES_TWO
PI_OVER_TWO = np.pi * 0.5

class BucketGrid:
    def __init__(self):
        self.buckets_in_galactic_latitude = 32
        self.delta_galactic_latitude = PI / self.buckets_in_galactic_latitude
        self.buckets_in_galactic_longitude = 64
        self.delta_galactic_longitude = PI_TIMES_TWO / self.buckets_in_galactic_longitude
        self.number_of_buckets = self.buckets_in_galactic_longitude * self.buckets_in_galactic_latitude
        self.star_buckets = [[] for x in range(self.number_of_buckets)]

    def clamp(self, value, min_value, max_value):
        return max(min(value, max_value), min_value)

    def getBucketID(self, galactic_latitude, galactic_longitude):
        #Normalize the galactic latitude and longitude
        normalized_galactic_latitude = self.clamp((galactic_latitude + PI_OVER_TWO) * ONE_OVER_PI, 0.0, 1.0)
        normalized_galactic_longitude = self.clamp((galactic_longitude + PI) * ONE_OVER_PI_TIMES_TWO, 0.0, 1.0)

        #Get bucket ID
        x_coord = floor(normalized_galactic_longitude * self.buckets_in_galactic_longitude)
        y_coord = floor(normalized_galactic_latitude * self.delta_galactic_latitude)

        return ((x_coord & 0x3f) << 5) | (y_coord & 0x1F)

    def getBucketIdFromXAndYCoord(self, x_coord, y_coord):
        return ((x_coord & 0x3f) << 5) | (y_coord & 0x1F)

    def appendStar(self, star):
        bucket_id = self.getBucketID(star.galactic_latitude, star.galactic_longitude)
        self.star_buckets[bucket_id].append(star)

        return bucket_id

    def getNearbyStars(self, galactic_latitude, galactic_longitude):
        bucket_id = self.getBucketID(galactic_latitude, galactic_longitude)
        stars_in_nearby_buckets = self.star_buckets[bucket_id][:]

        #Normalize the galactic latitude and longitude
        normalized_galactic_latitude = self.clamp((galactic_latitude + PI_OVER_TWO) * ONE_OVER_PI, 0.0, 1.0)
        normalized_galactic_longitude = self.clamp((galactic_longitude + PI) * ONE_OVER_PI_TIMES_TWO, 0.0, 1.0)
        x_coord = floor(normalized_galactic_longitude * self.buckets_in_galactic_longitude)
        y_coord = floor(normalized_galactic_latitude * self.delta_galactic_latitude)

        x_coord_for_right_bucket = (x_coord + 1) % self.buckets_in_galactic_longitude
        stars_in_nearby_buckets += self.star_buckets[self.getBucketIdFromXAndYCoord(x_coord_for_right_bucket, y_coord)][:]
        x_coord_for_left_bucket = self.buckets_in_galactic_longitude - 1 if (x_coord - 1) < 0 else (x_coord - 1)
        stars_in_nearby_buckets += self.star_buckets[self.getBucketIdFromXAndYCoord(x_coord_for_left_bucket, y_coord)][:]

        y_coord_for_upper_bucket = y_coord - 1
        if(y_coord_for_upper_bucket >= 0):
            stars_in_nearby_buckets += self.star_buckets[self.getBucketIdFromXAndYCoord(x_coord, y_coord_for_upper_bucket)][:]

            x_coord_for_right_bucket = (x_coord + 1) % self.buckets_in_galactic_longitude
            stars_in_nearby_buckets += self.star_buckets[self.getBucketIdFromXAndYCoord(x_coord_for_right_bucket, y_coord_for_upper_bucket)][:]
            x_coord_for_left_bucket = self.buckets_in_galactic_longitude - 1 if (x_coord - 1) < 0 else (x_coord - 1)
            stars_in_nearby_buckets += self.star_buckets[self.getBucketIdFromXAndYCoord(x_coord_for_left_bucket, y_coord_for_upper_bucket)][:]

        y_coord_for_lower_bucket = y_coord + 1
        if(y_coord_for_lower_bucket < self.buckets_in_galactic_latitude):
            stars_in_nearby_buckets += self.star_buckets[self.getBucketIdFromXAndYCoord(x_coord, y_coord_for_lower_bucket)][:]

            x_coord_for_right_bucket = (x_coord + 1) % self.buckets_in_galactic_longitude
            stars_in_nearby_buckets += self.star_buckets[self.getBucketIdFromXAndYCoord(x_coord_for_right_bucket, y_coord_for_lower_bucket)][:]
            x_coord_for_left_bucket = self.buckets_in_galactic_longitude - 1 if (x_coord - 1) < 0 else (x_coord - 1)
            stars_in_nearby_buckets += self.star_buckets[self.getBucketIdFromXAndYCoord(x_coord_for_left_bucket, y_coord_for_lower_bucket)][:]

        #Once we have gathered the stars from all nearby buckets, return them
        return list(set(stars_in_nearby_buckets))
