#Sweet lordy... everything I'm looking for is in GLSL 3.1
#But the way is blocked by Saurumon! Thus we must venture into the dwarven
#Mines of passing images and pulling data from them. A most Ugly task...
import csv, os, json, math
import numpy as np
import gzip
import multiprocessing as mp
import time
import progressbar
import shutil

class Bucket:
    def __init__(self, id, stars, nearby_buckets):
        self.id = id
        self.stars = stars
        self.nearby_buckets = nearby_buckets

class VisibleStar:
    def __init__(self, equitorial_coordinates, galactic_coordinates, temperature, magnitude):
        self.equitorial_coordinates = equitorial_coordinates
        self.galactic_coordinates = galactic_coordinates
        self.temperature = temperature
        self.magnitude = magnitude

class StarPosition:
    def __init__(self, ra, dec):
        self.ra = ra
        self.dec = dec

def bvToTemp(bv):
    return 4600 * ((1.0 / (0.92 * bv + 1.7)) + (1.0 / (0.92 * bv + 0.62)))

def gauss(r):
    return exp(-0.5 * (r * r))

def fastAiry(r):
    #Using the Airy Disk approximation from https://www.shadertoy.com/view/tlc3zM to score our stellar brightness
    return abs(r) < 1.88 if gauss(r / 1.4) else (abs(r) > 6.0 if 1.35 / abs(r**3) else (gauss(r / 1.4) + 2.7 / abs(r**3)) / 2.0)

def scoreStar(ra_0, dec_0, ra_1, dec_1, magnitudeOfStar):
    #haversine distance from
    #https://gist.github.com/rochacbruno/2883505
    lat1 = dec_0
    lat2 = dec_1
    lng1 = ra_0 - np.pi
    lng2 = ra_1 - np.pi

    lat = lat2 - lat1
    lng = lng2 - lng1
    d = math.sin(lat * 0.5) ** 2.0 + math.cos(lat1) * math.cos(lat2) * math.sin(lng * 0.5) ** 2.0
    r = 2.0 * 1.0 * math.asin(math.sqrt(d))

    #Return r until such a time as we determine how r should be injected into our airy disk equation.
    return r

def getBucketID(x, y, buckets_per_row, buckets_per_column):
    return int(math.floor(x * buckets_per_row) + math.floor(y * buckets_per_column) * buckets_per_row)

def updateClosestStars(bucket, pixel_latitude, pixel_longitude, closestStars, distancesSquared):
    lat1 = pixel_latitude
    lng1 = pixel_longitude
    cos_lat_1 = math.cos(lat1)

    for star in bucket.stars:
        #haversine distance from
        #https://gist.github.com/rochacbruno/2883505
        lat2 = star.galactic_coordinates[0]
        lng2 = star.galactic_coordinates[1]
        lat_diff = lat2 - lat1
        lng_diff = lng2 - lng1
        sin_lat_dif = math.sin(lat_diff * 0.5)
        sin_lng_dif = math.sin(lng_diff * 0.5)
        d = sin_lat_dif * sin_lat_dif + cos_lat_1 * math.cos(lat2) * sin_lng_dif * sin_lng_dif
        haversine_distance = 2.0 * math.asin(math.sqrt(d))

        for i, previousDistance in enumerate(distancesSquared):
            if haversine_distance < previousDistance:
                #Insert the item into the position
                closestStars.insert(i, star)
                distancesSquared.insert(i, haversine_distance)

                #Kick off the last item on the list
                closestStars.pop()
                distancesSquared.pop()
                break

