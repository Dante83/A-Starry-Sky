import csv, os, json
import numpy as np
import time
import progressbar
from math import *
from PIL import Image
import colour
from colour.plotting import *
from colour.colorimetry import *

#Define some constants that we use across all of our color transformations
# cmfs = STANDARD_OBSERVER_CMFS['CIE 1931 2 Degree Standard Observer']
# illuminant = ILLUMINANT_SDS['D65']

#This will form a 3-D texture made of 64 sub textures of sizes 64x64, that gives us approximately
#One data point every 200 degrees kelvin. In this iteration we will scale our data linearly for
#cheap access.
output_texture = [[[255 for i in range(4)] for x in range(512)] for y in range(512)]

progress_bar_status = 0
print("Constructing spectra...")
with progressbar.ProgressBar(64, redirect_stdout=True) as bar:
    for i in range(8):
        for j in range(8):
            dataset = i + j * 8
            mean_temperature = 2000.0 + 15000.0 * (dataset / 63.0)
            black_body_sd = sd_blackbody(mean_temperature, SpectralShape(250.0, 750.0, 1.0))
            for x in range(62):
                #spectral_window = 300.00 / float(x + 1.0)
                spectral_window = 400.0 - (float(x)/61.0) * 394.0
                for y in range(62):
                    #Get our spectral window
                    spectral_difference = (400.0 - spectral_window) / 62.0
                    spetral_f_initial = 300.0
                    spetral_f_final = 300.0 + spectral_difference * y

                    #Chop our spectrum down to this range
                    #Thanks colour for making this a PITA. Just have a stupid array instead of hiding
                    #this like it's something incredibly special.
                    subset_of_blackbody_sd = {}
                    test = 0
                    for k in black_body_sd._domain:
                        s = black_body_sd[k]
                        if spetral_f_initial <= k and k <= spetral_f_final:
                            subset_of_blackbody_sd[k] = s
                            test += 1
                    print(test)
                    subset_of_blackbody_sd = colour.SpectralDistribution(subset_of_blackbody_sd)

                    #Convert our spectrum into a color
                    star_xyz_color = colour.sd_to_XYZ(subset_of_blackbody_sd)
                    star_rgb_color = [int(c * 255.0) for c in colour.XYZ_to_sRGB(star_xyz_color / 100)]

                    x_position = i * 64 + 1 + x
                    y_position = j * 64 + 1 + y
                    for c in range(3):
                        output_texture[x_position][y_position][c] = star_rgb_color[c]

            progress_bar_status += 1
            bar.update(progress_bar_status)

#Pad our results
print("Padding results...")
for y in [(64 * j - 1) for j in range(9)]:
    if y != 0:
        for x in range(62):
            x_1 = x + 2
            x_2 = x + 66
            for c in range(3):
                output_texture[x_1][y - 1][c] = output_texture[x_1][y - 2][c]
                output_texture[x_2][y - 1][c] = output_texture[x_2][y - 2][c]

    if y != 63:
        for x in range(62):
            x_1 = x + 2
            x_2 = x + 66
            for c in range(3):
                output_texture[x_1][y][c] = output_texture[x_1][y + 1][c]
                output_texture[x_2][y][c] = output_texture[x_2][y + 1][c]

for y in range(512):
    for x in [i * 64 - 1 for i in range(8)]:
        x_1 = x
        x_2 = x + 1
        if x_1 != -1:
            for c in range(3):
                output_texture[x_1][y][c] = output_texture[x_1 - 1][y][c]
        if x_2 != 512:
            for c in range(3):
                output_texture[x_2][y][c] = output_texture[x_2 + 1][y][c]

#Write this into a texture
print("Saving texture...")
imarray = np.asarray(cubemap.sides[i])
imarray = np.flip(imarray, 0)
im = Image.fromarray(imarray.astype('uint8')).convert('RGB')
im.save('../../../assets/star_data/twinkle-color-lut.png')
