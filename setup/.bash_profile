if [ -z $DISPLAY ] && [ $(tty) = /dev/tty1 ]
then
    #setup virtual can @TODO setup real can here too
    sudo sh ~/UArizona-FSAE-Dashboard/setup/initalize_can.sh
    # fork the LED Process
    sudo node ~/UArizona-FSAE-Dashboard/leds/controlLeds.js &
    # Start the dashboard
    startx -- -nocursor
fi