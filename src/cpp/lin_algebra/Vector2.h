#include "Vector.h"

//
//Using Vector methods in Doyub Kim's Fluid Engine Development as a guide.
//
template <typename T>
class Vector<T, 2> final{
public:
  T x;
  T y;
  T* valPtr;

  //Operators
  Vector2<T> operator+(const Vector<T,2>& a, T b);
  Vector2<T> operator+(T a, const Vector<T,2>& a);

  Vector2<T> operator-(const Vector<T,2>& a, T b);
  Vector2<T> operator-(T a, const Vector<T,2>& a);

  Vector2<T> operator*(const Vector<T,2>& a, T b);
  Vector2<T> operator*(T a, const Vector<T,2>& a);

  Vector2<T> operator/(const Vector<T,2>& a, T b);
  Vector2<T> operator/(T a, const Vector<T,2>& a);
};

template <typename T> using Vector2 = Vector<T, 2>;

template <typename T> Vector2<T> operator+(const Vector2<T>& a);
template <typename T> Vector2<T> operator+(T a, const Vector2<T>& b);

template <typename T> Vector2<T> operator-(const Vector2<T>& a);
template <typename T> Vector2<T> operator-(T a, const Vector2<T>& b);

template <typename T> Vector2<T> operator*(const Vector2<T>& a);
template <typename T> Vector2<T> operator*(T a, const Vector2<T>& b);

template <typename T> Vector2<T> operator/(const Vector2<T>& a);
template <typename T> Vector2<T> operator/(T a, const Vector2<T>& b);

typedef Vector2<double> VectorD2;
typedef Vector2<int> VectorI2;
