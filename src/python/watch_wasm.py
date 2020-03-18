import os, time

cpp_directories = ['../cpp/sky-state-controller/']
main_cpp_file = ['SkyState.cpp']
module_file = ['starry-sky-module.js']
cpp_update_date = {}

def recursivelyWalkDirectories(absolute_cpp_directory, file_check_callback):
    for root, dirs, files in os.walk(absolute_cpp_directory):
        for file in files:
            should_break = file_check_callback(root, file)
            if should_break:
                return True
        for dir in dirs:
            should_break = recursivelyWalkDirectories('{}/{}'.format(absolute_cpp_directory, dir), file_check_callback)
    return False

for cpp_directory in cpp_directories:
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
        os.system('emcc {} -s WASM=1 -s -o {} -s ALLOW_MEMORY_GROWTH=1;'.format(main_cpp_file[i], module_file[i]))
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
                    os.system('emcc {} -s WASM=1 -s -o {} -s ALLOW_MEMORY_GROWTH=1;'.format(main_cpp_file[i], module_file[i]))
                    os.chdir('../../python')
                    print "WASM update at: {}".format(time.strftime('%H:%M %Y-%m-%d'))
                    print "-"*15
                    return True
                return False
            recursivelyWalkDirectories(absolute_cpp_directory, checkForUpdates)

        #And we only do this every five seconds because this is a little more costly
        time.sleep(5)

#Run the main application! :D
CPPWatcher()
