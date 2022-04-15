#!/usr/bin/env python3
# Python script to get door status of the chicken coop.

import json, sys

try:
    from gpiozero import DigitalInputDevice

    pin = int(sys.argv[1])

    if pin is None or pin < 2 or pin > 27:
        raise Exception('Invalid PIN set.')

    input = DigitalInputDevice(pin)
    status = 'open' if input.value == 1 else 'closed'
    module = sys.argv[0].replace('.py', '')

    print(json.dumps({ 'module': module, 'status': status }))

except Exception as error:
    print(json.dumps({ 'error': str(error) }))

finally:
    sys.exit(1)
