#include "LAVector2.h"
#include <cmath>
using namespace std;

//
//Using LAVector methods in Doyub Kim's Fluid Engine Development as a guide.
//
//Constructors
LAVectorD2::LAVectorD2(){
  x = 0;
  y = 0;
  ptr = new double[2];
  ptr[0] = x;
  ptr[1] = y;
}

explicit LAVectorD2::LAVectorD2(double x_in, double y_in){
  x = x_in;
  y = y_in;
  ptr = new double[2];
  ptr[0] = x;
  ptr[1] = y;
}

LAVectorD2::LAVectorD2(const LAVectorD2& vector){
  x = vector.x;
  y = vector.y;
  ptr = new double[2];
  ptr[0] = x;
  ptr[1] = y;
}

//Instance Operators
double LAVectorD2::operator[](int i){
  return valPtr[i];
}

LAVectorD2& LAVectorD2::operator=(const LAVectorD2& v){
  x = v.x;
  y = v.y;
}

LAVectorD2& LAVectorD2::operator+=(double a){
  x += a;
  y += a;
}

LAVectorD2& LAVectorD2::operator+=(const LAVectorD2& v){
  x += v.x;
  y += v.y;
}

LAVectorD2& LAVectorD2::operator-=(double a){
  x -= a;
  y -= a;
}

LAVectorD2& LAVectorD2::operator-=(const LAVectorD2& v){
  x -= v.x;
  y -= v.y;
}

LAVectorD2& LAVectorD2::operator*=(double a){
  x *= a;
  y *= a;
}

LAVectorD2& LAVectorD2::operator*=(const LAVectorD2& v){
  x *= v.x;
  y *= v.y;
}

void LAVectorD2::normalize(){
  double normalizationConstant = 1.0 / sqrt(x * x + y * y);
  x *= normalizationConstant;
  y *= normalizationConstant;
}

double LAVectorD2::dot(const LAVectorD2& v){
  return v.x * x + v.y * y;
}

//Global Operators
LAVectorD2 operator +(const LAVectorD2& a, double b){
  LAVectorD2 returnVal;
  returnVal.x = a.x + b;
  returnVal.y = a.y + b;

  return returnVal;
}

LAVectorD2 operator +(double a, const LAVectorD2& b){
  LAVectorD2 returnVal;
  returnVal.x = b.x + a;
  returnVal.y = b.y + a;

  return returnVal;
}

LAVectorD2 operator +(const LAVectorD2& a, const LAVectorD2& b){
  LAVectorD2 returnVal;
  returnVal.x = a.x + b.x;
  returnVal.y = a.y + b.y;

  return returnVal;
}

LAVectorD2 operator -(const LAVectorD2& a, double b){
  LAVectorD2 returnVal;
  returnVal.x = a.x - b;
  returnVal.y = a.y - b;

  return returnVal;
}

LAVectorD2 operator -(double a, const LAVectorD2& b){
  LAVectorD2 returnVal;
  returnVal.x = b.x - a;
  returnVal.y = b.y - a;

  return returnVal;
}

LAVectorD2 operator -(const LAVectorD2& a, const LAVectorD2& b){
  LAVectorD2 returnVal;
  returnVal.x = a.x - b.x;
  returnVal.y = a.y - b.y;

  return returnVal;
}

LAVectorD2 operator *(const LAVectorD2& a, double b){
  LAVectorD2 returnVal;
  returnVal.x = a.x * b;
  returnVal.y = a.y * b;

  return returnVal;
}

LAVectorD2 operator *(double a, const LAVectorD2& b){
  LAVectorD2 returnVal;
  returnVal.x = b.x * a;
  returnVal.y = b.y * a;

  return returnVal;
}

LAVectorD2 operator *(const LAVectorD2& a, const LAVectorD2& b){
  LAVectorD2 returnVal;
  returnVal.x = a.x * b.x;
  returnVal.y = a.y * b.y;

  return returnVal;
}

LAVectorD2 operator /(const LAVectorD2& a, double b){
  LAVectorD2 returnVal;
  returnVal.x = a.x / b;
  returnVal.y = a.y / b;

  return returnVal;
}

LAVectorD2 operator /(double a, const LAVectorD2& b){
  LAVectorD2 returnVal;
  returnVal.x = b.x / a;
  returnVal.y = b.y / a;

  return returnVal;
}

LAVectorD2 operator /(const LAVectorD2& a, const LAVectorD2& b){
  LAVectorD2 returnVal;
  returnVal.x = a.x / b.x;
  returnVal.y = a.y / b.y;

  return returnVal;
}

LAVectorD2 sin(const LAVectorD2& a){
  return LAVectorD2(sin(a.x), sin(a.y));
}

LAVectorD2 cos(const LAVectorD2& a){
  return LAVectorD2(cos(a.x), cos(a.y));
}

LAVectorD2 sqrt(const LAVectorD2& a){
  return LAVectorD2(sqrt(a.x), sqrt(a.y));
}

LAVectorD2 pow(const LAVectorD2& a, double exponent){
  return LAVectorD2(pow(a.x, exponent), pow(a.y, exponent));
}

LAVectorD2 exp(const LAVectorD2& a){
  return LAVectorD2(exp(a.x), exp(a.y));
}
