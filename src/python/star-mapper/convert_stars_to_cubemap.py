import csv, os, json
import numpy as np
import time
import progressbar
from math import *
from visible_star import VisibleStar
from nearest_neighbor_map import OrderedGroupOfStars
from cubemap import Cubemap
from bucket_grid import BucketGrid
from PIL import Image
import pandas as pd
from matplotlib import pyplot as plt
from mpl_toolkits import mplot3d
from mpl_toolkits.mplot3d.axes3d import Axes3D

#Plan.
#TODO: These are outdated and were mainly used for debugging, don't mind if they don't work anymore
#They can probably be rapidly upgraded if the need comes up.
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
NUMBER_OF_DIM_STARS = 8192 #4096 stars
NUMBER_OF_BRIGHT_STARS = 1024
NUMBER_OF_STARS = NUMBER_OF_DIM_STARS + NUMBER_OF_BRIGHT_STARS
DIM_TO_BRIGHT_STAR_SCALAR = NUMBER_OF_BRIGHT_STARS / NUMBER_OF_DIM_STARS
BRIGHT_STAR_MAP_WIDTH = 32
BRIGHT_STAR_MAP_HEIGHT = 32
DIM_STAR_MAP_WIDTH = 128
DIM_STAR_MAP_HEIGHT = 64
CUBEMAP_FACE_SIZE = 512

#Mulitples of PI
PI = np.pi
ONE_OVER_PI = 1.0 / PI
PI_TIMES_TWO = np.pi * 2.0
ONE_OVER_PI_TIMES_TWO = 1.0 / PI_TIMES_TWO
PI_OVER_TWO = np.pi * 0.5
DEG_TO_RAD = PI / 180.0
HOURS_TO_RADS = PI_TIMES_TWO / 24.0

