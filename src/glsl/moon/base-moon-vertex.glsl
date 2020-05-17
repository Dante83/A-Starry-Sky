attribute vec4 tangent;

uniform float radiusOfMoonPlane;
uniform mat4 worldMatrix;
uniform vec3 sunLightDirection;

varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 tangentSpaceSunLightDirection;
varying vec3 tangentSpaceViewDirection;
varying mat3 TBNMatrix;

void main() {
  vec4 worldPosition = worldMatrix * vec4(position * radiusOfMoonPlane, 1.0);
  vec3 normalizedWorldPosition = normalize(worldPosition.xyz);
  vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);
  vUv = uv;

  //Other then our bitangent, all of our other values are already normalized
  vec3 bitangent = normalize((tangent.w * cross(normal, tangent.xyz)));
  vec3 cameraSpaceTangent = (worldMatrix * vec4(tangent.xyz, 0.0)).xyz;
  vec3 b = (worldMatrix * vec4(bitangent.xyz, 0.0)).xyz;
  vec3 n = (worldMatrix * vec4(normal.xyz, 0.0)).xyz;

  //There is no matrix transpose, so we will do this ourselves
  TBNMatrix = mat3(vec3(cameraSpaceTangent.x, b.x, n.x), vec3(cameraSpaceTangent.y, b.y, n.y), vec3(cameraSpaceTangent.z, b.z, n.z));
  tangentSpaceSunLightDirection = normalize(TBNMatrix * sunLightDirection);
  tangentSpaceViewDirection = normalize(TBNMatrix * -normalizedWorldPosition);

  gl_Position = vec4(position, 1.0);
}
