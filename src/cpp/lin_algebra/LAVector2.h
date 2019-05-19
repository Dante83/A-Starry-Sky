#pragma once
#include "LAVector.h"
#include "stdint.h"

//
//Using LAVector methods in Doyub Kim's Fluid Engine Development as a guide.
//
template <typename T>
class LAVector<T, 2> final{
public:
  T x;
  T y;
  T* valPtr;

  //Constructors
  LAVector();
  explicit LAVector(T x, T y);
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
  double dot(const LAVector<T,2>& a);
  void normalize();
};

template <typename T> using LAVector2 = LAVector<T, 2>;

template <typename T> LAVector2<T> operator +(const LAVector2<T>& a);
template <typename T> LAVector2<T> operator +(T a, const LAVector2<T>& b);
template <typename T> LAVector2<T> operator +(const LAVector2<T>& a, const LAVector2<T>& b);

template <typename T> LAVector2<T> operator -(const LAVector2<T>& a);
template <typename T> LAVector2<T> operator -(T a, const LAVector2<T>& b);
template <typename T> LAVector2<T> operator -(const LAVector2<T>& a, T b);
template <typename T> LAVector2<T> operator -(const LAVector2<T>& a, const LAVector2<T>& b);

template <typename T> LAVector2<T> operator *(const LAVector2<T>& a);
template <typename T> LAVector2<T> operator *(T a, const LAVector2<T>& b);
template <typename T> LAVector2<T> operator *(const LAVector2<T>& a, T b);
template <typename T> LAVector2<T> operator *(const LAVector2<T>& a, const LAVector2<T>& b);

template <typename T> LAVector2<T> operator /(const LAVector2<T>& a, T b);
template <typename T> LAVector2<T> operator /(T a, const LAVector2<T>& b);
template <typename T> LAVector2<T> operator /(const LAVector2<T>& a, const LAVector2<T>& b);

typedef LAVector2<double> LAVectorD2;
LAVectorD2 sin(const LAVectorD2& a);
LAVectorD2 cos(const LAVectorD2& a);
LAVectorD2 sqrt(const LAVectorD2& a);
LAVectorD2 pow(const LAVectorD2& a, double exponent);
LAVectorD2 exp(const LAVectorD2& a);
