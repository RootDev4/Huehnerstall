import json, sys

# Python script to control the hatch over control module connected to Raspberry Pi

try:

    print(0)

except Exception as error:
    print(json.dumps({ 'error': str(error) }))
    sys.exit(1)