def iterateColumn(x, bucketsByID, BUCKETS_PER_ROW, BUCKETS_PER_COLUMN, INDEX_IMG_WIDTH, INDEX_IMG_HEIGHT):
    column = []
    PI_TIMES_TWO = 6.2831853071795864769252867
    PI = 3.14159265358979323846264
    PI_OVER_TWO = 1.57079632679489661923132169
    x_normalized = float(x) / INDEX_IMG_WIDTH
    pixel_galactic_latitude = x_normalized * PI_TIMES_TWO
    for y in range(INDEX_IMG_HEIGHT):
        #Convert our x, y coordinate
        y_normalized = float(y) / INDEX_IMG_HEIGHT
        pixel_galactic_longitude = y_normalized * PI - PI_OVER_TWO
        bucketID = getBucketID(x_normalized, y_normalized, BUCKETS_PER_ROW, BUCKETS_PER_COLUMN)
        bucket = bucketsByID[bucketID]
        closestStars = [None, None, None, None]
        distancesSquared = [1E10, 1E10, 1E10, 1E10]
        pixel_galactic_longitude

        updateClosestStars(bucket, pixel_galactic_latitude, pixel_galactic_longitude, closestStars, distancesSquared)
        for other_bucket in bucket.nearby_buckets:
            updateClosestStars(bucketsByID[other_bucket], pixel_galactic_latitude, pixel_galactic_longitude, closestStars, distancesSquared)
        column.append(closestStars)
    return column

