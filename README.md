# :chicken: Hühnerstall PWA

Progressive Web App (PWA) zur Verwaltung und Steuerung meines automatisierten Hühnerstalls.

:pushpin: See englisch version of this README [here](./README-en.md). (WiP/To-Do)

Die App läuft auf einem Raspberry Pi 3 als NodeJS-Applikation. GPIO-Schnittstellen werden über Python3-Scripte gesteuert, da die verfügbaren NodeJS-Pakete (npm) diesbezüglich weniger flexibel und zuverlässig sind.

## Features
- Automatisierte Steuerung der Hühnerklappe (Zeitschaltung, Lichtsensor, Nothalt, Verriegelung) -> JOSTechnik
- Steuerung der Hühnerstall-IT über eine App (lokales Netzwerk oder aus der Ferne via VPN)
- Öffnen/Schließen der Hühnerklappe / Erkennen des Klappenstatus (offen/geschlossen)
- Messen von Temperatur und Luftfeuchtigkeit im Stall
- Erkennen des Status der Stalltüre (offen/geschlossen)
- Live Stream per Kamera-Modul

## Technik
- [Hühner-/Entenklappe HK2.0-RE von JOSTechnik](https://jost-technik.de/HK20-RE-Rahmengeraet-mit-selbstverriegelnder-Entenklappe-inkl-Steuerung-fuer-Anlocklicht-und-Beleuchtung--500_110.html)
- Raspberry Pi 3 Model B V1.2
- [Raspberry Pi 5MP Kamera-Modul](https://www.berrybase.de/raspberry-pi/raspberry-pi-computer/kameras/5mp-kamera-f-252-r-raspberry-pi)
- [Optokoppler Isolation Modul, PC817 EL817 12V 80 KHz 1-Kanal](https://www.amazon.de/Optokoppler-Isolation-Modul-1-Kanal-Platine-DIN-Schienenhalterung-SPS-Prozessoren/dp/B07YHQBCZ7/)
- [5V 2-Kanal Relais Modul](https://www.berrybase.de/sensoren-module/relaiskarten/5v-2-kanal-relais-modul)
- [Luftfeuchtigkeits- und Temperatursensor](https://www.berrybase.de/sensoren-module/feuchtigkeit/am2302/dht22-digitaler-temperatur-und-luftfeuchtesensor-mit-kabelanschluss)
- [Magnetschalter/-kontakt](https://www.berrybase.de/bauelemente/schalter-taster/magnetschalter/universaler-t-252-r-und-fensterkontakt)
- Jumperkabel und diverse Widerstände (1k bis 10k Ohm)

## Schaltung
Die Sensoren bzw. Steuerleitungen zum JOST Steuermodul werden über GPIO-Schnittstellen kontrolliert. Über das Relais lässt sich die Hühnerklappe in der App öffnen und schließen.

<img src="https://user-images.githubusercontent.com/61932664/164439927-c29ef9ee-406c-4363-8c64-9a849b151e25.jpeg" style="width: 250px;">

## Anbindung
JosTechnik bietet unterschiedliche Zusatzmodule an, welche an die Steuereinheit angeschlossen werden können. Diese habe ich softwareseitig mit Pythonscripts ersetzt.

### Externer Taster
Ein externer, kabelgebundener Taster kann angeschlossen werden, um die Hühnerklappe auch aus der Ferne öffnen und schließen zu können. Das hierzu äquivalente Pythonscript sieht folgendermaßen aus:

```python
#!/usr/bin/env python3
#  Python script to open/close the flap over control module connected to Raspberry Pi.

import time, json, sys

try:
    from gpiozero import DigitalOutputDevice

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
```

Über den jeweiligen GPIO-Pin bekommt das Steuermodul das Signal, die Klappe zu öffnen oder zu schließen.

### Klappenstatus
Eine externe, kabelgebundene Fernanzeige kann angeschlossen werden, um den Status der Klappe über eine rote LED (offen) oder grüne LED (geschlossen) anzuzeigen. Das hierzu äquivalente Pythonscript sieht folgendermaßen aus:

```python
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
```

Das Signal wird nur an einem LED-Ausgang abgegriffen. Je nachdem, ob dort Strom anliegt oder nicht, ist die Klappe geöffnet bzw. geschlossen.

## Eindrücke
<div style="display: flex; justify-content: center;">
  <img src="https://user-images.githubusercontent.com/61932664/164431430-872fcac7-e16d-422f-acfd-e137f751add1.jpg" style="width: 250px; margin-right: 10px;">
  <img src="https://user-images.githubusercontent.com/61932664/164431721-b1c80b20-2692-494c-af1a-f5719abe44c2.jpg" style="width: 250px; margin-right: 10px;">
  <img src="https://user-images.githubusercontent.com/61932664/164431731-5ba0ccc4-252f-4563-b2c7-e2e1278545ee.jpg" style="width: 250px;">
</div>

## Nachtsicht
Eine neue [Kamera](https://www.amazon.de/dp/B08C5GDG9Q) ermöglicht nun auch mittels Infrarot die Überwachung des Hühnerstalls bei Nacht.

![stream mjpg](https://user-images.githubusercontent.com/61932664/170657367-4832d39e-346e-4ef8-ac75-b8ac833c3ba0.jpeg)

## PWA Screenshot
<img src="https://user-images.githubusercontent.com/61932664/164433614-9bc2031c-7819-4a96-af65-c3dee4ce58f0.JPG" style="width: 250px;">

## To-Do
- [x] Hardware (Technik)
- [x] Software (App)
- [ ] Fehlererkennung und Verzögerungstoleranzen
- [ ] manuellen Betrieb steuern und Automatik anpassen
- [ ] Webcam-Stream via raspivid (derzeit: Python3 picamera)
