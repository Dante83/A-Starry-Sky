from math import *
import numpy as np

#Mulitples of PI
PI = np.pi
ONE_OVER_PI = 1.0 / PI
PI_TIMES_TWO = np.pi * 2.0
ONE_OVER_PI_TIMES_TWO = 1.0 / PI_TIMES_TWO
PI_OVER_TWO = np.pi * 0.5

class BucketGrid:
    def __init__(self, buckets_in_galactic_latitude, buckets_in_galactic_longitude):
        self.buckets_in_galactic_latitude = buckets_in_galactic_latitude
        self.delta_galactic_latitude = PI / self.buckets_in_galactic_latitude
        self.buckets_in_galactic_longitude = buckets_in_galactic_longitude
        self.delta_galactic_longitude = PI_TIMES_TWO / buckets_in_galactic_longitude
        self.number_of_buckets = self.buckets_in_galactic_longitude * self.buckets_in_galactic_latitude
        self.star_buckets = [[] for x in range(self.number_of_buckets)]

    def clamp(self, value, min_value, max_value):
        return max(min(value, max_value), min_value)

    def getBucketID(self, galactic_latitude, galactic_longitude):
        #Normalize the galactic latitude and longitude
        normalized_galactic_latitude = self.clamp((galactic_latitude + PI_OVER_TWO) * ONE_OVER_PI, 0.0, 1.0)
        normalized_galactic_longitude = self.clamp(galactic_longitude * ONE_OVER_PI_TIMES_TWO, 0.0, 1.0)

        #Get bucket ID
        y = int(floor(float(floor(normalized_galactic_latitude * self.number_of_buckets)) / float(self.buckets_in_galactic_longitude)))
        return y + int(floor(normalized_galactic_longitude * self.buckets_in_galactic_longitude))

    def appendStar(self, star):
        bucket_id = self.getBucketID(star.galactic_latitude, star.galactic_longitude)
        self.star_buckets[bucket_id].append(star)

        return bucket_id

    def getNearbyStars(self, galactic_latitude, galactic_longitude):
        bucket_id = self.getBucketID(galactic_latitude, galactic_longitude)
        stars_in_nearby_buckets = self.star_buckets[bucket_id][:]

        right_bucket_latitude = (galactic_latitude + self.delta_galactic_latitude) % PI_TIMES_TWO
        left_bucket_latitude = (galactic_latitude - self.delta_galactic_latitude) % PI_TIMES_TWO

        #Bucket to the right
        bucket_id = self.getBucketID(right_bucket_latitude, galactic_longitude)
        stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

        #Bucket to the left
        bucket_id = self.getBucketID(left_bucket_latitude, galactic_longitude)
        stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

        #Bucket position in longitude
        bucket_position_in_longitude = floor(galactic_longitude / self.delta_galactic_longitude)

        #Check if we can go down
        if(bucket_position_in_longitude < self.buckets_in_galactic_longitude):
            #Bucket below
            bucket_below_longitude = galactic_longitude + self.delta_galactic_longitude
            bucket_id = self.getBucketID(galactic_latitude, bucket_below_longitude)
            stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

            right_bucket_latitude = (galactic_latitude + self.delta_galactic_latitude) % PI_TIMES_TWO
            left_bucket_latitude = (galactic_latitude - self.delta_galactic_latitude) % PI_TIMES_TWO

            #Bucket to the right
            bucket_id = self.getBucketID(right_bucket_latitude, bucket_below_longitude)
            stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

            #Bucket to the left
            bucket_id = self.getBucketID(left_bucket_latitude, bucket_below_longitude)
            stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

        #Check if we can go up
        if(bucket_position_in_longitude > 0):
            #Bucket above
            bucket_above_longitude = galactic_longitude - self.delta_galactic_longitude
            bucket_id = self.getBucketID(galactic_latitude, bucket_above_longitude)
            stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

            right_bucket_latitude = (galactic_latitude + self.delta_galactic_latitude) % PI_TIMES_TWO
            left_bucket_latitude = (galactic_latitude - self.delta_galactic_latitude) % PI_TIMES_TWO

            #Bucket to the right
            bucket_id = self.getBucketID(right_bucket_latitude, bucket_above_longitude)
            stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

            #Bucket to the left
            bucket_id = self.getBucketID(left_bucket_latitude, bucket_above_longitude)
            stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

        #Once we have gathered the stars from all nearby buckets, return them
        return stars_in_nearby_buckets