def initialization():
    INDEX_IMG_WIDTH = 1024
    INDEX_IMG_HEIGHT = 512
    BUCKET_WIDTH = 32
    BUCKET_HEIGHT = 32
    NUM_BUCKETS_PER_ROW = int(INDEX_IMG_WIDTH / BUCKET_WIDTH)
    NUM_BUCKETS_PER_COLUMN = int(INDEX_IMG_HEIGHT / BUCKET_HEIGHT)
    NUM_BUCKETS = NUM_BUCKETS_PER_ROW * NUM_BUCKETS_PER_COLUMN
    BUCKET_ROW_WIDTH_MINUS_ONE = NUM_BUCKETS_PER_ROW - 1
    PI_TIMES_TWO = np.pi * 2.0
    PI_OVER_TWO = np.pi * 0.5
    maxTemperature = 0.0
    minTemperature = 1000000

    #Create a bucket grid to store our stars to reduce the look-up time for nearby
    #stars for each pixel on the final image
    buckets = []
    bucketsById = {}
    for x in range(NUM_BUCKETS_PER_ROW):
        float_x = float(x)
        for y in range(NUM_BUCKETS_PER_COLUMN):
            float_y = float(y)
            bucketID = getBucketID(float_x / NUM_BUCKETS_PER_ROW, float_y / NUM_BUCKETS_PER_COLUMN, NUM_BUCKETS_PER_ROW, NUM_BUCKETS_PER_COLUMN)
            buckets.append(Bucket(bucketID, [], []))
            bucketsById[bucketID] = buckets[-1]
    for i, bucket in enumerate(buckets):
        if i % NUM_BUCKETS_PER_ROW != 0:
            bucket.nearby_buckets.append(buckets[i - 1].id)
        if i % NUM_BUCKETS_PER_ROW != BUCKET_ROW_WIDTH_MINUS_ONE:
            bucket.nearby_buckets.append(buckets[i + 1].id)
        top_central_bucket_id = i - NUM_BUCKETS_PER_ROW
        bottom_central_bucket_id = i + NUM_BUCKETS_PER_ROW
        if top_central_bucket_id >= 0:
            bucket.nearby_buckets.append(buckets[top_central_bucket_id].id)
            if top_central_bucket_id % NUM_BUCKETS_PER_ROW != 0:
                bucket.nearby_buckets.append(buckets[top_central_bucket_id - 1].id)
            if top_central_bucket_id % NUM_BUCKETS_PER_ROW != BUCKET_ROW_WIDTH_MINUS_ONE:
                bucket.nearby_buckets.append(buckets[top_central_bucket_id + 1].id)
        if bottom_central_bucket_id < NUM_BUCKETS:
            bucket.nearby_buckets.append(buckets[bottom_central_bucket_id].id)
            if bottom_central_bucket_id % NUM_BUCKETS_PER_ROW != 0:
                bucket.nearby_buckets.append(buckets[bottom_central_bucket_id - 1].id)
            if bottom_central_bucket_id % NUM_BUCKETS_PER_ROW != BUCKET_ROW_WIDTH_MINUS_ONE:
                bucket.nearby_buckets.append(buckets[bottom_central_bucket_id + 1].id)


    #Get the CSV star file and fill up our buckets with all of the data
    print('Getting star data...')
    hy_csv_path = os.path.abspath("../csv_files/hygdata_v3.csv")
    count = 0
    with open(hy_csv_path, 'r') as hyg_file:
        stars = csv.DictReader(hyg_file, delimiter=',')
        sin_of_27_4_degrees = math.sin(0.4782)
        cos_of_27_4_degrees = math.cos(0.4782)
        for star in stars:
            magnitude = float(star['mag'])
            #Filter this to the visible stars...
            #Exclude the SUN! >_<
            if magnitude < 6.5 and magnitude > -26 and star['ci'].strip():
                temperature = bvToTemp(float(star['ci']))
                if temperature > maxTemperature:
                    maxTemperature = temperature
                if temperature < minTemperature:
                    minTemperature = temperature
                star_position = StarPosition(float(star['ra']), float(star['dec']))
                equitorial_coordinates = [float(star[axis]) for axis in ['x', 'y', 'z']]
                sin_star_dec = math.sin(star_position.dec)
                cos_star_dec = math.cos(star_position.dec)
                ra_term = 3.355 - star_position.ra
                cos_ra_term = math.cos(ra_term)
                x = math.atan2(math.sin(ra_term), (cos_ra_term * sin_of_27_4_degrees - (sin_star_dec / cos_star_dec) * cos_of_27_4_degrees))
                galactic_longitude = (5.28835 - x)
                if(galactic_longitude > np.pi or galactic_longitude < -np.pi):
                    #From Joe Lee-Moyet at https://gis.stackexchange.com/questions/303300/calculating-correct-longitude-when-its-over-180
                    galactic_longitude = (galactic_longitude % PI_TIMES_TWO + (PI_TIMES_TWO + np.pi)) % PI_TIMES_TWO - np.pi
                galactic_latitude = math.asin(sin_star_dec * sin_of_27_4_degrees + cos_star_dec * cos_of_27_4_degrees * cos_ra_term)
                galactic_latitude = galactic_latitude % PI_TIMES_TWO
                normalized_galactic_longitude = (galactic_longitude + np.pi) / PI_TIMES_TWO
                normalized_galactic_latitude = galactic_latitude / PI_TIMES_TWO
                galactic_coordinates = [normalized_galactic_latitude, normalized_galactic_longitude]

                bucketID = getBucketID(normalized_galactic_latitude, normalized_galactic_longitude, NUM_BUCKETS_PER_ROW, NUM_BUCKETS_PER_COLUMN)
                bucketsById[bucketID].stars.append(VisibleStar(equitorial_coordinates, galactic_coordinates, temperature, magnitude))
    print("Max Temperature: {}".format(maxTemperature))
    print("Min Temperature: {}".format(minTemperature))

    #For each pixel, get the brightest four stars for that pixel and store them
    #in in a set of numpy arrays for our four diagrams over two images
    print("Commencing search for closest stars")
    NUM_OF_CPUS = mp.cpu_count()
    NUM_OF_THREADS = 2 * NUM_OF_CPUS
    pool = mp.Pool(NUM_OF_CPUS)
    x_values = [x for x in range(int(INDEX_IMG_WIDTH / NUM_OF_THREADS))]
    closest_stars = [[[None, None, None, None] for i in range(INDEX_IMG_HEIGHT)] for j in range(INDEX_IMG_WIDTH)]
    with progressbar.ProgressBar(max_value=len(x_values)) as bar:
        for x in x_values:
            results = [t for t in range(NUM_OF_THREADS)]
            active_threads = 0
            start_thread_index = 0
            for thread in range(NUM_OF_THREADS):
                results[thread] = pool.apply_async(iterateColumn, args=(x + thread, bucketsById, NUM_BUCKETS_PER_ROW, NUM_BUCKETS_PER_COLUMN, INDEX_IMG_WIDTH, INDEX_IMG_HEIGHT))
                active_threads += 1
                if(active_threads >= NUM_OF_THREADS or (x + thread + 1) > INDEX_IMG_WIDTH):
                    for finishedThread in results:
                        column = finishedThread.get()
                        for stars in column:
                            closest_stars[x][y][0] = stars[0]
                            closest_stars[x][y][1] = stars[1]
                            closest_stars[x][y][2] = stars[2]
                            closest_stars[x][y][3] = stars[3]
                    start_thread_index = active_threads
                    active_threads = 0
                    if((x + thread + 1) > INDEX_IMG_WIDTH):
                        break

            #Update our progress bar
            bar.update(x)

    #Save our two diagrams as a binary blob to be loaded by our program
    image_blob_1 = []
    image_blob_2 = []
    for column in closest_stars:
        for pixel in column:
            if(pixel[0]):
                ec = pixel[0].equitorial_coordinates
                scaled_ec = [ec[0] * pixel[0].temperature, ec[1] * pixel[0].temperature, ec[2] * pixel[0].temperature]
                image_blob_1 += [scaled_ec[0], scaled_ec[1], scaled_ec[2], pixel[0].magnitude]
            else:
                image_blob_1 += [0.0, 0.0, 0.0, 1000.0]
            if(pixel[1]):
                ec = pixel[1].equitorial_coordinates
                scaled_ec = [ec[0] * pixel[1].temperature, ec[1] * pixel[1].temperature, ec[2] * pixel[1].temperature]
                image_blob_1 += [scaled_ec[0], scaled_ec[1], scaled_ec[2], pixel[1].magnitude]
            else:
                image_blob_1 += [0.0, 0.0, 0.0, 1000.0]

            if(pixel[2]):
                ec = pixel[2].equitorial_coordinates
                scaled_ec = [ec[0] * pixel[2].temperature, ec[1] * pixel[2].temperature, ec[2] * pixel[2].temperature]
                image_blob_2 += [scaled_ec[0], scaled_ec[1], scaled_ec[2], pixel[2].magnitude]
            else:
                image_blob_2 += [0.0, 0.0, 0.0, 1000.0]
            if(pixel[3]):
                ec = pixel[3].equitorial_coordinates
                scaled_ec = [ec[0] * pixel[3].temperature, ec[1] * pixel[3].temperature, ec[2] * pixel[3].temperature]
                image_blob_2 += [scaled_ec[0], scaled_ec[1], scaled_ec[2], pixel[3].magnitude]
            else:
                image_blob_2 += [0.0, 0.0, 0.0, 1000.0]

    np_image_blob_1 = np.array(image_blob_1)
    f = open("../../assets/star_data/stellar-position-data-1.dat","wb")
    np_image_blob_1.astype('float32').tofile(f)
    f.close()
    with open('../../assets/star_data/stellar-position-data-1.dat', 'rb') as f_in:
       with gzip.open('../../assets/star_data/stellar-position-data-1.dat.gz', 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)

    np_image_blob_2 = np.array(image_blob_2)
    f = open("../../assets/star_data/stellar-position-data-2.dat","wb")
    np_image_blob_2.astype('float32').tofile(f)
    f.close()
    with open('../../assets/star_data/stellar-position-data-2.dat', 'rb') as f_in:
       with gzip.open('../../assets/star_data/stellar-position-data-2.dat.gz', 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)


#And now to run the entire application :D
if __name__ == '__main__':
    initialization()
