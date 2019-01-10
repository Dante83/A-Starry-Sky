#include <vector>

class AstronomicalBody{
protected:
  vector<float> latAndLong;
  vector<float> azAndAlt;
public:
  void AstromicalBody::AstronomicalBody(vector latAndLong, vector azAndAltitude);
  void AstronomicalBody::update();
}
