import os, time, re

def ShaderFileWatcher():
    #Where is everything located? Give some relative paths that python can follow
    sky_shader_template_name = os.path.abspath("sky_shader_template.txt")
    sky_shader_file_name = os.path.abspath("../js/sky-shader.js")
    sky_shader_vertex_file = os.path.abspath("../glsl/sky_vertex.glsl")
    sky_shader_fragment_file = os.path.abspath("../glsl/sky_fragment.glsl")

    moon_shader_template_name = os.path.abspath("moon_shader_template.txt")
    moon_shader_file_name = os.path.abspath("../js/moon-shader.js")
    moon_shader_vertex_file = os.path.abspath("../glsl/moon_vertex.glsl")
    moon_shader_fragment_file = os.path.abspath("../glsl/moon_fragment.glsl")

    template_names = [sky_shader_template_name, moon_shader_template_name]
    file_names = [sky_shader_file_name, moon_shader_file_name]
    vertex_files = [sky_shader_vertex_file, moon_shader_vertex_file]
    fragment_files = [sky_shader_fragment_file, moon_shader_fragment_file]

    previousVertexFileChangeDates = [None, None]
    previousFragmentFileChangeDates = [None, None]
    previousTemplateFileChangeDates = [None, None]
    leadingSpacesBeforeFragmentShaderCode = 2
    leadingSpacesBeforeVertextShaderCode = 2

    #Initialize our template for usage - we're gonna need this one no matter what gets updated
    leadingSpacesBeforeVertextShaderCodeStrings = ['', '']
    updatedVertexFileCodeStrings = ['', '']
    updatedFragmentFileCodeStrings = ['', '']

    for i in xrange(2):
        template_name = template_names[i]
        with open(template_name, 'r') as f:
            templateString = f.read()
        for loc in templateString:
            if "\{vertex_glsl\}" in loc:
                 leadingSpacesBeforeVertextShaderCodeStrings[i] = len(loc) - len(loc.lstrip(' '))
            elif "\{vertex_glsl\}" in loc:
                leadingSpacesBeforeVertextShaderCodeStrings[i] = len(loc) - len(loc.lstrip(' '))

        #initialize our code strings
        vertex_file = vertex_files[i]
        updatedVertexFileCode = ""
        with open(vertex_file) as vf:
            updatedVertexFileCodeStrings[i] = vf.read()

        fragment_file = fragment_files[i]
        updatedFragmentFileCode = ""
        with open(fragment_file) as ff:
            updatedFragmentFileCodeStrings[i] = ff.read()

    #Endless while loop - exit via ctrl-pause/break... It's just above that numpad block on your keyboard. You're welcome ^_^.
    while 1:
        #Do this every 1 seconds
        time.sleep(1)

        #For each of our shaders
        for i in xrange(2):
            #Prepare for this iteration
            vertex_file = vertex_files[i]
            fragment_file = fragment_files[i]
            template_name = template_names[i]
            file_name = file_names[i]
            previousVertexFileChangeDate = previousVertexFileChangeDates[i]
            previousFragmentFileChangeDate = previousFragmentFileChangeDates[i]
            previousTemplateFileChangeDate = previousTemplateFileChangeDates[i]

            #Check for changes
            vertexFileLastChangedAt = os.path.getmtime(vertex_file)
            fragmentFileLastChangedAt = os.path.getmtime(fragment_file)
            templateFileLastChangedAt = os.path.getmtime(template_name)

            # Check if any files changed, and if so, update our output js shader file
            if (previousVertexFileChangeDate != vertexFileLastChangedAt) or (previousFragmentFileChangeDate != fragmentFileLastChangedAt) or (previousTemplateFileChangeDate != templateFileLastChangedAt):
                #Get the current time...
                time.ctime()

                #
                #Check if our vertex shader file was the changer - is so, update the internal values associated with this
                #
                if (previousVertexFileChangeDate != vertexFileLastChangedAt):
                    print "Vertex File Change Detected"
                    previousVertexFileChangeDates[i] = vertexFileLastChangedAt
                    with open(vertex_file) as vf:
                        updatedVertexFileCode = vf.read()
                #
                #Check if our fragment shader file was the changer - is so, update the internal values associated with this
                #
                if (previousFragmentFileChangeDate != fragmentFileLastChangedAt):
                    print "Fragment File Change Detected"
                    previousFragmentFileChangeDates[i] = fragmentFileLastChangedAt
                    with open(fragment_file) as ff:
                        updatedFragmentFileCode = ff.read()

                #
                #Check if our template file was the changer - is so, update the internal values associated with this
                #
                if (previousTemplateFileChangeDate != templateFileLastChangedAt):
                    print "Template file change detected."
                    previousTemplateFileChangeDates[i] = templateFileLastChangedAt

                    with open(template_name, 'r') as f:
                        templateString = f.read()
                    for loc in templateString:
                        if "\{vertex_glsl\}" in loc:
                             leadingSpacesBeforeVertextShaderCode = len(loc) - len(loc.lstrip(' '))
                        elif "\{vertex_glsl\}" in loc:
                            leadingSpacesBeforeFragmentShaderCode = len(loc) - len(loc.lstrip(' '))

                codeLines = updatedVertexFileCode.splitlines()
                jsStringifiedVertexLinesOfCode = []
                for lineNumber, loc in enumerate(codeLines):
                    if len(loc) >= 1:
                        nLeadingSpaces = len(loc) - len(loc.lstrip(' ')) + leadingSpacesBeforeVertextShaderCode + 2
                        if lineNumber == 0:
                            jsStringifiedVertexLinesOfCode += [''] #Empty newline at start
                        jsStringifiedVertexLinesOfCode += [(' ' * nLeadingSpaces) + "'" + loc.lstrip(' ') + "',"]
                    else:
                        jsStringifiedVertexLinesOfCode += [loc]
                jsStringifiedVertexCode = '\r\n'.join(jsStringifiedVertexLinesOfCode)

                codeLines = updatedFragmentFileCode.splitlines()
                jsStringifiedFragmentLinesOfCode = []
                for lineNumber, loc in enumerate(codeLines):
                    if len(loc) >= 1:
                        nLeadingSpaces = len(loc) - len(loc.lstrip(' ')) + leadingSpacesBeforeFragmentShaderCode + 2
                        if lineNumber == 0:
                            jsStringifiedFragmentLinesOfCode += [''] #Empty newline at start
                        jsStringifiedFragmentLinesOfCode += [(' ' * nLeadingSpaces) + "'" + loc.lstrip(' ') + "',"]
                    else:
                        jsStringifiedFragmentLinesOfCode += [loc]
                jsStringifiedFragmentCode = '\r\n'.join(jsStringifiedFragmentLinesOfCode)

                #Clone the template string and modify it with the imported components
                shader_js_code = templateString
                shader_js_code = re.sub('\s+\{vertex_glsl\}', jsStringifiedVertexCode, shader_js_code)
                shader_js_code = re.sub('\s+\{fragment_glsl\}', jsStringifiedFragmentCode, shader_js_code)
                with open(file_name, 'w') as w:
                    w.write(shader_js_code)
                    print ("Shader JS File updated at: " + time.strftime('%H:%M %Y-%m-%d'))
                    print "-"*15

#Run the main application! :D
ShaderFileWatcher()
