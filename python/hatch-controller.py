from gpiozero import DigitalOutputDevice
import sys, time, json

#  Python script to open/close the hatch over control module connected to Raspberry Pi

try:

    pin = int(sys.argv[1])

    if pin is None or pin < 2 or pin > 27:
        raise Exception('Invalid PIN set.')
    
    relais = DigitalOutputDevice(pin)
    time.sleep(1)
    relais.on()
    time.sleep(2)
    relais.off()

    print(json.dumps({'ok': True}))

except Exception as error:
    print(json.dumps({'error': str(error)}))
    sys.exit(1)