import csv, os, json
import numpy as np
import multiprocessing as mp
import time
import progressbar
from math import *
from visible_star import VisibleStar
from nearest_neighbor_map import OrderedGroupOfStars
from cubemap import Cubemap
from bucket_grid import BucketGrid
from PIL import Image

#Plan.
#1 Organize the stars into two three lists, the top 8545 stars, the top 8065 stars and the top 480 stars
#2 Determine the neighbor map for the top 8545 stars
#3 Break out the top 480 stars from this, leaving a neighbor map for 480 and 8065 stars
#4 Break these out into star data textures with 2 star padding for the the 8064 stars on each row
# and 1 stars padding for the 480 stars on each row.
#6 For each point on the cube map, determine the closest star in the 8065 stars, convert this into a 13 bit
# integer id.
#7 Determine the nearest star in the nearby 480 stars and attempt to get there with as few as +/- 2 star locations.
#8 Add this in binary onto our 13 bit number to get 16 bits, the red channel and the blue channel.
#9 Determine the density of remaining stars in galaxy using an 8-bit float and store this in the green channel.
#10 Split our star data into red, green and blue channel textures to be recombined into 32 bits, and simply save
# the six sides of our cubemap RGB texture.
NUMBER_OF_DIM_STARS = 8065
NUMBER_OF_BRIGHT_STARS = 480
NUMBER_OF_STARS = NUMBER_OF_DIM_STARS + NUMBER_OF_BRIGHT_STARS
DIM_TO_BRIGHT_STAR_SCALER = NUMBER_OF_BRIGHT_STARS / NUMBER_OF_DIM_STARS
BRIGHT_STAR_MAP_WIDTH = 32
BRIGHT_STAR_MAP_HEIGHT = 16
DIM_STAR_MAP_WIDTH = 128
DIM_STAR_MAP_HEIGHT = 64
CUBEMAP_FACE_SIZE = 128

#Mulitples of PI
PI = np.pi
ONE_OVER_PI = 1.0 / PI
PI_TIMES_TWO = np.pi * 2.0
ONE_OVER_PI_TIMES_TWO = 1.0 / PI_TIMES_TWO
PI_OVER_TWO = np.pi * 0.5

BUCKETS_IN_GALACTIC_LATITUDE = 64
BUCKETS_IN_GALACTIC_LONGITUDE = 128
star_bucket_grid = BucketGrid(BUCKETS_IN_GALACTIC_LATITUDE, BUCKETS_IN_GALACTIC_LONGITUDE)

def bvToTemp(bv):
    return 4600 * ((1.0 / (0.92 * bv + 1.7)) + (1.0 / (0.92 * bv + 0.62)))

