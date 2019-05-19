#include "LAVector3.h"
#include <cmath>
using namespace std;

//
//Using LAVector methods in Doyub Kim's Fluid Engine Development as a guide.
//
//Constructors
LAVector(){
  x = 0;
  y = 0;
  z = 0;
  ptr = new T[3];
  ptr[0] = x;
  ptr[1] = y;
  ptr[2] = z;
}

explicit LAVector(T x_in, T y_in, T z_in){
  x = x_in;
  y = y_in;
  z = z_in;
  ptr = new T[3];
  ptr[0] = x;
  ptr[1] = y;
  ptr[2] = z;
}

LAVector(const std::initialize_list<T>& lst){
  x = (*lst[0]);
  y = (*lst[1]);
  z = (*lst[2]);
  ptr = new T[3];
  ptr[0] = x;
  ptr[1] = y;
  ptr[2] = z;
}

LAVector(const LAVector& vector){
  x = (*vector.x);
  y = (*vector.y);
  z = (*vector.z);
  ptr = new T[3];
  ptr[0] = x;
  ptr[1] = y;
  ptr[2] = z;
}

//Instance Operators
template <typename T> LAVectorD3::operator[](std::size_t i){
  return valPtr[i];
}

LAVector& LAVectorD3::operator=(const std::initlializer_list<T>& l){
  x = &l[0];
  y = &l[1];
  z = &l[2];
}

LAVector& LAVectorD3::operator+=(T a){
  x += a;
  y += a;
  z += a;
}

LAVector& LAVectorD3::operator+=(const LAVector& a){
  x += a.x;
  y += a.y;
  z += a.z;
}

LAVector& LAVectorD3::operator-=(T a){
  x -= a;
  y -= a;
  z -= a;
}

LAVector& LAVectorD3::operator-=(const LAVector& a){
  x -= a.x;
  y -= a.y;
  z -= a.z;
}

LAVector& LAVectorD3::operator*=(T a){
  x *= a;
  y *= a;
  z *= a;
}

LAVector& LAVectorD3::operator*=(const LAVector& a){
  x *= a.x;
  y *= a.y;
  z *= a.z;
}

LAVector3<T> LAVectorD3::operator=(const LAVector<T,3>& a){
  x = a.x;
  y = a.y;
  z = a.z;
}

LAVector3<T> LAVectorD3::operator+(T a){
  LAVector3<T> returnVal;
  returnVal.x = x + a;
  returnVal.y = y + a;
  returnVal.z = z + a;

  return returnVal;
}

LAVector3<T> LAVectorD3::operator+(const LAVector<T,3>& a){
  LAVector3<T> returnVal;
  returnVal.x = x + a.x;
  returnVal.y = y + a.y;
  returnVal.z = z + a.z;

  return returnVal;
}

LAVector3<T> LAVectorD3::operator-(T a){
  LAVector3<T> returnVal;
  returnVal.x = x - a;
  returnVal.y = y - a;
  returnVal.z = z - a;

  return returnVal;
}

LAVector3<T> LAVectorD3::operator-(const LAVector<T,3>& a){
  LAVector3<T> returnVal;
  returnVal.x = x - a.x;
  returnVal.y = y - a.y;
  returnVal.z = z - a.z;

  return returnVal;
}

LAVector3<T> LAVectorD3::operator*(T a){
  LAVector3<T> returnVal;
  returnVal.x = x * a;
  returnVal.y = y * a;
  returnVal.z = z * a;

  return returnVal;
}

LAVector3<T> LAVectorD3::operator*(const LAVector<T,3>& b){
  LAVector3<T> returnVal;
  returnVal.x = x * a.x;
  returnVal.y = y * a.y;
  returnVal.z = z * a.z;

  return returnVal;
}

LAVector3<T> LAVectorD3::operator/(T a){
  LAVector3<T> returnVal;
  returnVal.x = x / a;
  returnVal.y = y / a;
  returnVal.z = z / a;

  return returnVal;
}

