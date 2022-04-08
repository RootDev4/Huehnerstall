import RPi.GPIO as GPIO
import json, time, sys

# Python script to get coop door status from magnetic sensor connected to Raspberry Pi

try:

    pin = int(sys.argv[1]) # GPIO PIN
    timeout = int(sys.argv[2]) or 2 # Time in seconds to wait between each check (default: 2)

    if pin is None: raise Exception('Invalid PIN set.')

    GPIO.setmode(GPIO.BCM) # GPIO.BOARD
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    while True:
        if GPIO.input(pin):
            print(json.dumps({ 'status': 'open' }))
            time.sleep(timeout)
        if GPIO.input(pin) == False:
            print(json.dumps({ 'status': 'closed' }))
            time.sleep(timeout)

except Exception as error:
    print(json.dumps({ 'error': str(error) }))
    sys.exit(1)