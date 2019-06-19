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

  //Constructors
  LAVectorD3();
  explicit LAVectorD3(double x_in, double y_in, double z_in);
  LAVectorD3(const LAVectorD3& vector);

  //Operators
  const LAVectorD3& operator =(const LAVectorD3& v);

  const LAVectorD3& operator +=(double a);
  const LAVectorD3& operator +=(const LAVectorD3& v);

  const LAVectorD3& operator -=(double a);
  const LAVectorD3& operator -=(const LAVectorD3& v);

  const LAVectorD3& operator *=(double a);
  const LAVectorD3& operator *=(const LAVectorD3& v);

  //Methods
  double dot(const LAVectorD3& a);
  const LAVectorD3& normalize();
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
