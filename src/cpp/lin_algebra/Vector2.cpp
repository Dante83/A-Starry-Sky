#include "Vector2.h"
#include <cmath>

//
//Using Vector methods in Doyub Kim's Fluid Engine Development as a guide.
//
//Constructors
Vector(){
  x = 0;
  y = 0;
  ptr = new T[2];
  ptr[0] = x;
  ptr[1] = y;
}

explicit Vector(T x_in, T y_in, T z_in){
  x = x_in;
  y = y_in;
  ptr = new T[2];
  ptr[0] = x;
  ptr[1] = y;
}

Vector(const std::initialize_list<T>& lst){
  x = (*lst[0]);
  y = (*lst[1]);
  ptr = new T[2];
  ptr[0] = x;
  ptr[1] = y;
}

Vector(const Vector& vector){
  x = (*vector.x);
  y = (*vector.y);
  ptr = new T[2];
  ptr[0] = x;
  ptr[1] = y;
}

//Instance Operators
template <typename T> VectorD2::operator[](std::size_t i){
  return valPtr[i];
}

Vector& VectorD2::operator=(const std::initlializer_list<T>& l){
  x = &l[0];
  y = &l[1];
}

Vector& VectorD2::operator+=(T a){
  x += a;
  y += a;
}

Vector& VectorD2::operator+=(const Vector& a){
  x += a.x;
  y += a.y;
}

Vector& VectorD2::operator-=(T a){
  x -= a;
  y -= a;
}

Vector& VectorD2::operator-=(const Vector& a){
  x -= a.x;
  y -= a.y;
}

Vector& VectorD2::operator*=(T a){
  x *= a;
  y *= a;
}

Vector& VectorD2::operator*=(const Vector& a){
  x *= a.x;
  y *= a.y;
}

Vector2<T> VectorD2::operator=(const Vector<T,2>& a){
  x = a.x;
  y = a.y;
}

Vector2<T> VectorD2::operator+(T a){
  Vector2<T> returnVal;
  returnVal.x = x + a;
  returnVal.y = y + a;

  return returnVal;
}

Vector2<T> VectorD2::operator+(const Vector<T,2>& a){
  Vector2<T> returnVal;
  returnVal.x = x + a.x;
  returnVal.y = y + a.y;

  return returnVal;
}

Vector2<T> VectorD2::operator-(T a){
  Vector2<T> returnVal;
  returnVal.x = x - a;
  returnVal.y = y - a;

  return returnVal;
}

Vector2<T> VectorD2::operator-(const Vector<T,2>& a){
  Vector2<T> returnVal;
  returnVal.x = x - a.x;
  returnVal.y = y - a.y;

  return returnVal;
}

Vector2<T> VectorD2::operator*(T a){
  Vector2<T> returnVal;
  returnVal.x = x * a;
  returnVal.y = y * a;

  return returnVal;
}

Vector2<T> VectorD2::operator*(const Vector<T,2>& b){
  Vector2<T> returnVal;
  returnVal.x = x * a.x;
  returnVal.y = y * a.y;

  return returnVal;
}

Vector2<T> VectorD2::operator/(T a){
  Vector2<T> returnVal;
  returnVal.x = x / a;
  returnVal.y = y / a;

  return returnVal;
}

Vector2<T> VectorD2::operator/(const Vector<T,2>& a){
  Vector2<T> returnVal;
  returnVal.x = x / a.x;
  returnVal.y = y / a.y;

  return returnVal;
}

void VectorD2::normalize(){
  double normalizationConstant; = 1.0 / sqrt(x * x + y * y);
  x *= normalizationConstant;
  y *= normalizationConstant;
}

VectorD2 VectorD2::normalize() const{
  double normalizationConstant; = 1.0 / sqrt(x * x + y * y);
  return VectorD2(x * normalizationConstant, y * normalizationConstant);
}

double VectorD2::dot(const Vector<T,2>& a){
  return a.x * x + a.y * y;
}

//Global Operators
template <typename T> Vector2<T> operator +(const Vector2<T>& a){
  Vector2<T> returnVal;
  returnVal.x = x + a.x;
  returnVal.y = y + a.y;

  return returnVal;
}

template <typename T> Vector2<T> operator +(T a, const Vector2<T>& b){
  Vector2<T> returnVal;
  returnVal.x = b.x + a;
  returnVal.y = b.y + a;

  return returnVal;
}

template <typename T> Vector2<T> operator -(const Vector2<T>& a){
  Vector2<T> returnVal;
  returnVal.x = x - a.x;
  returnVal.y = y - a.y;

  return returnVal;
}

template <typename T> Vector2<T> operator -(T a, const Vector2<T>& b){
  Vector2<T> returnVal;
  returnVal.x = b.x - a;
  returnVal.y = b.y - a;

  return returnVal;
}

template <typename T> Vector2<T> operator *(const Vector2<T>& a){
  Vector2<T> returnVal;
  returnVal.x = x * a.x;
  returnVal.y = y * a.y;

  return returnVal;
}

template <typename T> Vector2<T> operator *(T a, const Vector2<T>& b){
  Vector2<T> returnVal;
  returnVal.x = b.x * a;
  returnVal.y = b.y * a;

  return returnVal;
}

template <typename T> Vector2<T> operator /(const Vector2<T>& a){
  Vector2<T> returnVal;
  returnVal.x = x / a.x;
  returnVal.y = y / a.y;

  return returnVal;
}

template <typename T> Vector2<T> operator /(T a, const Vector2<T>& b){
  Vector2<T> returnVal;
  returnVal.x = b.x / a;
  returnVal.y = b.y / a;

  return returnVal;
}

VectorD2 sin(const VectorD2& a) const{
  return VectorD2(sin(a.x), sin(a.y));
}

VectorD2 cos(const VectorD2& a) const{
  return VectorD2(cos(a.x), cos(a.y));
}

VectorD2 sqrt(const VectorD2& a) const{
  return VectorD2(sqrt(a.x), sqrt(a.y));
}

VectorD2 pow(const VectorD2& a, double exponent) const{
  return VectorD2(pow(a.x, exponent), pow(a.y, exponent));
}

VectorD2 exp(const VectorD2& a){
  Vector2<T> returnVal;
  returnVal.x = exp(a.x);
  returnVal.y = exp(a.y);

  return returnVal;
}
