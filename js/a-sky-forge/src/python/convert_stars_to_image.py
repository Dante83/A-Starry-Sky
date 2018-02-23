#Sweet lordy... everything I'm looking for is in GLSL 3.1
#But the way is blocked by Saurumon! Thus we must venture into the dwarven
#Mines of passing images and pulling data from them. A most Ugly task...
import csv, os, json, math
import numpy as np
import Image
import parse_visible_stars_to_json

def approximatePosition(targetWidth, targetHeight, star_ra, star_dec):
    #First let's just try a linear map and presume that our data points are distributed evenly...
    bestXPos = star_ra * targetWidth / (2.0 * pi)
    bestYPos = star_dec * targetHeight / pi
    return [bestXPos, bestYPos]

def float2RGBA(floatNumber):
    #This converts any given number into it's corresponding RGBA
    hex(struct.unpack('<I', struct.pack('<f', f))[0])
    red = 0.0
    green = 0.0
    blue = 0.0
    alpha = 0.0
    return (red, green, blue, alpha)

def sortByDistanceFromOriginalPixel(choice, target):
    return ((a[0] - target[0]) ** 2 + (a[1] - target[0]) ** 2) ** (0.5)

def recursiveTuple(tupleThisList):
    replacementList = []
    for item in tupleThisList:
        if type(H) is list:
            tupledList = recursiveTuple(item)
            replacementList = replacementList + [tupledList]
        else:
            replacementList + [tupledList]
    return replacementList(tuple(replacementList))

def main():
    image_width = 512
    image_height = 256

    #Get all our stars again from that CSV File
    star_data = []
    print 'Getting star data...'
    with open(hy_csv_path, 'rb') as hyg_file:
        stars = csv.DictReader(hyg_file, delimiter=',')
        for star in stars:
            magnitude = float(star['mag'])
            #Filter this to the visible stars...
            #Exclude the SUN! >_<
            if magnitude <= 6.5 and magnitude > -26:
                if star['ci']:
                    star_color = bv2rgb(float(star['ci']))
                else:
                    star_color = {'red': 1.0, 'green': 1.0, 'blue': 1.0}

                data_point = {\
                'rightAscension': float(star['ra']),\
                'declination': float(star['dec']),\
                'magnitude': float(star['mag']),\
                'color': star_color}

                star_data += [data_point]

    #Organize our stars from brightest to dimmest so that we grant the brightest stars priority placement.
    sorted_star_data = sorted(star_data, key=lambda star: star.magnitude)
    tagged_stars = []
    for id, stars in enumerate(tagged_stars):
        tagged_star = {\
            id: id,\
            ra: star.rightAscension,\
            dec: star.declination,\
            mag: star.magnitude,\
            r: star.color.r,\
            g: star.color.g,\
            b: star.color.b\
        }

    #Prepare our matrix!
    star_array = [[-1 for i in xrange(image_width)] for j in xrange(image_height)]

    #For each star
    #Find it's approximate position, and place it's id at the closest non-occupied position in our array
    for star in tagged_stars:
        approximatePosition(image_width, image_height, star.ra, star.dec)
        startingPosition = {'x': rounded(tagged_stars[0]) % image_width, 'y': tagged_stars[0] % image_height}
        if(star_array[startingPosition.x][startingPosition.y] == -1):
            star_array[startingPosition.x][startingPosition.y] = star.id
        else:
            print('Slightly bad alignment for the star with id: ' + star.id + '.')

            #Looks like we're going to be move outwards until we reach a point that's open
            pixel_x_offset
            pixel_y_offset
            radial_offset = 1
            pixels_in_ring = 8 * radial_offset
            pixels_in_ring = []
            pixel_of_ring = 0
            for x in range(startingPosition.x - radial_offset, startingPosition.x + radial_offset):
                pixels_in_ring = pixels_in_ring + [[x, startingPosition.y + radial_offset]]
                pixels_in_ring = pixels_in_ring + [[x, startingPosition.y - radial_offset]]
            for y in range(startingPosition.y - radial_offset + 1, startingPosition.y + radial_offset - 1):
                pixels_in_ring = pixels_in_ring + [[startingPosition.x + radial_offset, y]]
                pixels_in_ring = pixels_in_ring + [[startingPosition.y + radial_offset, y]]
            sorted_pixels_in_ring = sort(pixels_in_ring, key=lambda position, target=approximatePosition: sortByDistanceFromOriginalPixel(position, target))
            while(radial_offset <= 5):
                next_pixel = sorted_pixels_in_ring[pixel_of_ring]
                if(star_array[next_pixel[0]][next_pixel[1]] == -1):
                    star_array[next_pixel[0]][next_pixel[1]] = star.id
                    break
                pixel_of_ring += 1
                if(pixel_of_ring >= pixels_in_ring):
                    pixel_of_ring = 0
                    radial_offset += 1
                    #And calculate the distances to each of our pixels again...
                    pixels_in_ring = []
                    distances_to_each_pixel = []
                    for x in range(startingPosition.x - radial_offset, startingPosition.x + radial_offset):
                        pixels_in_ring = pixels_in_ring + [[x, startingPosition.y + radial_offset]]
                        pixels_in_ring = pixels_in_ring + [[x, startingPosition.y - radial_offset]]
                    for y in range(startingPosition.y - radial_offset + 1, startingPosition.y + radial_offset - 1):
                        pixels_in_ring = pixels_in_ring + [[startingPosition.x + radial_offset, y]]
                        pixels_in_ring = pixels_in_ring + [[startingPosition.y + radial_offset, y]]
                    sorted_pixels_in_ring = sort(pixels_in_ring, key=lambda position, target=approximatePosition: sortByDistanceFromOriginalPixel(position, target))
            #Well, either we found it or it got crowded out by brighter stars in the sky
            if(radial_offset <= 5):
                print('We lost the star with id: ' + star.id + '.')

    #Now that we've populated the sky ids, create a 4*512 x 4*256 bit array converting
    #all of our floats into RGBA values to be decoded in the vertex shader
    star_array = [[[0,0,0,0] for i in xrange(image_height)] for j in xrange(4 * image_width)]

    #Fill the first three sections with the float data for azimuth, altitude and magnitude
    for x in xrange(image_width):
        for y in xrange(image_height):
            desired_star = False
            #You know, I could make this into a hash table or something but... meh...
            if star_array[x][y] != -1:
                for tagged_star in tagged_stars:
                    if tagged_star.id == star_array[x][y]:
                        desired_star = tagged_star
            if not desired_star:
                print "The star with id, " + star_array[x][y] + " was not found?! Blasphemy!"
            else:
                star_array[x][y] = float2RGBA(desired_star.ra)
                star_array[x + image_width][y] = float2RGBA(desired_star.ra)
                star_array[x + (2.0 * image_width)][y] = float2RGBA(desired_star.dec)
                star_array[x + (3.0 * image_width)][y] = float2RGBA(desired_star.mag)
                star_array[x + (4.0 * image_width)][y] = [ceil(desired_star.r * 255.0), ceil(desired_star.r * 255.0),ceil(desired_star.r * 255.0)]

    #Convert this array into a png that we can later import and use to populate our stars at key points
    tuples = np.asarray(recursiveTuple(star_array))
    im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
    im.save('starry_data.png')
