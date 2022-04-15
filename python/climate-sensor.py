#!/usr/bin/env python3
# Python script to get temperature and humidity from sensor connected to Raspberry Pi

import json, sys

try:
    import Adafruit_DHT

    sensor = Adafruit_DHT.DHT22
    pin = int(sys.argv[1])

    if pin is None or pin < 2 or pin > 27:
        raise Exception('Invalid PIN set.')

    humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)

    if humidity is not None and temperature is not None:
        data = { 'temperature': '{0:0.1f}'.format(temperature), 'humidity': '{0:0.1f}'.format(humidity) }
        print(json.dumps(data))
    else:
        raise Exception('Failed to read climate data.')

except Exception as error:
    print(json.dumps({ 'error': str(error) }))

finally:
    sys.exit(1)