def initialization():
    max_temperature = 0.0 #Absolute zero
    min_temperature = float("inf")

    #Filter our stars
    #Get the CSV star file and fill up our buckets with all of the data
    print('Getting star data...')
    potential_stars = []
    hy_csv_path = os.path.abspath("../../csv_files/hygdata_v3.csv")
    with open(hy_csv_path, 'r') as hyg_file:
        stars = csv.DictReader(hyg_file, delimiter=',')
        sin_of_27_4_degrees = sin(0.4782)
        cos_of_27_4_degrees = cos(0.4782)
        index_in_potential_stars = 0
        for star in stars:
            magnitude = float(star['mag'])
            #Filter this to the visible stars...
            #Exclude the SUN! >_<
            if magnitude < 6.5 and magnitude > -26 and star['ci'].strip():
                temperature = bvToTemp(float(star['ci']))
                if temperature > max_temperature:
                    max_temperature = temperature
                if temperature < min_temperature:
                    min_temperature = temperature
                equitorial_coordinates = [float(star[axis]) for axis in ['x', 'y', 'z']]
                sin_star_dec = sin(float(star['dec']))
                cos_star_dec = cos(float(star['dec']))
                ra_term = 3.355 - float(star['ra'])
                cos_ra_term = cos(ra_term)
                x = atan2(sin(ra_term), (cos_ra_term * sin_of_27_4_degrees - (sin_star_dec / cos_star_dec) * cos_of_27_4_degrees))
                galactic_longitude = (5.28835 - x)
                galactic_latitude = asin(sin_star_dec * sin_of_27_4_degrees + cos_star_dec * cos_of_27_4_degrees * cos_ra_term)
                normalized_galactic_longitude = ((galactic_longitude + PI) % PI_TIMES_TWO) / PI_TIMES_TWO
                normalized_galactic_latitude = (galactic_latitude + PI_OVER_TWO) / PI
                galactic_coordinates = [0.0 for x in range(3)]
                galactic_coordinates[0] = sin(normalized_galactic_latitude) * cos(normalized_galactic_longitude)
                galactic_coordinates[1] = cos(normalized_galactic_latitude)
                galactic_coordinates[2] = sin(normalized_galactic_latitude) * sin(normalized_galactic_longitude)
                visible_star_obj = VisibleStar(galactic_coordinates, temperature, magnitude, galactic_latitude, galactic_longitude, index_in_potential_stars)
                potential_stars.append(visible_star_obj)
                index_in_potential_stars += 1

                #Append the last star to the bucket grid
                bucket_id = star_bucket_grid.appendStar(potential_stars[-1])
                potential_stars[-1].bucket_id = bucket_id

    print("Max Temperature: {}".format(max_temperature))
    print("Min Temperature: {}".format(min_temperature))

    #Filter our stars so that stars that are really really close together (binary/trianary stars) get removed from the list
    # print("Reducing binary systems...")
    # i = 0
    # with progressbar.ProgressBar(len(potential_stars), redirect_stdout=True) as bar:
    #     while i < len(potential_stars):
    #         #Get all potential stars near this star
    #         star_1 = potential_stars[i]
    #         stars_in_system = [star_1]
    #         nearby_stars = star_bucket_grid.getNearbyStars(star_1.galactic_latitude, star_1.galactic_longitude)
    #         j = 0
    #         while j < len(nearby_stars):
    #             star_2 = nearby_stars[j]
    #             diff = star_1.galactic_coordinates - star_2.galactic_coordinates
    #             distance = sqrt(np.dot(diff, diff))
    #
    #             #Without testin for i !== j, we naturally include the original star in here
    #             if(distance < 0.0001):
    #                 stars_in_system.append(star_2)
    #             j += 1
    #
    #         number_stars_in_system = len(stars_in_system)
    #         original_index_survives = True
    #         if number_stars_in_system > 1:
    #             print("Star system with {} stars found".format(number_stars_in_system))
    #
    #             brightest_star = stars_in_system[0]
    #             for star in stars_in_system:
    #                 if star.magnitude < brightest_star.magnitude:
    #                     brightest_star = star
    #
    #             #Just include the brightest star and leave out the other stars
    #             #Using Meeus equation from page 393 to get the combined magnitude of all stars
    #             combined_magnitude = 10.0**(-0.4 * brightest_star.magnitude)
    #             original_index_survives = False
    #             for j in range(1, number_stars_in_system):
    #                 test_star = stars_in_system[j]
    #                 combined_magnitude += 10.0**(-0.4 * test_star.magnitude)
    #                 if(test_star.magnitude < brightest_star.magnitude):
    #                     original_index_survives = True
    #                     brightest_star = test_star
    #             combined_magnitude = -2.5 * log10(combined_magnitude)
    #
    #             #Reset the magnitude of the star based on the combined magnitudes of all stars in the system
    #             #We maintain the original stars temperature as combining the spectra is probably not tractable.
    #             brightest_star.magnitude = combined_magnitude
    #             stars_in_system.remove(brightest_star)
    #             for star in stars_in_system:
    #                 if star in potential_stars:
    #                     potential_stars.remove(star)
    #                     star_bucket_grid.star_buckets[star.bucket_id].remove(star)
    #                     star.bucket_id = None
    #
    #         if original_index_survives:
    #             i += 1
    #             bar.update(i)

    print("Remaining stars {}".format(len(potential_stars)))

    #Sort our stars according to brightness
    potential_stars.sort(key=lambda x: x.magnitude, reverse=True)

    print("Creating sub lists of stars")
    full_stars_list = potential_stars[:NUMBER_OF_STARS]
    bright_star_bucket_grid = BucketGrid(BUCKETS_IN_GALACTIC_LATITUDE, BUCKETS_IN_GALACTIC_LONGITUDE)
    bright_stars_list = full_stars_list[:NUMBER_OF_BRIGHT_STARS]
    for i, star in enumerate(bright_stars_list):
        bucket_id = bright_star_bucket_grid.appendStar(star)
        bright_stars_list[i].bright_star_bucket_id = bucket_id
    dim_star_bucket_grid = BucketGrid(BUCKETS_IN_GALACTIC_LATITUDE, BUCKETS_IN_GALACTIC_LONGITUDE)
    dim_stars_list = full_stars_list[NUMBER_OF_BRIGHT_STARS:NUMBER_OF_STARS]
    for i, star in enumerate(dim_stars_list):
        bucket_id = dim_star_bucket_grid.appendStar(star)
        dim_stars_list[i].dim_star_bucket_id = bucket_id

    #Combine all of our star groups until only one star group remains
    print("Combine all of our star groups until only one group remains...")
    ordered_groups_of_stars = [OrderedGroupOfStars([star]) for star in full_stars_list]
    # previous_i = 0
    # number_of_ordered_groups_of_stars = len(ordered_groups_of_stars)
    # initial_number_of_ordered_groups_of_stars = number_of_ordered_groups_of_stars
    # with progressbar.ProgressBar(100.0, redirect_stdout=True) as bar:
    #     while(number_of_ordered_groups_of_stars > 1):
    #         ordered_groups_of_stars[previous_i].findAndCombineWithClosestOtherStarGroup(ordered_groups_of_stars, previous_i)
    #         number_of_ordered_groups_of_stars = len(ordered_groups_of_stars)
    #         bar.update((1.0 - number_of_ordered_groups_of_stars / initial_number_of_ordered_groups_of_stars) * 100)
    #         next_i = (previous_i + 1) % number_of_ordered_groups_of_stars
    #         if previous_i > next_i:
    #             #Resort our groups by the brightest edge star every time we scan through our list
    #             ordered_groups_of_stars.sort(key=lambda x: x.ordererdGroupOfStars[x.brightest_star_on_edge].magnitude, reverse=True)
    #         previous_i = next_i

    #Once we've ordered our stars, we just want the list
    #ordered_groups_of_stars = ordered_groups_of_stars[0].ordererdGroupOfStars

    #Temporary, delete when we are using the above to organize our stars
    ordered_groups_of_stars = full_stars_list[:]

    #Provide each star with it's position in the ordered group of stars
    for i, star in enumerate(ordered_groups_of_stars):
        ordered_groups_of_stars[i].position_in_orderered_array = i

    #Sort our list of bright and dim stars according to their positions in the above list
    bright_stars_list.sort(key=lambda x: x.position_in_orderered_array, reverse=True)
    dim_stars_list.sort(key=lambda x: x.position_in_orderered_array, reverse=True)

    for i, star in enumerate(bright_stars_list):
        bright_stars_list[i].position_in_bright_star_ordered_array = i
    for i, star in enumerate(dim_stars_list):
        dim_stars_list[i].position_in_dim_star_ordererd_array = i

    #Convert these stars into two data textures, split between their R, G, B and A channels
    print("Converting linear data into data image")
    dim_star_channel_red_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    dim_star_channel_green_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    dim_star_channel_blue_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    dim_star_channel_alpha_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    cursor = -1
    for row in range(DIM_STAR_MAP_HEIGHT):
        for column in range(DIM_STAR_MAP_WIDTH):
            star = dim_stars_list[cursor]
            for i in range(4):
                dim_star_channel_red_data_image[row][column][i] = star.encoded_equitorial_r[i]
                dim_star_channel_green_data_image[row][column][i] = star.encoded_equitorial_g[i]
                dim_star_channel_blue_data_image[row][column][i] = star.encoded_equitorial_b[i]
                dim_star_channel_alpha_data_image[row][column][i] = star.encoded_equitorial_a[i]
            cursor += 1
        cursor -= 2

    datum = [dim_star_channel_red_data_image, dim_star_channel_green_data_image, dim_star_channel_blue_data_image, dim_star_channel_alpha_data_image]
    channels = ['r', 'g', 'b', 'a']
    for i, data in enumerate(datum):
        channel = channels[i]
        imarray = np.asarray(data)
        imarray = np.flip(imarray, 0)
        im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
        #python->src->a-sky-forge
        im.save('../../../assets/star_data/dim-star-data-{}-channel.png'.format(channel))

    bright_star_channel_red_data_image = [[[0.0 for c in range(4)] for i in range(BRIGHT_STAR_MAP_WIDTH)] for j in range(BRIGHT_STAR_MAP_HEIGHT)]
    bright_star_channel_green_data_image = [[[0.0 for c in range(4)] for i in range(BRIGHT_STAR_MAP_WIDTH)] for j in range(BRIGHT_STAR_MAP_HEIGHT)]
    bright_star_channel_blue_data_image = [[[0.0 for c in range(4)] for i in range(BRIGHT_STAR_MAP_WIDTH)] for j in range(BRIGHT_STAR_MAP_HEIGHT)]
    bright_star_channel_alpha_data_image = [[[0.0 for c in range(4)] for i in range(BRIGHT_STAR_MAP_WIDTH)] for j in range(BRIGHT_STAR_MAP_HEIGHT)]
    cursor = -2
    for row in range(BRIGHT_STAR_MAP_HEIGHT):
        for column in range(BRIGHT_STAR_MAP_WIDTH):
            star = bright_stars_list[cursor]
            for i in range(4):
                bright_star_channel_red_data_image[row][column][i] = star.encoded_equitorial_r[i]
                bright_star_channel_green_data_image[row][column][i] = star.encoded_equitorial_g[i]
                bright_star_channel_blue_data_image[row][column][i] = star.encoded_equitorial_b[i]
                bright_star_channel_alpha_data_image[row][column][i] = star.encoded_equitorial_a[i]
            cursor += 1
        cursor -= 2

    datum = [bright_star_channel_red_data_image, bright_star_channel_green_data_image, bright_star_channel_blue_data_image, bright_star_channel_alpha_data_image]
    for i, data in enumerate(datum):
        channel = channels[i]
        imarray = np.asarray(data)
        imarray = np.flip(imarray, 0)
        im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
        im.save('../../../assets/star_data/bright-star-data-{}-channel.png'.format(channel))

    #Create our cubemap
    print("Creating our cubemap...")
    cubemap = Cubemap(CUBEMAP_FACE_SIZE)

    sides = ['px', 'py', 'pz', 'nx', 'ny', 'nz']
    j = 0
    with progressbar.ProgressBar(6 * CUBEMAP_FACE_SIZE * CUBEMAP_FACE_SIZE, redirect_stdout=True) as bar:
        for i, side in enumerate(cubemap.sides):
            side = sides[i]
            for y in range(CUBEMAP_FACE_SIZE):
                for x in range(CUBEMAP_FACE_SIZE):
                    #Convert the x, y value of this cubemap face to an x, y, z, position
                    galactic_coordinates_of_pixel = cubemap.getPixelGalacticCoordinates(i, x, y)

                    #Convert this x, y and z value into latitude and longitude
                    galactic_latitude = acos(galactic_coordinates_of_pixel[1])
                    galactic_longitude = atan2(galactic_coordinates_of_pixel[2] , galactic_coordinates_of_pixel[0])

                    #Get all nearby dim stars using the bucket grid
                    nearby_dim_stars = dim_star_bucket_grid.getNearbyStars(galactic_latitude, galactic_longitude)

                    #For each point in the cubemap, determine the closest dim stellar ID, using a 13 bit integer
                    closest_dim_star_index = 0 #Default to zero, because we need a valid value
                    closest_dim_star_distance = float('inf')
                    for j in range(len(nearby_dim_stars)):
                        #We're using normal ditance over haversine distance as we presume
                        #that, for small star distances, the surface of the sphere is approximately flat
                        diff = nearby_dim_stars[j].galactic_coordinates - galactic_coordinates_of_pixel
                        distance_to_star_squared = np.dot(diff, diff)
                        if(distance_to_star_squared < closest_dim_star_distance):
                            closest_dim_star_distance = distance_to_star_squared
                            closest_dim_star_index = nearby_dim_stars[j].position_in_dim_star_ordererd_array

                    #Get all nearby bright stars using the bucket grid
                    nearby_bright_stars = bright_star_bucket_grid.getNearbyStars(galactic_latitude, galactic_longitude)

                    #Now determine the closest bright star stellar ID in the 448 star data texture
                    closest_bright_star_index = 0
                    closest_bright_star_distance = float('inf')
                    for j in range(len(nearby_bright_stars)):
                        #We're using normal ditance over haversine distance as we presume
                        #that, for small star distances, the surface of the sphere is approximately flat
                        diff = nearby_bright_stars[j].galactic_coordinates - galactic_coordinates_of_pixel
                        distance_to_star_squared = np.dot(diff, diff)
                        if(distance_to_star_squared < closest_bright_star_distance):
                            closest_bright_star_distance = distance_to_star_squared
                            closest_bright_star_index = nearby_bright_stars[j].position_in_bright_star_ordered_array

                    #Attempt to reach this point with a 3-bit integer, between +/-4 in the scale of the 448 star data texture
                    dim_star_index_in_bright_star_scale = int(closest_dim_star_index * DIM_TO_BRIGHT_STAR_SCALER) - int(closest_bright_star_index)
                    # if(dim_star_index_in_bright_star_scale < -4 or dim_star_index_in_bright_star_scale > 4):
                    #     print("Offset out of range, bright star true offset was: {}".format(dim_star_index_in_bright_star_scale))
                    dim_star_index_in_bright_star_scale += 4
                    bright_star_offset = max(min(dim_star_index_in_bright_star_scale, 0), 7)

                    #Combine and split these binary numbers into two 8-bit channels and put them in a texture
                    sixteen_bit_index = ((closest_dim_star_index & 0x1fff) << 3) | (bright_star_offset & 0x7)
                    index_a = int(bin(sixteen_bit_index & 0xff), 2) + 1
                    index_b = int(bin(sixteen_bit_index >> 8 & 0xff), 2)

                    #Add a check in here to see that we can split this back into a 13 bit index and a 3 bit offset
                    sixteen_bit_integer = (index_a - 1) + index_b * 256
                    thirteen_bit_position = floor(sixteen_bit_integer / 8)
                    three_bit_offset = sixteen_bit_integer - (thirteen_bit_position * 8)
                    estimated_location_of_dim_star = thirteen_bit_position
                    estimated_location_of_bright_star = floor(estimated_location_of_dim_star * DIM_TO_BRIGHT_STAR_SCALER)  + (three_bit_offset - 4)
                    if(estimated_location_of_dim_star != closest_dim_star_index):
                        print("Wrong dim star index. Was looking for {}, got {}.".format(closest_dim_star_index, estimated_location_of_dim_star))
                        print("sixteen_bit_integer: {}".format(sixteen_bit_integer))
                        print("thirteen_bit_position: {}".format(thirteen_bit_position))
                        print("three_bit_offset: {}".format(three_bit_offset))
                        print("-"*8)
                        raise Exception("Bit recombination error")

                    if(three_bit_offset != bright_star_offset):
                        print("Invalid bright star offset. Was looking for {}, got {}".format(bright_star_offset, three_bit_offset))

                    # if(estimated_location_of_bright_star != closest_bright_star_index):
                    #     print("Wrong bright star index. Was looking for {}, got {}".format(closest_bright_star_index, estimated_location_of_bright_star))
                    #     print("Offset: {}".format((three_bit_offset - 4)))
                    #     print("-"*8)

                    cubemap.sides[i][3] = index_a
                    cubemap.sides[i][2] = index_b

                    j += 1
                    bar.update(j)

            #Write this into a cube map texture
            imarray = np.asarray(cubemap.sides[i])
            imarray = np.flip(imarray, 0)
            im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
            im.save('../../../assets/star_data/star-dictionary-cubemap-{}.png'.format(side))

#And now to run the entire application :D
if __name__ == '__main__':
    initialization()
