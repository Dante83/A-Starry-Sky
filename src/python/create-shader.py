import os, time, re, yaml, copy

current_glsl_dir = []
current_js_dir = []
last_update_times_for_dir = {}

def ConvertGLSLToStringArray(glsl_string):
    leading_spaces_in_code = 2
    code_lines = glsl_string.splitlines()
    js_stringified_code = []
    for lineNumber, loc in enumerate(code_lines):
        if len(loc) >= 1:
            n_leading_spaces = len(loc) - len(loc.lstrip(' ')) + leading_spaces_in_code + 2
            if lineNumber == 0:
                js_stringified_code += [''] #Empty newline at start

            #Allows us to use ' in comments without breaking the code
            #Also allows the use of inline variable strings to program our shaders
            #on the fly.
            if bool(re.search('\$\{.*\}', loc)):
                js_stringified_code += [(' ' * n_leading_spaces) + "`" + loc.lstrip(' ') + "`,"]
            elif bool(re.search("'", loc)):
                js_stringified_code += [(' ' * n_leading_spaces) + '"' + loc.lstrip(' ') + '",']
            else:
                js_stringified_code += [(' ' * n_leading_spaces) + "'" + loc.lstrip(' ') + "',"]
        else:
            js_stringified_code += [loc]
    return '\r\n'.join(js_stringified_code)

def ParseShader(yaml_structure):
    #Reload a list of our file locations and write locations
    relative_template_path = '/'.join(current_js_dir) + '/' + yaml_structure['template'] if 'template' in yaml_structure else False
    relative_material_path = '/'.join(current_js_dir) + '/' + yaml_structure['material'] if 'material' in yaml_structure else False
    relative_vertex_path = '/'.join(current_glsl_dir) + '/' + yaml_structure['vertex'] if 'vertex' in yaml_structure else False
    relative_fragment_path = '/'.join(current_glsl_dir) + '/' + yaml_structure['fragment'] if 'fragment' in yaml_structure else False

    #Where is everything located? Give some relative paths that python can follow
    template_file = os.path.abspath(relative_template_path) if relative_template_path != False else False
    material_file = os.path.abspath(relative_material_path) if relative_material_path != False else False
    vertex_file = os.path.abspath(relative_vertex_path) if relative_vertex_path != False else False
    fragment_file = os.path.abspath(relative_fragment_path) if relative_fragment_path != False else False

    #Get times for last changed events
    is_first_template_iteration = False
    is_first_vertex_iteration = False
    is_first_shader_iteration = False
    if template_file != False:
        if template_file in last_update_times_for_dir:
            template_file_last_changed_at = last_update_times_for_dir[template_file]
        else:
            last_update_times_for_dir[template_file] = os.path.getmtime(template_file)
            template_file_last_changed_at = last_update_times_for_dir[template_file]
            is_first_template_iteration = True
    if vertex_file != False:
        if vertex_file in last_update_times_for_dir:
            vertex_file_last_changed_at = last_update_times_for_dir[vertex_file]
        else:
            last_update_times_for_dir[vertex_file] = os.path.getmtime(vertex_file)
            vertex_file_last_changed_at = last_update_times_for_dir[vertex_file]
            is_first_vertex_iteration = True
    if fragment_file != False:
        if fragment_file in last_update_times_for_dir:
            fragment_file_last_changed_at = last_update_times_for_dir[fragment_file]
        else:
            last_update_times_for_dir[fragment_file] = os.path.getmtime(fragment_file)
            fragment_file_last_changed_at = last_update_times_for_dir[fragment_file]
            is_first_shader_iteration = True

    changes_detected = False
    template_file_changed = False
    if template_file != False and (os.path.getmtime(template_file) != template_file_last_changed_at or is_first_template_iteration):
        changes_detected = True
        template_file_changed = True
        last_update_times_for_dir[template_file] = os.path.getmtime(template_file)

    #initialize our code strings
    if vertex_file != False and (os.path.getmtime(vertex_file) != vertex_file_last_changed_at or is_first_vertex_iteration):
        changes_detected = True
        last_update_times_for_dir[vertex_file] = os.path.getmtime(vertex_file)

    if fragment_file != False and (os.path.getmtime(fragment_file) != fragment_file_last_changed_at or is_first_shader_iteration):
        changes_detected = True
        last_update_times_for_dir[fragment_file] = os.path.getmtime(fragment_file)

    #If any changes were detected above, rewrite our shader JS file
    if changes_detected:
        #Initialize our variables
        update_vertex_file_code_string = ''
        update_fragment_file_code_string = ''
        js_stringified_vertex_code = ''
        js_stringified_fragment_code = ''
        template_string = ''

        #Load all our files as we are updating things
        if template_file != False:
            with open(template_file, 'r') as f:
                try:
                    template_string = f.read()
                except f.IOError as exc:
                    print(exc)
                    return 0

        if vertex_file != False:
            with open(vertex_file) as vf:
                try:
                    update_vertex_file_code_string = vf.read()
                except vf.IOError as exc:
                    print(exc)
                    return 0

        if fragment_file != False:
            with open(fragment_file) as ff:
                try:
                    update_fragment_file_code_string = ff.read()
                except ff.IOError as exc:
                    print(exc)
                    return 0

        #Clone the template string and modify it with the imported components
        with open(material_file, 'w') as w:
            material_code = template_string
            if vertex_file != False:
                js_stringified_vertex_code = ConvertGLSLToStringArray(update_vertex_file_code_string)
                material_code = re.sub('\s+\{vertex_glsl\}', js_stringified_vertex_code, material_code)
            if fragment_file != False:
                js_stringified_fragment_code = ConvertGLSLToStringArray(update_fragment_file_code_string)
                material_code = re.sub('\s+\{fragment_glsl\}', js_stringified_fragment_code, material_code)
            w.write(material_code)
            print("Shader JS File updated at: " + time.strftime('%H:%M %Y-%m-%d'))
            print("-"*15)

def NextAction(yaml_structure):
    delete_base_glsl_when_done = False
    delete_base_js_dir_when_done = False
    if 'base_glsl_dir' in yaml_structure:
        current_glsl_dir.append(yaml_structure['base_glsl_dir'])
        delete_base_glsl_when_done = True
    if 'base_js_dir' in yaml_structure:
        current_js_dir.append(yaml_structure['base_js_dir'])
        delete_base_js_dir_when_done = True
    if 'shaders' in yaml_structure:
        for shader in yaml_structure['shaders']:
            ParseShader(shader)
    if 'groups' in yaml_structure:
        for group in yaml_structure['groups']:
            NextAction(group)

    #Now that we are done, remove the above groupings from the shader directories
    if delete_base_glsl_when_done:
        del current_glsl_dir[-1]
    if delete_base_js_dir_when_done:
        del current_js_dir[-1]

def ShaderFileWatcher():
    #This should run forever, repeatedly creating our files from the updated structure every time
    while True:
        #Get the YAML file containing instructions for organizing our GLSL files
        with open("shader-file-structure.yaml", 'r') as stream:
            current_glsl_dir = []
            current_js_dir = []
            try:
                yaml_data = yaml.safe_load(stream)
                NextAction(yaml_data)
            except yaml.YAMLError as exc:
                print(exc)
        time.sleep(1)

#Run the main application! :D
ShaderFileWatcher()
