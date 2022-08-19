import os, time, re
import subprocess
import tempfile

def main():
    #Useful constants, what we probably want to modify in order to write out the right file names
    output_dir = '../../dist/'
    relative_dir = output_dir + "a-starry-sky-master.js"
    file_dir = os.path.abspath(relative_dir)
    minified_file_dir = os.path.abspath(output_dir + "a-starry-sky-master.min.js")

    #Directy and ordered list of files to load
    js_dir = '../js/'
    js_fil_names = ['three_js_extensions/BufferGeometryUtils.js',\
    'three_js_extensions/Copyshader.js',\
    'three_js_extensions/Pass.js',\
    'three_js_extensions/RenderPass.js',\
    'three_js_extensions/ShaderPass.js',\
    'three_js_extensions/EffectComposer.js',\
    'three_js_extensions/LuminosityHighPassShader.js',\
    'three_js_extensions/UnrealBloom.js',\
    'three_js_extensions/StarrySkyGPUComputeRenderer.js',\
    'StarrySky.js',\
    'materials/atmosphere/atmosphere-functions.js',\
    'materials/atmosphere/transmittance.js',\
    'materials/atmosphere/single-scattering.js',\
    'materials/atmosphere/inscattering-sum.js',\
    'materials/atmosphere/kth-inscattering.js',\
    'materials/atmosphere/atmosphere-pass.js',\
    'materials/postprocessing/moon-and-sun-output.js',\
    'materials/sun/base-sun-partial.js',\
    'materials/moon/base-moon-partial.js',\
    'materials/stars/star-data-map.js',\
    'materials/autoexposure/metering-survey.js',\
    'materials/clouds/cloud-noise.js',\
    'materials/fog/fog-pars.js',\
    'materials/fog/fog.js',\
    'html_tags/HTMLTagUtils.js',\
    'html_tags/SkyAssetsDir.js',\
    'html_tags/SkyLighting.js',\
    'html_tags/SkyAtmosphericParameters.js',\
    'html_tags/SkyLocation.js',\
    'html_tags/SkyTime.js',\
    'html_tags/SkyAurora.js',\
    'html_tags/SkyClouds.js',\
    'lut_libraries/AtmosphericLUTLibrary.js',\
    'lut_libraries/StellarLUTLibrary.js',\
    'lut_libraries/CloudLUTLibrary.js',\
    'renderers/FogRenderer.js',\
    'renderers/AtmosphereRenderer.js',\
    'renderers/SunRenderer.js',\
    'renderers/MoonRenderer.js',\
    'renderers/MeteringSurveyRenderer.js',\
    'components/LightingManager.js',\
    'components/AssetManager.js',\
    'components/SkyDirector.js',\
    'primitives/a-starry-sky.js',\
    'components/starry-sky-wrapper.js']

    #Grab the strings for each of these files, and pull out any branches of code related to if(typeof exports !== 'undefined') {..}
    code_blocks = []
    regex = re.compile(r"(if\(typeof\sexports\s.*?\})", re.DOTALL)
    for js_fil_name in js_fil_names:
        fil_path = os.path.abspath(js_dir + js_fil_name)
        code_block = ''
        with open(fil_path, 'r') as f:
            code_block = f.read()
            out_code = re.sub(regex, '', code_block)
            code_blocks = code_blocks + [out_code]

    #Concatonate each of these files into the master files
    combined_code = '\n'.join(code_blocks)
    with open(file_dir, 'w') as w:
        w.write(combined_code)
        print ("Combined file written...")

    #Remove comments from our GLSL code to further compress our code for the minified file
    shaderFil = code_blocks[1];
    select_normal_comments = re.compile(r"([\'|\"]\/\/.*[\'|\"],)")
    code_without_normal_comments = re.sub(select_normal_comments, '', shaderFil)
    select_trailing_normal_comments = re.compile(r"([\'|\"].*)(\/\/.*)([\'|\"],)")
    code_without_trailing_normal_comments = re.sub(select_trailing_normal_comments, r"\1\3", code_without_normal_comments)
    select_normal_multiline_comments = re.compile(r"[\'|\"]/\*[^*]*\*+(?:[^/*][^*]*\*+)*/[\'|\"]\,")
    code_without_normal_multiline_comments = re.sub(select_normal_multiline_comments, '', code_without_trailing_normal_comments)
    code_blocks[1] = code_without_normal_multiline_comments
    combined_code = '\n'.join(code_blocks)

    #Write this into a temporary file for usage in the subprocess
    temp_dir = os.path.abspath(output_dir)
    with tempfile.NamedTemporaryFile(dir = temp_dir) as tmp:
        #Write our temporary file
        tmp.write(combined_code.encode(encoding='ASCII'))
        tmp.seek(0)

        #Use that temporary file in our sub process
        proc = subprocess.Popen(['terser', tmp.name], stdout=subprocess.PIPE, shell=True)
        (uglified_js, err) = proc.communicate()
        if err == None:
            with open(minified_file_dir, 'wb') as w:
                w.write(uglified_js)
                print ("Uglified file written...")

#Run everything you see above
main()
