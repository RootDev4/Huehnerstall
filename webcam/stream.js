const { StillCamera, StreamCamera, Codec } = require('pi-camera-connect')
const fs = require('fs')

const takeSnapshot = () => {
    const stillCamera = new StillCamera()

    stillCamera.takeImage().then(image => {
        fs.writeFileSync('still-image.jpg', image)
    })
}

const liveStream = async () => {
    const streamCamera = new StreamCamera({ codec: Codec.H264 })
    const videoStream = streamCamera.createStream()
    const writeStream = fs.createWriteStream('./snapshots/video-stream.h264')

    // Pipe the video stream to our video file
    videoStream.pipe(writeStream)

    await streamCamera.startCapture()

    // We can also listen to data events as they arrive
    videoStream.on('data', data => console.log('New data', data))
    videoStream.on('end', data => console.log('Video stream has ended'))

    // Wait for 1 minute
    await new Promise(resolve => setTimeout(() => resolve(), 60 * 1000))
    await streamCamera.stopCapture()
}

liveStream()