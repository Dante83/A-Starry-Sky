#Sweet lordy... everything I'm looking for is in GLSL 3.1
#But the way is blocked by Saurumon! Thus we must venture into the dwarven
#Mines of passing images and pulling data from them. A most Ugly task...
import csv, os, json, math
import numpy as np
from PIL import Image
import parse_visible_stars_to_json as pvs
import multiprocessing as mp

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
    haversine_distance = 2.0 * 1.0 * math.asin(math.sqrt(d))

    #Normalized Magnitude
    #normalizedMagnitude = (1.0 - (magnitudeOfStar + 1.46) / 7.96);

    return haversine_distance

def indexPixels(y, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list):
    print 'Y Number: ' + str(y) + ' of ' + str(indexing_img_height)

    #Connect our indexing arrays to our data_arrays
    half_img_height = indexing_img_height / 2
    quarter_img_height = indexing_img_height / 4
    indexing_row = [None for i in xrange(indexing_img_width)]
    dec = np.pi * ((float(y) / float(half_img_height)) - 0.5)
    for x in xrange(indexing_img_width):
        ra = (float(x) / float(indexing_img_width)) * 2.0 * np.pi

        #Get the four most important stars for this pixel
        closest_star_scores = [1000.0] * 6
        closest_stars = [None] * 6
        for star in first_8192_stars:
            score = scoreStar(ra, dec, star['ra'], star['dec'], star['mag'])
            for i, previous_score in enumerate(closest_star_scores):
                if score < previous_score:
                    closest_star_scores = closest_star_scores[:i] + [score] + closest_star_scores[i:]
                    closest_star_scores.pop()
                    closest_stars = closest_stars[:i] + [star] + closest_stars[i:]
                    closest_stars.pop()
                    break
        #After ranking the stars by distance
        #rank them by brightness and take the top four
        scores = [0.0 for i in xrange(4)]
        top_ranked_stars = [closest_stars[i] for i in xrange(4)]
        for i, star in enumerate(closest_stars):
            score = ((1.0 - (star['mag'] + 1.46) / 7.96) / 15.0) / (closest_star_scores[i] * closest_star_scores[i]);
            for j, previous_score in enumerate(scores):
                if score > previous_score:
                    scores = scores[:j] + [score] + scores[j:]
                    scores.pop()
                    top_ranked_stars = top_ranked_stars[:j] + [star] + top_ranked_stars[j:]
                    top_ranked_stars.pop()
                    break

        #Find the x, y locations for each of these stars in our data_array
        #and save the results
        xy_locs = [id_to_xy_list[top_ranked_stars[i]['id']] for i in xrange(4)]

        #These are just positive integers between 0 and 63
        #But the image is a scale of 0 to 255
        #and the map is on a scale of 0 to 127
        #So to get the right number, we must double our values
        indexing_row[x] = [xy_locs[0]['x'], xy_locs[0]['y'] * 2.0, xy_locs[1]['x'], xy_locs[1]['y'] * 2.0]
        indexing_row[x] += [xy_locs[2]['x'], xy_locs[2]['y'] * 2.0, xy_locs[3]['x'], xy_locs[3]['y'] * 2.0]
    return indexing_row

def initialization():
    data_img_width = 256
    data_img_height = 128
    indexing_img_width = 2048
    indexing_img_height = 2048

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
    #Get the first 64x64 or 8192 stars
    first_8192_stars = tagged_stars[:8192]

    #Prepare our matrix!
    #Our first index is oddly our y coordinate and the second is the x for Image.fromarray
    data_array = [[[0.0 for c in xrange(4)] for i in xrange(data_img_width)] for j in xrange(data_img_height)]
    indexing_array = [[[0.0 for c in xrange(4)] for i in xrange(indexing_img_width)] for j in xrange(indexing_img_height)]
    i = 0

    id_to_xy_list = {}
    for x in xrange(128):
        for y in xrange(64):
            starData = first_8192_stars[i]
            data_array[y][x] = float2RGBA(starData['ra'])
            data_array[y][x + 128] = float2RGBA(starData['dec'])
            data_array[y + 64][x] = float2RGBA(starData['mag'])
            data_array[y + 64][x + 128] = [math.floor(starData['r'] * 256.0), math.floor(starData['g'] * 256.0), math.floor(starData['b'] * 256.0), 255.0]
            id_to_xy_list[starData['id']] = {'x': x, 'y': y}
            i += 1
    imarray = np.asarray(data_array)
    imarray = np.flip(imarray, 0)
    im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
    im.save('../../../../images/star-data.png')

    #Multithreading
    num_cpus = mp.cpu_count()
    pool = mp.Pool(num_cpus)
    half_img_height = indexing_img_height / 2

    indexing_array_collapsed = []
    for i in xrange(half_img_height / 8):
        y = i * 8
        r1 = pool.apply_async(indexPixels, args=(y, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list))
        r2 = pool.apply_async(indexPixels, args=(y + 1, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list))
        r3 = pool.apply_async(indexPixels, args=(y + 2, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list))
        r4 = pool.apply_async(indexPixels, args=(y + 3, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list))

        r5 = pool.apply_async(indexPixels, args=(y + 4, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list))
        r6 = pool.apply_async(indexPixels, args=(y + 5, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list))
        r7 = pool.apply_async(indexPixels, args=(y + 6, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list))
        r8 = pool.apply_async(indexPixels, args=(y + 7, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list))
        indexing_array_collapsed += [r1.get(), r2.get(), r3.get(), r4.get()]
        indexing_array_collapsed += [r5.get(), r6.get(), r7.get(), r8.get()]
    #indexing_array_collapsed = [pool.apply_async(indexPixels, args=(y, indexing_img_width, indexing_img_height, first_8192_stars, id_to_xy_list)) for y in xrange(half_img_height)]

    #Close our threads when done

    pool.close()

    #Convert our data into valid indexing arrays
    for y, row in enumerate(indexing_array_collapsed):
        for x, column in enumerate(row):
            indexing_array[y][x] = [column[i] for i in xrange(4)]
            indexing_array[y + half_img_height][x] = [column[i + 4] for i in xrange(4)]

    #index image 1
    imarray = np.asarray(indexing_array)
    imarray = np.flip(imarray, 0)
    im = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
    im.save('../../../../images/star-index.png')

#And now to run the entire application :D
if __name__ == '__main__':
    initialization()
