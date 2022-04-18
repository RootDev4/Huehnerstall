#!/bin/bash

raspivid -o - -t 0 -n -w 800 -h 600 -fps 25 -g 100 | cvlc -vvv stream:///dev/stdin --sout '#rtp{sdp=rtsp://:8554/,mux=ts}' :demux=h264