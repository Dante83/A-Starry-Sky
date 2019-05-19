#include "Vector3.h"
#include <cmath>

//
//Using Vector methods in Doyub Kim's Fluid Engine Development as a guide.
//
//Constructors
Vector(){
  x = 0;
  y = 0;
  z = 0;
  ptr = new T[3];
  ptr[0] = x;
  ptr[1] = y;
  ptr[2] = z;
}

explicit Vector(T x_in, T y_in, T z_in){
  x = x_in;
  y = y_in;
  z = z_in;
  ptr = new T[3];
  ptr[0] = x;
  ptr[1] = y;
  ptr[2] = z;
}

Vector(const std::initialize_list<T>& lst){
  x = (*lst[0]);
  y = (*lst[1]);
  z = (*lst[2]);
  ptr = new T[3];
  ptr[0] = x;
  ptr[1] = y;
  ptr[2] = z;
}

Vector(const Vector& vector){
  x = (*vector.x);
  y = (*vector.y);
  z = (*vector.z);
  ptr = new T[3];
  ptr[0] = x;
  ptr[1] = y;
  ptr[2] = z;
}

//Instance Operators
template <typename T> VectorD3::operator[](std::size_t i){
  return valPtr[i];
}

Vector& VectorD3::operator=(const std::initlializer_list<T>& l){
  x = &l[0];
  y = &l[1];
  z = &l[2];
}

Vector& VectorD3::operator+=(T a){
  x += a;
  y += a;
  z += a;
}

Vector& VectorD3::operator+=(const Vector& a){
  x += a.x;
  y += a.y;
  z += a.z;
}

Vector& VectorD3::operator-=(T a){
  x -= a;
  y -= a;
  z -= a;
}

Vector& VectorD3::operator-=(const Vector& a){
  x -= a.x;
  y -= a.y;
  z -= a.z;
}

Vector& VectorD3::operator*=(T a){
  x *= a;
  y *= a;
  z *= a;
}

Vector& VectorD3::operator*=(const Vector& a){
  x *= a.x;
  y *= a.y;
  z *= a.z;
}

Vector3<T> VectorD3::operator=(const Vector<T,3>& a){
  x = a.x;
  y = a.y;
  z = a.z;
}

Vector3<T> VectorD3::operator+(T a){
  Vector3<T> returnVal;
  returnVal.x = x + a;
  returnVal.y = y + a;
  returnVal.z = z + a;

  return returnVal;
}

Vector3<T> VectorD3::operator+(const Vector<T,3>& a){
  Vector3<T> returnVal;
  returnVal.x = x + a.x;
  returnVal.y = y + a.y;
  returnVal.z = z + a.z;

  return returnVal;
}

Vector3<T> VectorD3::operator-(T a){
  Vector3<T> returnVal;
  returnVal.x = x - a;
  returnVal.y = y - a;
  returnVal.z = z - a;

  return returnVal;
}

Vector3<T> VectorD3::operator-(const Vector<T,3>& a){
  Vector3<T> returnVal;
  returnVal.x = x - a.x;
  returnVal.y = y - a.y;
  returnVal.z = z - a.z;

  return returnVal;
}

Vector3<T> VectorD3::operator*(T a){
  Vector3<T> returnVal;
  returnVal.x = x * a;
  returnVal.y = y * a;
  returnVal.z = z * a;

  return returnVal;
}

Vector3<T> VectorD3::operator*(const Vector<T,3>& b){
  Vector3<T> returnVal;
  returnVal.x = x * a.x;
  returnVal.y = y * a.y;
  returnVal.z = z * a.z;

  return returnVal;
}

Vector3<T> VectorD3::operator/(T a){
  Vector3<T> returnVal;
  returnVal.x = x / a;
  returnVal.y = y / a;
  returnVal.z = z / a;

  return returnVal;
}

Vector3<T> VectorD3::operator/(const Vector<T,3>& a){
  Vector3<T> returnVal;
  returnVal.x = x / a.x;
  returnVal.y = y / a.y;
  returnVal.z = z / a.z;

  return returnVal;
}

void VectorD3::normalize(){
  double normalizationConstant; = 1.0 / sqrt(x * x + y * y + z * z);
  x *= normalizationConstant;
  y *= normalizationConstant;
  z *= normalizationConstant;
}

VectorD3 VectorD3::normalize() const{
  double normalizationConstant; = 1.0 / sqrt(x * x + y * y + z * z);
  return VectorD3(x * normalizationConstant, y * normalizationConstant, z * normalizationConstant);
}

double VectorD3::dot(const Vector<T,3>& a){
  return a.x * x + a.y * y + a.z * z;
}

//Global Operators
template <typename T> Vector3<T> operator +(const Vector3<T>& a){
  Vector3<T> returnVal;
  returnVal.x = x + a.x;
  returnVal.y = y + a.y;
  returnVal.z = z + a.z;

  return returnVal;
}

template <typename T> Vector3<T> operator +(T a, const Vector3<T>& b){
  Vector3<T> returnVal;
  returnVal.x = b.x + a;
  returnVal.y = b.y + a;
  returnVal.z = b.z + a;

  return returnVal;
}

template <typename T> Vector3<T> operator -(const Vector3<T>& a){
  Vector3<T> returnVal;
  returnVal.x = x - a.x;
  returnVal.y = y - a.y;
  returnVal.z = z - a.z;

  return returnVal;
}

template <typename T> Vector3<T> operator -(T a, const Vector3<T>& b){
  Vector3<T> returnVal;
  returnVal.x = b.x - a;
  returnVal.y = b.y - a;
  returnVal.z = b.z - a;

  return returnVal;
}

template <typename T> Vector3<T> operator *(const Vector3<T>& a){
  Vector3<T> returnVal;
  returnVal.x = x * a.x;
  returnVal.y = y * a.y;
  returnVal.z = z * a.z;

  return returnVal;
}

template <typename T> Vector3<T> operator *(T a, const Vector3<T>& b){
  Vector3<T> returnVal;
  returnVal.x = b.x * a;
  returnVal.y = b.y * a;
  returnVal.z = b.z * a;

  return returnVal;
}

template <typename T> Vector3<T> operator /(const Vector3<T>& a){
  Vector3<T> returnVal;
  returnVal.x = x / a.x;
  returnVal.y = y / a.y;
  returnVal.z = z / a.z;

  return returnVal;
}

template <typename T> Vector3<T> operator /(T a, const Vector2<T>& b){
  Vector3<T> returnVal;
  returnVal.x = b.x / a;
  returnVal.y = b.y / a;
  returnVal.z = b.z / a;

  return returnVal;
}

VectorD3 sin(const VectorD3& a) const{
  return VectorD3(sin(a.x), sin(a.y), sin(a.z));
}

VectorD3 cos(const VectorD3& a) const{
  return VectorD3(cos(a.x), cos(a.y), cos(a.z));
}

VectorD3 sqrt(const VectorD3& a) const{
  return VectorD3(sqrt(a.x), sqrt(a.y), sqrt(a.z));
}

VectorD3 pow(const VectorD3& a, double exponent) const{
  return VectorD3(pow(a.x, exponent), pow(a.y, exponent), pow(a.z, exponent));
}

VectorD3 exp(const VectorD3& a){
  Vector3<T> returnVal;
  returnVal.x = exp(a.x);
  returnVal.y = exp(a.y);
  returnVal.z = exp(a.z);

  return returnVal;
}
