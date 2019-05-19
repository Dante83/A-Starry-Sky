#pragma once
#include "LAVector.h"
#include "stdint.h"

//
//Using LAVector methods in Doyub Kim's Fluid Engine Development as a guide.
//
template <typename T>
class LAVector<T, 3> final{
public:
  T x;
  T y;
  T z;
  T* valPtr;

  //Constructors
  LAVector();
  explicit LAVector(T x, T y, T z);
  LAVector(const std::initializer_list<T>& lst);
  LAVector(const LAVector& vector);

  //Operators
  T& operator [](size_t i);
  const T& operator [](size_t i) const;

  LAVector& operator =(const std::initializer_list<T>& lst);
  LAVector& operator =(const LAVector& v);

  LAVector& operator +=(T a);
  LAVector& operator +=(const LAVector&v);

  LAVector& operator -=(T a);
  LAVector& operator -=(const LAVector&v);

  LAVector& operator *=(T a);
  LAVector& operator *=(const LAVector&v);

  //Methods
  double dot(const LAVector<T,3>& a);
  void normalize();
};

template <typename T> using LAVector3 = LAVector<T, 3>;

template <typename T> LAVector3<T> operator +(const LAVector3<T>& a);
template <typename T> LAVector3<T> operator +(T a, const LAVector3<T>& b);
template <typename T> LAVector3<T> operator +(const LAVector3<T>& a, const LAVector3<T>& b);

template <typename T> LAVector3<T> operator -(const LAVector3<T>& a);
template <typename T> LAVector3<T> operator -(T a, const LAVector3<T>& b);
template <typename T> LAVector3<T> operator -(const LAVector3<T>& a, T b);
template <typename T> LAVector3<T> operator -(const LAVector3<T>& a, const LAVector3<T>& b);

template <typename T> LAVector3<T> operator *(const LAVector3<T>& a);
template <typename T> LAVector3<T> operator *(T a, const LAVector3<T>& b);
template <typename T> LAVector3<T> operator *(const LAVector3<T>& a, T b);
template <typename T> LAVector3<T> operator *(const LAVector3<T>& a, const LAVector3<T>& b);

template <typename T> LAVector3<T> operator /(const LAVector3<T>& a, T b);
template <typename T> LAVector3<T> operator /(T a, const LAVector3<T>& b);
template <typename T> LAVector3<T> operator /(const LAVector3<T>& a, const LAVector3<T>& b);

typedef LAVector3<double> LAVectorD3;
LAVectorD3 sin(const LAVectorD3& a);
LAVectorD3 cos(const LAVectorD3& a);
LAVectorD3 sqrt(const LAVectorD3& a);
LAVectorD3 pow(const LAVectorD3& a, double exponent);
LAVectorD3 exp(const LAVectorD3& a);
