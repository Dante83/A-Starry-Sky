#pragma once
#include <initializer_list>
#include <array>
#include "stdint.h"

//
//Using LAVector methods in Doyub Kim's Fluid Engine Development as a guide.
//
template <typename T, size_t N>
class LAVector final{
public:
  //Constructors and initializers
  LAVector();
  template <typename... Params> explicit LAVector(Params... params);
  explicit LAVector(std::initializer_list<T>& lst);
  LAVector(const LAVector& otherLAVector);
  void set(const std::initializer_list<T>& lst);
  void set(const LAVector& otherLAVector);
  LAVector& operator =(const std::initializer_list<T>& lst);
  LAVector& operator =(const LAVector& otherLAVector);
  const T& operator [](size_t i) const;
  T& operator [](size_t);
private:
  std::array<T, N> elements;

  //Private helper functions
};
