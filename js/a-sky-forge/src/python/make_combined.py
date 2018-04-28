import os, time, re
import subprocess
import tempfile

def main():
    #Useful constants, what we probably want to modify in order to write out the right file names
    version = '0.1.0'
    output_dir = '../../dist/'
    relative_dir = output_dir + "askyforge.v" + version + ".js"
    file_dir = os.path.abspath(relative_dir)
    minified_file_dir = os.path.abspath(output_dir + "askyforge.v" + version + ".min.js")

    #Directy and ordered list of files to load
    js_dir = '../js/'
    js_fil_names = ['cloner.js', 'sky-shader.js', 'a-sky-forge.js', 'a-dynamic-sky-entity-methods.js',\
    'a-frame-components.js', 'a-sky-interpolator.js']

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
        tmp.write(combined_code)
        tmp.seek(0)

        #Use that temporary file in our sub process
        proc = subprocess.Popen(['uglifyjs', tmp.name], stdout=subprocess.PIPE, shell=True)
        (uglified_js, err) = proc.communicate()
        if err == None:
            with open(minified_file_dir, 'w') as w:
                w.write(uglified_js)
                print ("Uglified file written...")

#Run everything you see above
main()
