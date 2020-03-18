import os, time, re

##
# Using the VSOP87B files from
# ftp://cdsarc.u-strasbg.fr/pub/cats/VI/81
# To run, download these files, and rename them to extension .txt post fixed with the planet name, like VSOP87B_Venus.txt
##

def is_number(string_val):
    try:
        test_val = int(string_val)
    except ValueError:
        return False
    return True

def createDataCombinerCodeBlock(type, num_coeficients, finalVariableName):
    combined_code = 'double julianCenturyMultiple = 1.0;\n'
    combined_code = combined_code + 'double {}Values[{}] = {{{}}};\n'.format(type, num_coeficients, ', '.join(['{}{}'.format(type, i) for i in xrange(num_coeficients)]))
    combined_code = combined_code + '{} = 0.0;\n'.format(finalVariableName);
    combined_code = combined_code + 'for(int i = 0; i < {}; ++i){{\n'.format(num_coeficients)
    combined_code = combined_code + '  {} += {}Values[i] * julianCenturyMultiple;\n'.format(finalVariableName, type)
    combined_code = combined_code + '  julianCenturyMultiple *= astroTime->julianCentury;\n}\n'
    combined_code = combined_code + '{0} = {0} / 1.0e-8;'.format(finalVariableName)
    return combined_code

def createCommaListWithNewlineEveryNthTerm(data_set):
    values = []

    #Start off with 25 characters as the first line has the variable declaration
    number_of_chars_in_line = 25
    for i, datum in enumerate(data_set):
        #Allow a maximum of about 75 characters in a line before starting a new line
        is_new_line = False
        if number_of_chars_in_line > 75:
            values += ['\n']
            number_of_chars_in_line = 0
        if (i + 1) != len(data_set):
            values += [str(datum) + ', ']
        else:
            values += [str(datum)]
        number_of_chars_in_line += len(str(datum)) + 2
    return values

def createArrayCodeBlock(vsop_data_sets, planets, i, type):
    num_coeficients = 0
    code_block = ''
    for i, data_set in enumerate(vsop_data_sets[planets[i]][type]):
        number_of_a_values = len(data_set['a'])
        a_values = createCommaListWithNewlineEveryNthTerm(data_set['a'])
        if(number_of_a_values > 0):
            variable_a = ''
            is_list = True
            if(number_of_a_values > 1):
                variable_a = 'const double {}_{}_A[{}] = {{{}}};\n'.format(type, i, number_of_a_values, ''.join(a_values))
            else:
                is_list = False
                variable_a = 'const double {}_{}_A = {};\n'.format(type, i, data_set['a'][0])

            number_of_b_values = len(data_set['b'])
            b_values = createCommaListWithNewlineEveryNthTerm(data_set['b'])
            variable_b = ''
            if(is_list):
                variable_b = 'const double {}_{}_B[{}] = {{{}}};\n'.format(type, i, number_of_b_values, ''.join(b_values))
            else:
                variable_b = 'const double {}_{}_B = {};\n'.format(type, i, data_set['b'][0])

            number_of_c_values = len(data_set['c'])
            c_values = createCommaListWithNewlineEveryNthTerm(data_set['c'])
            variable_c = ''
            if(is_list):
                variable_c = 'const double {}_{}_C[{}] = {{{}}};\n'.format(type, i, number_of_c_values, ''.join(c_values))
            else:
                variable_c = 'const double {}_{}_B = {};\n'.format(type, i, data_set['c'][0])

            if(is_list):
                code_block = code_block + variable_a + variable_b + variable_c;
                code_block = code_block + '\ndouble {}{} = 0.0;\n'.format(type, i)
                code_block = code_block + 'for(int i = 0; i < {}; ++i){{\n'.format(len(a_values))
                code_block = code_block + '  {0}{1} += {0}_{1}_A[i] * cos({0}_{1}_B[i] + {0}_{1}_C[i] * astroTime->julianCentury);\n}}\n\n'.format(type, i)
            else:
                code_block = code_block + variable_a + variable_b + variable_c;
                code_block = code_block + '{0}{1} = {0}_{1}_A * cos({0}_{1}_B + {0}_{1}_C * astroTime->julianCentury);\n\n'.format(type, i)
            num_coeficients += 1

    if type == 'L':
        code_block = '{}{}'.format(code_block, createDataCombinerCodeBlock(type, num_coeficients - 1, 'eclipticalLongitude'))
    elif type == 'B':
        code_block = '{}{}'.format(code_block, createDataCombinerCodeBlock(type, num_coeficients - 1, 'eclipticalLatitude'))
    elif type == 'R':
        code_block = '{}{}'.format(code_block, createDataCombinerCodeBlock(type, num_coeficients - 1, 'radiusVector'))
    else:
        print 'Invalid type {}'.format(type)
    return code_block

