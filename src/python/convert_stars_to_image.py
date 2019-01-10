#Sweet lordy... everything I'm looking for is in GLSL 3.1
#But the way is blocked by Saurumon! Thus we must venture into the dwarven
#Mines of passing images and pulling data from them. A most Ugly task...
import csv, os, json, math
import numpy as np
from PIL import Image
import parse_visible_stars_to_json as pvs

def approximatePosition(targetWidth, targetHeight, star_ra, star_dec):
    #First let's just try a linear map and presume that our data points are distributed evenly...
    bestXPos = star_ra * targetWidth / (2.0 * np.pi)
    bestYPos = (star_dec + (np.pi / 2.0)) * targetHeight / np.pi
    return [bestXPos, bestYPos]

def float2RGBA(floatNumber):
    originalValue = floatNumber

    #Get the exponent and value portion of the number
    sign = np.sign(floatNumber)
    floatNumber = abs(floatNumber)
    floatValue = floatNumber / pow(10, math.floor(math.log(floatNumber)))
    exponent = int(math.floor(math.log(floatNumber)))

    #Convert the float into an integer less than or equal to 16777215
    while((floatValue * 10) < 16777215):
        floatValue *= 10
        exponent -= 1
    floatValue = int(floatValue)

    if(exponent > 63):
        print 'Our exponent is tooooooo big for our puny little program.'
    elif(exponent < -63):
        print 'Our exponent is toooooooo tiny for our massive program.'

    #Now convert this appropriately into our R, G, B and Alpha value
    #Alphas can represent exponents between -128 and 128

    '''
    This was our test program in js...
    var a = 16777215;
    var b = Math.floor(a / Math.pow(256, 2));
    var rem = (a - (b * Math.pow(256, 2)));
    var c = Math.floor( rem / 256);
    var d = rem - (c * 256);

    console.log(b,c,d)
    console.log(b * Math.pow(256, 2), c * 256, d);
    console.log(b * Math.pow(256, 2) + c * 256 + d);
    '''

    red = math.floor(floatValue / (256 * 256))
    remainder = (floatValue - (red * 256 * 256))
    green = math.floor(remainder / 256)
    blue = remainder - (green * 256)

    #1111111 1 Binary in int
    #From https://stackoverflow.com/questions/699866/python-int-to-binary
    alpha = int(bin(exponent + 64) + ('1' if sign > 0 else '0'), 2)

    #Test that this technology works...
    testExponentBinary = bin(alpha)
    testSign = -1 if testExponentBinary[-1] == '0' else 1
    testExponenentRemainder = float((int(testExponentBinary[3:-1], 2) - 64) if len(testExponentBinary[3:-1]) > 0 else '0')
    testValue = (testSign * (red * 256 * 256 + green * 256 + blue) * math.pow(10, testExponenentRemainder))
    if((testValue - originalValue) / max(testValue, originalValue) > 0.000001):
        print testValue
        print testExponenentRemainder
        print '%f does not equal %f, so something must be wrong with the creation of our rgb values...'%(testValue, originalValue)

    return [red, green, blue, alpha]

def sortByDistanceFromOriginalPixel(choice, target):
    return ((choice[0] - target[0]) ** 2 + (choice[1] - target[0]) ** 2) ** (0.5)

def recursiveTuple(tupleThisList):
    replacementList = []
    for item in tupleThisList:
        if type(item) is list:
            tupledList = recursiveTuple(item)
            replacementList += [tupledList]
        else:
            replacementList += [item]
    return tuple(replacementList)

