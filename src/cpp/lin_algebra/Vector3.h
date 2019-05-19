#include "Vector.h"

//
//Using Vector methods in Doyub Kim's Fluid Engine Development as a guide.
//
template <typename T>
class Vector<T, 3> final{
public:
  T x;
  T y;
  T z;
  T* valPtr;

  //Constructors
  Vector();
  explicit Vector(T x, T y, Y z);
  Vector(const std::initialize_list<T>& lst);
  Vector(const Vector& vector);

  //Operators
  Vector&operator[](std::size_t i);
  Vector& operator=(const std::initlializer_list<T>& list);
  Vector& operator+=(T a);
  Vector& operator+=(const Vector& v);
  Vector& operator-=(T a);
  Vector& operator-=(const Vector& v);
  Vector& operator*=(T a);
  Vector& operator*=(const Vector& v);
  Vector3<T> operator=(const Vector<T,3>& a);

  Vector3<T> operator+(const Vector<T,3>& a, T b);
  Vector3<T> operator+(T a, const Vector<T,3>& a);

  Vector3<T> operator-(const Vector<T,3>& a, T b);
  Vector3<T> operator-(T a, const Vector<T,3>& a);

  Vector3<T> operator*(const Vector<T,3>& a, T b);
  Vector3<T> operator*(T a, const Vector<T,3>& a);

  Vector3<T> operator/(const Vector<T,3>& a, T b);
  Vector3<T> operator/(T a, const Vector<T,3>& a);

  //Methods
  double dot(const Vector<T,3>& a);
  void normalize();
};

template <typename T> using Vector3 = Vector<T, 3>;

template <typename T> Vector3<T> operator +(const Vector3<T>& a);
template <typename T> Vector3<T> operator +(T a, const Vector3<T>& b);

template <typename T> Vector3<T> operator -(const Vector3<T>& a);
template <typename T> Vector3<T> operator -(T a, const Vector3<T>& b);

template <typename T> Vector3<T> operator *(const Vector3<T>& a);
template <typename T> Vector3<T> operator *(T a, const Vector3<T>& b);

template <typename T> Vector3<T> operator /(const Vector3<T>& a);
template <typename T> Vector3<T> operator /(T a, const Vector2<T>& b);

typedef Vector3<double> VectorD3;
VectorD3 sin(const VectorD3& a);
VectorD3 cos(const VectorD3& a);
VectorD3 sqrt(const VectorD3& a);
VectorD3 pow(const VectorD3& a, double exponent);
VectorD3 exp(const VectorD3& a);
typedef Vector3<int> VectorI3;
