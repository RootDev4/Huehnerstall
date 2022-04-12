from gpiozero import DigitalOutputDevice

import time
import json
import sys

#  Python script to open/close the hatch over control module connected to Raspberry Pi.

try:

    pin = int(sys.argv[1])

    if pin is None or pin < 2 or pin > 27:
        raise Exception('Invalid PIN set.')
    
    relais = DigitalOutputDevice(pin)
    module = sys.argv[0].replace('.py', '')
    
    time.sleep(1)
    relais.on()
    time.sleep(2)
    relais.off()

    print(json.dumps({ 'module': module, 'ok': True }))

except Exception as error:
    print(json.dumps({ 'error': str(error) }))

finally:
    sys.exit(1)