star_bucket_grid = BucketGrid()

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
        north_galactic_pole_ra = ((12 * 3600 + 51.0*60 + 26.0) / (86400.0)) * PI_TIMES_TWO
        north_galactic_pole_dec = 27.13 * PI / 180.0
        sin_of_NGP = sin(north_galactic_pole_dec)
        cos_of_NGP = cos(north_galactic_pole_dec)
        index_in_potential_stars = 0
        for star in stars:
            magnitude = float(star['mag'])
            #Filter this to the visible stars...
            #Exclude the SUN! >_<
            if magnitude < 7.0 and magnitude > -26 and star['ci'].strip():
                temperature = bvToTemp(float(star['ci']))
                if temperature > max_temperature:
                    max_temperature = temperature
                if temperature < min_temperature:
                    min_temperature = temperature
                equitorial_coordinates = [float(star[axis]) for axis in ['x', 'y', 'z']]
                star_right_ascension = float(star['ra']) * HOURS_TO_RADS
                star_declincation = float(star['dec']) * DEG_TO_RAD
                sin_star_dec = sin(float(star_declincation))
                cos_star_dec = cos(float(star_declincation))
                cos_of_star_ra_minus_galactic_ngp_ra = cos(float(star_right_ascension) - north_galactic_pole_ra)
                galactic_latitude = asin(sin_of_NGP * sin_star_dec + cos_of_NGP * cos_star_dec * cos_of_star_ra_minus_galactic_ngp_ra)#Y-Axis
                galatic_longitude_numerator = cos_star_dec * sin(float(star_right_ascension) - north_galactic_pole_ra)
                galactic_longitude_denominator = cos_of_NGP * sin_star_dec - sin_of_NGP * cos_star_dec * cos_of_star_ra_minus_galactic_ngp_ra
                galactic_longitude = atan2(galatic_longitude_numerator, galactic_longitude_denominator)#X-Axis
                galactic_coordinates = [0.0 for x in range(3)]
                galactic_coordinates[0] = sin(PI - galactic_latitude + PI_OVER_TWO) * cos(galactic_longitude + PI)
                galactic_coordinates[1] = cos(PI - galactic_latitude + PI_OVER_TWO)
                galactic_coordinates[2] = sin(PI - galactic_latitude + PI_OVER_TWO) * sin(galactic_longitude + PI)
                visible_star_obj = VisibleStar(galactic_coordinates, temperature, magnitude, galactic_latitude, galactic_longitude, index_in_potential_stars)
                potential_stars.append(visible_star_obj)
                index_in_potential_stars += 1

                #Append the last star to the bucket grid
                bucket_id = star_bucket_grid.appendStar(potential_stars[-1])
                potential_stars[-1].bucket_id = bucket_id

    print("Max Temperature: {}".format(max_temperature))
    print("Min Temperature: {}".format(min_temperature))

    #Plot all of our stars to see that it all worked out
    x_coords = [star.galactic_longitude for star in potential_stars]
    y_coords = [star.galactic_latitude for star in potential_stars]
    star_dot_sizes = [0.01 for star in potential_stars]
    #TODO: These are outdated and were mainly used for debugging, don't mind if they don't work anymore
    #They can probably be rapidly upgraded if the need comes up.
    # plt.scatter(x_coords, y_coords, s=star_dot_sizes, marker='o', alpha=1.0)
    # plt.title("Stars in 2-d planar galactic coordinates")
    # plt.show()
    #
    # fig = plt.figure()
    # ax = plt.axes(projection='3d')

    x_coords = [star.galactic_coordinates[0] for star in potential_stars]
    z_coords = [star.galactic_coordinates[1] for star in potential_stars]
    y_coords = [star.galactic_coordinates[2] for star in potential_stars]
    star_dot_sizes = [0.1 for star in potential_stars]
    #TODO: These are outdated and were mainly used for debugging, don't mind if they don't work anymore
    #They can probably be rapidly upgraded if the need comes up.
    # ax.scatter(x_coords, y_coords, z_coords, s=star_dot_sizes, marker='o', alpha=1.0, c=None, depthshade=True)
    # plt.title("3D Graph of stars")
    # plt.show()

    #Filter our stars so that stars that are really really close together (binary/trianary stars) get removed from the list
    print("Reducing binary systems...")
    total_stars_removed = 0
    i = 0
    with progressbar.ProgressBar(len(potential_stars), redirect_stdout=True) as bar:
        while i < len(potential_stars):
            #Get all potential stars near this star
            star_1 = potential_stars[i]
            stars_in_system = [star_1]
            nearby_stars = star_bucket_grid.getNearbyStars(star_1.galactic_latitude, star_1.galactic_longitude)
            j = 0
            while j < len(nearby_stars):
                star_2 = nearby_stars[j]
                if(star_2 is not star_1):
                    diff = star_1.galactic_coordinates - star_2.galactic_coordinates
                    distance = sqrt(np.dot(diff, diff))

                    #Without testin for i !== j, we naturally include the original star in here
                    if(distance < 0.0001):
                        stars_in_system.append(star_2)
                j += 1

            number_stars_in_system = len(stars_in_system)
            original_index_survives = True
            if number_stars_in_system > 1:
                print("Star system with {} stars found".format(number_stars_in_system))

                #Just include the brightest star and leave out the other stars
                #Using Meeus equation from page 393 to get the combined magnitude of all stars
                #Also only leave the brightest star remaining to use it's spectrum
                brightest_star = stars_in_system[0]
                combined_magnitude = 0.0
                for star in stars_in_system:
                    combined_magnitude += 10.0**(-0.4 * star.magnitude)
                    if star.magnitude < brightest_star.magnitude:
                        brightest_star = star
                        if brightest_star is star_1:
                            original_index_survives = True
                        else:
                            original_index_survives = False
                combined_magnitude = -2.5 * log10(combined_magnitude)
                brightest_star.magnitude = combined_magnitude

                #Remove the other stars
                for star in stars_in_system:
                    if (star is not brightest_star) and (star in potential_stars):
                        potential_stars.remove(star)
                        star_bucket_grid.star_buckets[star.bucket_id].remove(star)
                        star.bucket_id = None
                        total_stars_removed += 1

            if original_index_survives:
                i += 1
                bar.update(i)

    print("Remaining stars {}".format(len(potential_stars)))
    print("Total stars removed, {}".format(total_stars_removed))

    #Plot our remaining stars to show that everything is still ok
    x_coords = [star.galactic_longitude for star in potential_stars]
    y_coords = [star.galactic_latitude for star in potential_stars]
    star_dot_sizes = [0.01 for star in potential_stars]
    #TODO: These are outdated and were mainly used for debugging, don't mind if they don't work anymore
    #They can probably be rapidly upgraded if the need comes up.
    # plt.scatter(x_coords, y_coords, s=star_dot_sizes, marker='o', alpha=1.0)
    # plt.title("Stars in 2-d planar galactic coordinates")
    # plt.show()

    #Sort our stars according to brightness
    potential_stars.sort(key=lambda x: x.magnitude)

    print("Creating sub lists of stars")
    full_stars_list = potential_stars[:NUMBER_OF_STARS]
    bright_stars_list = full_stars_list[:NUMBER_OF_BRIGHT_STARS]
    dim_stars_list = full_stars_list[NUMBER_OF_BRIGHT_STARS:(NUMBER_OF_BRIGHT_STARS + NUMBER_OF_DIM_STARS)]

    print("Number of dim stars: {}".format(len(dim_stars_list)))
    print("Number of bright stars: {}".format(len(bright_stars_list)))

    #Combine all of our star groups until only one star group remains
    print("Combine all of our star groups until only one group remains...")
    dim_ordered_groups_of_stars = [OrderedGroupOfStars([star]) for star in dim_stars_list]
    previous_i = 0
    number_of_dim_ordered_groups_of_stars = len(dim_ordered_groups_of_stars)
    initial_number_of_dim_ordered_groups_of_stars = number_of_dim_ordered_groups_of_stars
    with progressbar.ProgressBar(100.0, redirect_stdout=True) as bar:
        while(number_of_dim_ordered_groups_of_stars > 1):
            dim_ordered_groups_of_stars[previous_i].findAndCombineWithClosestOtherStarGroup(dim_ordered_groups_of_stars, previous_i)
            number_of_dim_ordered_groups_of_stars = len(dim_ordered_groups_of_stars)
            bar.update((1.0 - number_of_dim_ordered_groups_of_stars / initial_number_of_dim_ordered_groups_of_stars) * 100)
            next_i = (previous_i + 1) % number_of_dim_ordered_groups_of_stars
            if previous_i > next_i:
                #Resort our groups by the brightest edge star every time we scan through our list
                dim_ordered_groups_of_stars.sort(key=lambda x: x.ordererdGroupOfStars[x.brightest_star_on_edge].magnitude, reverse=True)
            previous_i = next_i
    dim_ordered_groups_of_stars = dim_ordered_groups_of_stars[0].ordererdGroupOfStars

    #Provide each star with it's position in the ordered group of stars
    for i, star in enumerate(dim_ordered_groups_of_stars):
        star.position_in_dim_star_ordererd_array = i

    bright_ordered_groups_of_stars = [OrderedGroupOfStars([star]) for star in bright_stars_list]
    previous_i = 0
    number_of_bright_ordered_groups_of_stars = len(bright_ordered_groups_of_stars)
    initial_number_of_bright_ordered_groups_of_stars = number_of_bright_ordered_groups_of_stars
    with progressbar.ProgressBar(100.0, redirect_stdout=True) as bar:
        while(number_of_bright_ordered_groups_of_stars > 1):
            bright_ordered_groups_of_stars[previous_i].findAndCombineWithClosestOtherStarGroup(bright_ordered_groups_of_stars, previous_i)
            number_of_bright_ordered_groups_of_stars = len(bright_ordered_groups_of_stars)
            bar.update((1.0 - number_of_bright_ordered_groups_of_stars / initial_number_of_bright_ordered_groups_of_stars) * 100)
            next_i = (previous_i + 1) % number_of_bright_ordered_groups_of_stars
            if previous_i > next_i:
                #Resort our groups by the brightest edge star every time we scan through our list
                bright_ordered_groups_of_stars.sort(key=lambda x: x.ordererdGroupOfStars[x.brightest_star_on_edge].magnitude, reverse=True)
            previous_i = next_i
    bright_ordered_groups_of_stars = bright_ordered_groups_of_stars[0].ordererdGroupOfStars

    #Provide each star with it's position in the ordered group of stars
    for i, star in enumerate(bright_ordered_groups_of_stars):
        star.position_in_bright_star_ordered_array = i

    #TODO: These are outdated and were mainly used for debugging, don't mind if they don't work anymore
    #They can probably be rapidly upgraded if the need comes up.
    #Plot our star connections to see how well we are connected to our nearest neighbors
    # fig = plt.figure()
    # ax = fig.add_subplot(111, projection='3d')
    # x_coords = [star.galactic_coordinates[0] for star in ordered_groups_of_stars]
    # z_coords = [star.galactic_coordinates[1] for star in ordered_groups_of_stars]
    # y_coords = [star.galactic_coordinates[2] for star in ordered_groups_of_stars]
    # star_dot_sizes = [0.4 for star in ordered_groups_of_stars]
    # ax.scatter(x_coords, y_coords, z_coords, s=star_dot_sizes, marker='o', alpha=1.0, depthshade=True)
    # ax.plot(x_coords, y_coords, z_coords, color="red")
    # plt.show()

    #Sort our list of bright and dim stars according to their positions in the above list
    dim_stars_list.sort(key=lambda x: x.position_in_dim_star_ordererd_array, reverse=True)
    bright_stars_list.sort(key=lambda x: x.position_in_bright_star_ordered_array, reverse=True)

    print("Number of bright stars after combination {}".format(len(bright_stars_list)))
    if len(bright_stars_list) != len(set(bright_stars_list)):
        print("There are {} duplicates in the bright ordered group of stars".format(abs(len(bright_stars_list) - len(set(bright_stars_list)))))

    #TODO: These are outdated and were mainly used for debugging, don't mind if they don't work anymore
    #They can probably be rapidly upgraded if the need comes up.
    #Plot all bright stars too see how they are connected
    # fig = plt.figure()
    # ax = fig.add_subplot(111, projection='3d')
    # x_coords = [star.galactic_coordinates[0] for star in bright_stars_list]
    # z_coords = [star.galactic_coordinates[1] for star in bright_stars_list]
    # y_coords = [star.galactic_coordinates[2] for star in bright_stars_list]
    # star_dot_sizes = [0.4 for star in bright_stars_list]
    # ax.plot(x_coords, y_coords, z_coords, color="red")
    # ax.scatter(x_coords, y_coords, z_coords, s=star_dot_sizes, marker='o', alpha=1.0, depthshade=True)
    # plt.show()

    print("Number of dim stars after combination {}".format(len(dim_stars_list)))
    if len(dim_stars_list) != len(set(dim_stars_list)):
        print("There are {} duplicates in the dim ordered group of stars".format(abs(len(dim_stars_list) - len(set(dim_stars_list)))))

    #TODO: These are outdated and were mainly used for debugging, don't mind if they don't work anymore
    #They can probably be rapidly upgraded if the need comes up.
    #Plot all dim stars to see how they are connected
    # fig = plt.figure()
    # ax = fig.add_subplot(111, projection='3d')
    # x_coords = [star.galactic_coordinates[0] for star in dim_stars_list]
    # z_coords = [star.galactic_coordinates[1] for star in dim_stars_list]
    # y_coords = [star.galactic_coordinates[2] for star in dim_stars_list]
    # star_dot_sizes = [0.4 for star in dim_stars_list]
    # ax.plot(x_coords, y_coords, z_coords, color="red")
    # ax.scatter(x_coords, y_coords, z_coords, s=star_dot_sizes, marker='o', alpha=1.0, depthshade=True)
    # plt.show()

    #Convert these stars into two data textures, split between their R, G, B and A channels
    print("Converting linear data into data image")
    dim_star_channel_red_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    dim_star_channel_green_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    dim_star_channel_blue_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    dim_star_channel_alpha_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    cursor = 0;
    for row in range(DIM_STAR_MAP_HEIGHT):
        for column in range(DIM_STAR_MAP_WIDTH):
            star = dim_stars_list[cursor]
            for i in range(4):
                dim_star_channel_red_data_image[row][column][i] = star.encoded_equitorial_r[i] #Galactic coordinate 1
                dim_star_channel_green_data_image[row][column][i] = star.encoded_equitorial_g[i] #Galactic coordinate 2
                dim_star_channel_blue_data_image[row][column][i] = star.encoded_equitorial_b[i] #Galactic coordinate 3
                dim_star_channel_alpha_data_image[row][column][i] = star.encoded_equitorial_a[i] #Magnitude
                dim_stars_list[cursor].dim_star_array_x = column
                dim_stars_list[cursor].dim_star_array_y = row
            cursor += 1

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
    cursor = 0;
    for row in range(BRIGHT_STAR_MAP_HEIGHT):
        for column in range(BRIGHT_STAR_MAP_WIDTH):
            star = bright_stars_list[cursor]
            for i in range(4):
                bright_star_channel_red_data_image[row][column][i] = star.encoded_equitorial_r[i]
                bright_star_channel_green_data_image[row][column][i] = star.encoded_equitorial_g[i]
                bright_star_channel_blue_data_image[row][column][i] = star.encoded_equitorial_b[i]
                bright_star_channel_alpha_data_image[row][column][i] = star.encoded_equitorial_a[i]
                bright_stars_list[cursor].bright_star_array_x = column
                bright_stars_list[cursor].bright_star_array_y = row
            cursor += 1

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

    print('Dim Star 0 data')
    first_dim_star = dim_stars_list[0]
    print("{},{},{},{}".format(first_dim_star.encoded_equitorial_r[0], first_dim_star.encoded_equitorial_r[1], first_dim_star.encoded_equitorial_r[2], first_dim_star.encoded_equitorial_r[3] * 100.0/255.0))
    print("{},{},{},{}".format(first_dim_star.encoded_equitorial_g[0], first_dim_star.encoded_equitorial_g[1], first_dim_star.encoded_equitorial_g[2], first_dim_star.encoded_equitorial_g[3] * 100.0/255.0))
    print("{},{},{},{}".format(first_dim_star.encoded_equitorial_b[0], first_dim_star.encoded_equitorial_b[1], first_dim_star.encoded_equitorial_b[2], first_dim_star.encoded_equitorial_b[3] * 100.0/255.0))
    print("{},{},{},{}".format(first_dim_star.encoded_equitorial_a[0], first_dim_star.encoded_equitorial_a[1], first_dim_star.encoded_equitorial_a[2], first_dim_star.encoded_equitorial_a[3] * 100.0/255.0))
    print("-----------------------")

    sides = ['px', 'nx', 'py', 'ny', 'pz', 'nz']
    k = 0
    number_of_distant_bright_stars = 0
    number_of_missed_stars_in_bucket = 0
    number_of_distant_bright_stars = 0
    with open("debug_file.txt", "w") as f:
        with progressbar.ProgressBar(6 * CUBEMAP_FACE_SIZE * CUBEMAP_FACE_SIZE, redirect_stdout=True) as bar:
            for i, side in enumerate(cubemap.sides):
                side_letter_combo = sides[i]
                for y in range(CUBEMAP_FACE_SIZE):
                    for x in range(CUBEMAP_FACE_SIZE):
                        #Convert the x, y value of this cubemap face to an x, y, z, position
                        #Latitude is off, either for our closest star or from the coordinates of the pixel
                        galactic_coordinates_of_pixel = cubemap.getPixelGalacticCoordinates(side_letter_combo, x, y)
                        #f.write("pixel galactic coordinates: {}, {}, {}\r\n".format(galactic_coordinates_of_pixel[0], galactic_coordinates_of_pixel[1], galactic_coordinates_of_pixel[2]))

                        #For each point in the cubemap, determine the closest dim stellar ID, using a 13 bit integer
                        closest_dim_star_distance = float('inf')
                        closest_dim_star_x = 0
                        closest_dim_star_y = 0
                        for star in dim_stars_list:
                            #We're using normal ditance over haversine distance as we presume
                            #that, for small star distances, the surface of the sphere is approximately flat
                            diff = star.galactic_coordinates - galactic_coordinates_of_pixel
                            v0 = star.galactic_coordinates
                            v1 = galactic_coordinates_of_pixel
                            delta_v = v0 - v1
                            mag_v = sqrt(np.dot(delta_v, delta_v))
                            phi = abs(asin(mag_v / 2))
                            phi = min(phi, 2.0 * np.pi - phi)
                            distance_to_star = 2.0 * phi
                            if(distance_to_star < closest_dim_star_distance):
                                closest_dim_star_distance = distance_to_star
                                closest_dim_star_x = star.dim_star_array_x
                                closest_dim_star_y = star.dim_star_array_y

                        #Now determine the location of the closest bright star
                        closest_bright_star_distance = float('inf')
                        previous_closest_bright_star_x = 0
                        previous_closest_bright_star_y = 0
                        closest_bright_star_x = 0
                        closest_bright_star_y = 0
                        for star in bright_stars_list:
                            #We're using normal ditance over haversine distance as we presume
                            #that, for small star distances, the surface of the sphere is approximately flat
                            v0 = star.galactic_coordinates
                            v1 = galactic_coordinates_of_pixel
                            delta_v = v0 - v1
                            mag_v = sqrt(np.dot(delta_v, delta_v))
                            phi = abs(asin(mag_v / 2))
                            phi = min(phi, 2.0 * np.pi - phi)
                            distance_to_star = 2.0 * phi
                            if(distance_to_star < closest_bright_star_distance):
                                closest_bright_star_distance = distance_to_star
                                previous_closest_bright_star_x = closest_bright_star_x
                                previous_closest_bright_star_y = closest_bright_star_y
                                closest_bright_star_x = star.bright_star_array_x
                                closest_bright_star_y = star.bright_star_array_y

                        #Combine and split these binary numbers into two 8-bit channels and put them in a texture
                        #The dim star position is the 7 bits for the x-axis (0-127) and 6 bits for the y-axis (0-63)
                        #the bright star position is 6 bits for the x-axis (0-63) and 5 bits for the y-axis (0-31).
                        #This makes a total of 7+6+6+5=24 bits, or exactly the number of bits in the RGB channels.
                        #Example
                        #----------------------------------------------------
                        #int(bin(((21 << 3) & 0b11111000) | (3 & 0b111)), 2) ####171
                        # bin(171) #### '0b10101011'
                        # bin(21) #### '0b10101'
                        # bin(3) #### '0b11'
                        #Get right bits
                        # math.floor(171/(2**3)) #### 21
                        #Get left bits
                        # 21*(2**3) #### 168
                        # 171-168 #### 3
                        index_r = int(bin(((closest_dim_star_x << 1) & 0b11111110) | (closest_dim_star_y & 0b1)), 2)
                        index_g = int(bin((((closest_dim_star_y >> 1) << 3) & 0b11111000) | (closest_bright_star_x & 0b111)), 2)
                        index_b = int(bin((((closest_bright_star_x >> 3) << 6) & 0b11000000) | ((closest_bright_star_y << 2) & 0b1111100)), 2)
                        index_a = 255

                        cubemap.sides[i][y][x][0] = index_r
                        cubemap.sides[i][y][x][1] = index_g
                        cubemap.sides[i][y][x][2] = index_b
                        cubemap.sides[i][y][x][3] = index_a

                        k += 1
                        bar.update(k)

                #Write this into a cube map texture
                imarray = np.asarray(cubemap.sides[i])
                imarray = np.flip(imarray, 0)
                im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
                im.save('../../../assets/star_data/star-dictionary-cubemap-{}.png'.format(side_letter_combo))

#And now to run the entire application :D
if __name__ == '__main__':
    initialization()