def main():
    padding = 5
    image_width = 512 - 2 * padding
    image_height = 256 - 2 * padding

    #Get all our stars again from that CSV File
    star_data = []
    print 'Getting star data...'
    hy_csv_path = os.path.abspath("../csv_files/hygdata_v3.csv")
    stars_js_db = os.path.abspath("../js/star-data.js")
    with open(hy_csv_path, 'rb') as hyg_file:
        stars = csv.DictReader(hyg_file, delimiter=',')
        for star in stars:
            magnitude = float(star['mag'])
            #Filter this to the visible stars...
            #Exclude the SUN! >_<
            if magnitude <= 6.5 and magnitude > -26:
                if star['ci']:
                    star_color = pvs.bv2rgb2(float(star['ci']))
                else:
                    star_color = {'red': 1.0, 'green': 1.0, 'blue': 1.0}

                data_point = {\
                'rightAscension': float(star['ra']),\
                'declination': float(star['dec']),\
                'magnitude': float(star['mag']),\
                'color': star_color}

                star_data += [data_point]

    #Organize our stars from brightest to dimmest so that we grant the brightest stars priority placement.
    sorted_star_data = sorted(star_data, key=lambda star: star['magnitude'])
    tagged_stars = []
    for id, star in enumerate(sorted_star_data):
        tagged_star = {\
            'id': id,\
            'ra': star['rightAscension'] * (np.pi / 12.0),\
            'dec': star['declination'] * (np.pi / 180.0),\
            'mag': star['magnitude'],\
            'r': star['color']['red'],\
            'g': star['color']['green'],\
            'b': star['color']['blue']\
        }
        tagged_stars += [tagged_star]

    #Prepare our matrix!
    star_array = [[-1 for i in xrange(image_height)] for j in xrange(image_width)]

    #For each star
    #Find it's approximate position, and place it's id at the closest non-occupied position in our array
    for star in tagged_stars:
        pos = approximatePosition(image_width, image_height, star['ra'], star['dec'])
        startingPosition = {'x': int(math.floor(pos[0])), 'y': int(math.floor(pos[1]))}
        if(star_array[startingPosition['x']][startingPosition['y']] == -1):
            star_array[startingPosition['x']][startingPosition['y']] = star['id']
        else:
            #print('Slightly bad alignment for the star with id: %d.'%star['id'])

            #Looks like we're going to be move outwards until we reach a point that's open
            radial_offset = 1
            pixels_in_ring = 8 * radial_offset
            pixels_in_ring = []
            pixel_of_ring = 0
            for x in range(startingPosition['y'] - radial_offset, startingPosition['y'] + radial_offset):
                pixels_in_ring += [[x, startingPosition['x'] + radial_offset]]
                pixels_in_ring += [[x, startingPosition['x'] - radial_offset]]
            for y in range(startingPosition['x'] - radial_offset + 1, startingPosition['x'] + radial_offset - 1):
                pixels_in_ring += [[startingPosition['y'] + radial_offset, y]]
                pixels_in_ring += [[startingPosition['y'] + radial_offset, y]]
            sorted_pixels_in_ring = sorted(pixels_in_ring, key=lambda position, target=pos: sortByDistanceFromOriginalPixel(position, target))
            while(radial_offset <= 2):
                next_pixel = sorted_pixels_in_ring[pixel_of_ring]
                #print next_pixel
                normalized_pixel = [next_pixel[0] % image_width, next_pixel[1] % image_height]
                if(star_array[normalized_pixel[1]][normalized_pixel[0]] == -1):
                    star_array[normalized_pixel[1]][normalized_pixel[0]] = star['id']
                    break
                pixel_of_ring += 1
                if(pixel_of_ring == len(pixels_in_ring)):
                    pixel_of_ring = 0
                    radial_offset += 1
                    #And calculate the distances to each of our pixels again...
                    pixels_in_ring = []
                    distances_to_each_pixel = []
                    for x in range(startingPosition['y'] - radial_offset, startingPosition['y'] + radial_offset):
                        pixels_in_ring += [[x, startingPosition['x'] + radial_offset]]
                        pixels_in_ring += [[x, startingPosition['x'] - radial_offset]]
                    for y in range(startingPosition['x'] - radial_offset + 1, startingPosition['x'] + radial_offset - 1):
                        pixels_in_ring += [[startingPosition['y'] + radial_offset, y]]
                        pixels_in_ring += [[startingPosition['y'] + radial_offset, y]]
                    sorted_pixels_in_ring = sorted(pixels_in_ring, key=lambda position, target=pos: sortByDistanceFromOriginalPixel(position, target))
            #Well, either we found it or it got crowded out by brighter stars in the sky
            if(radial_offset > 2):
                print('We lost the star with id: %d.'%star['id'])

    #Now that we've populated the sky ids, create a 4*512 x 4*256 bit array converting
    #all of our floats into RGBA values to be decoded in the vertex shader
    star_out_array = [[[0,0,0,0] for i in xrange(image_width * 5)] for j in xrange(image_height)]
    star_out_sub_images = [[[[0,0,0,0] for i in xrange(image_width)] for j in xrange(image_height)] for img in xrange(5)]

    #Fill the first three sections with the float data for azimuth, altitude and magnitude

    for x in xrange(image_width):
        for y in xrange(image_height):
            desired_star = False
            #You know, I could make this into a hash table or something but... meh...
            if star_array[x][y] != -1:
                for tagged_star in tagged_stars:
                    if tagged_star['id'] == star_array[x][y]:
                        desired_star = tagged_star
                if not desired_star:
                    print star_array[x][y]
                    print "The star with id %d, was not found?! Blasphemy!"%+ star_array[y][x]
                else:
                    star_out_array[y][x] = (255,0,0,255)
                    star_out_array[y][x + image_width] = float2RGBA(desired_star['ra'])
                    star_out_array[y][x + (2 * image_width)] = float2RGBA(desired_star['dec'])
                    star_out_array[y][x + (3 * image_width)] = float2RGBA(desired_star['mag'])
                    star_out_array[y][x + (4 * image_width)] = [math.floor(desired_star['r'] * 256.0), math.floor(desired_star['g'] * 256.0), math.floor(desired_star['b'] * 256.0), 255.0]

                    #And our sub sub images
                    star_out_sub_images[0][y][x] = star_out_array[y][x][:]
                    star_out_sub_images[1][y][x] = star_out_array[y][x + image_width][:]
                    star_out_sub_images[2][y][x] = star_out_array[y][x + (2 * image_width)][:]
                    star_out_sub_images[3][y][x] = star_out_array[y][x + (3 * image_width)][:]
                    star_out_sub_images[4][y][x] = star_out_array[y][x + (4 * image_width)][:]

    #And while we're here, let's also create the padded version of the star data
    #Python is perfect for this because of it's ability to use negative indices
    padded_image = [[[0,0,0,0] for i in xrange((image_width + 2 * padding) * 5)] for j in xrange(image_height + 2 * padding)]
    for index, sub_image in enumerate(star_out_sub_images):
        padded_sub_image = [[[0,0,0,0] for i in xrange(image_width + 2 * padding)] for j in xrange(image_height + 2 * padding)]
        for y in range(-padding, (image_height + padding)):
            for x in range(-padding, (image_width + padding)):
                padded_sub_image[y + padding][x + padding] = sub_image[y if y <= 0 else (y % image_height)][x if x <= 0 else (x % image_width)]
                padded_image[y + padding][x + padding + (index * (image_width + 2 * padding))] = sub_image[y if y <= 0 else (y % image_height)][x if x <= 0 else (x % image_width)]
        imarray = np.asarray(padded_sub_image)
        im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
        im.save('../../images/padded-starry-sub-data-%d.png'%(index))

    #Convert this array into a png that we can later import and use to populate our stars at key points
    imarray = np.asarray(star_out_array)
    im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
    im.save('../../images/starry-data.png')

    #And the padded data
    imarray = np.asarray(padded_image)
    im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
    im.save('../../images/padded-starry-data.png')

#And now to run the entire application :D
main()
