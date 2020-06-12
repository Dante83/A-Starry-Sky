#Mulitples of PI
PI = np.pi
ONE_OVER_PI = 1.0 / PI
PI_TIMES_TWO = np.pi * 2.0
ONE_OVER_PI_TIMES_TWO = 1.0 / ONE_OVER_PI_TIMES_TWO
PI_OVER_TWO = np.pi * 0.5

class BucketGrid:
    def __init__(self, bucket_in_galactic_latitude, buckets_in_galactic_longitude):
        self.bucket_in_galactic_latitude = bucket_in_galactic_latitude
        self.buckets_in_galactic_longitude = buckets_in_galactic_longitude
        self.number_of_buckets = self.buckets_in_galactic_longitude * self.bucket_in_galactic_latitude
        self.star_buckets = [[] for x in range(self.number_of_buckets)]

    def clamp(self, value, min, max):
        return max(min(value, max), min)

    def getBucketID(self, galactictic_latitude, galactic_longitude):
        #Normalize the galactic latitude and longitude
        normalized_galactic_latitude = self.clamp((galactictic_latitude + PI_OVER_TWO) * ONE_OVER_PI, 0.0, 1.0)
        normalized_galactic_longitude = self.clamp(normalized_galactic_longitude * ONE_OVER_PI_TIMES_TWO, 0.0, 1.0)

        #Get bucket ID
        return normalized_galactic_latitude * self.buckets_in_galactic_longitude + normalized_galactic_longitude * self.buckets_in_galactic_longitude * self.bucket_in_galactic_latitude

    def appendStar(self, star):
        bucket_id = self.getBucketID(star.galactictic_latitude, star.galactic_longitude)
        star.bucket_id = bucket_id
        self.star_buckets[bucket_id].append(star)

    def removeStar(self, star):
        stars_in_bucket = self.star_buckets[star.bucket_id]
        star.bucket_id = None
        stars_in_bucket.remove(star)

    def getNearbyStars(self, galactictic_latitude, galactic_longitude):
        bucket_id = getBucketID(galactictic_latitude, galactic_longitude)
        stars_in_nearby_buckets = self.star_buckets[bucket_id][:]

        #Bucket to the right
        num_buckets_to_right_of_bucket = (self.buckets_in_galactic_longitude - (bucket_id % self.buckets_in_galactic_longitude))
        max_row_bucket = bucket_id + num_buckets_to_right_of_bucket
        id_of_bucket_to_the_right = bucket_id + 1
        if id_of_bucket_to_the_right <= max_row_bucket:
            id_of_bucket_to_the_right = id_of_bucket_to_the_right
        else:
            id_of_bucket_to_the_right = max_row_bucket - self.buckets_in_galactic_longitude + 1
        stars_in_nearby_buckets += self.star_buckets[id_of_bucket_to_the_right][:]

        #Bucket to the left
        min_row_bucket = max_row_bucket - self.buckets_in_galactic_longitude
        id_of_bucket_to_the_left = bucket_id - 1
        if id_of_bucket_to_the_right >= min_row_bucket:
            id_of_bucket_to_the_left = id_of_bucket_to_the_left
        else:
            id_of_bucket_to_the_left = min_row_bucket + self.buckets_in_galactic_longitude - 1
        stars_in_nearby_buckets += self.star_buckets[id_of_bucket_to_the_left][:]

        #Check if we need the bucket directly above this bucket
        normalized_galactic_latitude = self.clamp((galactictic_latitude + PI_OVER_TWO) * ONE_OVER_PI, 0.0, 1.0)
        if bucket_id >= self.buckets_in_galactic_longitude:
            bucket_id_above_this = bucket_id - self.buckets_in_galactic_longitude
            stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

            #Bucket to the right
            num_buckets_to_right_of_bucket = (self.buckets_in_galactic_longitude - (bucket_id_above_this % self.buckets_in_galactic_longitude))
            max_row_bucket = bucket_id_above_this + num_buckets_to_right_of_bucket
            id_of_bucket_to_the_right = bucket_id_above_this + 1
            if id_of_bucket_to_the_right <= max_row_bucket:
                id_of_bucket_to_the_right = id_of_bucket_to_the_right
            else:
                id_of_bucket_to_the_right = max_row_bucket - self.buckets_in_galactic_longitude + 1
            stars_in_nearby_buckets += self.star_buckets[id_of_bucket_to_the_right][:]

            #Bucket to the left
            min_row_bucket = max_row_bucket - self.buckets_in_galactic_longitude
            id_of_bucket_to_the_left = bucket_id_above_this - 1
            if id_of_bucket_to_the_right >= min_row_bucket:
                id_of_bucket_to_the_left = id_of_bucket_to_the_left
            else:
                id_of_bucket_to_the_left = min_row_bucket + self.buckets_in_galactic_longitude - 1
            stars_in_nearby_buckets += self.star_buckets[id_of_bucket_to_the_left][:]

        #Check if we need the bucket directly below this bucket
        if bucket_id < (self.number_of_buckets - self.buckets_in_galactic_longitude):
            bucket_id_below_this = bucket_id + self.buckets_in_galactic_longitude
            stars_in_nearby_buckets += self.star_buckets[bucket_id][:]

            #Bucket to the right
            num_buckets_to_right_of_bucket = (self.buckets_in_galactic_longitude - (bucket_id_below_this % self.buckets_in_galactic_longitude))
            max_row_bucket = bucket_id_below_this + num_buckets_to_right_of_bucket
            id_of_bucket_to_the_right = bucket_id_below_this + 1
            if id_of_bucket_to_the_right <= max_row_bucket:
                id_of_bucket_to_the_right = id_of_bucket_to_the_right
            else:
                id_of_bucket_to_the_right = max_row_bucket - self.buckets_in_galactic_longitude + 1
            stars_in_nearby_buckets += self.star_buckets[id_of_bucket_to_the_right][:]

            #Bucket to the left
            min_row_bucket = max_row_bucket - self.buckets_in_galactic_longitude
            id_of_bucket_to_the_left = bucket_id_below_this - 1
            if id_of_bucket_to_the_right >= min_row_bucket:
                id_of_bucket_to_the_left = id_of_bucket_to_the_left
            else:
                id_of_bucket_to_the_left = min_row_bucket + self.buckets_in_galactic_longitude - 1
            stars_in_nearby_buckets += self.star_buckets[id_of_bucket_to_the_left][:]

        #Once we have gathered the stars from all nearby buckets, return them
        return stars_in_nearby_buckets
