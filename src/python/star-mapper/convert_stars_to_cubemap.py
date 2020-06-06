import csv, os, json, math
import numpy as np
import multiprocessing as mp
import time
import progressbar
from PIL import Image
import nearest_neighbor_map
import cubemap

#Plan.
#1 Organize the stars into two three lists, the top 8512 stars, the top 8064 stars and the top 448 stars
#2 Determine the neighbor map for the top 8512 stars
#3 Break out the top 448 stars from this, leaving a neighbor map for 448 and 8064 stars
#4 Break these out into star data textures with 1 star padding for the the 8064 stars on each row
# and 2 stars padding for the 448 stars on each row.
#6 For each point on the cube map, determine the closest star in the 8064 stars, convert this into a 13 bit
# integer id.
#7 Determine the nearest star in the nearby 448 stars and attemp to get there with as few as +/- 4 star locations.
#8 Add this in binary onto our 13 bit number to get 16 bits, the red channel and the blue channel.
#9 Determine the density of remaining stars in galaxy using an 8-bit float and store this in the green channel.
#10 Split our star data into red, green and blue channel textures to be recombined into 32 bits, and simply save
# the six sides of our cubemap RGB texture.
NUMBER_OF_DIM_STARS = 8064
NUMBER_OF_BRIGHT_STARS = 448
DIM_TO_BRIGHT_STAR_SCALER = NUMBER_OF_BRIGHT_STARS / NUMBER_OF_DIM_STARS
BRIGHT_STAR_MAP_WIDTH = 32
BRIGHT_STAR_MAP_HEIGHT = 16
DIM_STAR_MAP_WIDTH = 128
DIM_STAR_MAP_HEIGHT = 64
CUBEMAP_FACE_SIZE = 128

#Mulitples of PI
PI = np.pi
PI_TIMES_TWO = np.pi * 2.0
PI_OVER_TWO = np.pi * 0.5

def float2RGBA(float_number, min_value, max_value):
    SCALE_CONSTANT = (2 ** 16)
    SCALE_RANGE = max_value - min_value
    scaled_integer = int(floor((float_number - min_value) / SCALE_RANGE * SCALE_CONSTANT))

    #Let's go with a 31 bit float as it's probably enough accuracy and doesn't
    #risk us hitting an overflow value
    R_byte = int(bin(scaled_integer & 0x7), 2)
    G_byte = int(bin(scaled_integer >> 7 & 0x8), 2)
    B_byte = int(bin(scaled_integer >> 15 & 0x8), 2)
    A_byte = int(bin(scaled_integer >> 23 & 0x8), 2)

    #Test this works
    test_float = R_byte * 128.0 + G_byte * 32768.0 + B_byte * 8388608.0 + A_byte * 2147483648.0
    scaled_test_float = ((test_float / SCALE_CONSTANT) * SCALE_RANGE) - min_value;
    if(scaled_test_float != floatNumber):
        raise TypeError("Float conversion did not work, {0} became {1}, with RGBA({2}, {3}, {4})".format(float_number, scaled_test_float, R_byte, G_byte, B_byte, A_byte))

    return [R_byte, G_byte, B_byte, A_byte]

class StarPosition:
    def __init__(self, ra, dec):
        self.ra = ra
        self.dec = dec

class VisibleStar:
    def __init__(self, galactic_coordinates, temperature, magnitude):
        self.galactic_coordinates = np.array(galactic_coordinates)
        self.temperature = temperature
        self.magnitude = magnitude
        self.parentNeighborMap = None

        #Ecode our stellar data from the start into 4 colors that we can use to fill in the texture
        self.encoded_equitorial_r = float2RGBA(galactic_coordinates[0] * self.temperature, 0.0, 100000.0)
        self.encoded_equitorial_g = float2RGBA(galactic_coordinates[1] * self.temperature, 0.0, 100000.0)
        self.encoded_equitorial_b = float2RGBA(galactic_coordinates[2] * self.temperature, 0.0, 100000.0)
        self.encoded_equitorial_a = float2RGBA(self.magnitude, -2.0, 7.0)

def bvToTemp(bv):
    return 4600 * ((1.0 / (0.92 * bv + 1.7)) + (1.0 / (0.92 * bv + 0.62)))

def gauss(r):
    return exp(-0.5 * (r * r))

def fastAiry(r):
    #Using the Airy Disk approximation from https://www.shadertoy.com/view/tlc3zM to score our stellar brightness
    return abs(r) < 1.88 if gauss(r / 1.4) else (abs(r) > 6.0 if 1.35 / abs(r**3) else (gauss(r / 1.4) + 2.7 / abs(r**3)) / 2.0)

