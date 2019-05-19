#pragma once

//
//Based on the work in Doyub Kim's Fluid Dynamics:
//though I only needed double vectors so I skipped building
//the templates.
//

class LAVectorD3{
public:
  double x;
  double y;
  double z;
  double* valPtr;

  //Constructors
  LAVectorD3();
  explicit LAVectorD3(double x, double y, double z);
  LAVectorD3(const LAVectorD3& vector);

  //Operators
  double operator [](int i);
  LAVectorD3& operator =(const LAVectorD3& v);

  LAVectorD3& operator +=(double a);
  LAVectorD3& operator +=(const LAVectorD3& v);

  LAVectorD3& operator -=(double a);
  LAVectorD3& operator -=(const LAVectorD3& v);

  LAVectorD3& operator *=(double a);
  LAVectorD3& operator *=(const LAVectorD3& v);

  //Methods
  double dot(const LAVectorD3& a);
  void normalize();
};

LAVectorD3 operator +(const LAVectorD3& a, double b);
LAVectorD3 operator +(double a, const LAVectorD3& b);
LAVectorD3 operator +(const LAVectorD3& a, const LAVectorD3& b);

LAVectorD3 operator -(const LAVectorD3& a, double b);
LAVectorD3 operator -(double a, const LAVectorD3& b);
LAVectorD3 operator -(const LAVectorD3& a, const LAVectorD3& b);

LAVectorD3 operator *(const LAVectorD3& a, double b);
LAVectorD3 operator *(double a, const LAVectorD3& b);
LAVectorD3 operator *(const LAVectorD3& a, const LAVectorD3& b);

LAVectorD3 operator /(const LAVectorD3& a, double b);
LAVectorD3 operator /(double a, const LAVectorD3& b);
LAVectorD3 operator /(const LAVectorD3& a, const LAVectorD3& b);

LAVectorD3 sin(const LAVectorD3& a);
LAVectorD3 cos(const LAVectorD3& a);
LAVectorD3 sqrt(const LAVectorD3& a);
LAVectorD3 pow(const LAVectorD3& a, double exponent);
LAVectorD3 exp(const LAVectorD3& a);
