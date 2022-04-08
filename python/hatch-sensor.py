import json, sys

# Python script to get hatch status from control module connected to Raspberry Pi

try:

    print(0)

except Exception as error:
    print(json.dumps({ 'error': str(error) }))
    sys.exit(1)