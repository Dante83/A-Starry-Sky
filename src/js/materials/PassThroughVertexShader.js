StarrySky.Materials.getPassThroughVertexShader(){
  return	"void main(){\n" +
      "	gl_Position = vec4( position, 1.0 );\n" +
      "}\n";
}
