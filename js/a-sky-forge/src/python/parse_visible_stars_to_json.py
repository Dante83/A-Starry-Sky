import csv, os, json, math

#From https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color
def bv2rgb(bv):
    if bv < -0.4: bv = -0.4
    if bv > 2.0: bv = 2.0
    if bv >= -0.40 and bv < 0.00:
        t = (bv + 0.40) / (0.00 + 0.40)
        r = 0.61 + 0.11 * t + 0.1 * t * t
        g = 0.70 + 0.07 * t + 0.1 * t * t
        b = 1.0
    elif bv >= 0.00 and bv < 0.40:
        t = (bv - 0.00) / (0.40 - 0.00)
        r = 0.83 + (0.17 * t)
        g = 0.87 + (0.11 * t)
        b = 1.0
    elif bv >= 0.40 and bv < 1.60:
        t = (bv - 0.40) / (1.60 - 0.40)
        r = 1.0
        g = 0.98 - 0.16 * t
    else:
        t = (bv - 1.60) / (2.00 - 1.60)
        r = 1.0
        g = 0.82 - 0.5 * t * t
    if bv >= 0.40 and bv < 1.50:
        t = (bv - 0.40) / (1.50 - 0.40)
        b = 1.00 - 0.47 * t + 0.1 * t * t
    elif bv >= 1.50 and bv < 1.951:
        t = (bv - 1.50) / (1.94 - 1.50)
        b = 0.63 - 0.6 * t * t
    else:
        b = 0.0
    return {'red': r, 'green': g, 'blue': b}

def bv2rgb2(bv):
    #Based on https://codepen.io/blaketarter/pen/EjxRMX
    #Still don't see any red giants though O_o - wonder why not
    if bv < -0.4:
        bv = -0.4
    elif bv > 2.0:
        bv = 2.0

    t = 4600 * ((1.0 / ((0.92 * bv) + 1.7)) + (1.0 / ((0.92 * bv) + 0.62)))

    #First set of if statements
    x = 1.0
    y = 1.0
    big_y = 1.0
    if(t >= 1667.0 and t <= 4000.0):
        x = -0.2661239 * ((10.0 ** 9) / (t ** 3)) - (-0.2343580 * (10**6 / (t ** 2))) + (0.8776956 * (10**3 / t)) + 0.179910
    elif(t >= 4000.0 and t <= 25000):
        x = -3.0258469 * ((10**9) / (t ** 3)) + (2.1070379 * ((10**6) / (t**2))) + (0.2226347 * ((10**3) / t)) + 0.240390

    #And the second set of if statements
    if(t >= 1667.0 and t <= 2222.0):
        y = -1.1063814 * (x ** 3) - 1.384811020 * (x ** 2) + 2.18555832 * x - 0.20219683
    elif(t >= 2222.0 and t <= 4000.0):
        y = -0.9549476 * (x ** 3) - 1.37418593 * (x ** 2) + 2.09137015 * x - 0.16748867
    elif(t >= 4000 and t <= 25000.0):
        y = 3.0817580 * (x ** 3) - 5.87338670 * (x ** 2) + 3.75112997 * x - 0.37001483

    big_x = 0 if y == 0 else (x * big_y) / y
    big_z = 0 if y == 0 else ((1.0 - x - y) * big_y) / y

    red = 3.2406 * big_x - 1.5372 * big_y - 0.4986 * big_z
    green = -0.9689 * big_x + 1.8758 * big_y + 0.0415 * big_z
    blue = 0.0557 * big_x - 0.2040 * big_y + 1.0570 * big_z

    red = 1.0 if red > 1.0 else red
    blue = 1.0 if blue > 1.0 else blue
    green = 1.0 if green > 1.0 else green

    #Gamma correction might be off here as the original code seem to have an issue
    green /= 1.05

    return {'red': red, 'green': green, 'blue': blue}


def parseVisibleStarsFromHyg():
    hy_csv_path = os.path.abspath("../csv_files/hygdata_v3.csv")
    stars_js_db = os.path.abspath("../js/star-data.js")

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

    print 'Star data acquired. %d stars found.' % (len(star_data))
    print 'Saving star data to JSON object.'
    with open(stars_js_db, 'w') as js_file:
        outString = 'var starData = %s;' % (json.dumps(star_data))
        js_file.write(outString)
    print "Done."
    print "-"*15

parseVisibleStarsFromHyg()
