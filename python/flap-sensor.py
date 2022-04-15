#!/usr/bin/env python3
# Python script to get flap status from control module connected to Raspberry Pi.

import json, sys

try:
    from gpiozero import DigitalInputDevice

    pin = int(sys.argv[1])

    if pin is None or pin < 2 or pin > 27:
        raise Exception('Invalid PIN set.')

    input = DigitalInputDevice(pin)
    status = 'closed' if input.value == 1 else 'open'
    module = sys.argv[0].replace('.py', '')
    
    print(json.dumps({ 'module': module, 'status': status }))

except Exception as error:
    print(json.dumps({ 'error': str(error) }))

finally:
    sys.exit(1)
