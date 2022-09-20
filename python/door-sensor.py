#!/usr/bin/env python3
# Python script to get door status of the chicken coop.

import warnings
warnings.filterwarnings('ignore')

import json, sys

try:
    from gpiozero import DigitalInputDevice

    pin = int(sys.argv[1])

    if pin is None or pin < 2 or pin > 27:
        raise Exception('Invalid PIN set.')

    input = DigitalInputDevice(pin)
    status = 'open' if input.value == 1 else 'closed'

    print(json.dumps({'status': status}))

except ImportError as error:
    print(json.dumps({'error': str('Cannot import gpiozero module')}))

except Exception as error:
    print(json.dumps({'error': error}))

finally:
    sys.exit(1)
