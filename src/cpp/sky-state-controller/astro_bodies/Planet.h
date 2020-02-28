#pragma once
#include "planets/Venus.cpp"
#include "planets/Mars.cpp"
#include "planets/Jupiter.cpp"
#include "planets/Saturn.cpp"
#include "Sun.h"

class Planet : public AstronomicalBody{
private:
  Sun* sun;
public:
  Planet(Sun* sunRef);
};
