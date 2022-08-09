#!/usr/bin/env python3
#  Python script to open/close the flap over control module connected to Raspberry Pi.

import time, json, sys

try:
    from gpiozero import DigitalOutputDevice

    pin = int(sys.argv[1])

    if pin is None or pin < 2 or pin > 27:
        raise Exception('Invalid PIN set.')
    
    relais = DigitalOutputDevice(pin)
        
    time.sleep(1)
    relais.on()
    time.sleep(2)
    relais.off()

    print(json.dumps({ 'ok': True }))

except Exception as error:
    print(json.dumps({ 'error': str(error) }))

finally:
    sys.exit(1)