def createCPPArrays():
    #Get all of our file names
    planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn']
    vsop_data_set_file_names = ['VSOP87B_' + planet + '.txt' for planet in planets]
    vsop_data_sets = {}

    for i, file_name in enumerate(vsop_data_set_file_names):
        #Inform the user of the current state of the program
        print ('Planet: {}'.format(planets[i]))
        print ('-'*8)

        #Prepare a new data set for the new file
        vsop_data_sets[planets[i]] = {'L': [], 'B': [], 'R': []}
        current_data_set = None
        max_samples = 0
        sample_count = 0

        #Scan through all lines in the file
        with open(os.path.abspath(file_name), "r") as vsop_reader:
            data_line = vsop_reader.readline()
            data_set_index = None
            while data_line:
                data_line = re.sub('\s+', ' ', data_line)
                data_array = data_line.split()

                if data_array[0] == 'VSOP87':
                    #New data set!
                    if(int(data_array[5]) == 1):
                        data_set_index = 0 if current_data_set != 'L' else (data_set_index + 1)
                        current_data_set = 'L'
                    elif(int(data_array[5]) == 2):
                        data_set_index = 0 if current_data_set != 'B' else (data_set_index + 1)
                        current_data_set = 'B'
                    elif(int(data_array[5]) == 3):
                        data_set_index = 0 if current_data_set != 'R' else (data_set_index + 1)
                        current_data_set = 'R'
                    else:
                        data_set_index = 0
                        current_data_set = 'Error'
                        print 'Warning, this is an invalid variable.'
                        print data_line
                    sample_count = 0
                    max_samples = int(raw_input("Enter the number of rows for {}_{} : ".format(current_data_set, data_set_index)))
                    max_samples_in_vsop = int(data_array[-8])
                    max_samples = max_samples if max_samples_in_vsop > max_samples else max_samples_in_vsop
                    vsop_data_sets[planets[i]][current_data_set].append([]);
                    vsop_data_sets[planets[i]][current_data_set][data_set_index] = {'a': [], 'b': [], 'c': []}
                elif (is_number(data_array[0]) and sample_count < max_samples):
                    #Add a data line to our collection
                    vsop_data_sets[planets[i]][current_data_set][data_set_index]['a'] += [float(data_array[-3]) * 1E8]
                    vsop_data_sets[planets[i]][current_data_set][data_set_index]['b'] += [float(data_array[-2])]
                    vsop_data_sets[planets[i]][current_data_set][data_set_index]['c'] += [float(data_array[-1])]
                    sample_count += 1
                data_line = vsop_reader.readline()

    #Now create all of our new text files
    for i, file_name in enumerate(vsop_data_set_file_names):
        #L Method
        code_block = createArrayCodeBlock(vsop_data_sets, planets, i, 'L');
        L_code = 'void {}::updateEclipticalLongitude(){{\n{}\n}}'.format(planets[i], code_block)

        #B Method
        code_block = createArrayCodeBlock(vsop_data_sets, planets, i, 'B');
        B_code = 'void {}::updateEclipticalLatitude(){{\n{}\n}}'.format(planets[i], code_block)

        #R Method
        code_block = createArrayCodeBlock(vsop_data_sets, planets, i, 'R');
        R_code = 'void {}::updateRadiusVector(){{\n{}\n}}'.format(planets[i], code_block)

        #Combined Code
        combined_code = '{}\n\n{}\n\n{}'.format(L_code, B_code, R_code)

        #Write this code to a new file
        cpp_fragment_file_name = '{}_cpp_fragment.tmp'.format(planets[i])
        with open(os.path.abspath(cpp_fragment_file_name), "w+") as cpp_fragment_writer:
            cpp_fragment_writer.write(combined_code)
            print ("Shader CPP Fragment File for the planet {} created at: ".format(planets[i]) + time.strftime('%H:%M %Y-%m-%d'))

if __name__ == '__main__':
    createCPPArrays()