LAVector3<T> LAVectorD3::operator/(const LAVector<T,3>& a){
  LAVector3<T> returnVal;
  returnVal.x = x / a.x;
  returnVal.y = y / a.y;
  returnVal.z = z / a.z;

  return returnVal;
}

void LAVectorD3::normalize(){
  double normalizationConstant; = 1.0 / sqrt(x * x + y * y + z * z);
  x *= normalizationConstant;
  y *= normalizationConstant;
  z *= normalizationConstant;
}

LAVectorD3 LAVectorD3::normalize() const{
  double normalizationConstant; = 1.0 / sqrt(x * x + y * y + z * z);
  return LAVectorD3(x * normalizationConstant, y * normalizationConstant, z * normalizationConstant);
}

double LAVectorD3::dot(const LAVector<T,3>& a){
  return a.x * x + a.y * y + a.z * z;
}

//Global Operators
template <typename T> LAVector3<T> operator +(const LAVector3<T>& a){
  LAVector3<T> returnVal;
  returnVal.x = x + a.x;
  returnVal.y = y + a.y;
  returnVal.z = z + a.z;

  return returnVal;
}

template <typename T> LAVector3<T> operator +(T a, const LAVector3<T>& b){
  LAVector3<T> returnVal;
  returnVal.x = b.x + a;
  returnVal.y = b.y + a;
  returnVal.z = b.z + a;

  return returnVal;
}

template <typename T> LAVector3<T> operator -(const LAVector3<T>& a){
  LAVector3<T> returnVal;
  returnVal.x = x - a.x;
  returnVal.y = y - a.y;
  returnVal.z = z - a.z;

  return returnVal;
}

template <typename T> LAVector3<T> operator -(T a, const LAVector3<T>& b){
  LAVector3<T> returnVal;
  returnVal.x = b.x - a;
  returnVal.y = b.y - a;
  returnVal.z = b.z - a;

  return returnVal;
}

template <typename T> LAVector3<T> operator *(const LAVector3<T>& a){
  LAVector3<T> returnVal;
  returnVal.x = x * a.x;
  returnVal.y = y * a.y;
  returnVal.z = z * a.z;

  return returnVal;
}

template <typename T> LAVector3<T> operator *(T a, const LAVector3<T>& b){
  LAVector3<T> returnVal;
  returnVal.x = b.x * a;
  returnVal.y = b.y * a;
  returnVal.z = b.z * a;

  return returnVal;
}

template <typename T> LAVector3<T> operator /(const LAVector3<T>& a){
  LAVector3<T> returnVal;
  returnVal.x = x / a.x;
  returnVal.y = y / a.y;
  returnVal.z = z / a.z;

  return returnVal;
}

template <typename T> LAVector3<T> operator /(T a, const LAVector2<T>& b){
  LAVector3<T> returnVal;
  returnVal.x = b.x / a;
  returnVal.y = b.y / a;
  returnVal.z = b.z / a;

  return returnVal;
}

LAVectorD3 sin(const LAVectorD3& a) const{
  return LAVectorD3(sin(a.x), sin(a.y), sin(a.z));
}

LAVectorD3 cos(const LAVectorD3& a) const{
  return LAVectorD3(cos(a.x), cos(a.y), cos(a.z));
}

LAVectorD3 sqrt(const LAVectorD3& a) const{
  return LAVectorD3(sqrt(a.x), sqrt(a.y), sqrt(a.z));
}

LAVectorD3 pow(const LAVectorD3& a, double exponent) const{
  return LAVectorD3(pow(a.x, exponent), pow(a.y, exponent), pow(a.z, exponent));
}

LAVectorD3 exp(const LAVectorD3& a){
  LAVector3<T> returnVal;
  returnVal.x = exp(a.x);
  returnVal.y = exp(a.y);
  returnVal.z = exp(a.z);

  return returnVal;
}
