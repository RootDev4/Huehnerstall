import RPi.GPIO as GPIO
import json
import time
import sys

# Python script to get hatch status from control module connected to Raspberry Pi

try:

    pin = int(sys.argv[1])

    if pin is None or pin < 2 or pin > 27:
        raise Exception('Invalid PIN set.')

    GPIO.setmode(GPIO.BCM) # GPIO.BOARD
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    status = 'open' if GPIO.input(pin) == True else 'closed'
    print(json.dumps({'status': status}))

except Exception as error:
    print(json.dumps({'error': str(error)}))
    sys.exit(1)
