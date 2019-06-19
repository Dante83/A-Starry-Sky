#pragma once

//
//Based on the work in Doyub Kim's Fluid Dynamics:
//though I only needed double vectors so I skipped building
//the templates.
//

class LAVectorD2{
public:
  double x;
  double y;

  //Constructors
  LAVectorD2();
  explicit LAVectorD2(double x_in, double y_in);
  LAVectorD2(const LAVectorD2& vector);

  //Operators
  const LAVectorD2&  operator =(const LAVectorD2& v);

  const LAVectorD2&  operator +=(double a);
  const LAVectorD2&  operator +=(const LAVectorD2& v);

  const LAVectorD2&  operator -=(double a);
  const LAVectorD2&  operator -=(const LAVectorD2& v);

  const LAVectorD2&  operator *=(double a);
  const LAVectorD2&  operator *=(const LAVectorD2& v);

  //Methods
  double dot(const LAVectorD2& v);
  const LAVectorD2&  normalize();
};

LAVectorD2 operator +(const LAVectorD2& a, double b);
LAVectorD2 operator +(double a, const LAVectorD2& b);
LAVectorD2 operator +(const LAVectorD2& a, const LAVectorD2& b);

LAVectorD2 operator -(const LAVectorD2& a, double b);
LAVectorD2 operator -(double a, const LAVectorD2& b);
LAVectorD2 operator -(const LAVectorD2& a, const LAVectorD2& b);

LAVectorD2 operator *(const LAVectorD2& a, double b);
LAVectorD2 operator *(double a, const LAVectorD2& b);
LAVectorD2 operator *(const LAVectorD2& a, const LAVectorD2& b);

LAVectorD2 operator /(const LAVectorD2& a, double b);
LAVectorD2 operator /(double a, const LAVectorD2& b);
LAVectorD2 operator /(const LAVectorD2& a, const LAVectorD2& b);

LAVectorD2 sin(const LAVectorD2& a);
LAVectorD2 cos(const LAVectorD2& a);
LAVectorD2 sqrt(const LAVectorD2& a);
LAVectorD2 pow(const LAVectorD2& a, double exponent);
LAVectorD2 exp(const LAVectorD2& a);
