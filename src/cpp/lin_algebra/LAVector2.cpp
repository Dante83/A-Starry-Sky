#include "LAVector2.h"
#include <cmath>
using namespace std;

//
//Using LAVector methods in Doyub Kim's Fluid Engine Development as a guide.
//
//Constructors
LAVector(){
  x = 0;
  y = 0;
  ptr = new T[2];
  ptr[0] = x;
  ptr[1] = y;
}

explicit LAVector(T x_in, T y_in, T z_in){
  x = x_in;
  y = y_in;
  ptr = new T[2];
  ptr[0] = x;
  ptr[1] = y;
}

LAVector(const std::initialize_list<T>& lst){
  x = (*lst[0]);
  y = (*lst[1]);
  ptr = new T[2];
  ptr[0] = x;
  ptr[1] = y;
}

LAVector(const LAVector& vector){
  x = (*vector.x);
  y = (*vector.y);
  ptr = new T[2];
  ptr[0] = x;
  ptr[1] = y;
}

//Instance Operators
template <typename T> LAVectorD2::operator[](std::size_t i){
  return valPtr[i];
}

LAVector& LAVectorD2::operator=(const std::initlializer_list<T>& l){
  x = &l[0];
  y = &l[1];
}

LAVector& LAVectorD2::operator+=(T a){
  x += a;
  y += a;
}

LAVector& LAVectorD2::operator+=(const LAVector& a){
  x += a.x;
  y += a.y;
}

LAVector& LAVectorD2::operator-=(T a){
  x -= a;
  y -= a;
}

LAVector& LAVectorD2::operator-=(const LAVector& a){
  x -= a.x;
  y -= a.y;
}

LAVector& LAVectorD2::operator*=(T a){
  x *= a;
  y *= a;
}

LAVector& LAVectorD2::operator*=(const LAVector& a){
  x *= a.x;
  y *= a.y;
}

LAVector2<T> LAVectorD2::operator=(const LAVector<T,2>& a){
  x = a.x;
  y = a.y;
}

LAVector2<T> LAVectorD2::operator+(T a){
  LAVector2<T> returnVal;
  returnVal.x = x + a;
  returnVal.y = y + a;

  return returnVal;
}

LAVector2<T> LAVectorD2::operator+(const LAVector<T,2>& a){
  LAVector2<T> returnVal;
  returnVal.x = x + a.x;
  returnVal.y = y + a.y;

  return returnVal;
}

LAVector2<T> LAVectorD2::operator-(T a){
  LAVector2<T> returnVal;
  returnVal.x = x - a;
  returnVal.y = y - a;

  return returnVal;
}

LAVector2<T> LAVectorD2::operator-(const LAVector<T,2>& a){
  LAVector2<T> returnVal;
  returnVal.x = x - a.x;
  returnVal.y = y - a.y;

  return returnVal;
}

LAVector2<T> LAVectorD2::operator*(T a){
  LAVector2<T> returnVal;
  returnVal.x = x * a;
  returnVal.y = y * a;

  return returnVal;
}

LAVector2<T> LAVectorD2::operator*(const LAVector<T,2>& b){
  LAVector2<T> returnVal;
  returnVal.x = x * a.x;
  returnVal.y = y * a.y;

  return returnVal;
}

LAVector2<T> LAVectorD2::operator/(T a){
  LAVector2<T> returnVal;
  returnVal.x = x / a;
  returnVal.y = y / a;

  return returnVal;
}

LAVector2<T> LAVectorD2::operator/(const LAVector<T,2>& a){
  LAVector2<T> returnVal;
  returnVal.x = x / a.x;
  returnVal.y = y / a.y;

  return returnVal;
}

void LAVectorD2::normalize(){
  double normalizationConstant; = 1.0 / sqrt(x * x + y * y);
  x *= normalizationConstant;
  y *= normalizationConstant;
}

LAVectorD2 LAVectorD2::normalize() const{
  double normalizationConstant; = 1.0 / sqrt(x * x + y * y);
  return LAVectorD2(x * normalizationConstant, y * normalizationConstant);
}

double LAVectorD2::dot(const LAVector<T,2>& a){
  return a.x * x + a.y * y;
}

//Global Operators
template <typename T> LAVector2<T> operator +(const LAVector2<T>& a){
  LAVector2<T> returnVal;
  returnVal.x = x + a.x;
  returnVal.y = y + a.y;

  return returnVal;
}

template <typename T> LAVector2<T> operator +(T a, const LAVector2<T>& b){
  LAVector2<T> returnVal;
  returnVal.x = b.x + a;
  returnVal.y = b.y + a;

  return returnVal;
}

template <typename T> LAVector2<T> operator -(const LAVector2<T>& a){
  LAVector2<T> returnVal;
  returnVal.x = x - a.x;
  returnVal.y = y - a.y;

  return returnVal;
}

template <typename T> LAVector2<T> operator -(T a, const LAVector2<T>& b){
  LAVector2<T> returnVal;
  returnVal.x = b.x - a;
  returnVal.y = b.y - a;

  return returnVal;
}

template <typename T> LAVector2<T> operator *(const LAVector2<T>& a){
  LAVector2<T> returnVal;
  returnVal.x = x * a.x;
  returnVal.y = y * a.y;

  return returnVal;
}

template <typename T> LAVector2<T> operator *(T a, const LAVector2<T>& b){
  LAVector2<T> returnVal;
  returnVal.x = b.x * a;
  returnVal.y = b.y * a;

  return returnVal;
}

template <typename T> LAVector2<T> operator /(const LAVector2<T>& a){
  LAVector2<T> returnVal;
  returnVal.x = x / a.x;
  returnVal.y = y / a.y;

  return returnVal;
}

template <typename T> LAVector2<T> operator /(T a, const LAVector2<T>& b){
  LAVector2<T> returnVal;
  returnVal.x = b.x / a;
  returnVal.y = b.y / a;

  return returnVal;
}

LAVectorD2 sin(const LAVectorD2& a) const{
  return LAVectorD2(sin(a.x), sin(a.y));
}

LAVectorD2 cos(const LAVectorD2& a) const{
  return LAVectorD2(cos(a.x), cos(a.y));
}

LAVectorD2 sqrt(const LAVectorD2& a) const{
  return LAVectorD2(sqrt(a.x), sqrt(a.y));
}

LAVectorD2 pow(const LAVectorD2& a, double exponent) const{
  return LAVectorD2(pow(a.x, exponent), pow(a.y, exponent));
}

LAVectorD2 exp(const LAVectorD2& a){
  LAVector2<T> returnVal;
  returnVal.x = exp(a.x);
  returnVal.y = exp(a.y);

  return returnVal;
}
