import os, time

cpp_directories = ['../cpp/state-engine/', '../cpp/interpolation-engine/']
cpp_files = [['SkyState.cpp',\
 'world_state/AstroTime.cpp',\
 'world_state/Location.cpp',\
 'astro_bodies/SkyManager.cpp',\
 'astro_bodies/AstronomicalBody.cpp',\
 'astro_bodies/Sun.cpp',\
 'astro_bodies/Moon.cpp',\
 'astro_bodies/Planet.cpp',\
 'astro_bodies/planets/Earth.cpp',\
 'astro_bodies/OtherPlanet.cpp',\
 'astro_bodies/planets/Mercury.cpp',\
 'astro_bodies/planets/Venus.cpp',\
 'astro_bodies/planets/Mars.cpp',\
 'astro_bodies/planets/Jupiter.cpp',\
 'astro_bodies/planets/Saturn.cpp'],\
 ['SkyInterpolator.cpp']]
module_file = ['state-engine.js', 'interpolation-engine.js']
exported_functions = [['_main', '_setupSky', '_updateSky'],\
['_main', '_initialize', '_updateFinalValues', '_updateTimeData', '_tick', '_setSunAndMoonTimeTo']]
cpp_update_date = {}

def recursivelyWalkDirectories(absolute_cpp_directory, file_check_callback):
    for root, dirs, files in os.walk(absolute_cpp_directory):
        for file in files:
            call_back_status = file_check_callback(root, file)
            if call_back_status:
                return True
        for dir in dirs:
            call_back_status = recursivelyWalkDirectories('{}/{}'.format(absolute_cpp_directory, dir), file_check_callback)
            if call_back_status:
                return True
    return False

for i, cpp_directory in enumerate(cpp_directories):
    absolute_cpp_directory = os.path.abspath(cpp_directory)
    def intializeFileUpdateTimes(root, file):
        if file.endswith('.h') or file.endswith('.cpp'):
            cpp_update_date[file] = os.path.getmtime('{}/{}'.format(root, file))
        #Never break on this
        return False
    recursivelyWalkDirectories(absolute_cpp_directory, intializeFileUpdateTimes)

def CPPWatcher():
    #This should run forever, repeatedly creating our files from the updated structure every time
    for i, cpp_directory in enumerate(cpp_directories):
        os.system('clear')
        os.chdir(cpp_directory)
        os.system("emcc {} -s WASM=1 -s EXPORTED_FUNCTIONS='[{}]' -o {} -s ALLOW_MEMORY_GROWTH=1;".format(' '.join(cpp_files[i]), ', '.join(exported_functions[i]), module_file[i]))
        os.chdir('../../python')
    print 'Watching for updates...'

    #Watch loop
    while True:
        break_loops = True
        for i, cpp_directory in enumerate(cpp_directories):
            absolute_cpp_directory = os.path.abspath(cpp_directory)
            def checkForUpdates(root, file):
                #Only check cpp and header files and determine if the file had an update
                absolute_file_path = '{}/{}'.format(root, file)
                if (file.endswith('.h') or file.endswith('.cpp')) and (cpp_update_date[file] < os.path.getmtime(absolute_file_path)):
                    os.system('clear')
                    print 'Change found in file {}, updating.'.format(file)
                    cpp_update_date[file] = os.path.getmtime(absolute_file_path)
                    os.chdir(cpp_directory)
                    os.system("emcc {} -s WASM=1 -s EXPORTED_FUNCTIONS='[{}]' -o {} -s ALLOW_MEMORY_GROWTH=1;".format(' '.join(cpp_files[i]), ', '.join(exported_functions[i]), module_file[i]))
                    os.chdir('../../python')
                    print "WASM update at: {}".format(time.strftime('%H:%M %Y-%m-%d'))
                    print "-"*15
                    return True
                return False

            #Update our file list and check for any changes to any of our files
            recursivelyWalkDirectories(absolute_cpp_directory, checkForUpdates)

        #And we only do this every five seconds because this is a little more costly
        time.sleep(1)

#Run the main application! :D
CPPWatcher()
