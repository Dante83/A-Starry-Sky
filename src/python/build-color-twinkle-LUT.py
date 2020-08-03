import csv, os, json
import numpy as np
import time
import progressbar
from math import *
from PIL import Image
import colorsys
import colour
from colour.plotting import *
from colour.colorimetry import *

#Define some constants that we use across all of our color transformations
cmfs = colour.STANDARD_OBSERVERS_CMFS['CIE 1931 2 Degree Standard Observer']
#illuminant = colour.ILLUMINANT_SDS['D65']

#This will form a 3-D texture made of 64 sub textures of sizes 64x64, that gives us approximately
#One data point every 200 degrees kelvin. In this iteration we will scale our data linearly for
#cheap access.
output_texture = [[[0.0 for i in range(4)] for x in range(128)] for y in range(128)]

progress_bar_status = 0
print("Constructing spectra...")
with progressbar.ProgressBar(64, redirect_stdout=True) as bar:
    for i in range(8):
        for j in range(8):
            dataset = i + j * 8
            mean_temperature = 2000.0 + 15000.0 * (dataset / 63.0)
            black_body_sd = sd_blackbody(mean_temperature, cmfs.shape) * 1e-9
            for x in range(14):
                spectral_window = x * ((700 - 380) / 15.0) * 2.0
                for y in range(14):
                    #Get our spectral window
                    spectral_offset = (y + 1.0) * ((700.0 - 380.0) / 15.0)
                    spetral_f_initial = spectral_offset - spectral_window
                    spetral_f_final = spectral_offset + spectral_window

                    #Chop our spectrum down to this range
                    #Thanks colour for making this a PITA. Just have a stupid array instead of hiding
                    #this like it's something incredibly special.
                    subset_of_blackbody_sd = {}
                    for k in black_body_sd.wavelengths:
                        s = black_body_sd[k]
                        #print("s: {}, k: {}".format(s, k))
                        if spetral_f_initial <= k and k <= spetral_f_final:
                            subset_of_blackbody_sd[k] = s
                        else:
                            subset_of_blackbody_sd[k] = 0.0
                    subset_of_blackbody_sd = colour.SpectralDistribution(subset_of_blackbody_sd)

                    #Convert our spectrum into a color
                    star_xyz_color = colour.sd_to_XYZ(subset_of_blackbody_sd, cmfs)
                    initial_rgb = [min(max(c / 255.0, 0.0),1.0) for c in colour.XYZ_to_sRGB(star_xyz_color / 100)]
                    # hsv_color = colorsys.rgb_to_hsv(initial_rgb[0], initial_rgb[1], initial_rgb[2])
                    # rgb_color = colorsys.hsv_to_rgb(hsv_color[0], hsv_color[1], 1.0)
                    star_rgb_color = [min(max(int(c * 255.0), 0),255) for c in initial_rgb]

                    x_position = j * 16 + 1 + x
                    y_position = i * 16 + 1 + y
                    for c in range(3):
                        output_texture[x_position][y_position][c] = star_rgb_color[c]
                    output_texture[x_position][y_position][3] = 255
            progress_bar_status += 1
            bar.update(progress_bar_status)

#Write this into a texture
print("Saving texture...")
imarray = np.asarray(output_texture)
imarray = np.flip(imarray, 0)
im = Image.fromarray(imarray.astype('uint8')).convert('RGB')
im.save('../../assets/star_data/twinkle-color-lut.png')
