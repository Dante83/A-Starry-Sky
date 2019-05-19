#pragma once

//
//Using Vector methods in Doyub Kim's Fluid Engine Development as a guide.
//
template <typename T, std::size_t N>
class Vector final{
public:
  //Constructors and initializers
  Vector();
  template <typename... Params> explicit Vector(const std::initializer_list<T>& lst);
  Vector(const Vector& otherVector);
  void set(const std::initializer_list<T>& lst);
  void set(const Vector& otherVector);
  const T& operator[](std::size_t i);
  const T& operator[](std::size_t);
private:
  std::vector<T, N> elements;

  //Private helper functions
};
