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
from scipy.integrate import simps

#Define some constants that we use across all of our color transformations
cmfs = colour.STANDARD_OBSERVERS_CMFS['CIE 2012 10 Degree Standard Observer']
#illuminant = colour.ILLUMINANT_SDS['D65']

#This will form a 3-D texture made of 64 sub textures of sizes 64x64, that gives us approximately
#One data point every 200 degrees kelvin. In this iteration we will scale our data linearly for
#cheap access.
output_texture = [[[255, 255, 255, 0] for x in range(128)] for y in range(128)]

#Base RGB Spectrum
black_body_sd = sd_blackbody(17000, cmfs.shape) * 1e-9
black_body_x_values = np.array([x for x in black_body_sd.wavelengths])
black_body_y_values = np.array([black_body_sd[x] * 0.5 for x in black_body_sd.wavelengths])
base_intensity = simps(black_body_y_values, black_body_x_values)

progress_bar_status = 0
print("Constructing spectra...")
with progressbar.ProgressBar(0, redirect_stdout=True) as bar:
    for i in range(4):
        for j in range(8):
            dataset = i + j * 4
            mean_temperature = 2000.0 + 15000.0 * ((dataset * dataset) / 961.0)
            black_body_sd = sd_blackbody(mean_temperature, cmfs.shape) * 1e-9

            #Get the intensity of this black body radiation
            black_body_sd = sd_blackbody(mean_temperature, cmfs.shape) * 1e-9
            black_body_x_values = np.array([x for x in black_body_sd.wavelengths])
            black_body_y_values = np.array([black_body_sd[x] for x in black_body_sd.wavelengths])
            current_intensity = simps(black_body_y_values, black_body_x_values)
            intensity_normalization_factor = base_intensity / current_intensity
            for y in range(14):
                spectral_window = 10.0 + ((y + 1.0) / 14.0) * 1110.0
                half_spectral_window = spectral_window / 2.0
                for x in range(30):
                    #Get our spectral window
                    spectral_offset = (380.0 - half_spectral_window) + (x / (29.0)) * (370.0 + spectral_window)
                    spetral_f_initial = spectral_offset - half_spectral_window
                    spetral_f_final = spectral_offset + half_spectral_window

                    #Chop our spectrum down to this range
                    #Thanks colour for making this a PITA. Just have a stupid array instead of hiding
                    #this like it's something incredibly special.
                    subset_of_blackbody_sd = {}
                    for k in black_body_sd.wavelengths:
                        s = black_body_sd[k]
                        #print("s: {}, k: {}".format(s, k))
                        if spetral_f_initial <= k and k <= spetral_f_final:
                            subset_of_blackbody_sd[k] = s  * intensity_normalization_factor
                        else:
                            subset_of_blackbody_sd[k] = 0.0
                    subset_of_blackbody_sd = colour.SpectralDistribution(subset_of_blackbody_sd)

                    #Convert our spectrum into a color
                    star_xyz_color = colour.sd_to_XYZ(subset_of_blackbody_sd, cmfs)
                    star_rgb_color = [min(max(int(c), 0),255) for c in colour.XYZ_to_sRGB(star_xyz_color / 100)]

                    y_position = j * 16 + 1 + y
                    x_position = i * 32 + 1 + x
                    for c in range(3):
                        output_texture[y_position][x_position][c] = star_rgb_color[c]
                    output_texture[y_position][x_position][3] = 255
            progress_bar_status += 1
            bar.update(progress_bar_status)

#Write this into a texture
print("Saving texture...")
imarray = np.asarray(output_texture)
imarray = np.flip(imarray, 0)
im = Image.fromarray(imarray.astype('uint8')).convert('RGB')
im.save('../../assets/star_data/twinkle-color-lut.png')