def initialization():
    max_temperature = 0.0 #Absolute zero
    min_temperature = float("inf")

    #Filter our stars
    #Get the CSV star file and fill up our buckets with all of the data
    print('Getting star data...')
    potential_stars = []
    hy_csv_path = os.path.abspath("../csv_files/hygdata_v3.csv")
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
                galactic_latitude = math.asin(sin_star_dec * sin_of_27_4_degrees + cos_star_dec * cos_of_27_4_degrees * cos_ra_term)
                normalized_galactic_longitude = ((galactic_longitude + PI) % PI_TIMES_TWO) / PI_TIMES_TWO
                normalized_galactic_latitude = (galactic_latitude + PI_OVER_TWO) / PI
                galatic_coordinates = [0.0 for x in range(3)]
                galatic_coordinates[0] = sin(normalized_galactic_latitude) * cos(normalized_galactic_longitude)
                galatic_coordinates[1] = cos(normalized_galactic_latitude)
                galatic_coordinates[2] = sin(normalized_galactic_latitude) * sin(normalized_galactic_longitude)
                potential_stars.append(VisibleStar(galactic_coordinates, temperature, magnitude))
    print("Max Temperature: {}".format(maxTemperature))
    print("Min Temperature: {}".format(minTemperature))

    #Sort our stars according to brightness
    full_stars_list = potential_stars.sort(key=lambda x: x.magnitude, reverse=True)[:8512]
    bright_stars_list = full_stars_list[:448]
    dim_stars_list = full_stars_list[448:8512]

    #Combine all of our star groups until onle one star group remains
    print("Combine all of our star groups until only one group remains...")
    orderered_groups_of_stars = [OrderedGroupOfStars([star]) for star in full_stars_list]
    i = 0
    j = 0
    number_of_ordered_groups_of_stars = len(orderered_groups_of_stars)
    number_of_operations = int(ceil(len(orderered_groups_of_stars) * log(orderered_groups_of_stars) / log(2)))
    with progressbar.ProgressBar(number_of_operations) as bar:
        while(number_of_ordered_groups_of_stars > 1):
            other_orderered_groups_of_stars = orderered_groups_of_stars[:i] + orderered_groups_of_stars[i + 1:]
            orderered_groups_of_stars[i].findAndCombineWithClosestOtherStarGroup(other_orderered_groups_of_stars)
            i = (i + 1) % number_of_ordered_groups_of_stars
            j += 1
            bar.update(j)

    #Convert these stars into two data textures, split between their R, G, B and A channels
    print("Converting linear data into data image")
    dim_star_channel_red_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    dim_star_channel_green_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    dim_star_channel_blue_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    dim_star_channel_alpha_data_image = [[[0.0 for c in range(4)] for i in range(DIM_STAR_MAP_WIDTH)] for j in range(DIM_STAR_MAP_HEIGHT)]
    column = -1
    for row in range(DIM_STAR_MAP_HEIGHT):
        while column < DIM_STAR_MAP_WIDTH:
            cursor = column + row * (DIM_STAR_MAP_WIDTH - 2)
            star = dim_stars_list[cursor]
            for i in range(4):
                dim_star_channel_red_data_image[row][column][i] = star.encoded_equitorial_r[i]
                dim_star_channel_green_data_image[row][column][i] = star.encoded_equitorial_g[i]
                dim_star_channel_blue_data_image[row][column][i] = star.encoded_equitorial_b[i]
                dim_star_channel_alpha_data_image[row][column][i] = star.encoded_equitorial_a[i]
        #Padding
        column = -1

    datum = [dim_star_channel_red_data_image, dim_star_channel_green_data_image, dim_star_channel_blue_data_image, dim_star_channel_alpha_data_image]
    channels = ['r', 'g', 'b', 'a']
    for i, data in enumerate(datum):
        channel = channels[i]
        imarray = np.asarray(data)
        imarray = np.flip(imarray, 0)
        im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
        im.save('../../../../images/dim-star-data-{}-channel.png'.format(channel))

    bright_star_channel_red_data_image = [[[0.0 for c in range(4)] for i in range(BRIGHT_STAR_MAP_WIDTH)] for j in range(BRIGHT_STAR_MAP_HEIGHT)]
    bright_star_channel_green_data_image = [[[0.0 for c in range(4)] for i in range(BRIGHT_STAR_MAP_WIDTH)] for j in range(BRIGHT_STAR_MAP_HEIGHT)]
    bright_star_channel_blue_data_image = [[[0.0 for c in range(4)] for i in range(BRIGHT_STAR_MAP_WIDTH)] for j in range(BRIGHT_STAR_MAP_HEIGHT)]
    bright_star_channel_alpha_data_image = [[[0.0 for c in range(4)] for i in range(BRIGHT_STAR_MAP_WIDTH)] for j in range(BRIGHT_STAR_MAP_HEIGHT)]
    column = -2
    for row in range(BRIGHT_STAR_MAP_HEIGHT):
        while column < BRIGHT_STAR_MAP_WIDTH:
            cursor = column + row * (DIM_STAR_MAP_WIDTH - 4)
            star = bright_stars_list[cursor]
            for i in range(4):
                bright_star_channel_red_data_image[row][column][i] = star.encoded_equitorial_r[i]
                bright_star_channel_green_data_image[row][column][i] = star.encoded_equitorial_g[i]
                bright_star_channel_blue_data_image[row][column][i] = star.encoded_equitorial_b[i]
                bright_star_channel_alpha_data_image[row][column][i] = star.encoded_equitorial_a[i]
        #Padding
        column = -2

    datum = [bright_star_channel_red_data_image, bright_star_channel_green_data_image, bright_star_channel_blue_data_image, bright_star_channel_alpha_data_image]
    for i, data in enumerate(datum):
        channel = channels[i]
        imarray = np.asarray(data)
        imarray = np.flip(imarray, 0)
        im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
        im.save('../../../../images/bright-star-data-{}-channel.png'.format(channel))

    #Create our cubemap
    print("Creating our cubemap...")
    cubemap = Cubemap(CUBEMAP_FACE_SIZE)

    sides = ['px', 'py', 'pz', 'nx', 'ny', 'nz']
    j = 0
    with progressbar.ProgressBar(6 * CUBEMAP_FACE_SIZE * CUBEMAP_FACE_SIZE) as bar:
        for i, side in enumerate(cubemap.sides):
            side = sides[i]
            for y in range(CUBEMAP_FACE_SIZE):
                for x in range(CUBEMAP_FACE_SIZE):
                    #Convert the x, y value of this cubemap face to an x, y, z, position
                    galactic_coordinates_of_pixel = cubemap.getPixelGalacticCoordinates(i, x, y)

                    #For each point in the cubemap, determine the closest dim stellar ID, using a 13 bit integer
                    closest_dim_star_index = None
                    closest_dim_star_distance = int('inf')
                    for i in range(NUMBER_OF_DIM_STARS):
                        #We're using normal ditance over haversine distance as we presume
                        #that, for small star distances, the surface of the sphere is approximately flat
                        diff = dim_stars_list[i].galactic_coordinates - galactic_coordinates_of_pixel
                        distance_to_star_squared = np.dot(diff, diff)
                        if(distance_to_star_squared < closest_dim_star_distance):
                            closest_dim_star_distance = distance_to_star_squared
                            closest_dim_star_index = i

                    #Now determine the closest bright star stellar ID in the 448 star data texture
                    closest_bright_star_index = None
                    closest_bright_star_distance = int('inf')
                    for i in range(NUMBER_OF_BRIGHT_STARS):
                        #We're using normal ditance over haversine distance as we presume
                        #that, for small star distances, the surface of the sphere is approximately flat
                        diff = bright_stars_list[i].galactic_coordinates - galactic_coordinates_of_pixel
                        distance_to_star_squared = np.dot(diff, diff)
                        if(distance_to_star_squared < closest_bright_star_distance):
                            closest_bright_star_distance = distance_to_star_squared
                            closest_bright_star_index = i

                    #Attempt to reach this point with a 3-bit integer, between +/-4 in the scale of the 448 star data texture
                    dim_star_index_in_bright_star_scale = int(closest_dim_star_index * DIM_TO_BRIGHT_STAR_SCALER) - closest_bright_star_index
                    bright_star_offset = max(min(dim_star_index_in_bright_star_scale, 4), -4)

                    #Combine and split these binary numbers into two 8-bit channels and put them in a texture
                    sixteen_bit_index = bin(closest_dim_star_distance & 0xd) << 3 | bin(bright_star_offset & 0x3)
                    index_r = float(int(sixteen_bit_index & 0x8, 2))
                    index_g = float(int(sixteen_bit_index >> 8 & 0x8, 2))

                    #Add a check in here to see that we can split this back into a 13 bit index and a 3 bit offset
                    remaining_five_bits = floor(index_g / 8)
                    last_three_bits = index_g - remaining_five_bits
                    estimated_location_of_dim_star = remaining_five_bits * 256 + index_r
                    if(estimated_location_of_dim_star != closest_dim_star_index):
                        print("Wrong dim star index. Was looking for {}, got {}.".format(closest_dim_star_index, estimated_location_of_dim_star))
                        print("remaining_five_bits: {}".format(remaining_five_bits))
                        print("last_three_bits: {}".format(last_three_bits))
                        print("-"*8)
                        raise Exception("Bit recombination error")
                    j += 1
                    bar.update(j)

            #Write this into a cube map texture
            imarray = np.asarray(cubemap.sides[i])
            imarray = np.flip(imarray, 0)
            im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
            im.save('../../../../images/star-dictionary-cubemap-{}.png'.format(side))

#And now to run the entire application :D
if __name__ == '__main__':
    initialization()
